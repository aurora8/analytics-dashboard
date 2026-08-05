# Trainee 1 — Backend & APIs

Covers the four Trainee 1 deliverables:

1. **NestJS logging** — `src/logging/` — `LoggingService` records login
   attempts, login/MFA success or failure into `auth_events`. Call it
   from wherever the real auth flow lives (`recordLoginAttempt`,
   `recordLoginResult`, `recordMfaResult`).
2. **Database schema** — `init.sql` — tables for issuers, verifiers,
   DIDs, verification sessions, issuance sessions, and auth/MFA
   events, matched by the TypeORM entities in `src/entities/`.
3. **`/metrics` API endpoints** — `src/metrics/` — JSON for the
   dashboard:
   - `GET /metrics/overview` — top-level counts
   - `GET /metrics/auth` — login/MFA success vs failure counts
   - `GET /metrics/funnel/:kind` (`verification` | `issuance`) —
     selector → deeplink → wallet approval → token issuance funnel
   - `GET /metrics/latency/:kind` — average latency per day
   - All accept `?from=&to=&issuerId=&verifierId=` filters.
4. **Tests** — `test/metrics.service.spec.ts` — unit tests for the
   metrics queries against a mocked repository (no DB needed to run
   them).

## Running locally

We don't have the real staging DB connection yet, so this ships with
a local Postgres via Docker (same pattern as the IMDb import guide —
container + init script + verify with a query) as a placeholder:

```bash
docker compose up -d          # starts Postgres and loads init.sql
npm install
cp .env.example .env          # DATABASE_URL points at the local container
npm run start:dev
curl http://localhost:3000/metrics/overview
```

Run tests:

```bash
npm test
```

## Swapping in the real staging DB

Once we get the staging connection URL, set `DATABASE_URL` in `.env`
to it and drop `docker-compose.yml`/`init.sql`. If the real schema's
column or table names differ from `init.sql`'s guesses, update the
entities in `src/entities/` to match — the service/controller layer
above them doesn't need to change.

## Notes / assumptions

- Session `status` is modeled as the furthest funnel stage reached
  (`started` → `deeplink_opened` → `wallet_approved` →
  `token_issued`, plus `failed`/`expired`). Adjust if the real
  verifier/issuer flow uses different stage names.
- `synchronize: false` in `app.module.ts` — schema changes should go
  through `init.sql` or a migration, not TypeORM auto-sync, once this
  is shared across branches.
