import type { SubjectId, WeaknessId } from '../lib/types';

export interface Weakness {
  id: WeaknessId;
  /** The problem, named as it shows up on the page. */
  title: string;
  /** The skill, named as the thing to get good at. */
  skill: string;
  symptom: string;
  fix: string;
  prompts: readonly string[];
  /** Subjects where the reflection prompt makes sense; empty means all. */
  subjects: readonly SubjectId[];
}

/** The ten recurring weaknesses from the sketchbook critique. Order is the critique's order. */
export const WEAKNESSES: readonly Weakness[] = [
  {
    id: 'cast-shadows',
    title: 'Missing cast shadows',
    skill: 'Cast shadows',
    symptom: 'Objects float. The park bench has nothing under it, so it hovers.',
    fix: 'Decide where the light is, then put the cast shadow down first. The object sits when its shadow does.',
    prompts: [
      'Where is the cast shadow? Does the main object sit on the ground?',
      'Could a stranger point to the light source using only your shadows?',
    ],
    subjects: ['urban', 'interior', 'still-life', 'study', 'watercolor'],
  },
  {
    id: 'light-planes',
    title: 'Equal hatching on light and shadow planes',
    skill: 'Clean light planes',
    symptom: 'Lit sides and shadow sides carry the same amount of hatching, so the form goes flat.',
    fix: 'Leave the light planes nearly bare. Put the hatching budget into the shadow side and the cast shadow.',
    prompts: [
      'Are your light planes cleaner than your shadow planes?',
      'Squint at it. Do the lit sides and the shadow sides separate into two clear groups?',
    ],
    subjects: [],
  },
  {
    id: 'foliage',
    title: 'Uniform scribble foliage',
    skill: 'Foliage density',
    symptom: 'Trees are one even scribble from edge to edge, with no lit side.',
    fix: 'Dense and dark on the shadow side, open and broken where the sun hits. Leave paper in the lit half.',
    prompts: [
      'Is the foliage dense and dark on the shadow side, open and light where the sun hits?',
      'Do the trees have a lit side, or one even texture all over?',
    ],
    subjects: ['urban', 'watercolor', 'study'],
  },
  {
    id: 'line-weight',
    title: 'Uniform line weight',
    skill: 'Line weight',
    symptom: 'Every edge gets the same line, near or far, important or not.',
    fix: 'Bold stroke for near edges, shadow sides and the focal point. Fine stroke for far edges and detail.',
    prompts: [
      "Where did you use the fude's bold stroke? Is it only on the focal point and near edges?",
      'Do the far edges get the fine stroke, or is everything drawn at one volume?',
    ],
    subjects: [],
  },
  {
    id: 'true-darks',
    title: 'Not committing to true darks',
    skill: 'True darks',
    symptom: 'The darkest areas stop at mid-grey. No large shape is allowed to go black.',
    fix: 'Pick the darkest shape before you start and fill it solid. One real black makes the lights look lit.',
    prompts: [
      "What's the darkest dark? Is it truly black?",
      'Is there one large area you let go fully dark, or did you stop at grey?',
    ],
    subjects: [],
  },
  {
    id: 'background',
    title: 'Background over-detailed',
    skill: 'Quiet backgrounds',
    symptom: 'Far buildings and back walls get as much detail and contrast as the subject.',
    fix: 'Keep the background lighter and simpler than the focal point: fewer lines, fine stroke, closer values.',
    prompts: [
      'Is the background lighter and simpler than the focal point?',
      'If you covered the focal point with a thumb, would the background still be competing for attention?',
    ],
    subjects: ['urban', 'interior', 'still-life', 'portrait', 'watercolor'],
  },
  {
    id: 'highlights',
    title: 'Inconsistent highlights',
    skill: 'Consistent highlights',
    symptom: 'Highlights on rails and cylinders wander, so the light seems to come from everywhere.',
    fix: 'One stripe of bare paper, on the side facing the light, the whole length. Crisp edges on metal, soft on fabric.',
    prompts: [
      'On rails and cylinders, do the highlights sit in one consistent stripe facing the light?',
      'Are the highlight edges crisp on metal and soft on fabric?',
    ],
    subjects: ['urban', 'interior', 'still-life', 'study', 'watercolor'],
  },
  {
    id: 'ellipses',
    title: 'Hollow ellipses',
    skill: 'Shaded openings',
    symptom: 'The open end of a cup is an empty oval, so it reads as a lid rather than a hole.',
    fix: 'Shade the inside of the opening, darkest just below the near rim, fading towards the far wall.',
    prompts: [
      'Is the inside of each cup or cylinder shaded, darkest just below the near rim?',
      'Do the open ends read as openings with depth, or as flat ovals?',
    ],
    subjects: ['interior', 'still-life', 'study'],
  },
  {
    id: 'figures',
    title: 'Weak figures and gesture',
    skill: 'Figures and gesture',
    symptom: 'People are mostly missing. When they appear they are stiff or wobbly.',
    fix: 'One line of action first, then weight: which leg, which hip. Thirty seconds, many times, beats one careful figure.',
    prompts: [
      'Is there a person in it? Does the figure have one clear line of action?',
      "Did you draw the figure's weight, which leg and which hip, or just its outline?",
    ],
    subjects: ['urban', 'interior', 'portrait', 'gesture'],
  },
  {
    id: 'intent',
    title: 'No emotional intent',
    skill: 'Point of view',
    symptom: 'Accurate, but nobody is home. No chosen feeling, no point of view.',
    fix: 'Choose one feeling word before the first line. Let it decide the crop, the darks and what gets left out.',
    prompts: [
      'Did you pick a feeling word? Does the drawing serve it?',
      'What would a stranger say this drawing is about, in one word? Is it your word?',
    ],
    subjects: [],
  },
];

export const WEAKNESS_IDS: readonly WeaknessId[] = WEAKNESSES.map((w) => w.id);

export function weaknessById(id: WeaknessId): Weakness {
  return WEAKNESSES.find((w) => w.id === id) ?? WEAKNESSES[0]!;
}
