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

INSERT INTO dids (did, owner_type, owner_id)
SELECT did, 'issuer', id FROM issuers WHERE did = 'did:example:issuer1'
UNION ALL
SELECT did, 'verifier', id FROM verifiers WHERE did = 'did:example:verifier1';

INSERT INTO verification_sessions (verifier_id, holder_did, status, completed_at, latency_ms)
SELECT id, 'did:example:holder1', 'token_issued', now(), 1200 FROM verifiers WHERE did = 'did:example:verifier1';
INSERT INTO verification_sessions (verifier_id, holder_did, status)
SELECT id, 'did:example:holder2', 'wallet_approved' FROM verifiers WHERE did = 'did:example:verifier1';
INSERT INTO verification_sessions (verifier_id, holder_did, status)
SELECT id, 'did:example:holder3', 'failed' FROM verifiers WHERE did = 'did:example:verifier1';

INSERT INTO issuance_sessions (issuer_id, holder_did, status, completed_at, latency_ms)
SELECT id, 'did:example:holder1', 'token_issued', now(), 900 FROM issuers WHERE did = 'did:example:issuer1';
INSERT INTO issuance_sessions (issuer_id, holder_did, status)
SELECT id, 'did:example:holder2', 'deeplink_opened' FROM issuers WHERE did = 'did:example:issuer1';

-- Bulk realistic-volume seed data, layered on top of the small example rows above
INSERT INTO issuers (name, did) VALUES
  ('Springfield College', 'did:example:issuer2'),
  ('Riverside Health', 'did:example:issuer3');

INSERT INTO verifiers (name, did) VALUES
  ('Downtown Bank', 'did:example:verifier2'),
  ('CityHire Recruiting', 'did:example:verifier3');

INSERT INTO dids (did, owner_type, owner_id)
SELECT did, 'issuer', id FROM issuers WHERE did IN ('did:example:issuer2', 'did:example:issuer3')
UNION ALL
SELECT did, 'verifier', id FROM verifiers WHERE did IN ('did:example:verifier2', 'did:example:verifier3');

-- 80 verification sessions over the last 14 days, weighted toward completion
INSERT INTO verification_sessions (verifier_id, holder_did, status, created_at, completed_at, latency_ms)
SELECT
  v.id,
  'did:example:holder' || gs,
  s.status,
  now() - (random() * 14) * interval '1 day',
  CASE WHEN s.status IN ('token_issued', 'wallet_approved') THEN now() ELSE NULL END,
  CASE WHEN s.status = 'token_issued' THEN (800 + random() * 2500)::int ELSE NULL END
FROM generate_series(1, 80) AS gs
CROSS JOIN LATERAL (SELECT id FROM verifiers ORDER BY random() LIMIT 1) v
CROSS JOIN LATERAL (
  SELECT (ARRAY['token_issued','token_issued','token_issued','token_issued','token_issued',
                'wallet_approved','wallet_approved',
                'deeplink_opened',
                'started',
                'failed','expired'])[floor(random()*11)::int + 1] AS status
) s;

-- 50 issuance sessions, same pattern
INSERT INTO issuance_sessions (issuer_id, holder_did, status, created_at, completed_at, latency_ms)
SELECT
  i.id,
  'did:example:holder' || (gs + 1000),
  s.status,
  now() - (random() * 14) * interval '1 day',
  CASE WHEN s.status IN ('token_issued', 'wallet_approved') THEN now() ELSE NULL END,
  CASE WHEN s.status = 'token_issued' THEN (600 + random() * 1800)::int ELSE NULL END
FROM generate_series(1, 50) AS gs
CROSS JOIN LATERAL (SELECT id FROM issuers ORDER BY random() LIMIT 1) i
CROSS JOIN LATERAL (
  SELECT (ARRAY['token_issued','token_issued','token_issued','token_issued','token_issued',
                'wallet_approved','wallet_approved',
                'deeplink_opened',
                'started',
                'failed','expired'])[floor(random()*11)::int + 1] AS status
) s;

-- 200 auth events across 30 users over the last 14 days
INSERT INTO auth_events (user_id, event_type, ip_address, created_at)
SELECT
  'user-' || (1 + floor(random() * 30))::int,
  e.event_type,
  ('203.0.113.' || (1 + floor(random() * 254))::int)::inet,
  now() - (random() * 14) * interval '1 day'
FROM generate_series(1, 200) AS gs
CROSS JOIN LATERAL (
  SELECT (ARRAY['login_attempt','login_attempt','login_success','login_success','login_success',
                'login_failure',
                'mfa_challenge','mfa_challenge',
                'mfa_success','mfa_success',
                'mfa_failure'])[floor(random()*11)::int + 1] AS event_type
) e;