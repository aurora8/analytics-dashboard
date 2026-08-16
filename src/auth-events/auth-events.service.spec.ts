import { Test, TestingModule } from '@nestjs/testing';
import { AuthEventsService } from './auth-events.service';

describe('AuthEventsService', () => {
  let service: AuthEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthEventsService],
    }).compile();

    service = module.get<AuthEventsService>(AuthEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
