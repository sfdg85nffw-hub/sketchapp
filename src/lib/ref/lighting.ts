import { between, pickOne, type Random } from '../rng';
import { direction, toView, type Vec3 } from './vec';

export type LightingId =
  | 'rembrandt'
  | 'loop'
  | 'split'
  | 'butterfly'
  | 'rim'
  | 'under'
  | 'overcast'
  | 'two-light'
  | 'raking'
  | 'double-shadow';

/** Where a light sits, in degrees: azimuth 0 is in front of the subject, 90 to its side, 180 behind. */
export interface LightSpec {
  azimuth: number;
  elevation: number;
  intensity: number;
}

export interface LightingSetup {
  id: LightingId;
  name: string;
  /** What to look for when drawing under this light. */
  note: string;
  key: LightSpec;
  /** A second, weaker light, for rim and two-light setups. */
  second?: LightSpec;
  /** Ambient fill, 0 (black shadows) to 1 (no shadows). */
  fill: number;
  /** Soft-edged shadows, as from a big window or an overcast sky. */
  soft: boolean;
  /** False when the light has no single direction worth guessing. */
  directional: boolean;
  /** Background value, 0 black to 1 white, chosen to set the subject off. */
  background: number;
}

type Range = readonly [number, number];
interface Recipe extends Omit<LightingSetup, 'key' | 'second'> {
  azimuth: Range;
  elevation: Range;
  intensity: number;
  second?: { azimuth: Range; elevation: Range; intensity: number };
  /** Which subjects this recipe suits. */
  use: readonly LightingUse[];
}

export type LightingUse = 'portrait' | 'figure' | 'shapes';

/** The named lighting library shared by heads, the skull, the mannequin and the shapes. */
export const LIGHTING_RECIPES: readonly Recipe[] = [
  { id: 'rembrandt', name: 'Rembrandt', note: 'A small triangle of light on the shadow-side cheek.', azimuth: [38, 52], elevation: [35, 48], intensity: 3, fill: 0.1, soft: false, directional: true, background: 0.22, use: ['portrait', 'figure', 'shapes'] },
  { id: 'loop', name: 'Loop', note: 'The nose shadow makes a small loop that does not reach the cheek shadow.', azimuth: [22, 34], elevation: [28, 40], intensity: 3, fill: 0.16, soft: false, directional: true, background: 0.3, use: ['portrait', 'figure'] },
  { id: 'split', name: 'Split', note: 'Half the form lit, half in shadow. Find the terminator and commit to it.', azimuth: [84, 96], elevation: [5, 20], intensity: 3, fill: 0.07, soft: false, directional: true, background: 0.2, use: ['portrait', 'figure', 'shapes'] },
  { id: 'butterfly', name: 'Butterfly', note: 'Light from high in front: a butterfly shadow under the nose, dark under the chin.', azimuth: [-6, 6], elevation: [48, 62], intensity: 3, fill: 0.14, soft: false, directional: true, background: 0.3, use: ['portrait', 'figure'] },
  { id: 'rim', name: 'Rim light', note: 'Lit from behind. Most of the form is one dark shape with a bright edge.', azimuth: [140, 165], elevation: [20, 40], intensity: 3.4, second: { azimuth: [-20, 20], elevation: [10, 25], intensity: 0.35 }, fill: 0.08, soft: false, directional: true, background: 0.1, use: ['portrait', 'figure', 'shapes'] },
  { id: 'under', name: 'Underlighting', note: 'Light from below. Every shadow falls upwards; trust what you see, not what you know.', azimuth: [-25, 25], elevation: [-55, -35], intensity: 2.8, fill: 0.08, soft: false, directional: true, background: 0.12, use: ['portrait'] },
  { id: 'overcast', name: 'Overcast', note: 'Soft light from everywhere above. Values stay close: look for the darkest dark under things.', azimuth: [-30, 30], elevation: [65, 80], intensity: 1.5, fill: 0.5, soft: true, directional: false, background: 0.62, use: ['portrait', 'figure', 'shapes'] },
  { id: 'two-light', name: 'Two lights', note: 'A strong key and a weaker second light from the other side. Keep the second one quieter.', azimuth: [40, 60], elevation: [25, 40], intensity: 2.8, second: { azimuth: [-120, -90], elevation: [10, 30], intensity: 1.1 }, fill: 0.08, soft: false, directional: true, background: 0.2, use: ['portrait', 'figure'] },
  { id: 'raking', name: 'Low raking light', note: 'A low sun. Cast shadows run long across the ground: draw them first.', azimuth: [60, 120], elevation: [8, 16], intensity: 3.2, fill: 0.1, soft: false, directional: true, background: 0.34, use: ['shapes', 'figure'] },
  { id: 'double-shadow', name: 'Two lights, double shadows', note: 'Each object throws two cast shadows. Where they overlap is the darkest dark.', azimuth: [35, 60], elevation: [30, 45], intensity: 2.2, second: { azimuth: [-70, -40], elevation: [25, 45], intensity: 1.8 }, fill: 0.08, soft: false, directional: true, background: 0.3, use: ['shapes'] },
];

