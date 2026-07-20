import { describe, expect, it } from 'vitest';

import { isLevel, resolvePriority } from './resolve-priority';

describe('resolvePriority', () => {
  it.each([
    { impact: 1, urgency: 1, expected: 1 },
    { impact: 1, urgency: 2, expected: 2 },
    { impact: 2, urgency: 1, expected: 2 },
    { impact: 2, urgency: 2, expected: 3 },
    { impact: 1, urgency: 3, expected: 3 },
    { impact: 3, urgency: 2, expected: 4 },
    { impact: 3, urgency: 3, expected: 5 },
  ] as const)(
    'maps impact $impact × urgency $urgency to priority $expected',
    ({ impact, urgency, expected }) => {
      expect(resolvePriority(impact, urgency)).toBe(expected);
    },
  );
});

describe('isLevel', () => {
  it('accepts levels 1 through 3', () => {
    expect([1, 2, 3].every(isLevel)).toBe(true);
  });

  it('rejects out-of-range and non-numeric values', () => {
    expect(isLevel(0)).toBe(false);
    expect(isLevel(4)).toBe(false);
    expect(isLevel(Number.NaN)).toBe(false);
  });
});
