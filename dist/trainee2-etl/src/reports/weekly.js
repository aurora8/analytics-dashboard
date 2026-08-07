"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const extract_1 = require("../etl/extract");
const transform_1 = require("../etl/transform");
const detect_1 = require("../fraud/detect");
const analyze_1 = require("../geo/analyze");
const pool_1 = require("../db/pool");
/**
 * Builds the weekly PDF summary: adoption (session volume), fraud
 * flags, and latency — the three things the task list asks for.
 * Run with: npm run report:weekly
 */
async function main() {
    const to = new Date();
    const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [authRaw, verRaw, issRaw] = await Promise.all([
        (0, extract_1.extractAuthEvents)(from, to),
        (0, extract_1.extractVerificationSessions)(from, to),
        (0, extract_1.extractIssuanceSessions)(from, to),
    ]);
    const authClean = (0, transform_1.cleanAuthEvents)(authRaw);
    const verClean = (0, transform_1.cleanSessions)(verRaw);
    const issClean = (0, transform_1.cleanSessions)(issRaw);
    const fraudFlags = (0, detect_1.runAllFraudRules)(authClean, from, to);
    const geoSummary = (0, analyze_1.summarizeIpLocations)(authRaw.map((e) => e.ipAddress));
    const avgLatency = (sessions) => {
        const withLatency = sessions.filter((s) => s.latencyMs != null);
        if (withLatency.length === 0)
            return null;
        return Math.round(withLatency.reduce((sum, s) => sum + (s.latencyMs ?? 0), 0) / withLatency.length);
    };
    const outDir = process.env.REPORTS_OUTPUT_DIR || './reports-output';
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `weekly-report-${to.toISOString().slice(0, 10)}.pdf`);
    const doc = new pdfkit_1.default({ margin: 50 });
    doc.pipe(fs.createWriteStream(outPath));
    doc.fontSize(20).text('Weekly Analytics Report', { align: 'center' });
    doc.fontSize(10).fillColor('gray').text(`${from.toDateString()} — ${to.toDateString()}`, { align: 'center' });
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
    }
    else {
        for (const f of fraudFlags) {
            bullet(doc, `User ${f.userId}: ${f.reason} (count: ${f.count})`);
        }
    }
    doc.moveDown();
    section(doc, 'Geo Breakdown (auth events by IP)');
    if (geoSummary.length === 0) {
        bullet(doc, 'No IP-tagged events this week.');
    }
    else {
        for (const g of geoSummary) {
            bullet(doc, `${g.country}${g.region ? '/' + g.region : ''}${g.city ? '/' + g.city : ''}: ${g.count}`);
        }
    }
    doc.end();
    await new Promise((resolve) => doc.on('end', resolve));
    console.log(`Weekly report written to ${outPath}`);
    await pool_1.pool.end();
}
function section(doc, title) {
    doc.fontSize(14).fillColor('black').text(title, { underline: true });
    doc.moveDown(0.5);
}
function bullet(doc, text) {
    doc.fontSize(11).fillColor('black').text(`•  ${text}`);
}
main().catch((err) => {
    console.error('Weekly report generation failed:', err);
    process.exit(1);
});
