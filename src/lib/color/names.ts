import { ciede2000 } from './ciede2000';
import { hexToRgb, rgbToLab, type Lab } from './convert';

/** Hue families. Reds, greens, browns and oranges are the ones a red-green colourblind eye mixes up. */
export type ColorFamily = 'neutral' | 'blue' | 'purple' | 'red' | 'orange' | 'yellow' | 'brown' | 'green';

export interface NamedColor {
  name: string;
  hex: string;
  family: ColorFamily;
}

/**
 * A curated list of plain-language colour names: basic terms plus the artist
 * names printed on paint pans. Deliberately short so a match means something.
 */
export const COLOR_NAMES: readonly NamedColor[] = [
  { name: 'white (bare paper)', hex: '#f7f5ef', family: 'neutral' },
  { name: 'light grey', hex: '#cfcfcf', family: 'neutral' },
  { name: 'mid grey', hex: '#8c8c8c', family: 'neutral' },
  { name: 'dark grey', hex: '#4d4d4d', family: 'neutral' },
  { name: 'black (like ink)', hex: '#151515', family: 'neutral' },
  { name: 'warm grey', hex: '#9a9085', family: 'neutral' },
  { name: 'muted blue-grey', hex: '#7d8a99', family: 'blue' },
  { name: "dark blue-grey (like Payne's grey)", hex: '#46525f', family: 'blue' },
  { name: 'pale blue', hex: '#cfe2f1', family: 'blue' },
  { name: 'light sky blue', hex: '#8fbfe6', family: 'blue' },
  { name: 'clear mid blue (like cerulean)', hex: '#2a86c8', family: 'blue' },
  { name: 'deep blue (like ultramarine)', hex: '#2b3fa8', family: 'blue' },
  { name: 'dark navy blue', hex: '#1c2a52', family: 'blue' },
  { name: 'blue-green (teal)', hex: '#2a9d9d', family: 'blue' },
  { name: 'violet', hex: '#6a3fa0', family: 'purple' },
  { name: 'pale violet (lavender)', hex: '#b7a3d6', family: 'purple' },
  { name: 'magenta-pink', hex: '#b8317f', family: 'purple' },
  { name: 'muted purple-grey (mauve)', hex: '#8f6d80', family: 'purple' },
  { name: 'strong red (like cadmium red)', hex: '#c8242b', family: 'red' },
  { name: 'dark cool red (like alizarin crimson)', hex: '#8f1d2c', family: 'red' },
  { name: 'orange-red (like vermilion)', hex: '#e0492b', family: 'red' },
  { name: 'pink', hex: '#eea3b1', family: 'red' },
  { name: 'brick red-brown', hex: '#a2523c', family: 'brown' },
  { name: 'orange', hex: '#ee8425', family: 'orange' },
  { name: 'pale peach', hex: '#f3c29f', family: 'orange' },
  { name: 'bright cool yellow (like lemon)', hex: '#f3e04a', family: 'yellow' },
  { name: 'warm yellow (like cadmium yellow)', hex: '#f6c624', family: 'yellow' },
  { name: 'dull gold-yellow (like yellow ochre)', hex: '#c8983a', family: 'yellow' },
  { name: 'cream', hex: '#f1e3b8', family: 'yellow' },
  { name: 'golden brown (like raw sienna)', hex: '#b47b3a', family: 'brown' },
  { name: 'warm brown (like burnt sienna)', hex: '#8a4a2b', family: 'brown' },
  { name: 'dark brown (like burnt umber)', hex: '#55382a', family: 'brown' },
  { name: 'dull grey-brown (like raw umber)', hex: '#6e5a40', family: 'brown' },
  { name: 'tan', hex: '#c9ad8c', family: 'brown' },
  { name: 'very dark brown (sepia)', hex: '#3e2f25', family: 'brown' },
  { name: 'warm leaf green (like sap green)', hex: '#5a7d2a', family: 'green' },
  { name: 'cool blue-green (like viridian)', hex: '#1f7a60', family: 'green' },
  { name: 'bright green', hex: '#2aa04f', family: 'green' },
  { name: 'light yellow-green', hex: '#9acb5f', family: 'green' },
  { name: 'olive green', hex: '#777a35', family: 'green' },
  { name: 'dark forest green', hex: '#24492f', family: 'green' },
  { name: 'muted grey-green (sage)', hex: '#9fae93', family: 'green' },
  { name: 'pale green', hex: '#bfe3cf', family: 'green' },
];

const NAMED_LABS: readonly (NamedColor & { lab: Lab })[] = COLOR_NAMES.map((c) => ({
  ...c,
  lab: rgbToLab(hexToRgb(c.hex)),
}));

export interface ColorNameMatch {
  name: string;
  family: ColorFamily;
  hex: string;
  /** CIEDE2000 distance to the named colour; under about 10 is a confident match. */
  distance: number;
}

/** Nearest curated colour name by CIEDE2000. */
export function nearestColorName(lab: Lab): ColorNameMatch {
  let best = NAMED_LABS[0]!;
  let bestDistance = Infinity;
  for (const candidate of NAMED_LABS) {
    const d = ciede2000(lab, candidate.lab);
    if (d < bestDistance) {
      bestDistance = d;
      best = candidate;
    }
  }
  return { name: best.name, family: best.family, hex: best.hex, distance: bestDistance };
}

/** Families a red-green colourblind eye cannot reliably tell apart by hue. */
export function isConfusableFamily(family: ColorFamily): boolean {
  return family === 'red' || family === 'green' || family === 'brown' || family === 'orange';
}
