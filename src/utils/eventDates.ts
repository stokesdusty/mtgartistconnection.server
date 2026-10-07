const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatShortDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** "Oct 21–24", "Oct 30 – Nov 2", or "Oct 21" for single-day events. */
export const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isSameDay(start, end)) return formatShortDate(start);
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${formatShortDate(start)}–${end.getDate()}`;
  }
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
};

/** "THU–SUN", or "SAT" for single-day events. */
export const formatWeekdayRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const weekday = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  return isSameDay(start, end) ? weekday(start) : `${weekday(start)}–${weekday(end)}`;
};

/** Whole days from today until the event starts (negative once it has started). */
export const daysUntil = (startDate: string, now: Date = new Date()) =>
  Math.round((startOfDay(new Date(startDate)).getTime() - startOfDay(now).getTime()) / DAY_MS);

/**
 * Countdown label for events starting within `withinDays`: "Today", "Tomorrow",
 * "In 3 days", or "Happening now" for multi-day events already underway.
 */
export const eventCountdownLabel = (
  startDate: string,
  endDate: string,
  withinDays = 7,
  now: Date = new Date(),
): string | null => {
  const days = daysUntil(startDate, now);
  if (days < 0) return daysUntil(endDate, now) >= 0 ? 'Happening now' : null;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return days <= withinDays ? `In ${days} days` : null;
};

/** "Oct 21–24, 2026", or "Dec 30, 2026 – Jan 2, 2027" when the event spans years. */
export const formatDateRangeWithYear = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start.getFullYear() !== end.getFullYear()) {
    return `${formatShortDate(start)}, ${start.getFullYear()} – ${formatShortDate(end)}, ${end.getFullYear()}`;
  }
  return `${formatDateRange(startDate, endDate)}, ${start.getFullYear()}`;
};

/**
 * Hero eyebrow for an event page: "In 14 days", "Tomorrow", "Today",
 * "Happening now", or "Ended Oct 24, 2026" once it is over.
 */
export const eventStatusLabel = (startDate: string, endDate: string, now: Date = new Date()) => {
  const days = daysUntil(startDate, now);
  if (days > 1) return `In ${days} days`;
  if (days === 1) return 'Tomorrow';
  if (days === 0) return 'Today';
  if (daysUntil(endDate, now) >= 0) return 'Happening now';
  const end = new Date(endDate);
  return `Ended ${formatShortDate(end)}, ${end.getFullYear()}`;
};
