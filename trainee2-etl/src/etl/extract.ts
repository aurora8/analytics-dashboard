import { pool } from '../db/pool';

export interface RawAuthEvent {
  id: number;
  eventType: string;
  userId: string | null;
  issuerId: string | null;
  verifierId: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

export interface RawIssuanceSession {
  id: number;
  issuerId: string;
  status: string;
  credentialType: string | null;
  startedAt: Date;
  completedAt: Date | null;
  latencyMs: number | null;
}

export interface RawVerificationSession {
  id: number;
  verifierId: string;
  stage: string;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
  latencyMs: number | null;
}

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export async function extractAuthEvents(
  range: DateRange = {},
): Promise<RawAuthEvent[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (range.startDate) {
    params.push(range.startDate);
    clauses.push(`"createdAt" >= $${params.length}`);
  }
  if (range.endDate) {
    params.push(range.endDate);
    clauses.push(`"createdAt" <= $${params.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query<RawAuthEvent>(
    `SELECT id, "eventType", "userId", "issuerId", "verifierId", "ipAddress", "createdAt"
     FROM auth_event ${where}
     ORDER BY "createdAt" ASC`,
    params,
  );
  return rows;
}

export async function extractIssuanceSessions(
  range: DateRange = {},
): Promise<RawIssuanceSession[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (range.startDate) {
    params.push(range.startDate);
    clauses.push(`"startedAt" >= $${params.length}`);
  }
  if (range.endDate) {
    params.push(range.endDate);
    clauses.push(`"startedAt" <= $${params.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query<RawIssuanceSession>(
    `SELECT id, "issuerId", status, "credentialType", "startedAt", "completedAt", "latencyMs"
     FROM issuance_session ${where}
     ORDER BY "startedAt" ASC`,
    params,
  );
  return rows;
}

export async function extractVerificationSessions(
  range: DateRange = {},
): Promise<RawVerificationSession[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (range.startDate) {
    params.push(range.startDate);
    clauses.push(`"startedAt" >= $${params.length}`);
  }
  if (range.endDate) {
    params.push(range.endDate);
    clauses.push(`"startedAt" <= $${params.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query<RawVerificationSession>(
    `SELECT id, "verifierId", stage, status, "startedAt", "completedAt", "latencyMs"
     FROM verification_session ${where}
     ORDER BY "startedAt" ASC`,
    params,
  );
  return rows;
}
