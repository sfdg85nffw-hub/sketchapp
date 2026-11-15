/**
 * The timed-session state machine shared by every reference mode and by the
 * plain gesture timer. Pure: time comes in through `tick`, nothing reads a clock.
 */

export const MIN_SECONDS = 5;
export const MAX_SECONDS = 300;
export const STEP_SECONDS = 5;
export const PRESET_SECONDS: readonly number[] = [15, 30, 45, 60, 120, 180, 300];
export const MAX_IMAGES = 50;
export const ADD_SECONDS = 30;
/** How long the reference stays up for comparison after drawing from memory. */
export const REVEAL_SECONDS = 10;
/** The last seconds of an image get a shape-and-motion warning. */
export const FINAL_COUNTDOWN_SECONDS = 5;

/** `count` images of `seconds` each. */
export interface Block {
  count: number;
  seconds: number;
}

export interface Sequence {
  id: string;
  name: string;
  blocks: Block[];
}

/** Class-mode sessions that ramp up the way a life class does. */
export const BUILTIN_SEQUENCES: readonly Sequence[] = [
  { id: 'warm-up', name: 'Warm-up', blocks: [{ count: 10, seconds: 30 }] },
  {
    id: 'standard',
    name: 'Standard class',
    blocks: [
      { count: 10, seconds: 30 },
      { count: 5, seconds: 60 },
      { count: 2, seconds: 300 },
    ],
  },
  { id: 'long', name: 'Long studies', blocks: [{ count: 3, seconds: 300 }] },
];

export interface SessionPlan {
  blocks: Block[];
  /** Keep going with the last block's timing until he stops. */
  endless: boolean;
  /** Draw from memory: look for this many seconds, then the image hides for the block's time. */
  memoryLook?: number;
  /** Hold each image this long after its time is up, for a self-check overlay such as the line of action. */
  review?: number;
}

export function clampSeconds(seconds: number): number {
  const stepped = Math.round(seconds / STEP_SECONDS) * STEP_SECONDS;
  return Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, stepped));
}

export function clampCount(count: number): number {
  return Math.min(MAX_IMAGES, Math.max(1, Math.round(count)));
}

/** One timing for every image; `count` null means "until I stop". */
export function simplePlan(seconds: number, count: number | null, memoryLook?: number): SessionPlan {
  return {
    blocks: [{ count: count === null ? 1 : clampCount(count), seconds: clampSeconds(seconds) }],
    endless: count === null,
    ...(memoryLook ? { memoryLook: clampSeconds(memoryLook) } : {}),
  };
}

export function sequencePlan(sequence: Sequence, memoryLook?: number): SessionPlan {
  return {
    blocks: sequence.blocks.map((b) => ({ count: clampCount(b.count), seconds: clampSeconds(b.seconds) })),
    endless: false,
    ...(memoryLook ? { memoryLook: clampSeconds(memoryLook) } : {}),
  };
}

/** Number of images in the plan, or null when it runs until stopped. */
export function planLength(plan: SessionPlan): number | null {
  return plan.endless ? null : plan.blocks.reduce((sum, b) => sum + b.count, 0);
}

/**
 * The plan cut down to its first `count` images, for when the picture pool runs out
 * before the plan does: the last picture still gets its full time, then the session ends.
 */
export function capPlan(plan: SessionPlan, count: number): SessionPlan {
  const limit = Math.max(1, Math.floor(count));
  const blocks: Block[] = [];
  let left = limit;
  for (const block of plan.blocks) {
    if (left <= 0) break;
    const take = Math.min(block.count, left);
    blocks.push({ ...block, count: take });
    left -= take;
  }
  // An endless plan repeats its last timing; carry that on to the cut.
  const last = plan.blocks[plan.blocks.length - 1];
  if (left > 0 && plan.endless && last) blocks.push({ ...last, count: left });
  return { ...plan, blocks, endless: false };
}

/** Drawing time for image number `index` (from 0), or null once the plan is over. */
export function secondsAt(plan: SessionPlan, index: number): number | null {
  if (index < 0) return null;
  let at = index;
  for (const block of plan.blocks) {
    if (at < block.count) return block.seconds;
    at -= block.count;
  }
  return plan.endless ? (plan.blocks[plan.blocks.length - 1]?.seconds ?? null) : null;
}

