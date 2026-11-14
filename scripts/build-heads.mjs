// Dev-time: builds the bundled 3D heads from MakeHuman's CC0 base mesh and morph targets.
// No Blender needed: the macro and detail targets are plain vertex offsets, applied here
// the same way MakeHuman applies them.
//
// Get the data once (about 40 MB, CC0, see LICENSE.ASSETS.md in that repository):
//   git clone --filter=blob:none --no-checkout --depth 1 https://github.com/makehumancommunity/mpfb2
//   cd mpfb2 && git sparse-checkout set --no-cone '/LICENSE*' '/src/mpfb/data/3dobjs/base.obj' '/src/mpfb/data/targets/**/*.gz'
//   git checkout HEAD
// Then: MAKEHUMAN_DATA=path/to/mpfb2/src/mpfb/data node scripts/build-heads.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { writeGlb } from './lib/glb.mjs';

const DATA = process.env.MAKEHUMAN_DATA;
if (!DATA || !existsSync(`${DATA}/3dobjs/base.obj`)) {
  console.error('Set MAKEHUMAN_DATA to the mpfb2 data folder. See the comment at the top of this file.');
  process.exit(1);
}
const OUT = 'public/models/heads';

/* ---------- the people ---------- */

/** age: 0.19 is about ten, 0.5 about twenty-five, 1 about ninety. Races are blend weights. */
const HEADS = [
  { id: 'head-01', label: 'Woman, mid twenties', gender: 0.05, age: 0.5, muscle: 0.4, weight: 0.45, race: { caucasian: 0.8, asian: 0.1, african: 0.1 } },
  { id: 'head-02', label: 'Man, about thirty', gender: 0.95, age: 0.55, muscle: 0.6, weight: 0.5, race: { african: 0.9, caucasian: 0.1 } },
  { id: 'head-03', label: 'Man, about fifty', gender: 0.9, age: 0.7, muscle: 0.5, weight: 0.55, race: { asian: 0.85, caucasian: 0.15 } },
  { id: 'head-04', label: 'Woman, about eighty', gender: 0.08, age: 0.94, muscle: 0.3, weight: 0.6, race: { caucasian: 0.9, asian: 0.1 } },
  { id: 'head-05', label: 'Man, about seventy-five', gender: 0.92, age: 0.9, muscle: 0.35, weight: 0.3, race: { african: 0.85, caucasian: 0.15 } },
  { id: 'head-06', label: 'Woman, about thirty', gender: 0.1, age: 0.56, muscle: 0.4, weight: 0.4, race: { asian: 0.9, caucasian: 0.1 } },
  { id: 'head-07', label: 'Man, mid thirties, slight smile', gender: 1, age: 0.6, muscle: 0.85, weight: 0.5, race: { caucasian: 0.5, african: 0.5 }, expression: { 'mouth-corner-puller': 0.45, 'mouth-elevation': 0.2 } },
  { id: 'head-08', label: 'Woman, mid forties, brows raised', gender: 0.05, age: 0.67, muscle: 0.45, weight: 0.55, race: { african: 0.9, asian: 0.1 }, expression: { 'eyebrows-left-up': 0.5, 'eyebrows-right-up': 0.5 } },
  { id: 'head-09', label: 'Boy, about ten', gender: 0.8, age: 0.2, muscle: 0.5, weight: 0.45, race: { caucasian: 0.4, asian: 0.3, african: 0.3 } },
  { id: 'head-10', label: 'Young woman, late teens', gender: 0.1, age: 0.4, muscle: 0.45, weight: 0.4, race: { asian: 0.5, caucasian: 0.5 } },
  { id: 'head-11', label: 'Heavy-set man, about fifty-five', gender: 0.95, age: 0.72, muscle: 0.5, weight: 0.95, race: { caucasian: 0.9, african: 0.1 }, expression: { 'mouth-compression': 0.3 } },
  { id: 'head-12', label: 'Woman, about seventy, eyes narrowed', gender: 0.1, age: 0.88, muscle: 0.3, weight: 0.4, race: { asian: 0.85, african: 0.15 }, expression: { 'eye-left-slit': 0.35, 'eye-right-slit': 0.35 } },
];

