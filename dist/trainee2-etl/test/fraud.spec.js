"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const detect_1 = require("../src/fraud/detect");
const from = new Date('2026-08-01');
const to = new Date('2026-08-08');
function event(userId, eventType, ip = '1.1.1.1') {
    return { userId, eventType, ip, timestamp: new Date() };
}
describe('flagExcessiveMfaFailures', () => {
    it('flags a user with 3+ mfa_failure events', () => {
        const events = [
            event('u1', 'mfa_failure'),
            event('u1', 'mfa_failure'),
            event('u1', 'mfa_failure'),
            event('u2', 'mfa_failure'),
        ];
        const flags = (0, detect_1.flagExcessiveMfaFailures)(events, from, to);
        expect(flags).toHaveLength(1);
        expect(flags[0].userId).toBe('u1');
        expect(flags[0].count).toBe(3);
    });
    it('does not flag users under the threshold', () => {
        const events = [event('u1', 'mfa_failure'), event('u1', 'mfa_failure')];
        expect((0, detect_1.flagExcessiveMfaFailures)(events, from, to)).toHaveLength(0);
    });
});
describe('flagExcessiveLoginFailures', () => {
    it('flags a user with 5+ login_failure events', () => {
        const events = Array.from({ length: 5 }, () => event('u1', 'login_failure'));
        const flags = (0, detect_1.flagExcessiveLoginFailures)(events, from, to);
        expect(flags).toHaveLength(1);
        expect(flags[0].count).toBe(5);
    });
});
describe('flagDistinctIpFanOut', () => {
    it('flags a user authenticating from more than 4 distinct IPs', () => {
        const events = [
            event('u1', 'login_success', '1.1.1.1'),
            event('u1', 'login_success', '2.2.2.2'),
            event('u1', 'login_success', '3.3.3.3'),
            event('u1', 'login_success', '4.4.4.4'),
            event('u1', 'login_success', '5.5.5.5'),
        ];
        const flags = (0, detect_1.flagDistinctIpFanOut)(events, from, to);
        expect(flags).toHaveLength(1);
        expect(flags[0].count).toBe(5);
    });
    it('ignores events with no IP', () => {
        const events = [event('u1', 'login_success', null), event('u1', 'login_success', null)];
        expect((0, detect_1.flagDistinctIpFanOut)(events, from, to)).toHaveLength(0);
    });
});
