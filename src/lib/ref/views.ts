import { between, pickOne, type Random } from '../rng';

/** An artist-useful way to turn a head. Angles in degrees. */
export interface HeadView {
  id: 'front' | 'three-quarter' | 'profile' | 'up' | 'down' | 'tilted';
  label: string;
  /** Turn left or right. */
  yaw: number;
  /** Chin up (negative) or down (positive). */
  pitch: number;
  /** Ear towards shoulder. */
  roll: number;
}

const RANGES: readonly { id: HeadView['id']; label: string; yaw: [number, number]; pitch: [number, number]; roll: [number, number] }[] = [
  { id: 'front', label: 'front view', yaw: [0, 8], pitch: [-4, 4], roll: [0, 2] },
  { id: 'three-quarter', label: 'three-quarter view', yaw: [30, 50], pitch: [-6, 8], roll: [0, 4] },
  { id: 'three-quarter', label: 'three-quarter view', yaw: [30, 50], pitch: [-6, 8], roll: [0, 4] },
  { id: 'profile', label: 'profile', yaw: [82, 96], pitch: [-4, 6], roll: [0, 3] },
  { id: 'up', label: 'looking up', yaw: [0, 40], pitch: [-30, -16], roll: [0, 5] },
  { id: 'down', label: 'looking down', yaw: [0, 40], pitch: [16, 30], roll: [0, 5] },
  { id: 'tilted', label: 'head tilted', yaw: [10, 45], pitch: [-8, 10], roll: [10, 20] },
];

export function sampleHeadView(random: Random): HeadView {
  const r = pickOne(random, RANGES);
  const side = random() < 0.5 ? -1 : 1;
  const tilt = random() < 0.5 ? -1 : 1;
  return {
    id: r.id,
    label: r.label,
    yaw: side * between(random, r.yaw[0], r.yaw[1]),
    pitch: between(random, r.pitch[0], r.pitch[1]),
    roll: tilt * between(random, r.roll[0], r.roll[1]),
  };
}

/** Portrait lenses only: 50 to 85mm equivalent. */
export function samplePortraitFocal(random: Random): number {
  return Math.round(between(random, 50, 85));
}

/** Vertical field of view in degrees for a 35mm-equivalent focal length (24mm sensor height, portrait framing uses the long side). */
export function fieldOfView(focal: number, sensor = 36): number {
  return (2 * Math.atan(sensor / (2 * focal)) * 180) / Math.PI;
}

const MIRROR_TURNS = ['face the camera square on', 'turn three-quarter left', 'turn three-quarter right', 'turn to profile looking left', 'turn to profile looking right'] as const;
const MIRROR_CHINS = ['chin level', 'chin down', 'chin up a little', 'head tilted to one shoulder'] as const;
const MIRROR_LIGHTS = ['light from the window side', 'light from directly above', 'light from behind you', 'hold the phone low and look down at it', 'cover one side of the lamp so half the face is dark'] as const;

/** A pose prompt for self-portrait practice: "turn three-quarter left, chin down, light from the window side". */
export function mirrorPrompt(random: Random): string {
  return `${pickOne(random, MIRROR_TURNS)}, ${pickOne(random, MIRROR_CHINS)}, ${pickOne(random, MIRROR_LIGHTS)}`;
}

/** One-line reminders shown before a pose when gesture guidance is on. They rotate in order. */
export const GESTURE_REMINDERS: readonly string[] = ['Line of action first.', 'Shoulders vs. hips tilt.', 'Weight-bearing leg.', 'Big shapes before details.'];

export function gestureReminder(index: number): string {
  return GESTURE_REMINDERS[((index % GESTURE_REMINDERS.length) + GESTURE_REMINDERS.length) % GESTURE_REMINDERS.length]!;
}
