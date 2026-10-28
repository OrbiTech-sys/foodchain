import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  /** One line naming what is empty. */
  title: string;
  /** One line on why it matters or what to do. */
  description: string;
  /** The single next action. */
  action?: ReactNode;
  className?: string;
}

/** Three beats: what is empty, why, and one button. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-start gap-4 rounded-3xl border border-rule bg-card p-8 sm:p-10", className)}>
      <span className="grid size-12 place-items-center rounded-2xl bg-cream-2 text-ink-2">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl">{title}</h2>
        <p className="text-ink-2">{description}</p>
      </div>
      {action}
    </div>
  );
}
