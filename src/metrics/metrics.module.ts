import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEvent } from '../auth-events/auth-event.entity';
import { IssuanceSession } from '../issuance-sessions/issuance-session.entity';
import { VerificationSession } from '../verification-sessions/verification-session.entity';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuthEvent, IssuanceSession, VerificationSession])],
  providers: [MetricsService],
  controllers: [MetricsController],
})
export class MetricsModule {}