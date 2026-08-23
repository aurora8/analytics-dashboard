import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TitleBasics } from './entities/title-basics.entity';
import { TitleAkas } from './entities/title-akas.entity';
import { TitleRatings } from './entities/title-ratings.entity';
import { TitleCrew } from './entities/title-crew.entity';
import { TitleEpisode } from './entities/title-episode.entity';
import { NameBasics } from './entities/name-basics.entity';
import { TitlePrincipals } from './entities/title-principals.entity';
import { MetricsModule } from './metrics/metrics.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [TitleBasics, TitleAkas, TitleRatings, TitleCrew, TitleEpisode, NameBasics, TitlePrincipals],
      synchronize: false,
    }),
    MetricsModule,
  ],
})
export class AppModule {}
