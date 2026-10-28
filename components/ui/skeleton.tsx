import { cn } from "@/lib/cn";

/** Pulsing placeholder for content that is still loading. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}
