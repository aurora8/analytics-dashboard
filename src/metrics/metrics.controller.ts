import { Controller, Get, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { TopTitlesQueryDto } from './dto/top-titles-query.dto';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('overview')
  getOverview() {
    return this.metricsService.getOverview();
  }

  @Get('genres')
  getGenreBreakdown() {
    return this.metricsService.getGenreBreakdown();
  }

  @Get('genre-trends')
  getGenreTrends() {
    return this.metricsService.getGenreTrends();
  }

  @Get('top-titles')
  getTopTitles(@Query() query: TopTitlesQueryDto) {
    return this.metricsService.getTopTitles(query);
  }

  @Get('cast')
  getCastAnalysis() {
    return this.metricsService.getCastAnalysis();
  }

  @Get('scatter')
  getScatterData() {
    return this.metricsService.getScatterData();
  }

  @Get('collaborations')
  getCollaborations() {
    return this.metricsService.getCollaborations();
  }
}
