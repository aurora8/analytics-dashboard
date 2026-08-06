import { summarizeIpLocations } from '../src/geo/analyze';

describe('summarizeIpLocations', () => {
  it('groups counts by resolved location', () => {
    // Well-known public test IPs so this doesn't depend on live geo data drifting.
    const ips = ['8.8.8.8', '8.8.8.8', null];
    const result = summarizeIpLocations(ips);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].count).toBe(2);
  });

  it('returns an empty array for no IPs', () => {
    expect(summarizeIpLocations([null, null])).toEqual([]);
  });
});
