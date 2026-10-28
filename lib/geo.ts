import type { Branch, Coordinates, DeliveryEligibility } from "@/lib/types";

const EARTH_RADIUS_KM = 6371.0088;

const toRadians = (deg: number) => (deg * Math.PI) / 180;

export function isValidCoordinates(value: Coordinates | null | undefined): value is Coordinates {
  return (
    !!value &&
    Number.isFinite(value.lat) &&
    Number.isFinite(value.lng) &&
    Math.abs(value.lat) <= 90 &&
    Math.abs(value.lng) <= 180
  );
}

/** Great-circle (straight-line) distance between two points, in kilometres. */
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Delivery is eligible only when a verified customer location is available AND the branch pin
 * is configured AND the straight-line distance is ≤ the configured radius.
 * Anything we cannot measure is "unknown" — never assumed eligible.
 */
export function checkDeliveryEligibility(
  customer: Coordinates | null | undefined,
  branch: Pick<Branch, "coordinates" | "deliveryRadiusKm">,
): DeliveryEligibility {
  const radiusKm = branch.deliveryRadiusKm;
  if (!isValidCoordinates(branch.coordinates)) {
    return { status: "unknown", reason: "branch-not-configured", radiusKm };
  }
  if (!isValidCoordinates(customer)) {
    return { status: "unknown", reason: "no-customer-location", radiusKm };
  }
  const distanceKm = haversineKm(branch.coordinates, customer);
  return {
    status: distanceKm <= radiusKm ? "eligible" : "ineligible",
    distanceKm,
    radiusKm,
  };
}

export function formatDistanceKm(km: number): string {
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

/* ───────── Reading a pin the customer pasted ───────── */

export type ParseCoordinatesResult =
  | { ok: true; coordinates: Coordinates }
  | { ok: false; error: string };

const NUMBER = "(-?\\d{1,3}(?:\\.\\d+)?)";

/**
 * Accepts "31.5204, 74.3587", a Google Maps URL containing @lat,lng, !3dLAT!4dLNG or ?q=lat,lng.
 * Short links (maps.app.goo.gl) cannot be resolved without a network call and are rejected with advice.
 */
export function parseCoordinates(input: string): ParseCoordinatesResult {
  const text = input.trim();
  if (!text) return { ok: false, error: "Paste the coordinates or a Google Maps link first." };

  if (/goo\.gl|maps\.app/i.test(text)) {
    return {
      ok: false,
      error:
        "Short Google Maps links can’t be read here. Open the link, then copy the two numbers shown at the top of the pin.",
    };
  }

  const patterns = [
    new RegExp(`@${NUMBER},${NUMBER}`),
    new RegExp(`!3d${NUMBER}!4d${NUMBER}`),
    new RegExp(`[?&](?:q|ll|query|destination)=${NUMBER}(?:,|%2C)${NUMBER}`),
    new RegExp(`^\\s*${NUMBER}\\s*[,;\\s]\\s*${NUMBER}\\s*$`),
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (!match) continue;
    const coordinates = { lat: Number.parseFloat(match[1]), lng: Number.parseFloat(match[2]) };
    if (isValidCoordinates(coordinates)) return { ok: true, coordinates };
  }

  return {
    ok: false,
    error: "We couldn’t find a latitude and longitude there. Try the format 31.5204, 74.3587.",
  };
}

/* ───────── Links ───────── */

export function getDirectionsUrl(branch: Branch): string {
  if (branch.mapsUrl) return branch.mapsUrl;
  if (isValidCoordinates(branch.coordinates)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${branch.coordinates.lat},${branch.coordinates.lng}`;
  }
  const query = `Food Chain, ${formatBranchAddress(branch)}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function formatBranchAddress(branch: Branch, separator = ", "): string {
  const { line1, road, area, city, country } = branch.address;
  return [line1, road, area, city, country].join(separator);
}
