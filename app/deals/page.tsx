import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/layout/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getDeals } from "@/data/repository";
import { DealsGrid } from "@/features/deals/components/deals-grid";

export const metadata: Metadata = {
  title: "Deals",
  description: "Set meals and family combos from Food Chain, priced as printed on the New Menu 2026.",
};

export default async function DealsPage() {
  const deals = await getDeals();
  const mealDeals = deals.filter((deal) => deal.kind === "meal");
  const familyDeals = deals.filter((deal) => deal.kind === "family");

  return (
    <>
      <div className="on-dark bg-char text-cream">
        <PageHeader
          onDark
          title="Deals"
          description={`${deals.length} set deals from ${siteConfig.menuSource}. Each deal has one price. The menu doesn’t list savings or end dates, so none are shown.`}
        />
        <section aria-labelledby="meal-deals-title" className="page-container space-y-6 pb-16 md:pb-24">
          <SectionHeading
            id="meal-deals-title"
            title="Meal deals"
            description="A main, a drink and, for some, fries."
            onDark
          />
          <DealsGrid deals={mealDeals} eagerCount={4} />
        </section>
      </div>

      <section aria-labelledby="family-deals-title" className="page-container space-y-6 py-16 md:py-24">
        <SectionHeading
          id="family-deals-title"
          title="Family and group combos"
          description="Four to six burgers with a 1.5 L Coke, mixed platters and a sandwich share."
        />
        <DealsGrid deals={familyDeals} />
      </section>

      <section className="border-t border-rule bg-cream-2">
        <div className="page-container flex flex-wrap items-center justify-between gap-4 py-10">
          <p className="max-w-xl text-lg text-ink-2">Want something that isn’t on the list? The full menu has every pizza, burger and wrap.</p>
          <ButtonLink href="/menu" variant="dark">
            Open full menu
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
