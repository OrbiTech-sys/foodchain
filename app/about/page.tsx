import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { aboutContent } from "@/config/content";
import { siteConfig } from "@/config/site";
import { getBranch, getCategories, getDeals } from "@/data/repository";
import { BusinessHours } from "@/features/branch/components/business-hours";
import { formatBranchAddress } from "@/lib/geo";

export const metadata: Metadata = {
  title: "About",
  description: "Food Chain is a pizza and fast-food restaurant on Rifle Range Road, New Iqbal Park, Lahore.",
};

export default async function AboutPage() {
  const [branch, categories, deals] = await Promise.all([getBranch(), getCategories(), getDeals()]);

  return (
    <>
      <PageHeader title={aboutContent.title} description={aboutContent.intro} />

      <div className="page-container grid gap-12 pb-24 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
        <div className="space-y-6 text-lg text-ink-2">
          {aboutContent.paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-prose">
              {paragraph}
            </p>
          ))}
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href="/menu" size="lg">
              See the menu
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="outline">
              Contact and directions
            </ButtonLink>
          </div>
        </div>

        <section aria-labelledby="glance-title" className="space-y-4">
          <h2 id="glance-title" className="text-3xl">
            At a glance
          </h2>
          <dl className="divide-y divide-rule border-y border-rule">
            <Row label="Branch">{branch.name}, the only one</Row>
            <Row label="Address">{formatBranchAddress(branch)}</Row>
            <Row label="Hours">
              <BusinessHours />
            </Row>
            <Row label="Delivery">
              Within {branch.deliveryRadiusKm} km of the kitchen
              {siteConfig.ordering.deliveryFee === 0 ? ", free" : ""}
            </Row>
            <Row label="Pickup">Available to everyone</Row>
            <Row label="On the menu">
              {categories.map((category) => category.name).join(", ")}, and {deals.length} deals
            </Row>
          </dl>
        </section>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-4">
      <dt className="font-semibold text-ink-2">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
