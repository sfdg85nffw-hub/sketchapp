import type { WeaknessId } from '../lib/types';

export interface ProjectStageDef {
  key: string;
  label: string;
  hint: string;
}

/** Every project moves through the same five stages. */
export const PROJECT_STAGES: readonly ProjectStageDef[] = [
  { key: 'thumbnails', label: 'Thumbnails', hint: 'Three small compositions. Choose the one that serves the feeling word.' },
  { key: 'value-plan', label: 'Value plan', hint: 'A notan or three-value plan of the chosen thumbnail. Decide the big dark now.' },
  { key: 'on-location', label: 'On location', hint: 'Draw it there. Line and the main shadow shapes. Leave the big blacks outlined.' },
  { key: 'darks', label: 'Darks at home', hint: 'Fill the blacks and finish the hatching at a table, where you can commit.' },
  { key: 'reflection', label: 'Reflection', hint: 'Capture the finished spread and do the reflection. Did it serve the word?' },
];

export interface ProjectTemplate {
  id: string;
  title: string;
  brief: string;
  feeling: string;
  weaknessIds: readonly WeaknessId[];
  targets: readonly string[];
  notes: readonly string[];
}

export const PROJECT_TEMPLATES: readonly ProjectTemplate[] = [
  {
    id: 'from-my-seat',
    title: 'From my seat',
    brief:
      'A first-person subway spread. Your own knees, hands and coffee in the foreground, strangers across from you, the car bending away in a deliberate fisheye, tunnel windows solid black.',
    feeling: 'together but alone',
    weaknessIds: ['figures', 'true-darks', 'line-weight'],
    targets: ['Gesture and figures', 'A big jump in depth', 'Large dark areas'],
    notes: [
      'Your knees and cup get the bold stroke. The strangers get the fine one.',
      'Bend the floor and ceiling lines on purpose. A fisheye is a point of view, not a mistake.',
      'The windows are the biggest black on the spread. Outline them on the train, fill them at home.',
    ],
  },
  {
    id: 'one-commute',
    title: 'One commute in panels',
    brief:
      'Six to nine framed panels across a spread: alarm, coffee, the 135th St stairs, platform, train, arrival. Each panel is about one thing.',
    feeling: 'rhythm and repetition',
    weaknessIds: ['intent', 'background', 'line-weight'],
    targets: ['Varied cropping', 'Deciding what each panel is about', 'Handwritten text as design'],
    notes: [
      'Rule the panels first. Vary them: one wide, one tall, one tiny.',
      'Before each panel, say what it is about in three words. Draw only that.',
      'Write the time under each panel in your own hand. The lettering is part of the drawing.',
    ],
  },
  {
    id: 'mostly-black',
    title: 'A night scene that is mostly black',
    brief:
      'The 135th St entrance, or your block after dark. Dense hatching and solid black everywhere, with white paper only where light actually is: lamp globes, lit windows, signs.',
    feeling: 'quiet',
    weaknessIds: ['true-darks', 'highlights', 'cast-shadows'],
    targets: ['Committing to blacks', 'Treating paper as light'],
    notes: [
      'Mark the lights first with a faint outline, and protect them. Everything else may go dark.',
      'Aim for more than half the page black. If it feels like too much, it is nearly enough.',
      'Check it in the 2-value map. The lights should be the only white shapes.',
    ],
  },
  {
    id: 'through-your-stuff',
    title: 'Self-portrait through your stuff',
    brief:
      'A still life of your real objects: the fude pen, the Moleskine, the paint set, coffee, keys, MetroCard. Handwritten notes around them, including a word about being colorblind.',
    feeling: 'home',
    weaknessIds: ['ellipses', 'cast-shadows', 'intent'],
    targets: ['Intentional still-life composition', 'Text and image working together'],
    notes: [
      'Arrange the objects on purpose. Overlap at least two. Decide which one is the subject.',
      'Every object gets a cast shadow, all falling the same way. The cup gets a shaded inside.',
      'Label the paint pans the way you actually know them: by name and by value, not by hue.',
    ],
  },
];

export function templateById(id: string | undefined): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.id === id);
}
