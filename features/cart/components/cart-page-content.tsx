"use client";

import { ShoppingBag } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryStatus } from "@/features/order/components/delivery-status";
import { OrderTypeSelector } from "@/features/order/components/order-type-selector";
import { useHydrated, useOrderPreferences } from "@/features/order/use-order";
import { pluralize } from "@/lib/format";
import { useCart } from "../use-cart";
import { CartItemRow } from "./cart-item-row";
import { CartSummary } from "./cart-summary";

export function CartPageContent() {
  const hydrated = useHydrated();
  const cart = useCart();
  const { fulfillment } = useOrderPreferences();

  if (!hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]" aria-busy="true" aria-label="Loading your cart">
        <div className="space-y-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (cart.isEmpty) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Nothing here yet. The menu has pizzas, burgers, shawarma and set deals."
        action={<ButtonLink href="/menu">Browse menu</ButtonLink>}
      />
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]">
      <section aria-labelledby="cart-lines-heading" className="rounded-3xl border border-rule bg-card px-5 py-2 sm:px-7">
        <h2 id="cart-lines-heading" className="sr-only">
          Items in your cart
        </h2>
        <ul className="divide-y divide-rule">
          {cart.lines.map((line) => (
            <CartItemRow key={line.item.lineId} line={line} />
          ))}
        </ul>
      </section>

      <aside aria-labelledby="cart-summary-heading" className="space-y-5 rounded-3xl bg-char p-6 text-cream on-dark lg:sticky lg:top-[calc(var(--header-visible)+1.5rem)]">
        <h2 id="cart-summary-heading" className="text-2xl">
          Order summary
        </h2>
        <p className="text-sm text-fog">{pluralize(cart.count, "item")}</p>
        <div className="space-y-3 text-ink">
          <OrderTypeSelector tone="dark" />
          <DeliveryStatus />
        </div>
        <CartSummary
          totals={cart.totals}
          fulfillment={fulfillment}
          className="[&_dt]:text-fog [&_dd]:text-cream [&>div:last-child]:border-char-rule [&>div:last-child_dt]:text-cream"
        />
        <ButtonLink href="/checkout" size="lg" className="w-full">
          Go to checkout
        </ButtonLink>
        <ButtonLink href="/menu" variant="outline-light" className="w-full">
          Add more items
        </ButtonLink>
      </aside>
    </div>
  );
}
