import type { Paint } from '../lib/types';

/**
 * Placeholder pans for a 12-pan student set. The colours and names are educated
 * guesses: he replaces each name with the one printed on his pan, and samples
 * the real colour from a photo of his swatch chart.
 */
export const DEFAULT_PAINTS: readonly Paint[] = [
  { id: 'pan-01', slot: 1, name: 'Yellow', rgb: [243, 212, 49], sampled: false, placeholder: true, inLimited: false },
  { id: 'pan-02', slot: 2, name: 'Yellow Ochre', rgb: [196, 148, 58], sampled: false, placeholder: true, inLimited: true },
  { id: 'pan-03', slot: 3, name: 'Orange', rgb: [232, 124, 38], sampled: false, placeholder: true, inLimited: false },
  { id: 'pan-04', slot: 4, name: 'Vermilion', rgb: [214, 62, 42], sampled: false, placeholder: true, inLimited: false },
  { id: 'pan-05', slot: 5, name: 'Carmine', rgb: [168, 34, 62], sampled: false, placeholder: true, inLimited: false },
  { id: 'pan-06', slot: 6, name: 'Violet', rgb: [104, 62, 150], sampled: false, placeholder: true, inLimited: false },
  { id: 'pan-07', slot: 7, name: 'Ultramarine', rgb: [44, 62, 160], sampled: false, placeholder: true, inLimited: true },
  { id: 'pan-08', slot: 8, name: 'Light Blue', rgb: [48, 136, 196], sampled: false, placeholder: true, inLimited: false },
  { id: 'pan-09', slot: 9, name: 'Emerald Green', rgb: [30, 128, 96], sampled: false, placeholder: true, inLimited: false },
  { id: 'pan-10', slot: 10, name: 'Leaf Green', rgb: [104, 150, 52], sampled: false, placeholder: true, inLimited: false },
  { id: 'pan-11', slot: 11, name: 'Burnt Sienna', rgb: [140, 76, 44], sampled: false, placeholder: true, inLimited: true },
  { id: 'pan-12', slot: 12, name: 'Black', rgb: [34, 32, 32], sampled: false, placeholder: true, inLimited: false },
];

export interface Recipe {
  id: string;
  /** Which roles from the limited palette go in: indexes into [blue, brown, yellow]. */
  parts: readonly ('blue' | 'brown' | 'yellow')[];
  title: string;
  uses: readonly string[];
  how: string;
}

/** Recipes for the three-paint palette, written as jobs to do rather than colours to name. */
export const RECIPES: readonly Recipe[] = [
  {
    id: 'grey',
    parts: ['blue', 'brown'],
    title: 'Blue + brown = grey',
    uses: ['subway shadows', 'steel rails and poles', 'pavement', 'tunnel walls', 'overcast sky'],
    how: 'Roughly equal parts. More blue pushes it cool (shadow, metal); more brown pushes it warm (old concrete, wood in shade). Thick, it is your near-black.',
  },
  {
    id: 'warm-stone',
    parts: ['brown', 'yellow'],
    title: 'Brown + yellow = warm stone',
    uses: ['brick', 'brownstone', 'bench wood', 'sunlit sidewalks', 'cardboard and paper bags'],
    how: 'Mostly yellow with a little brown for sunlit stone. Mostly brown for brick. Thin it a long way for skin in light.',
  },
  {
    id: 'muted-green',
    parts: ['blue', 'yellow'],
    title: 'Blue + yellow = muted green',
    uses: ['street trees', 'park grass', 'subway tile trim', 'weathered copper'],
    how: 'Start with yellow, add blue a touch at a time. Label the mix on your chart: you will not be able to judge it by eye, and you do not need to.',
  },
  {
    id: 'blue-alone',
    parts: ['blue'],
    title: 'Blue alone',
    uses: ['sky', 'cast shadows on snow or white walls', 'window glass', 'distance'],
    how: 'Thin for sky, graded lighter towards the horizon. Blue is reliable for you: when unsure, cool things go blue.',
  },
  {
    id: 'brown-alone',
    parts: ['brown'],
    title: 'Brown alone',
    uses: ['coffee', 'wooden seats', 'leather', 'warm lamplight on walls (thin)'],
    how: 'Full strength for coffee and dark wood. A pale wash reads as warm light.',
  },
  {
    id: 'yellow-alone',
    parts: ['yellow'],
    title: 'Yellow alone',
    uses: ['lit windows at night', 'lamp glow', 'taxi yellow', 'sunlit edges'],
    how: 'Yellow is your other reliable hue. Use it thin and sparingly as the one warm light in a cool, grey scene.',
  },
];
