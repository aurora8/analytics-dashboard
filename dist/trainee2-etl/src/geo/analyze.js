"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeIpLocations = summarizeIpLocations;
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const extract_1 = require("../etl/extract");
const pool_1 = require("../db/pool");
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
function summarizeIpLocations(ips) {
    const counts = new Map();
    for (const ip of ips) {
        if (!ip)
            continue;
        const lookup = geoip_lite_1.default.lookup(ip);
        const key = lookup ? `${lookup.country}|${lookup.region}|${lookup.city}` : 'unknown';
        const existing = counts.get(key);
        if (existing) {
            existing.count++;
        }
        else {
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
    const days = Number(process.argv.find((a) => a.startsWith('--days='))?.split('=')[1] ?? 7);
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    const [authEvents, verSessions] = await Promise.all([
        (0, extract_1.extractAuthEvents)(from, to),
        (0, extract_1.extractVerificationSessions)(from, to),
    ]);
    const authIps = authEvents.map((e) => e.ipAddress);
    const geoSummary = summarizeIpLocations(authIps);
    console.log(`Geo breakdown for ${authIps.filter(Boolean).length} IP-tagged auth events (last ${days}d):`);
    for (const g of geoSummary) {
        console.log(`  ${g.country}${g.region ? '/' + g.region : ''}${g.city ? '/' + g.city : ''}: ${g.count}`);
    }
    console.log(`\n(${verSessions.length} verification sessions in the same window — sessions don't currently store IP; add ip_address to verification_sessions if per-session geo is needed.)`);
    await pool_1.pool.end();
}
if (require.main === module) {
    main().catch((err) => {
        console.error('Geo analysis run failed:', err);
        process.exit(1);
    });
}
