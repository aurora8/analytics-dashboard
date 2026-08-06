import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Shared connection pool for every script in this package. Same
 * schema Trainee 1 set up (issuers, verifiers, dids, verification_sessions,
 * issuance_sessions, auth_events) — point DATABASE_URL at the real
 * staging DB once we have it, nothing else here changes.
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
