import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getBranch } from "@/data/repository";
import { BranchInformation } from "@/features/branch/components/branch-information";
import { DeliveryEligibilityChecker } from "@/features/order/components/delivery-eligibility-checker";
import { toWhatsAppUrl } from "@/lib/format";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call Food Chain, get directions to our Rifle Range Road kitchen, or check if we deliver to you.",
};

export default async function ContactPage() {
  const branch = await getBranch();
  const whatsappNumber = siteConfig.contact.whatsappNumber;
  const whatsappUrl = whatsappNumber ? toWhatsAppUrl(whatsappNumber, siteConfig.contact.whatsappMessage) : null;

  return (
    <>
      <PageHeader title="Contact" description="One kitchen and six phone lines. Call to order, ask a question, or check if we deliver to you." />

      <div className="page-container space-y-16 pb-24">
        <div className="space-y-8">
          <BranchInformation branch={branch} />
          {whatsappUrl ? (
            <ButtonLink href={whatsappUrl} target="_blank" rel="noreferrer" variant="outline">
              <MessageCircle className="size-4" aria-hidden />
              Message on WhatsApp
              <span className="sr-only">(opens in a new tab)</span>
            </ButtonLink>
          ) : null}
        </div>

        <section
          id="delivery-check"
          aria-labelledby="delivery-check-heading"
          className="grid gap-8 border-t border-rule pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
        >
          <div className="space-y-3">
            <h2 id="delivery-check-heading" className="text-4xl">
              Can we deliver to you?
            </h2>
            <p className="max-w-sm text-lg text-ink-2">
              Share your location and we’ll measure the straight-line distance to the kitchen against our {branch.deliveryRadiusKm} km radius.
            </p>
          </div>
          <DeliveryEligibilityChecker />
        </section>
      </div>
    </>
  );
}
