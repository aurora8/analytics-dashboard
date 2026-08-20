import geoip from 'geoip-lite';
import { extractAuthEvents, extractVerificationSessions } from '../etl/extract';
import { pool } from '../db/pool';

export interface GeoCount {
  country: string;
  region: string | null;
  city: string | null;
  count: number;
}

/**
 * Maps a list of IPs to country/region/city using geoip-lite's bundled
 * offline database (no external API calls, so this works even without
 * network access). Returns counts grouped by location — feeds the
 * geo/IP heatmap on Trainee 3's dashboard.
 *
 * Note: private/local IPs (127.0.0.1, 10.x, 192.168.x, etc.) won't
 * resolve to a real location — that's expected for local dev data
 * seeded via docker-compose, and will resolve properly once this runs
 * against real staging traffic.
 */
export function summarizeIpLocations(ips: (string | null)[]): GeoCount[] {
  const counts = new Map<string, GeoCount>();
  for (const ip of ips) {
    if (!ip) continue;
    const lookup = geoip.lookup(ip);
    const key = lookup ? `${lookup.country}|${lookup.region}|${lookup.city}` : 'unknown';
    const existing = counts.get(key);
    if (existing) {
      existing.count++;
    } else {
      counts.set(key, {
        country: lookup?.country ?? 'unknown',
        region: lookup?.region ?? null,
        city: lookup?.city ?? null,
        count: 1,
      });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

async function main() {
  const daysFlagIndex = process.argv.indexOf('--days');
  const days = daysFlagIndex !== -1 && process.argv[daysFlagIndex + 1] ? Number(process.argv[daysFlagIndex + 1]) : 7;
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  const [authEvents, verSessions] = await Promise.all([
    extractAuthEvents(from, to),
    extractVerificationSessions(from, to),
  ]);
  const authIps = authEvents.map((e) => e.ipAddress);
  const geoSummary = summarizeIpLocations(authIps);
  console.log(`Geo breakdown for ${authIps.filter(Boolean).length} IP-tagged auth events (last ${days}d):`);
  for (const g of geoSummary) {
    console.log(`  ${g.country}${g.region ? '/' + g.region : ''}${g.city ? '/' + g.city : ''}: ${g.count}`);
  }
  console.log(`\n(${verSessions.length} verification sessions in the same window — sessions don't currently store IP; add ip_address to verification_sessions if per-session geo is needed.)`);
  await pool.end();
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Geo analysis run failed:', err);
    process.exit(1);
  });
}