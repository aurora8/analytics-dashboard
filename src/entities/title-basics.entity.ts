import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'title_basics' })
export class TitleBasics {
  @PrimaryColumn({ name: 'tconst' })
  tconst: string;

  @Column({ name: 'titletype', nullable: true })
  titleType: string;

  @Column({ name: 'primarytitle', nullable: true })
  primaryTitle: string;

  @Column({ name: 'originaltitle', nullable: true })
  originalTitle: string;

  @Column({ name: 'isadult', nullable: true })
  isAdult: boolean;

  @Column({ name: 'startyear', type: 'int', nullable: true })
  startYear: number;

  @Column({ name: 'endyear', type: 'int', nullable: true })
  endYear: number;

  @Column({ name: 'runtimeminutes', type: 'int', nullable: true })
  runtimeMinutes: number;

  @Column({ name: 'genres', nullable: true })
  genres: string;
}
