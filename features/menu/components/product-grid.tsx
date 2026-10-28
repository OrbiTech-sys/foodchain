import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  /** How many leading cards preload their image. */
  eagerCount?: number;
  /** Desktop column count. Phones show rows, tablets two columns. */
  columns?: 3 | 4;
}

export function ProductGrid({ products, eagerCount = 0, columns = 3 }: ProductGridProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4",
        columns === 4 ? "lg:grid-cols-4" : "xl:grid-cols-3",
      )}
    >
      {products.map((product, index) => (
        <li key={product.id} className="min-w-0">
          <ProductCard product={product} eager={index < eagerCount} />
        </li>
      ))}
    </ul>
  );
}
