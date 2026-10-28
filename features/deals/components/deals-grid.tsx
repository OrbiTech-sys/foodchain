import type { Deal } from "@/lib/types";
import { DealCard } from "./deal-card";

export function DealsGrid({ deals, eagerCount = 0 }: { deals: Deal[]; eagerCount?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {deals.map((deal, index) => (
        <li key={deal.id} className="min-w-0">
          <DealCard deal={deal} eager={index < eagerCount} />
        </li>
      ))}
    </ul>
  );
}
