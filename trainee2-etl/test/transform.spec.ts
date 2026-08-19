import { summarizeAdoption, summarizeLatency } from '../src/etl/transform';
import { RawIssuanceSession, RawVerificationSession } from '../src/etl/extract';

function issuance(status: string, latencyMs: number | null = null): RawIssuanceSession {
  return {
    id: 1,
    issuerId: 'iss-1',
    status,
    credentialType: null,
    startedAt: new Date(),
    completedAt: null,
    latencyMs,
  };
}

function verification(status: string, latencyMs: number | null = null): RawVerificationSession {
  return {
    id: 1,
    verifierId: 'ver-1',
    stage: 'selector',
    status,
    startedAt: new Date(),
    completedAt: null,
    latencyMs,
  };
}

describe('summarizeAdoption', () => {
  it('counts issuance and verification sessions by status', () => {
    const result = summarizeAdoption(
      [issuance('started'), issuance('completed'), issuance('completed'), issuance('failed')],
      [verification('in_progress'), verification('completed')],
    );

    expect(result.issuance).toEqual({ total: 4, started: 1, completed: 2, failed: 1 });
    expect(result.verification).toEqual({ total: 2, inProgress: 1, completed: 1, failed: 0 });
  });

  it('handles empty input', () => {
    const result = summarizeAdoption([], []);
    expect(result.issuance.total).toBe(0);
    expect(result.verification.total).toBe(0);
  });
});

describe('summarizeLatency', () => {
  it('computes avg/min/max, ignoring null latency', () => {
    const result = summarizeLatency([
      issuance('completed', 100),
      issuance('completed', 300),
      issuance('started', null),
    ]);
    expect(result.sampleSize).toBe(2);
    expect(result.avgLatencyMs).toBe(200);
    expect(result.minLatencyMs).toBe(100);
    expect(result.maxLatencyMs).toBe(300);
  });

  it('returns nulls when there is no latency data', () => {
    const result = summarizeLatency([issuance('started', null)]);
    expect(result.sampleSize).toBe(0);
    expect(result.avgLatencyMs).toBeNull();
  });
});
