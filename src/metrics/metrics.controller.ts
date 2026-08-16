import { Controller, Get, Query, Param } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('overview')
  getOverview(@Query() query: { from?: string; to?: string; issuerId?: string; verifierId?: string }) {
    return this.metricsService.getOverview(query);
  }

  @Get('auth')
  getAuthMetrics(@Query() query: { from?: string; to?: string }) {
    return this.metricsService.getAuthMetrics(query);
  }

  @Get('funnel/:kind')
  getFunnel(@Param('kind') kind: string, @Query() query: { from?: string; to?: string; issuerId?: string; verifierId?: string }) {
    return this.metricsService.getFunnel(kind, query);
  }

  @Get('latency/:kind')
  getLatency(@Param('kind') kind: string, @Query() query: { from?: string; to?: string; issuerId?: string; verifierId?: string }) {
    return this.metricsService.getLatency(kind, query);
  }
}