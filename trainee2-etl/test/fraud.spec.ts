import { detectFraud } from '../src/fraud/detect';
import { RawAuthEvent } from '../src/etl/extract';

let nextId = 1;
function event(
  eventType: string,
  userId: string | null,
  ipAddress: string | null = null,
): RawAuthEvent {
  return {
    id: nextId++,
    eventType,
    userId,
    issuerId: null,
    verifierId: null,
    ipAddress,
    createdAt: new Date(),
  };
}

describe('detectFraud', () => {
  it('flags a user with excessive MFA failures', () => {
    const events = [
      event('mfa_failure', 'u1'),
      event('mfa_failure', 'u1'),
      event('mfa_failure', 'u1'),
      event('mfa_failure', 'u2'), // only 1 — should not be flagged
    ];
    const flags = detectFraud(events, { mfaFailureThreshold: 3 });
    expect(flags).toContainEqual(
      expect.objectContaining({ userId: 'u1', reason: 'excessive_mfa_failures', count: 3 }),
    );
    expect(flags.find((f) => f.userId === 'u2')).toBeUndefined();
  });

  it('flags a user with excessive login failures', () => {
    const events = Array.from({ length: 5 }, () => event('login_failure', 'u3'));
    const flags = detectFraud(events, { loginFailureThreshold: 5 });
    expect(flags).toContainEqual(
      expect.objectContaining({ userId: 'u3', reason: 'excessive_login_failures', count: 5 }),
    );
  });

  it('flags a user authenticating from many distinct IPs', () => {
    const events = [
      event('login_success', 'u4', '1.1.1.1'),
      event('login_success', 'u4', '2.2.2.2'),
      event('login_success', 'u4', '3.3.3.3'),
    ];
    const flags = detectFraud(events, { distinctIpThreshold: 3 });
    expect(flags).toContainEqual(
      expect.objectContaining({ userId: 'u4', reason: 'multiple_ips', count: 3 }),
    );
  });

  it('returns no flags for clean activity', () => {
    const events = [event('login_success', 'u5', '1.1.1.1'), event('mfa_success', 'u5')];
    expect(detectFraud(events)).toEqual([]);
  });

  it('ignores events with no userId', () => {
    const events = [event('login_failure', null), event('login_failure', null)];
    expect(detectFraud(events, { loginFailureThreshold: 1 })).toEqual([]);
  });
});
