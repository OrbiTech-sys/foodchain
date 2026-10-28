"use client";

import { Banknote, CircleAlert, ClipboardCheck, Info, MapPin, ShoppingBag, Store } from "lucide-react";
import { useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { BusinessHours } from "@/features/branch/components/business-hours";
import { clearCart } from "@/features/cart/cart-store";
import { useCart } from "@/features/cart/use-cart";
import { useCatalogue } from "@/features/catalogue/catalogue-context";
import { DeliveryEligibilityChecker } from "@/features/order/components/delivery-eligibility-checker";
import { OrderTypeSelector } from "@/features/order/components/order-type-selector";
import { setAddressText, setFulfillment } from "@/features/order/order-store";
import { useDeliveryEligibility, useHydrated, useOrderPreferences } from "@/features/order/use-order";
import { cn } from "@/lib/cn";
import { formatPkMobile, isValidPkMobile, toTelHref } from "@/lib/format";
import { formatBranchAddress, formatDistanceKm, getDirectionsUrl } from "@/lib/geo";
import type { CartTotals, CheckoutDetails, DeliveryEligibility, PricedLine } from "@/lib/types";
import { CHECKOUT_FIELD_ORDER, validateCheckout, type CheckoutField } from "@/lib/validation";
import { CheckoutSummary } from "./checkout-summary";
import { TextField } from "./text-field";

type Step = "details" | "review" | "confirmed";

interface Confirmation {
  reference: string;
  lines: PricedLine[];
  totals: CartTotals;
  details: CheckoutDetails;
  eligibility: DeliveryEligibility;
}

const FIELD_IDS: Record<CheckoutField, string> = {
  fullName: "field-fullName",
  phone: "field-phone",
  houseNumber: "field-houseNumber",
  street: "field-street",
  area: "field-area",
  address: "field-address",
  manualRadius: "field-manualRadius",
  delivery: "delivery-section",
};

const STEPS: { id: Step; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "review", label: "Review" },
  { id: "confirmed", label: "Preview confirmation" },
];

