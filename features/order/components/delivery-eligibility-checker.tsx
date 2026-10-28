"use client";

import { CircleAlert, CircleCheck, ExternalLink, Info, LocateFixed, MapPin, Store, X } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useCatalogue } from "@/features/catalogue/catalogue-context";
import { cn } from "@/lib/cn";
import { formatDistanceKm, parseCoordinates } from "@/lib/geo";
import { setAddressText, setCustomerLocation, setFulfillment } from "../order-store";
import { useDeliveryEligibility, useOrderPreferences } from "../use-order";

interface DeliveryEligibilityCheckerProps {
  className?: string;
  /** Called after the customer switches to pickup from the ineligible panel. */
  onSwitchToPickup?: () => void;
  /** Hide the free-text address field when the surrounding form already has one. */
  showAddressField?: boolean;
}

type GeoState = { status: "idle" | "loading" } | { status: "error"; message: string };

/**
 * Checks a customer-provided location against the branch's delivery radius.
 *
 * Nothing here is geocoded or "verified" by a service: the customer shares their device location or
 * pastes a pin, and we measure a straight line (haversine) to the branch. Without a location, or when
 * the branch pin is not configured, the result is "unknown" and delivery needs manual confirmation.
 */
export function DeliveryEligibilityChecker({
  className,
  onSwitchToPickup,
  showAddressField = true,
}: DeliveryEligibilityCheckerProps) {
  const ids = useId();
  const { location, addressText } = useOrderPreferences();
  const eligibility = useDeliveryEligibility();
  const { branch } = useCatalogue();

  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  function locateMe() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeo({ status: "error", message: "This browser can’t share your location. Paste a pin from Google Maps instead." });
      return;
    }
    setGeo({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomerLocation({
          coordinates: { lat: position.coords.latitude, lng: position.coords.longitude },
          source: "device",
        });
        setGeo({ status: "idle" });
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location access was blocked. Allow it in your browser settings, or paste a pin from Google Maps instead."
            : error.code === error.TIMEOUT
              ? "Finding your location took too long. Try again, or paste a pin from Google Maps."
              : "We couldn’t read your location. Paste a pin from Google Maps instead.";
        setGeo({ status: "error", message });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

  function applyPin() {
    const result = parseCoordinates(pin);
    if (!result.ok) {
      setPinError(result.error);
      return;
    }
    setPinError("");
    setPin("");
    setGeo({ status: "idle" });
    setCustomerLocation({ coordinates: result.coordinates, source: "pasted" });
  }

  function switchToPickup() {
    setFulfillment("pickup");
    onSwitchToPickup?.();
  }

  const radius = branch.deliveryRadiusKm;

  return (
    <div className={cn("space-y-5", className)}>
      <p className="text-ink-2">
        We deliver within <strong className="text-ink">{radius} km</strong> of our kitchen on {branch.address.road}. That is a
        straight-line radius, not road distance, so travel time can differ.
      </p>

      {showAddressField ? (
        <div className="space-y-2">
          <label htmlFor={`${ids}-address`} className="label">
            Delivery address
          </label>
          <input
            id={`${ids}-address`}
            type="text"
            autoComplete="street-address"
            value={addressText}
            onChange={(event) => setAddressText(event.target.value)}
            placeholder="House 12, Street 4, New Iqbal Park"
            className="input"
            aria-describedby={`${ids}-address-help`}
          />
          <p id={`${ids}-address-help`} className="help">
            We don’t look addresses up automatically, so typing one doesn’t confirm it. Share or paste a location below to check
            the radius.
          </p>
        </div>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-rule bg-card p-4">
        <p className="text-lg font-bold">Confirm your location</p>

        <div className="space-y-2">
          <Button variant="dark" onClick={locateMe} loading={geo.status === "loading"} className="w-full sm:w-auto">
            {geo.status === "loading" ? null : <LocateFixed className="size-4" aria-hidden />}
            {geo.status === "loading" ? "Finding you…" : "Use my current location"}
          </Button>
          {geo.status === "error" ? (
            <p role="alert" className="error-text">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {geo.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor={`${ids}-pin`} className="label">
            Or paste a pin
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={`${ids}-pin`}
              type="text"
              inputMode="text"
              value={pin}
              onChange={(event) => {
                setPin(event.target.value);
                if (pinError) setPinError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyPin();
                }
              }}
              placeholder="31.5204, 74.3587 or a Google Maps link"
              aria-invalid={pinError ? true : undefined}
              aria-describedby={`${ids}-pin-help${pinError ? ` ${ids}-pin-error` : ""}`}
              className="input"
            />
            <Button variant="outline" onClick={applyPin} className="sm:shrink-0">
              Check pin
            </Button>
          </div>
          {pinError ? (
            <p id={`${ids}-pin-error`} role="alert" className="error-text">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {pinError}
            </p>
          ) : null}
          <p id={`${ids}-pin-help`} className="help">
            In Google Maps, press and hold on your door and copy the coordinates that appear.{" "}
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-ink underline underline-offset-4"
            >
              Open Google Maps
              <ExternalLink className="size-3.5" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </p>
        </div>

        {location ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4" aria-hidden />
              Using {location.source === "device" ? "your device location" : "the pin you pasted"} (
              {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)})
            </span>
            <button
              type="button"
              onClick={() => setCustomerLocation(null)}
              className="inline-flex items-center gap-1 font-semibold text-ink underline underline-offset-4"
            >
              <X className="size-3.5" aria-hidden />
              Clear location
            </button>
          </p>
        ) : null}
      </div>

      <div aria-live="polite">
        {eligibility.status === "eligible" ? (
          <ResultPanel tone="success" icon={CircleCheck} title={`Inside our ${eligibility.radiusKm} km radius`}>
            You are about {formatDistanceKm(eligibility.distanceKm)} from our kitchen in a straight line. Food Chain still
            confirms your address before dispatch.
          </ResultPanel>
        ) : null}

        {eligibility.status === "ineligible" ? (
          <ResultPanel tone="danger" icon={CircleAlert} title={`Outside our ${eligibility.radiusKm} km radius`}>
            You are about {formatDistanceKm(eligibility.distanceKm)} away, so delivery isn’t available from here. Pickup is
            available from our kitchen.
            <div className="mt-3">
              <Button variant="dark" size="sm" onClick={switchToPickup}>
                <Store className="size-4" aria-hidden />
                Switch to pickup
              </Button>
            </div>
          </ResultPanel>
        ) : null}

        {eligibility.status === "unknown" ? (
          <ResultPanel tone="warn" icon={Info} title="We haven’t confirmed your location">
            {eligibility.reason === "branch-not-configured"
              ? `Automatic distance checks are not switched on yet. If you choose delivery, Food Chain will confirm your address is within ${eligibility.radiusKm} km before accepting the order.`
              : `Share or paste your location to check the ${eligibility.radiusKm} km radius. If you skip it, Food Chain will confirm your address manually before accepting a delivery order.`}
            {process.env.NODE_ENV !== "production" && eligibility.reason === "branch-not-configured" ? (
              <span className="mt-2 block rounded-lg bg-cream-3 p-2 text-xs text-ink-2">
                Developer note: set the branch pin in <code>config/branch.ts</code> (or NEXT_PUBLIC_BRANCH_LAT / NEXT_PUBLIC_BRANCH_LNG)
                to enable the radius check.
              </span>
            ) : null}
          </ResultPanel>
        ) : null}
      </div>
    </div>
  );
}

const TONES = {
  success: "border-success/30 bg-success-bg text-success",
  danger: "border-danger/30 bg-danger-bg text-danger",
  warn: "border-warn/30 bg-warn-bg text-warn",
} as const;

function ResultPanel({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: keyof typeof TONES;
  icon: typeof Info;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex gap-3 rounded-2xl border p-4", TONES[tone])}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 text-sm">
        <p className="text-base font-bold">{title}</p>
        <div className="mt-1 text-ink-2">{children}</div>
      </div>
    </div>
  );
}
