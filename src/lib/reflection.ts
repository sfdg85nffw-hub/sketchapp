import { diffDays } from './dates';
import type { SubjectId, WeaknessId } from './types';

export interface WeaknessPrompts {
  id: WeaknessId;
  prompts: readonly string[];
  /** Subjects where the prompt makes sense; empty means all of them. */
  subjects: readonly SubjectId[];
}

export interface PromptHistoryItem {
  weaknessId: WeaknessId;
  date: string;
}

export interface PromptChoiceInput {
  weaknesses: readonly WeaknessPrompts[];
  subject: SubjectId;
  /** What he said he was working on in this sketch. */
  focus: readonly WeaknessId[];
  /** 0 (solid) to 1 (weakest). */
  need: Readonly<Record<WeaknessId, number>>;
  /** Every prompt he has answered before. */
  history: readonly PromptHistoryItem[];
  today: string;
  count?: number;
}

export interface ChosenPrompt {
  weaknessId: WeaknessId;
  prompt: string;
}

export const DEFAULT_PROMPT_COUNT = 4;
const STALE_AFTER_DAYS = 30;

/**
 * Choose the reflection prompts for one sketch.
 * Priority: what he was working on, then his lowest self-rated areas, then whatever
 * has not been asked for longest, so every weakness comes round. The wording rotates
 * each time a weakness is asked.
 */
export function chooseReflectionPrompts(input: PromptChoiceInput): ChosenPrompt[] {
  const count = input.count ?? DEFAULT_PROMPT_COUNT;
  const relevant = input.weaknesses.filter((w) => w.subjects.length === 0 || w.subjects.includes(input.subject));

  const scored = relevant.map((w, index) => {
    const asked = input.history.filter((h) => h.weaknessId === w.id);
    const lastAsked = asked.reduce<string | null>((latest, h) => (latest && latest > h.date ? latest : h.date), null);
    const staleness = lastAsked
      ? Math.min(STALE_AFTER_DAYS, Math.max(0, diffDays(lastAsked, input.today))) / STALE_AFTER_DAYS
      : 1.2;
    const score = (input.focus.includes(w.id) ? 3 : 0) + 2 * input.need[w.id] + staleness;
    return { w, score, timesAsked: asked.length, index };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.slice(0, Math.min(count, scored.length)).map(({ w, timesAsked }) => ({
    weaknessId: w.id,
    prompt: w.prompts[timesAsked % w.prompts.length]!,
  }));
}
