import { describe, expect, it } from 'vitest';
import { pickNext, pruneShown } from '../../src/lib/ref/picker';
import {
  addTime,
  BUILTIN_SEQUENCES,
  clampSeconds,
  describeBlocks,
  endSession,
  formatClock,
  formatSeconds,
  inFinalCountdown,
  planLength,
  planSeconds,
  previous,
  progress,
  REVEAL_SECONDS,
  secondsAt,
  sequencePlan,
  setPaused,
  simplePlan,
  skip,
  startSession,
  tick,
  type PlayerEvent,
  type PlayerState,
  type SessionPlan,
} from '../../src/lib/ref/session';
import { seededRandom } from '../../src/lib/rng';

function run(plan: SessionPlan, state: PlayerState, seconds: number, step = 0.2): { state: PlayerState; events: PlayerEvent[] } {
  const events: PlayerEvent[] = [];
  for (let t = 0; t < seconds - 1e-9; t += step) {
    const result = tick(plan, state, step);
    state = result.state;
    events.push(...result.events);
  }
  return { state, events };
}

describe('session timing', () => {
  it('clamps the timer to 5-300 seconds in 5-second steps', () => {
    expect(clampSeconds(1)).toBe(5);
    expect(clampSeconds(47)).toBe(45);
    expect(clampSeconds(48)).toBe(50);
    expect(clampSeconds(900)).toBe(300);
  });

  it('formats times the way a person says them', () => {
    expect(formatSeconds(30)).toBe('30s');
    expect(formatSeconds(60)).toBe('1m');
    expect(formatSeconds(90)).toBe('1m 30s');
    expect(formatClock(65)).toBe('1:05');
    expect(formatClock(4.2)).toBe('5');
    expect(formatClock(0)).toBe('0');
  });

  it('ships the three class-mode sequences from the brief', () => {
    expect(BUILTIN_SEQUENCES.map((s) => describeBlocks(s.blocks))).toEqual(['10 × 30s', '10 × 30s, then 5 × 1m, then 2 × 5m', '3 × 5m']);
    const standard = sequencePlan(BUILTIN_SEQUENCES[1]!);
    expect(planLength(standard)).toBe(17);
    expect(planSeconds(standard)).toBe(10 * 30 + 5 * 60 + 2 * 300);
  });

  it('gives each image the time of its block in class mode', () => {
    const plan = sequencePlan(BUILTIN_SEQUENCES[1]!);
    expect(secondsAt(plan, 0)).toBe(30);
    expect(secondsAt(plan, 9)).toBe(30);
    expect(secondsAt(plan, 10)).toBe(60);
    expect(secondsAt(plan, 14)).toBe(60);
    expect(secondsAt(plan, 15)).toBe(300);
    expect(secondsAt(plan, 16)).toBe(300);
    expect(secondsAt(plan, 17)).toBeNull();
  });

  it('"until I stop" never runs out', () => {
    const plan = simplePlan(45, null);
    expect(planLength(plan)).toBeNull();
    expect(planSeconds(plan)).toBeNull();
    expect(secondsAt(plan, 0)).toBe(45);
    expect(secondsAt(plan, 400)).toBe(45);
  });
});

