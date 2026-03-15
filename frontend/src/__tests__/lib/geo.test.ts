import { describe, it, expect } from 'vitest';
import {
  haversineDistance,
  formatDistance,
  estimateWalkTime,
  isWithinRadius,
  sortByDistance,
  getDistanceColor,
} from '@/lib/geo';

describe('haversineDistance', () => {
  it('returns 0 for the same point', () => {
    expect(haversineDistance(40.4168, -3.7038, 40.4168, -3.7038)).toBe(0);
  });

  it('calculates Madrid to Barcelona accurately (~505 km)', () => {
    // Madrid: 40.4168, -3.7038  Barcelona: 41.3874, 2.1686
    const dist = haversineDistance(40.4168, -3.7038, 41.3874, 2.1686);
    expect(dist).toBeGreaterThan(490);
    expect(dist).toBeLessThan(520);
  });

  it('calculates New York to London accurately (~5570 km)', () => {
    // NYC: 40.7128, -74.0060  London: 51.5074, -0.1278
    const dist = haversineDistance(40.7128, -74.006, 51.5074, -0.1278);
    expect(dist).toBeGreaterThan(5500);
    expect(dist).toBeLessThan(5600);
  });

  it('calculates short distances (< 1 km)', () => {
    // Two points ~100m apart in Madrid
    const dist = haversineDistance(40.4168, -3.7038, 40.4172, -3.7032);
    expect(dist).toBeGreaterThan(0.05);
    expect(dist).toBeLessThan(0.15);
  });

  it('handles antipodal points (~20000 km max)', () => {
    const dist = haversineDistance(0, 0, 0, 180);
    expect(dist).toBeGreaterThan(19900);
    expect(dist).toBeLessThan(20100);
  });
});

describe('formatDistance', () => {
  it('formats sub-kilometre distances in metres', () => {
    expect(formatDistance(0.5)).toBe('500 m');
  });

  it('formats distances under 1 km', () => {
    expect(formatDistance(0.15)).toBe('150 m');
  });

  it('formats distances between 1 and 10 km with one decimal', () => {
    expect(formatDistance(2.345)).toBe('2.3 km');
  });

  it('formats distances over 10 km as integers', () => {
    expect(formatDistance(15.7)).toBe('16 km');
  });

  it('formats exactly 1 km', () => {
    expect(formatDistance(1)).toBe('1.0 km');
  });

  it('formats very small distances', () => {
    expect(formatDistance(0.01)).toBe('10 m');
  });
});

describe('estimateWalkTime', () => {
  it('returns "1 min" for very short distances', () => {
    expect(estimateWalkTime(0.01)).toBe('1 min');
  });

  it('estimates 5 km as 1 hour', () => {
    expect(estimateWalkTime(5)).toBe('1h');
  });

  it('estimates 2.5 km as 30 minutes', () => {
    expect(estimateWalkTime(2.5)).toBe('30 min');
  });

  it('estimates 7.5 km as 1h 30min', () => {
    expect(estimateWalkTime(7.5)).toBe('1h 30min');
  });

  it('estimates 15 km as 3h', () => {
    expect(estimateWalkTime(15)).toBe('3h');
  });

  it('estimates short walks', () => {
    // 0.5 km at 5 km/h = 6 minutes
    expect(estimateWalkTime(0.5)).toBe('6 min');
  });
});

describe('isWithinRadius', () => {
  it('returns true for a point inside the radius', () => {
    // Two points ~0.5 km apart, radius 1 km
    expect(isWithinRadius(40.4168, -3.7038, 40.4175, -3.7025, 1)).toBe(true);
  });

  it('returns false for a point outside the radius', () => {
    // Madrid to Barcelona (~505 km), radius 10 km
    expect(isWithinRadius(41.3874, 2.1686, 40.4168, -3.7038, 10)).toBe(false);
  });

  it('returns true for the exact same point with any radius', () => {
    expect(isWithinRadius(40.4168, -3.7038, 40.4168, -3.7038, 0)).toBe(true);
  });

  it('returns true for a point on the boundary', () => {
    const dist = haversineDistance(40.4168, -3.7038, 40.4268, -3.7038);
    expect(isWithinRadius(40.4168, -3.7038, 40.4268, -3.7038, dist)).toBe(true);
  });
});

describe('sortByDistance', () => {
  const items = [
    { id: 'far', location: { latitude: 41.3874, longitude: 2.1686, name: 'Barcelona' } },
    { id: 'close', location: { latitude: 40.4175, longitude: -3.7025, name: 'Near Madrid' } },
    { id: 'medium', location: { latitude: 39.4699, longitude: -0.3763, name: 'Valencia' } },
  ];

  it('sorts items by ascending distance from reference point', () => {
    const sorted = sortByDistance(items, 40.4168, -3.7038);
    expect(sorted[0].id).toBe('close');
    expect(sorted[1].id).toBe('medium');
    expect(sorted[2].id).toBe('far');
  });

  it('does not mutate the original array', () => {
    const original = [...items];
    sortByDistance(items, 40.4168, -3.7038);
    expect(items).toEqual(original);
  });

  it('handles an empty array', () => {
    expect(sortByDistance([], 0, 0)).toEqual([]);
  });
});

describe('getDistanceColor', () => {
  it('returns green for < 1 km', () => {
    expect(getDistanceColor(0.5)).toBe('text-emerald-400');
  });

  it('returns yellow for < 5 km', () => {
    expect(getDistanceColor(3)).toBe('text-amber-400');
  });

  it('returns orange for < 15 km', () => {
    expect(getDistanceColor(10)).toBe('text-orange-400');
  });

  it('returns gray for >= 15 km', () => {
    expect(getDistanceColor(20)).toBe('text-slate-400');
  });
});
