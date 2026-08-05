import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Verifier } from './verifier.entity';

export type SessionStatus = 'started' | 'deeplink_opened' | 'wallet_approved' | 'token_issued' | 'failed' | 'expired';

@Entity('verification_sessions')
export class VerificationSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Verifier)
  @JoinColumn({ name: 'verifier_id' })
  verifier: Verifier;

  @Column({ name: 'verifier_id' })
  verifierId: string;

  @Column({ name: 'holder_did' })
  holderDid: string;

  @Column()
  status: SessionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'latency_ms', nullable: true })
  latencyMs: number;
}
