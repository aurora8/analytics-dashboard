import { IsOptional, IsISO8601, IsUUID } from 'class-validator';

/**
 * Shared query params for /metrics endpoints — matches the filters
 * Trainee 3 needs on the frontend (issuer, verifier, date range).
 */
export class MetricsQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsUUID()
  issuerId?: string;

  @IsOptional()
  @IsUUID()
  verifierId?: string;
}
