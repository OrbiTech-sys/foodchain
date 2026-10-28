import { cn } from "@/lib/cn";

/** Hand-built pizza-slice mark. Swap for the official logo file when the owner supplies it. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 44" className={cn("shrink-0", className)} aria-hidden focusable="false">
      <path d="M3 10.5C10 6 15 4.5 20 4.5s10 1.5 17 6l-2.2 5.6C29 13 24.500 12 20 12s-9 1-14.800 4.100z" className="fill-cream" />
      <path d="M5.600 17.200C11 14.500 15.500 13.500 20 13.500s9 1 14.400 3.700L20 42z" className="fill-gold" />
      <circle cx="15" cy="20.500" r="3" className="fill-tomato" />
      <circle cx="24.500" cy="23" r="2.800" className="fill-tomato" />
      <circle cx="19.500" cy="31" r="2.400" className="fill-tomato" />
    </svg>
  );
}

interface WordmarkProps {
  /** "dark" = on a charcoal surface, "light" = on cream. */
  tone?: "dark" | "light";
  tagline?: boolean;
  className?: string;
}

export function Wordmark({ tone = "dark", tagline = true, className }: WordmarkProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-3", className)}>
      <LogoMark className="h-9 w-8" />
      <span className="flex shrink-0 flex-col leading-none">
        <span className="whitespace-nowrap font-display text-[1.375rem] font-extrabold uppercase tracking-tight">
          <span className={tone === "dark" ? "text-tomato-glow" : "text-tomato"}>Food</span>
          {" "}
          <span className={tone === "dark" ? "text-cream" : "text-ink"}>Chain</span>
        </span>
        {tagline ? (
          <span className={cn("mt-1 text-[0.8125rem] font-medium", tone === "dark" ? "text-fog" : "text-muted")}>
            Pizza &amp; Fast Food
          </span>
        ) : null}
      </span>
    </span>
  );
}