/** Not a real order number: a throwaway reference for the demo confirmation screen. */
function createDemoReference(): string {
  return `DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function CheckoutExperience() {
  const hydrated = useHydrated();
  const cart = useCart();
  const { fulfillment, addressText } = useOrderPreferences();
  const eligibility = useDeliveryEligibility();
  const { branch } = useCatalogue();

  const [step, setStep] = useState<Step>("details");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<CheckoutField, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  if (!hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]" aria-busy="true" aria-label="Loading checkout">
        <div className="space-y-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const details: CheckoutDetails = {
    fulfillment,
    fullName,
    phone,
    delivery: { houseNumber, street, area, address: addressText, notes },
    manualRadiusAcknowledged: acknowledged,
  };
  const errors = validateCheckout(details, eligibility);
  const errorFields = CHECKOUT_FIELD_ORDER.filter((field) => errors[field]);
  const deliveryBlocked = fulfillment === "delivery" && eligibility.status === "ineligible";
  const errorFor = (field: CheckoutField) => (touched[field] || attempted ? errors[field] : undefined);
  const touch = (field: CheckoutField) => () => setTouched((previous) => ({ ...previous, [field]: true }));

  function goTo(next: Step) {
    setStep(next);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0 });
      headingRef.current?.focus({ preventScroll: true });
    });
  }

  function focusField(field: CheckoutField) {
    const element = document.getElementById(FIELD_IDS[field]);
    element?.scrollIntoView({ block: "center", behavior: "smooth" });
    element?.focus({ preventScroll: true });
  }

  function handleReview(event: FormEvent) {
    event.preventDefault();
    setAttempted(true);
    if (deliveryBlocked) return;
    if (errorFields.length > 0) {
      focusField(errorFields[0]);
      return;
    }
    goTo("review");
  }

  function placeDemoOrder() {
    const reference = createDemoReference();
    setConfirmation({ reference, lines: cart.lines, totals: cart.totals, details, eligibility });
    clearCart();
    goTo("confirmed");
  }

  if (step === "confirmed" && confirmation) {
    return (
      <ConfirmationView
        confirmation={confirmation}
        headingRef={headingRef}
        onRestart={() => {
          setConfirmation(null);
          setAttempted(false);
          setTouched({});
          setStep("details");
        }}
      />
    );
  }

  if (cart.isEmpty) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add something from the menu first, then come back to review your order."
        action={<ButtonLink href="/menu">Browse menu</ButtonLink>}
      />
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
      <div className="space-y-8">
        <StepIndicator step={step} />
        <PreviewNotice />

        {step === "details" ? (
          <form noValidate onSubmit={handleReview} className="space-y-10">
            <h2 ref={headingRef} tabIndex={-1} className="sr-only">
              Your details
            </h2>

            {attempted && errorFields.length > 0 && !deliveryBlocked ? (
              <div role="alert" className="rounded-2xl bg-danger-bg p-4 text-danger">
                <p className="flex items-center gap-2 font-bold">
                  <CircleAlert className="size-5 shrink-0" aria-hidden />
                  {errorFields.length === 1 ? "One thing needs fixing" : `${errorFields.length} things need fixing`}
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                  {errorFields.map((field) => (
                    <li key={field}>
                      <button type="button" onClick={() => focusField(field)} className="text-left underline underline-offset-4">
                        {errors[field]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <FormSection id="order-type" title="Order type">
              <OrderTypeSelector variant="cards" />
            </FormSection>

            <FormSection id="contact" title="Your details">
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  id={FIELD_IDS.fullName}
                  label="Full name"
                  value={fullName}
                  onChange={setFullName}
                  onBlur={touch("fullName")}
                  error={errorFor("fullName")}
                  autoComplete="name"
                  placeholder="Ayesha Khan"
                  required
                />
                <TextField
                  id={FIELD_IDS.phone}
                  label="Mobile number"
                  value={phone}
                  onChange={setPhone}
                  onBlur={() => {
                    touch("phone")();
                    if (isValidPkMobile(phone)) setPhone(formatPkMobile(phone));
                  }}
                  error={errorFor("phone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0300 1234567"
                  helpText="A Pakistan mobile number. We use it to confirm your order."
                  required
                />
              </div>
            </FormSection>

            {fulfillment === "delivery" ? (
              <FormSection id="delivery-section" title="Delivery address">
                <DeliveryEligibilityChecker showAddressField={false} />

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    id={FIELD_IDS.address}
                    label="Address"
                    value={addressText}
                    onChange={setAddressText}
                    onBlur={touch("address")}
                    error={errorFor("address")}
                    autoComplete="street-address"
                    placeholder="Building, society or nearby landmark"
                    className="sm:col-span-2"
                    required
                  />
                  <TextField
                    id={FIELD_IDS.houseNumber}
                    label="House or flat number"
                    value={houseNumber}
                    onChange={setHouseNumber}
                    onBlur={touch("houseNumber")}
                    error={errorFor("houseNumber")}
                    placeholder="E-12"
                    required
                  />
                  <TextField
                    id={FIELD_IDS.street}
                    label="Street"
                    value={street}
                    onChange={setStreet}
                    onBlur={touch("street")}
                    error={errorFor("street")}
                    placeholder="Street 9"
                    required
                  />
                  <TextField
                    id={FIELD_IDS.area}
                    label="Area"
                    value={area}
                    onChange={setArea}
                    onBlur={touch("area")}
                    error={errorFor("area")}
                    placeholder="New Iqbal Park"
                    helpText="City: Lahore"
                    className="sm:col-span-2"
                    required
                  />
                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="field-notes" className="label">
                      Delivery notes <span className="font-normal text-muted">(optional)</span>
                    </label>
                    <textarea
                      id="field-notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      maxLength={200}
                      rows={2}
                      placeholder="Gate colour, floor, how to find you"
                      className="input resize-none"
                    />
                  </div>
                </div>

                {eligibility.status === "unknown" ? (
                  <div className="space-y-2">
                    <label
                      htmlFor={FIELD_IDS.manualRadius}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-2xl border bg-card p-4",
                        errorFor("manualRadius") ? "border-danger" : "border-rule",
                      )}
                    >
                      <input
                        id={FIELD_IDS.manualRadius}
                        type="checkbox"
                        checked={acknowledged}
                        onChange={(event) => {
                          setAcknowledged(event.target.checked);
                          touch("manualRadius")();
                        }}
                        aria-describedby={errorFor("manualRadius") ? "manual-radius-error" : undefined}
                        className="mt-0.5 size-5 shrink-0 accent-tomato"
                      />
                      <span>
                        I understand Food Chain will check that my address is within the {branch.deliveryRadiusKm} km delivery
                        radius before accepting this order, and may offer pickup instead.
                      </span>
                    </label>
                    {errorFor("manualRadius") ? (
                      <p id="manual-radius-error" className="error-text">
                        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                        {errors.manualRadius}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </FormSection>
            ) : (
              <FormSection id="pickup-section" title="Pickup">
                <PickupSummary />
              </FormSection>
            )}

            <FormSection id="payment" title="Payment">
              {siteConfig.ordering.cashOnDelivery ? (
                <div className="flex items-start gap-3 rounded-2xl bg-cream-2 p-4">
                  <Banknote className="mt-0.5 size-5 shrink-0 text-tomato-deep" aria-hidden />
                  <div>
                    <p className="font-semibold">Cash on {fulfillment === "delivery" ? "delivery" : "pickup"}</p>
                    <p className="text-sm text-ink-2">Demo option. No card details are collected.</p>
                  </div>
                </div>
              ) : (
                <p className="text-ink-2">
                  Payment isn’t part of this preview, so nothing is charged and we never ask for card details here.
                </p>
              )}
            </FormSection>

            <div className="space-y-3">
              {deliveryBlocked ? (
                <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl bg-danger-bg p-4 text-danger">
                  <CircleAlert className="size-5 shrink-0" aria-hidden />
                  <p className="min-w-0 flex-1 basis-60 font-medium">
                    Delivery isn’t available at your location. Switch to pickup to continue.
                  </p>
                  <Button variant="dark" size="sm" onClick={() => setFulfillment("pickup")}>
                    <Store className="size-4" aria-hidden />
                    Switch to pickup
                  </Button>
                </div>
              ) : null}
              <Button type="submit" size="lg" disabled={deliveryBlocked} className="w-full sm:w-auto">
                <ClipboardCheck className="size-5" aria-hidden />
                Review order
              </Button>
            </div>
          </form>
        ) : (
          <ReviewStep
            details={details}
            eligibility={eligibility}
            headingRef={headingRef}
            onEdit={() => goTo("details")}
            onPlace={placeDemoOrder}
          />
        )}
      </div>

      <CheckoutSummary lines={cart.lines} totals={cart.totals} fulfillment={fulfillment} />
    </div>
  );
}

/* ───────── Pieces ───────── */

function FormSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="space-y-5 border-t border-rule pt-8 first-of-type:border-t-0 first-of-type:pt-0">
      <h2 id={`${id}-title`} className="text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const current = STEPS.findIndex((candidate) => candidate.id === step);
  return (
    <ol aria-label="Checkout steps" className="flex flex-wrap gap-x-6 gap-y-2">
      {STEPS.map((entry, index) => (
        <li
          key={entry.id}
          aria-current={index === current ? "step" : undefined}
          className={cn(
            "flex items-center gap-2 text-[0.9375rem] font-semibold",
            index === current ? "text-ink" : index < current ? "text-ink-2" : "text-muted",
          )}
        >
          <span
            className={cn(
              "tabular grid size-7 place-items-center rounded-full text-sm",
              index === current ? "bg-char text-cream" : index < current ? "bg-cream-3 text-ink" : "border border-rule text-muted",
            )}
          >
            {index + 1}
          </span>
          {entry.label}
        </li>
      ))}
    </ol>
  );
}

function PreviewNotice() {
  return (
    <div role="note" className="flex items-start gap-3 rounded-2xl bg-warn-bg p-4 text-warn">
      <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
      <p className="text-sm font-medium">
        <strong>Checkout preview.</strong> This is a demonstration. Your order is not sent to Food Chain and no payment is taken.
      </p>
    </div>
  );
}

function PickupSummary() {
  const { branch } = useCatalogue();
  return (
    <div className="space-y-4 rounded-2xl bg-cream-2 p-5">
      <div className="flex gap-3">
        <Store className="mt-0.5 size-5 shrink-0 text-tomato-deep" aria-hidden />
        <div>
          <p className="font-bold">Collect from {branch.name}</p>
          <p className="text-ink-2">{formatBranchAddress(branch)}</p>
        </div>
      </div>
      <div className="text-ink-2">
        <p className="font-semibold text-ink">Hours</p>
        <BusinessHours showNote={false} />
      </div>
      <a
        href={getDirectionsUrl(branch)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4"
      >
        <MapPin className="size-4" aria-hidden />
        Get directions
        <span className="sr-only">(opens Google Maps in a new tab)</span>
      </a>
    </div>
  );
}

function describeEligibility(eligibility: DeliveryEligibility, acknowledged: boolean): string {
  if (eligibility.status === "eligible") {
    return `About ${formatDistanceKm(eligibility.distanceKm)} from the kitchen, inside the ${eligibility.radiusKm} km radius`;
  }
  if (eligibility.status === "ineligible") return `Outside the ${eligibility.radiusKm} km radius`;
  return acknowledged
    ? `Not measured. Food Chain will confirm the ${eligibility.radiusKm} km radius manually`
    : "Not measured";
}

function DetailRows({ details, eligibility }: { details: CheckoutDetails; eligibility: DeliveryEligibility }) {
  const { delivery } = details;
  const rows: [string, ReactNode][] = [
    ["Order type", details.fulfillment === "delivery" ? "Delivery" : "Pickup"],
    ["Name", details.fullName.trim()],
    ["Mobile", formatPkMobile(details.phone)],
  ];
  if (details.fulfillment === "delivery") {
    rows.push(
      ["Address", [delivery.houseNumber, delivery.street, delivery.area, delivery.address].map((part) => part.trim()).filter(Boolean).join(", ") + ", Lahore"],
      ["Radius check", describeEligibility(eligibility, details.manualRadiusAcknowledged)],
    );
    if (delivery.notes.trim()) rows.push(["Notes", delivery.notes.trim()]);
  }
  return (
    <dl className="divide-y divide-rule border-y border-rule">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
          <dt className="font-semibold text-ink-2">{label}</dt>
          <dd className="[overflow-wrap:anywhere]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ReviewStep({
  details,
  eligibility,
  headingRef,
  onEdit,
  onPlace,
}: {
  details: CheckoutDetails;
  eligibility: DeliveryEligibility;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onEdit: () => void;
  onPlace: () => void;
}) {
  const { branch } = useCatalogue();
  return (
    <div className="space-y-6">
      <h2 ref={headingRef} tabIndex={-1} className="text-3xl focus-visible:outline-none">
        Review your order
      </h2>
      <p className="text-ink-2">
        Check the details below and the items on the right. Placing this demo order shows a confirmation preview only.
      </p>
      <DetailRows details={details} eligibility={eligibility} />
      {details.fulfillment === "pickup" ? (
        <p className="text-ink-2">
          Pickup from <strong className="text-ink">{formatBranchAddress(branch)}</strong>.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={onPlace}>
          <ClipboardCheck className="size-5" aria-hidden />
          Place demo order
        </Button>
        <Button size="lg" variant="outline" onClick={onEdit}>
          Edit details
        </Button>
      </div>
      <p className="help">Demo only. Nothing is sent to Food Chain.</p>
    </div>
  );
}

function ConfirmationView({
  confirmation,
  headingRef,
  onRestart,
}: {
  confirmation: Confirmation;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
}) {
  const { reference, lines, totals, details, eligibility } = confirmation;
  const phone = siteConfig.contact.primaryPhone;
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
      <div className="space-y-6">
        <StepIndicator step="confirmed" />
        <div role="status" className="space-y-3 rounded-3xl bg-warn-bg p-6 text-warn">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
            <Info className="size-4" aria-hidden />
            Demo only
          </p>
          <h2 ref={headingRef} tabIndex={-1} className="text-4xl text-ink focus-visible:outline-none">
            Preview complete
          </h2>
          <p className="text-ink-2">
            Reference <strong className="tabular text-ink">{reference}</strong>. This was a demonstration: no order reached Food Chain
            and no payment was taken.
          </p>
        </div>

        <DetailRows details={details} eligibility={eligibility} />

        <div className="space-y-3">
          <p className="text-lg">
            To order for real, call <a href={toTelHref(phone)} className="font-bold underline underline-offset-4">{phone}</a>.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/menu" size="lg">
              Back to the menu
            </ButtonLink>
            <Button variant="outline" size="lg" onClick={onRestart}>
              Start another preview
            </Button>
          </div>
        </div>
      </div>

      <CheckoutSummary lines={lines} totals={totals} fulfillment={details.fulfillment} />
    </div>
  );
}
