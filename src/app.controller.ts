import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('auth-events')
  logAuthEvent(@Body() body: { userId: string; eventType: string; success: boolean }) {
    return this.appService.logAuthEvent(body.userId, body.eventType, body.success);
  }

  @Get('metrics')
  getMetrics() {
    return this.appService.getMetrics();
  }
}