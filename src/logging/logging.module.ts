import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEvent } from '../entities/auth-event.entity';
import { IssuanceSession } from '../entities/issuance-session.entity';
import { VerificationSession } from '../entities/verification-session.entity';
import { LoggingService } from './logging.service';
import { LoggingController } from './logging.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEvent, IssuanceSession, VerificationSession]),
  ],
  providers: [LoggingService],
  controllers: [LoggingController],
  exports: [LoggingService],
})
export class LoggingModule {}
