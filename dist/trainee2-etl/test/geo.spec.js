"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analyze_1 = require("../src/geo/analyze");
describe('summarizeIpLocations', () => {
    it('groups counts by resolved location', () => {
        // Well-known public test IPs so this doesn't depend on live geo data drifting.
        const ips = ['8.8.8.8', '8.8.8.8', null];
        const result = (0, analyze_1.summarizeIpLocations)(ips);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].count).toBe(2);
    });
    it('returns an empty array for no IPs', () => {
        expect((0, analyze_1.summarizeIpLocations)([null, null])).toEqual([]);
    });
});
