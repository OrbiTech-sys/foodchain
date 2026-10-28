import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  id: string;
  title: string;
  description?: string;
  /** Right-aligned action, usually a link. */
  action?: ReactNode;
  /** Use on charcoal sections. */
  onDark?: boolean;
  className?: string;
}

/** Stacked section head: heading, optional line of context, optional action. No eyebrow, no numbering. */
export function SectionHeading({ id, title, description, action, onDark, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-4", className)}>
      <div className="min-w-0 max-w-2xl space-y-2">
        <h2 id={id} className="text-4xl sm:text-5xl">
          {title}
        </h2>
        {description ? <p className={cn("text-lg", onDark ? "text-fog" : "text-ink-2")}>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
