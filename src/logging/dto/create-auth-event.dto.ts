import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { AuthEventType } from '../../entities/auth-event.entity';

const AUTH_EVENT_TYPES: AuthEventType[] = [
  'login_attempt',
  'login_success',
  'login_failure',
  'mfa_success',
  'mfa_failure',
];

export class CreateAuthEventDto {
  @IsIn(AUTH_EVENT_TYPES)
  eventType: AuthEventType;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  issuerId?: string;

  @IsOptional()
  @IsString()
  verifierId?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
