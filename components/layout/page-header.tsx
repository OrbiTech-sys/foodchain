import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Extra controls under the description, such as the order-type selector. */
  children?: ReactNode;
  onDark?: boolean;
  className?: string;
}

/** Page title block used by the inner pages. Left-aligned, no eyebrow. */
export function PageHeader({ title, description, children, onDark, className }: PageHeaderProps) {
  return (
    <header className={cn("page-container pb-8 pt-10 md:pb-10 md:pt-14", className)}>
      <h1 className="reveal max-w-3xl text-display-s font-extrabold">{title}</h1>
      {description ? (
        <p className={cn("reveal mt-3 max-w-2xl text-lg", onDark ? "text-fog" : "text-ink-2")} style={{ animationDelay: "70ms" }}>
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </header>
  );
}
