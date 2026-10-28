import { siteConfig } from "@/config/site";

// en-US digit grouping keeps server and browser output identical (no ICU differences → no hydration drift).
const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatPKR(amount: number): string {
  return `${siteConfig.currency.symbol} ${numberFormat.format(Math.round(amount))}`;
}

export function formatSignedPKR(amount: number): string {
  if (amount === 0) return "Included";
  return `${amount > 0 ? "+" : "−"}${formatPKR(Math.abs(amount))}`;
}

export function formatPlainNumber(value: number): string {
  return numberFormat.format(Math.round(value));
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/* ───────── Pakistan phone numbers ───────── */

/** Strips spaces, dashes and brackets. Converts +92 / 0092 / 92 prefixes to a leading 0. */
export function normalizePkPhone(raw: string): string {
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("0092")) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith("92") && digits.length >= 12) digits = `0${digits.slice(2)}`;
  return digits;
}

/** Pakistan mobile: 03XX followed by seven digits, e.g. 0300 1234567. */
export function isValidPkMobile(raw: string): boolean {
  return /^03[0-4]\d{8}$/.test(normalizePkPhone(raw));
}

/** 03001234567 → "0300 1234567". Returns the input untouched when it is not a full mobile number. */
export function formatPkMobile(raw: string): string {
  const n = normalizePkPhone(raw);
  return /^03\d{9}$/.test(n) ? `${n.slice(0, 4)} ${n.slice(4)}` : raw;
}

/** tel: href in international format. 0300-4835350 → tel:+923004835350, 042-3662… → tel:+92423662… */
export function toTelHref(display: string): string {
  const n = normalizePkPhone(display);
  return `tel:+92${n.replace(/^0/, "")}`;
}

/** wa.me destination for a Pakistan mobile number, or null when the number is not a valid mobile. */
export function toWhatsAppUrl(display: string, message?: string): string | null {
  if (!isValidPkMobile(display)) return null;
  const n = normalizePkPhone(display).replace(/^0/, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/92${n}${text}`;
}
