import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issuer } from './entities/issuer.entity';
import { Verifier } from './entities/verifier.entity';
import { Did } from './entities/did.entity';
import { VerificationSession } from './entities/verification-session.entity';
import { IssuanceSession } from './entities/issuance-session.entity';
import { AuthEvent } from './entities/auth-event.entity';
import { LoggingModule } from './logging/logging.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      // Swap DATABASE_URL for the staging connection string once it's
      // shared with the team — nothing else here needs to change.
      entities: [Issuer, Verifier, Did, VerificationSession, IssuanceSession, AuthEvent],
      synchronize: false, // schema is managed by init.sql / migrations, not auto-sync
    }),
    LoggingModule,
    MetricsModule,
  ],
})
export class AppModule {}
