import { ciede2000 } from './ciede2000';
import { rgbToLab, type Lab, type RGB } from './convert';
import { dilute, mixPaints } from './mix';

export interface MatchPaint {
  id: string;
  name: string;
  rgb: RGB;
  inLimited: boolean;
}

export interface PaintMatch {
  /** One paint id, or two for a mix. */
  paintIds: string[];
  label: string;
  /** How much water: 'full strength', 'thinned', or 'a pale wash'. */
  dilution: string;
  rgb: RGB;
  distance: number;
}

const DILUTIONS: readonly { strength: number; label: string }[] = [
  { strength: 1, label: 'full strength' },
  { strength: 0.55, label: 'thinned with water' },
  { strength: 0.2, label: 'a pale wash' },
];

interface Candidate {
  paintIds: string[];
  label: string;
  rgb: RGB;
}

/**
 * The closest of his labelled paints, or a two-paint mix from the limited palette,
 * at three dilutions. Matching is by CIEDE2000 against a rough wash model, so it
 * is a starting suggestion, not a recipe.
 */
export function closestPaintOrMix(target: Lab, paints: readonly MatchPaint[]): PaintMatch | null {
  const candidates: Candidate[] = paints.map((p) => ({ paintIds: [p.id], label: p.name, rgb: p.rgb }));
  const limited = paints.filter((p) => p.inLimited);
  for (let i = 0; i < limited.length; i++) {
    for (let j = i + 1; j < limited.length; j++) {
      const a = limited[i]!;
      const b = limited[j]!;
      candidates.push({ paintIds: [a.id, b.id], label: `${a.name} + ${b.name}`, rgb: mixPaints(a.rgb, b.rgb) });
    }
  }
  let best: PaintMatch | null = null;
  for (const c of candidates) {
    for (const d of DILUTIONS) {
      const rgb = dilute(c.rgb, d.strength);
      const distance = ciede2000(target, rgbToLab(rgb));
      if (!best || distance < best.distance) {
        best = { paintIds: c.paintIds, label: c.label, dilution: d.label, rgb, distance };
      }
    }
  }
  return best;
}
