import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEvent } from '../entities/auth-event.entity';
import { IssuanceSession } from '../entities/issuance-session.entity';
import { VerificationSession } from '../entities/verification-session.entity';
import { CreateAuthEventDto } from './dto/create-auth-event.dto';
import { CreateIssuanceSessionDto } from './dto/create-issuance-session.dto';
import { UpdateIssuanceSessionDto } from './dto/update-issuance-session.dto';
import { CreateVerificationSessionDto } from './dto/create-verification-session.dto';
import { UpdateVerificationSessionDto } from './dto/update-verification-session.dto';

@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(AuthEvent)
    private readonly authEventRepo: Repository<AuthEvent>,
    @InjectRepository(IssuanceSession)
    private readonly issuanceRepo: Repository<IssuanceSession>,
    @InjectRepository(VerificationSession)
    private readonly verificationRepo: Repository<VerificationSession>,
  ) {}

  recordAuthEvent(dto: CreateAuthEventDto): Promise<AuthEvent> {
    const event = this.authEventRepo.create({
      eventType: dto.eventType,
      userId: dto.userId ?? null,
      issuerId: dto.issuerId ?? null,
      verifierId: dto.verifierId ?? null,
      ipAddress: dto.ipAddress ?? null,
      metadata: dto.metadata ?? null,
    });
    return this.authEventRepo.save(event);
  }

  startIssuanceSession(
    dto: CreateIssuanceSessionDto,
  ): Promise<IssuanceSession> {
    const session = this.issuanceRepo.create({
      issuerId: dto.issuerId,
      credentialType: dto.credentialType ?? null,
      status: 'started',
    });
    return this.issuanceRepo.save(session);
  }

  async updateIssuanceSession(
    id: number,
    dto: UpdateIssuanceSessionDto,
  ): Promise<IssuanceSession> {
    const session = await this.issuanceRepo.findOneBy({ id });
    if (!session) {
      throw new NotFoundException(`Issuance session ${id} not found`);
    }
    const completedAt = new Date();
    session.status = dto.status;
    session.completedAt = completedAt;
    session.latencyMs = completedAt.getTime() - session.startedAt.getTime();
    return this.issuanceRepo.save(session);
  }

  startVerificationSession(
    dto: CreateVerificationSessionDto,
  ): Promise<VerificationSession> {
    const session = this.verificationRepo.create({
      verifierId: dto.verifierId,
      ipAddress: dto.ipAddress ?? null,
      stage: 'selector',
      status: 'in_progress',
    });
    return this.verificationRepo.save(session);
  }

  async updateVerificationSession(
    id: number,
    dto: UpdateVerificationSessionDto,
  ): Promise<VerificationSession> {
    const session = await this.verificationRepo.findOneBy({ id });
    if (!session) {
      throw new NotFoundException(`Verification session ${id} not found`);
    }
    if (dto.stage) {
      session.stage = dto.stage;
    }
    if (dto.status) {
      session.status = dto.status;
      if (dto.status === 'completed' || dto.status === 'failed') {
        const completedAt = new Date();
        session.completedAt = completedAt;
        session.latencyMs =
          completedAt.getTime() - session.startedAt.getTime();
      }
    }
    return this.verificationRepo.save(session);
  }
}
