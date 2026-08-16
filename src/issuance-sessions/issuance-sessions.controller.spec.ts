import { Test, TestingModule } from '@nestjs/testing';
import { IssuanceSessionsController } from './issuance-sessions.controller';

describe('IssuanceSessionsController', () => {
  let controller: IssuanceSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IssuanceSessionsController],
    }).compile();

    controller = module.get<IssuanceSessionsController>(IssuanceSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
