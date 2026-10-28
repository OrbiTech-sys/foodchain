import { siteConfig } from "@/config/site";
import type { Branch } from "@/lib/types";

interface Fact {
  title: string;
  body: string;
}

/** Every line here is backed by the printed menu or the delivery rules. No ratings, counts or awards are claimed. */
function buildFacts(branch: Branch, dealCount: number): Fact[] {
  const { hours, ordering } = siteConfig;
  const facts: Fact[] = [];

  if (hours.verified) {
    facts.push({
      title: `Open ${hours.label}`,
      body: "Pizza, burgers and shawarma after the dinner rush, as printed on our 2026 menu.",
    });
  }

  facts.push({
    title:
      ordering.deliveryFee === 0
        ? `Free delivery within ${branch.deliveryRadiusKm} km`
        : `Delivery within ${branch.deliveryRadiusKm} km`,
    body: `Measured as a straight line from our ${branch.address.road} kitchen. Beyond that, pickup is always available.`,
  });

  facts.push({
    title: "One kitchen, one menu",
    body: `Pizza, burgers, sandwiches, shawarma and paratha, plus ${dealCount} set deals.`,
  });

  facts.push({
    title: "Your choice at checkout",
    body: "Switch between pickup and delivery any time. We confirm delivery addresses before dispatch.",
  });

  return facts;
}

export function WhySection({ branch, dealCount }: { branch: Branch; dealCount: number }) {
  const facts = buildFacts(branch, dealCount);

  return (
    <section aria-labelledby="why-title" className="page-container py-16 md:py-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="space-y-3 lg:sticky lg:top-[calc(var(--header-visible)+2rem)] lg:self-start">
          <h2 id="why-title" className="text-4xl sm:text-5xl">
            Why people order from us
          </h2>
          <p className="max-w-sm text-lg text-ink-2">
            Plain facts about how Food Chain works, taken from our menu and delivery rules.
          </p>
        </div>

        <ul className="divide-y divide-rule border-y border-rule">
          {facts.map((fact) => (
            <li key={fact.title} className="grid gap-1 py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-8">
              <h3 className="text-2xl">{fact.title}</h3>
              <p className="text-ink-2">{fact.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
