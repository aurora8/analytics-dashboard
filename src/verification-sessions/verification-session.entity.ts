import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class VerificationSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  verifierId: string;

  @Column()
  status: string; // e.g. 'pending', 'approved', 'rejected'

  @Column({ nullable: true })
  method: string;

  @CreateDateColumn()
  createdAt: Date;
}