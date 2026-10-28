import type { Customization, Product, ProductImage } from "@/lib/types";

/**
 * SAMPLE DATA — prices and names transcribed from the printed "New Menu 2026".
 * Anything marked ASSUMPTION is an interpretation of the print and must be confirmed by the owner.
 * Product photos are HD placeholder photographs (Pexels) chosen to match each item. They are not Food Chain's own food,
 * so replace them with owner-supplied photography. Combo shots are collages with the bottle size printed on them.
 */

const hd = (file: string, alt: string, kind: ProductImage["kind"] = "photo"): ProductImage => ({
  src: `/images/hd/${file}`,
  alt,
  kind,
  source: "sample",
});

const samplePizza = (name: string, alt: string): ProductImage => ({
  src: `/images/sample/pizza-${name}.jpg`,
  alt,
  kind: "photo",
  source: "sample",
});

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* ───────── Pizza building blocks ───────── */

const PIZZA_SIZES = [
  { id: "personal", label: "Personal", inches: 7 },
  { id: "medium", label: "Medium", inches: 10 },
  { id: "large", label: "Large", inches: 13 },
  { id: "family", label: "Family", inches: 16 },
] as const;

/** Builds a required size group. The first price becomes the product base price (delta 0). */
function pizzaSizeGroup(prices: readonly number[], descriptions: readonly (string | undefined)[] = []): Customization {
  return {
    id: "size",
    kind: "size",
    label: "Size",
    selection: "single",
    required: true,
    requiredMessage: "Choose a size to continue.",
    options: PIZZA_SIZES.map((size, index) => ({
      id: size.id,
      label: `${size.label} · ${size.inches}″`,
      description: descriptions[index],
      priceDelta: prices[index] - prices[0],
    })),
  };
}

/** Printed menu: "Extra Topping — For 1 Pizza". Prices rise with pizza size. */
const extraToppings: Customization = {
  id: "extra-toppings",
  kind: "topping",
  label: "Extra toppings",
  helpText: "Priced per pizza and by size.",
  selection: "multiple",
  required: false,
  options: [
    {
      id: "extra-chicken",
      label: "Extra chicken",
      priceDelta: 0,
      priceDeltaBySize: { personal: 250, medium: 350, large: 450, family: 550 },
    },
    {
      id: "extra-cheese",
      label: "Extra cheese",
      priceDelta: 0,
      priceDeltaBySize: { personal: 300, medium: 400, large: 550, family: 650 },
    },
  ],
};

/** Printed menu: "Cold Drink — H.L 120/-, 1.5L 220/-, 2.25L 300/-". */
const drinkAddOn: Customization = {
  id: "cold-drink",
  kind: "drink",
  label: "Add a cold drink",
  selection: "single",
  required: false,
  options: [
    { id: "drink-hl", label: "Half litre", priceDelta: 120 },
    { id: "drink-1-5", label: "1.5 litre", priceDelta: 220 },
    { id: "drink-2-25", label: "2.25 litre", priceDelta: 300 },
  ],
};

type PizzaTier = "chicken" | "special" | "non-chicken";

/** Printed menu "Single Pizza" price rows: Personal / Medium / Large / Family. */
const SINGLE_PIZZA_PRICES: Record<PizzaTier, readonly number[]> = {
  chicken: [750, 1450, 2000, 2600],
  special: [950, 1800, 2250, 2850],
  "non-chicken": [650, 1150, 1500, 2000],
};

interface PizzaFlavour {
  name: string;
  ingredients: string;
  /** ASSUMPTION: the print lists price rows by tier but not which flavour belongs to which row. */
  tier: PizzaTier;
  image: ProductImage;
  signature?: boolean;
  keywords?: string[];
}

