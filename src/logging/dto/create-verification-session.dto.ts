import { IsString } from 'class-validator';

export class CreateVerificationSessionDto {
  @IsString()
  verifierId: string;
}
