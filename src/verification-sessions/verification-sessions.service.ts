import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationSession } from './verification-session.entity';

@Injectable()
export class VerificationSessionsService {
  constructor(
    @InjectRepository(VerificationSession)
    private verificationSessionsRepository: Repository<VerificationSession>,
  ) {}

  create(data: Partial<VerificationSession>) {
    const session = this.verificationSessionsRepository.create(data);
    return this.verificationSessionsRepository.save(session);
  }

  findAll() {
    return this.verificationSessionsRepository.find();
  }
}