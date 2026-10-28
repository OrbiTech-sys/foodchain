"use client";

import { Minus, Plus } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  /** Name of the thing being counted, used in the accessible labels. */
  label: string;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  label,
  min = 1,
  max = siteConfig.ordering.maxLineQuantity,
  className,
}: QuantityStepperProps) {
  const buttonClass =
    "grid size-11 place-items-center text-ink transition-colors duration-[var(--dur-micro)] disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-cream-3 enabled:active:bg-cream-3";

  return (
    <div
      role="group"
      aria-label={`Quantity of ${label}`}
      className={cn("inline-flex items-center overflow-hidden rounded-xl border border-rule bg-card", className)}
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease quantity of ${label}`}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <output aria-live="polite" className="tabular min-w-9 text-center font-semibold">
        {value}
      </output>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
