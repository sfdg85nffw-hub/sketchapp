import * as THREE from 'three';
import { sampleLighting, screenLightAngle } from '../lib/ref/lighting';
import {
  boneIndex,
  forwardKinematics,
  lineOfAction,
  pickFrame,
  poseBounds,
  readFrame,
  sampleFigureCamera,
  scoreClip,
  type ClipMeta,
  type MocapIndex,
  type Pose,
} from '../lib/ref/mocap';
import { pickOne, type Random } from '../lib/rng';
import { add, normalize, rotate, scale, sub, type Vec3 } from '../lib/ref/vec';
import type { RefImage } from '../ref/types';
import { applyLighting, disposeScene, framingDistance, ground, makeCamera, MATERIALS, project, renderStill } from './stage';

interface Mocap {
  index: MocapIndex;
  data: ArrayBuffer;
  scores: Map<string, number[]>;
}

let mocap: Promise<Mocap> | null = null;

export function loadMocap(): Promise<Mocap> {
  mocap ??= Promise.all([
    fetch('./mocap/index.json').then((r) => {
      if (!r.ok) throw new Error('The motion-capture data is missing from this build.');
      return r.json() as Promise<MocapIndex>;
    }),
    fetch('./mocap/clips.bin').then((r) => {
      if (!r.ok) throw new Error('The motion-capture data is missing from this build.');
      return r.arrayBuffer();
    }),
  ]).then(([index, data]) => ({ index, data, scores: new Map() }));
  mocap.catch(() => (mocap = null));
  return mocap;
}

const UP = new THREE.Vector3(0, 1, 0);
const v3 = (p: Vec3) => new THREE.Vector3(p[0], p[1], p[2]);

/** A tapered wooden limb between two joints. */
function limb(from: Vec3, to: Vec3, r0: number, r1: number): THREE.Mesh {
  const a = v3(from);
  const b = v3(to);
  const length = Math.max(0.001, a.distanceTo(b));
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, length, 20));
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
  return mesh;
}

function ball(at: Vec3, radius: number): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 14));
  mesh.position.copy(v3(at));
  return mesh;
}

/** An ellipsoid mass (ribcage, pelvis, head, mitten hand) whose long axis runs from `from` to `to`. */
function mass(from: Vec3, to: Vec3, width: number, depth: number, facing: Vec3, overshoot = 0): THREE.Mesh {
  const a = v3(from);
  const b = v3(to);
  const axis = b.clone().sub(a);
  const length = axis.length() * (1 + overshoot);
  const y = axis.clone().normalize();
  // Keep the flat side of the mass facing the way the body faces.
  const z = v3(facing).addScaledVector(y, -v3(facing).dot(y)).normalize();
  const x = new THREE.Vector3().crossVectors(y, z);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 20));
  mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  mesh.scale.set(width, length, depth);
  mesh.position.copy(a).addScaledVector(y, length / 2);
  return mesh;
}

/** A wedge foot: high at the ankle, low at the toes. */
function foot(ankle: Vec3, toe: Vec3, tip: Vec3): THREE.Mesh {
  const end = add(toe, tip);
  const a = v3([ankle[0], Math.max(0.035, ankle[1] - 0.05), ankle[2]]);
  const b = v3([end[0], Math.max(0.02, end[1]), end[2]]);
  const along = b.clone().sub(a);
  const length = along.length() + 0.07;
  const z = along.clone().normalize();
  const x = new THREE.Vector3().crossVectors(UP, z).normalize();
  const y = new THREE.Vector3().crossVectors(z, x);
  const shape = new THREE.Shape();
  shape.moveTo(-0.06, -0.035);
  shape.lineTo(length - 0.06, -0.035);
  shape.lineTo(length - 0.06, -0.005);
  shape.lineTo(0.02, 0.07);
  shape.lineTo(-0.06, 0.05);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.085, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 }).translate(0, 0, -0.0425);
  // The profile is drawn in (length, height); stand it up along the foot.
  const mesh = new THREE.Mesh(geometry);
  mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(z, y, x.negate()));
  mesh.position.copy(a);
  return mesh;
}

