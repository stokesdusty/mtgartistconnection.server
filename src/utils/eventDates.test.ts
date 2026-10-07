import { daysUntil, eventCountdownLabel, eventStatusLabel, formatDateRange, formatDateRangeWithYear, formatWeekdayRange } from './eventDates';

const now = new Date(2026, 9, 7, 15, 30); // Wed Oct 7 2026, mid-afternoon

describe('formatDateRange', () => {
  it('formats a same-month range with a single month name', () => {
    expect(formatDateRange('2026-10-08T12:00:00', '2026-10-11T12:00:00')).toBe('Oct 8–11');
  });

  it('formats a range that crosses months', () => {
    expect(formatDateRange('2026-10-30T12:00:00', '2026-11-02T12:00:00')).toBe('Oct 30 – Nov 2');
  });

  it('formats a single-day event', () => {
    expect(formatDateRange('2026-11-21T10:00:00', '2026-11-21T18:00:00')).toBe('Nov 21');
  });
});

describe('formatWeekdayRange', () => {
  it('formats a multi-day weekday range', () => {
    expect(formatWeekdayRange('2026-10-08T12:00:00', '2026-10-11T12:00:00')).toBe('THU–SUN');
  });

  it('formats a single day', () => {
    expect(formatWeekdayRange('2026-11-21T10:00:00', '2026-11-21T18:00:00')).toBe('SAT');
  });
});

describe('daysUntil', () => {
  it('counts calendar days regardless of time of day', () => {
    expect(daysUntil('2026-10-08T09:00:00', now)).toBe(1);
    expect(daysUntil('2026-10-07T23:00:00', now)).toBe(0);
    expect(daysUntil('2026-10-05T09:00:00', now)).toBe(-2);
  });
});

describe('eventCountdownLabel', () => {
  it('labels events by how soon they start', () => {
    expect(eventCountdownLabel('2026-10-07T18:00:00', '2026-10-07T20:00:00', 7, now)).toBe('Today');
    expect(eventCountdownLabel('2026-10-08T12:00:00', '2026-10-11T12:00:00', 7, now)).toBe('Tomorrow');
    expect(eventCountdownLabel('2026-10-09T12:00:00', '2026-10-11T12:00:00', 7, now)).toBe('In 2 days');
    expect(eventCountdownLabel('2026-10-14T12:00:00', '2026-10-15T12:00:00', 7, now)).toBe('In 7 days');
  });

  it('returns null outside the window', () => {
    expect(eventCountdownLabel('2026-10-15T12:00:00', '2026-10-16T12:00:00', 7, now)).toBeNull();
  });

  it('marks a started multi-day event as happening now', () => {
    expect(eventCountdownLabel('2026-10-05T12:00:00', '2026-10-08T12:00:00', 7, now)).toBe('Happening now');
  });

  it('returns null for an event that has ended', () => {
    expect(eventCountdownLabel('2026-10-01T12:00:00', '2026-10-03T12:00:00', 7, now)).toBeNull();
  });
});

describe('formatDateRangeWithYear', () => {
  it('appends the year to a same-year range', () => {
    expect(formatDateRangeWithYear('2026-10-21T12:00:00', '2026-10-24T12:00:00')).toBe('Oct 21–24, 2026');
  });

  it('spells out both years when the event spans New Year', () => {
    expect(formatDateRangeWithYear('2026-12-30T12:00:00', '2027-01-02T12:00:00')).toBe('Dec 30, 2026 – Jan 2, 2027');
  });
});

describe('eventStatusLabel', () => {
  it('counts down to future events', () => {
    expect(eventStatusLabel('2026-10-21T12:00:00', '2026-10-24T12:00:00', now)).toBe('In 14 days');
    expect(eventStatusLabel('2026-10-08T09:00:00', '2026-10-08T18:00:00', now)).toBe('Tomorrow');
    expect(eventStatusLabel('2026-10-07T09:00:00', '2026-10-07T18:00:00', now)).toBe('Today');
  });

  it('flags events already underway', () => {
    expect(eventStatusLabel('2026-10-05T12:00:00', '2026-10-09T12:00:00', now)).toBe('Happening now');
  });

  it('shows the end date for past events', () => {
    expect(eventStatusLabel('2026-09-01T12:00:00', '2026-09-03T12:00:00', now)).toBe('Ended Sep 3, 2026');
  });
});
