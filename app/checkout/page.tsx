import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CheckoutExperience } from "@/features/checkout/components/checkout-experience";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout preview for your Food Chain order.",
};

export default function CheckoutPage() {
  return (
    <>
      <PageHeader title="Checkout" description="Choose pickup or delivery, add your details and review. This is a preview, so nothing is sent." />
      <div className="page-container pb-24">
        <CheckoutExperience />
      </div>
    </>
  );
}
