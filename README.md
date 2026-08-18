# dashboard-backend (Trainee 1 — Backend & APIs)

NestJS + TypeORM + Postgres. Logs auth/issuance/verification events and
exposes aggregated metrics for the dashboard frontend.

## Setup

1. Copy `.env.example` to `.env` and adjust if your Postgres isn't on
   the default port.
2. `npm install`
3. Make sure Postgres is running (see docker command below).
4. `npm run start:dev` — tables are auto-created on first boot
   (`synchronize: true`; switch this off in favor of migrations before
   this ever points at a shared/production database).

```bash
docker run --name dashboard-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=dashboard -p 5433:5432 -d postgres:15
```

## Logging endpoints (write)

- `POST /auth-events` — `{ eventType, userId?, issuerId?, verifierId?, ipAddress?, metadata? }`
  `eventType` is one of `login_attempt | login_success | login_failure | mfa_success | mfa_failure`.
- `POST /issuance-sessions` — `{ issuerId, credentialType? }` → starts a session.
- `PATCH /issuance-sessions/:id` — `{ status: "completed" | "failed" }` → closes it and records latency.
- `POST /verification-sessions` — `{ verifierId }` → starts a session at the `selector` stage.
- `PATCH /verification-sessions/:id` — `{ stage?, status? }` → advances the funnel stage and/or closes the session.
  `stage` is one of `selector | deeplink | wallet_approval | token_issuance`.

## Metrics endpoints (read, for the dashboard)

All accept optional query filters: `startDate`, `endDate` (ISO 8601), `issuerId`, `verifierId`.

- `GET /metrics/overview` — top-line counts across auth/issuance/verification.
- `GET /metrics/auth` — login/MFA success & failure counts, rates, and a per-day breakdown.
- `GET /metrics/funnel/:kind` — `:kind` is `issuance` or `verification`. Verification returns
  cumulative counts through selector → deeplink → wallet_approval → token_issuance.
- `GET /metrics/latency/:kind` — `:kind` is `issuance` or `verification`. avg/min/max latency
  (ms) plus a per-day average.

## Tests

`npm test` runs `test/metrics.service.spec.ts` against a real Postgres database
(not a mocked query builder), so the SQL aggregations are actually exercised.
It uses its own database so it never touches dev data — set `TEST_DB_NAME` if
you don't want the default `dashboard_test`, and create that database once:

```bash
docker exec -it dashboard-postgres psql -U postgres -c "CREATE DATABASE dashboard_test;"
```
