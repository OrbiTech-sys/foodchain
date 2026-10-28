import { isValidPkMobile } from "@/lib/format";
import type { CheckoutDetails, DeliveryEligibility } from "@/lib/types";

export type CheckoutField =
  | "fullName"
  | "phone"
  | "houseNumber"
  | "street"
  | "area"
  | "address"
  | "manualRadius"
  | "delivery";

export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

const NAME_PATTERN = /^[\p{L}][\p{L}\p{M}\s.'’-]{1,79}$/u;

export function emptyCheckoutDetails(): CheckoutDetails {
  return {
    fulfillment: "delivery",
    fullName: "",
    phone: "",
    delivery: { houseNumber: "", street: "", area: "", address: "", notes: "" },
    manualRadiusAcknowledged: false,
  };
}

/** Each message says what is wrong and what to do, in that order. */
export function validateCheckout(
  details: CheckoutDetails,
  eligibility: DeliveryEligibility,
): CheckoutErrors {
  const errors: CheckoutErrors = {};

  const name = details.fullName.trim();
  if (!name) errors.fullName = "Enter your full name so we know who the order is for.";
  else if (!NAME_PATTERN.test(name)) errors.fullName = "Use letters only in your name, for example Ayesha Khan.";

  if (!details.phone.trim()) errors.phone = "Enter your mobile number so we can reach you about the order.";
  else if (!isValidPkMobile(details.phone))
    errors.phone = "That doesn’t look like a Pakistan mobile number. Use a format like 0300 1234567.";

  if (details.fulfillment === "delivery") {
    const { houseNumber, street, area, address } = details.delivery;
    if (!houseNumber.trim()) errors.houseNumber = "Enter your house or flat number.";
    if (!street.trim()) errors.street = "Enter your street name or number.";
    if (!area.trim()) errors.area = "Enter your area, for example the society or neighbourhood.";
    if (!address.trim()) errors.address = "Enter a building name, society or nearby landmark.";

    if (eligibility.status === "ineligible") {
      errors.delivery = `Your location is outside our ${eligibility.radiusKm} km delivery radius. Switch to pickup to continue.`;
    } else if (eligibility.status === "unknown" && !details.manualRadiusAcknowledged) {
      errors.manualRadius =
        "Confirm that Food Chain will check your address is inside the delivery radius, or choose pickup.";
    }
  }

  return errors;
}

export const CHECKOUT_FIELD_ORDER: CheckoutField[] = [
  "fullName",
  "phone",
  "houseNumber",
  "street",
  "area",
  "address",
  "manualRadius",
  "delivery",
];
