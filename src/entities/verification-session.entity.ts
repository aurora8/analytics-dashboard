import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/** Furthest funnel stage this session has reached. */
export type VerificationStage =
  | 'selector'
  | 'deeplink'
  | 'wallet_approval'
  | 'token_issuance';

export type VerificationStatus = 'in_progress' | 'completed' | 'failed';

/**
 * One row per verification session. `stage` tracks the furthest point
 * reached in the funnel (selector -> deeplink -> wallet_approval ->
 * token_issuance); `status` tracks whether it's still moving, finished,
 * or dropped off / failed.
 */
@Entity('verification_session')
export class VerificationSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 128 })
  verifierId: string;

  @Index()
  @Column({ type: 'varchar', length: 32, default: 'selector' })
  stage: VerificationStage;

  @Index()
  @Column({ type: 'varchar', length: 32, default: 'in_progress' })
  status: VerificationStatus;

  @Index()
  @CreateDateColumn({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  latencyMs: number | null;
}
