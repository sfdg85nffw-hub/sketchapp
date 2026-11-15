import { between, pickOne, pickWeighted, type Random } from '../rng';
import type { CameraSpec } from './scene';
import { add, length, quatAngle, quatMultiply, rotate, sub, type Quat, type Vec3 } from './vec';

/** The skeleton shared by every bundled clip: joint names in parent-before-child order. */
export interface Skeleton {
  bones: readonly string[];
  parents: readonly number[];
}

export interface ClipMeta {
  /** CMU subject_trial id, e.g. "05_17". */
  id: string;
  description: string;
  frames: number;
  /** Rest offset of each joint from its parent. */
  offsets: readonly Vec3[];
  tips: Readonly<Record<string, Vec3>>;
  byteOffset: number;
}

export interface MocapIndex extends Skeleton {
  fps: number;
  clips: readonly ClipMeta[];
}

/** One sampled pose as stored: the hip position and a local rotation per joint. */
export interface Frame {
  root: Vec3;
  rotations: readonly Quat[];
}

/** A pose in world space. */
export interface Pose {
  positions: Vec3[];
  rotations: Quat[];
}

/** Bytes one frame takes in clips.bin: three float32 for the hips, four int16 per joint. */
export function clipByteLength(frames: number, boneCount: number): number {
  return frames * 12 + frames * boneCount * 8;
}

/** Read one frame of one clip out of the packed pose file. */
export function readFrame(data: ArrayBuffer, clip: ClipMeta, boneCount: number, frame: number): Frame {
  const f = Math.min(clip.frames - 1, Math.max(0, frame));
  const roots = new Float32Array(data, clip.byteOffset, clip.frames * 3);
  const quats = new Int16Array(data, clip.byteOffset + clip.frames * 12, clip.frames * boneCount * 4);
  const rotations: Quat[] = [];
  for (let b = 0; b < boneCount; b++) {
    const i = (f * boneCount + b) * 4;
    rotations.push([quats[i]! / 32767, quats[i + 1]! / 32767, quats[i + 2]! / 32767, quats[i + 3]! / 32767]);
  }
  return { root: [roots[f * 3]!, roots[f * 3 + 1]!, roots[f * 3 + 2]!], rotations };
}

/** Forward kinematics: local joint rotations to world positions and orientations. */
export function forwardKinematics(skeleton: Skeleton, offsets: readonly Vec3[], frame: Frame): Pose {
  const positions: Vec3[] = [];
  const rotations: Quat[] = [];
  for (let b = 0; b < skeleton.bones.length; b++) {
    const parent = skeleton.parents[b]!;
    if (parent < 0) {
      positions.push(frame.root);
      rotations.push(frame.rotations[b]!);
    } else {
      positions.push(add(positions[parent]!, rotate(offsets[b]!, rotations[parent]!)));
      rotations.push(quatMultiply(rotations[parent]!, frame.rotations[b]!));
    }
  }
  return { positions, rotations };
}

export function boneIndex(skeleton: Skeleton, name: string): number {
  return skeleton.bones.indexOf(name);
}

/** Rough share of body mass carried at each joint, for a centre of mass good enough to judge balance. */
const MASS: Readonly<Record<string, number>> = {
  Hips: 0.16,
  LowerBack: 0.12,
  Spine: 0.12,
  Spine1: 0.14,
  Head: 0.08,
  LeftUpLeg: 0.05,
  RightUpLeg: 0.05,
  LeftLeg: 0.07,
  RightLeg: 0.07,
  LeftFoot: 0.02,
  RightFoot: 0.02,
  LeftArm: 0.025,
  RightArm: 0.025,
  LeftForeArm: 0.02,
  RightForeArm: 0.02,
  LeftHand: 0.005,
  RightHand: 0.005,
};

export function centerOfMass(skeleton: Skeleton, pose: Pose): Vec3 {
  let total = 0;
  let sum: Vec3 = [0, 0, 0];
  skeleton.bones.forEach((name, b) => {
    const m = MASS[name] ?? 0;
    total += m;
    sum = add(sum, [pose.positions[b]![0] * m, pose.positions[b]![1] * m, pose.positions[b]![2] * m]);
  });
  return total === 0 ? [0, 0, 0] : [sum[0] / total, sum[1] / total, sum[2] / total];
}

/** A foot this close to the floor is carrying weight. */
export const CONTACT_HEIGHT = 0.16;

export interface Support {
  left: boolean;
  right: boolean;
  /** Middle of the feet on the ground, or null when airborne. */
  center: Vec3 | null;
}

export function supportBase(skeleton: Skeleton, pose: Pose): Support {
  const l = pose.positions[boneIndex(skeleton, 'LeftFoot')]!;
  const r = pose.positions[boneIndex(skeleton, 'RightFoot')]!;
  const left = l[1] < CONTACT_HEIGHT;
  const right = r[1] < CONTACT_HEIGHT;
  const center: Vec3 | null = left && right ? [(l[0] + r[0]) / 2, 0, (l[2] + r[2]) / 2] : left ? [l[0], 0, l[2]] : right ? [r[0], 0, r[2]] : null;
  return { left, right, center };
}

