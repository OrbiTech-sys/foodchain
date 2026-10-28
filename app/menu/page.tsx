import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { getCategories, getProducts } from "@/data/repository";
import { MenuExplorer } from "@/features/menu/components/menu-explorer";
import { DeliveryStatus } from "@/features/order/components/delivery-status";
import { OrderTypeSelector } from "@/features/order/components/order-type-selector";

export const metadata: Metadata = {
  title: "Menu",
  description: "Pizza, burgers, sandwiches, shawarma and paratha from Food Chain in Iqbal Park, Lahore.",
};

export default async function MenuPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <>
      <PageHeader
        title="The menu"
        description="Prices are in Pakistani rupees. Sizes, flavours and extras are chosen when you add an item."
      >
        <div className="flex flex-wrap items-center gap-3">
          <OrderTypeSelector tone="light" />
          <DeliveryStatus className="min-w-0 flex-1 basis-64" />
        </div>
      </PageHeader>
      <MenuExplorer categories={categories} products={products} />
    </>
  );
}
