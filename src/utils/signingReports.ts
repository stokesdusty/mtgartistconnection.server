// Mirrors the webservice's SigningReport enums.
export const SIGNING_METHODS = ['convention', 'mail_in', 'signing_service', 'store_event', 'other'] as const;
export const SIGNING_EXTRA_KINDS = ['playmat', 'remarque', 'sketch', 'alter', 'proof'] as const;

export type SigningMethod = typeof SIGNING_METHODS[number];
export type SigningExtraKind = typeof SIGNING_EXTRA_KINDS[number];

export const METHOD_LABELS: Record<SigningMethod, string> = {
  convention: 'Convention',
  mail_in: 'Mail-in',
  signing_service: 'Signing service',
  store_event: 'Store event',
  other: 'Other',
};

export const EXTRA_LABELS: Record<SigningExtraKind, string> = {
  playmat: 'Playmat',
  remarque: 'Remarque',
  sketch: 'Sketch',
  alter: 'Alter',
  proof: 'Artist proof',
};

export const NOTE_MAX_LENGTH = 280;
// Reports older than this are shown dimmed; prices drift.
export const STALE_AFTER_MONTHS = 18;

export interface SigningReport {
  id: string;
  artistName: string;
  signedOn: string;
  method: SigningMethod;
  pricePerSig: number;
  freeCount?: number | null;
  perPersonLimit?: number | null;
  extras?: { kind: SigningExtraKind; price: number }[] | null;
  turnaroundWeeks?: number | null;
  eventId?: string | null;
  serviceName?: string | null;
  note?: string | null;
}

export interface SigningReportSummary {
  count: number;
  medianPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  latestSignedOn: string | null;
  byMethod: { method: SigningMethod; count: number; medianPrice: number | null }[];
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

/** "$3–5", "$4" or "Free–$5". */
export function formatPriceRange(min: number, max: number): string {
  if (min === max) return formatPrice(min);
  const low = min === 0 ? 'Free' : formatPrice(min);
  const high = formatPrice(max).replace(/^\$/, '');
  return min === 0 ? `${low}–$${high}` : `${low}–${high}`;
}

/** Month and year in UTC, so a date-only value never shifts back a month. */
export function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function isStale(iso: string, now: Date = new Date()): boolean {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - STALE_AFTER_MONTHS);
  return new Date(iso) < cutoff;
}

/** Short terms line for a report, e.g. "First 2 free · 10 per person · ~4 wk turnaround". */
export function describeTerms(report: Pick<SigningReport, 'freeCount' | 'perPersonLimit' | 'turnaroundWeeks'>): string {
  const parts: string[] = [];
  if (report.freeCount) parts.push(`First ${report.freeCount} free`);
  if (report.perPersonLimit) parts.push(`${report.perPersonLimit} per person`);
  if (report.turnaroundWeeks) parts.push(`~${report.turnaroundWeeks} wk turnaround`);
  return parts.join(' · ');
}
