import { addDays, diffDays } from './dates';
import type { DrillLevel, DrillLog, DrillRating, DrillState } from './types';

export const MIN_EASE = 1.3;
export const MAX_EASE = 3;
export const START_EASE = 2.3;
/** A drawing skill left alone for two months has gone stale, so intervals stop growing here. */
export const MAX_INTERVAL_DAYS = 60;
/** "Right" this many times in a row at one level moves the drill up a level. */
export const RIGHTS_PER_LEVEL = 3;

export function initialDrillState(drillId: string, today: string): DrillState {
  return { drillId, level: 1, intervalDays: 0, ease: START_EASE, reps: 0, due: today, history: [] };
}

const clampLevel = (n: number): DrillLevel => Math.min(3, Math.max(1, n)) as DrillLevel;

/**
 * SM-2-style scheduling with three answers instead of six.
 *  - harder: come back tomorrow, ease drops, difficulty steps down.
 *  - right:  2 days, then 5, then interval x ease. Three in a row steps difficulty up.
 *  - easier: ease rises, interval grows faster, difficulty steps up now.
 */
export function reviewDrill(
  state: DrillState,
  rating: DrillRating,
  today: string,
  extra: Pick<DrillLog, 'entryId' | 'demo'> = {},
): DrillState {
  let { ease, reps, intervalDays } = state;
  let level: number = state.level;

  if (rating === 'harder') {
    reps = 0;
    intervalDays = 1;
    ease = Math.max(MIN_EASE, ease - 0.2);
    level -= 1;
  } else if (rating === 'right') {
    reps += 1;
    intervalDays = reps === 1 ? 2 : reps === 2 ? 5 : Math.round(Math.max(intervalDays, 1) * ease);
    if (reps % RIGHTS_PER_LEVEL === 0) level += 1;
  } else {
    reps += 1;
    ease = Math.min(MAX_EASE, ease + 0.15);
    intervalDays = Math.max(3, Math.round(Math.max(intervalDays, 1) * ease * 1.3));
    level += 1;
  }

  intervalDays = Math.min(MAX_INTERVAL_DAYS, intervalDays);
  const log: DrillLog = { date: today, rating, level: state.level, ...extra };
  return {
    drillId: state.drillId,
    level: clampLevel(level),
    intervalDays,
    ease,
    reps,
    due: addDays(today, intervalDays),
    lastDone: today,
    history: [...state.history, log],
  };
}

/** Days overdue (positive), due today (0) or not yet due (negative). */
export function daysOverdue(state: DrillState, today: string): number {
  return diffDays(state.due, today);
}
