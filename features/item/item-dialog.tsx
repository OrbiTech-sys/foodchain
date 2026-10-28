"use client";

import { CircleAlert } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton } from "@/components/ui/dialog";
import { FoodImage } from "@/components/ui/food-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useToast } from "@/components/ui/toast";
import { addCartItem, replaceCartItem, type NewCartItem } from "@/features/cart/cart-store";
import { cn } from "@/lib/cn";
import { formatPKR, formatPlainNumber, formatSignedPKR } from "@/lib/format";
import {
  calculateUnitPrice,
  getOptionPrice,
  getOptionPriceRange,
  getSelectedSizeId,
  getStartingPrice,
  sanitizeSelections,
  validateSelections,
} from "@/lib/pricing";
import type { CartItem, Customization, CustomizationOption, Purchasable, SelectionMap } from "@/lib/types";

interface OpenOptions {
  /** Edit an existing cart line instead of adding a new one. */
  edit?: CartItem;
}

interface ItemDialogApi {
  openItem: (target: Purchasable, options?: OpenOptions) => void;
}

const ItemDialogContext = createContext<ItemDialogApi | null>(null);

export function useItemDialog(): ItemDialogApi {
  const value = useContext(ItemDialogContext);
  if (!value) throw new Error("useItemDialog must be used inside <ItemDialogProvider>.");
  return value;
}

interface DialogState {
  target: Purchasable | null;
  edit: CartItem | null;
  open: boolean;
  /** Changes on every open so the form state resets. */
  nonce: number;
}

/** One product / deal details dialog for the whole app. Used to add items and to edit cart lines. */
export function ItemDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>({ target: null, edit: null, open: false, nonce: 0 });

  const openItem = useCallback((target: Purchasable, options?: OpenOptions) => {
    setState((previous) => ({ target, edit: options?.edit ?? null, open: true, nonce: previous.nonce + 1 }));
  }, []);
  const close = useCallback(() => setState((previous) => ({ ...previous, open: false })), []);
  const api = useMemo(() => ({ openItem }), [openItem]);

  return (
    <ItemDialogContext.Provider value={api}>
      {children}
      <Dialog open={state.open} onClose={close} labelledBy="item-dialog-title" variant="sheet">
        {state.target ? <ItemDialogBody key={state.nonce} target={state.target} edit={state.edit} onDone={close} /> : null}
      </Dialog>
    </ItemDialogContext.Provider>
  );
}

function optionPriceLabel(
  group: Customization,
  option: CustomizationOption,
  basePrice: number,
  sizeId: string | null,
): string | null {
  // The size group defines the price, so show the absolute price rather than a delta.
  if (group.kind === "size") return formatPKR(basePrice + option.priceDelta);
  if (option.priceDeltaBySize) {
    if (sizeId && option.priceDeltaBySize[sizeId] !== undefined) {
      return formatSignedPKR(getOptionPrice(option, sizeId));
    }
    const { min, max } = getOptionPriceRange(option);
    return min === max ? formatSignedPKR(min) : `+${formatPKR(min)}–${formatPlainNumber(max)}`;
  }
  return option.priceDelta === 0 ? null : formatSignedPKR(option.priceDelta);
}

