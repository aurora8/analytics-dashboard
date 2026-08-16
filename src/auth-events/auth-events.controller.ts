import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthEventsService } from './auth-events.service';
import { AuthEvent } from './auth-event.entity';

@Controller('auth-events')
export class AuthEventsController {
  constructor(private readonly authEventsService: AuthEventsService) {}

  @Post()
  create(@Body() data: Partial<AuthEvent>) {
    return this.authEventsService.create(data);
  }

  @Get()
  findAll() {
    return this.authEventsService.findAll();
  }
}