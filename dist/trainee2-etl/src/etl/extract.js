"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAuthEvents = extractAuthEvents;
exports.extractVerificationSessions = extractVerificationSessions;
exports.extractIssuanceSessions = extractIssuanceSessions;
const pool_1 = require("../db/pool");
/**
 * Pulls raw auth events for a date range. This is the "E" (extract)
 * step — no cleaning or transformation yet, just getting rows out of
 * the staging DB.
 */
async function extractAuthEvents(from, to) {
    const { rows } = await pool_1.pool.query(`SELECT id, user_id AS "userId", event_type AS "eventType",
            ip_address AS "ipAddress", created_at AS "createdAt"
     FROM auth_events
     WHERE created_at BETWEEN $1 AND $2
     ORDER BY created_at ASC`, [from, to]);
    return rows;
}
async function extractVerificationSessions(from, to) {
    const { rows } = await pool_1.pool.query(`SELECT id, verifier_id AS "ownerId", holder_did AS "holderDid", status,
            created_at AS "createdAt", completed_at AS "completedAt", latency_ms AS "latencyMs"
     FROM verification_sessions
     WHERE created_at BETWEEN $1 AND $2
     ORDER BY created_at ASC`, [from, to]);
    return rows;
}
async function extractIssuanceSessions(from, to) {
    const { rows } = await pool_1.pool.query(`SELECT id, issuer_id AS "ownerId", holder_did AS "holderDid", status,
            created_at AS "createdAt", completed_at AS "completedAt", latency_ms AS "latencyMs"
     FROM issuance_sessions
     WHERE created_at BETWEEN $1 AND $2
     ORDER BY created_at ASC`, [from, to]);
    return rows;
}
