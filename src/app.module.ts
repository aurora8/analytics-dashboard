import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthEvent } from './auth-event.entity';
import { IssuanceSession } from './issuance-session.entity';
import { VerificationSession } from './verification-session.entity';

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
    TypeOrmModule.forFeature([AuthEvent, IssuanceSession, VerificationSession]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}