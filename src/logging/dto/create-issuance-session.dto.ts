import { IsOptional, IsString } from 'class-validator';

export class CreateIssuanceSessionDto {
  @IsString()
  issuerId: string;

  @IsOptional()
  @IsString()
  credentialType?: string;
}
