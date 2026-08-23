import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'title_principals' })
export class TitlePrincipals {
  @PrimaryColumn({ name: 'tconst' })
  tconst: string;

  @PrimaryColumn({ name: 'ordering', type: 'int' })
  ordering: number;

  @Column({ name: 'nconst', nullable: true })
  nconst: string;

  @Column({ name: 'category', nullable: true })
  category: string;

  @Column({ name: 'job', nullable: true })
  job: string;

  @Column({ name: 'characters', nullable: true })
  characters: string;
}
