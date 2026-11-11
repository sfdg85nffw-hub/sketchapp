import { describe, expect, it } from 'vitest';
import { DRILLS } from '../../src/data/drills';
import { WEAKNESS_IDS, WEAKNESSES } from '../../src/data/weaknesses';
import { addDays } from '../../src/lib/dates';
import {
  drillPriority,
  interleave,
  proposePractice,
  SESSION_MAX_DRILLS,
  SESSION_MAX_MINUTES,
  sessionMinutes,
  type PracticeInput,
} from '../../src/lib/practice';
import { chooseReflectionPrompts } from '../../src/lib/reflection';
import { initialDrillState, reviewDrill } from '../../src/lib/srs';
import type { DrillState, WeaknessId } from '../../src/lib/types';

const TODAY = '2026-11-11';
const evenNeed = () => Object.fromEntries(WEAKNESS_IDS.map((id) => [id, 0.5])) as Record<WeaknessId, number>;

function input(overrides: Partial<PracticeInput> = {}): PracticeInput {
  return { drills: DRILLS, states: new Map(), need: evenNeed(), focus: [], today: TODAY, ...overrides };
}

describe("today's practice", () => {
  it('proposes one to three drills totalling at most 20 minutes', () => {
    for (let d = 0; d < 40; d++) {
      const plan = proposePractice(input({ today: addDays(TODAY, d) }));
      expect(plan.length).toBeGreaterThanOrEqual(1);
      expect(plan.length).toBeLessThanOrEqual(SESSION_MAX_DRILLS);
      expect(sessionMinutes(plan)).toBeLessThanOrEqual(SESSION_MAX_MINUTES);
      expect(sessionMinutes(plan)).toBeGreaterThanOrEqual(10);
    }
  });

  it('never targets the same weakness twice in one session', () => {
    for (let d = 0; d < 40; d++) {
      const ids = proposePractice(input({ today: addDays(TODAY, d) }))
        .map((x) => x.weaknessId)
        .filter(Boolean);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('is stable within a day and varies across days', () => {
    const a = proposePractice(input()).map((d) => d.id);
    const b = proposePractice(input()).map((d) => d.id);
    expect(a).toEqual(b);
    const week = new Set(
      Array.from({ length: 7 }, (_, d) => proposePractice(input({ today: addDays(TODAY, d) })).map((x) => x.id).join()),
    );
    expect(week.size).toBeGreaterThan(1);
  });

  it('weights towards his weakest self-rated area', () => {
    const need = { ...evenNeed(), 'cast-shadows': 1 } as Record<WeaknessId, number>;
    let hits = 0;
    for (let d = 0; d < 30; d++) {
      const plan = proposePractice(input({ need, today: addDays(TODAY, d) }));
      if (plan.some((x) => x.weaknessId === 'cast-shadows')) hits++;
    }
    expect(hits).toBeGreaterThan(20);
  });

  it('gives a chosen focus weakness a clear boost', () => {
    const drill = DRILLS.find((d) => d.weaknessId === 'figures')!;
    expect(drillPriority(drill, input({ focus: ['figures'] }))).toBeCloseTo(1.5 * drillPriority(drill, input()), 10);
  });

  it('ranks a due drill above one just done and not yet due', () => {
    const drill = DRILLS[0]!;
    const done = reviewDrill(initialDrillState(drill.id, TODAY), 'right', TODAY);
    const states = new Map<string, DrillState>([[drill.id, done]]);
    expect(drillPriority(drill, input({ states }))).toBeLessThan(drillPriority(drill, input()) * 0.3);
    const later = addDays(TODAY, 9);
    expect(drillPriority(drill, input({ states, today: later }))).toBeGreaterThan(
      drillPriority(drill, input({ states })) * 3,
    );
  });

  it('interleaves: no two drills of one kind back to back when a different kind is available', () => {
    const ink = DRILLS.filter((d) => d.kind === 'ink');
    const wc = DRILLS.find((d) => d.kind === 'watercolor')!;
    const ordered = interleave([ink[0]!, ink[1]!, wc]);
    expect(ordered.map((d) => d.kind)).toEqual(['ink', 'watercolor', 'ink']);
  });
});

describe('drill library', () => {
  it('seeds every required drill with steps, a success criterion and three levels', () => {
    expect(DRILLS.length).toBeGreaterThanOrEqual(17);
    expect(new Set(DRILLS.map((d) => d.id)).size).toBe(DRILLS.length);
    for (const d of DRILLS) {
      expect(d.steps.length).toBeGreaterThanOrEqual(3);
      expect(d.success.length).toBeGreaterThan(20);
      expect(d.levels).toHaveLength(3);
      expect(d.minutes).toBeGreaterThan(0);
    }
  });

  it('has at least one drill for each of the ten weaknesses', () => {
    for (const id of WEAKNESS_IDS) expect(DRILLS.some((d) => d.weaknessId === id)).toBe(true);
  });
});

describe('reflection prompt choice', () => {
  const base = { weaknesses: WEAKNESSES, need: evenNeed(), history: [], today: TODAY, focus: [] as WeaknessId[] };

  it('offers three or four prompts, each for a different weakness', () => {
    const chosen = chooseReflectionPrompts({ ...base, subject: 'urban' });
    expect(chosen.length).toBe(4);
    expect(new Set(chosen.map((c) => c.weaknessId)).size).toBe(4);
  });

  it('only asks prompts that make sense for the subject', () => {
    const gesture = chooseReflectionPrompts({ ...base, subject: 'gesture', count: 10 }).map((c) => c.weaknessId);
    expect(gesture).not.toContain('foliage');
    expect(gesture).not.toContain('ellipses');
    expect(gesture).toContain('figures');
    const still = chooseReflectionPrompts({ ...base, subject: 'still-life', count: 10 }).map((c) => c.weaknessId);
    expect(still).toContain('ellipses');
    expect(still).not.toContain('figures');
  });

  it('puts what he was working on first', () => {
    const chosen = chooseReflectionPrompts({ ...base, subject: 'urban', focus: ['highlights'] });
    expect(chosen[0]!.weaknessId).toBe('highlights');
  });

  it('prioritises his lowest self-rated weakness', () => {
    const need = { ...evenNeed(), 'true-darks': 1, 'line-weight': 0 } as Record<WeaknessId, number>;
    const history = WEAKNESS_IDS.map((weaknessId) => ({ weaknessId, date: TODAY }));
    const chosen = chooseReflectionPrompts({ ...base, need, history, subject: 'urban' });
    expect(chosen[0]!.weaknessId).toBe('true-darks');
    expect(chosen.map((c) => c.weaknessId)).not.toContain('line-weight');
  });

  it('rotates: a weakness not asked recently outranks one asked today', () => {
    const history = WEAKNESS_IDS.filter((id) => id !== 'intent').map((weaknessId) => ({ weaknessId, date: TODAY }));
    const chosen = chooseReflectionPrompts({ ...base, history, subject: 'urban' });
    expect(chosen[0]!.weaknessId).toBe('intent');
  });

  it('rotates the wording each time a weakness is asked', () => {
    const first = chooseReflectionPrompts({ ...base, subject: 'urban', focus: ['cast-shadows'] })[0]!;
    const second = chooseReflectionPrompts({
      ...base,
      subject: 'urban',
      focus: ['cast-shadows'],
      history: [{ weaknessId: 'cast-shadows', date: addDays(TODAY, -1) }],
    })[0]!;
    expect(first.prompt).toBe(WEAKNESSES[0]!.prompts[0]);
    expect(second.prompt).toBe(WEAKNESSES[0]!.prompts[1]);
  });
});
