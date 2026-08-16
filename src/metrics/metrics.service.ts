import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEvent } from '../auth-events/auth-event.entity';
import { IssuanceSession } from '../issuance-sessions/issuance-session.entity';
import { VerificationSession } from '../verification-sessions/verification-session.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(AuthEvent) private authEventsRepo: Repository<AuthEvent>,
    @InjectRepository(IssuanceSession) private issuanceRepo: Repository<IssuanceSession>,
    @InjectRepository(VerificationSession) private verificationRepo: Repository<VerificationSession>,
  ) {}

  async getOverview(query: { from?: string; to?: string; issuerId?: string; verifierId?: string }) {
    const [totalAuthEvents, failedAuthEvents, totalIssuance, totalVerification] = await Promise.all([
      this.authEventsRepo.count(),
      this.authEventsRepo.count({ where: { success: false } }),
      this.issuanceRepo.count(),
      this.verificationRepo.count(),
    ]);

    return {
      totalAuthEvents,
      failedAuthEvents,
      totalIssuanceSessions: totalIssuance,
      totalVerificationSessions: totalVerification,
    };
  }

  async getAuthMetrics(query: { from?: string; to?: string }) {
    const [totalAttempts, successCount, failureCount] = await Promise.all([
      this.authEventsRepo.count(),
      this.authEventsRepo.count({ where: { success: true } }),
      this.authEventsRepo.count({ where: { success: false } }),
    ]);

    return {
      totalAttempts,
      successCount,
      failureCount,
    };
  }

  async getFunnel(kind: string, query: { from?: string; to?: string; issuerId?: string; verifierId?: string }) {
    if (kind === 'issuance') {
      const total = await this.issuanceRepo.count();
      const completed = await this.issuanceRepo.count({ where: { status: 'completed' } });
      return { kind, total, completed };
    }

    if (kind === 'verification') {
      const total = await this.verificationRepo.count();
      const approved = await this.verificationRepo.count({ where: { status: 'approved' } });
      return { kind, total, approved };
    }

    return { kind, total: 0 };
  }

  async getLatency(kind: string, query: { from?: string; to?: string; issuerId?: string; verifierId?: string }) {
    if (kind === 'issuance') {
      const sessions = await this.issuanceRepo.find();
      return { kind, averageLatencyMs: 0, sampleSize: sessions.length };
    }

    if (kind === 'verification') {
      const sessions = await this.verificationRepo.find();
      return { kind, averageLatencyMs: 0, sampleSize: sessions.length };
    }

    return { kind, averageLatencyMs: 0, sampleSize: 0 };
  }
}