# trainee2-etl (Trainee 2 — Data & ETL)

Connects directly to the same Postgres database Trainee 1 writes to
(`auth_event`, `issuance_session`, `verification_session`), and turns that
raw data into fraud flags, geo/IP breakdowns, and a weekly PDF+CSV report.

## Setup

1. Copy `.env.example` to `.env` (defaults already match the project's
   `docker-compose.yml` — port 5432, database `verifier_dashboard`).
2. Make sure the Postgres container is running: `docker-compose up -d`
   from the repo root.
3. `npm install`

## Modules

- **`src/etl/extract.ts`** — pulls raw rows from the three tables, with
  optional date-range filtering.
- **`src/etl/transform.ts`** — shared aggregation helpers: adoption counts
  by status, and latency stats (avg/min/max), reused by fraud/geo/reports.
- **`src/fraud/detect.ts`** — flags users on three signals: excessive MFA
  failures (default threshold 3), excessive login failures (default 5,
  a brute-force pattern), and authentication from an unusually high number
  of distinct IPs (default 3, a credential-sharing/stuffing signal). All
  three thresholds are configurable.
- **`src/geo/analyze.ts`** — aggregates auth events *and* verification
  sessions by country of origin using `geoip-lite`. Both `auth_event`
  and `verification_session` carry an `ipAddress` field, so this covers
  where verification requests come from, not just login/MFA activity.
- **`src/reports/weekly.ts`** — pulls the last 7 days, generates a PDF
  summary (adoption, latency, fraud, geo) and a CSV of flagged users.

## Running

```bash
npm run run    # runs the full pipeline, prints results, generates the report
npm test       # unit tests (no DB needed — pure functions on sample data)
```

Report output lands in `output/` (gitignored) as
`weekly-report-<date>.pdf` and `flagged-users-<date>.csv`.

## Notes

- All three modules (fraud, geo, transform) operate on plain in-memory
  data, so they're unit-tested without needing a live database. Only
  `extract.ts` and the `run`/report entry points touch Postgres directly.
- Fraud thresholds are reasonable defaults for a small dataset — worth
  revisiting once real usage volume is known.
