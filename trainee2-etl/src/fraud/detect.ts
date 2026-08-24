import { pool } from '../db/pool';

/**
 * Rewritten for IMDb: the old version flagged users with too many failed
 * OTPs. This checks for the kind of bad rows actually found while
 * importing the IMDb data tonight — implausible years, and runtimes far
 * outside any real movie's length. Not "fraud" in this dataset, but the
 * same idea: flag records worth a second look before trusting them.
 *
 * Usage: npm run fraud (script name kept as-is to avoid touching
 * package.json/npm-script wiring; it's a data-quality check now)
 */
async function main() {
  const currentYear = new Date().getFullYear();

  const badYears = await pool.query(
    `SELECT tconst, primarytitle, startyear
     FROM title_basics
     WHERE startyear IS NOT NULL AND (startyear < 1870 OR startyear > $1 + 3)
     ORDER BY startyear DESC
     LIMIT 20`,
    [currentYear],
  );

  const badRuntimes = await pool.query(
    `SELECT tconst, primarytitle, runtimeminutes
     FROM title_basics
     WHERE titletype = 'movie' AND runtimeminutes IS NOT NULL
       AND (runtimeminutes < 5 OR runtimeminutes > 600)
     ORDER BY runtimeminutes DESC
     LIMIT 20`,
  );

  console.log(`Implausible years (before 1870 or more than 3 years out): ${badYears.rowCount}`);
  for (const row of badYears.rows) {
    console.log(`  ${row.tconst}  ${row.primarytitle}  (${row.startyear})`);
  }

  console.log(`\nImplausible runtimes (under 5 min or over 600 min): ${badRuntimes.rowCount}`);
  for (const row of badRuntimes.rows) {
    console.log(`  ${row.tconst}  ${row.primarytitle}  (${row.runtimeminutes} min)`);
  }
}

main().catch((err) => {
  console.error('Data quality check failed:', err.message ?? err);
  process.exit(1);
});
