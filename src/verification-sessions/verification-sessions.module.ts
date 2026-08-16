import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationSessionsService } from './verification-sessions.service';
import { VerificationSessionsController } from './verification-sessions.controller';
import { VerificationSession } from './verification-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationSession])],
  providers: [VerificationSessionsService],
  controllers: [VerificationSessionsController],
})
export class VerificationSessionsModule {}