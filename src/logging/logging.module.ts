import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEvent } from '../entities/auth-event.entity';
import { LoggingService } from './logging.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthEvent])],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