/** Build the artist's mannequin for one pose out of simple primitives. All code, no model file. */
export function buildMannequin(index: MocapIndex, clip: ClipMeta, pose: Pose): THREE.Group {
  const at = (name: string) => pose.positions[boneIndex(index, name)]!;
  const rot = (name: string) => pose.rotations[boneIndex(index, name)]!;
  const group = new THREE.Group();
  const forward = (name: string) => rotate([0, 0, 1], rot(name));

  // Torso: pelvis and ribcage as two masses with a ball between them, like the wooden figure.
  const hips = at('Hips');
  const hipMid = scale(add(at('LeftUpLeg'), at('RightUpLeg')), 0.5);
  const hipWidth = Math.hypot(...sub(at('LeftUpLeg'), at('RightUpLeg')));
  const shoulderWidth = Math.hypot(...sub(at('LeftArm'), at('RightArm')));
  group.add(mass(add(hipMid, scale(sub(hips, at('Spine')), 0.25)), at('LowerBack'), hipWidth * 1.75, 0.2, forward('Hips'), 0.55));
  group.add(ball(at('Spine'), 0.075));
  group.add(mass(at('Spine'), at('Neck'), shoulderWidth * 0.98, 0.21, forward('Spine1'), 0.06));
  group.add(limb(at('Neck'), at('Head'), 0.042, 0.04));
  group.add(mass(at('Head'), add(at('Head'), rotate(clip.tips.head ?? [0, 0.1, 0], rot('Head'))), 0.15, 0.19, forward('Head'), 0.95));

  for (const side of ['Left', 'Right'] as const) {
    const lower = side === 'Left' ? 'left' : 'right';
    group.add(ball(at(`${side}UpLeg`), 0.088), limb(at(`${side}UpLeg`), at(`${side}Leg`), 0.082, 0.058));
    group.add(ball(at(`${side}Leg`), 0.058), limb(at(`${side}Leg`), at(`${side}Foot`), 0.056, 0.04));
    group.add(ball(at(`${side}Foot`), 0.043), foot(at(`${side}Foot`), at(`${side}ToeBase`), rotate(clip.tips[`${lower}Toe`] ?? [0, 0, 0.07], rot(`${side}ToeBase`))));
    group.add(ball(at(`${side}Arm`), 0.06), limb(at(`${side}Arm`), at(`${side}ForeArm`), 0.052, 0.04));
    group.add(ball(at(`${side}ForeArm`), 0.042), limb(at(`${side}ForeArm`), at(`${side}Hand`), 0.04, 0.03));
    // Mitten hand: carries on from the forearm, turned by the wrist.
    const wrist = at(`${side}Hand`);
    const rest = normalize(clip.offsets[boneIndex(index, `${side}Hand`)]!);
    const reach = rotate(rest, rot(`${side}Hand`));
    group.add(ball(wrist, 0.032), mass(wrist, add(wrist, scale(reach, 0.17)), 0.085, 0.036, rotate([0, 0, 1], rot(`${side}Hand`))));
  }

  const material = MATERIALS.wood();
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.material = material;
    mesh.castShadow = mesh.receiveShadow = true;
  });
  return group;
}

/** A random dynamic pose from real motion capture, on the mannequin, from a random viewpoint. */
export async function renderMannequin(random: Random): Promise<RefImage> {
  const { index, data, scores } = await loadMocap();
  const clip = pickOne(random, index.clips);
  let clipScores = scores.get(clip.id);
  if (!clipScores) {
    const frames = Array.from({ length: clip.frames }, (_, f) => readFrame(data, clip, index.bones.length, f));
    clipScores = scoreClip(index, clip, frames, index.fps);
    scores.set(clip.id, clipScores);
  }
  const frameNumber = pickFrame(random, clipScores);
  const frame = readFrame(data, clip, index.bones.length, frameNumber);
  // Stand the figure over the origin; keep its height off the floor.
  const pose = forwardKinematics(index, clip.offsets, { ...frame, root: [0, frame.root[1], 0] });

  const scene = new THREE.Scene();
  scene.add(buildMannequin(index, clip, pose));
  const bounds = poseBounds(pose);
  const spec = sampleFigureCamera(random);
  const lighting = sampleLighting(random, 'figure');
  scene.add(ground(80, Math.min(0.9, lighting.background + 0.4)));
  const target = v3([bounds.center[0], Math.max(0.35, bounds.center[1]), bounds.center[2]]);
  const radius = Math.max(0.7, bounds.radius + 0.1);
  const camera = makeCamera({ ...spec, distance: framingDistance(radius, spec.focal, 0.92) * spec.distance * 0.82 }, target);
  const { keyDirection } = applyLighting(scene, lighting, { turn: spec.azimuth, center: target, radius: radius * 1.3 });

  const blob = await renderStill(scene, camera);
  const line = lineOfAction(index, pose, clip.tips.head);
  disposeScene(scene);
  return {
    key: `mocap:${clip.id}:${frameNumber}`,
    blob,
    title: `${clip.description}, ${spec.viewpoint}`,
    detail: `${lighting.name}. Motion capture: CMU ${clip.id}.`,
    light: { angle: screenLightAngle(keyDirection, spec.azimuth, spec.elevation), name: lighting.name, note: lighting.note, guessable: lighting.directional },
    overlays: { line: line.points.map((p) => project(p, camera)) },
  };
}
