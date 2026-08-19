import { extractAuthEvents } from '../etl/extract';
import { cleanAuthEvents, CleanAuthEvent } from '../etl/transform';
import { pool } from '../db/pool';

export interface FraudFlag {
  userId: string;
  reason: string;
  count: number;
  windowStart: Date;
  windowEnd: Date;
}

// Tunable thresholds — adjust these once we see real staging traffic
// patterns; these are reasonable starting points, not final numbers.
const MAX_FAILED_MFA_PER_WINDOW = 3;
const MAX_LOGIN_FAILURES_PER_WINDOW = 5;
const MAX_DISTINCT_IPS_PER_USER = 4;

/**
 * Rule 1: too many failed MFA/OTP attempts from the same user in the window.
 */
export function flagExcessiveMfaFailures(events: CleanAuthEvent[], from: Date, to: Date): FraudFlag[] {
  return countAndFlag(
    events.filter((e) => e.eventType === 'mfa_failure'),
    MAX_FAILED_MFA_PER_WINDOW,
    'excessive_mfa_failures',
    from,
    to,
  );
}

/**
 * Rule 2: too many failed login attempts from the same user in the window.
 */
export function flagExcessiveLoginFailures(events: CleanAuthEvent[], from: Date, to: Date): FraudFlag[] {
  return countAndFlag(
    events.filter((e) => e.eventType === 'login_failure'),
    MAX_LOGIN_FAILURES_PER_WINDOW,
    'excessive_login_failures',
    from,
    to,
  );
}

/**
 * Rule 3: same user authenticating from an unusually high number of
 * distinct IPs in the window — possible credential sharing or takeover.
 */
export function flagDistinctIpFanOut(events: CleanAuthEvent[], from: Date, to: Date): FraudFlag[] {
  const byUser = new Map<string, Set<string>>();
  for (const e of events) {
    if (!e.ip) continue;
    if (!byUser.has(e.userId)) byUser.set(e.userId, new Set());
    byUser.get(e.userId)!.add(e.ip);
  }
  const flags: FraudFlag[] = [];
  for (const [userId, ips] of byUser) {
    if (ips.size > MAX_DISTINCT_IPS_PER_USER) {
      flags.push({ userId, reason: 'distinct_ip_fan_out', count: ips.size, windowStart: from, windowEnd: to });
    }
  }
  return flags;
}

function countAndFlag(
  events: CleanAuthEvent[],
  threshold: number,
  reason: string,
  from: Date,
  to: Date,
): FraudFlag[] {
  const counts = new Map<string, number>();
  for (const e of events) counts.set(e.userId, (counts.get(e.userId) ?? 0) + 1);
  const flags: FraudFlag[] = [];
  for (const [userId, count] of counts) {
    if (count >= threshold) flags.push({ userId, reason, count, windowStart: from, windowEnd: to });
  }
  return flags;
}

/** Runs every rule and merges the results — used by run.ts and the weekly report. */
export function runAllFraudRules(events: CleanAuthEvent[], from: Date, to: Date): FraudFlag[] {
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

  const raw = await extractAuthEvents(from, to);
  const clean = cleanAuthEvents(raw);
  const flags = runAllFraudRules(clean, from, to);

  console.log(`Checked ${clean.length} auth events from the last ${days} day(s).`);
  console.log(`${flags.length} fraud flag(s) raised:`);
  for (const f of flags) {
    console.log(`  - user ${f.userId}: ${f.reason} (count: ${f.count})`);
  }

  await pool.end();
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fraud detection run failed:', err);
    process.exit(1);
  });
}
