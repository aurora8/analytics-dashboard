import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('verifiers')
export class Verifier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  did: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
