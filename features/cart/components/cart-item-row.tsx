"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoodImage } from "@/components/ui/food-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useToast } from "@/components/ui/toast";
import { useCatalogue } from "@/features/catalogue/catalogue-context";
import { useItemDialog } from "@/features/item/item-dialog";
import { formatPKR } from "@/lib/format";
import { findPurchasable } from "@/lib/pricing";
import type { PricedLine } from "@/lib/types";
import { removeCartItem, restoreCartItem, setCartItemQuantity } from "../cart-store";

/** One cart line: photo, name, customizations, quantity stepper, edit and remove (with Undo). */
export function CartItemRow({ line }: { line: PricedLine }) {
  const { item } = line;
  const catalogue = useCatalogue();
  const { openItem } = useItemDialog();
  const { toast } = useToast();
  const purchasable = findPurchasable(item, catalogue);

  function remove() {
    const removed = removeCartItem(item.lineId);
    if (!removed) return;
    toast({
      title: `${line.name} removed`,
      action: { label: "Undo", onAction: () => restoreCartItem(removed.item, removed.index) },
    });
  }

  return (
    <li className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)]">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-cream-2">
        <FoodImage image={line.image} sizes="88px" />
      </div>

      <div className="min-w-0 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg leading-snug">{line.name}</h3>
            {line.summary.length > 0 ? (
              <dl className="mt-1 space-y-0.5 text-sm text-ink-2">
                {line.summary.map((entry) => (
                  <div key={entry.label} className="[overflow-wrap:anywhere]">
                    <dt className="inline font-semibold text-ink">{entry.label}: </dt>
                    <dd className="inline">{entry.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          <p className="tabular shrink-0 text-base font-bold">{formatPKR(line.lineTotal)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
          <QuantityStepper
            value={item.quantity}
            onChange={(next) => setCartItemQuantity(item.lineId, next)}
            label={line.name}
          />
          {purchasable ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openItem(purchasable, { edit: item })}
              aria-label={`Edit ${line.name}`}
            >
              <Pencil className="size-4" aria-hidden />
              Edit
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={remove} aria-label={`Remove ${line.name}`}>
            <Trash2 className="size-4" aria-hidden />
            Remove
          </Button>
        </div>
        {item.quantity > 1 ? <p className="help">{formatPKR(line.unitPrice)} each</p> : null}
      </div>
    </li>
  );
}
