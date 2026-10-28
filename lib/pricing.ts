import type {
  CartItem,
  CartTotals,
  Catalogue,
  Customization,
  CustomizationOption,
  Deal,
  FulfillmentType,
  PricedLine,
  Product,
  Purchasable,
  SelectionMap,
} from "@/lib/types";

/**
 * All money maths lives here: option pricing, validation of selections, line pricing and cart totals.
 * Components never add prices themselves, so totals stay identical everywhere they are shown.
 */

/* ───────── Customization pricing ───────── */

export function getSelectedSizeId(
  customizations: Customization[],
  selections: SelectionMap,
): string | null {
  const sizeGroup = customizations.find((group) => group.kind === "size");
  return sizeGroup ? (selections[sizeGroup.id]?.[0] ?? null) : null;
}

export function getOptionPrice(option: CustomizationOption, sizeId: string | null): number {
  if (sizeId && option.priceDeltaBySize && option.priceDeltaBySize[sizeId] !== undefined) {
    return option.priceDeltaBySize[sizeId];
  }
  return option.priceDelta;
}

/** Price range of an option across sizes, used to label extras before a size is chosen. */
export function getOptionPriceRange(option: CustomizationOption): { min: number; max: number } {
  const values = [option.priceDelta, ...Object.values(option.priceDeltaBySize ?? {})];
  if (option.priceDeltaBySize) values.shift();
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function calculateUnitPrice(
  basePrice: number,
  customizations: Customization[],
  selections: SelectionMap,
): number {
  const sizeId = getSelectedSizeId(customizations, selections);
  let price = basePrice;
  for (const group of customizations) {
    for (const optionId of selections[group.id] ?? []) {
      const option = group.options.find((candidate) => candidate.id === optionId);
      if (option) price += getOptionPrice(option, sizeId);
    }
  }
  return price;
}

/** Cheapest price a customer can pay once required choices are made. */
export function getStartingPrice(product: Product): { amount: number; hasVariants: boolean } {
  let amount = product.basePrice;
  let hasVariants = false;
  for (const group of product.customizations) {
    if (!group.required || group.options.length === 0) continue;
    const prices = group.options.map((option) => getOptionPriceRange(option).min);
    amount += Math.min(...prices);
    if (Math.max(...prices) !== Math.min(...prices)) hasVariants = true;
  }
  return { amount, hasVariants };
}

export function hasRequiredChoices(customizations: Customization[]): boolean {
  return customizations.some((group) => group.required);
}

/* ───────── Selections ───────── */

/** Drops unknown groups/options and trims single-select groups to one value. */
export function sanitizeSelections(
  customizations: Customization[],
  selections: SelectionMap,
): SelectionMap {
  const result: SelectionMap = {};
  for (const group of customizations) {
    const valid = (selections[group.id] ?? []).filter((id) =>
      group.options.some((option) => option.id === id),
    );
    const trimmed = group.selection === "single" ? valid.slice(0, 1) : valid;
    if (trimmed.length > 0) result[group.id] = trimmed;
  }
  return result;
}

export function validateSelections(
  customizations: Customization[],
  selections: SelectionMap,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const group of customizations) {
    const count = (selections[group.id] ?? []).length;
    const min = group.selection === "multiple" ? (group.min ?? (group.required ? 1 : 0)) : group.required ? 1 : 0;
    const max = group.selection === "multiple" ? (group.max ?? group.options.length) : 1;
    if (count < min) {
      errors[group.id] =
        group.requiredMessage ??
        (min > 1
          ? `Choose at least ${min} options for ${group.label.toLowerCase()}.`
          : `Choose ${group.label.toLowerCase()} to continue.`);
    } else if (count > max) {
      errors[group.id] = `Choose up to ${max} options for ${group.label.toLowerCase()}.`;
    }
  }
  return errors;
}

/** Stable key so identical configurations merge into one cart line. */
export function selectionsKey(selections: SelectionMap, note?: string): string {
  const entries = Object.keys(selections)
    .sort()
    .map((key) => `${key}=${[...selections[key]].sort().join("+")}`);
  return `${entries.join("|")}#${(note ?? "").trim().toLowerCase()}`;
}

export function summarizeSelections(
  customizations: Customization[],
  selections: SelectionMap,
): { label: string; value: string }[] {
  const summary: { label: string; value: string }[] = [];
  for (const group of customizations) {
    const labels = (selections[group.id] ?? [])
      .map((id) => group.options.find((option) => option.id === id)?.label)
      .filter((label): label is string => Boolean(label));
    if (labels.length > 0) summary.push({ label: group.label, value: labels.join(", ") });
  }
  return summary;
}

/* ───────── Lines and totals ───────── */

export function findPurchasable(item: CartItem, catalogue: Pick<Catalogue, "products" | "deals">): Purchasable | null {
  if (item.kind === "product") {
    const product = catalogue.products.find((candidate) => candidate.id === item.refId);
    return product ? { kind: "product", product } : null;
  }
  const deal = catalogue.deals.find((candidate) => candidate.id === item.refId);
  return deal ? { kind: "deal", deal } : null;
}

function describeDeal(deal: Deal): string {
  return deal.includes
    .map((entry) => (entry.quantity && entry.quantity > 1 ? `${entry.quantity} × ${entry.label}` : entry.label))
    .join(", ");
}

export function priceCartItem(
  item: CartItem,
  catalogue: Pick<Catalogue, "products" | "deals">,
): PricedLine | null {
  const purchasable = findPurchasable(item, catalogue);
  if (!purchasable) return null;

  const noteSummary = item.note?.trim() ? [{ label: "Note", value: item.note.trim() }] : [];

  if (purchasable.kind === "product") {
    const { product } = purchasable;
    const unitPrice = calculateUnitPrice(product.basePrice, product.customizations, item.selections);
    return {
      item,
      name: product.name,
      image: product.image,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      summary: [...summarizeSelections(product.customizations, item.selections), ...noteSummary],
    };
  }

  const { deal } = purchasable;
  return {
    item,
    name: deal.name,
    image: deal.image,
    unitPrice: deal.price,
    lineTotal: deal.price * item.quantity,
    summary: [{ label: "Includes", value: describeDeal(deal) }, ...noteSummary],
  };
}

export function priceCart(
  items: CartItem[],
  catalogue: Pick<Catalogue, "products" | "deals">,
): PricedLine[] {
  return items
    .map((item) => priceCartItem(item, catalogue))
    .filter((line): line is PricedLine => line !== null);
}

export interface TotalsInput {
  lines: PricedLine[];
  fulfillment: FulfillmentType;
  /** null = no fee configured */
  deliveryFee: number | null;
  discount: { label: string; amount: number } | null;
}

export function calculateTotals({ lines, fulfillment, deliveryFee, discount }: TotalsInput): CartTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.item.quantity, 0);
  const fee = fulfillment === "delivery" && deliveryFee !== null && subtotal > 0 ? deliveryFee : null;
  const discountAmount = discount ? Math.min(discount.amount, subtotal) : 0;
  return {
    subtotal,
    deliveryFee: fee,
    discount: discountAmount,
    total: subtotal + (fee ?? 0) - discountAmount,
    itemCount,
  };
}
