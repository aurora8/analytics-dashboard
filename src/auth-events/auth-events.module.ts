import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEventsService } from './auth-events.service';
import { AuthEventsController } from './auth-events.controller';
import { AuthEvent } from './auth-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthEvent])],
  providers: [AuthEventsService],
  controllers: [AuthEventsController],
})
export class AuthEventsModule {}