const pizzaFlavours: PizzaFlavour[] = [
  {
    name: "Peri Peri",
    ingredients: "Chicken slice, quality cheese, tomato, bell pepper, black olive.",
    tier: "chicken",
    image: samplePizza("chicken-onion", "Sample photo of a chicken pizza with onions"),
  },
  {
    name: "Chicken Tikka",
    ingredients: "Chicken, quality cheese, black olive, bell pepper, tomato, onion, green chilli.",
    tier: "chicken",
    image: samplePizza("chicken-wood", "Sample photo of a topped pizza on a wooden board"),
  },
  {
    name: "Malai Boti",
    ingredients: "Chicken, malai sauce, quality cheese, bell pepper, onion, tomato, black olive.",
    tier: "chicken",
    image: samplePizza("golden-cheese", "Sample photo of a golden baked cheese pizza"),
  },
  {
    name: "Solomio",
    ingredients: "Chicken, cheese, bell pepper, tomato, mushroom, black olive.",
    tier: "chicken",
    image: samplePizza("mushroom-onion", "Sample photo of a mushroom and onion pizza"),
  },
  {
    name: "Shawarma",
    ingredients: "Chicken, quality cheese, shawarma sauce, shawarma salad and more.",
    tier: "chicken",
    image: samplePizza("loaded-board", "Sample photo of a loaded pizza on a serving board"),
  },
  {
    name: "Mediterranean",
    ingredients: "Chicken, cheese, onion, tomato, sweet corn, black olive.",
    tier: "chicken",
    image: samplePizza("herb-slices", "Sample photo of pizza slices with tomato and herbs"),
  },
  {
    name: "Pickle",
    ingredients: "Chicken, quality cheese, onion, green chilli, pickle, olives, bell pepper.",
    tier: "chicken",
    image: samplePizza("chicken-wood", "Sample photo of a topped pizza on a wooden board"),
  },
  {
    name: "Sicilian",
    ingredients: "Chicken, olives, mushroom, bell pepper, tomato, jalapeño.",
    tier: "chicken",
    image: samplePizza("mushroom-onion", "Sample photo of a mushroom and onion pizza"),
  },
  {
    name: "Mexican",
    ingredients: "Mexican chicken, onion, green chilli, tomato, bell pepper, sweet corn, jalapeño.",
    tier: "chicken",
    image: samplePizza("loaded-board", "Sample photo of a loaded pizza on a serving board"),
  },
  {
    name: "Chicken Tandoori",
    ingredients: "Tandoori chicken, mushroom, quality cheese, green chilli.",
    tier: "chicken",
    image: samplePizza("chicken-onion", "Sample photo of a chicken pizza with onions"),
    keywords: ["tandoori"],
  },
  {
    name: "B.B.Q",
    ingredients: "Chicken, cheese, onion.",
    tier: "chicken",
    image: samplePizza("chicken-wood", "Sample photo of a topped pizza on a wooden board"),
    keywords: ["bbq", "barbecue"],
  },
  {
    name: "Chicken Fajita",
    ingredients: "Chicken, quality cheese, black olives, bell pepper, tomato, onion.",
    tier: "chicken",
    image: samplePizza("golden-cheese", "Sample photo of a golden baked cheese pizza"),
    keywords: ["fajita"],
  },
  {
    name: "Hot ’N’ Spicy",
    ingredients: "Chicken, quality cheese, bell pepper, tomato, onion, sweet corn.",
    tier: "chicken",
    image: samplePizza("loaded-board", "Sample photo of a loaded pizza on a serving board"),
    keywords: ["hot n spicy", "hot and spicy"],
  },
  {
    name: "Pepperoni",
    ingredients: "Quality cheese, pepperoni.",
    tier: "non-chicken",
    image: samplePizza("pepperoni-olives", "Sample photo of a pepperoni and olive pizza"),
  },
  {
    name: "Margherita",
    ingredients: "Quality standard cheese, sauce.",
    tier: "non-chicken",
    image: samplePizza("margherita", "Sample photo of a margherita pizza with basil"),
  },
  {
    name: "Veggie",
    ingredients: "Quality cheese, bell pepper, sweet corn, mushrooms, black olives, onion, tomato.",
    tier: "non-chicken",
    image: samplePizza("herb-slices", "Sample photo of pizza slices with tomato and herbs"),
    keywords: ["vegetable", "vegetarian"],
  },
  {
    name: "Cheesy Edge",
    ingredients: "Edge filled with quality cheese, chicken, black olives, tomato, onion and more.",
    tier: "special",
    signature: true,
    image: samplePizza("golden-cheese", "Sample photo of a golden baked cheese pizza"),
  },
  {
    name: "Kabab Crust",
    ingredients: "Special kabab B.B.Q chicken, cheese, black olives, bell pepper, tomato, onion and more.",
    tier: "special",
    signature: true,
    image: samplePizza("chicken-wood", "Sample photo of a topped pizza on a wooden board"),
    keywords: ["kebab"],
  },
  {
    name: "Food Chain Supreme",
    ingredients: "Chicken, quality cheese, black olives, bell pepper, pepperoni, mushrooms, tomato, sweet corn.",
    tier: "special",
    signature: true,
    image: samplePizza("sausage-supreme", "Sample photo of a supreme pizza with sausage and olives"),
    keywords: ["supreme", "fc supreme"],
  },
  {
    name: "Pizza ’O’ Sago",
    ingredients: "Chicken, quality cheese, quality sausages, black olives, bell pepper, tomato.",
    tier: "special",
    signature: true,
    image: samplePizza("pepperoni-olives", "Sample photo of a pepperoni and olive pizza"),
    keywords: ["sago", "pizza o sago"],
  },
];

