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

  async getSummary() {
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
}