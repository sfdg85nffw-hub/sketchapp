import { monthKey, previousMonth } from './dates';
import type { Entry, MonthlyReview, Rating, WeaknessId } from './types';

export interface RatingPoint {
  date: string;
  rating: Rating;
  entryId: string;
}

/** Every self-rating he has given, grouped by weakness, oldest first. */
export function ratingSeries(entries: readonly Entry[]): Map<WeaknessId, RatingPoint[]> {
  const series = new Map<WeaknessId, RatingPoint[]>();
  const sorted = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const entry of sorted) {
    for (const item of entry.reflection?.items ?? []) {
      const list = series.get(item.weaknessId) ?? [];
      list.push({ date: entry.date, rating: item.rating, entryId: entry.id });
      series.set(item.weaknessId, list);
    }
  }
  return series;
}

/** How many recent ratings count towards "where he is now". */
export const RECENT_WINDOW = 5;

/** Mean of the most recent ratings (0-2), or null with no ratings yet. */
export function recentAverage(points: readonly RatingPoint[]): number | null {
  const recent = points.slice(-RECENT_WINDOW);
  if (recent.length === 0) return null;
  return recent.reduce((sum, p) => sum + p.rating, 0) / recent.length;
}

/**
 * Need per weakness, 0 (solid) to 1 (weakest), from recent self-ratings.
 * A weakness he has never rated sits in the middle at 0.5.
 */
export function needByWeakness(entries: readonly Entry[], ids: readonly WeaknessId[]): Record<WeaknessId, number> {
  const series = ratingSeries(entries);
  const need = {} as Record<WeaknessId, number>;
  for (const id of ids) {
    const avg = recentAverage(series.get(id) ?? []);
    need[id] = avg === null ? 0.5 : 1 - avg / 2;
  }
  return need;
}

export type Trend = 'up' | 'steady' | 'down' | 'none';

/** Direction of travel: the recent window against the one before it. */
export function trendOf(points: readonly RatingPoint[]): Trend {
  if (points.length < 4) return 'none';
  const half = Math.min(RECENT_WINDOW, Math.floor(points.length / 2));
  const mean = (list: readonly RatingPoint[]) => list.reduce((s, p) => s + p.rating, 0) / list.length;
  const delta = mean(points.slice(-half)) - mean(points.slice(-half * 2, -half));
  if (delta > 0.25) return 'up';
  if (delta < -0.25) return 'down';
  return 'steady';
}

/** Distinct calendar days with at least one sketch in the given month. */
export function daysDrawnInMonth(entries: readonly Entry[], month: string): number {
  return new Set(entries.filter((e) => monthKey(e.date) === month).map((e) => e.date)).size;
}

export function groupByMonth(entries: readonly Entry[]): { month: string; entries: Entry[] }[] {
  const groups = new Map<string, Entry[]>();
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  for (const entry of sorted) {
    const key = monthKey(entry.date);
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([month, list]) => ({ month, entries: list }));
}

/**
 * The month a review is due for, if any: last month, when it has sketches,
 * has not been reviewed, and has not been skipped.
 */
export function reviewDueFor(
  today: string,
  entries: readonly Entry[],
  reviews: readonly MonthlyReview[],
  skippedMonth?: string,
): string | null {
  const last = previousMonth(monthKey(today));
  if (skippedMonth === last) return null;
  if (reviews.some((r) => r.month === last)) return null;
  return entries.some((e) => monthKey(e.date) === last) ? last : null;
}

/** Days since the last backup, or since first use when there has never been one. */
export function backupAgeDays(today: Date, lastBackupAt: string | undefined, firstUseAt: string): number {
  const since = new Date(lastBackupAt ?? firstUseAt).getTime();
  return Math.floor((today.getTime() - since) / 86_400_000);
}

export const BACKUP_REMINDER_DAYS = 14;
