"use client";

import { MapPin, Menu, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/ui/logo";
import { primaryNavigation } from "@/config/navigation";
import { useCartUi } from "@/features/cart/cart-ui";
import { useCart } from "@/features/cart/use-cart";
import { useCatalogue } from "@/features/catalogue/catalogue-context";
import { OrderTypeSelector } from "@/features/order/components/order-type-selector";
import { cn } from "@/lib/cn";
import { formatPKR, pluralize } from "@/lib/format";
import { MobileNavigation } from "./mobile-navigation";

/**
 * A dismissible notice above a sticky navigation bar. The notice carries the delivery radius (a rule,
 * not a promotion) and scrolls away with the page; the bar stays docked at the top.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const { count, totals } = useCart();
  const { openCart } = useCartUi();
  const { branch } = useCatalogue();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      {bannerDismissed ? null : (
        <div className="flex h-[var(--banner-h)] items-center bg-gold text-ink">
          <div className="page-container flex w-full items-center justify-between gap-3">
            <p className="flex min-w-0 items-center gap-x-3 text-sm font-medium">
              <span className="truncate">
                Delivery within {branch.deliveryRadiusKm} km of {branch.address.area}. Pickup for everyone else.
              </span>
              <Link href="/contact#delivery-check" className="shrink-0 whitespace-nowrap font-bold underline underline-offset-4">
                Check address
              </Link>
            </p>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              aria-label="Dismiss delivery notice"
              className="-mr-2 grid size-10 shrink-0 place-items-center rounded-lg hover:bg-cream/40"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      <header className="site-header on-dark h-[var(--bar-h)] bg-char text-cream">
        <div className="page-container flex h-full items-center gap-3 lg:gap-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            className="btn btn--ghost btn--icon -ml-2 lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          <Link href="/" aria-label="Food Chain, home" className="rounded-lg">
            <Wordmark tagline={false} className="sm:hidden" />
            <Wordmark className="max-sm:hidden" />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex gap-1">
              {primaryNavigation.map((link) => {
                const current = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "relative inline-flex min-h-11 items-center whitespace-nowrap px-3 text-[0.9375rem] font-semibold transition-colors duration-[var(--dur-micro)]",
                        current ? "text-cream" : "text-fog hover:text-cream",
                        "after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-gold after:transition-opacity",
                        current ? "after:opacity-100" : "after:opacity-0",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex-1" />

          <Link
            href="/contact"
            className="hidden items-center gap-2 whitespace-nowrap text-sm text-fog transition-colors hover:text-cream xl:inline-flex"
          >
            <MapPin className="size-4 text-gold" aria-hidden />
            {branch.address.road}, {branch.address.area}
          </Link>

          <div className="hidden md:block">
            <OrderTypeSelector tone="dark" />
          </div>

          <button
            type="button"
            onClick={openCart}
            aria-haspopup="dialog"
            aria-label={count > 0 ? `Open cart, ${pluralize(count, "item")}, ${formatPKR(totals.total)}` : "Open cart, empty"}
            className="btn btn--primary relative px-4"
          >
            <ShoppingBag className="size-5" aria-hidden />
            <span className="tabular hidden md:inline">{count > 0 ? formatPKR(totals.total) : "Cart"}</span>
            {count > 0 ? (
              <span
                key={count}
                aria-hidden
                className="tick tabular absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-gold px-1 text-xs font-bold leading-5 text-ink"
              >
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      <MobileNavigation open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
