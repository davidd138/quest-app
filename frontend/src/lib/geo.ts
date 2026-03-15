/**
 * Geolocation utilities for distance calculations, formatting, and sorting.
 */

const EARTH_RADIUS_KM = 6371;

/** Convert degrees to radians. */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate the great-circle distance between two points using the Haversine formula.
 * @returns Distance in kilometres.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Format a distance in kilometres to a human-readable string.
 * - Under 1 km: "500 m"
 * - 1 km and above: "2.3 km", "15 km"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

/**
 * Estimate walking time at an average pace of 5 km/h.
 * Returns a human-readable string like "15 min" or "1h 30min".
 */
export function estimateWalkTime(km: number): string {
  const totalMinutes = Math.round((km / 5) * 60);
  if (totalMinutes < 1) return '1 min';
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

/**
 * Check whether a point is within a given radius of a centre point.
 */
export function isWithinRadius(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  radiusKm: number,
): boolean {
  return haversineDistance(lat, lng, centerLat, centerLng) <= radiusKm;
}

/**
 * Sort an array of items by distance from a reference point.
 * Each item must have `latitude` and `longitude` accessible via the provided accessor,
 * or default to `item.location.latitude` / `item.location.longitude`.
 */
export function sortByDistance<
  T extends { location: { latitude: number; longitude: number } },
>(items: T[], lat: number, lng: number): T[] {
  return [...items].sort((a, b) => {
    const distA = haversineDistance(lat, lng, a.location.latitude, a.location.longitude);
    const distB = haversineDistance(lat, lng, b.location.latitude, b.location.longitude);
    return distA - distB;
  });
}

/**
 * Get the distance colour based on kilometres.
 * green (<1km), yellow (<5km), orange (<15km), gray (>15km)
 */
export function getDistanceColor(km: number): string {
  if (km < 1) return 'text-emerald-400';
  if (km < 5) return 'text-amber-400';
  if (km < 15) return 'text-orange-400';
  return 'text-slate-400';
}