function ItemDialogBody({ target, edit, onDone }: { target: Purchasable; edit: CartItem | null; onDone: () => void }) {
  const { announce } = useToast();

  const isProduct = target.kind === "product";
  const name = isProduct ? target.product.name : target.deal.name;
  const image = isProduct ? target.product.image : target.deal.image;
  const customizations = isProduct ? target.product.customizations : [];
  const notePrompt = isProduct ? target.product.notePrompt : target.deal.notePrompt;
  const basePrice = isProduct ? target.product.basePrice : target.deal.price;

  const [selections, setSelections] = useState<SelectionMap>(() =>
    edit ? sanitizeSelections(customizations, edit.selections) : {},
  );
  const [quantity, setQuantity] = useState(edit?.quantity ?? 1);
  const [note, setNote] = useState(edit?.note ?? "");
  const [attempted, setAttempted] = useState(false);

  const errors = attempted ? validateSelections(customizations, selections) : {};
  const sizeId = getSelectedSizeId(customizations, selections);
  const unitPrice = isProduct ? calculateUnitPrice(basePrice, customizations, selections) : basePrice;
  const missingRequired = customizations.some((group) => group.required && !(selections[group.id]?.length ?? 0));
  const starting = isProduct ? getStartingPrice(target.product) : null;

  function setSingle(group: Customization, optionId: string) {
    setSelections((previous) => ({ ...previous, [group.id]: [optionId] }));
  }

  function toggleMultiple(group: Customization, optionId: string) {
    setSelections((previous) => {
      const current = previous[group.id] ?? [];
      const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
      if (group.max !== undefined && next.length > group.max) return previous;
      return { ...previous, [group.id]: next };
    });
  }

  function clearGroup(group: Customization) {
    setSelections((previous) => {
      const next = { ...previous };
      delete next[group.id];
      return next;
    });
  }

  function submit() {
    setAttempted(true);
    const found = validateSelections(customizations, selections);
    const firstInvalid = customizations.find((group) => found[group.id]);
    if (firstInvalid) {
      const element = document.getElementById(`group-${firstInvalid.id}`);
      element?.scrollIntoView({ block: "center", behavior: "smooth" });
      element?.focus({ preventScroll: true });
      announce(found[firstInvalid.id]);
      return;
    }

    const payload: NewCartItem = {
      kind: target.kind,
      refId: isProduct ? target.product.id : target.deal.id,
      quantity,
      selections: sanitizeSelections(customizations, selections),
      note: note.trim() || undefined,
    };
    if (edit) replaceCartItem(edit.lineId, payload);
    else addCartItem(payload);
    announce(edit ? `${name} updated in your cart.` : `${name} added to your cart.`);
    onDone();
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="relative flex max-h-[inherit] min-h-0 flex-col md:flex-row"
    >
      <DialogCloseButton
        onClick={onDone}
        label={`Close ${name}`}
        className="absolute right-3 top-3 z-10 bg-cream/90 backdrop-blur-sm"
      />

      <div className="relative h-40 shrink-0 bg-cream-2 sm:h-52 md:h-auto md:w-[42%]">
        <FoodImage image={image} sizes="(min-width: 48rem) 24rem, 100vw" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 pr-5 md:p-7">
          <header className="space-y-2 pr-12">
            <h2 id="item-dialog-title" className="text-3xl">
              {name}
            </h2>
            <p className="tabular text-lg font-semibold">
              {starting?.hasVariants ? <span className="mr-2 text-sm font-medium text-muted">From</span> : null}
              {formatPKR(isProduct ? (starting?.amount ?? basePrice) : basePrice)}
            </p>
            {isProduct ? (
              <p className="text-ink-2">{target.product.description}</p>
            ) : (
              <ul className="space-y-1 text-ink-2">
                {target.deal.includes.map((entry) => (
                  <li key={entry.label} className="flex gap-2">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-tomato" />
                    <span>
                      {entry.quantity && entry.quantity > 1 ? `${entry.quantity} × ` : ""}
                      {entry.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </header>

          {customizations.map((group) => {
            const selected = selections[group.id] ?? [];
            const error = errors[group.id];
            const helpId = `group-${group.id}-help`;
            const errorId = `group-${group.id}-error`;
            return (
              <fieldset
                key={group.id}
                id={`group-${group.id}`}
                tabIndex={-1}
                aria-describedby={cn(group.helpText && helpId, error && errorId) || undefined}
                className="min-w-0 space-y-3 rounded-2xl outline-offset-4"
              >
                <legend className="flex w-full flex-wrap items-baseline gap-x-2 text-lg font-bold">
                  {group.label}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      group.required ? "text-tomato-deep" : "text-muted",
                    )}
                  >
                    {group.required ? "Required" : "Optional"}
                  </span>
                </legend>
                {group.helpText ? (
                  <p id={helpId} className="help -mt-2">
                    {group.helpText}
                  </p>
                ) : null}

                <div className="grid gap-2">
                  {group.options.map((option) => {
                    const checked = selected.includes(option.id);
                    const priceLabel = optionPriceLabel(group, option, basePrice, sizeId);
                    return (
                      <label
                        key={option.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors duration-[var(--dur-micro)]",
                          "hover:border-ink-2 has-checked:border-ink has-checked:bg-cream-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus",
                          error ? "border-danger" : "border-rule",
                        )}
                      >
                        <input
                          type={group.selection === "single" ? "radio" : "checkbox"}
                          name={`${group.id}`}
                          checked={checked}
                          onChange={() =>
                            group.selection === "single" ? setSingle(group, option.id) : toggleMultiple(group, option.id)
                          }
                          className="size-5 shrink-0 accent-tomato focus-visible:outline-none"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{option.label}</span>
                          {option.description ? (
                            <span className="block text-sm text-muted">{option.description}</span>
                          ) : null}
                        </span>
                        {priceLabel ? (
                          <span className="tabular shrink-0 text-sm font-semibold text-ink-2">{priceLabel}</span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>

                {!group.required && group.selection === "single" && selected.length > 0 ? (
                  <button type="button" className="text-sm font-semibold text-tomato-deep underline underline-offset-4" onClick={() => clearGroup(group)}>
                    Clear {group.label.toLowerCase()}
                  </button>
                ) : null}

                {error ? (
                  <p id={errorId} role="alert" className="error-text">
                    <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {error}
                  </p>
                ) : null}
              </fieldset>
            );
          })}

          <div className="space-y-2">
            <label htmlFor="item-note" className="label">
              {notePrompt ?? "Special instructions"}{" "}
              <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="item-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={160}
              rows={2}
              placeholder={notePrompt ? "Your answer" : "For example: no onions"}
              className="input resize-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-rule bg-cream p-4 md:px-7">
          <QuantityStepper value={quantity} onChange={setQuantity} label={name} />
          <Button type="submit" size="lg" className="min-w-[11rem] flex-1">
            {edit ? "Update item" : "Add to cart"}
            <span aria-hidden>·</span>
            <span className="tabular">{formatPKR(unitPrice * quantity)}</span>
          </Button>
          {missingRequired && !attempted ? (
            <p className="help w-full">Pick the required options above to confirm the price.</p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
