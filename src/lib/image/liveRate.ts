/*
 * The live value view should keep up with the camera. When a slow phone cannot,
 * it asks the camera for fewer pixels rather than dropping frames: a value study
 * needs smooth motion more than it needs 720 lines.
 */

/** Camera heights (in the camera's own landscape sense) the live view steps down through. */
export const LIVE_HEIGHTS = [720, 540, 432] as const;

/** Frames a second the live view aims for. */
export const TARGET_FPS = 24;

/** One measuring window: frames drawn, frames the camera presented, and its length. */
export interface RateSample {
  processed: number;
  presented: number;
  seconds: number;
}

/**
 * Keeping up means drawing at the target rate, or drawing nearly every frame the
 * camera delivered: in dim light a phone camera slows itself down, and fewer pixels
 * would not help with that.
 */
export function keepingUp(sample: RateSample): boolean {
  if (sample.seconds <= 0) return true;
  if (sample.processed / sample.seconds >= TARGET_FPS) return true;
  return sample.presented <= 0 || sample.processed / sample.presented >= 0.9;
}

/** One rung down after two slow windows in a row, never past the last rung. */
export function nextRung(rung: number, slowWindows: number): number {
  return slowWindows >= 2 && rung < LIVE_HEIGHTS.length - 1 ? rung + 1 : rung;
}