const singlePizzas: Product[] = pizzaFlavours.map((flavour) => ({
  id: `pizza-${slug(flavour.name)}`,
  name: `${flavour.name} Pizza`,
  description: flavour.ingredients,
  categoryId: "pizza",
  basePrice: SINGLE_PIZZA_PRICES[flavour.tier][0],
  image: flavour.image,
  signature: flavour.signature,
  keywords: flavour.keywords,
  customizations: [pizzaSizeGroup(SINGLE_PIZZA_PRICES[flavour.tier]), extraToppings, drinkAddOn],
}));

/* ───────── Two-pizza combos ───────── */

/** Printed menu: "Complementary cold drink — Medium 1.5 Ltr · Large 1.5 Ltr · Family 2.25 Ltr". */
const twoPizzaDrinkNotes = [undefined, "Includes a 1.5 L cold drink", "Includes a 1.5 L cold drink", "Includes a 2.25 L cold drink"];

function flavourGroup(id: string, label: string, names: string[]): Customization {
  return {
    id,
    kind: "flavour",
    label,
    selection: "single",
    required: true,
    requiredMessage: `Choose a flavour for ${label.toLowerCase()}.`,
    options: names.map((name) => ({ id: slug(name), label: name, priceDelta: 0 })),
  };
}

const regularTwoPizzaFlavours = [
  "Peri Peri",
  "Malai Boti",
  "Chicken Tikka",
  "Solomio",
  "Shawarma",
  "Chicken Tandoori",
  "Mediterranean",
  "B.B.Q",
  "Pepperoni",
  "Chicken Fajita",
  "Pickle",
  "Hot ’N’ Spicy",
  "Sicilian",
  "Mexican",
];

const specialTwoPizzaFlavours = ["Cheesy Edge", "Kabab Crust", "Food Chain Supreme", "Pizza ’O’ Sago"];

const twoPizzas: Product[] = [
  {
    id: "two-pizzas",
    name: "Two Pizzas",
    description: "Any two flavours from the list, both at the size you pick. A cold drink comes with Medium, Large and Family.",
    categoryId: "two-pizzas",
    basePrice: 1400,
    image: samplePizza("loaded-board", "Sample photo of a loaded pizza on a serving board"),
    featured: true,
    keywords: ["two pizza", "2 pizzas", "pair", "combo"],
    customizations: [
      pizzaSizeGroup([1400, 2500, 3400, 4500], twoPizzaDrinkNotes),
      flavourGroup("pizza-1", "Pizza 1", regularTwoPizzaFlavours),
      flavourGroup("pizza-2", "Pizza 2", regularTwoPizzaFlavours),
    ],
  },
  {
    id: "special-two-pizzas",
    name: "Special Two Pizzas",
    description: "Two of our special pizzas at one size. A cold drink comes with Medium, Large and Family.",
    categoryId: "two-pizzas",
    basePrice: 1650,
    image: samplePizza("sausage-supreme", "Sample photo of a supreme pizza with sausage and olives"),
    signature: true,
    keywords: ["special two pizza", "cheesy edge", "kabab crust", "supreme", "sago"],
    customizations: [
      pizzaSizeGroup([1650, 3050, 4000, 5000], twoPizzaDrinkNotes),
      flavourGroup("pizza-1", "Pizza 1", specialTwoPizzaFlavours),
      flavourGroup("pizza-2", "Pizza 2", specialTwoPizzaFlavours),
    ],
  },
  {
    // ASSUMPTION: the print shows this price row in a highlighted box under "Two Pizza's"; the
    // complementary-drink header is assumed to apply to it as well.
    id: "two-pizzas-margherita-veggie",
    name: "Two Pizzas · Margherita & Veggie",
    description: "Margherita and Veggie, in any mix of the two, at one size.",
    categoryId: "two-pizzas",
    basePrice: 1200,
    image: samplePizza("margherita", "Sample photo of a margherita pizza with basil"),
    keywords: ["margherita", "veggie", "vegetarian"],
    customizations: [
      pizzaSizeGroup([1200, 2080, 2700, 3600], twoPizzaDrinkNotes),
      flavourGroup("pizza-1", "Pizza 1", ["Margherita", "Veggie"]),
      flavourGroup("pizza-2", "Pizza 2", ["Margherita", "Veggie"]),
    ],
  },
];

