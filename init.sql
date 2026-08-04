-- Schema for Trainee 1 (Backend & APIs)
-- Covers: issuers, verifiers, DIDs, verification sessions, issuance
-- sessions, and auth/MFA events. Swap this out for the real staging
-- schema once it's shared — table/column names here are a reasonable
-- guess based on the task description and should be adjusted to match.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE issuers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  did TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE verifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  did TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did TEXT UNIQUE NOT NULL,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('issuer', 'verifier', 'holder')),
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE issuance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer_id UUID NOT NULL REFERENCES issuers(id),
  holder_did TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'deeplink_opened', 'wallet_approved', 'token_issued', 'failed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  latency_ms INT
);

CREATE TABLE verification_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verifier_id UUID NOT NULL REFERENCES verifiers(id),
  holder_did TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'deeplink_opened', 'wallet_approved', 'token_issued', 'failed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  latency_ms INT
);

CREATE TABLE auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('login_attempt', 'login_success', 'login_failure', 'mfa_challenge', 'mfa_success', 'mfa_failure')),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_events_type_time ON auth_events(event_type, created_at);
CREATE INDEX idx_verification_sessions_status ON verification_sessions(status, created_at);
CREATE INDEX idx_issuance_sessions_status ON issuance_sessions(status, created_at);

-- Seed a little sample data so /metrics has something to return locally
INSERT INTO issuers (name, did) VALUES ('Acme University', 'did:example:issuer1');
INSERT INTO verifiers (name, did) VALUES ('Acme Employer', 'did:example:verifier1');

INSERT INTO auth_events (user_id, event_type, ip_address)
VALUES
  ('user-1', 'login_attempt', '203.0.113.10'),
  ('user-1', 'login_success', '203.0.113.10'),
  ('user-2', 'login_attempt', '198.51.100.20'),
  ('user-2', 'mfa_challenge', '198.51.100.20'),
  ('user-2', 'mfa_failure', '198.51.100.20'),
  ('user-2', 'mfa_failure', '198.51.100.20');
