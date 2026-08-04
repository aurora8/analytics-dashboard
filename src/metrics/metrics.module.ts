import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEvent } from '../entities/auth-event.entity';
import { VerificationSession } from '../entities/verification-session.entity';
import { IssuanceSession } from '../entities/issuance-session.entity';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthEvent, VerificationSession, IssuanceSession])],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
