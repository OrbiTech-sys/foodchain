import { CartSummary } from "@/features/cart/components/cart-summary";
import { formatPKR, pluralize } from "@/lib/format";
import type { CartTotals, FulfillmentType, PricedLine } from "@/lib/types";

interface CheckoutSummaryProps {
  lines: PricedLine[];
  totals: CartTotals;
  fulfillment: FulfillmentType;
}

/** Read-only order summary: items with their customizations, then the same totals shown in the cart. */
export function CheckoutSummary({ lines, totals, fulfillment }: CheckoutSummaryProps) {
  return (
    <aside
      aria-labelledby="checkout-summary-title"
      className="on-dark space-y-5 rounded-3xl bg-char p-6 text-cream lg:sticky lg:top-[calc(var(--header-visible)+1.5rem)]"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="checkout-summary-title" className="text-2xl">
          Your order
        </h2>
        <p className="text-sm text-fog">{pluralize(totals.itemCount, "item")}</p>
      </div>

      <ul className="divide-y divide-char-rule">
        {lines.map((line) => (
          <li key={line.item.lineId} className="flex gap-3 py-3 first:pt-0">
            <span className="tabular w-7 shrink-0 font-bold text-gold">{line.item.quantity}×</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{line.name}</p>
              {line.summary.map((entry) => (
                <p key={entry.label} className="text-sm text-fog [overflow-wrap:anywhere]">
                  {entry.label}: {entry.value}
                </p>
              ))}
            </div>
            <p className="tabular shrink-0 font-semibold">{formatPKR(line.lineTotal)}</p>
          </li>
        ))}
      </ul>

      <CartSummary
        totals={totals}
        fulfillment={fulfillment}
        className="[&_dt]:text-fog [&_dd]:text-cream [&>div:last-child]:border-char-rule [&>div:last-child_dt]:text-cream"
      />
    </aside>
  );
}
