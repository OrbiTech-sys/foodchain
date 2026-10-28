import type { Deal, ProductImage } from "@/lib/types";

/**
 * SAMPLE DATA — Deals 1–16 transcribed from the printed "New Menu 2026".
 * Deal images are collages of HD placeholder photos, one tile per item in the deal, with quantities and
 * bottle sizes printed on the tiles (see the README). Replace with owner photography.
 * The print shows one price per deal. There are no original prices, savings or validity dates,
 * so none are shown. Add `originalPrice` / `validity` only when the owner supplies real values.
 */

const dealImage = (number: number, name: string, includes: Deal["includes"]): ProductImage => ({
  src: `/images/hd/deal-${String(number).padStart(2, "0")}.webp`,
  alt: `${name}: ${includes.map((entry) => entry.label).join(", ")}`,
  kind: "collage",
  source: "sample",
});

const PIZZA_FLAVOUR_PROMPT = "Which pizza flavour would you like? The restaurant will confirm it with you.";

function deal(
  number: number,
  price: number,
  kind: Deal["kind"],
  includes: Deal["includes"],
  notePrompt?: string,
): Deal {
  const name = `Deal ${number}`;
  return { id: `deal-${number}`, number, name, price, kind, includes, image: dealImage(number, name, includes), notePrompt };
}

export const deals: Deal[] = [
  deal(1, 650, "meal", [{ label: "Zinger Burger with Fries" }, { label: "500 ml Coke" }]),
  deal(2, 660, "meal", [{ label: "Chicken Grill Patty Burger with Fries" }, { label: "500 ml Coke" }]),
  deal(3, 680, "meal", [{ label: "Chicken Breast Grill Burger with Fries" }, { label: "500 ml Coke" }]),
  deal(4, 730, "meal", [{ label: "Beef Grill Burger with Fries" }, { label: "500 ml Coke" }]),
  deal(5, 970, "meal", [{ label: "Chicken Shawarma" }, { label: "Zinger Burger" }, { label: "500 ml Coke" }]),
  deal(6, 1070, "meal", [{ label: "Zinger Burger" }, { label: "Zinger Shawarma" }, { label: "500 ml Coke" }]),
  deal(
    7,
    1350,
    "meal",
    [{ label: "Small Pizza" }, { label: "Chicken Grill Burger" }, { label: "500 ml Coke" }],
    PIZZA_FLAVOUR_PROMPT,
  ),
  deal(
    8,
    1450,
    "meal",
    [{ label: "Small Pizza" }, { label: "Beef Grill Burger" }, { label: "500 ml Coke" }],
    PIZZA_FLAVOUR_PROMPT,
  ),
  deal(9, 1900, "family", [
    { label: "Zinger Burger" },
    { label: "Zinger Shawarma" },
    { label: "Chicken Shawarma" },
    { label: "Chicken Burger" },
    { label: "1.5 L Coke" },
  ]),
  deal(10, 2300, "family", [
    { label: "Zinger Burger" },
    { label: "Chicken Grill Burger" },
    { label: "Beef Grill Burger" },
    { label: "Chicken Burger" },
    { label: "Fries" },
    { label: "1.5 L Coke" },
  ]),
  deal(11, 2350, "family", [{ label: "Chicken Grill Patty Burger with Fries", quantity: 4 }, { label: "1.5 L Coke" }]),
  deal(12, 3300, "family", [{ label: "Zinger Burger with Fries", quantity: 6 }, { label: "1.5 L Coke" }]),
  deal(13, 2350, "family", [{ label: "Zinger Burger with Fries", quantity: 4 }, { label: "1.5 L Coke" }]),
  deal(14, 2450, "family", [{ label: "Breast Grill Burger with Fries", quantity: 4 }, { label: "1.5 L Coke" }]),
  deal(
    15,
    1550,
    "family",
    [{ label: "Sandwich with Fries", quantity: 3 }, { label: "500 ml Coke" }],
    "Which sandwich flavours would you like? The restaurant will confirm them with you.",
  ),
  deal(
    16,
    1450,
    "meal",
    [{ label: "Paratha Pizza" }, { label: "Shawarma Paratha with Fries & Salad" }, { label: "500 ml Coke" }],
  ),
];
