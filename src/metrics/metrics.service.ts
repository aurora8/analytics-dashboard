import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEvent } from '../entities/auth-event.entity';
import { VerificationSession } from '../entities/verification-session.entity';
import { IssuanceSession } from '../entities/issuance-session.entity';
import { MetricsQueryDto } from './dto/metrics-query.dto';

const FUNNEL_STAGES = ['started', 'deeplink_opened', 'wallet_approved', 'token_issued'] as const;

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(AuthEvent)
    private readonly authEventRepo: Repository<AuthEvent>,
    @InjectRepository(VerificationSession)
    private readonly verificationRepo: Repository<VerificationSession>,
    @InjectRepository(IssuanceSession)
    private readonly issuanceRepo: Repository<IssuanceSession>,
  ) {}

  private applyDateRange(qb: any, alias: string, q: MetricsQueryDto) {
    if (q.from) qb.andWhere(`${alias}.created_at >= :from`, { from: q.from });
    if (q.to) qb.andWhere(`${alias}.created_at <= :to`, { to: q.to });
    return qb;
  }

  /** Top-level counters for the overview cards. */
  async getOverview(q: MetricsQueryDto) {
    const authQb = this.applyDateRange(this.authEventRepo.createQueryBuilder('e'), 'e', q);
    const verQb = this.applyDateRange(this.verificationRepo.createQueryBuilder('v'), 'v', q);
    if (q.verifierId) verQb.andWhere('v.verifier_id = :verifierId', { verifierId: q.verifierId });
    const issQb = this.applyDateRange(this.issuanceRepo.createQueryBuilder('i'), 'i', q);
    if (q.issuerId) issQb.andWhere('i.issuer_id = :issuerId', { issuerId: q.issuerId });

    const [authEvents, verificationSessions, issuanceSessions] = await Promise.all([
      authQb.getCount(),
      verQb.getCount(),
      issQb.getCount(),
    ]);

    return { authEvents, verificationSessions, issuanceSessions };
  }

  /** Success vs failure bar chart + MFA failure counts. */
  async getAuthMetrics(q: MetricsQueryDto) {
    const qb = this.applyDateRange(
      this.authEventRepo
        .createQueryBuilder('e')
        .select('e.event_type', 'eventType')
        .addSelect('COUNT(*)', 'count')
        .groupBy('e.event_type'),
      'e',
      q,
    );
    const rows = await qb.getRawMany();
    const counts: Record<string, number> = Object.fromEntries(rows.map((r) => [r.eventType, Number(r.count)]));

    return {
      loginSuccess: counts.login_success ?? 0,
      loginFailure: counts.login_failure ?? 0,
      mfaSuccess: counts.mfa_success ?? 0,
      mfaFailure: counts.mfa_failure ?? 0,
      breakdown: counts,
    };
  }

  /** Funnel chart: selector -> deeplink -> wallet approval -> token issuance. */
  async getFunnel(kind: 'verification' | 'issuance', q: MetricsQueryDto) {
    const repo = kind === 'verification' ? this.verificationRepo : this.issuanceRepo;
    const alias = kind === 'verification' ? 'v' : 'i';
    const qb = this.applyDateRange(repo.createQueryBuilder(alias), alias, q);
    if (kind === 'verification' && q.verifierId) qb.andWhere(`${alias}.verifier_id = :verifierId`, { verifierId: q.verifierId });
    if (kind === 'issuance' && q.issuerId) qb.andWhere(`${alias}.issuer_id = :issuerId`, { issuerId: q.issuerId });

    const sessions = await qb.getMany();

    // A session's status represents the furthest stage it reached, so a
    // session with status "wallet_approved" counts toward every stage up
    // to and including that one.
    const stageIndex = (status: string) => {
      const i = FUNNEL_STAGES.indexOf(status as any);
      return i === -1 ? FUNNEL_STAGES.length - 1 : i; // failed/expired count as reaching their last known stage
    };

    const funnel = Object.fromEntries(FUNNEL_STAGES.map((s) => [s, 0]));
    for (const session of sessions) {
      const reached = stageIndex(session.status);
      FUNNEL_STAGES.forEach((stage, i) => {
        if (i <= reached) funnel[stage]++;
      });
    }
    return { kind, stages: FUNNEL_STAGES, funnel, total: sessions.length };
  }

  /** Latency line chart, bucketed by day. */
  async getLatency(kind: 'verification' | 'issuance', q: MetricsQueryDto) {
    const repo = kind === 'verification' ? this.verificationRepo : this.issuanceRepo;
    const alias = kind === 'verification' ? 'v' : 'i';
    const qb = this.applyDateRange(
      repo
        .createQueryBuilder(alias)
        .select(`DATE_TRUNC('day', ${alias}.created_at)`, 'day')
        .addSelect(`AVG(${alias}.latency_ms)`, 'avgLatencyMs')
        .where(`${alias}.latency_ms IS NOT NULL`)
        .groupBy('day')
        .orderBy('day', 'ASC'),
      alias,
      q,
    );
    const rows = await qb.getRawMany();
    return rows.map((r) => ({ day: r.day, avgLatencyMs: Number(r.avgLatencyMs) }));
  }
}
