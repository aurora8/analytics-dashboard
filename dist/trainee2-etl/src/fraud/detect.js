"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flagExcessiveMfaFailures = flagExcessiveMfaFailures;
exports.flagExcessiveLoginFailures = flagExcessiveLoginFailures;
exports.flagDistinctIpFanOut = flagDistinctIpFanOut;
exports.runAllFraudRules = runAllFraudRules;
const extract_1 = require("../etl/extract");
const transform_1 = require("../etl/transform");
const pool_1 = require("../db/pool");
// Tunable thresholds — adjust these once we see real staging traffic
// patterns; these are reasonable starting points, not final numbers.
const MAX_FAILED_MFA_PER_WINDOW = 3;
const MAX_LOGIN_FAILURES_PER_WINDOW = 5;
const MAX_DISTINCT_IPS_PER_USER = 4;
/**
 * Rule 1: too many failed MFA/OTP attempts from the same user in the window.
 */
function flagExcessiveMfaFailures(events, from, to) {
    return countAndFlag(events.filter((e) => e.eventType === 'mfa_failure'), MAX_FAILED_MFA_PER_WINDOW, 'excessive_mfa_failures', from, to);
}
/**
 * Rule 2: too many failed login attempts from the same user in the window.
 */
function flagExcessiveLoginFailures(events, from, to) {
    return countAndFlag(events.filter((e) => e.eventType === 'login_failure'), MAX_LOGIN_FAILURES_PER_WINDOW, 'excessive_login_failures', from, to);
}
/**
 * Rule 3: same user authenticating from an unusually high number of
 * distinct IPs in the window — possible credential sharing or takeover.
 */
function flagDistinctIpFanOut(events, from, to) {
    const byUser = new Map();
    for (const e of events) {
        if (!e.ip)
            continue;
        if (!byUser.has(e.userId))
            byUser.set(e.userId, new Set());
        byUser.get(e.userId).add(e.ip);
    }
    const flags = [];
    for (const [userId, ips] of byUser) {
        if (ips.size > MAX_DISTINCT_IPS_PER_USER) {
            flags.push({ userId, reason: 'distinct_ip_fan_out', count: ips.size, windowStart: from, windowEnd: to });
        }
    }
    return flags;
}
function countAndFlag(events, threshold, reason, from, to) {
    const counts = new Map();
    for (const e of events)
        counts.set(e.userId, (counts.get(e.userId) ?? 0) + 1);
    const flags = [];
    for (const [userId, count] of counts) {
        if (count >= threshold)
            flags.push({ userId, reason, count, windowStart: from, windowEnd: to });
    }
    return flags;
}
/** Runs every rule and merges the results — used by run.ts and the weekly report. */
function runAllFraudRules(events, from, to) {
    return [
        ...flagExcessiveMfaFailures(events, from, to),
        ...flagExcessiveLoginFailures(events, from, to),
        ...flagDistinctIpFanOut(events, from, to),
    ];
}
async function main() {
    const days = Number(process.argv.find((a) => a.startsWith('--days='))?.split('=')[1] ?? 7);
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    const raw = await (0, extract_1.extractAuthEvents)(from, to);
    const clean = (0, transform_1.cleanAuthEvents)(raw);
    const flags = runAllFraudRules(clean, from, to);
    console.log(`Checked ${clean.length} auth events from the last ${days} day(s).`);
    console.log(`${flags.length} fraud flag(s) raised:`);
    for (const f of flags) {
        console.log(`  - user ${f.userId}: ${f.reason} (count: ${f.count})`);
    }
    await pool_1.pool.end();
}
if (require.main === module) {
    main().catch((err) => {
        console.error('Fraud detection run failed:', err);
        process.exit(1);
    });
}
