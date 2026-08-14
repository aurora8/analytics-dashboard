import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class IssuanceSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  issuerId: string;

  @Column()
  status: string; // 'pending', 'issued', 'failed'

  @CreateDateColumn()
  createdAt: Date;
}