import { analyzeGeo } from '../src/geo/analyze';
import { RawAuthEvent } from '../src/etl/extract';

let nextId = 1;
function event(ipAddress: string | null): RawAuthEvent {
  return {
    id: nextId++,
    eventType: 'login_success',
    userId: 'u1',
    issuerId: null,
    verifierId: null,
    ipAddress,
    createdAt: new Date(),
  };
}

describe('analyzeGeo', () => {
  it('resolves known public IPs to a real country code', () => {
    const result = analyzeGeo([event('8.8.8.8')]);
    expect(result).toHaveLength(1);
    expect(result[0].country).not.toBe('Unknown');
    expect(result[0].country).toMatch(/^[A-Z]{2}$/);
  });

  it('groups and counts by country, sorted descending', () => {
    const result = analyzeGeo([
      event('8.8.8.8'),
      event('8.8.4.4'), // also Google, same country
      event(null), // no IP — should be skipped entirely
    ]);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].count).toBeGreaterThanOrEqual(result[result.length - 1].count);
    const total = result.reduce((sum, r) => sum + r.count, 0);
    expect(total).toBe(2);
  });

  it('marks unresolvable private IPs as Unknown', () => {
    const result = analyzeGeo([event('10.0.0.1')]);
    expect(result).toEqual([{ country: 'Unknown', count: 1 }]);
  });

  it('marks IPs that resolve with an empty country string as Unknown (e.g. some anycast IPs)', () => {
    const result = analyzeGeo([event('1.1.1.1')]);
    expect(result).toEqual([{ country: 'Unknown', count: 1 }]);
  });

  it('returns an empty array when there are no events with IPs', () => {
    expect(analyzeGeo([event(null)])).toEqual([]);
  });

  it('also works with verification sessions, and with both sources combined', () => {
    const verificationSession = {
      id: 1,
      verifierId: 'ver-1',
      stage: 'selector',
      status: 'in_progress',
      ipAddress: '8.8.8.8',
      startedAt: new Date(),
      completedAt: null,
      latencyMs: null,
    };
    const result = analyzeGeo([event('8.8.8.8'), verificationSession]);
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2);
  });
});
