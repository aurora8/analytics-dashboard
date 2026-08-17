import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import {
  extractAuthEvents,
  extractVerificationSessions,
  extractIssuanceSessions,
} from '../etl/extract';
import { cleanAuthEvents, cleanSessions } from '../etl/transform';
import { runAllFraudRules } from '../fraud/detect';
import { summarizeIpLocations } from '../geo/analyze';
import { pool } from '../db/pool';

async function main() {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [authRaw, verRaw, issRaw] = await Promise.all([
    extractAuthEvents(from, to),
    extractVerificationSessions(from, to),
    extractIssuanceSessions(from, to),
  ]);

  const authClean = cleanAuthEvents(authRaw);
  const verClean = cleanSessions(verRaw);
  const issClean = cleanSessions(issRaw);
  const fraudFlags = runAllFraudRules(authClean, from, to);
  const geoSummary = summarizeIpLocations(authRaw.map((e) => e.ipAddress));

  const avgLatency = (sessions: typeof verClean) => {
    const withLatency = sessions.filter((s) => s.latencyMs != null);
    if (withLatency.length === 0) return null;
    return Math.round(withLatency.reduce((sum, s) => sum + (s.latencyMs ?? 0), 0) / withLatency.length);
  };

  const outDir = process.env.REPORTS_OUTPUT_DIR || './reports-output';
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `weekly-report-${to.toISOString().slice(0, 10)}.pdf`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(outPath));

  doc.fontSize(20).text('Weekly Analytics Report', { align: 'center' });
  doc.fontSize(10).fillColor('gray').text(
    `${from.toDateString()} - ${to.toDateString()}`,
    { align: 'center' },
  );
  doc.moveDown(2);

  section(doc, 'Adoption');
  bullet(doc, `Verification sessions: ${verClean.length}`);
  bullet(doc, `Issuance sessions: ${issClean.length}`);
  bullet(doc, `Auth events: ${authClean.length}`);
  doc.moveDown();

  section(doc, 'Latency');
  const verAvg = avgLatency(verClean);
  const issAvg = avgLatency(issClean);
  bullet(doc, `Verification avg latency: ${verAvg != null ? verAvg + ' ms' : 'no data'}`);
  bullet(doc, `Issuance avg latency: ${issAvg != null ? issAvg + ' ms' : 'no data'}`);
  doc.moveDown();

  section(doc, 'Fraud Flags');
  if (fraudFlags.length === 0) {
    bullet(doc, 'No fraud flags raised this week.');
  } else {
    for (const f of fraudFlags) {
      bullet(doc, `User ${f.userId}: ${f.reason} (count: ${f.count})`);
    }
  }
  doc.moveDown();

  section(doc, 'Geo Breakdown (auth events by IP)');
  if (geoSummary.length === 0) {
    bullet(doc, 'No IP-tagged events this week.');
  } else {
    for (const g of geoSummary) {
      bullet(doc, `${g.country}${g.region ? '/' + g.region : ''}${g.city ? '/' + g.city : ''}: ${g.count}`);
    }
  }

  doc.end();
  await new Promise((resolve) => doc.on('end', resolve));
  console.log(`Weekly PDF report written to ${outPath}`);

  const csvPath = path.join(outDir, `weekly-report-${to.toISOString().slice(0, 10)}.csv`);
  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: 'section', title: 'Section' },
      { id: 'metric', title: 'Metric' },
      { id: 'value', title: 'Value' },
    ],
  });

  const csvRows = [
    { section: 'Adoption', metric: 'Verification sessions', value: verClean.length },
    { section: 'Adoption', metric: 'Issuance sessions', value: issClean.length },
    { section: 'Adoption', metric: 'Auth events', value: authClean.length },
    { section: 'Latency', metric: 'Verification avg latency (ms)', value: verAvg ?? 'no data' },
    { section: 'Latency', metric: 'Issuance avg latency (ms)', value: issAvg ?? 'no data' },
    ...(fraudFlags.length === 0
      ? [{ section: 'Fraud Flags', metric: 'No fraud flags raised this week', value: '' }]
      : fraudFlags.map((f) => ({
          section: 'Fraud Flags',
          metric: `User ${f.userId}: ${f.reason}`,
          value: f.count,
        }))),
    ...(geoSummary.length === 0
      ? [{ section: 'Geo Breakdown', metric: 'No IP-tagged events this week', value: '' }]
      : geoSummary.map((g) => ({
          section: 'Geo Breakdown',
          metric: `${g.country}${g.region ? '/' + g.region : ''}${g.city ? '/' + g.city : ''}`,
          value: g.count,
        }))),
  ];

  await csvWriter.writeRecords(csvRows);
  console.log(`Weekly CSV report written to ${csvPath}`);

  await pool.end();
}

function section(doc: PDFKit.PDFDocument, title: string) {
  doc.fontSize(14).fillColor('black').text(title, { underline: true });
  doc.moveDown(0.5);
}

function bullet(doc: PDFKit.PDFDocument, text: string) {
  doc.fontSize(11).fillColor('black').text(`-  ${text}`);
}

main().catch((err) => {
  console.error('Weekly report generation failed:', err);
  process.exit(1);
});