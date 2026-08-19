import {
  RawIssuanceSession,
  RawVerificationSession,
} from './extract';

export interface AdoptionSummary {
  issuance: { total: number; started: number; completed: number; failed: number };
  verification: { total: number; inProgress: number; completed: number; failed: number };
}

export function summarizeAdoption(
  issuanceSessions: RawIssuanceSession[],
  verificationSessions: RawVerificationSession[],
): AdoptionSummary {
  const issuance = { total: 0, started: 0, completed: 0, failed: 0 };
  for (const s of issuanceSessions) {
    issuance.total += 1;
    if (s.status === 'started') issuance.started += 1;
    else if (s.status === 'completed') issuance.completed += 1;
    else if (s.status === 'failed') issuance.failed += 1;
  }

  const verification = { total: 0, inProgress: 0, completed: 0, failed: 0 };
  for (const s of verificationSessions) {
    verification.total += 1;
    if (s.status === 'in_progress') verification.inProgress += 1;
    else if (s.status === 'completed') verification.completed += 1;
    else if (s.status === 'failed') verification.failed += 1;
  }

  return { issuance, verification };
}

export interface LatencyStats {
  avgLatencyMs: number | null;
  minLatencyMs: number | null;
  maxLatencyMs: number | null;
  sampleSize: number;
}

/** Works for either issuance or verification sessions — both share the same latencyMs shape. */
export function summarizeLatency(
  sessions: { latencyMs: number | null }[],
): LatencyStats {
  const values = sessions
    .map((s) => s.latencyMs)
    .filter((v): v is number => v !== null && v !== undefined);

  if (values.length === 0) {
    return { avgLatencyMs: null, minLatencyMs: null, maxLatencyMs: null, sampleSize: 0 };
  }

  const sum = values.reduce((a, b) => a + b, 0);
  return {
    avgLatencyMs: Math.round(sum / values.length),
    minLatencyMs: Math.min(...values),
    maxLatencyMs: Math.max(...values),
    sampleSize: values.length,
  };
}