export function lightingFor(use: LightingUse): readonly Recipe[] {
  return LIGHTING_RECIPES.filter((r) => r.use.includes(use));
}

/**
 * One concrete lighting setup: a named recipe with its angles rolled, on a random side.
 * `directional` leaves out light that has no one direction to guess (overcast).
 */
export function sampleLighting(random: Random, use: LightingUse, only?: LightingId, directional = false): LightingSetup {
  const pool = lightingFor(use).filter((r) => !directional || r.directional);
  const recipe = (only && pool.find((r) => r.id === only)) || pickOne(random, pool);
  const side = random() < 0.5 ? -1 : 1;
  const roll = (range: Range) => between(random, range[0], range[1]);
  const { azimuth, elevation, intensity, second, use: _use, ...rest } = recipe;
  return {
    ...rest,
    key: { azimuth: side * roll(azimuth), elevation: roll(elevation), intensity },
    ...(second ? { second: { azimuth: side * roll(second.azimuth), elevation: roll(second.elevation), intensity: second.intensity } } : {}),
  };
}

/** Unit vector from the subject towards the light, in the subject's own frame. */
export function lightVector(spec: LightSpec): Vec3 {
  return direction(spec.azimuth, spec.elevation);
}

/**
 * Where the light comes from as it appears in the picture: degrees clockwise from
 * straight up, so 0 is above, 90 from the right, 180 from below, 270 from the left.
 */
export function screenLightAngle(worldLight: Vec3, cameraAzimuth: number, cameraElevation: number): number {
  const [right, up] = toView(worldLight, cameraAzimuth, cameraElevation);
  return ((Math.atan2(right, up) * 180) / Math.PI + 360) % 360;
}

/** Smallest angle between a guess and the truth, 0 to 180 degrees. */
export function angleError(guess: number, actual: number): number {
  const d = Math.abs(guess - actual) % 360;
  return d > 180 ? 360 - d : d;
}

/** The dial has eight positions; this is the best possible answer on it. */
export function nearestDialDirection(angle: number): number {
  return (Math.round(angle / 45) * 45 + 360) % 360;
}

/** Within half a dial step counts as right; within one and a half as close. */
export function gradeGuess(error: number): 'right' | 'close' | 'off' {
  if (error <= 22.5) return 'right';
  return error <= 67.5 ? 'close' : 'off';
}

export interface LightGuess {
  date: string;
  error: number;
}

export interface GuessSummary {
  count: number;
  /** Mean error over the latest ten guesses, in degrees. */
  recent: number | null;
  /** Mean error over the ten before those, for a trend. */
  earlier: number | null;
}

export function summariseGuesses(guesses: readonly LightGuess[]): GuessSummary {
  const mean = (list: readonly LightGuess[]) => (list.length ? list.reduce((s, g) => s + g.error, 0) / list.length : null);
  return { count: guesses.length, recent: mean(guesses.slice(-10)), earlier: guesses.length >= 20 ? mean(guesses.slice(-20, -10)) : null };
}
