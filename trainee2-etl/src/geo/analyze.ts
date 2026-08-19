import geoip from 'geoip-lite';
import { RawAuthEvent } from '../etl/extract';

export interface GeoCount {
  country: string;
  count: number;
}

/**
 * Aggregates auth events by country of origin, using each event's IP
 * address. Scope note: IP address is only captured on auth_event today
 * (login/MFA activity), not on verification_session — so this reflects
 * where authentication traffic originates, not literally every
 * verification request. Extending IP capture to verification_session
 * would need a small additive column there.
 */
export function analyzeGeo(events: RawAuthEvent[]): GeoCount[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    if (!event.ipAddress) continue;
    const lookup = geoip.lookup(event.ipAddress);
    // Some anycast IPs (e.g. 1.1.1.1) resolve to a record with an empty
    // country string rather than a null lookup, so check for both.
    const country = lookup?.country ? lookup.country : 'Unknown';
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
}
