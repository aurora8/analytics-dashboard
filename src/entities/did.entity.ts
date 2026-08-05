import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type DidOwnerType = 'issuer' | 'verifier' | 'holder';

@Entity('dids')
export class Did {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  did: string;

  @Column({ name: 'owner_type' })
  ownerType: DidOwnerType;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
