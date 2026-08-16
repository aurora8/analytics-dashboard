import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEvent } from '../auth-events/auth-event.entity';

@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(AuthEvent)
    private readonly authEventRepo: Repository<AuthEvent>,
  ) {}

  recordLoginAttempt(userId: string, ipAddress?: string) {
    const event = this.authEventRepo.create({ userId, eventType: 'login_attempt', success: true, ipAddress });
    return this.authEventRepo.save(event);
  }

  recordLoginResult(userId: string, success: boolean, ipAddress?: string) {
    const event = this.authEventRepo.create({
      userId,
      eventType: success ? 'login_success' : 'login_failure',
      success,
      ipAddress,
    });
    return this.authEventRepo.save(event);
  }

  recordMfaResult(userId: string, success: boolean, ipAddress?: string) {
    const event = this.authEventRepo.create({
      userId,
      eventType: success ? 'mfa_success' : 'mfa_failure',
      success,
      ipAddress,
    });
    return this.authEventRepo.save(event);
  }
}