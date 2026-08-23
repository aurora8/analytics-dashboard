import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'title_ratings' })
export class TitleRatings {
  @PrimaryColumn({ name: 'tconst' })
  tconst: string;

  @Column({ name: 'averagerating', type: 'float', nullable: true })
  averageRating: number;

  @Column({ name: 'numvotes', type: 'int', nullable: true })
  numVotes: number;
}
