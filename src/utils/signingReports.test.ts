import { describeTerms, formatMonth, formatPrice, formatPriceRange, isStale } from './signingReports';

describe('signing report formatting', () => {
  it('formats prices', () => {
    expect(formatPrice(0)).toBe('Free');
    expect(formatPrice(4)).toBe('$4');
    expect(formatPrice(3.5)).toBe('$3.50');
  });

  it('formats price ranges', () => {
    expect(formatPriceRange(4, 4)).toBe('$4');
    expect(formatPriceRange(3, 5)).toBe('$3–5');
    expect(formatPriceRange(0, 5)).toBe('Free–$5');
    expect(formatPriceRange(2.5, 10)).toBe('$2.50–10');
  });

  it('formats a date-only value without shifting the month', () => {
    expect(formatMonth('2026-08-01T00:00:00.000Z')).toBe('Aug 2026');
  });

  it('marks reports older than 18 months as stale', () => {
    const now = new Date('2026-10-11T00:00:00Z');
    expect(isStale('2025-05-01T00:00:00Z', now)).toBe(false);
    expect(isStale('2025-03-01T00:00:00Z', now)).toBe(true);
  });

  it('describes terms', () => {
    expect(describeTerms({ freeCount: 2, perPersonLimit: 10, turnaroundWeeks: 4 })).toBe('First 2 free · 10 per person · ~4 wk turnaround');
    expect(describeTerms({})).toBe('');
  });
});
