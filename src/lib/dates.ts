/** Calendar helpers. Days are local-time keys of the form YYYY-MM-DD; months are YYYY-MM. */

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function addDays(key: string, days: number): string {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function diffDays(from: string, to: string): number {
  return Math.round((fromDateKey(to).getTime() - fromDateKey(from).getTime()) / 86_400_000);
}

export function monthKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function previousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y ?? 1970, (m ?? 1) - 2, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function formatMonth(month: string, locale?: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

export function formatDay(dateKey: string, locale?: string): string {
  return fromDateKey(dateKey).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatDayLong(dateKey: string, locale?: string): string {
  return fromDateKey(dateKey).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
}
