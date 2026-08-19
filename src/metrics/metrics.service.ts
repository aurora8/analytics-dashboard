import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AuthEvent } from '../entities/auth-event.entity';
import { IssuanceSession } from '../entities/issuance-session.entity';
import {
  VerificationSession,
  VerificationStage,
} from '../entities/verification-session.entity';
import { MetricsQueryDto } from './dto/metrics-query.dto';

export type FunnelKind = 'issuance' | 'verification';
export type LatencyKind = 'issuance' | 'verification';

const VERIFICATION_STAGE_ORDER: VerificationStage[] = [
  'selector',
  'deeplink',
  'wallet_approval',
  'token_issuance',
];

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(AuthEvent)
    private readonly authEventRepo: Repository<AuthEvent>,
    @InjectRepository(IssuanceSession)
    private readonly issuanceRepo: Repository<IssuanceSession>,
    @InjectRepository(VerificationSession)
    private readonly verificationRepo: Repository<VerificationSession>,
  ) {}

  async getOverview(filters: MetricsQueryDto) {
    const authCounts = this.toCountMap(
      await this.applyAuthFilters(
        this.authEventRepo.createQueryBuilder('e'),
        filters,
      )
        .select('e.eventType', 'key')
        .addSelect('COUNT(*)', 'count')
        .groupBy('e.eventType')
        .getRawMany<{ key: string; count: string }>(),
    );
    const authTotal = Object.values(authCounts).reduce((a, b) => a + b, 0);

    const issuanceCounts = this.toCountMap(
      await this.applyIssuanceFilters(
        this.issuanceRepo.createQueryBuilder('s'),
        filters,
      )
        .select('s.status', 'key')
        .addSelect('COUNT(*)', 'count')
        .groupBy('s.status')
        .getRawMany<{ key: string; count: string }>(),
    );
    const issuanceTotal = Object.values(issuanceCounts).reduce(
      (a, b) => a + b,
      0,
    );

    const verificationCounts = this.toCountMap(
      await this.applyVerificationFilters(
        this.verificationRepo.createQueryBuilder('v'),
        filters,
      )
        .select('v.status', 'key')
        .addSelect('COUNT(*)', 'count')
        .groupBy('v.status')
        .getRawMany<{ key: string; count: string }>(),
    );
    const verificationTotal = Object.values(verificationCounts).reduce(
      (a, b) => a + b,
      0,
    );

    return {
      authEvents: {
        total: authTotal,
        loginSuccess: authCounts['login_success'] ?? 0,
        loginFailure: authCounts['login_failure'] ?? 0,
        mfaSuccess: authCounts['mfa_success'] ?? 0,
        mfaFailure: authCounts['mfa_failure'] ?? 0,
      },
      issuance: {
        total: issuanceTotal,
        started: issuanceCounts['started'] ?? 0,
        completed: issuanceCounts['completed'] ?? 0,
        failed: issuanceCounts['failed'] ?? 0,
      },
      verification: {
        total: verificationTotal,
        inProgress: verificationCounts['in_progress'] ?? 0,
        completed: verificationCounts['completed'] ?? 0,
        failed: verificationCounts['failed'] ?? 0,
      },
    };
  }

  async getAuthMetrics(filters: MetricsQueryDto) {
    const counts = this.toCountMap(
      await this.applyAuthFilters(
        this.authEventRepo.createQueryBuilder('e'),
        filters,
      )
        .select('e.eventType', 'key')
        .addSelect('COUNT(*)', 'count')
        .groupBy('e.eventType')
        .getRawMany<{ key: string; count: string }>(),
    );

    const loginSuccess = counts['login_success'] ?? 0;
    const loginFailure = counts['login_failure'] ?? 0;
    const mfaSuccess = counts['mfa_success'] ?? 0;
    const mfaFailure = counts['mfa_failure'] ?? 0;
    const loginTotal = loginSuccess + loginFailure;
    const mfaTotal = mfaSuccess + mfaFailure;

    const dailyRows = await this.applyAuthFilters(
      this.authEventRepo.createQueryBuilder('e'),
      filters,
    )
      .select("date_trunc('day', e.createdAt)", 'day')
      .addSelect('e.eventType', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .groupBy("date_trunc('day', e.createdAt)")
      .addGroupBy('e.eventType')
      .orderBy("date_trunc('day', e.createdAt)", 'ASC')
      .getRawMany<{ day: Date; eventType: string; count: string }>();

    return {
      loginAttempts: counts['login_attempt'] ?? 0,
      loginSuccess,
      loginFailure,
      loginSuccessRate: loginTotal > 0 ? loginSuccess / loginTotal : null,
      mfaSuccess,
      mfaFailure,
      mfaFailureRate: mfaTotal > 0 ? mfaFailure / mfaTotal : null,
      daily: dailyRows.map((row) => ({
        day: row.day,
        eventType: row.eventType,
        count: Number(row.count),
      })),
    };
  }

  async getFunnel(kind: FunnelKind, filters: MetricsQueryDto) {
    if (kind === 'issuance') {
      const counts = this.toCountMap(
        await this.applyIssuanceFilters(
          this.issuanceRepo.createQueryBuilder('s'),
          filters,
        )
          .select('s.status', 'key')
          .addSelect('COUNT(*)', 'count')
          .groupBy('s.status')
          .getRawMany<{ key: string; count: string }>(),
      );
      const total =
        (counts['started'] ?? 0) +
        (counts['completed'] ?? 0) +
        (counts['failed'] ?? 0);
      return {
        kind,
        steps: [
          { step: 'started', count: total },
          { step: 'completed', count: counts['completed'] ?? 0 },
        ],
      };
    }

    if (kind === 'verification') {
      const counts = this.toCountMap(
        await this.applyVerificationFilters(
          this.verificationRepo.createQueryBuilder('v'),
          filters,
        )
          .select('v.stage', 'key')
          .addSelect('COUNT(*)', 'count')
          .groupBy('v.stage')
          .getRawMany<{ key: string; count: string }>(),
      );

      // A session that reached "wallet_approval" also passed through
      // "selector" and "deeplink", so the funnel counts are cumulative
      // from the furthest stage backwards.
      let remaining = 0;
      const cumulative: Record<string, number> = {};
      for (let i = VERIFICATION_STAGE_ORDER.length - 1; i >= 0; i--) {
        const stage = VERIFICATION_STAGE_ORDER[i];
        remaining += counts[stage] ?? 0;
        cumulative[stage] = remaining;
      }

      return {
        kind,
        steps: VERIFICATION_STAGE_ORDER.map((step) => ({
          step,
          count: cumulative[step],
        })),
      };
    }

    throw new BadRequestException(`Unknown funnel kind: ${kind}`);
  }

  async getLatency(kind: LatencyKind, filters: MetricsQueryDto) {
    if (kind === 'issuance') {
      const qb = this.applyIssuanceFilters(
        this.issuanceRepo.createQueryBuilder('s'),
        filters,
      ).andWhere('s.latencyMs IS NOT NULL');

      const summary = await qb
        .clone()
        .select('AVG(s.latencyMs)', 'avg')
        .addSelect('MIN(s.latencyMs)', 'min')
        .addSelect('MAX(s.latencyMs)', 'max')
        .addSelect('COUNT(*)', 'count')
        .getRawOne<{
          avg: string | null;
          min: string | null;
          max: string | null;
          count: string;
        }>();

      const dailyRows = await qb
        .clone()
        .select("date_trunc('day', s.startedAt)", 'day')
        .addSelect('AVG(s.latencyMs)', 'avgLatencyMs')
        .groupBy("date_trunc('day', s.startedAt)")
        .orderBy("date_trunc('day', s.startedAt)", 'ASC')
        .getRawMany<{ day: Date; avgLatencyMs: string }>();

      return this.formatLatency(kind, summary, dailyRows);
    }

    if (kind === 'verification') {
      const qb = this.applyVerificationFilters(
        this.verificationRepo.createQueryBuilder('v'),
        filters,
      ).andWhere('v.latencyMs IS NOT NULL');

      const summary = await qb
        .clone()
        .select('AVG(v.latencyMs)', 'avg')
        .addSelect('MIN(v.latencyMs)', 'min')
        .addSelect('MAX(v.latencyMs)', 'max')
        .addSelect('COUNT(*)', 'count')
        .getRawOne<{
          avg: string | null;
          min: string | null;
          max: string | null;
          count: string;
        }>();

      const dailyRows = await qb
        .clone()
        .select("date_trunc('day', v.startedAt)", 'day')
        .addSelect('AVG(v.latencyMs)', 'avgLatencyMs')
        .groupBy("date_trunc('day', v.startedAt)")
        .orderBy("date_trunc('day', v.startedAt)", 'ASC')
        .getRawMany<{ day: Date; avgLatencyMs: string }>();

      return this.formatLatency(kind, summary, dailyRows);
    }

    throw new BadRequestException(`Unknown latency kind: ${kind}`);
  }

  private formatLatency(
    kind: LatencyKind,
    summary:
      | { avg: string | null; min: string | null; max: string | null; count: string }
      | undefined,
    dailyRows: { day: Date; avgLatencyMs: string }[],
  ) {
    return {
      kind,
      avgLatencyMs: summary?.avg != null ? Number(summary.avg) : null,
      minLatencyMs: summary?.min != null ? Number(summary.min) : null,
      maxLatencyMs: summary?.max != null ? Number(summary.max) : null,
      sampleSize: summary ? Number(summary.count) : 0,
      daily: dailyRows.map((row) => ({
        day: row.day,
        avgLatencyMs: Number(row.avgLatencyMs),
      })),
    };
  }

  private applyAuthFilters(
    qb: SelectQueryBuilder<AuthEvent>,
    filters: MetricsQueryDto,
  ): SelectQueryBuilder<AuthEvent> {
    if (filters.startDate) {
      qb.andWhere('e.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      qb.andWhere('e.createdAt <= :endDate', { endDate: filters.endDate });
    }
    if (filters.issuerId) {
      qb.andWhere('e.issuerId = :issuerId', { issuerId: filters.issuerId });
    }
    if (filters.verifierId) {
      qb.andWhere('e.verifierId = :verifierId', {
        verifierId: filters.verifierId,
      });
    }
    return qb;
  }

  private applyIssuanceFilters(
    qb: SelectQueryBuilder<IssuanceSession>,
    filters: MetricsQueryDto,
  ): SelectQueryBuilder<IssuanceSession> {
    if (filters.startDate) {
      qb.andWhere('s.startedAt >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      qb.andWhere('s.startedAt <= :endDate', { endDate: filters.endDate });
    }
    if (filters.issuerId) {
      qb.andWhere('s.issuerId = :issuerId', { issuerId: filters.issuerId });
    }
    return qb;
  }

  private applyVerificationFilters(
    qb: SelectQueryBuilder<VerificationSession>,
    filters: MetricsQueryDto,
  ): SelectQueryBuilder<VerificationSession> {
    if (filters.startDate) {
      qb.andWhere('v.startedAt >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      qb.andWhere('v.startedAt <= :endDate', { endDate: filters.endDate });
    }
    if (filters.verifierId) {
      qb.andWhere('v.verifierId = :verifierId', {
        verifierId: filters.verifierId,
      });
    }
    return qb;
  }

  private toCountMap(
    rows: { key: string; count: string }[],
  ): Record<string, number> {
    const map: Record<string, number> = {};
    for (const row of rows) {
      map[row.key] = Number(row.count);
    }
    return map;
  }
}
