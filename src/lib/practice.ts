import { hashUnit } from './id';
import { daysOverdue } from './srs';
import type { Drill, DrillState, WeaknessId } from './types';

export interface PracticeInput {
  drills: readonly Drill[];
  states: ReadonlyMap<string, DrillState>;
  /** 0 (solid) to 1 (weakest) per weakness. */
  need: Readonly<Record<WeaknessId, number>>;
  /** Weaknesses he has chosen to focus on. */
  focus: readonly WeaknessId[];
  today: string;
}

export const SESSION_MIN_MINUTES = 10;
export const SESSION_MAX_MINUTES = 20;
export const SESSION_MAX_DRILLS = 3;

/** How strongly a drill is asking to be done today. */
export function drillPriority(drill: Drill, input: PracticeInput): number {
  const state = input.states.get(drill.id);
  let due: number;
  if (!state || state.history.length === 0) {
    due = 1;
  } else {
    const overdue = daysOverdue(state, input.today);
    due = overdue >= 0 ? 1 + Math.min(overdue, 14) / 14 : 0.25 * Math.max(0, 1 + overdue / Math.max(1, state.intervalDays));
  }
  const need = drill.weaknessId ? input.need[drill.weaknessId] : 0.5;
  const focus = drill.weaknessId && input.focus.includes(drill.weaknessId) ? 1.5 : 1;
  // Stable per-day shuffle so the proposal does not change every time the screen opens.
  const jitter = 0.85 + 0.3 * hashUnit(`${input.today}:${drill.id}`);
  return due * (0.5 + need) * focus * jitter;
}

/**
 * Today's practice: one to three drills, 10-20 minutes, weighted towards due drills
 * and his weakest areas, never two drills on the same weakness, and ordered so that
 * neighbouring drills differ in kind (interleaving).
 */
export function proposePractice(input: PracticeInput): Drill[] {
  const ranked = [...input.drills].sort((a, b) => drillPriority(b, input) - drillPriority(a, input));
  const picked: Drill[] = [];
  let minutes = 0;
  for (const drill of ranked) {
    if (picked.length >= SESSION_MAX_DRILLS) break;
    if (minutes + drill.minutes > SESSION_MAX_MINUTES) continue;
    if (drill.weaknessId && picked.some((p) => p.weaknessId === drill.weaknessId)) continue;
    const sameKind = picked.filter((p) => p.kind === drill.kind).length;
    if (sameKind >= 2) continue;
    picked.push(drill);
    minutes += drill.minutes;
    if (minutes >= SESSION_MIN_MINUTES && picked.length >= 2 && minutes >= SESSION_MAX_MINUTES - 4) break;
  }
  return interleave(picked);
}

/** Reorder so two drills of the same kind are not back to back where avoidable. */
export function interleave(drills: readonly Drill[]): Drill[] {
  const result = [...drills];
  for (let i = 1; i < result.length; i++) {
    if (result[i]!.kind !== result[i - 1]!.kind) continue;
    const swap = result.findIndex((d, j) => j > i && d.kind !== result[i - 1]!.kind);
    if (swap > 0) [result[i], result[swap]] = [result[swap]!, result[i]!];
  }
  return result;
}

export function sessionMinutes(drills: readonly Drill[]): number {
  return drills.reduce((sum, d) => sum + d.minutes, 0);
}
