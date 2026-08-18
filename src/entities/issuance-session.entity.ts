import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type IssuanceStatus = 'started' | 'completed' | 'failed';

/**
 * One row per credential-issuance session, from start to completion/failure.
 * latencyMs is filled in when the session is completed or failed.
 */
@Entity('issuance_session')
export class IssuanceSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 128 })
  issuerId: string;

  @Index()
  @Column({ type: 'varchar', length: 32, default: 'started' })
  status: IssuanceStatus;

  @Column({ type: 'varchar', length: 128, nullable: true })
  credentialType: string | null;

  @Index()
  @CreateDateColumn({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  latencyMs: number | null;
}
