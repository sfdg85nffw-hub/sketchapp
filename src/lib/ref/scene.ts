import { between, pickOne, pickWeighted, seededRandom, type Random } from '../rng';
import { sampleLighting, type LightingId, type LightingSetup } from './lighting';

export type ShapeKind = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'pyramid' | 'hexprism' | 'cup';
export type ShapeMaterial = 'plaster' | 'dark' | 'metal';
export type MaterialChoice = ShapeMaterial | 'mixed';

export const SHAPE_KINDS: readonly ShapeKind[] = ['cube', 'sphere', 'cylinder', 'cone', 'torus', 'pyramid', 'hexprism', 'cup'];

export const SHAPE_LABELS: Record<ShapeKind, string> = {
  cube: 'cube',
  sphere: 'sphere',
  cylinder: 'cylinder',
  cone: 'cone',
  torus: 'torus',
  pyramid: 'square pyramid',
  hexprism: 'hexagonal prism',
  cup: 'hollow cup',
};

export interface ShapeInstance {
  kind: ShapeKind;
  /** Position of the centre of the base on the ground plane; y is the height of the base. */
  x: number;
  y: number;
  z: number;
  /** Half-width of the footprint. */
  radius: number;
  height: number;
  /** Turn about the vertical axis, in degrees. */
  yaw: number;
  material: ShapeMaterial;
}

export interface CameraSpec {
  /** Degrees around the subject; 0 looks from the front. */
  azimuth: number;
  /** Degrees above the horizon. */
  elevation: number;
  distance: number;
  /** 35mm-equivalent focal length. */
  focal: number;
  /** Height the camera looks at. */
  targetY: number;
  viewpoint: 'eye level' | 'high' | 'low';
}

export interface ShapeScene {
  seed: number;
  lightSeed: number;
  shapes: ShapeInstance[];
  camera: CameraSpec;
  lighting: LightingSetup;
}

export interface SceneOptions {
  material?: MaterialChoice;
  /** Re-light the same arrangement by changing only this. */
  lightSeed?: number;
  lighting?: LightingId;
  /** Only light with one clear direction, for guess the light. */
  directional?: boolean;
}

/** Shapes with a flat top that something smaller can sit on. */
const STACKABLE: readonly ShapeKind[] = ['cube', 'cylinder', 'hexprism'];
/** The cup comes up twice as often: it is the cure for hollow ellipses. */
const KIND_WEIGHTS: readonly number[] = SHAPE_KINDS.map((k) => (k === 'cup' ? 2 : 1));

function rollShape(random: Random, material: MaterialChoice): Omit<ShapeInstance, 'x' | 'y' | 'z'> {
  const kind = SHAPE_KINDS[pickWeighted(random, KIND_WEIGHTS)]!;
  const radius = between(random, 0.34, 0.6);
  const tall = kind === 'cylinder' || kind === 'cone' || kind === 'hexprism' || kind === 'cup' || kind === 'pyramid';
  const height = kind === 'sphere' ? radius * 2 : kind === 'torus' ? radius * 0.6 : kind === 'cube' ? radius * 2 : radius * (tall ? between(random, 1.6, 2.8) : 2);
  return {
    kind,
    radius,
    height,
    yaw: between(random, 0, 360),
    material: material === 'mixed' ? pickOne(random, ['plaster', 'plaster', 'dark', 'metal'] as const) : material,
  };
}

/** A camera position that makes a sensible picture of things on a table. */
export function sampleSceneCamera(random: Random): CameraSpec {
  const viewpoint = pickOne(random, ['eye level', 'eye level', 'high', 'low'] as const);
  const elevation = viewpoint === 'high' ? between(random, 38, 58) : viewpoint === 'low' ? between(random, 4, 9) : between(random, 14, 28);
  const focal = pickOne(random, [28, 35, 50, 50, 85]);
  return {
    azimuth: between(random, -180, 180),
    elevation,
    // Wide lenses stand closer, which exaggerates perspective; long lenses flatten it.
    distance: (focal / 50) * between(random, 5.2, 6.2),
    focal,
    targetY: 0.45,
    viewpoint,
  };
}

/**
 * A still life of one to four simple solids on a ground plane, fully determined by its seed.
 * About a quarter of scenes stack one shape on another; some let two shapes intersect.
 */
export function generateScene(seed: number, options: SceneOptions = {}): ShapeScene {
  const random = seededRandom(seed);
  const material = options.material ?? 'plaster';
  const count = 1 + pickWeighted(random, [1, 3, 3, 2]);
  const shapes: ShapeInstance[] = [];
  const allowIntersect = random() < 0.2;

  for (let i = 0; i < count; i++) {
    const shape = rollShape(random, material);
    const base = shapes.find((s) => s.y === 0 && STACKABLE.includes(s.kind) && !shapes.some((t) => t.y > 0 && t.x === s.x && t.z === s.z));
    if (base && i > 0 && random() < 0.3 && shape.kind !== 'torus') {
      // Stack: something smaller, centred on a flat top.
      const radius = Math.min(shape.radius, base.radius * 0.7);
      const ratio = radius / shape.radius;
      shapes.push({ ...shape, radius, height: shape.height * ratio, x: base.x, y: base.height, z: base.z });
      continue;
    }
    let placed = false;
    for (let attempt = 0; attempt < 40 && !placed; attempt++) {
      const angle = between(random, 0, Math.PI * 2);
      const reach = Math.sqrt(random()) * 1.25;
      const x = Math.cos(angle) * reach;
      const z = Math.sin(angle) * reach;
      const gap = allowIntersect && i === 1 ? -0.25 : 0.12;
      if (shapes.every((s) => s.y > 0 || Math.hypot(s.x - x, s.z - z) > s.radius + shape.radius + gap)) {
        shapes.push({ ...shape, x, y: 0, z });
        placed = true;
      }
    }
  }

  const camera = sampleSceneCamera(random);
  const lightSeed = options.lightSeed ?? seed;
  const lighting = sampleLighting(seededRandom(lightSeed * 7919 + 13), 'shapes', options.lighting, options.directional);
  return { seed, lightSeed, shapes, camera, lighting };
}

/** The same arrangement and camera under a different light. */
export function relight(scene: ShapeScene, lightSeed: number, options: SceneOptions = {}): ShapeScene {
  return { ...scene, lightSeed, lighting: sampleLighting(seededRandom(lightSeed * 7919 + 13), 'shapes', options.lighting, options.directional) };
}

/** "cube, hollow cup and sphere" */
export function describeScene(scene: ShapeScene): string {
  const names = scene.shapes.map((s) => SHAPE_LABELS[s.kind]);
  return names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