describe('session player', () => {
  const plan = simplePlan(10, 3);

  it('counts down, advances to the next image, and finishes after the last', () => {
    let { state, events } = run(plan, startSession(plan), 9.8);
    expect(state.index).toBe(0);
    expect(events).toEqual([]);
    ({ state, events } = run(plan, state, 0.4));
    expect(state.index).toBe(1);
    expect(state.remaining).toBe(10);
    expect(events).toEqual(['image-end']);
    ({ state, events } = run(plan, state, 20.6));
    expect(state.done).toBe(true);
    expect(events).toEqual(['image-end', 'image-end', 'finish']);
  });

  it('steps through a class sequence with the right time per image', () => {
    const cls = sequencePlan({ id: 'x', name: 'x', blocks: [{ count: 2, seconds: 5 }, { count: 1, seconds: 15 }] });
    let state = startSession(cls);
    expect(state.total).toBe(5);
    state = run(cls, state, 5.2).state;
    expect([state.index, state.total]).toEqual([1, 5]);
    state = run(cls, state, 5.2).state;
    expect([state.index, state.total]).toEqual([2, 15]);
    state = run(cls, state, 15.2).state;
    expect(state.done).toBe(true);
  });

  it('pause stops the clock and resume continues from the same second', () => {
    let state = run(plan, startSession(plan), 4).state;
    const at = state.remaining;
    state = setPaused(state, true);
    state = run(plan, state, 30).state;
    expect(state.remaining).toBe(at);
    expect(state.index).toBe(0);
    state = run(plan, setPaused(state, false), 1).state;
    expect(state.remaining).toBeCloseTo(at - 1, 5);
  });

  it('add 30s extends this image only', () => {
    let state = run(plan, startSession(plan), 8).state;
    state = addTime(state);
    expect(state.remaining).toBeCloseTo(32, 5);
    expect(state.total).toBe(40);
    state = run(plan, state, 32.2).state;
    expect(state.index).toBe(1);
    expect(state.total).toBe(10);
  });

  it('skip moves on immediately; previous goes back with full time', () => {
    let step = skip(plan, startSession(plan));
    expect(step.state.index).toBe(1);
    expect(previous(plan, step.state).index).toBe(0);
    expect(previous(plan, startSession(plan)).index).toBe(0);
    step = skip(plan, skip(plan, step.state).state);
    expect(step.state.done).toBe(true);
    expect(step.events).toContain('finish');
    expect(previous(plan, step.state)).toMatchObject({ index: 2, done: false, remaining: 10 });
  });

  it('flags the final five seconds, and reports progress for the bar', () => {
    let state = startSession(plan);
    expect(inFinalCountdown(state)).toBe(false);
    expect(progress(state)).toBe(0);
    state = run(plan, state, 5.2).state;
    expect(inFinalCountdown(state)).toBe(true);
    expect(progress(state)).toBeCloseTo(0.52, 2);
    expect(inFinalCountdown(endSession(state))).toBe(false);
  });

  it('draw from memory: look, hide, reveal, then the next image', () => {
    const memory = simplePlan(20, 2, 10);
    let { state, events } = run(memory, startSession(memory), 10.2);
    expect(state.phase).toBe('memory');
    expect(state.total).toBe(20);
    expect(events).toEqual(['hide']);
    ({ state, events } = run(memory, state, 20.2));
    expect(state.phase).toBe('reveal');
    expect(events).toEqual(['reveal']);
    expect(inFinalCountdown({ ...state, remaining: 2 })).toBe(false);
    ({ state, events } = run(memory, state, REVEAL_SECONDS + 0.2));
    expect([state.index, state.phase]).toEqual([1, 'look']);
    expect(events).toEqual(['image-end']);
    expect(planSeconds(memory)).toBe(2 * (10 + 20 + REVEAL_SECONDS));
  });
});

describe('no-repeat picker', () => {
  const pool = ['a', 'b', 'c', 'd', 'e'];
  const today = '2026-11-14';

  it('never repeats an image within a session and ends when the pool is used up', () => {
    const random = seededRandom(3);
    const seen = new Set<string>();
    for (let i = 0; i < pool.length; i++) {
      const next = pickNext({ pool, seen, lastShown: {}, today, random })!;
      expect(seen.has(next)).toBe(false);
      seen.add(next);
    }
    expect(pickNext({ pool, seen, lastShown: {}, today, random })).toBeNull();
  });

  it('avoids images shown in the last seven days while fresher ones remain', () => {
    const lastShown = { a: '2026-11-13', b: '2026-11-10', c: '2026-11-08' };
    for (let seed = 0; seed < 40; seed++) {
      expect(['d', 'e']).toContain(pickNext({ pool, seen: new Set(), lastShown, today, random: seededRandom(seed) }));
    }
    // Exactly seven days ago counts as fresh again.
    expect(pickNext({ pool: ['a', 'b'], seen: new Set(), lastShown: { a: '2026-11-13', b: '2026-11-07' }, today, random: seededRandom(1) })).toBe('b');
  });

  it('falls back to the least recently shown when everything is recent', () => {
    const lastShown = { a: '2026-11-13', b: '2026-11-10', c: '2026-11-12' };
    expect(pickNext({ pool: ['a', 'b', 'c'], seen: new Set(), lastShown, today, random: seededRandom(5) })).toBe('b');
    expect(pickNext({ pool: ['a', 'b', 'c'], seen: new Set(['b']), lastShown, today, random: seededRandom(5) })).toBe('c');
  });

  it('forgets history older than a month', () => {
    expect(pruneShown({ a: '2026-11-13', old: '2026-09-01' }, today)).toEqual({ a: '2026-11-13' });
  });
});
