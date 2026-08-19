import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEvent } from './entities/auth-event.entity';
import { IssuanceSession } from './entities/issuance-session.entity';
import { VerificationSession } from './entities/verification-session.entity';
import { LoggingModule } from './logging/logging.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'dashboard'),
        entities: [AuthEvent, IssuanceSession, VerificationSession],
        // Fine for a from-scratch dev/staging build; switch to migrations
        // before this ever points at a shared or production database.
        synchronize: true,
      }),
    }),
    LoggingModule,
    MetricsModule,
  ],
})
export class AppModule {}
