"use client";

import { Check, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FoodImage } from "@/components/ui/food-image";
import { useToast } from "@/components/ui/toast";
import { addCartItem } from "@/features/cart/cart-store";
import { useItemDialog } from "@/features/item/item-dialog";
import { formatPKR } from "@/lib/format";
import type { Deal } from "@/lib/types";

/**
 * A set deal. Original price, savings and validity render only when the data supplies real values;
 * the printed menu has none of them, so by default the card shows the deal price alone.
 */
export function DealCard({ deal, eager }: { deal: Deal; eager?: boolean }) {
  const { openItem } = useItemDialog();
  const { announce } = useToast();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const opensDialog = Boolean(deal.notePrompt);
  const savings = deal.originalPrice && deal.originalPrice > deal.price ? deal.originalPrice - deal.price : 0;

  function add() {
    if (opensDialog) {
      openItem({ kind: "deal", deal });
      return;
    }
    addCartItem({ kind: "deal", refId: deal.id, quantity: 1, selections: {} });
    announce(`${deal.name} added to your cart.`);
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-rule bg-card text-ink">
      <div className="relative aspect-[16/10] bg-cream-2">
        <FoodImage image={deal.image} eager={eager} sizes="(min-width: 64rem) 20rem, (min-width: 40rem) 45vw, 92vw" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-2xl">{deal.name}</h3>
          <p className="tabular font-display text-2xl font-extrabold text-tomato-deep">{formatPKR(deal.price)}</p>
        </div>

        <ul className="space-y-1 text-[0.9375rem] text-ink-2">
          {deal.includes.map((entry) => (
            <li key={entry.label} className="flex gap-2">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-tomato" />
              <span>
                {entry.quantity && entry.quantity > 1 ? `${entry.quantity} × ` : ""}
                {entry.label}
              </span>
            </li>
          ))}
        </ul>

        {deal.originalPrice || deal.validity ? (
          <p className="text-sm text-muted">
            {deal.originalPrice ? (
              <>
                <s className="tabular">{formatPKR(deal.originalPrice)}</s>
                {savings > 0 ? <span className="ml-2 font-semibold text-success">Save {formatPKR(savings)}</span> : null}
              </>
            ) : null}
            {deal.validity ? <span className="ml-2">{deal.validity}</span> : null}
          </p>
        ) : null}

        <Button
          className="mt-auto w-full"
          onClick={add}
          data-state={added ? "success" : undefined}
          aria-label={`Add ${deal.name} to cart`}
          aria-haspopup={opensDialog ? "dialog" : undefined}
        >
          {added ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
          {added ? "Added" : "Add deal"}
        </Button>
      </div>
    </article>
  );
}
