import Link from "next/link";
import { primaryNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { BusinessHours } from "@/features/branch/components/business-hours";
import { getBranch } from "@/data/repository";
import { toTelHref } from "@/lib/format";
import { getDirectionsUrl } from "@/lib/geo";

/** Ft1 — mast-headed: the wordmark and tagline anchor one band, small links beside, address below. */
export async function SiteFooter() {
  const branch = await getBranch();
  const { address } = branch;

  return (
    <footer className="on-dark bg-char text-cream">
      <div className="page-container pb-10 pt-14 sm:pt-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-[clamp(2.75rem,10vw,6rem)] font-extrabold uppercase leading-[1.05] tracking-tight">
              <span className="text-tomato-glow">Food</span> Chain
            </p>
            <p className="mt-3 text-lg text-fog">
              {siteConfig.tagline} · {address.area}, Lahore
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {primaryNavigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center whitespace-nowrap font-semibold text-cream underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 grid gap-x-10 gap-y-6 border-t border-char-rule pt-8 text-fog sm:grid-cols-2 lg:grid-cols-3">
          <address className="not-italic">
            <p className="font-semibold text-cream">Our only kitchen</p>
            <p className="mt-1">
              {address.line1}, {address.road}
              <br />
              {address.area}, {address.city}
            </p>
            <a
              href={getDirectionsUrl(branch)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex min-h-11 items-center font-semibold text-gold underline-offset-4 hover:underline"
            >
              Get directions
              <span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
          </address>

          <div>
            <p className="font-semibold text-cream">Hours</p>
            <BusinessHours className="mt-1" showNote={false} />
          </div>

          <div>
            <p className="font-semibold text-cream">Call</p>
            <ul className="mt-1 space-y-0.5">
              {siteConfig.contact.phones.slice(0, 3).map((phone) => (
                <li key={phone.number}>
                  <a href={toTelHref(phone.number)} className="tabular underline-offset-4 hover:underline">
                    {phone.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 max-w-3xl border-t border-char-rule pt-6 text-sm text-fog-2">
          Preview build. The menu, prices and deals are transcribed from {siteConfig.menuSource}; some photographs are
          placeholders. Orders placed here are a demonstration and are not sent to the restaurant. To order, please call us.
        </p>
      </div>
    </footer>
  );
}
