import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssuanceSessionsService } from './issuance-sessions.service';
import { IssuanceSessionsController } from './issuance-sessions.controller';
import { IssuanceSession } from './issuance-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IssuanceSession])],
  providers: [IssuanceSessionsService],
  controllers: [IssuanceSessionsController],
})
export class IssuanceSessionsModule {}