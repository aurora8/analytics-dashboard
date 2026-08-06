import { AuthEventRow, SessionRow } from './extract';

export interface CleanAuthEvent {
  userId: string;
  eventType: string;
  ip: string | null;
  timestamp: Date;
}

export interface CleanSession {
  ownerId: string;
  holderDid: string;
  status: string;
  latencyMs: number | null;
  durationBucket: 'fast' | 'normal' | 'slow' | 'unknown';
  timestamp: Date;
}

const SLOW_LATENCY_MS = 5000;
const FAST_LATENCY_MS = 1000;

/**
 * The "T" (transform) step: drop obviously bad rows, normalize field
 * names/casing, and derive a couple of fields analysis and reports
 * both need repeatedly (e.g. latency buckets).
 */
export function cleanAuthEvents(rows: AuthEventRow[]): CleanAuthEvent[] {
  return rows
    .filter((r) => !!r.userId && !!r.eventType) // drop rows missing the fields we key on
    .map((r) => ({
      userId: r.userId,
      eventType: r.eventType,
      ip: r.ipAddress?.trim() || null,
      timestamp: r.createdAt,
    }));
}

export function cleanSessions(rows: SessionRow[]): CleanSession[] {
  return rows
    .filter((r) => !!r.ownerId)
    .map((r) => ({
      ownerId: r.ownerId,
      holderDid: r.holderDid,
      status: r.status,
      latencyMs: r.latencyMs,
      durationBucket: bucketLatency(r.latencyMs),
      timestamp: r.createdAt,
    }));
}

function bucketLatency(ms: number | null): CleanSession['durationBucket'] {
  if (ms == null) return 'unknown';
  if (ms <= FAST_LATENCY_MS) return 'fast';
  if (ms >= SLOW_LATENCY_MS) return 'slow';
  return 'normal';
}
