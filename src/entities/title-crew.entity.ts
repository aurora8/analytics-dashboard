import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'title_crew' })
export class TitleCrew {
  @PrimaryColumn({ name: 'tconst' })
  tconst: string;

  @Column({ name: 'directors', nullable: true })
  directors: string;

  @Column({ name: 'writers', nullable: true })
  writers: string;
}
