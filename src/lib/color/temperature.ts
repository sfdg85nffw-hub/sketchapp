import { chromaHue, type Lab } from './convert';

export type Temperature = 'warm' | 'cool' | 'neutral';

/** Below this chroma a colour is a grey for practical purposes: no temperature to speak of. */
export const NEUTRAL_CHROMA = 7;
/** Hue angles (CIELAB h, degrees) where warm hands over to cool, and the half-width of the undecided band. */
export const WARM_TO_COOL_HUE = 125; // yellow-green
export const COOL_TO_WARM_HUE = 320; // violet-magenta
export const BOUNDARY_HALF_WIDTH = 8;

function angularDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Warm or cool, decided by CIELAB hue angle.
 * Warm: magenta-reds through oranges and yellows (320 to 125 degrees through 0).
 * Cool: greens through blues and violets (125 to 320 degrees).
 * Neutral: low chroma, or within a narrow band around either boundary.
 */
export function classifyTemperature(lab: Lab): Temperature {
  const { chroma, hue } = chromaHue(lab);
  if (chroma < NEUTRAL_CHROMA) return 'neutral';
  if (
    angularDistance(hue, WARM_TO_COOL_HUE) <= BOUNDARY_HALF_WIDTH ||
    angularDistance(hue, COOL_TO_WARM_HUE) <= BOUNDARY_HALF_WIDTH
  ) {
    return 'neutral';
  }
  return hue > WARM_TO_COOL_HUE && hue < COOL_TO_WARM_HUE ? 'cool' : 'warm';
}
