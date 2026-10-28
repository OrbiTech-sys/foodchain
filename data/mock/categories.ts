import type { Category } from "@/lib/types";

/**
 * SAMPLE DATA — categories follow the sections of the printed "New Menu 2026".
 * Replace this module (or the repository that reads it) with owner-approved data.
 */
export const categories: Category[] = [
  {
    id: "pizza",
    name: "Pizza",
    description: "Single pizzas in four sizes.",
    image: {
      src: "/images/menu/pizza.webp",
      alt: "A Food Chain pizza topped with tomato, olives and peppers",
      kind: "packshot",
      source: "menu-scan",
    },
    sortOrder: 1,
  },
  {
    id: "two-pizzas",
    name: "Two Pizzas",
    description: "Pick two flavours at one size.",
    image: {
      src: "/images/sample/pizza-loaded-board.jpg",
      alt: "Sample photo of a loaded pizza on a serving board",
      kind: "photo",
      source: "sample",
    },
    sortOrder: 2,
  },
  {
    id: "burgers",
    name: "Burgers",
    description: "Zinger, grill and chicken burgers.",
    image: {
      src: "/images/hd/zinger-burger.jpg",
      alt: "A crispy chicken burger with fries",
      kind: "photo",
      source: "sample",
    },
    sortOrder: 3,
  },
  {
    id: "sandwiches",
    name: "Sandwiches",
    description: "Eleven flavours, one price.",
    image: {
      src: "/images/hd/sandwich.jpg",
      alt: "A sandwich with lettuce, tomato and chicken",
      kind: "photo",
      source: "sample",
    },
    sortOrder: 4,
  },
  {
    id: "shawarma",
    name: "Shawarma",
    description: "Wraps and the FC platter.",
    image: {
      src: "/images/hd/shawarma.jpg",
      alt: "Chicken shawarma wraps cut in half",
      kind: "photo",
      source: "sample",
    },
    sortOrder: 5,
  },
  {
    id: "paratha",
    name: "Paratha",
    description: "Paratha pizza and shawarma paratha.",
    image: {
      src: "/images/hd/paratha-pizza.jpg",
      alt: "A cheese-topped flatbread on a wooden plate",
      kind: "photo",
      source: "sample",
    },
    sortOrder: 6,
  },
  {
    id: "extras",
    name: "Extras & Drinks",
    description: "Water, bread, sauce and cheese.",
    image: {
      src: "/images/hd/mineral-water.jpg",
      alt: "Two plastic bottles of mineral water",
      kind: "photo",
      source: "sample",
    },
    sortOrder: 7,
  },
];
