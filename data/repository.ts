import { branch } from "@/config/branch";
import { categories } from "@/data/mock/categories";
import { deals } from "@/data/mock/deals";
import { products } from "@/data/mock/products";
import type { Branch, Catalogue, Category, Deal, Product } from "@/lib/types";

/**
 * The only module the UI uses to read catalogue data.
 *
 * MIGRATION NOTE: to move to PostgreSQL + Drizzle ORM, re-implement these functions against the
 * database (same names, same return types). Pages and components do not import `data/mock/*`.
 * The functions are async on purpose so callers already `await` them.
 */

export async function getCategories(): Promise<Category[]> {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProducts(): Promise<Product[]> {
  return products;
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  return products.filter((product) => product.categoryId === categoryId);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return products.filter((product) => product.featured);
}

export async function getSignatureProducts(): Promise<Product[]> {
  return products.filter((product) => product.signature && product.categoryId === "pizza");
}

export async function getDeals(): Promise<Deal[]> {
  return [...deals].sort((a, b) => a.number - b.number);
}

export async function getBranch(): Promise<Branch> {
  return branch;
}

/** Everything the client-side cart needs to price lines. Provided once from the root layout. */
export async function getCatalogue(): Promise<Catalogue> {
  const [allCategories, allProducts, allDeals, theBranch] = await Promise.all([
    getCategories(),
    getProducts(),
    getDeals(),
    getBranch(),
  ]);
  return { categories: allCategories, products: allProducts, deals: allDeals, branch: theBranch };
}
