import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthEventsModule } from './auth-events/auth-events.module';
import { IssuanceSessionsModule } from './issuance-sessions/issuance-sessions.module';
import { VerificationSessionsModule } from './verification-sessions/verification-sessions.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'postgres',
      database: 'dashboard',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthEventsModule,
    IssuanceSessionsModule,
    VerificationSessionsModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}