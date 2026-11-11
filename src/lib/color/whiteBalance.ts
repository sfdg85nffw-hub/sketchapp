import { linearToRgb, rgbToLinear, type RGB } from './convert';

/** Per-channel multipliers applied in linear light. */
export type Gains = readonly [number, number, number];

export const NO_GAINS: Gains = [1, 1, 1];

const MIN_REFERENCE = 0.02;
const MAX_GAIN = 8;

/**
 * Gains that turn a sampled patch of white paper into reference white.
 * A von Kries style correction in linear sRGB: each channel is scaled so the
 * paper reads as neutral and as value 1 ("white paper is the light").
 * A reference too dark to be paper is rejected (returns NO_GAINS).
 */
export function gainsFromWhiteReference(paper: RGB): Gains {
  const lin = rgbToLinear(paper);
  if (Math.max(...lin) < MIN_REFERENCE * 4) return NO_GAINS;
  return [
    Math.min(MAX_GAIN, 1 / Math.max(MIN_REFERENCE, lin[0])),
    Math.min(MAX_GAIN, 1 / Math.max(MIN_REFERENCE, lin[1])),
    Math.min(MAX_GAIN, 1 / Math.max(MIN_REFERENCE, lin[2])),
  ];
}

/** Apply gains to linear RGB, clamped to 0-1. */
export function applyGainsLinear(lin: RGB, gains: Gains): RGB {
  return [Math.min(1, lin[0] * gains[0]), Math.min(1, lin[1] * gains[1]), Math.min(1, lin[2] * gains[2])];
}

/** Apply gains to an 8-bit sRGB colour. */
export function applyGains(rgb: RGB, gains: Gains): RGB {
  return linearToRgb(applyGainsLinear(rgbToLinear(rgb), gains));
}
