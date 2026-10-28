/**
 * Business details and feature switches. Everything here that is marked "printed menu" was
 * transcribed from the owner's printed "New Menu 2026" and should be re-confirmed before launch.
 * Unknown business details are left null/false rather than guessed.
 */

export interface PhoneEntry {
  /** Local display format, e.g. 0300-4835350 */
  number: string;
  kind: "mobile" | "landline";
  /** The printed menu shows a WhatsApp icon beside this number. */
  whatsapp: boolean;
}

export const siteConfig = {
  name: "Food Chain",
  tagline: "Pizza & Fast Food",
  description:
    "Pizza, burgers, shawarma, sandwiches and parathas from our Rifle Range Road kitchen in Iqbal Park, Lahore. Pickup, or delivery within 5 km.",

  /** Where the sample menu data came from. Shown in the footer and on the deals page. */
  menuSource: "the printed New Menu 2026",

  currency: { code: "PKR", symbol: "Rs" },

  contact: {
    phones: [
      { number: "0300-4835350", kind: "mobile", whatsapp: true },
      { number: "0323-4634705", kind: "mobile", whatsapp: true },
      { number: "0323-4835350", kind: "mobile", whatsapp: true },
      { number: "0310-4534930", kind: "mobile", whatsapp: true },
      { number: "042-36621641", kind: "landline", whatsapp: false },
      { number: "042-36674152", kind: "landline", whatsapp: false },
    ] satisfies PhoneEntry[],
    /** Used for the header/footer "Call" action. */
    primaryPhone: "0300-4835350",
    /**
     * Floating WhatsApp button. It only renders when this is a valid Pakistan mobile number.
     * Set to null to hide the button.
     */
    whatsappNumber: "0300-4835350" as string | null,
    whatsappMessage: "Hello Food Chain, I have a question about an order.",
  },

  hours: {
    /** Printed menu: "Timing 12:00pm to 05:00 am". Days of the week are not printed. */
    label: "12:00 pm – 5:00 am",
    closesLabel: "5:00 am",
    /** Flip to false and the site shows "Opening hours to be confirmed" instead. */
    verified: true,
    note: "As printed on the New Menu 2026.",
  },

  ordering: {
    /** Printed menu says "Takeaway & free delivery". Set a number to charge a fee, or null to hide the line. */
    deliveryFee: 0 as number | null,
    /** No discounts are configured. Shape: { label: string; amount: number } */
    discount: null as { label: string; amount: number } | null,
    /**
     * Cash on delivery is not stated on the printed menu, so it is off.
     * When false the checkout is labelled a preview and no payment method is shown.
     */
    cashOnDelivery: false,
    maxLineQuantity: 20,
  },
} as const;

export type SiteConfig = typeof siteConfig;
