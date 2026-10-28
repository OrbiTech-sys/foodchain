"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { CartUiProvider } from "@/features/cart/cart-ui";
import { CatalogueProvider } from "@/features/catalogue/catalogue-context";
import { ItemDialogProvider } from "@/features/item/item-dialog";
import type { Catalogue } from "@/lib/types";

/** Client-side context shared by the whole app. Rendered once, from the root layout. */
export function AppProviders({ catalogue, children }: { catalogue: Catalogue; children: ReactNode }) {
  return (
    <CatalogueProvider catalogue={catalogue}>
      <ToastProvider>
        <CartUiProvider>
          <ItemDialogProvider>{children}</ItemDialogProvider>
        </CartUiProvider>
      </ToastProvider>
    </CatalogueProvider>
  );
}
