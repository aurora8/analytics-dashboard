import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'title_episode' })
export class TitleEpisode {
  @PrimaryColumn({ name: 'tconst' })
  tconst: string;

  @Column({ name: 'parenttconst', nullable: true })
  parentTconst: string;

  @Column({ name: 'seasonnumber', type: 'int', nullable: true })
  seasonNumber: number;

  @Column({ name: 'episodenumber', type: 'int', nullable: true })
  episodeNumber: number;
}
