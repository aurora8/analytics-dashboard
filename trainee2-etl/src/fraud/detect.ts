import { RawAuthEvent } from '../etl/extract';

export type FraudReason =
  | 'excessive_mfa_failures'
  | 'excessive_login_failures'
  | 'multiple_ips';

export interface FraudFlag {
  userId: string;
  reason: FraudReason;
  count: number;
  detail: string;
}

export interface FraudDetectionOptions {
  mfaFailureThreshold?: number;
  loginFailureThreshold?: number;
  distinctIpThreshold?: number;
}

const DEFAULTS: Required<FraudDetectionOptions> = {
  mfaFailureThreshold: 3,
  loginFailureThreshold: 5,
  distinctIpThreshold: 3,
};

/**
 * Flags users showing patterns commonly associated with fraud or account
 * compromise: repeated failed OTP/MFA attempts, repeated failed logins
 * (brute-force pattern), or the same user authenticating from an unusually
 * high number of distinct IP addresses (credential sharing / stuffing).
 */
export function detectFraud(
  events: RawAuthEvent[],
  options: FraudDetectionOptions = {},
): FraudFlag[] {
  const opts = { ...DEFAULTS, ...options };
  const flags: FraudFlag[] = [];

  const mfaFailuresByUser = new Map<string, number>();
  const loginFailuresByUser = new Map<string, number>();
  const ipsByUser = new Map<string, Set<string>>();

  for (const event of events) {
    if (!event.userId) continue;

    if (event.eventType === 'mfa_failure') {
      mfaFailuresByUser.set(
        event.userId,
        (mfaFailuresByUser.get(event.userId) ?? 0) + 1,
      );
    }

    if (event.eventType === 'login_failure') {
      loginFailuresByUser.set(
        event.userId,
        (loginFailuresByUser.get(event.userId) ?? 0) + 1,
      );
    }

    if (event.ipAddress) {
      const set = ipsByUser.get(event.userId) ?? new Set<string>();
      set.add(event.ipAddress);
      ipsByUser.set(event.userId, set);
    }
  }

  for (const [userId, count] of mfaFailuresByUser) {
    if (count >= opts.mfaFailureThreshold) {
      flags.push({
        userId,
        reason: 'excessive_mfa_failures',
        count,
        detail: `${count} failed MFA/OTP attempts (threshold ${opts.mfaFailureThreshold})`,
      });
    }
  }

  for (const [userId, count] of loginFailuresByUser) {
    if (count >= opts.loginFailureThreshold) {
      flags.push({
        userId,
        reason: 'excessive_login_failures',
        count,
        detail: `${count} failed login attempts (threshold ${opts.loginFailureThreshold})`,
      });
    }
  }

  for (const [userId, ips] of ipsByUser) {
    if (ips.size >= opts.distinctIpThreshold) {
      flags.push({
        userId,
        reason: 'multiple_ips',
        count: ips.size,
        detail: `Authenticated from ${ips.size} distinct IP addresses (threshold ${opts.distinctIpThreshold})`,
      });
    }
  }

  return flags;
}
