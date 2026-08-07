"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transform_1 = require("../src/etl/transform");
describe('cleanAuthEvents', () => {
    it('drops rows missing userId or eventType', () => {
        const rows = [
            { id: '1', userId: 'u1', eventType: 'login_success', ipAddress: '1.2.3.4', createdAt: new Date() },
            { id: '2', userId: '', eventType: 'login_success', ipAddress: null, createdAt: new Date() },
        ];
        const result = (0, transform_1.cleanAuthEvents)(rows);
        expect(result).toHaveLength(1);
        expect(result[0].userId).toBe('u1');
    });
    it('normalizes empty-string IPs to null', () => {
        const rows = [
            { id: '1', userId: 'u1', eventType: 'login_success', ipAddress: '  ', createdAt: new Date() },
        ];
        expect((0, transform_1.cleanAuthEvents)(rows)[0].ip).toBeNull();
    });
});
describe('cleanSessions', () => {
    it('buckets latency into fast/normal/slow/unknown', () => {
        const rows = [
            { id: '1', ownerId: 'o1', holderDid: 'did:1', status: 'token_issued', createdAt: new Date(), completedAt: null, latencyMs: 500 },
            { id: '2', ownerId: 'o1', holderDid: 'did:2', status: 'token_issued', createdAt: new Date(), completedAt: null, latencyMs: 2500 },
            { id: '3', ownerId: 'o1', holderDid: 'did:3', status: 'token_issued', createdAt: new Date(), completedAt: null, latencyMs: 9000 },
            { id: '4', ownerId: 'o1', holderDid: 'did:4', status: 'token_issued', createdAt: new Date(), completedAt: null, latencyMs: null },
        ];
        const result = (0, transform_1.cleanSessions)(rows);
        expect(result.map((r) => r.durationBucket)).toEqual(['fast', 'normal', 'slow', 'unknown']);
    });
});
