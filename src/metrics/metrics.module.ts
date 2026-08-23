import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { TitleBasics } from '../entities/title-basics.entity';
import { TitleRatings } from '../entities/title-ratings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TitleBasics, TitleRatings])],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
