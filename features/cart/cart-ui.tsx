"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface CartUiApi {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartUiContext = createContext<CartUiApi | null>(null);

/** Open/closed state of the cart drawer, shared by the header, sticky bar and product dialogs. */
export function CartUiProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, openCart, closeCart }), [isOpen, openCart, closeCart]);
  return <CartUiContext.Provider value={value}>{children}</CartUiContext.Provider>;
}

export function useCartUi(): CartUiApi {
  const value = useContext(CartUiContext);
  if (!value) throw new Error("useCartUi must be used inside <CartUiProvider>.");
  return value;
}
