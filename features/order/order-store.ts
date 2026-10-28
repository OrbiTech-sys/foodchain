import { createPersistedStore } from "@/lib/persisted-store";
import { isValidCoordinates } from "@/lib/geo";
import type { CustomerLocation, FulfillmentType } from "@/lib/types";

/** The customer's current ordering choices. Shared by the header, home page, cart and checkout. */
export interface OrderPreferences {
  version: 1;
  fulfillment: FulfillmentType;
  /** A location the customer provided themselves (device GPS or a pasted pin). Never geocoded. */
  location: CustomerLocation | null;
  /** Free-text delivery address. Not verified. */
  addressText: string;
}

const DEFAULT_PREFERENCES: OrderPreferences = {
  version: 1,
  fulfillment: "delivery",
  location: null,
  addressText: "",
};

export const orderStore = createPersistedStore<OrderPreferences>({
  key: "foodchain.order.v1",
  initial: DEFAULT_PREFERENCES,
  parse(raw) {
    if (!raw || typeof raw !== "object") return null;
    const data = raw as Partial<OrderPreferences>;
    if (data.version !== 1) return null;
    const fulfillment: FulfillmentType = data.fulfillment === "pickup" ? "pickup" : "delivery";
    const location =
      data.location &&
      isValidCoordinates(data.location.coordinates) &&
      (data.location.source === "device" || data.location.source === "pasted")
        ? { coordinates: data.location.coordinates, source: data.location.source }
        : null;
    return {
      version: 1,
      fulfillment,
      location,
      addressText: typeof data.addressText === "string" ? data.addressText.slice(0, 300) : "",
    };
  },
});

export const setFulfillment = (fulfillment: FulfillmentType) =>
  orderStore.set((state) => ({ ...state, fulfillment }));

export const setCustomerLocation = (location: CustomerLocation | null) =>
  orderStore.set((state) => ({ ...state, location }));

export const setAddressText = (addressText: string) =>
  orderStore.set((state) => ({ ...state, addressText }));
