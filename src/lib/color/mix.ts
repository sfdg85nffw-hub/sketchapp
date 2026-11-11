import { linearToRgb, rgbToLinear, type RGB } from './convert';

/** Paper white the paint is diluted towards. */
export const PAPER_WHITE: RGB = [250, 247, 240];

/** Pigment strength for each step of a value strip, full strength down to nearly water. */
export const DILUTION_STEPS = [1, 0.7, 0.45, 0.25, 0.1] as const;

/**
 * Approximate a watercolour wash: the more water, the more paper shows through.
 * `strength` 1 is paint straight from the pan, 0 is clean water.
 * Modelled as transmittance raised to the pigment strength (Beer-Lambert), over paper white.
 */
export function dilute(rgb: RGB, strength: number, paper: RGB = PAPER_WHITE): RGB {
  const s = Math.min(1, Math.max(0, strength));
  const paint = rgbToLinear(rgb);
  const base = rgbToLinear(paper);
  const mix = (p: number, w: number) => w * Math.max(0.002, p / Math.max(w, 0.002)) ** s;
  return linearToRgb([mix(paint[0], base[0]), mix(paint[1], base[1]), mix(paint[2], base[2])]);
}

/**
 * Approximate a subtractive two-paint mix: weighted geometric mean in linear light.
 * Good enough to show that blue plus brown lands on grey; not a pigment model.
 */
export function mixPaints(a: RGB, b: RGB, ratioOfA = 0.5): RGB {
  const t = Math.min(1, Math.max(0, ratioOfA));
  const la = rgbToLinear(a);
  const lb = rgbToLinear(b);
  const blend = (x: number, y: number) => Math.max(0.002, x) ** t * Math.max(0.002, y) ** (1 - t);
  return linearToRgb([blend(la[0], lb[0]), blend(la[1], lb[1]), blend(la[2], lb[2])]);
}
