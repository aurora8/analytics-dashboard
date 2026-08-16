import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class IssuanceSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  issuerId: string;

  @Column()
  status: string; // e.g. 'pending', 'completed', 'failed'

  @Column({ nullable: true })
  credentialType: string;

  @CreateDateColumn()
  createdAt: Date;
}