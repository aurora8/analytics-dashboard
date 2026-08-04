import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEvent, AuthEventType } from '../entities/auth-event.entity';

/**
 * Central place for recording the events the dashboard needs to chart:
 * login attempts, MFA outcomes, and (via the session repositories,
 * used directly by whichever service owns verification/issuance flows)
 * session status transitions.
 *
 * Call this from the auth flow wherever a login or MFA step happens —
 * e.g. authService.recordAuthEvent(userId, 'login_failure', req).
 */
@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(AuthEvent)
    private readonly authEventRepo: Repository<AuthEvent>,
  ) {}

  async recordAuthEvent(
    userId: string,
    eventType: AuthEventType,
    opts: { ipAddress?: string; userAgent?: string; metadata?: Record<string, any> } = {},
  ): Promise<AuthEvent> {
    const event = this.authEventRepo.create({
      userId,
      eventType,
      ipAddress: opts.ipAddress,
      userAgent: opts.userAgent,
      metadata: opts.metadata,
    });
    return this.authEventRepo.save(event);
  }

  recordLoginAttempt(userId: string, ipAddress?: string, userAgent?: string) {
    return this.recordAuthEvent(userId, 'login_attempt', { ipAddress, userAgent });
  }

  recordLoginResult(userId: string, success: boolean, ipAddress?: string) {
    return this.recordAuthEvent(userId, success ? 'login_success' : 'login_failure', { ipAddress });
  }

  recordMfaResult(userId: string, success: boolean, ipAddress?: string) {
    return this.recordAuthEvent(userId, success ? 'mfa_success' : 'mfa_failure', { ipAddress });
  }
}
