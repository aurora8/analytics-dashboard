import { Controller, Post, Body, Get } from '@nestjs/common';
import { VerificationSessionsService } from './verification-sessions.service';
import { VerificationSession } from './verification-session.entity';

@Controller('verification-sessions')
export class VerificationSessionsController {
  constructor(private readonly verificationSessionsService: VerificationSessionsService) {}

  @Post()
  create(@Body() data: Partial<VerificationSession>) {
    return this.verificationSessionsService.create(data);
  }

  @Get()
  findAll() {
    return this.verificationSessionsService.findAll();
  }
}