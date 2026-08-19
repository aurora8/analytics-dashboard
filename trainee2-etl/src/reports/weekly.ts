import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';
import {
  extractAuthEvents,
  extractIssuanceSessions,
  extractVerificationSessions,
} from '../etl/extract';
import { summarizeAdoption, summarizeLatency } from '../etl/transform';
import { detectFraud, FraudFlag } from '../fraud/detect';
import { analyzeGeo, GeoCount } from '../geo/analyze';

export interface WeeklyReportResult {
  pdfPath: string;
  csvPath: string;
  rangeStart: Date;
  rangeEnd: Date;
  flaggedUserCount: number;
}

function section(doc: PDFKit.PDFDocument, title: string): void {
  doc.moveDown(0.5);
  doc.fontSize(14).fillColor('#111').text(title, { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor('#333');
}

function bullet(doc: PDFKit.PDFDocument, text: string): void {
  doc.text(`\u2022 ${text}`, { indent: 12 });
}

export async function generateWeeklyReport(
  outputDir: string,
  now: Date = new Date(),
): Promise<WeeklyReportResult> {
  const rangeEnd = now;
  const rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [authEvents, issuanceSessions, verificationSessions] = await Promise.all([
    extractAuthEvents({ startDate: rangeStart, endDate: rangeEnd }),
    extractIssuanceSessions({ startDate: rangeStart, endDate: rangeEnd }),
    extractVerificationSessions({ startDate: rangeStart, endDate: rangeEnd }),
  ]);

  const adoption = summarizeAdoption(issuanceSessions, verificationSessions);
  const issuanceLatency = summarizeLatency(issuanceSessions);
  const verificationLatency = summarizeLatency(verificationSessions);
  const fraudFlags = detectFraud(authEvents);
  const geo = analyzeGeo([...authEvents, ...verificationSessions]);

  fs.mkdirSync(outputDir, { recursive: true });
  const dateStamp = rangeEnd.toISOString().slice(0, 10);
  const pdfPath = path.join(outputDir, `weekly-report-${dateStamp}.pdf`);
  const csvPath = path.join(outputDir, `flagged-users-${dateStamp}.csv`);

  await writePdf(pdfPath, {
    rangeStart,
    rangeEnd,
    adoption,
    issuanceLatency,
    verificationLatency,
    fraudFlags,
    geo,
  });

  writeCsv(csvPath, fraudFlags);

  return {
    pdfPath,
    csvPath,
    rangeStart,
    rangeEnd,
    flaggedUserCount: fraudFlags.length,
  };
}

function writeCsv(csvPath: string, fraudFlags: FraudFlag[]): void {
  const rows = fraudFlags.map((f) => ({
    userId: f.userId,
    reason: f.reason,
    count: f.count,
    detail: f.detail,
  }));
  const csv = stringify(rows, {
    header: true,
    columns: ['userId', 'reason', 'count', 'detail'],
  });
  fs.writeFileSync(csvPath, csv);
}

interface PdfData {
  rangeStart: Date;
  rangeEnd: Date;
  adoption: ReturnType<typeof summarizeAdoption>;
  issuanceLatency: ReturnType<typeof summarizeLatency>;
  verificationLatency: ReturnType<typeof summarizeLatency>;
  fraudFlags: FraudFlag[];
  geo: GeoCount[];
}

function writePdf(pdfPath: string, data: PdfData): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.fontSize(20).fillColor('#111').text('Weekly Verifier Dashboard Report');
    doc
      .fontSize(11)
      .fillColor('#666')
      .text(
        `${data.rangeStart.toDateString()} \u2013 ${data.rangeEnd.toDateString()}`,
      );

    section(doc, 'Adoption');
    bullet(
      doc,
      `Issuance sessions: ${data.adoption.issuance.total} total (${data.adoption.issuance.completed} completed, ${data.adoption.issuance.failed} failed, ${data.adoption.issuance.started} in progress)`,
    );
    bullet(
      doc,
      `Verification sessions: ${data.adoption.verification.total} total (${data.adoption.verification.completed} completed, ${data.adoption.verification.failed} failed, ${data.adoption.verification.inProgress} in progress)`,
    );

    section(doc, 'Latency');
    bullet(
      doc,
      data.issuanceLatency.sampleSize > 0
        ? `Issuance: avg ${data.issuanceLatency.avgLatencyMs}ms (min ${data.issuanceLatency.minLatencyMs}ms, max ${data.issuanceLatency.maxLatencyMs}ms, n=${data.issuanceLatency.sampleSize})`
        : 'Issuance: no completed sessions with latency data this period',
    );
    bullet(
      doc,
      data.verificationLatency.sampleSize > 0
        ? `Verification: avg ${data.verificationLatency.avgLatencyMs}ms (min ${data.verificationLatency.minLatencyMs}ms, max ${data.verificationLatency.maxLatencyMs}ms, n=${data.verificationLatency.sampleSize})`
        : 'Verification: no completed sessions with latency data this period',
    );

    section(doc, 'Fraud');
    if (data.fraudFlags.length === 0) {
      bullet(doc, 'No users flagged this period.');
    } else {
      bullet(doc, `${data.fraudFlags.length} user(s) flagged \u2014 see attached CSV for details:`);
      for (const flag of data.fraudFlags.slice(0, 15)) {
        bullet(doc, `  ${flag.userId}: ${flag.detail}`);
      }
      if (data.fraudFlags.length > 15) {
        bullet(doc, `  \u2026and ${data.fraudFlags.length - 15} more`);
      }
    }

    section(doc, 'Geo / IP Origin (by country)');
    if (data.geo.length === 0) {
      bullet(doc, 'No auth events with IP data this period.');
    } else {
      for (const g of data.geo.slice(0, 10)) {
        bullet(doc, `${g.country}: ${g.count}`);
      }
    }

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}
