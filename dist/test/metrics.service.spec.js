"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const metrics_service_1 = require("../src/metrics/metrics.service");
const auth_event_entity_1 = require("../src/entities/auth-event.entity");
const verification_session_entity_1 = require("../src/entities/verification-session.entity");
const issuance_session_entity_1 = require("../src/entities/issuance-session.entity");
// A tiny stand-in for TypeORM's QueryBuilder that supports the handful
// of chained methods MetricsService calls, so we can test the service
// without a real database.
function fakeQueryBuilder(result) {
    const qb = {
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
    let service;
    let authRepo;
    let verificationRepo;
    let issuanceRepo;
    beforeEach(async () => {
        authRepo = { createQueryBuilder: jest.fn() };
        verificationRepo = { createQueryBuilder: jest.fn() };
        issuanceRepo = { createQueryBuilder: jest.fn() };
        const moduleRef = await testing_1.Test.createTestingModule({
            providers: [
                metrics_service_1.MetricsService,
                { provide: (0, typeorm_1.getRepositoryToken)(auth_event_entity_1.AuthEvent), useValue: authRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(verification_session_entity_1.VerificationSession), useValue: verificationRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(issuance_session_entity_1.IssuanceSession), useValue: issuanceRepo },
            ],
        }).compile();
        service = moduleRef.get(metrics_service_1.MetricsService);
    });
    it('getOverview returns counts from each repository', async () => {
        authRepo.createQueryBuilder.mockReturnValue(fakeQueryBuilder({ count: 5 }));
        verificationRepo.createQueryBuilder.mockReturnValue(fakeQueryBuilder({ count: 3 }));
        issuanceRepo.createQueryBuilder.mockReturnValue(fakeQueryBuilder({ count: 2 }));
        const result = await service.getOverview({});
        expect(result).toEqual({ authEvents: 5, verificationSessions: 3, issuanceSessions: 2 });
    });
    it('getAuthMetrics maps grouped rows to named counters', async () => {
        authRepo.createQueryBuilder.mockReturnValue(fakeQueryBuilder({
            raw: [
                { eventType: 'login_success', count: '10' },
                { eventType: 'login_failure', count: '2' },
                { eventType: 'mfa_failure', count: '4' },
            ],
        }));
        const result = await service.getAuthMetrics({});
        expect(result.loginSuccess).toBe(10);
        expect(result.loginFailure).toBe(2);
        expect(result.mfaFailure).toBe(4);
        expect(result.mfaSuccess).toBe(0);
    });
    it('getFunnel counts each session toward every stage up to its own', async () => {
        verificationRepo.createQueryBuilder.mockReturnValue(fakeQueryBuilder({
            many: [
                { status: 'started' },
                { status: 'deeplink_opened' },
                { status: 'token_issued' },
            ],
        }));
        const result = await service.getFunnel('verification', {});
        expect(result.funnel.started).toBe(3);
        expect(result.funnel.deeplink_opened).toBe(2);
        expect(result.funnel.wallet_approved).toBe(1);
        expect(result.funnel.token_issued).toBe(1);
        expect(result.total).toBe(3);
    });
    it('getLatency returns per-day averages', async () => {
        issuanceRepo.createQueryBuilder.mockReturnValue(fakeQueryBuilder({ raw: [{ day: '2026-08-01', avgLatencyMs: '1200' }] }));
        const result = await service.getLatency('issuance', {});
        expect(result).toEqual([{ day: '2026-08-01', avgLatencyMs: 1200 }]);
    });
});