/** How far the centre of mass sits from the middle of the support, on the floor plane. 1 means off balance or airborne. */
export function weightShift(skeleton: Skeleton, pose: Pose): number {
  const support = supportBase(skeleton, pose);
  if (!support.center) return 1;
  const com = centerOfMass(skeleton, pose);
  return Math.min(1, Math.hypot(com[0] - support.center[0], com[2] - support.center[2]) / 0.3);
}

/** The joints whose movement makes a pose read as action. */
const LIMB_JOINTS = ['LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg', 'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm', 'LowerBack', 'Spine1'] as const;

/** Mean angular speed of the limb joints between two frames, in radians a second. */
export function angularSpeed(skeleton: Skeleton, before: Frame, after: Frame, seconds: number): number {
  let sum = 0;
  for (const name of LIMB_JOINTS) {
    const b = boneIndex(skeleton, name);
    sum += quatAngle(before.rotations[b]!, after.rotations[b]!);
  }
  return seconds <= 0 ? 0 : sum / LIMB_JOINTS.length / seconds;
}

/**
 * How worth drawing a frame is, about 0.1 to 1. Fast-moving limbs and a centre of
 * mass away from the feet score high; standing still over both feet scores low.
 */
export function scoreFrame(skeleton: Skeleton, offsets: readonly Vec3[], before: Frame, frame: Frame, after: Frame, seconds: number): number {
  const speed = angularSpeed(skeleton, before, after, seconds);
  const motion = speed / (speed + 1.5);
  const shift = weightShift(skeleton, forwardKinematics(skeleton, offsets, frame));
  return 0.1 + 0.5 * motion + 0.4 * shift;
}

/** Score every frame of a clip. The first and last frames reuse their one neighbour. */
export function scoreClip(skeleton: Skeleton, clip: ClipMeta, frames: readonly Frame[], fps: number): number[] {
  return frames.map((frame, i) => {
    const before = frames[Math.max(0, i - 1)]!;
    const after = frames[Math.min(frames.length - 1, i + 1)]!;
    const span = (Math.min(frames.length - 1, i + 1) - Math.max(0, i - 1)) / fps;
    return scoreFrame(skeleton, clip.offsets, before, frame, after, span);
  });
}

/** Pick a frame, favouring dynamic moments: probability rises steeply with score. */
export function pickFrame(random: Random, scores: readonly number[]): number {
  const picked = pickWeighted(random, scores.map((s) => s ** 3));
  return picked < 0 ? 0 : picked;
}

export interface LineOfAction {
  /** Crown, neck, mid-spine, hips, knee and foot of the supporting leg. */
  points: Vec3[];
  supportSide: 'left' | 'right';
}

/**
 * The line of action: one curve from the top of the head down the spine and
 * through the leg that carries the weight.
 */
export function lineOfAction(skeleton: Skeleton, pose: Pose, headTip: Vec3 = [0, 0.1, 0]): LineOfAction {
  const at = (name: string) => pose.positions[boneIndex(skeleton, name)]!;
  const head = boneIndex(skeleton, 'Head');
  const crown = add(pose.positions[head]!, rotate(headTip, pose.rotations[head]!));
  const support = supportBase(skeleton, pose);
  const com = centerOfMass(skeleton, pose);
  const lf = at('LeftFoot');
  const rf = at('RightFoot');
  let supportSide: 'left' | 'right';
  if (support.left !== support.right) supportSide = support.left ? 'left' : 'right';
  else if (!support.left) supportSide = lf[1] <= rf[1] ? 'left' : 'right';
  else supportSide = Math.hypot(lf[0] - com[0], lf[2] - com[2]) <= Math.hypot(rf[0] - com[0], rf[2] - com[2]) ? 'left' : 'right';
  const side = supportSide === 'left' ? 'Left' : 'Right';
  return { points: [crown, at('Neck'), at('Spine'), at('Hips'), at(`${side}Leg`), at(`${side}Foot`)], supportSide };
}

/** Bounding sphere of a pose, for framing the camera. */
export function poseBounds(pose: Pose): { center: Vec3; radius: number } {
  let lo: Vec3 = [Infinity, Infinity, Infinity];
  let hi: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const p of pose.positions) {
    lo = [Math.min(lo[0], p[0]), Math.min(lo[1], p[1]), Math.min(lo[2], p[2])];
    hi = [Math.max(hi[0], p[0]), Math.max(hi[1], p[1]), Math.max(hi[2], p[2])];
  }
  const center: Vec3 = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
  return { center, radius: length(sub(hi, lo)) / 2 };
}

/** A camera for a standing or moving figure: any side, at eye level, from low down, or from above. */
export function sampleFigureCamera(random: Random): CameraSpec {
  const viewpoint = pickOne(random, ['eye level', 'eye level', 'eye level', 'low', 'high'] as const);
  const elevation = viewpoint === 'high' ? between(random, 28, 48) : viewpoint === 'low' ? between(random, -4, 3) : between(random, 5, 15);
  const focal = pickOne(random, [35, 50, 50, 70]);
  return { azimuth: between(random, -180, 180), elevation, distance: between(random, 1, 1.25), focal, targetY: 0, viewpoint };
}