/* ───────── Burgers ───────── */

const burgers: Product[] = [
  {
    id: "chicken-burger",
    name: "Chicken Burger with Fries",
    description: "Chicken burger served with fries.",
    categoryId: "burgers",
    basePrice: 490,
    image: hd("chicken-burger.jpg", "A crispy chicken burger with fries"),
    customizations: [],
  },
  {
    id: "chicken-burger-coke",
    name: "Chicken Burger + Coke",
    description: "Chicken burger with a 500 ml Coke.",
    categoryId: "burgers",
    basePrice: 550,
    image: hd("chicken-burger-coke.webp", "A chicken burger with fries next to a bottle of Coke", "collage"),
    keywords: ["500ml coke"],
    customizations: [],
  },
  {
    id: "zinger-burger",
    name: "Zinger Burger",
    description: "Zinger burger, ordered on its own.",
    categoryId: "burgers",
    basePrice: 590,
    image: hd("zinger-burger.jpg", "A crispy chicken zinger-style burger with fries"),
    featured: true,
    customizations: [],
  },
  {
    id: "chicken-grill-burger",
    name: "Chicken Grill Burger",
    description: "Chicken grill burger, ordered on its own.",
    categoryId: "burgers",
    basePrice: 600,
    image: hd("chicken-grill-burger.jpg", "A chicken burger on a sesame bun with fries"),
    customizations: [],
  },
  {
    id: "breast-grill-burger",
    name: "Breast Grill Burger",
    description: "Chicken breast grill burger, ordered on its own.",
    categoryId: "burgers",
    basePrice: 620,
    image: hd("breast-grill-burger.jpg", "A chicken breast burger with lettuce and fries"),
    customizations: [],
  },
  {
    id: "beef-grill-burger",
    name: "Beef Grill Burger",
    description: "Beef grill burger, ordered on its own.",
    categoryId: "burgers",
    basePrice: 670,
    image: hd("beef-grill-burger.jpg", "A beef burger with melted cheese and fries"),
    customizations: [],
  },
  {
    id: "zinger-burger-pizza",
    name: "Zinger Burger Pizza",
    description: "Zinger burger pizza with a 500 ml Coke.",
    categoryId: "burgers",
    basePrice: 790,
    image: hd("zinger-burger-pizza.webp", "A pizza and a crispy chicken burger next to a bottle of Coke", "collage"),
    keywords: ["500ml coke"],
    customizations: [],
  },
];

/* ───────── Sandwiches ───────── */

// The print lists eleven sandwiches at one price (550/-). They are one product with a required flavour choice.
const sandwichFlavours = [
  "Chicken",
  "Club",
  "Breast",
  "Malai Boti",
  "Chilli Malai",
  "Garlic",
  "Peri Peri",
  "Chilli Garlic",
  "Mexican",
  "Fajita",
  "Tikka",
];

const sandwiches: Product[] = [
  {
    id: "sandwich",
    name: "Sandwich",
    description: "Eleven flavours, all at one price. Pick yours below.",
    categoryId: "sandwiches",
    basePrice: 550,
    image: hd("sandwich.jpg", "A sandwich with lettuce, tomato and chicken"),
    featured: true,
    keywords: sandwichFlavours.map((flavour) => `${flavour} sandwich`),
    customizations: [flavourGroup("flavour", "Flavour", sandwichFlavours)],
  },
];

/* ───────── Shawarma ───────── */

