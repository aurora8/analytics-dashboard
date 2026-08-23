import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'name_basics' })
export class NameBasics {
  @PrimaryColumn({ name: 'nconst' })
  nconst: string;

  @Column({ name: 'primaryname', nullable: true })
  primaryName: string;

  @Column({ name: 'birthyear', type: 'int', nullable: true })
  birthYear: number;

  @Column({ name: 'deathyear', type: 'int', nullable: true })
  deathYear: number;

  @Column({ name: 'primaryprofession', nullable: true })
  primaryProfession: string;

  @Column({ name: 'knownfortitles', nullable: true })
  knownForTitles: string;
}
