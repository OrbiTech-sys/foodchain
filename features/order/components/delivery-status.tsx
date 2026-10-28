"use client";

import { CircleAlert, CircleCheck, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDistanceKm } from "@/lib/geo";
import { useDeliveryEligibility, useOrderPreferences } from "../use-order";

/** One-line summary of the 5 km check. Shown wherever delivery is selected. */
export function DeliveryStatus({ className }: { className?: string }) {
  const { fulfillment } = useOrderPreferences();
  const eligibility = useDeliveryEligibility();
  if (fulfillment !== "delivery") return null;

  const base = "flex items-start gap-2 rounded-xl px-3 py-3 text-sm font-medium";

  if (eligibility.status === "eligible") {
    return (
      <p role="status" className={cn(base, "bg-success-bg text-success", className)}>
        <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        About {formatDistanceKm(eligibility.distanceKm)} from our kitchen, inside the {eligibility.radiusKm} km delivery radius.
      </p>
    );
  }
  if (eligibility.status === "ineligible") {
    return (
      <p role="status" className={cn(base, "bg-danger-bg text-danger", className)}>
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
        About {formatDistanceKm(eligibility.distanceKm)} away, outside our {eligibility.radiusKm} km radius. Pickup is available.
      </p>
    );
  }
  return (
    <p role="status" className={cn(base, "bg-warn-bg text-warn", className)}>
      <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
      Location not checked yet. Delivery is within {eligibility.radiusKm} km of our kitchen.
    </p>
  );
}
