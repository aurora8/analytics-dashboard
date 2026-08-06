"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auth_event_entity_1 = require("../entities/auth-event.entity");
const verification_session_entity_1 = require("../entities/verification-session.entity");
const issuance_session_entity_1 = require("../entities/issuance-session.entity");
const FUNNEL_STAGES = ['started', 'deeplink_opened', 'wallet_approved', 'token_issued'];
let MetricsService = class MetricsService {
    constructor(authEventRepo, verificationRepo, issuanceRepo) {
        this.authEventRepo = authEventRepo;
        this.verificationRepo = verificationRepo;
        this.issuanceRepo = issuanceRepo;
    }
    applyDateRange(qb, alias, q) {
        if (q.from)
            qb.andWhere(`${alias}.created_at >= :from`, { from: q.from });
        if (q.to)
            qb.andWhere(`${alias}.created_at <= :to`, { to: q.to });
        return qb;
    }
    /** Top-level counters for the overview cards. */
    async getOverview(q) {
        const authQb = this.applyDateRange(this.authEventRepo.createQueryBuilder('e'), 'e', q);
        const verQb = this.applyDateRange(this.verificationRepo.createQueryBuilder('v'), 'v', q);
        if (q.verifierId)
            verQb.andWhere('v.verifier_id = :verifierId', { verifierId: q.verifierId });
        const issQb = this.applyDateRange(this.issuanceRepo.createQueryBuilder('i'), 'i', q);
        if (q.issuerId)
            issQb.andWhere('i.issuer_id = :issuerId', { issuerId: q.issuerId });
        const [authEvents, verificationSessions, issuanceSessions] = await Promise.all([
            authQb.getCount(),
            verQb.getCount(),
            issQb.getCount(),
        ]);
        return { authEvents, verificationSessions, issuanceSessions };
    }
    /** Success vs failure bar chart + MFA failure counts. */
    async getAuthMetrics(q) {
        const qb = this.applyDateRange(this.authEventRepo
            .createQueryBuilder('e')
            .select('e.event_type', 'eventType')
            .addSelect('COUNT(*)', 'count')
            .groupBy('e.event_type'), 'e', q);
        const rows = await qb.getRawMany();
        const counts = Object.fromEntries(rows.map((r) => [r.eventType, Number(r.count)]));
        return {
            loginSuccess: counts.login_success ?? 0,
            loginFailure: counts.login_failure ?? 0,
            mfaSuccess: counts.mfa_success ?? 0,
            mfaFailure: counts.mfa_failure ?? 0,
            breakdown: counts,
        };
    }
    /** Funnel chart: selector -> deeplink -> wallet approval -> token issuance. */
    async getFunnel(kind, q) {
        const repo = kind === 'verification' ? this.verificationRepo : this.issuanceRepo;
        const alias = kind === 'verification' ? 'v' : 'i';
        const qb = this.applyDateRange(repo.createQueryBuilder(alias), alias, q);
        if (kind === 'verification' && q.verifierId)
            qb.andWhere(`${alias}.verifier_id = :verifierId`, { verifierId: q.verifierId });
        if (kind === 'issuance' && q.issuerId)
            qb.andWhere(`${alias}.issuer_id = :issuerId`, { issuerId: q.issuerId });
        const sessions = await qb.getMany();
        // A session's status represents the furthest stage it reached, so a
        // session with status "wallet_approved" counts toward every stage up
        // to and including that one.
        const stageIndex = (status) => {
            const i = FUNNEL_STAGES.indexOf(status);
            return i === -1 ? FUNNEL_STAGES.length - 1 : i; // failed/expired count as reaching their last known stage
        };
        const funnel = Object.fromEntries(FUNNEL_STAGES.map((s) => [s, 0]));
        for (const session of sessions) {
            const reached = stageIndex(session.status);
            FUNNEL_STAGES.forEach((stage, i) => {
                if (i <= reached)
                    funnel[stage]++;
            });
        }
        return { kind, stages: FUNNEL_STAGES, funnel, total: sessions.length };
    }
    /** Latency line chart, bucketed by day. */
    async getLatency(kind, q) {
        const repo = kind === 'verification' ? this.verificationRepo : this.issuanceRepo;
        const alias = kind === 'verification' ? 'v' : 'i';
        const qb = this.applyDateRange(repo
            .createQueryBuilder(alias)
            .select(`DATE_TRUNC('day', ${alias}.created_at)`, 'day')
            .addSelect(`AVG(${alias}.latency_ms)`, 'avgLatencyMs')
            .where(`${alias}.latency_ms IS NOT NULL`)
            .groupBy('day')
            .orderBy('day', 'ASC'), alias, q);
        const rows = await qb.getRawMany();
        return rows.map((r) => ({ day: r.day, avgLatencyMs: Number(r.avgLatencyMs) }));
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auth_event_entity_1.AuthEvent)),
    __param(1, (0, typeorm_1.InjectRepository)(verification_session_entity_1.VerificationSession)),
    __param(2, (0, typeorm_1.InjectRepository)(issuance_session_entity_1.IssuanceSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MetricsService);