/** Detail sliders that give each head its own face. [folder, base name, negative suffix, positive suffix, sided]. */
const DETAILS = [
  ['head', 'head-fat', 'decr', 'incr'],
  ['head', 'head-scale-horiz', 'decr', 'incr'],
  ['head', 'head-scale-depth', 'decr', 'incr'],
  ['head', 'head-back-scale-depth', 'decr', 'incr'],
  ['forehead', 'forehead-nubian', 'decr', 'incr'],
  ['forehead', 'forehead-temple', 'decr', 'incr'],
  ['forehead', 'forehead-scale-vert', 'decr', 'incr'],
  ['eyebrows', 'eyebrows-angle', 'down', 'up'],
  ['eyebrows', 'eyebrows-trans', 'backward', 'forward'],
  ['nose', 'nose-scale-horiz', 'decr', 'incr'],
  ['nose', 'nose-scale-depth', 'decr', 'incr'],
  ['nose', 'nose-scale-vert', 'decr', 'incr'],
  ['nose', 'nose-hump', 'decr', 'incr'],
  ['nose', 'nose-curve', 'concave', 'convex'],
  ['nose', 'nose-point', 'down', 'up'],
  ['nose', 'nose-nostrils-width', 'decr', 'incr'],
  ['nose', 'nose-width1', 'decr', 'incr'],
  ['nose', 'nose-greek', 'decr', 'incr'],
  ['mouth', 'mouth-scale-horiz', 'decr', 'incr'],
  ['mouth', 'mouth-upperlip-volume', 'decr', 'incr'],
  ['mouth', 'mouth-lowerlip-volume', 'decr', 'incr'],
  ['mouth', 'mouth-trans', 'backward', 'forward'],
  ['mouth', 'mouth-cupidsbow', 'decr', 'incr'],
  ['chin', 'chin-width', 'decr', 'incr'],
  ['chin', 'chin-height', 'decr', 'incr'],
  ['chin', 'chin-prominent', 'decr', 'incr'],
  ['chin', 'chin-bones', 'decr', 'incr'],
  ['chin', 'chin-prognathism', 'decr', 'incr'],
  ['cheek', 'cheek-bones', 'decr', 'incr', true],
  ['cheek', 'cheek-volume', 'decr', 'incr', true],
  ['cheek', 'cheek-inner', 'decr', 'incr', true],
  ['eyes', 'eye-height2', 'decr', 'incr', true],
  ['eyes', 'eye-scale', 'decr', 'incr', true],
  ['eyes', 'eye-corner2', 'down', 'up', true],
  ['eyes', 'eye-eyefold-angle', 'down', 'up', true],
  ['eyes', 'eye-trans', 'in', 'out', true],
  ['ears', 'ear-wing', 'decr', 'incr', true],
  ['ears', 'ear-scale', 'decr', 'incr', true],
  ['ears', 'ear-lobe', 'decr', 'incr', true],
  ['neck', 'neck-scale-horiz', 'decr', 'incr'],
];
/** How far the detail sliders are pushed. Above about 0.6 the faces turn into caricatures. */
const DETAIL = Number(process.env.DETAIL ?? 0.5);
const HEAD_SHAPES = ['oval', 'round', 'square', 'rectangular', 'triangular', 'invertedtriangular', 'diamond'];

/* ---------- reading MakeHuman data ---------- */

function readObj(file) {
  const vertices = [];
  const groups = new Map();
  let group = '';
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (line.startsWith('v ')) vertices.push(...line.slice(2).trim().split(/\s+/).map(Number));
    else if (line.startsWith('g ')) group = line.slice(2).trim();
    else if (line.startsWith('f ')) {
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(line.slice(2).trim().split(/\s+/).map((t) => Number.parseInt(t, 10) - 1));
    }
  }
  return { vertices: Float32Array.from(vertices), groups };
}

const targetCache = new Map();
function readTarget(path) {
  if (targetCache.has(path)) return targetCache.get(path);
  const file = `${DATA}/targets/${path}.target.gz`;
  if (!existsSync(file)) throw new Error(`No such target: ${path}`);
  const offsets = [];
  for (const line of gunzipSync(readFileSync(file)).toString('utf8').split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const [i, x, y, z] = line.trim().split(/\s+/).map(Number);
    offsets.push(i, x, y, z);
  }
  targetCache.set(path, offsets);
  return offsets;
}

