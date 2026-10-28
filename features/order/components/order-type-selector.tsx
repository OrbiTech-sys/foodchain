"use client";

import { Store, Truck } from "lucide-react";
import { useId } from "react";
import { siteConfig } from "@/config/site";
import { useCatalogue } from "@/features/catalogue/catalogue-context";
import { cn } from "@/lib/cn";
import { formatPKR } from "@/lib/format";
import type { FulfillmentType } from "@/lib/types";
import { setFulfillment } from "../order-store";
import { useOrderPreferences } from "../use-order";

interface OrderTypeSelectorProps {
  variant?: "segmented" | "cards";
  /** "dark" for charcoal surfaces, "light" for cream ones. Segmented only. */
  tone?: "dark" | "light";
  className?: string;
}

const OPTIONS: { value: FulfillmentType; label: string; icon: typeof Truck }[] = [
  { value: "delivery", label: "Delivery", icon: Truck },
  { value: "pickup", label: "Pickup", icon: Store },
];

/** Delivery-or-pickup radio group. Native radios, so arrow keys and screen readers work for free. */
export function OrderTypeSelector({ variant = "segmented", tone = "dark", className }: OrderTypeSelectorProps) {
  const name = useId();
  const { fulfillment } = useOrderPreferences();
  const { branch } = useCatalogue();

  if (variant === "segmented") {
    return (
      <div
        role="radiogroup"
        aria-label="Order type"
        className={cn("inline-flex rounded-xl p-1", tone === "dark" ? "bg-char-3" : "bg-cream-2", className)}
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <label key={value} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={value}
              checked={fulfillment === value}
              onChange={() => setFulfillment(value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors duration-[var(--dur-micro)]",
                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
                tone === "dark"
                  ? "text-fog hover:text-cream peer-checked:bg-cream peer-checked:text-ink peer-focus-visible:outline-focus-dark"
                  : "text-ink-2 hover:text-ink peer-checked:bg-char peer-checked:text-cream peer-focus-visible:outline-focus",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </span>
          </label>
        ))}
      </div>
    );
  }

  const fee = siteConfig.ordering.deliveryFee;
  const descriptions: Record<FulfillmentType, string> = {
    delivery: `Within ${branch.deliveryRadiusKm} km of our kitchen${
      fee === null ? "" : fee === 0 ? " · free delivery" : ` · ${formatPKR(fee)} delivery`
    }`,
    pickup: `Collect from ${branch.address.road}, ${branch.address.area}`,
  };

  return (
    <fieldset className={cn("grid gap-3 sm:grid-cols-2", className)}>
      <legend className="sr-only">Order type</legend>
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <label key={value} className="group relative block cursor-pointer">
          <input
            type="radio"
            name={name}
            value={value}
            checked={fulfillment === value}
            onChange={() => setFulfillment(value)}
            className="peer sr-only"
          />
          <span
            className={cn(
              "flex h-full items-start gap-4 rounded-2xl border border-rule bg-card p-4 text-ink transition-colors duration-[var(--dur-micro)]",
              "hover:border-ink-2 peer-checked:border-ink peer-checked:bg-cream-2",
              "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
            )}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-cream-3 text-ink transition-colors group-has-checked:bg-char group-has-checked:text-cream">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-bold leading-tight">{label}</span>
              <span className="mt-0.5 block text-sm text-ink-2">{descriptions[value]}</span>
            </span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
