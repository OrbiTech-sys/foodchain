import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { getDirectionsUrl } from "@/lib/geo";
import { toTelHref } from "@/lib/format";
import type { Branch } from "@/lib/types";
import { BusinessHours } from "./business-hours";

interface BranchInformationProps {
  branch: Branch;
  /** "dark" for charcoal sections. */
  tone?: "light" | "dark";
  className?: string;
}

/** The single branch: address, hours, call and directions actions. There is only one location. */
export function BranchInformation({ branch, tone = "light", className }: BranchInformationProps) {
  const dark = tone === "dark";
  const { address } = branch;
  const directionsUrl = getDirectionsUrl(branch);
  const primary = siteConfig.contact.primaryPhone;

  return (
    <div className={cn("grid gap-8 sm:grid-cols-2", className)}>
      <div className="space-y-6">
        <div className="flex gap-4">
          <MapPin className={cn("mt-1 size-5 shrink-0", dark ? "text-gold" : "text-tomato-deep")} aria-hidden />
          <address className="not-italic">
            <p className="font-display text-xl font-bold leading-snug">{branch.name}</p>
            <p className={cn("mt-1", dark ? "text-fog" : "text-ink-2")}>
              {address.line1}
              <br />
              {address.road}, {address.area}
              <br />
              {address.city}, {address.country}
            </p>
          </address>
        </div>

        <div className="flex gap-4">
          <Clock className={cn("mt-1 size-5 shrink-0", dark ? "text-gold" : "text-tomato-deep")} aria-hidden />
          <div>
            <p className="font-display text-xl font-bold leading-snug">Opening hours</p>
            <BusinessHours className={cn("mt-1", dark ? "text-fog" : "text-ink-2")} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
          <Phone className={cn("mt-1 size-5 shrink-0", dark ? "text-gold" : "text-tomato-deep")} aria-hidden />
          <div>
            <p className="font-display text-xl font-bold leading-snug">Call to order or ask</p>
            <ul className={cn("mt-1 space-y-0.5", dark ? "text-fog" : "text-ink-2")}>
              {siteConfig.contact.phones.map((phone) => (
                <li key={phone.number}>
                  <a href={toTelHref(phone.number)} className="tabular underline-offset-4 hover:underline">
                    {phone.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href={toTelHref(primary)} className={buttonClass({ variant: "primary" })}>
            <Phone className="size-4" aria-hidden />
            Call {primary}
          </a>
          <ButtonLink href={directionsUrl} target="_blank" rel="noreferrer" variant={dark ? "outline-light" : "outline"}>
            <Navigation className="size-4" aria-hidden />
            Get directions
            <span className="sr-only">(opens Google Maps in a new tab)</span>
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
