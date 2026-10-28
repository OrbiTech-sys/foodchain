"use client";

import { useSyncExternalStore } from "react";
import { useCatalogue } from "@/features/catalogue/catalogue-context";
import { checkDeliveryEligibility } from "@/lib/geo";
import type { DeliveryEligibility } from "@/lib/types";
import { orderStore, type OrderPreferences } from "./order-store";

export function useOrderPreferences(): OrderPreferences {
  return useSyncExternalStore(orderStore.subscribe, orderStore.getSnapshot, orderStore.getServerSnapshot);
}

/** Eligible / ineligible / unknown, from the customer's pinned location and the branch pin. */
export function useDeliveryEligibility(): DeliveryEligibility {
  const { location } = useOrderPreferences();
  const { branch } = useCatalogue();
  return checkDeliveryEligibility(location?.coordinates ?? null, branch);
}

const subscribeNever = () => () => {};

/** False on the server and during hydration, true afterwards. Lets us show persisted state safely. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
