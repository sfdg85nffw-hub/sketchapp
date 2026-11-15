import { diffDays } from '../dates';
import { pickOne, type Random } from '../rng';

/** Images shown within this many days are avoided while fresher ones remain. */
export const AVOID_DAYS = 7;

export interface PickInput {
  /** Every key that could be shown. */
  pool: readonly string[];
  /** Keys already shown in this session: never repeated. */
  seen: ReadonlySet<string>;
  /** Key to the day (YYYY-MM-DD) it was last shown. */
  lastShown: Readonly<Record<string, string>>;
  today: string;
  random: Random;
}

/**
 * The next image: never one already seen this session; one not shown in the last
 * week when there is one; otherwise whichever was shown longest ago.
 * Returns null when the session has used up the pool.
 */
export function pickNext(input: PickInput): string | null {
  const unseen = input.pool.filter((key) => !input.seen.has(key));
  if (unseen.length === 0) return null;
  const age = (key: string) => {
    const last = input.lastShown[key];
    return last ? diffDays(last, input.today) : Infinity;
  };
  const fresh = unseen.filter((key) => age(key) >= AVOID_DAYS);
  if (fresh.length > 0) return pickOne(input.random, fresh);
  const oldest = Math.max(...unseen.map(age));
  return pickOne(input.random, unseen.filter((key) => age(key) === oldest));
}

/** Drop history older than `keepDays`, so the record stays small. */
export function pruneShown(lastShown: Readonly<Record<string, string>>, today: string, keepDays = 30): Record<string, string> {
  const kept: Record<string, string> = {};
  for (const [key, day] of Object.entries(lastShown)) if (diffDays(day, today) <= keepDays) kept[key] = day;
  return kept;
}
