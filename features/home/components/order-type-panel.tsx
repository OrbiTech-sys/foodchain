"use client";

import { DeliveryCheckButton } from "@/features/order/components/delivery-check-dialog";
import { DeliveryStatus } from "@/features/order/components/delivery-status";
import { OrderTypeSelector } from "@/features/order/components/order-type-selector";
import { useOrderPreferences } from "@/features/order/use-order";

/** Delivery-versus-pickup selector that overlaps the bottom edge of the hero. */
export function OrderTypePanel() {
  const { fulfillment } = useOrderPreferences();

  return (
    <section
      aria-labelledby="order-type-title"
      className="page-container relative z-[var(--z-raised)] -mt-24 lg:-mt-28"
    >
      <div className="grid gap-5 rounded-3xl bg-cream p-5 shadow-lift sm:p-7 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:items-center lg:gap-8">
        <div className="space-y-2">
          <h2 id="order-type-title" className="text-3xl">
            Pickup or delivery?
          </h2>
          <p className="text-ink-2">Pick one now and change it any time before checkout.</p>
        </div>

        <div className="space-y-3">
          <OrderTypeSelector variant="cards" />
          <div className="flex flex-wrap items-center gap-3">
            <DeliveryStatus className="min-w-0 flex-1 basis-64" />
            {fulfillment === "delivery" ? <DeliveryCheckButton size="sm" variant="dark" /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
