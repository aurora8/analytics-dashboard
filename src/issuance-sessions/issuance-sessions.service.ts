import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssuanceSession } from './issuance-session.entity';

@Injectable()
export class IssuanceSessionsService {
  constructor(
    @InjectRepository(IssuanceSession)
    private issuanceSessionsRepository: Repository<IssuanceSession>,
  ) {}

  create(data: Partial<IssuanceSession>) {
    const session = this.issuanceSessionsRepository.create(data);
    return this.issuanceSessionsRepository.save(session);
  }

  findAll() {
    return this.issuanceSessionsRepository.find();
  }
}