/** Total drawing time in seconds, or null when the plan runs until stopped. */
export function planSeconds(plan: SessionPlan): number | null {
  if (plan.endless) return null;
  const perImageExtra = plan.memoryLook ? plan.memoryLook + REVEAL_SECONDS : 0;
  return plan.blocks.reduce((sum, b) => sum + b.count * (b.seconds + perImageExtra), 0);
}

export function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : String(s);
}

/** "10 × 30s, then 5 × 1m, then 2 × 5m" */
export function describeBlocks(blocks: readonly Block[]): string {
  return blocks.map((b) => `${b.count} × ${formatSeconds(b.seconds)}`).join(', then ');
}

/** look: the reference is showing. memory: it is hidden while he draws. reveal: it is back for comparison. */
export type Phase = 'look' | 'memory' | 'reveal';

export interface PlayerState {
  index: number;
  phase: Phase;
  /** Seconds left in this phase. */
  remaining: number;
  /** Length of this phase including any time added, for the progress bar. */
  total: number;
  paused: boolean;
  done: boolean;
}

export type PlayerEvent = 'image-end' | 'hide' | 'reveal' | 'finish';

export interface Step {
  state: PlayerState;
  events: PlayerEvent[];
}

function enter(plan: SessionPlan, index: number, paused: boolean): Step {
  const seconds = secondsAt(plan, index);
  if (seconds === null) {
    return { state: { index, phase: 'look', remaining: 0, total: 0, paused: false, done: true }, events: ['finish'] };
  }
  const first = plan.memoryLook ?? seconds;
  return { state: { index, phase: 'look', remaining: first, total: first, paused, done: false }, events: [] };
}

export function startSession(plan: SessionPlan): PlayerState {
  return enter(plan, 0, false).state;
}

function endOfPhase(plan: SessionPlan, state: PlayerState): Step {
  if (plan.memoryLook && state.phase === 'look') {
    const draw = secondsAt(plan, state.index) ?? MIN_SECONDS;
    return { state: { ...state, phase: 'memory', remaining: draw, total: draw }, events: ['hide'] };
  }
  if (plan.memoryLook && state.phase === 'memory') {
    return { state: { ...state, phase: 'reveal', remaining: REVEAL_SECONDS, total: REVEAL_SECONDS }, events: ['reveal'] };
  }
  if (!plan.memoryLook && plan.review && state.phase === 'look') {
    return { state: { ...state, phase: 'reveal', remaining: plan.review, total: plan.review }, events: ['reveal'] };
  }
  const next = enter(plan, state.index + 1, false);
  return { state: next.state, events: ['image-end', ...next.events] };
}

/** Advance the clock by `dt` seconds. */
export function tick(plan: SessionPlan, state: PlayerState, dt: number): Step {
  if (state.paused || state.done || dt <= 0) return { state, events: [] };
  const remaining = state.remaining - dt;
  if (remaining > 0) return { state: { ...state, remaining }, events: [] };
  return endOfPhase(plan, state);
}

/** Jump to the next image now. */
export function skip(plan: SessionPlan, state: PlayerState): Step {
  if (state.done) return { state, events: [] };
  return enter(plan, state.index + 1, state.paused);
}

/** Back to the previous image, with its full time. On the first image, restart it. */
export function previous(plan: SessionPlan, state: PlayerState): PlayerState {
  return enter(plan, Math.max(0, state.index - 1), state.paused).state;
}

export function addTime(state: PlayerState, seconds: number = ADD_SECONDS): PlayerState {
  if (state.done) return state;
  return { ...state, remaining: state.remaining + seconds, total: state.total + seconds };
}

export function setPaused(state: PlayerState, paused: boolean): PlayerState {
  return state.done ? state : { ...state, paused };
}

export function endSession(state: PlayerState): PlayerState {
  return { ...state, done: true, paused: false, remaining: 0 };
}

/** True in the last five seconds of drawing time. Never during the comparison reveal. */
export function inFinalCountdown(state: PlayerState): boolean {
  return !state.done && state.phase !== 'reveal' && state.remaining <= FINAL_COUNTDOWN_SECONDS;
}

/** 0 at the start of the phase, 1 at the end. */
export function progress(state: PlayerState): number {
  return state.total <= 0 ? 1 : Math.min(1, Math.max(0, 1 - state.remaining / state.total));
}
