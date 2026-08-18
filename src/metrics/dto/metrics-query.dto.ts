import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class MetricsQueryDto {
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsString()
  issuerId?: string;

  @IsOptional()
  @IsString()
  verifierId?: string;
}