function addTarget(vertices, path, weight) {
  if (Math.abs(weight) < 1e-4) return;
  const t = readTarget(path);
  for (let k = 0; k < t.length; k += 4) {
    const i = t[k] * 3;
    vertices[i] += t[k + 1] * weight;
    vertices[i + 1] += t[k + 2] * weight;
    vertices[i + 2] += t[k + 3] * weight;
  }
}

/* ---------- MakeHuman's macro model ---------- */

function ageWeights(age) {
  if (age < 0.1875) return { baby: 1 - age / 0.1875, child: age / 0.1875, young: 0, old: 0 };
  if (age < 0.5) return { baby: 0, child: 1 - (age - 0.1875) / 0.3125, young: (age - 0.1875) / 0.3125, old: 0 };
  return { baby: 0, child: 0, young: 1 - (age - 0.5) / 0.5, old: (age - 0.5) / 0.5 };
}

function threeWay(value) {
  const min = Math.max(0, 1 - 2 * value);
  const max = Math.max(0, 2 * value - 1);
  return { min, max, average: 1 - min - max };
}

function applyMacros(vertices, spec) {
  const genders = { female: 1 - spec.gender, male: spec.gender };
  const ages = ageWeights(spec.age);
  const muscles = threeWay(spec.muscle);
  const weights = threeWay(spec.weight);
  for (const [gender, gw] of Object.entries(genders)) {
    for (const [age, aw] of Object.entries(ages)) {
      if (gw * aw === 0) continue;
      for (const [race, rw] of Object.entries(spec.race)) addTarget(vertices, `macrodetails/${race}-${gender}-${age}`, gw * aw * rw);
      for (const [m, mw] of Object.entries(muscles)) {
        for (const [w, ww] of Object.entries(weights)) {
          addTarget(vertices, `macrodetails/universal-${gender}-${age}-${m}muscle-${w}weight`, gw * aw * mw * ww);
        }
      }
    }
  }
}

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function applyDetails(vertices, spec, index) {
  const random = rng(7919 * (index + 1));
  const shape = HEAD_SHAPES[Math.floor(random() * HEAD_SHAPES.length)];
  addTarget(vertices, `head/head-${shape}`, (0.35 + random() * 0.45) * DETAIL);
  for (const [folder, name, negative, positive, sided] of DETAILS) {
    // Roughly bell-shaped, so most features sit near average and a few stand out.
    const value = (random() + random() + random() - 1.5) * 0.9 * DETAIL;
    const suffix = value < 0 ? negative : positive;
    for (const side of sided ? ['l-', 'r-'] : ['']) addTarget(vertices, `${folder}/${side}${name}-${suffix}`, Math.abs(value));
  }
  if (spec.age > 0.75) for (const side of ['l-', 'r-']) addTarget(vertices, `eyes/${side}eye-bag-incr`, (spec.age - 0.6) * 1.6);
  if (spec.weight > 0.8) addTarget(vertices, 'neck/neck-double-incr', 0.7);
  const dominant = Object.entries(spec.race).sort((a, b) => b[1] - a[1])[0][0];
  for (const [unit, weight] of Object.entries(spec.expression ?? {})) addTarget(vertices, `expression/units/${dominant}/${unit}`, weight);
}

/* ---------- cutting the bust ---------- */

