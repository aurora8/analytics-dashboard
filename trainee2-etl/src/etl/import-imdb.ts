import { execFileSync } from 'child_process';

/**
 * Rewritten ETL pipeline for the IMDb dataset (the old extract/transform
 * scripts pulled from auth_events/verification_sessions/issuance_sessions,
 * which don't exist in this database at all — this replaces them).
 *
 * This codifies the same steps done by hand: for each table, copy its
 * unzipped .tsv file into the imdb-postgres container and run \copy with
 * FORMAT text (not csv — IMDb's files aren't CSV-quoted, and a literal
 * quote character in a title breaks csv-mode parsing).
 *
 * Assumes: imdb-postgres container is running, and the unzipped .tsv
 * files already exist at TSV_DIR (default: $TEMP, matching where they
 * were unzipped to tonight).
 *
 * Usage: npm run etl:import -- --table title_basics
 *        npm run etl:import            (imports all tables in FK order)
 */

const CONTAINER = 'imdb-postgres';
const DB = 'imdb';
const TSV_DIR = process.env.TSV_DIR ?? process.env.TEMP ?? '.';

interface TableSpec {
  table: string;
  tsvFile: string;
}

// Order matters: title_basics and name_basics first, since everything
// else has a foreign key pointing at one or both of them.
const TABLES: TableSpec[] = [
  { table: 'title_basics', tsvFile: 'title.basics.tsv' },
  { table: 'name_basics', tsvFile: 'name.basics.tsv' },
  { table: 'title_ratings', tsvFile: 'title.ratings.tsv' },
  { table: 'title_crew', tsvFile: 'title.crew.tsv' },
  { table: 'title_episode', tsvFile: 'title.episode.tsv' },
  { table: 'title_principals', tsvFile: 'title.principals.tsv' },
];

function runPsql(sql: string): string {
  return execFileSync('docker', ['exec', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-c', sql], {
    encoding: 'utf-8',
  });
}

function importTable(spec: TableSpec) {
  const containerPath = `/${spec.tsvFile}`;
  const hostPath = `${TSV_DIR}\\${spec.tsvFile}`;

  console.log(`\n[${spec.table}] copying ${spec.tsvFile} into the container...`);
  execFileSync('docker', ['cp', hostPath, `${CONTAINER}:${containerPath}`]);

  console.log(`[${spec.table}] importing (FORMAT text)...`);
  const out = runPsql(
    `\\copy ${spec.table} FROM '${containerPath}' WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N', HEADER true)`,
  );
  console.log(`[${spec.table}] ${out.trim()}`);
}

async function main() {
  const tableArg = process.argv.find((a) => a.startsWith('--table='))?.split('=')[1];
  const targets = tableArg ? TABLES.filter((t) => t.table === tableArg) : TABLES;

  if (tableArg && targets.length === 0) {
    console.error(`Unknown table "${tableArg}". Valid options: ${TABLES.map((t) => t.table).join(', ')}`);
    process.exit(1);
  }

  console.log(`Importing ${targets.length} table(s) from ${TSV_DIR}...`);
  for (const spec of targets) {
    importTable(spec);
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Import failed:', err.message ?? err);
  process.exit(1);
});
