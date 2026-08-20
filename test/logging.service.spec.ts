import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggingService } from '../src/logging/logging.service';
import { AuthEvent } from '../src/entities/auth-event.entity';

describe('LoggingService', () => {
  let service: LoggingService;
  let repo: jest.Mocked<Repository<AuthEvent>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingService,
        {
          provide: getRepositoryToken(AuthEvent),
          useValue: {
            create: jest.fn((data) => data),
            save: jest.fn((event) => Promise.resolve({ id: 'test-id', ...event })),
          },
        },
      ],
    }).compile();

    service = module.get<LoggingService>(LoggingService);
    repo = module.get(getRepositoryToken(AuthEvent));
  });

  it('recordLoginAttempt logs a login_attempt event', async () => {
    await service.recordLoginAttempt('user-1', '1.2.3.4', 'test-agent');
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', eventType: 'login_attempt', ipAddress: '1.2.3.4', userAgent: 'test-agent' }),
    );
    expect(repo.save).toHaveBeenCalled();
  });

  it('recordLoginResult logs login_success on success', async () => {
    await service.recordLoginResult('user-1', true, '1.2.3.4');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'login_success' }));
  });

  it('recordLoginResult logs login_failure on failure', async () => {
    await service.recordLoginResult('user-1', false, '1.2.3.4');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'login_failure' }));
  });

  it('recordMfaChallenge logs an mfa_challenge event', async () => {
    await service.recordMfaChallenge('user-1', '1.2.3.4');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1', eventType: 'mfa_challenge', ipAddress: '1.2.3.4' }));
  });

  it('recordMfaResult logs mfa_success on success', async () => {
    await service.recordMfaResult('user-1', true, '1.2.3.4');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'mfa_success' }));
  });

  it('recordMfaResult logs mfa_failure on failure', async () => {
    await service.recordMfaResult('user-1', false, '1.2.3.4');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'mfa_failure' }));
  });
});