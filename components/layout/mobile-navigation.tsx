"use client";

import { Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "@/components/ui/button";
import { Dialog, DialogCloseButton } from "@/components/ui/dialog";
import { Wordmark } from "@/components/ui/logo";
import { primaryNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { BusinessHours } from "@/features/branch/components/business-hours";
import { DeliveryStatus } from "@/features/order/components/delivery-status";
import { OrderTypeSelector } from "@/features/order/components/order-type-selector";
import { cn } from "@/lib/cn";
import { toTelHref } from "@/lib/format";

/** Slide-in navigation for screens below the desktop breakpoint. Includes the order-type selector. */
export function MobileNavigation({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <Dialog open={open} onClose={onClose} labelledBy="mobile-nav-title" variant="drawer-left">
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-rule px-5 py-4">
          <h2 id="mobile-nav-title" className="sr-only">
            Menu
          </h2>
          <Link href="/" onClick={onClose} aria-label="Food Chain, home">
            <Wordmark tone="light" />
          </Link>
          <DialogCloseButton onClick={onClose} label="Close menu" className="-mr-2" />
        </header>

        <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-5 py-6">
          <nav aria-label="Primary">
            <ul className="divide-y divide-rule border-y border-rule">
              {primaryNavigation.map((link) => {
                const current = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "flex min-h-14 items-center justify-between font-display text-2xl font-extrabold tracking-tight",
                        current ? "text-tomato-deep" : "text-ink",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-3">
            <p className="font-display text-xl font-bold">Order type</p>
            <OrderTypeSelector variant="cards" />
            <DeliveryStatus />
          </div>

          <div className="space-y-3">
            <BusinessHours className="text-ink-2" showNote={false} />
            <a href={toTelHref(siteConfig.contact.primaryPhone)} className={buttonClass({ variant: "dark", className: "w-full" })}>
              <Phone className="size-4" aria-hidden />
              Call {siteConfig.contact.primaryPhone}
            </a>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
