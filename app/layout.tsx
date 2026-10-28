import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StickyCartBar } from "@/features/cart/components/sticky-cart-bar";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { siteConfig } from "@/config/site";
import { getCatalogue } from "@/data/repository";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} · ${siteConfig.tagline} in Iqbal Park, Lahore`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const catalogue = await getCatalogue();

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geist.variable} ${bricolage.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AppProviders catalogue={catalogue}>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <StickyCartBar />
          <WhatsAppButton />
          <CartDrawer />
        </AppProviders>
      </body>
    </html>
  );
}
