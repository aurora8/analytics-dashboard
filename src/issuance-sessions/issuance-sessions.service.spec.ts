import { Test, TestingModule } from '@nestjs/testing';
import { IssuanceSessionsService } from './issuance-sessions.service';

describe('IssuanceSessionsService', () => {
  let service: IssuanceSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IssuanceSessionsService],
    }).compile();

    service = module.get<IssuanceSessionsService>(IssuanceSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
