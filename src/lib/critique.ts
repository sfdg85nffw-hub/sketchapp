import type { Entry, Rating } from './types';

export const RATING_LABELS: Record<Rating, string> = { 0: 'Not yet', 1: 'Partly', 2: 'Yes' };

export interface CritiqueContext {
  entry: Entry;
  subjectLabel: string;
  mediumLabel: string;
  weaknessTitles: readonly string[];
  focusTitles: readonly string[];
}

/** One line per reflection answer, for the share image and the critique prompt. */
export function reflectionLines(entry: Entry): string[] {
  return (entry.reflection?.items ?? []).map(
    (item) => `${item.prompt} ${RATING_LABELS[item.rating]}.${item.note ? ` Note: ${item.note}` : ''}`,
  );
}

/** A ready-to-paste request for honest critique, with his profile and self-ratings filled in. */
export function buildCritiquePrompt(ctx: CritiqueContext): string {
  const { entry } = ctx;
  const facts = [
    `Subject: ${ctx.subjectLabel}`,
    `Medium: ${ctx.mediumLabel}`,
    entry.location ? `Location: ${entry.location}` : null,
    entry.minutes ? `Time spent: about ${entry.minutes} minutes` : null,
    `Feeling word I was aiming for: ${entry.feeling ?? 'none chosen (that is part of the problem)'}`,
    entry.plan?.focal ? `Intended focal point: ${entry.plan.focal}` : null,
    ctx.focusTitles.length ? `What I was working on: ${ctx.focusTitles.join('; ')}` : null,
  ].filter((line): line is string => line !== null);

  const selfRatings = reflectionLines(entry);

  return [
    'Please critique the attached sketch. Be honest, specific and unsparing, but kind. No flattery.',
    '',
    'About me: adult, self-taught, drawing since June 2026. I sketch on location in New York in pen and ink',
    '(Sailor Fude de Mannen bent-nib fountain pen, pocket Moleskine), sometimes with a 12-pan student watercolor',
    'set and a water brush. I am red-green colorblind: I confuse reds, greens, browns and oranges, so I work by',
    'value (light vs. dark) and warm vs. cool rather than by naming colors. I am studying Betty Edwards and',
    'Arthur Guptill. My perspective and solid forms are fairly sound. What I want most is for my drawings to have',
    'a point of view and a feeling, not just accuracy.',
    '',
    'This sketch:',
    ...facts.map((f) => `- ${f}`),
    '',
    selfRatings.length ? 'My own answers after drawing it:' : 'I have not done a self-reflection on this one yet.',
    ...selfRatings.map((l) => `- ${l}`),
    '',
    'Please check it against my ten recurring weaknesses, and say plainly which ones show up here:',
    ...ctx.weaknessTitles.map((t, i) => `${i + 1}. ${t}`),
    '',
    'Then tell me: (a) the one thing that works best, (b) the single change that would improve it most,',
    '(c) whether the drawing actually evokes the feeling word, and what specific choices of crop, value or line',
    'weight would serve it better, and (d) one short exercise to do before my next sketch.',
    'If you discuss color, describe it as warm/cool and light/dark, not by hue name alone.',
  ].join('\n');
}
