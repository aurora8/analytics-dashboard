import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthEvent } from '../src/entities/auth-event.entity';
import { IssuanceSession } from '../src/entities/issuance-session.entity';
import { VerificationSession } from '../src/entities/verification-session.entity';
import { MetricsService } from '../src/metrics/metrics.service';

// These tests run against a real Postgres database rather than a mocked
// TypeORM query builder, since the thing under test is the SQL
// aggregation logic itself. Point DB_* env vars at any throwaway
// Postgres instance (defaults match the project's docker-compose /
// .env.example, but with its own database name so it never touches
// dev data).
const TEST_DB = process.env.TEST_DB_NAME ?? 'dashboard_test';

describe('MetricsService', () => {
  let moduleRef: TestingModule;
  let service: MetricsService;
  let dataSource: DataSource;
  let authRepo: ReturnType<DataSource['getRepository']>;
  let issuanceRepo: ReturnType<DataSource['getRepository']>;
  let verificationRepo: ReturnType<DataSource['getRepository']>;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST ?? 'localhost',
          port: Number(process.env.DB_PORT ?? 5432),
          username: process.env.DB_USER ?? 'postgres',
          password: process.env.DB_PASSWORD ?? 'postgres',
          database: TEST_DB,
          entities: [AuthEvent, IssuanceSession, VerificationSession],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([
          AuthEvent,
          IssuanceSession,
          VerificationSession,
        ]),
      ],
      providers: [MetricsService],
    }).compile();

    service = moduleRef.get(MetricsService);
    dataSource = moduleRef.get(DataSource);
    authRepo = dataSource.getRepository(AuthEvent);
    issuanceRepo = dataSource.getRepository(IssuanceSession);
    verificationRepo = dataSource.getRepository(VerificationSession);
  }, 30000);

  afterAll(async () => {
    await dataSource.destroy();
    await moduleRef.close();
  });

  beforeEach(async () => {
    await authRepo.clear();
    await issuanceRepo.clear();
    await verificationRepo.clear();
  });

  describe('getOverview', () => {
    it('aggregates counts across auth, issuance, and verification', async () => {
      await authRepo.save([
        authRepo.create({ eventType: 'login_success', issuerId: 'iss-1' }),
        authRepo.create({ eventType: 'login_failure', issuerId: 'iss-1' }),
        authRepo.create({ eventType: 'mfa_failure', issuerId: 'iss-2' }),
      ]);
      await issuanceRepo.save([
        issuanceRepo.create({ issuerId: 'iss-1', status: 'completed' }),
        issuanceRepo.create({ issuerId: 'iss-2', status: 'failed' }),
      ]);
      await verificationRepo.save([
        verificationRepo.create({
          verifierId: 'ver-1',
          stage: 'token_issuance',
          status: 'completed',
        }),
        verificationRepo.create({
          verifierId: 'ver-2',
          stage: 'selector',
          status: 'in_progress',
        }),
      ]);

      const result = await service.getOverview({});

      expect(result.authEvents.total).toBe(3);
      expect(result.authEvents.loginSuccess).toBe(1);
      expect(result.authEvents.loginFailure).toBe(1);
      expect(result.authEvents.mfaFailure).toBe(1);
      expect(result.issuance.total).toBe(2);
      expect(result.issuance.completed).toBe(1);
      expect(result.issuance.failed).toBe(1);
      expect(result.verification.total).toBe(2);
      expect(result.verification.completed).toBe(1);
      expect(result.verification.inProgress).toBe(1);
    });

    it('filters by issuerId', async () => {
      await authRepo.save([
        authRepo.create({ eventType: 'login_success', issuerId: 'iss-1' }),
        authRepo.create({ eventType: 'login_success', issuerId: 'iss-2' }),
      ]);

      const result = await service.getOverview({ issuerId: 'iss-1' });

      expect(result.authEvents.total).toBe(1);
    });
  });

  describe('getAuthMetrics', () => {
    it('computes success/failure counts and rates', async () => {
      await authRepo.save([
        authRepo.create({ eventType: 'login_success' }),
        authRepo.create({ eventType: 'login_success' }),
        authRepo.create({ eventType: 'login_failure' }),
        authRepo.create({ eventType: 'mfa_success' }),
        authRepo.create({ eventType: 'mfa_failure' }),
        authRepo.create({ eventType: 'mfa_failure' }),
      ]);

      const result = await service.getAuthMetrics({});

      expect(result.loginSuccess).toBe(2);
      expect(result.loginFailure).toBe(1);
      expect(result.loginSuccessRate).toBeCloseTo(2 / 3);
      expect(result.mfaSuccess).toBe(1);
      expect(result.mfaFailure).toBe(2);
      expect(result.mfaFailureRate).toBeCloseTo(2 / 3);
    });

    it('returns null rates when there is no data', async () => {
      const result = await service.getAuthMetrics({});
      expect(result.loginSuccessRate).toBeNull();
      expect(result.mfaFailureRate).toBeNull();
    });
  });

  describe('getFunnel', () => {
    it('computes cumulative verification funnel counts', async () => {
      await verificationRepo.save([
        verificationRepo.create({ verifierId: 'v', stage: 'token_issuance' }),
        verificationRepo.create({ verifierId: 'v', stage: 'wallet_approval' }),
        verificationRepo.create({ verifierId: 'v', stage: 'deeplink' }),
        verificationRepo.create({ verifierId: 'v', stage: 'selector' }),
      ]);

      const result = await service.getFunnel('verification', {});

      expect(result.steps).toEqual([
        { step: 'selector', count: 4 },
        { step: 'deeplink', count: 3 },
        { step: 'wallet_approval', count: 2 },
        { step: 'token_issuance', count: 1 },
      ]);
    });

    it('computes issuance started/completed counts', async () => {
      await issuanceRepo.save([
        issuanceRepo.create({ issuerId: 'i', status: 'started' }),
        issuanceRepo.create({ issuerId: 'i', status: 'completed' }),
        issuanceRepo.create({ issuerId: 'i', status: 'failed' }),
      ]);

      const result = await service.getFunnel('issuance', {});

      expect(result.steps).toEqual([
        { step: 'started', count: 3 },
        { step: 'completed', count: 1 },
      ]);
    });

    it('rejects an unknown funnel kind', async () => {
      await expect(
        service.getFunnel('bogus' as any, {}),
      ).rejects.toThrow('Unknown funnel kind');
    });
  });

  describe('getLatency', () => {
    it('computes avg/min/max latency for completed verification sessions', async () => {
      await verificationRepo.save([
        verificationRepo.create({
          verifierId: 'v',
          status: 'completed',
          latencyMs: 100,
        }),
        verificationRepo.create({
          verifierId: 'v',
          status: 'completed',
          latencyMs: 300,
        }),
        // no latencyMs — should be excluded
        verificationRepo.create({ verifierId: 'v', status: 'in_progress' }),
      ]);

      const result = await service.getLatency('verification', {});

      expect(result.sampleSize).toBe(2);
      expect(result.avgLatencyMs).toBe(200);
      expect(result.minLatencyMs).toBe(100);
      expect(result.maxLatencyMs).toBe(300);
    });

    it('rejects an unknown latency kind', async () => {
      await expect(service.getLatency('bogus' as any, {})).rejects.toThrow(
        'Unknown latency kind',
      );
    });
  });
});
