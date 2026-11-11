import { describe, expect, it } from 'vitest';
import { addDays } from '../../src/lib/dates';
import {
  daysOverdue,
  initialDrillState,
  MAX_EASE,
  MAX_INTERVAL_DAYS,
  MIN_EASE,
  reviewDrill,
  START_EASE,
} from '../../src/lib/srs';
import type { DrillRating, DrillState } from '../../src/lib/types';

const TODAY = '2026-11-11';

function run(ratings: DrillRating[]): DrillState {
  let state = initialDrillState('d', TODAY);
  let day = TODAY;
  for (const rating of ratings) {
    state = reviewDrill(state, rating, day);
    day = state.due;
  }
  return state;
}

describe('spaced-repetition scheduler', () => {
  it('starts due today at level 1', () => {
    const s = initialDrillState('d', TODAY);
    expect(s).toMatchObject({ level: 1, due: TODAY, reps: 0, ease: START_EASE, intervalDays: 0 });
    expect(daysOverdue(s, TODAY)).toBe(0);
  });

  it('expands the interval on repeated "right": 2, 5, then x ease', () => {
    let s = reviewDrill(initialDrillState('d', TODAY), 'right', TODAY);
    expect(s.intervalDays).toBe(2);
    expect(s.due).toBe(addDays(TODAY, 2));
    s = reviewDrill(s, 'right', s.due);
    expect(s.intervalDays).toBe(5);
    s = reviewDrill(s, 'right', s.due);
    expect(s.intervalDays).toBe(Math.round(5 * START_EASE));
    const intervals = run(['right', 'right', 'right', 'right', 'right']).history.length;
    expect(intervals).toBe(5);
  });

  it('intervals never shrink while he keeps getting it right', () => {
    let s = initialDrillState('d', TODAY);
    let last = 0;
    for (let i = 0; i < 8; i++) {
      s = reviewDrill(s, 'right', s.due);
      expect(s.intervalDays).toBeGreaterThanOrEqual(last);
      last = s.intervalDays;
    }
  });

  it('"harder" brings the drill back tomorrow, lowers ease and steps difficulty down', () => {
    const before = run(['easier', 'right']);
    expect(before.level).toBe(2);
    const after = reviewDrill(before, 'harder', before.due);
    expect(after.intervalDays).toBe(1);
    expect(after.due).toBe(addDays(before.due, 1));
    expect(after.reps).toBe(0);
    expect(after.ease).toBeCloseTo(before.ease - 0.2, 10);
    expect(after.level).toBe(1);
  });

  it('"easier" raises ease, grows the interval faster and steps difficulty up', () => {
    const right = reviewDrill(initialDrillState('d', TODAY), 'right', TODAY);
    const easier = reviewDrill(initialDrillState('d', TODAY), 'easier', TODAY);
    expect(easier.intervalDays).toBeGreaterThan(right.intervalDays);
    expect(easier.ease).toBeCloseTo(START_EASE + 0.15, 10);
    expect(easier.level).toBe(2);
  });

  it('three "right" in a row move difficulty up one level (desirable difficulty)', () => {
    expect(run(['right', 'right']).level).toBe(1);
    expect(run(['right', 'right', 'right']).level).toBe(2);
    expect(run(['right', 'right', 'right', 'right', 'right', 'right']).level).toBe(3);
  });

  it('keeps level within 1-3 and ease within its bounds', () => {
    expect(run(['harder', 'harder', 'harder']).level).toBe(1);
    expect(run(['easier', 'easier', 'easier', 'easier', 'easier', 'easier']).level).toBe(3);
    expect(run(Array<DrillRating>(12).fill('harder')).ease).toBeCloseTo(MIN_EASE, 10);
    expect(run(Array<DrillRating>(12).fill('easier')).ease).toBeCloseTo(MAX_EASE, 10);
  });

  it('caps the interval so no drill disappears for good', () => {
    expect(run(Array<DrillRating>(12).fill('easier')).intervalDays).toBe(MAX_INTERVAL_DAYS);
  });

  it('logs each review with the level it was done at', () => {
    const s = run(['easier', 'harder']);
    expect(s.history.map((h) => [h.rating, h.level])).toEqual([
      ['easier', 1],
      ['harder', 2],
    ]);
    expect(s.lastDone).toBe(s.history[1]!.date);
  });

  it('does not mutate the previous state', () => {
    const start = initialDrillState('d', TODAY);
    reviewDrill(start, 'right', TODAY);
    expect(start.history).toHaveLength(0);
    expect(start.reps).toBe(0);
  });

  it('reports overdue days', () => {
    const s = reviewDrill(initialDrillState('d', TODAY), 'right', TODAY);
    expect(daysOverdue(s, TODAY)).toBe(-2);
    expect(daysOverdue(s, addDays(TODAY, 6))).toBe(4);
  });
});