function buildBust(vertices, groups) {
  const eyes = [...groups.get('helper-l-eye'), ...groups.get('helper-r-eye')];
  let eyeY = 0;
  let eyeZ = 0;
  let n = 0;
  for (const face of eyes) for (const i of face) { eyeY += vertices[i * 3 + 1]; eyeZ += vertices[i * 3 + 2]; n++; }
  eyeY /= n;
  eyeZ /= n;
  let top = -Infinity;
  for (const face of groups.get('body')) for (const i of face) top = Math.max(top, vertices[i * 3 + 1]);
  const u = top - eyeY; // eye line to crown: roughly half a head
  const chestY = eyeY - 2.2 * u;
  const shoulderY = eyeY - 1.25 * u;
  const shoulderX = 1.45 * u;
  const cutAt = (x) => chestY + (shoulderY - chestY) * Math.min(1, Math.abs(x) / shoulderX) ** 2;
  const keep = (i) => Math.abs(vertices[i * 3]) < 1.6 * u && vertices[i * 3 + 1] > cutAt(vertices[i * 3]);
  const quads = [];
  const bodyQuads = groups.get('body').filter((face) => face.every(keep));
  quads.push(...bodyQuads, ...eyes);

  // Close the cut so the bust is not hollow when seen from below.
  const edgeCount = new Map();
  const key = (a, b) => (a < b ? `${a}_${b}` : `${b}_${a}`);
  for (const f of bodyQuads) for (let k = 0; k < f.length; k++) edgeCount.set(key(f[k], f[(k + 1) % f.length]), (edgeCount.get(key(f[k], f[(k + 1) % f.length])) ?? 0) + 1);
  const next = new Map();
  for (const f of bodyQuads) {
    for (let k = 0; k < f.length; k++) {
      const a = f[k];
      const b = f[(k + 1) % f.length];
      if (edgeCount.get(key(a, b)) === 1) next.set(b, a); // reversed, so the cap faces outwards
    }
  }
  const loops = [];
  const seen = new Set();
  for (const start of next.keys()) {
    if (seen.has(start)) continue;
    const loop = [];
    let at = start;
    while (at !== undefined && !seen.has(at)) { seen.add(at); loop.push(at); at = next.get(at); }
    loops.push(loop);
  }
  loops.sort((a, b) => b.length - a.length);
  // Pull the ragged edge down onto the cut line so the bust ends in a clean curve.
  for (const i of loops[0] ?? []) vertices[i * 3 + 1] = cutAt(vertices[i * 3]);

  // Re-index to just the vertices in use, recentred on the middle of the head and scaled so the head is one unit tall.
  const pivot = [0, eyeY - 0.1 * u, eyeZ - 0.85 * u];
  const scale = 1 / (2.05 * u);
  const remap = new Map();
  const positions = [];
  const use = (i) => {
    if (!remap.has(i)) {
      remap.set(i, positions.length / 3);
      positions.push((vertices[i * 3] - pivot[0]) * scale, (vertices[i * 3 + 1] - pivot[1]) * scale, (vertices[i * 3 + 2] - pivot[2]) * scale);
    }
    return remap.get(i);
  };
  const indices = [];
  for (const [a, b, c, d] of quads) indices.push(use(a), use(b), use(c), use(a), use(c), use(d));
  const cap = loops[0] ?? [];
  if (cap.length > 2) {
    const centre = [0, 0, 0];
    for (const i of cap) for (let k = 0; k < 3; k++) centre[k] += (vertices[i * 3 + k] - pivot[k]) * scale;
    const c = positions.length / 3;
    positions.push(centre[0] / cap.length, centre[1] / cap.length, centre[2] / cap.length);
    for (let k = 0; k < cap.length; k++) indices.push(c, use(cap[k]), use(cap[(k + 1) % cap.length]));
  }
  return { positions: Float32Array.from(positions), indices: Uint32Array.from(indices), loops: loops.map((l) => l.length) };
}

/* ---------- main ---------- */

const base = readObj(`${DATA}/3dobjs/base.obj`);
mkdirSync(OUT, { recursive: true });
const catalogue = [];
for (const [index, spec] of HEADS.entries()) {
  const vertices = Float32Array.from(base.vertices);
  applyMacros(vertices, spec);
  applyDetails(vertices, spec, index);
  const bust = buildBust(vertices, base.groups);
  const bytes = await writeGlb(`${OUT}/${spec.id}.glb`, bust.positions, bust.indices);
  catalogue.push({ id: spec.id, label: spec.label, file: `${spec.id}.glb`, bytes });
  console.log(`${spec.id}: ${bust.positions.length / 3} vertices, ${bust.indices.length / 3} triangles, ${(bytes / 1024).toFixed(0)} KB, boundary loops ${bust.loops.join('/')}`);
}
writeFileSync(`${OUT}/index.json`, JSON.stringify({ license: 'CC0-1.0', source: 'MakeHuman base mesh and targets (makehumancommunity/mpfb2)', heads: catalogue }, null, 1));
