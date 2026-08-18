import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { CreateAuthEventDto } from './dto/create-auth-event.dto';
import { CreateIssuanceSessionDto } from './dto/create-issuance-session.dto';
import { UpdateIssuanceSessionDto } from './dto/update-issuance-session.dto';
import { CreateVerificationSessionDto } from './dto/create-verification-session.dto';
import { UpdateVerificationSessionDto } from './dto/update-verification-session.dto';

@Controller()
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @Post('auth-events')
  createAuthEvent(@Body() dto: CreateAuthEventDto) {
    return this.loggingService.recordAuthEvent(dto);
  }

  @Post('issuance-sessions')
  startIssuanceSession(@Body() dto: CreateIssuanceSessionDto) {
    return this.loggingService.startIssuanceSession(dto);
  }

  @Patch('issuance-sessions/:id')
  updateIssuanceSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIssuanceSessionDto,
  ) {
    return this.loggingService.updateIssuanceSession(id, dto);
  }

  @Post('verification-sessions')
  startVerificationSession(@Body() dto: CreateVerificationSessionDto) {
    return this.loggingService.startVerificationSession(dto);
  }

  @Patch('verification-sessions/:id')
  updateVerificationSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVerificationSessionDto,
  ) {
    return this.loggingService.updateVerificationSession(id, dto);
  }
}
