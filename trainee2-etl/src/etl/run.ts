import * as path from 'path';
import {
  extractAuthEvents,
  extractIssuanceSessions,
  extractVerificationSessions,
} from './extract';
import { summarizeAdoption, summarizeLatency } from './transform';
import { detectFraud } from '../fraud/detect';
import { analyzeGeo } from '../geo/analyze';
import { generateWeeklyReport } from '../reports/weekly';
import { closePool } from '../db/pool';

async function main(): Promise<void> {
  console.log('Extracting data...');
  const [authEvents, issuanceSessions, verificationSessions] = await Promise.all([
    extractAuthEvents(),
    extractIssuanceSessions(),
    extractVerificationSessions(),
  ]);
  console.log(
    `  ${authEvents.length} auth events, ${issuanceSessions.length} issuance sessions, ${verificationSessions.length} verification sessions`,
  );

  console.log('\nAdoption:');
  console.log(JSON.stringify(summarizeAdoption(issuanceSessions, verificationSessions), null, 2));

  console.log('\nLatency (issuance):');
  console.log(JSON.stringify(summarizeLatency(issuanceSessions), null, 2));
  console.log('Latency (verification):');
  console.log(JSON.stringify(summarizeLatency(verificationSessions), null, 2));

  console.log('\nFraud flags:');
  console.log(JSON.stringify(detectFraud(authEvents), null, 2));

  console.log('\nGeo breakdown:');
  console.log(JSON.stringify(analyzeGeo(authEvents), null, 2));

  console.log('\nGenerating weekly report (PDF + CSV)...');
  const outputDir = path.join(__dirname, '..', '..', 'output');
  const result = await generateWeeklyReport(outputDir);
  console.log(`  PDF: ${result.pdfPath}`);
  console.log(`  CSV: ${result.csvPath}`);
  console.log(`  ${result.flaggedUserCount} user(s) flagged`);

  await closePool();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
