import { IsIn } from 'class-validator';
import { IssuanceStatus } from '../../entities/issuance-session.entity';

export class UpdateIssuanceSessionDto {
  @IsIn(['completed', 'failed'])
  status: Extract<IssuanceStatus, 'completed' | 'failed'>;
}
