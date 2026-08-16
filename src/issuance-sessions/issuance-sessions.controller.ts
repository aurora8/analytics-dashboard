import { Controller, Post, Body, Get } from '@nestjs/common';
import { IssuanceSessionsService } from './issuance-sessions.service';
import { IssuanceSession } from './issuance-session.entity';

@Controller('issuance-sessions')
export class IssuanceSessionsController {
  constructor(private readonly issuanceSessionsService: IssuanceSessionsService) {}

  @Post()
  create(@Body() data: Partial<IssuanceSession>) {
    return this.issuanceSessionsService.create(data);
  }

  @Get()
  findAll() {
    return this.issuanceSessionsService.findAll();
  }
}