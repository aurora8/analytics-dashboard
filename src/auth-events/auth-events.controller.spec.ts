import { Test, TestingModule } from '@nestjs/testing';
import { AuthEventsController } from './auth-events.controller';

describe('AuthEventsController', () => {
  let controller: AuthEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthEventsController],
    }).compile();

    controller = module.get<AuthEventsController>(AuthEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
