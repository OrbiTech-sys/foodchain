"use client";

import { SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { pluralize } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { setLocationHash, useLocationHash } from "../use-location-hash";
import { CategoryNavigation } from "./category-navigation";
import { ProductGrid } from "./product-grid";

/** Lowercase, punctuation-free text so "B.B.Q" matches "bbq" and "Hot ’N’ Spicy" matches "hot n spicy". */
function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function matchesQuery(product: Product, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const haystack = normalize([product.name, ...(product.keywords ?? [])].join(" "));
  return tokens.every((token) => haystack.includes(token));
}

interface MenuExplorerProps {
  categories: Category[];
  products: Product[];
}

export function MenuExplorer({ categories, products }: MenuExplorerProps) {
  const hash = useLocationHash();
  const [query, setQuery] = useState("");

  const active = categories.some((category) => category.id === hash) ? hash : "all";
  const tokens = useMemo(() => normalize(query).split(" ").filter(Boolean), [query]);

  const searched = useMemo(() => products.filter((product) => matchesQuery(product, tokens)), [products, tokens]);
  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const product of searched) result[product.categoryId] = (result[product.categoryId] ?? 0) + 1;
    return result;
  }, [searched]);

  const sections = useMemo(
    () =>
      categories
        .filter((category) => active === "all" || category.id === active)
        .map((category) => ({ category, items: searched.filter((product) => product.categoryId === category.id) }))
        .filter((section) => section.items.length > 0),
    [categories, searched, active],
  );
  const visibleCount = sections.reduce((sum, section) => sum + section.items.length, 0);

  function selectCategory(id: string) {
    setLocationHash(id === "all" ? "" : id);
    document.getElementById("menu-results")?.scrollIntoView({ block: "start" });
  }

  return (
    <>
      <CategoryNavigation
        categories={categories}
        counts={counts}
        total={searched.length}
        active={active}
        onSelect={selectCategory}
        query={query}
        onQueryChange={setQuery}
      />

      <div id="menu-results" className="page-container space-y-12 py-8 md:py-12">
        <p aria-live="polite" className="text-sm text-muted">
          {tokens.length > 0
            ? `${pluralize(visibleCount, "item")} match “${query.trim()}”`
            : `Showing ${pluralize(visibleCount, "item")}`}
          {active !== "all" ? ` in ${categories.find((category) => category.id === active)?.name}` : ""}
        </p>

        {sections.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={tokens.length > 0 ? `Nothing on the menu matches “${query.trim()}”` : "This section is empty"}
            description={
              tokens.length > 0
                ? "Check the spelling, or search for a flavour such as peri peri, zinger or shawarma."
                : "Pick another category to keep browsing."
            }
            action={
              <div className="flex flex-wrap gap-2">
                {tokens.length > 0 ? <Button onClick={() => setQuery("")}>Clear search</Button> : null}
                {active !== "all" ? (
                  <Button variant="outline" onClick={() => selectCategory("all")}>
                    Show all categories
                  </Button>
                ) : null}
              </div>
            }
          />
        ) : (
          sections.map(({ category, items }, sectionIndex) => (
            <section key={category.id} aria-labelledby={`cat-${category.id}`} className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
                <h2 id={`cat-${category.id}`} className="text-3xl sm:text-4xl">
                  {category.name}
                </h2>
                {category.description ? <p className="text-ink-2">{category.description}</p> : null}
              </div>
              <ProductGrid products={items} eagerCount={sectionIndex === 0 ? 3 : 0} />
            </section>
          ))
        )}
      </div>
    </>
  );
}
