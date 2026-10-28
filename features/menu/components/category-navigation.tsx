"use client";

import { Search, X } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";

interface CategoryNavigationProps {
  categories: Category[];
  /** Number of items per category for the current search. */
  counts: Record<string, number>;
  total: number;
  active: string;
  onSelect: (categoryId: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

/** Sticky horizontal category chips plus a name search. Chips filter the grid below. */
export function CategoryNavigation({
  categories,
  counts,
  total,
  active,
  onSelect,
  query,
  onQueryChange,
}: CategoryNavigationProps) {
  const searchId = useId();
  const chips = [{ id: "all", name: "All", count: total }, ...categories.map((c) => ({ id: c.id, name: c.name, count: counts[c.id] ?? 0 }))];

  return (
    <div className="sticky-below-header border-b border-rule bg-cream">
      <div className="page-container flex flex-col gap-3 py-3 md:flex-row md:items-center md:gap-6">
        <nav aria-label="Menu categories" className="no-scrollbar -mx-4 min-w-0 flex-1 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
          <ul className="flex w-max gap-2">
            {chips.map((chip) => {
              const isActive = active === chip.id;
              return (
                <li key={chip.id}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => onSelect(chip.id)}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-[0.9375rem] font-semibold transition-colors duration-[var(--dur-micro)]",
                      isActive
                        ? "border-char bg-char text-cream"
                        : "border-rule bg-card text-ink hover:border-ink",
                    )}
                  >
                    {chip.name}
                    <span className={cn("tabular text-sm font-medium", isActive ? "text-fog" : "text-muted")}>{chip.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div role="search" className="relative md:w-72 md:shrink-0">
          <label htmlFor={searchId} className="sr-only">
            Search the menu by name
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by name, e.g. peri peri"
            autoComplete="off"
            className="input pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-2 hover:bg-cream-3"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