const shawarma: Product[] = [
  {
    id: "shawarma",
    name: "Shawarma",
    description: "Choose your filling. Add cheese, extra bread or sauce if you like.",
    categoryId: "shawarma",
    basePrice: 350,
    image: hd("shawarma.jpg", "Chicken shawarma wraps cut in half"),
    featured: true,
    keywords: ["chicken shawarma", "zinger shawarma", "mushroom shawarma", "black olive shawarma", "cheese shawarma"],
    customizations: [
      {
        id: "style",
        kind: "flavour",
        label: "Filling",
        selection: "single",
        required: true,
        requiredMessage: "Choose a filling to continue.",
        options: [
          { id: "chicken", label: "Chicken", priceDelta: 0 },
          { id: "zinger", label: "Zinger", priceDelta: 120 },
          { id: "mushroom", label: "Chicken mushroom", priceDelta: 80 },
          { id: "black-olive", label: "Chicken black olive", priceDelta: 80 },
          { id: "cheese", label: "Chicken cheese", priceDelta: 80 },
        ],
      },
      {
        id: "shawarma-extras",
        kind: "extra",
        label: "Extras",
        selection: "multiple",
        required: false,
        options: [
          { id: "extra-cheese", label: "Extra cheese", priceDelta: 100 },
          { id: "extra-bread", label: "Extra bread", priceDelta: 50 },
          { id: "shawarma-sauce", label: "Shawarma sauce", priceDelta: 150 },
        ],
      },
    ],
  },
  {
    id: "fc-shawarma-platter",
    name: "FC Shawarma Platter",
    description: "The Food Chain shawarma platter.",
    categoryId: "shawarma",
    basePrice: 850,
    image: hd("shawarma-platter.jpg", "Sliced shawarma with fries and pickles on a board"),
    keywords: ["platter"],
    customizations: [],
  },
];

/* ───────── Paratha ───────── */

const paratha: Product[] = [
  {
    id: "paratha-pizza",
    name: "Paratha Pizza",
    description: "Pizza on a paratha base.",
    categoryId: "paratha",
    basePrice: 600,
    image: hd("paratha-pizza.jpg", "A cheese-topped flatbread on a wooden plate"),
    customizations: [],
  },
  {
    id: "shawarma-paratha",
    name: "Shawarma Paratha",
    description: "Shawarma wrapped in paratha.",
    categoryId: "paratha",
    basePrice: 350,
    image: hd("shawarma-paratha.jpg", "Shawarma wraps on a slate board"),
    customizations: [],
  },
];

/* ───────── Extras ───────── */

const extras: Product[] = [
  {
    id: "mineral-water",
    name: "Mineral Water",
    description: "Small or large bottle.",
    categoryId: "extras",
    basePrice: 70,
    image: hd("mineral-water.jpg", "Two plastic bottles of mineral water"),
    keywords: ["water", "drink"],
    customizations: [
      {
        id: "size",
        kind: "size",
        label: "Size",
        selection: "single",
        required: true,
        requiredMessage: "Choose a bottle size to continue.",
        options: [
          { id: "small", label: "Small", priceDelta: 0 },
          { id: "large", label: "Large", priceDelta: 50 },
        ],
      },
    ],
  },
  {
    id: "extra-bread",
    name: "Extra Bread",
    description: "An extra bread for your shawarma.",
    categoryId: "extras",
    basePrice: 50,
    image: hd("extra-bread.jpg", "A stack of warm flatbread"),
    customizations: [],
  },
  {
    id: "extra-cheese",
    name: "Extra Cheese",
    description: "Extra cheese for your shawarma.",
    categoryId: "extras",
    basePrice: 100,
    image: hd("extra-cheese.jpg", "Cubes and slices of cheddar cheese on a board"),
    customizations: [],
  },
  {
    id: "shawarma-sauce",
    name: "Shawarma Sauce",
    description: "Shawarma sauce on the side.",
    categoryId: "extras",
    basePrice: 150,
    image: hd("shawarma-sauce.jpg", "Small bowls of dipping sauces"),
    customizations: [],
  },
];

export const products: Product[] = [
  ...singlePizzas,
  ...twoPizzas,
  ...burgers,
  ...sandwiches,
  ...shawarma,
  ...paratha,
  ...extras,
];
