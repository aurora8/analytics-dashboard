import { IsOptional, IsString } from 'class-validator';

export class CreateVerificationSessionDto {
  @IsString()
  verifierId: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
