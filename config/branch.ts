import type { Branch, Coordinates } from "@/lib/types";

/**
 * The single source of truth for the branch location and delivery radius.
 *
 * TODO(owner): replace BRANCH_COORDINATES with the exact, verified pin of the branch
 * (open the branch in Google Maps, long-press the entrance, copy the latitude and longitude).
 * Until then the 5 km check cannot run and delivery falls back to a manual-confirmation state.
 *
 * For local testing you can set NEXT_PUBLIC_BRANCH_LAT and NEXT_PUBLIC_BRANCH_LNG in .env.local
 * instead of editing this file. Never commit guessed coordinates.
 */
const BRANCH_COORDINATES: Coordinates | null = null;

/** Delivery radius in kilometres. Straight-line distance, not road distance. */
const DEFAULT_DELIVERY_RADIUS_KM = 5;

/**
 * TODO(owner): paste the verified Google Maps share link for the branch here.
 * While null, directions open a Google Maps search for the printed address.
 */
const BRANCH_MAPS_URL: string | null = null;

function readEnvNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveCoordinates(): Coordinates | null {
  const lat = readEnvNumber(process.env.NEXT_PUBLIC_BRANCH_LAT);
  const lng = readEnvNumber(process.env.NEXT_PUBLIC_BRANCH_LNG);
  if (lat !== null && lng !== null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    return { lat, lng };
  }
  return BRANCH_COORDINATES;
}

export const branch: Branch = {
  id: "rifle-range-iqbal-park",
  name: "Food Chain · Iqbal Park",
  address: {
    // Printed menu: "E-463 Street # 9, Riffle Range Road, New Iqbal Park, Lahore Cantt."
    // The menu spells the road "Riffle"; this app uses "Rifle". Confirm the preferred spelling.
    line1: "E-463, Street 9",
    road: "Rifle Range Road",
    area: "New Iqbal Park",
    city: "Lahore Cantt.",
    country: "Pakistan",
  },
  coordinates: resolveCoordinates(),
  deliveryRadiusKm: readEnvNumber(process.env.NEXT_PUBLIC_DELIVERY_RADIUS_KM) ?? DEFAULT_DELIVERY_RADIUS_KM,
  mapsUrl: BRANCH_MAPS_URL,
};
