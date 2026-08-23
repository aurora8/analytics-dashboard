import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'title_akas' })
export class TitleAkas {
  @PrimaryColumn({ name: 'titleid' })
  titleId: string;

  @PrimaryColumn({ name: 'ordering', type: 'int' })
  ordering: number;

  @Column({ name: 'title', nullable: true })
  title: string;

  @Column({ name: 'region', nullable: true })
  region: string;

  @Column({ name: 'language', nullable: true })
  language: string;

  @Column({ name: 'types', nullable: true })
  types: string;

  @Column({ name: 'attributes', nullable: true })
  attributes: string;

  @Column({ name: 'isoriginaltitle', nullable: true })
  isOriginalTitle: boolean;
}
