import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEvent } from './auth-event.entity';

@Injectable()
export class AuthEventsService {
  constructor(
    @InjectRepository(AuthEvent)
    private authEventsRepository: Repository<AuthEvent>,
  ) {}

  create(data: Partial<AuthEvent>) {
    const event = this.authEventsRepository.create(data);
    return this.authEventsRepository.save(event);
  }

  findAll() {
    return this.authEventsRepository.find();
  }
}