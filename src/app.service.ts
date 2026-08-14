import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEvent } from './auth-event.entity';
import { IssuanceSession } from './issuance-session.entity';
import { VerificationSession } from './verification-session.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(AuthEvent)
    private authEventRepo: Repository<AuthEvent>,
    @InjectRepository(IssuanceSession)
    private issuanceRepo: Repository<IssuanceSession>,
    @InjectRepository(VerificationSession)
    private verificationRepo: Repository<VerificationSession>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async logAuthEvent(userId: string, eventType: string, success: boolean) {
    const event = this.authEventRepo.create({ userId, eventType, success });
    return this.authEventRepo.save(event);
  }

  async getMetrics() {
    return {
      totalAuthEvents: await this.authEventRepo.count(),
      totalIssuances: await this.issuanceRepo.count(),
      totalVerifications: await this.verificationRepo.count(),
    };
  }
}