import { greyForLstar, lstarFromLuminance, srgbToLinear } from './convert';

/** The value-map step counts offered in the UI: notan, three-value, five-value. */
export const VALUE_STEPS = [2, 3, 5] as const;
export type ValueSteps = (typeof VALUE_STEPS)[number];

/**
 * Value on the artist's 1-10 scale from L* (0-100).
 * 1 is white paper, 10 is black ink. Ten equal bands of L*.
 */
export function valueFromLstar(lstar: number): number {
  const l = Math.min(100, Math.max(0, lstar));
  return Math.min(10, Math.max(1, 10 - Math.floor(l / 10)));
}

/** The L* boundaries between bands when posterizing to `steps` values: equal bands of L*. */
export function posterizeThresholds(steps: number): number[] {
  return Array.from({ length: steps - 1 }, (_, i) => ((i + 1) * 100) / steps);
}

/** Which band (0 = darkest, steps-1 = lightest) an L* falls into. */
export function posterizeBand(lstar: number, steps: number): number {
  const l = Math.min(100, Math.max(0, lstar));
  return Math.min(steps - 1, Math.floor((l / 100) * steps));
}

/** The L* a band is drawn at: evenly spread from black (0) to paper white (100). */
export function bandLstar(band: number, steps: number): number {
  return steps <= 1 ? 100 : (band / (steps - 1)) * 100;
}

/** Posterized L* for an input L*. */
export function posterizeLstar(lstar: number, steps: number): number {
  return bandLstar(posterizeBand(lstar, steps), steps);
}

/** Linear-light lookup for the 256 sRGB channel values. */
export const SRGB_TO_LINEAR_LUT: Float32Array = Float32Array.from({ length: 256 }, (_, i) => srgbToLinear(i));

const LUMINANCE_LUT_SIZE = 1024;

/**
 * A lookup from quantised luminance Y to an output grey level, for fast per-pixel work.
 * `steps` of 0 means continuous greyscale. `range` optionally stretches [low, high] L* to 0-100 first.
 */
export function buildGreyLut(steps: number, range?: { low: number; high: number }): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(LUMINANCE_LUT_SIZE);
  const low = range?.low ?? 0;
  const span = Math.max(1, (range?.high ?? 100) - low);
  for (let i = 0; i < LUMINANCE_LUT_SIZE; i++) {
    const raw = lstarFromLuminance(i / (LUMINANCE_LUT_SIZE - 1));
    const lstar = Math.min(100, Math.max(0, ((raw - low) / span) * 100));
    lut[i] = greyForLstar(steps >= 2 ? posterizeLstar(lstar, steps) : lstar);
  }
  return lut;
}

/** Index into a grey LUT for an 8-bit sRGB pixel. */
export function luminanceIndex(r: number, g: number, b: number): number {
  const y =
    0.2126729 * SRGB_TO_LINEAR_LUT[r]! + 0.7151522 * SRGB_TO_LINEAR_LUT[g]! + 0.072175 * SRGB_TO_LINEAR_LUT[b]!;
  return Math.min(LUMINANCE_LUT_SIZE - 1, Math.round(y * (LUMINANCE_LUT_SIZE - 1)));
}
