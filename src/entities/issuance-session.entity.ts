import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Issuer } from './issuer.entity';
import { SessionStatus } from './verification-session.entity';

@Entity('issuance_sessions')
export class IssuanceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Issuer)
  @JoinColumn({ name: 'issuer_id' })
  issuer: Issuer;

  @Column({ name: 'issuer_id' })
  issuerId: string;

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
