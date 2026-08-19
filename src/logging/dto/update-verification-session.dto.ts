import { IsIn, IsOptional } from 'class-validator';
import {
  VerificationStage,
  VerificationStatus,
} from '../../entities/verification-session.entity';

const STAGES: VerificationStage[] = [
  'selector',
  'deeplink',
  'wallet_approval',
  'token_issuance',
];

export class UpdateVerificationSessionDto {
  @IsOptional()
  @IsIn(STAGES)
  stage?: VerificationStage;

  @IsOptional()
  @IsIn(['in_progress', 'completed', 'failed'])
  status?: VerificationStatus;
}
