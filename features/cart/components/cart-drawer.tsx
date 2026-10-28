"use client";

import { ShoppingBag } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog, DialogCloseButton } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { DeliveryStatus } from "@/features/order/components/delivery-status";
import { OrderTypeSelector } from "@/features/order/components/order-type-selector";
import { useOrderPreferences } from "@/features/order/use-order";
import { useCartUi } from "../cart-ui";
import { useCart } from "../use-cart";
import { CartItemRow } from "./cart-item-row";
import { CartSummary } from "./cart-summary";

/** Slide-in cart. The same lines and totals as the cart page, in a drawer. */
export function CartDrawer() {
  const { isOpen, closeCart } = useCartUi();
  const cart = useCart();
  const { fulfillment } = useOrderPreferences();

  return (
    <Dialog open={isOpen} onClose={closeCart} labelledBy="cart-drawer-title" variant="drawer">
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-rule px-5 py-4">
          <h2 id="cart-drawer-title" className="text-2xl">
            Your cart
            {cart.count > 0 ? <span className="tabular ml-2 text-lg font-semibold text-muted">({cart.count})</span> : null}
          </h2>
          <DialogCloseButton onClick={closeCart} label="Close cart" className="-mr-2" />
        </header>

        {cart.isEmpty ? (
          <div className="p-5">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Add a pizza, a burger or a deal and it will show up here."
              action={
                <ButtonLink href="/menu" onClick={closeCart}>
                  Browse menu
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-4">
              <div className="space-y-3">
                <OrderTypeSelector tone="light" />
                <DeliveryStatus />
              </div>
              <ul className="mt-2 divide-y divide-rule">
                {cart.lines.map((line) => (
                  <CartItemRow key={line.item.lineId} line={line} />
                ))}
              </ul>
            </div>
            <footer className="space-y-4 border-t border-rule bg-card px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <CartSummary totals={cart.totals} fulfillment={fulfillment} />
              <div className="grid gap-2">
                <ButtonLink href="/checkout" size="lg" onClick={closeCart} className="w-full">
                  Go to checkout
                </ButtonLink>
                <div className="grid grid-cols-2 gap-2">
                  <ButtonLink href="/cart" variant="outline" size="sm" onClick={closeCart}>
                    View cart page
                  </ButtonLink>
                  <Button variant="ghost" size="sm" onClick={closeCart}>
                    Keep browsing
                  </Button>
                </div>
              </div>
            </footer>
          </>
        )}
      </div>
    </Dialog>
  );
}
