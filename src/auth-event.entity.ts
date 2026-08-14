import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AuthEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  eventType: string; // 'login', 'mfa_failure', 'mfa_success', etc.

  @Column()
  success: boolean;

  @CreateDateColumn()
  timestamp: Date;
}