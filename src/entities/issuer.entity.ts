import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('issuers')
export class Issuer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  did: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
