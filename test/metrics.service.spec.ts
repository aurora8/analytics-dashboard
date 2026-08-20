import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MetricsService } from '../src/metrics/metrics.service';
import { AuthEvent } from '../src/entities/auth-event.entity';
import { VerificationSession } from '../src/entities/verification-session.entity';
import { IssuanceSession } from '../src/entities/issuance-session.entity';

// A tiny stand-in for TypeORM's QueryBuilder that supports the handful
// of chained methods MetricsService calls, so we can test the service
// without a real database.
function fakeQueryBuilder(result: { many?: any[]; raw?: any[]; count?: number }) {
  const qb: any = {
    andWhere: () => qb,
    where: () => qb,
    select: () => qb,
    addSelect: () => qb,
    groupBy: () => qb,
    orderBy: () => qb,
    getMany: async () => result.many ?? [],
    getRawMany: async () => result.raw ?? [],
    getCount: async () => result.count ?? 0,
  };
  return qb;
}

describe('MetricsService', () => {
  let service: MetricsService;
  let authRepo: any;
  let verificationRepo: any;
  let issuanceRepo: any;

  beforeEach(async () => {
    authRepo = { createQueryBuilder: jest.fn() };
    verificationRepo = { createQueryBuilder: jest.fn() };
    issuanceRepo = { createQueryBuilder: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MetricsService,
        { provide: getRepositoryToken(AuthEvent), useValue: authRepo },
        { provide: getRepositoryToken(VerificationSession), useValue: verificationRepo },
        { provide: getRepositoryToken(IssuanceSession), useValue: issuanceRepo },
      ],
    }).compile();

    service = moduleRef.get(MetricsService);
  });

  it('getOverview returns counts from each repository', async () => {
    authRepo.createQueryBuilder.mockReturnValue(fakeQueryBuilder({ count: 5 }));
    verificationRepo.createQueryBuilder.mockReturnValue(fakeQueryBuilder({ count: 3 }));
    issuanceRepo.createQueryBuilder.mockReturnValue(fakeQueryBuilder({ count: 2 }));

    const result = await service.getOverview({});
    expect(result).toEqual({ authEvents: 5, verificationSessions: 3, issuanceSessions: 2 });
  });

  it('getAuthMetrics maps grouped rows to named counters', async () => {
    authRepo.createQueryBuilder.mockReturnValue(
      fakeQueryBuilder({
        raw: [
          { eventType: 'login_success', count: '10' },
          { eventType: 'login_failure', count: '2' },
          { eventType: 'mfa_failure', count: '4' },
        ],
      }),
    );

    const result = await service.getAuthMetrics({});
    expect(result.loginSuccess).toBe(10);
    expect(result.loginFailure).toBe(2);
    expect(result.mfaFailure).toBe(4);
    expect(result.mfaSuccess).toBe(0);
  });

  it('getFunnel counts each session toward every stage up to its own', async () => {
    verificationRepo.createQueryBuilder.mockReturnValue(
      fakeQueryBuilder({
        many: [
          { status: 'started' },
          { status: 'deeplink_opened' },
          { status: 'token_issued' },
        ],
      }),
    );

    const result = await service.getFunnel('verification', {});
    expect(result.funnel.started).toBe(3);
    expect(result.funnel.deeplink_opened).toBe(2);
    expect(result.funnel.wallet_approved).toBe(1);
    expect(result.funnel.token_issued).toBe(1);
    expect(result.total).toBe(3);
  });

  it('getFunnel excludes failed/expired sessions from stages, counts them separately', async () => {
    verificationRepo.createQueryBuilder.mockReturnValue(
      fakeQueryBuilder({
        many: [
          { status: 'wallet_approved' },
          { status: 'failed' },
          { status: 'expired' },
        ],
      }),
    );

    const result = await service.getFunnel('verification', {});
    expect(result.funnel.started).toBe(1);
    expect(result.funnel.deeplink_opened).toBe(1);
    expect(result.funnel.wallet_approved).toBe(1);
    expect(result.funnel.token_issued).toBe(0);
    expect(result.failed).toBe(2);
    expect(result.total).toBe(3);
  });

  it('getLatency returns per-day averages', async () => {
    issuanceRepo.createQueryBuilder.mockReturnValue(
      fakeQueryBuilder({ raw: [{ day: '2026-08-01', avgLatencyMs: '1200' }] }),
    );

    const result = await service.getLatency('issuance', {});
    expect(result).toEqual([{ day: '2026-08-01', avgLatencyMs: 1200 }]);
  });
});