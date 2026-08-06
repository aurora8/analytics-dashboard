import { pool } from '../db/pool';

export interface AuthEventRow {
  id: string;
  userId: string;
  eventType: string;
  ipAddress: string | null;
  createdAt: Date;
}

export interface SessionRow {
  id: string;
  ownerId: string; // verifierId or issuerId
  holderDid: string;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  latencyMs: number | null;
}

/**
 * Pulls raw auth events for a date range. This is the "E" (extract)
 * step — no cleaning or transformation yet, just getting rows out of
 * the staging DB.
 */
export async function extractAuthEvents(from: Date, to: Date): Promise<AuthEventRow[]> {
  const { rows } = await pool.query(
    `SELECT id, user_id AS "userId", event_type AS "eventType",
            ip_address AS "ipAddress", created_at AS "createdAt"
     FROM auth_events
     WHERE created_at BETWEEN $1 AND $2
     ORDER BY created_at ASC`,
    [from, to],
  );
  return rows;
}

export async function extractVerificationSessions(from: Date, to: Date): Promise<SessionRow[]> {
  const { rows } = await pool.query(
    `SELECT id, verifier_id AS "ownerId", holder_did AS "holderDid", status,
            created_at AS "createdAt", completed_at AS "completedAt", latency_ms AS "latencyMs"
     FROM verification_sessions
     WHERE created_at BETWEEN $1 AND $2
     ORDER BY created_at ASC`,
    [from, to],
  );
  return rows;
}

export async function extractIssuanceSessions(from: Date, to: Date): Promise<SessionRow[]> {
  const { rows } = await pool.query(
    `SELECT id, issuer_id AS "ownerId", holder_did AS "holderDid", status,
            created_at AS "createdAt", completed_at AS "completedAt", latency_ms AS "latencyMs"
     FROM issuance_sessions
     WHERE created_at BETWEEN $1 AND $2
     ORDER BY created_at ASC`,
    [from, to],
  );
  return rows;
}
