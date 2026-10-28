"use client";

import { Check, ChevronRight, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FoodImage } from "@/components/ui/food-image";
import { useToast } from "@/components/ui/toast";
import { addCartItem } from "@/features/cart/cart-store";
import { useItemDialog } from "@/features/item/item-dialog";
import { formatPKR } from "@/lib/format";
import { getStartingPrice, hasRequiredChoices } from "@/lib/pricing";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  /** Preload the image (first row above the fold only). */
  eager?: boolean;
}

/**
 * Whole card opens the details dialog (the name is the stretched link target). The action button adds
 * straight to the cart when nothing has to be chosen, and opens the dialog when a choice is required.
 */
export function ProductCard({ product, eager }: ProductCardProps) {
  const { openItem } = useItemDialog();
  const { announce } = useToast();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const needsChoices = hasRequiredChoices(product.customizations);
  const { amount, hasVariants } = getStartingPrice(product);

  function openDetails() {
    openItem({ kind: "product", product });
  }

  function quickAdd() {
    addCartItem({ kind: "product", refId: product.id, quantity: 1, selections: {} });
    announce(`${product.name} added to your cart.`);
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="group relative flex h-full overflow-hidden rounded-3xl border border-rule bg-card transition-colors duration-[var(--dur-short)] hover:border-ink-2 has-focus-visible:border-ink max-sm:flex-row sm:flex-col">
      <div className="relative aspect-square w-32 shrink-0 bg-cream-2 sm:aspect-[4/3] sm:w-auto">
        <FoodImage
          image={product.image}
          eager={eager}
          sizes="(min-width: 80rem) 25rem, (min-width: 40rem) 45vw, 128px"
        />
        {product.signature ? (
          <span className="absolute left-3 top-3 hidden rounded-full bg-char px-3 py-1 text-xs font-semibold text-gold sm:block">
            Signature
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg leading-tight sm:text-xl">
          <button
            type="button"
            onClick={openDetails}
            aria-haspopup="dialog"
            className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {product.name}
          </button>
        </h3>
        <p className="clamp-2 text-sm text-ink-2">{product.description}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-3">
          <p className="tabular font-display text-xl font-extrabold">
            {hasVariants ? <span className="mr-1 font-sans text-xs font-medium text-muted">From</span> : null}
            {formatPKR(amount)}
          </p>
          {needsChoices ? (
            <Button
              size="sm"
              variant="soft"
              className="relative z-10"
              onClick={openDetails}
              aria-label={`Choose options for ${product.name}`}
              aria-haspopup="dialog"
            >
              Choose
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button
              size="sm"
              className="relative z-10"
              onClick={quickAdd}
              data-state={added ? "success" : undefined}
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
              {added ? "Added" : "Add"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
