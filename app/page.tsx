import { SectionHeading } from "@/components/layout/section-heading";
import { ButtonLink } from "@/components/ui/button";
import {
  getBranch,
  getCategories,
  getDeals,
  getFeaturedProducts,
  getProducts,
  getSignatureProducts,
} from "@/data/repository";
import { BranchInformation } from "@/features/branch/components/branch-information";
import { DealsGrid } from "@/features/deals/components/deals-grid";
import { CategoryTiles } from "@/features/home/components/category-tiles";
import { HeroSection } from "@/features/home/components/hero-section";
import { OrderTypePanel } from "@/features/home/components/order-type-panel";
import { WhySection } from "@/features/home/components/why-section";
import { DeliveryCheckButton } from "@/features/order/components/delivery-check-dialog";
import { ProductGrid } from "@/features/menu/components/product-grid";

export default async function HomePage() {
  const [branch, categories, products, featured, signature, deals] = await Promise.all([
    getBranch(),
    getCategories(),
    getProducts(),
    getFeaturedProducts(),
    getSignatureProducts(),
    getDeals(),
  ]);

  const mealDeals = deals.filter((deal) => deal.kind === "meal").slice(0, 4);
  const familyDeals = deals.filter((deal) => deal.kind === "family").slice(0, 4);

  return (
    <>
      <HeroSection branch={branch} />
      <OrderTypePanel />

      <section id="categories" aria-labelledby="categories-title" className="page-container pb-6 pt-20 md:pt-24">
        <SectionHeading
          id="categories-title"
          title="Browse the menu"
          description="Seven sections, straight from our printed menu."
          action={
            <ButtonLink href="/menu" variant="outline">
              Open full menu
            </ButtonLink>
          }
        />
        <div className="mt-10">
          <CategoryTiles categories={categories} products={products} />
        </div>
      </section>

      <section aria-labelledby="start-title" className="page-container space-y-14 pb-16 pt-14 md:pb-24 md:pt-20">
        <div className="space-y-8">
          <SectionHeading id="start-title" title="Where to start" description="Four easy first orders." />
          <ProductGrid products={featured} columns={4} />
        </div>
        <div className="space-y-8">
          <SectionHeading
            id="signature-title"
            title="Signature pizzas"
            description="The four specials from our pizza menu, in Personal to Family sizes."
          />
          <ProductGrid products={signature} columns={4} />
        </div>
      </section>

      <section aria-labelledby="deals-title" className="on-dark bg-char text-cream">
        <div className="page-container space-y-14 py-16 md:py-24">
          <SectionHeading
            id="deals-title"
            title="Deals"
            description={`${deals.length} set deals, priced as printed on our 2026 menu.`}
            onDark
            action={
              <ButtonLink href="/deals" variant="outline-light">
                See all {deals.length} deals
              </ButtonLink>
            }
          />
          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl">Meal deals</h3>
            <DealsGrid deals={mealDeals} />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl">Family and group combos</h3>
            <DealsGrid deals={familyDeals} />
          </div>
        </div>
      </section>

      <WhySection branch={branch} dealCount={deals.length} />

      <section aria-labelledby="visit-title" className="border-t border-rule bg-cream-2">
        <div className="page-container space-y-10 py-16 md:py-20">
          <SectionHeading
            id="visit-title"
            title="Find us"
            description="One kitchen on Rifle Range Road. Pick up, or have it brought to you."
            action={<DeliveryCheckButton variant="dark" />}
          />
          <BranchInformation branch={branch} />
        </div>
      </section>
    </>
  );
}
