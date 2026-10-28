import { siteConfig } from "@/config/site";
import { createPersistedStore } from "@/lib/persisted-store";
import { selectionsKey } from "@/lib/pricing";
import type { CartItem, SelectionMap } from "@/lib/types";

/**
 * Client-side demo cart, persisted to localStorage.
 * Only ids, quantities and selections are stored. Prices are recomputed from the catalogue on every
 * read (see lib/pricing.ts), so totals are always consistent and stale prices can never leak in.
 */

export interface CartState {
  version: 1;
  items: CartItem[];
}

const EMPTY_CART: CartState = { version: 1, items: [] };

function isSelectionMap(value: unknown): value is SelectionMap {
  if (!value || typeof value !== "object") return false;
  return Object.values(value).every(
    (entry) => Array.isArray(entry) && entry.every((id) => typeof id === "string"),
  );
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.lineId === "string" &&
    (item.kind === "product" || item.kind === "deal") &&
    typeof item.refId === "string" &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity >= 1 &&
    item.quantity <= siteConfig.ordering.maxLineQuantity &&
    isSelectionMap(item.selections) &&
    (item.note === undefined || typeof item.note === "string")
  );
}

export const cartStore = createPersistedStore<CartState>({
  key: "foodchain.cart.v1",
  initial: EMPTY_CART,
  parse(raw) {
    if (!raw || typeof raw !== "object") return null;
    const data = raw as { version?: unknown; items?: unknown };
    if (data.version !== 1 || !Array.isArray(data.items)) return null;
    return { version: 1, items: data.items.filter(isCartItem) };
  },
});

export type NewCartItem = Omit<CartItem, "lineId">;

function createLineId(): string {
  // crypto.randomUUID needs a secure context; fall back for http://<lan-ip> testing on a phone.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `line-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const clampQuantity = (quantity: number) =>
  Math.max(1, Math.min(siteConfig.ordering.maxLineQuantity, Math.round(quantity)));

const sameConfiguration = (a: Pick<CartItem, "kind" | "refId" | "selections" | "note">, b: typeof a) =>
  a.kind === b.kind && a.refId === b.refId && selectionsKey(a.selections, a.note) === selectionsKey(b.selections, b.note);

/** Adds an item, merging with an existing identical line. */
export function addCartItem(input: NewCartItem): void {
  cartStore.set((state) => {
    const existing = state.items.find((item) => sameConfiguration(item, input));
    if (existing) {
      return {
        ...state,
        items: state.items.map((item) =>
          item.lineId === existing.lineId
            ? { ...item, quantity: clampQuantity(item.quantity + input.quantity) }
            : item,
        ),
      };
    }
    return {
      ...state,
      items: [...state.items, { ...input, quantity: clampQuantity(input.quantity), lineId: createLineId() }],
    };
  });
}

export function setCartItemQuantity(lineId: string, quantity: number): void {
  cartStore.set((state) => ({
    ...state,
    items: state.items.map((item) => (item.lineId === lineId ? { ...item, quantity: clampQuantity(quantity) } : item)),
  }));
}

/** Replaces a line's configuration (used when editing customizations). Merges if it now matches another line. */
export function replaceCartItem(lineId: string, next: NewCartItem): void {
  cartStore.set((state) => {
    const duplicate = state.items.find((item) => item.lineId !== lineId && sameConfiguration(item, next));
    if (duplicate) {
      return {
        ...state,
        items: state.items
          .filter((item) => item.lineId !== lineId)
          .map((item) =>
            item.lineId === duplicate.lineId
              ? { ...item, quantity: clampQuantity(item.quantity + next.quantity) }
              : item,
          ),
      };
    }
    return {
      ...state,
      items: state.items.map((item) =>
        item.lineId === lineId ? { ...next, quantity: clampQuantity(next.quantity), lineId } : item,
      ),
    };
  });
}

/** Removes a line and returns what is needed to undo it. */
export function removeCartItem(lineId: string): { item: CartItem; index: number } | null {
  const state = cartStore.getSnapshot();
  const index = state.items.findIndex((item) => item.lineId === lineId);
  if (index === -1) return null;
  const item = state.items[index];
  cartStore.set({ ...state, items: state.items.filter((candidate) => candidate.lineId !== lineId) });
  return { item, index };
}

export function restoreCartItem(item: CartItem, index: number): void {
  cartStore.set((state) => {
    if (state.items.some((candidate) => candidate.lineId === item.lineId)) return state;
    const items = [...state.items];
    items.splice(Math.min(index, items.length), 0, item);
    return { ...state, items };
  });
}

export function clearCart(): void {
  cartStore.set(EMPTY_CART);
}
