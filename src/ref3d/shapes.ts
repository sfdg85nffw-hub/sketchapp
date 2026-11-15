import * as THREE from 'three';
import { screenLightAngle } from '../lib/ref/lighting';
import { describeScene, generateScene, relight, type SceneOptions, type ShapeInstance, type ShapeScene } from '../lib/ref/scene';
import { newSeed } from '../lib/rng';
import type { RefImage } from '../ref/types';
import { applyLighting, disposeScene, ground, makeCamera, MATERIALS, renderOverlay, renderStill, studioEnvironment, terminatorMaterial } from './stage';

/** Flat-faced solids keep their facets: one normal per face. */
function faceted(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const flat = geometry.toNonIndexed();
  flat.computeVertexNormals();
  geometry.dispose();
  return flat;
}

/** A cup you can see into: outer wall, rim, inner wall and a floor part-way up. */
function cupParts(radius: number, height: number): THREE.BufferGeometry[] {
  const wall = radius * 0.1;
  const foot = radius * 0.78;
  const floor = height * 0.12;
  const innerFoot = foot - wall + (radius - foot) * (floor / height);
  const outer = new THREE.CylinderGeometry(radius, foot, height, 64, 1, true).translate(0, height / 2, 0);
  const inner = new THREE.CylinderGeometry(radius - wall, innerFoot, height - floor, 64, 1, true).translate(0, floor + (height - floor) / 2, 0);
  // Flip the inner wall so it faces the middle of the cup.
  inner.scale(-1, 1, 1);
  inner.index?.array.reverse();
  inner.computeVertexNormals();
  const rim = new THREE.RingGeometry(radius - wall, radius, 64).rotateX(-Math.PI / 2).translate(0, height, 0);
  const base = new THREE.CircleGeometry(innerFoot, 64).rotateX(-Math.PI / 2).translate(0, floor, 0);
  const bottom = new THREE.CircleGeometry(foot, 64).rotateX(Math.PI / 2);
  return [outer, inner, rim, base, bottom];
}

function buildShape(shape: ShapeInstance): THREE.BufferGeometry[] {
  const { radius: r, height: h } = shape;
  switch (shape.kind) {
    case 'cube':
      return [new THREE.BoxGeometry(r * 2, h, r * 2).translate(0, h / 2, 0)];
    case 'sphere':
      return [new THREE.SphereGeometry(r, 64, 40).translate(0, r, 0)];
    case 'cylinder':
      return [new THREE.CylinderGeometry(r, r, h, 64).translate(0, h / 2, 0)];
    case 'cone':
      return [new THREE.ConeGeometry(r, h, 64).translate(0, h / 2, 0)];
    case 'torus':
      return [new THREE.TorusGeometry(r * 0.7, h / 2, 28, 72).rotateX(Math.PI / 2).translate(0, h / 2, 0)];
    case 'pyramid':
      return [faceted(new THREE.ConeGeometry(r * Math.SQRT2, h, 4).rotateY(Math.PI / 4).translate(0, h / 2, 0))];
    case 'hexprism':
      return [faceted(new THREE.CylinderGeometry(r, r, h, 6).translate(0, h / 2, 0))];
    case 'cup':
      return cupParts(r, h);
  }
}

function buildScene(spec: ShapeScene): { scene: THREE.Scene; camera: THREE.PerspectiveCamera; keyDirection: readonly [number, number, number] } {
  const scene = new THREE.Scene();
  for (const shape of spec.shapes) {
    const material = MATERIALS[shape.material]();
    if (shape.kind === 'cup') material.side = THREE.DoubleSide;
    const group = new THREE.Group();
    for (const geometry of buildShape(shape)) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    group.position.set(shape.x, shape.y, shape.z);
    group.rotation.y = (shape.yaw * Math.PI) / 180;
    scene.add(group);
  }
  scene.add(ground(60, Math.min(0.92, spec.lighting.background + 0.42)));
  if (spec.shapes.some((s) => s.material === 'metal')) {
    scene.environment = studioEnvironment();
    scene.environmentIntensity = 0.9;
    scene.traverse((o) => {
      const material = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (material?.isMeshStandardMaterial && material.metalness < 0.5) material.envMapIntensity = 0;
    });
  }
  const target = new THREE.Vector3(0, spec.camera.targetY, 0);
  const camera = makeCamera(spec.camera, target);
  // Named lights are relative to the viewer here: "split" means from the side as you look at it.
  const { keyDirection } = applyLighting(scene, spec.lighting, { turn: spec.camera.azimuth, center: target, radius: 2.4 });
  return { scene, camera, keyDirection };
}

async function renderScene(spec: ShapeScene, options: SceneOptions): Promise<RefImage> {
  const { scene, camera, keyDirection } = buildScene(spec);
  const blob = await renderStill(scene, camera);
  scene.traverse((o) => {
    if (o.userData.ground) o.visible = false;
  });
  const material = terminatorMaterial(keyDirection);
  const terminator = await renderOverlay(scene, camera, material);
  material.dispose();
  disposeScene(scene);
  return {
    key: `shapes:${spec.seed}:${spec.lightSeed}`,
    blob,
    title: `${spec.lighting.name}, ${spec.camera.viewpoint}`,
    detail: `${describeScene(spec)}. ${spec.lighting.note}`,
    seed: spec.seed,
    light: {
      angle: screenLightAngle(keyDirection, spec.camera.azimuth, spec.camera.elevation),
      name: spec.lighting.name,
      note: spec.lighting.note,
      guessable: spec.lighting.directional,
    },
    overlays: { terminator },
    relight: () => renderScene(relight(spec, newSeed(), options), options),
  };
}

/** A still life of simple solids from a seed. */
export function renderShapes(seed: number, options: SceneOptions = {}): Promise<RefImage> {
  return renderScene(generateScene(seed, options), options);
}
