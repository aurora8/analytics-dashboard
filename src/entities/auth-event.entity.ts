import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type AuthEventType =
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'mfa_success'
  | 'mfa_failure';

/**
 * A single authentication-related event: a login attempt/result or an
 * MFA result. One row per event, so metrics are computed by aggregating
 * rows rather than mutating a running counter.
 */
@Entity('auth_event')
export class AuthEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 32 })
  eventType: AuthEventType;

  @Column({ type: 'varchar', length: 128, nullable: true })
  userId: string | null;

  @Index()
  @Column({ type: 'varchar', length: 128, nullable: true })
  issuerId: string | null;

  @Index()
  @Column({ type: 'varchar', length: 128, nullable: true })
  verifierId: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Index()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
