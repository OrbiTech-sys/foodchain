import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CartPageContent } from "@/features/cart/components/cart-page-content";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review the items in your Food Chain cart.",
};

export default function CartPage() {
  return (
    <>
      <PageHeader title="Your cart" description="Edit quantities and customizations here, then go to checkout." />
      <div className="page-container pb-20">
        <CartPageContent />
      </div>
    </>
  );
}
