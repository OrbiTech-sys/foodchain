import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { formatPKR } from "@/lib/format";
import type { CartTotals, FulfillmentType } from "@/lib/types";

interface CartSummaryProps {
  totals: CartTotals;
  fulfillment: FulfillmentType;
  className?: string;
}

/** Subtotal, delivery fee (when configured), discount (when applicable) and grand total. */
export function CartSummary({ totals, fulfillment, className }: CartSummaryProps) {
  const discount = siteConfig.ordering.discount;
  return (
    <dl className={cn("space-y-2 text-[0.9375rem]", className)}>
      <Row label="Subtotal" value={formatPKR(totals.subtotal)} />
      {fulfillment === "delivery" && totals.deliveryFee !== null ? (
        <Row label="Delivery" value={totals.deliveryFee === 0 ? "Free" : formatPKR(totals.deliveryFee)} />
      ) : null}
      {totals.discount > 0 ? <Row label={discount?.label ?? "Discount"} value={`−${formatPKR(totals.discount)}`} /> : null}
      <div className="flex items-baseline justify-between gap-4 border-t border-rule pt-3 text-xl font-bold">
        <dt>Total</dt>
        <dd className="tabular">{formatPKR(totals.total)}</dd>
      </div>
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-2">{label}</dt>
      <dd className="tabular font-semibold">{value}</dd>
    </div>
  );
}
