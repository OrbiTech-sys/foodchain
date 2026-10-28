"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Catalogue } from "@/lib/types";

const CatalogueContext = createContext<Catalogue | null>(null);

/**
 * Hands the catalogue (loaded on the server through data/repository.ts) to client components that
 * need to price cart lines. In a real build the cart would be priced on the server instead.
 */
export function CatalogueProvider({ catalogue, children }: { catalogue: Catalogue; children: ReactNode }) {
  return <CatalogueContext.Provider value={catalogue}>{children}</CatalogueContext.Provider>;
}

export function useCatalogue(): Catalogue {
  const value = useContext(CatalogueContext);
  if (!value) throw new Error("useCatalogue must be used inside <CatalogueProvider>.");
  return value;
}
