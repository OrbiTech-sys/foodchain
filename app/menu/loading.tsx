import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/features/menu/components/product-grid-skeleton";

export default function MenuLoading() {
  return (
    <div aria-busy="true">
      <div className="page-container space-y-3 pb-10 pt-12">
        <Skeleton className="h-14 w-64 max-w-full" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>
      <div className="border-y border-rule">
        <div className="page-container flex gap-2 py-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      </div>
      <div className="page-container py-10">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
