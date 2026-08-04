import { Controller, Get, Query, Param } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsQueryDto } from './dto/metrics-query.dto';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('overview')
  getOverview(@Query() query: MetricsQueryDto) {
    return this.metricsService.getOverview(query);
  }

  @Get('auth')
  getAuth(@Query() query: MetricsQueryDto) {
    return this.metricsService.getAuthMetrics(query);
  }

  @Get('funnel/:kind')
  getFunnel(@Param('kind') kind: 'verification' | 'issuance', @Query() query: MetricsQueryDto) {
    return this.metricsService.getFunnel(kind, query);
  }

  @Get('latency/:kind')
  getLatency(@Param('kind') kind: 'verification' | 'issuance', @Query() query: MetricsQueryDto) {
    return this.metricsService.getLatency(kind, query);
  }
}
