import geoip from 'geoip-lite';

export interface GeoCount {
  country: string;
  count: number;
}

export interface IpSource {
  ipAddress: string | null;
}

/**
 * Aggregates any collection of IP-bearing records (auth events,
 * verification sessions, or both combined) by country of origin.
 * Pass in a combined array to get the full picture across both
 * authentication and verification activity.
 */
export function analyzeGeo(sources: IpSource[]): GeoCount[] {
  const counts = new Map<string, number>();

  for (const source of sources) {
    if (!source.ipAddress) continue;
    const lookup = geoip.lookup(source.ipAddress);
    // Some anycast IPs (e.g. 1.1.1.1) resolve to a record with an empty
    // country string rather than a null lookup, so check for both.
    const country = lookup?.country ? lookup.country : 'Unknown';
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
}
