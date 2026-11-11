export interface MaterialNote {
  id: string;
  title: string;
  summary: string;
  points: readonly string[];
}

export const MATERIAL_NOTES: readonly MaterialNote[] = [
  {
    id: 'waterproof-ink',
    title: 'Ink that survives a wash',
    summary: 'Paint is lifting your lines because the ink is dye-based.',
    points: [
      'Standard Sailor cartridges are dye ink. Water reactivates them and they bleed into the paint.',
      'Use a pigment ink: Sailor Kiwa-guro or Platinum Carbon Black. Both are waterproof once dry.',
      'Let the ink dry fully before any water touches it. On a humid day give it a few minutes, not seconds.',
      'Pigment ink can clog a pen left unused. Write with it weekly and flush the pen when you change inks.',
    ],
  },
  {
    id: 'paper',
    title: 'Paper for washes',
    summary: 'Buckling, blooms and puddles are the paper, not you.',
    points: [
      'Regular sketchbook paper is too thin and too sized for water. It buckles, pools and dries with blooms.',
      'For washes use 100% cotton paper around 300 gsm. The watercolor sketchbook, not the Moleskine.',
      'Keep the Moleskine for ink. A light, nearly dry tint is the most it will take.',
    ],
  },
  {
    id: 'water-brush',
    title: 'When to squeeze the water brush',
    summary: 'The barrel is a tap. Open it on purpose.',
    points: [
      'Squeeze when: waking up dry pigment in the pan, blending an edge, laying a big wash, thinning a color, and cleaning between colors (squeeze and wipe on a tissue until it runs clear).',
      'Do not squeeze for: fine detail, dry-brush texture, or a crisp edge. Let the tip run a little dry for those.',
      'If a stroke floods, touch the tip to a tissue and lift the puddle back up.',
    ],
  },
  {
    id: 'fude-angle',
    title: 'Fude nib angle',
    summary: 'One pen, two voices. The angle picks which.',
    points: [
      'Steeper, pen more upright: the bent tip lays flat on the paper and gives the bold stroke.',
      'Flatter, pen lowered towards the page: only the point touches and you get the fine stroke.',
      'Bold for near edges, shadow sides and the focal point. Fine for far edges and detail.',
      'Flip the nib over for the thinnest line it can make.',
    ],
  },
  {
    id: 'color-order',
    title: 'Which color first',
    summary: 'Never ask "what color is this?" Ask two questions you can answer.',
    points: [
      'Warm or cool? Light or dark? Those two answers pick the paint. The See tab will answer them for any point you tap.',
      'Three pans cover most scenes: ultramarine (blue), burnt sienna (brown), yellow ochre (yellow).',
      'Start with the biggest, lightest shape. Work towards the darks. White paper is the light, so leave it.',
      'Label every pan. A label you can read beats a color you have to guess.',
    ],
  },
  {
    id: 'two-pass',
    title: 'Two passes make a form round',
    summary: 'Roundness is two values and one soft edge.',
    points: [
      'Pass 1: a light wash over the whole form, leaving white paper where it faces the light. Let it dry completely.',
      'Pass 2: the same color only on the side turning away from the light.',
      'Then soften one edge of that second pass with a clean, damp brush, on the side nearest the light.',
    ],
  },
];
