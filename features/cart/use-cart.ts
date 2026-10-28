"use client";

import { useMemo, useSyncExternalStore } from "react";
import { siteConfig } from "@/config/site";
import { useCatalogue } from "@/features/catalogue/catalogue-context";
import { useOrderPreferences } from "@/features/order/use-order";
import { calculateTotals, priceCart } from "@/lib/pricing";
import type { CartItem, CartTotals, PricedLine } from "@/lib/types";
import { cartStore } from "./cart-store";

const NO_ITEMS: CartItem[] = [];

export interface CartView {
  items: CartItem[];
  lines: PricedLine[];
  totals: CartTotals;
  count: number;
  isEmpty: boolean;
}

/** The priced cart. Every surface (header, drawer, cart page, checkout) reads totals from here. */
export function useCart(): CartView {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    () => cartStore.getSnapshot().items,
    () => NO_ITEMS,
  );
  const catalogue = useCatalogue();
  const { fulfillment } = useOrderPreferences();

  return useMemo(() => {
    const lines = priceCart(items, catalogue);
    const totals = calculateTotals({
      lines,
      fulfillment,
      deliveryFee: siteConfig.ordering.deliveryFee,
      discount: siteConfig.ordering.discount,
    });
    return { items, lines, totals, count: totals.itemCount, isEmpty: lines.length === 0 };
  }, [items, catalogue, fulfillment]);
}
