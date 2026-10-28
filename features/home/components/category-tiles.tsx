import Link from "next/link";
import { FoodImage } from "@/components/ui/food-image";
import { pluralize } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

/** One tile per menu section, linking straight to that section of the menu. */
export function CategoryTiles({ categories, products }: { categories: Category[]; products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-7">
      {categories.map((category) => {
        const count = products.filter((product) => product.categoryId === category.id).length;
        return (
          <li key={category.id} className="min-w-0">
            <Link href={`/menu#${category.id}`} className="group block space-y-3 rounded-3xl">
              <span className="relative block aspect-square overflow-hidden rounded-3xl bg-cream-2 transition-colors duration-[var(--dur-short)] group-hover:bg-cream-3">
                <FoodImage image={category.image} sizes="(min-width: 64rem) 12rem, (min-width: 40rem) 22vw, 45vw" />
              </span>
              <span className="block">
                <span className="block font-display text-xl font-extrabold leading-tight tracking-tight">{category.name}</span>
                <span className="block text-sm text-muted">{pluralize(count, "item")}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
