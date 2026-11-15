// Dev-time: converts a curated set of CMU Graphics Lab motion-capture clips (BVH) into the
// compact pose data the mannequin uses. Parsed with three.js's BVHLoader, resampled to
// 10 frames a second, scaled to a 1.75-unit figure standing on y = 0, and written as
// 16-bit quaternions.
//
// Get the BVH files once (Bruce Hahne's 2010 BVH conversion of the CMU database):
//   git clone --filter=blob:none --no-checkout --depth 1 https://github.com/una-dinosauria/cmu-mocap
//   cd cmu-mocap && git sparse-checkout set --no-cone /cmu-mocap-index-text.txt /data && git checkout HEAD
//   (or check out only the clips listed in reference-packs/mocap-clips.json)
// Then: CMU_MOCAP=path/to/cmu-mocap node scripts/build-mocap.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Quaternion, Vector3 } from 'three';
import { BVHLoader } from 'three/examples/jsm/loaders/BVHLoader.js';

const SRC = process.env.CMU_MOCAP;
if (!SRC || !existsSync(`${SRC}/cmu-mocap-index-text.txt`)) {
  console.error('Set CMU_MOCAP to a checkout of the CMU BVH conversion. See the comment at the top of this file.');
  process.exit(1);
}
const OUT = 'public/mocap';
const FPS = 10;
const MAX_SECONDS = 24;
const HEIGHT = 1.75;

/** The joints the mannequin needs, in parent-before-child order. Fingers are dropped. */
const BONES = [
  'Hips', 'LHipJoint', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase',
  'RHipJoint', 'RightUpLeg', 'RightLeg', 'RightFoot', 'RightToeBase',
  'LowerBack', 'Spine', 'Spine1', 'Neck', 'Neck1', 'Head',
  'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand',
  'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand',
];
/** Where each limb ends: the child offset that gives the head, toes and hands their length. */
const TIPS = { Head: 'head', LeftToeBase: 'leftToe', RightToeBase: 'rightToe', LeftHand: 'leftHand', RightHand: 'rightHand' };

const clipIds = JSON.parse(readFileSync('reference-packs/mocap-clips.json', 'utf8')).clips;
const descriptions = new Map();
for (const line of readFileSync(`${SRC}/cmu-mocap-index-text.txt`, 'utf8').split(/\r?\n/)) {
  const match = /^(\d+_\d+)\s+(.*\S)\s*$/.exec(line);
  if (match) descriptions.set(match[1], match[2].replace(/[“”]/g, '"'));
}

function sampleTrack(track, time, size) {
  const { times, values } = track;
  let i = 0;
  while (i < times.length - 1 && times[i + 1] <= time) i++;
  return Array.from(values.slice(i * size, i * size + size));
}

function convert(id) {
  const [subject] = id.split('_');
  const file = `${SRC}/data/${subject.padStart(3, '0')}/${id}.bvh`;
  if (!existsSync(file)) throw new Error(`Missing ${file}`);
  const { skeleton, clip } = new BVHLoader().parse(readFileSync(file, 'utf8'));
  const byName = new Map(skeleton.bones.map((bone) => [bone.name, bone]));
  const tracks = new Map(clip.tracks.map((track) => [track.name, track]));
  const bones = BONES.map((name) => {
    const bone = byName.get(name);
    if (!bone) throw new Error(`${id}: no joint called ${name}`);
    return bone;
  });
  const parents = bones.map((bone) => BONES.indexOf(bone.parent?.name ?? ''));
  const offsets = bones.map((bone) => bone.position.toArray());
  const tips = {};
  for (const [name, key] of Object.entries(TIPS)) {
    const child = byName.get(name).children[0];
    tips[key] = child ? child.position.toArray() : [0, 0, 0];
  }

  const total = Math.min(clip.duration, MAX_SECONDS);
  const frames = Math.max(2, Math.floor(total * FPS));
  const root = new Float32Array(frames * 3);
  const quats = new Int16Array(frames * BONES.length * 4);
  const world = bones.map(() => ({ p: new Vector3(), q: new Quaternion() }));
  let ground = Infinity;
  const q = new Quaternion();
  for (let f = 0; f < frames; f++) {
    const time = f / FPS;
    const rootPosition = sampleTrack(tracks.get('Hips.position'), time, 3);
    root.set(rootPosition, f * 3);
    for (let b = 0; b < BONES.length; b++) {
      q.fromArray(sampleTrack(tracks.get(`${BONES[b]}.quaternion`), time, 4)).normalize();
      if (q.w < 0) q.set(-q.x, -q.y, -q.z, -q.w);
      quats.set([q.x, q.y, q.z, q.w].map((v) => Math.round(v * 32767)), (f * BONES.length + b) * 4);
      // Forward kinematics, to find the floor under this clip.
      const parent = parents[b];
      if (parent < 0) {
        world[b].p.fromArray(rootPosition);
        world[b].q.copy(q);
      } else {
        world[b].p.fromArray(offsets[b]).applyQuaternion(world[parent].q).add(world[parent].p);
        world[b].q.copy(world[parent].q).multiply(q);
      }
      ground = Math.min(ground, world[b].p.y);
    }
  }

  // Scale: leg chain plus spine chain plus head, measured on the skeleton itself.
  const length = (names) => names.reduce((sum, name) => sum + byName.get(name).position.length(), 0);
  const standing =
    length(['LeftUpLeg', 'LeftLeg', 'LeftFoot']) + length(['LowerBack', 'Spine', 'Spine1', 'Neck', 'Neck1', 'Head']) + new Vector3(...tips.head).length();
  const scale = HEIGHT / standing;
  const round = (v) => Math.round(v * scale * 10000) / 10000;
  const x0 = root[0];
  const z0 = root[2];
  for (let f = 0; f < frames; f++) {
    root[f * 3] = (root[f * 3] - x0) * scale;
    root[f * 3 + 1] = (root[f * 3 + 1] - ground) * scale + 0.04; // joints sit a little above the floor
    root[f * 3 + 2] = (root[f * 3 + 2] - z0) * scale;
  }
  return {
    meta: {
      id,
      description: descriptions.get(id) ?? 'Unknown',
      frames,
      offsets: offsets.map((o) => o.map(round)),
      tips: Object.fromEntries(Object.entries(tips).map(([k, v]) => [k, v.map(round)])),
    },
    parents,
    root,
    quats,
  };
}

mkdirSync(OUT, { recursive: true });
const chunks = [];
const clips = [];
let byteOffset = 0;
let parents = null;
for (const id of clipIds) {
  const result = convert(id);
  parents ??= result.parents;
  if (JSON.stringify(parents) !== JSON.stringify(result.parents)) throw new Error(`${id}: skeleton hierarchy differs`);
  const rootBytes = Buffer.from(result.root.buffer);
  const quatBytes = Buffer.from(result.quats.buffer);
  clips.push({ ...result.meta, byteOffset });
  chunks.push(rootBytes, quatBytes);
  byteOffset += rootBytes.length + quatBytes.length;
}
writeFileSync(`${OUT}/clips.bin`, Buffer.concat(chunks));
writeFileSync(
  `${OUT}/index.json`,
  JSON.stringify({
    source: 'CMU Graphics Lab Motion Capture Database (mocap.cs.cmu.edu), BVH conversion by Bruce Hahne',
    license: 'Free for any use (CMU); see CREDITS.md',
    fps: FPS,
    bones: BONES,
    parents,
    clips,
  }),
);
const frames = clips.reduce((sum, c) => sum + c.frames, 0);
console.log(`${clips.length} clips, ${frames} poses, ${(byteOffset / 1e6).toFixed(2)} MB`);
