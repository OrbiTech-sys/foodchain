/**
 * Shared domain types. These mirror what a future PostgreSQL schema (Drizzle) would expose,
 * so the UI never needs to change when mock data is swapped for a real repository.
 */

export type FulfillmentType = "delivery" | "pickup";

export interface Coordinates {
  lat: number;
  lng: number;
}

/* ───────── Catalogue ───────── */

export interface ProductImage {
  src: string;
  alt: string;
  /** "packshot" = cut-out or white-background food shot, "photo" = full-bleed photograph,
   * "collage" = several item tiles composed into one image (always shown whole, never cropped). */
  kind: "packshot" | "photo" | "collage";
  /** Where the asset came from, so owner-approved photography can replace samples. */
  source: "menu-scan" | "sample";
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: ProductImage;
  sortOrder: number;
}

export type CustomizationKind =
  | "size"
  | "flavour"
  | "crust"
  | "topping"
  | "sauce"
  | "extra"
  | "drink";

export interface CustomizationOption {
  id: string;
  label: string;
  description?: string;
  /** Price added to the product base price. */
  priceDelta: number;
  /** Overrides priceDelta when the size group's selected option id is a key here. */
  priceDeltaBySize?: Record<string, number>;
}

export interface Customization {
  id: string;
  kind: CustomizationKind;
  label: string;
  helpText?: string;
  /** Shown when a required group has no selection. Defaults to "Choose <label>." */
  requiredMessage?: string;
  selection: "single" | "multiple";
  required: boolean;
  /** For multiple selection. Defaults: min = required ? 1 : 0, max = options.length. */
  min?: number;
  max?: number;
  options: CustomizationOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  /** Price before any customization deltas. Shown as "From" when a required size changes it. */
  basePrice: number;
  image?: ProductImage;
  customizations: Customization[];
  /** Extra search terms (flavours, spellings). Search is by name plus these keywords. */
  keywords?: string[];
  featured?: boolean;
  signature?: boolean;
  /** Free-text prompt shown above the notes field, e.g. "Which sandwich flavours?" */
  notePrompt?: string;
}

export interface DealItem {
  label: string;
  quantity?: number;
  /** Optional link to a catalogue product so its photo can be shown on the deal card. */
  productId?: string;
}

export interface Deal {
  id: string;
  /** Number printed on the menu ("Deal 7"). */
  number: number;
  name: string;
  price: number;
  /** Only set when the owner supplies a real original price. Never invented. */
  originalPrice?: number;
  /** Only set when the owner supplies real validity dates. */
  validity?: string;
  kind: "meal" | "family";
  includes: DealItem[];
  image?: ProductImage;
  notePrompt?: string;
}

/** Anything that can be added to the cart. */
export type Purchasable =
  | { kind: "product"; product: Product }
  | { kind: "deal"; deal: Deal };

/* ───────── Cart ───────── */

export type SelectionMap = Record<string, string[]>;

export interface CartItem {
  lineId: string;
  kind: "product" | "deal";
  refId: string;
  quantity: number;
  /** groupId → selected option ids */
  selections: SelectionMap;
  note?: string;
}

export interface PricedLine {
  item: CartItem;
  name: string;
  image?: ProductImage;
  unitPrice: number;
  lineTotal: number;
  /** Human-readable customization summary, one entry per group. */
  summary: { label: string; value: string }[];
}

export interface CartTotals {
  subtotal: number;
  /** null when no delivery fee is configured or the order is pickup. */
  deliveryFee: number | null;
  discount: number;
  total: number;
  itemCount: number;
}

/* ───────── Branch, delivery, checkout ───────── */

export interface Branch {
  id: string;
  name: string;
  address: {
    line1: string;
    road: string;
    area: string;
    city: string;
    country: string;
  };
  /** null until the exact pin is verified. See config/branch.ts. */
  coordinates: Coordinates | null;
  deliveryRadiusKm: number;
  /** Verified Google Maps URL for the branch. Falls back to an address search when null. */
  mapsUrl: string | null;
}

export interface CustomerLocation {
  coordinates: Coordinates;
  source: "device" | "pasted";
}

export type DeliveryEligibility =
  | { status: "eligible"; distanceKm: number; radiusKm: number }
  | { status: "ineligible"; distanceKm: number; radiusKm: number }
  | {
      status: "unknown";
      reason: "no-customer-location" | "branch-not-configured";
      radiusKm: number;
    };

export interface DeliveryAddress {
  houseNumber: string;
  street: string;
  area: string;
  address: string;
  notes: string;
}

export interface CheckoutDetails {
  fulfillment: FulfillmentType;
  fullName: string;
  phone: string;
  delivery: DeliveryAddress;
  /** True when the customer acknowledged the restaurant will confirm the 5 km radius manually. */
  manualRadiusAcknowledged: boolean;
}

export interface Catalogue {
  categories: Category[];
  products: Product[];
  deals: Deal[];
  branch: Branch;
}
