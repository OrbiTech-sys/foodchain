import { Skeleton } from "@/components/ui/skeleton";

/** Loading state shown while the menu route streams in. Mirrors the real card geometry. */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading the menu"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex overflow-hidden rounded-3xl border border-rule bg-card max-sm:flex-row sm:flex-col">
          <Skeleton className="aspect-square w-32 shrink-0 rounded-none sm:aspect-[4/3] sm:w-auto" />
          <div className="flex-1 space-y-3 p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
