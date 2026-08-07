"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extract_1 = require("./extract");
const transform_1 = require("./transform");
const pool_1 = require("../db/pool");
/**
 * Entry point: `npm run etl -- --days 7`
 * Pulls the last N days of logs, cleans them, and prints a quick
 * summary so you can see it's actually pulling real data. Other
 * scripts (fraud, geo, reports) import extract/transform directly
 * rather than shelling out to this file.
 */
async function main() {
    const days = Number(process.argv.find((a) => a.startsWith('--days='))?.split('=')[1] ?? 7);
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    console.log(`Extracting logs from ${from.toISOString()} to ${to.toISOString()}...`);
    const [authRaw, verRaw, issRaw] = await Promise.all([
        (0, extract_1.extractAuthEvents)(from, to),
        (0, extract_1.extractVerificationSessions)(from, to),
        (0, extract_1.extractIssuanceSessions)(from, to),
    ]);
    const authClean = (0, transform_1.cleanAuthEvents)(authRaw);
    const verClean = (0, transform_1.cleanSessions)(verRaw);
    const issClean = (0, transform_1.cleanSessions)(issRaw);
    console.log(`Auth events: ${authRaw.length} extracted -> ${authClean.length} clean`);
    console.log(`Verification sessions: ${verRaw.length} extracted -> ${verClean.length} clean`);
    console.log(`Issuance sessions: ${issRaw.length} extracted -> ${issClean.length} clean`);
    await pool_1.pool.end();
}
main().catch((err) => {
    console.error('ETL run failed:', err);
    process.exit(1);
});
