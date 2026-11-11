import { ciede2000 } from './ciede2000';
import { rgbToLab, type Lab, type RGB } from './convert';
import { simulateCvd, type CvdType } from './cvd';

export interface PaintLike {
  id: string;
  name: string;
  rgb: RGB;
}

export interface ConfusablePair {
  a: string;
  b: string;
  /** Hue-and-chroma difference for typical colour vision. */
  normalDifference: number;
  /** The smaller hue-and-chroma difference under simulated protanopia / deuteranopia. */
  simulatedDifference: number;
  worstFor: CvdType;
  /** True when the two paints are near-identical for everyone, not just for him. */
  similarForEveryone: boolean;
}

/** Simulated difference at or below this reads as "the same paint" at a glance. */
export const CONFUSION_THRESHOLD = 10;
/** The pair must be clearly different to typical vision for the warning to be about colourblindness. */
export const DISTINCT_THRESHOLD = 20;

/** How much of the lightness difference still counts: water changes value, but not without limit. */
export const LIGHTNESS_WEIGHT = 0.5;

/**
 * Difference that mostly ignores value: the lightness gap is halved before comparing.
 * With watercolour, value is set largely by how much water is in the brush, so two
 * pans that differ mainly in value are still easy to mix up once they are on paper.
 */
export function chromaticDifference(a: Lab, b: Lab): number {
  const mid = (a[0] + b[0]) / 2;
  const half = ((a[0] - b[0]) / 2) * LIGHTNESS_WEIGHT;
  return ciede2000([mid + half, a[1], a[2]], [mid - half, b[1], b[2]]);
}

function simulatedDifference(a: RGB, b: RGB, type: CvdType): number {
  return chromaticDifference(rgbToLab(simulateCvd(a, type)), rgbToLab(simulateCvd(b, type)));
}

/** Pairs of paints a red-green colourblind painter is likely to confuse, most confusable first. */
export function findConfusablePairs(paints: readonly PaintLike[]): ConfusablePair[] {
  const pairs: ConfusablePair[] = [];
  for (let i = 0; i < paints.length; i++) {
    for (let j = i + 1; j < paints.length; j++) {
      const p = paints[i]!;
      const q = paints[j]!;
      const normal = chromaticDifference(rgbToLab(p.rgb), rgbToLab(q.rgb));
      const deutan = simulatedDifference(p.rgb, q.rgb, 'deuteranopia');
      const protan = simulatedDifference(p.rgb, q.rgb, 'protanopia');
      const simulated = Math.min(deutan, protan);
      if (simulated > CONFUSION_THRESHOLD) continue;
      const similarForEveryone = normal < DISTINCT_THRESHOLD;
      pairs.push({
        a: p.id,
        b: q.id,
        normalDifference: normal,
        simulatedDifference: simulated,
        worstFor: deutan <= protan ? 'deuteranopia' : 'protanopia',
        similarForEveryone,
      });
    }
  }
  return pairs.sort(
    (x, y) => y.normalDifference - y.simulatedDifference - (x.normalDifference - x.simulatedDifference),
  );
}
