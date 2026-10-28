import Image from "next/image";
import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { formatPKR } from "@/lib/format";
import type { Branch } from "@/lib/types";

function heroHeadline(): string {
  const { hours } = siteConfig;
  return hours.verified
    ? `Pizza, burgers and shawarma until ${hours.closesLabel}.`
    : "Pizza, burgers and shawarma from Iqbal Park.";
}

function deliverySentence(): string {
  const fee = siteConfig.ordering.deliveryFee;
  if (fee === null) return "";
  return fee === 0 ? " Delivery is free." : ` Delivery is ${formatPKR(fee)}.`;
}

/** Photographic hero: authentic Food Chain photography cut out from the printed menu, left-biased copy. */
export function HeroSection({ branch }: { branch: Branch }) {
  return (
    <section aria-labelledby="hero-title" className="on-dark relative overflow-hidden bg-char text-cream">
      <div className="page-container grid items-center gap-10 pb-32 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6 lg:pb-36 lg:pt-16">
        <div className="space-y-7">
          <h1 id="hero-title" className="reveal max-w-[14ch] text-display font-extrabold" style={{ "--i": 0 } as CSSProperties}>
            {heroHeadline()}
          </h1>
          <p className="reveal max-w-lg text-lg text-fog sm:text-xl" style={{ "--i": 1 } as CSSProperties}>
            Order for pickup, or for delivery within {branch.deliveryRadiusKm} km of our {branch.address.road} kitchen.
            {deliverySentence()}
          </p>
          <div className="reveal flex flex-wrap gap-3" style={{ "--i": 2 } as CSSProperties}>
            <ButtonLink href="/menu" size="lg">
              Order now
            </ButtonLink>
            <ButtonLink href="#categories" size="lg" variant="outline-light">
              Explore the menu
            </ButtonLink>
          </div>
        </div>

        <div className="reveal relative mx-auto w-full max-w-2xl lg:mr-[-4vw] lg:max-w-none" style={{ "--i": 3 } as CSSProperties}>
          <div className="relative aspect-[1012/712]">
            <Image
              src="/images/menu/hero-cluster.webp"
              alt="A Food Chain pizza, burger and shawarma wrap"
              fill
              preload
              sizes="(min-width: 64rem) 52vw, 100vw"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
