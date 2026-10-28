"use client";

import { ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { formatPKR, pluralize } from "@/lib/format";
import { useCartUi } from "../cart-ui";
import { useCart } from "../use-cart";

/** Phone-only bar pinned to the bottom edge whenever the cart has something in it. */
export function StickyCartBar() {
  const pathname = usePathname();
  const { count, totals } = useCart();
  const { openCart } = useCartUi();

  if (count === 0 || pathname.startsWith("/cart") || pathname.startsWith("/checkout")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <button type="button" onClick={openCart} className="btn btn--primary btn--lg w-full justify-between shadow-lift">
        <span className="inline-flex items-center gap-3">
          <ShoppingBag className="size-5" aria-hidden />
          View cart · {pluralize(count, "item")}
        </span>
        <span className="tabular">{formatPKR(totals.total)}</span>
      </button>
    </div>
  );
}
