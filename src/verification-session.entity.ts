import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class VerificationSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  verifierId: string;

  @Column()
  status: string; // 'pending', 'verified', 'failed'

  @CreateDateColumn()
  createdAt: Date;
}