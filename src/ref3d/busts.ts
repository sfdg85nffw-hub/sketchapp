import * as THREE from 'three';
import { sampleLighting, screenLightAngle } from '../lib/ref/lighting';
import { between, pickOne, type Random } from '../lib/rng';
import { sampleHeadView, samplePortraitFocal } from '../lib/ref/views';
import type { Landmark, RefImage } from '../ref/types';
import { applyLighting, disposeScene, framingDistance, loadGeometries, makeCamera, MATERIALS, project, renderStill } from './stage';

export interface HeadEntry {
  id: string;
  label: string;
  file: string;
  /** Named points on this head, in the model's own coordinates. */
  landmarks?: Record<string, [number, number, number]>;
}

interface BustModel {
  key: string;
  url: string;
  label: string;
  material: 'skin' | 'bone';
  /** Where the camera looks, and how big a sphere to frame, in model units. */
  center: [number, number, number];
  radius: number;
  landmarks: Record<string, [number, number, number]>;
}

let headIndex: Promise<HeadEntry[]> | null = null;

export function loadHeadIndex(): Promise<HeadEntry[]> {
  headIndex ??= fetch('./models/heads/index.json')
    .then((r) => {
      if (!r.ok) throw new Error('The 3D heads are missing from this build.');
      return r.json() as Promise<{ heads: HeadEntry[] }>;
    })
    .then((j) => j.heads);
  headIndex.catch(() => (headIndex = null));
  return headIndex;
}

const SKULL: BustModel = {
  key: 'skull',
  url: 'models/skull.glb',
  label: 'Human skull',
  material: 'bone',
  center: [0, 0.125, 0.01],
  radius: 0.2,
  // Measured on the mesh (see DECISIONS.md): the face looks along +z.
  landmarks: {
    'brow ridge': [0.03, 0.152, 0.112],
    'zygomatic arch': [0.102, 0.088, 0.021],
    'temporal line': [0.078, 0.195, 0.022],
    'jaw angle': [0.095, 0.043, -0.035],
  },
};

async function renderBust(model: BustModel, random: Random, directional = false): Promise<RefImage> {
  const geometries = await loadGeometries(model.url);
  const view = sampleHeadView(random);
  const focal = samplePortraitFocal(random);
  const lighting = sampleLighting(random, 'portrait', undefined, directional);
  const cameraElevation = between(random, -4, 10);

  const scene = new THREE.Scene();
  const pivot = new THREE.Group();
  const shared = new Set<THREE.BufferGeometry>();
  const material = MATERIALS[model.material]();
  const flat = MATERIALS[model.material]();
  flat.flatShading = true;
  const smooth: THREE.Mesh[] = [];
  const planes: THREE.Mesh[] = [];
  for (const [name, geometry] of geometries) {
    shared.add(geometry);
    const isPlanes = name.startsWith('planes');
    const mesh = new THREE.Mesh(geometry, isPlanes ? flat : material);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.visible = !isPlanes;
    (isPlanes ? planes : smooth).push(mesh);
    pivot.add(mesh);
  }
  // Turn about the middle of the head, not the model's origin.
  const center = new THREE.Vector3(...model.center);
  for (const mesh of [...smooth, ...planes]) mesh.position.sub(center);
  pivot.rotation.set((view.pitch * Math.PI) / 180, (view.yaw * Math.PI) / 180, (view.roll * Math.PI) / 180, 'YXZ');
  scene.add(pivot);

  const target = new THREE.Vector3(0, 0, 0);
  const camera = makeCamera(
    { azimuth: 0, elevation: cameraElevation, distance: framingDistance(model.radius, focal), focal, targetY: 0, viewpoint: 'eye level' },
    target,
  );
  // Portrait lighting is named for where it sits relative to the face, so the rig turns with the head.
  const { keyDirection } = applyLighting(scene, lighting, { turn: view.yaw, center: target, radius: model.radius * 1.5 });

  const blob = await renderStill(scene, camera);
  let planesBlob: Blob | undefined;
  if (planes.length > 0) {
    smooth.forEach((m) => (m.visible = false));
    planes.forEach((m) => (m.visible = true));
    planesBlob = await renderStill(scene, camera);
  }
  pivot.updateMatrixWorld(true);
  // Landmarks are stored for one side; label whichever side is turned towards the camera.
  const landmarks: Landmark[] = Object.entries(model.landmarks).map(([label, p]) => {
    const sides = [1, -1].map((s) => new THREE.Vector3(p[0] * s, p[1], p[2]).sub(center).applyMatrix4(pivot.matrixWorld));
    const near = sides[0]!.distanceTo(camera.position) <= sides[1]!.distanceTo(camera.position) ? sides[0]! : sides[1]!;
    const [x, y] = project([near.x, near.y, near.z], camera);
    return { label, x, y };
  });
  disposeScene(scene, shared);

  return {
    key: `${model.key}:${Math.round(view.yaw)}:${Math.round(view.pitch)}:${lighting.id}:${Math.round(lighting.key.azimuth)}`,
    blob,
    title: `${lighting.name}, ${view.label}`,
    detail: `${model.label}. ${lighting.note}`,
    light: { angle: screenLightAngle(keyDirection, 0, cameraElevation), name: lighting.name, note: lighting.note, guessable: lighting.directional },
    overlays: { ...(planesBlob ? { planes: planesBlob } : {}), landmarks },
  };
}

/** A random head, turned to a random artist-useful view, under random named light. */
export async function renderHead(random: Random, directional = false): Promise<RefImage> {
  const head = pickOne(random, await loadHeadIndex());
  return renderBust(
    { key: head.id, url: `models/heads/${head.file}`, label: head.label, material: 'skin', center: [0, -0.16, 0.02], radius: 0.8, landmarks: head.landmarks ?? {} },
    random,
    directional,
  );
}

export function renderSkull(random: Random, directional = false): Promise<RefImage> {
  return renderBust(SKULL, random, directional);
}
