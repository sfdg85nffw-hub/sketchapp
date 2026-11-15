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
import { MeshoptSimplifier } from 'meshoptimizer';
import { writeGlbParts } from './lib/glb.mjs';

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

  // The bust ends on a curve: low across the chest, rising over the shoulders so the arms fall away.
  const chestY = eyeY - 2.15 * u;
  const rise = 1.05 * u;
  const shoulderX = 1.25 * u;
  const inside = (x, y) => y - (chestY + rise * (Math.abs(x) / shoulderX) ** 2);

  const pivot = [0, eyeY - 0.1 * u, eyeZ - 0.85 * u];
  const scale = 1 / (2.05 * u);
  const positions = [];
  const remap = new Map();
  const push = (x, y, z) => positions.push((x - pivot[0]) * scale, (y - pivot[1]) * scale, (z - pivot[2]) * scale) / 3 - 1;
  const use = (i) => {
    if (!remap.has(i)) remap.set(i, push(vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]));
    return remap.get(i);
  };
  // A new vertex where an edge crosses the cut, shared by the faces on both sides of the edge.
  const crossings = new Map();
  const crossing = (a, b) => {
    const key = a < b ? `${a}_${b}` : `${b}_${a}`;
    if (!crossings.has(key)) {
      const fa = inside(vertices[a * 3], vertices[a * 3 + 1]);
      const fb = inside(vertices[b * 3], vertices[b * 3 + 1]);
      const t = fa / (fa - fb);
      const mix = (k) => vertices[a * 3 + k] + (vertices[b * 3 + k] - vertices[a * 3 + k]) * t;
      crossings.set(key, push(mix(0), mix(1), mix(2)));
    }
    return crossings.get(key);
  };

  const indices = [];
  const boundary = new Map(); // from -> to, along the cut, wound so the cap faces down
  for (const quad of groups.get('body')) {
    const polygon = [];
    for (let k = 0; k < quad.length; k++) {
      const a = quad[k];
      const b = quad[(k + 1) % quad.length];
      const ina = inside(vertices[a * 3], vertices[a * 3 + 1]) >= 0;
      const inb = inside(vertices[b * 3], vertices[b * 3 + 1]) >= 0;
      if (ina) polygon.push(use(a));
      if (ina !== inb) {
        const c = crossing(a, b);
        polygon.push(c);
        polygon.cut ??= [];
        polygon.cut.push({ index: c, leaving: ina });
      }
    }
    for (let k = 1; k < polygon.length - 1; k++) indices.push(polygon[0], polygon[k], polygon[k + 1]);
    if (polygon.cut?.length === 2) {
      const leave = polygon.cut.find((c) => c.leaving);
      const enter = polygon.cut.find((c) => !c.leaving);
      if (leave && enter) boundary.set(enter.index, leave.index);
    }
  }
  for (const [a, b, c, d] of eyes) indices.push(use(a), use(b), use(c), use(a), use(c), use(d));

  // Close the cut so the bust is not hollow when seen from below.
  const loops = [];
  const seen = new Set();
  for (const start of boundary.keys()) {
    if (seen.has(start)) continue;
    const loop = [];
    let at = start;
    while (at !== undefined && !seen.has(at)) { seen.add(at); loop.push(at); at = boundary.get(at); }
    loops.push(loop);
  }
  loops.sort((a, b) => b.length - a.length);
  const cap = loops[0] ?? [];
  if (cap.length > 2) {
    const centre = [0, 0, 0];
    for (const i of cap) for (let k = 0; k < 3; k++) centre[k] += positions[i * 3 + k];
    const c = positions.push(centre[0] / cap.length, centre[1] / cap.length + 0.03, centre[2] / cap.length) / 3 - 1;
    for (let k = 0; k < cap.length; k++) indices.push(c, cap[k], cap[(k + 1) % cap.length]);
  }
  return { positions: Float32Array.from(positions), indices: Uint32Array.from(indices), loops: loops.map((l) => l.length) };
}


/* ---------- the big planes, and named landmarks ---------- */

/**
 * The head reduced to a few hundred flat facets: a rough, generated cousin of the
 * Asaro planes head, shown flat-shaded so each plane reads as one value.
 */
async function bigPlanes(positions, indices) {
  await MeshoptSimplifier.ready;
  const [simplified] = MeshoptSimplifier.simplify(indices, positions, 3, 420 * 3, 0.2, ['LockBorder']);
  return { positions, indices: simplified };
}

/**
 * Landmark points found on the surface itself, for the labels overlay. The head faces +z;
 * points are on the model's left side (+x) and mirrored by the app to whichever side faces the camera.
 */
function landmarks(positions) {
  const n = positions.length / 3;
  const P = (i) => [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]];
  /** The front-most vertex near (x, y). */
  const front = (x, y, r = 0.03) => {
    let best = null;
    for (let i = 0; i < n; i++) {
      const p = P(i);
      if (Math.abs(p[0] - x) < r && Math.abs(p[1] - y) < r && (!best || p[2] > best[2])) best = p;
    }
    return best;
  };
  /** The outer-most vertex near height y, in the front half of the head. */
  const side = (y, zMin, r = 0.03) => {
    let best = null;
    for (let i = 0; i < n; i++) {
      const p = P(i);
      if (Math.abs(p[1] - y) < r && p[2] > zMin && p[0] > 0 && (!best || p[0] > best[0])) best = p;
    }
    return best;
  };
  // After centring, the eyes sit at y = 0.1 / 2.05 and z = 0.85 / 2.05 (see buildBust).
  const eyeY = 0.1 / 2.05;
  const eyeZ = 0.85 / 2.05;
  let tip = [0, 0, -Infinity];
  for (let i = 0; i < n; i++) if (Math.abs(positions[i * 3]) < 0.02 && positions[i * 3 + 2] > tip[2]) tip = P(i);
  const round = (p) => p.map((v) => Math.round(v * 1000) / 1000);
  const marks = {
    'brow ridge': front(0.1, eyeY + 0.07),
    cheekbone: side(eyeY - 0.09, eyeZ - 0.06),
    'nose planes': front(0.035, tip[1] + 0.035, 0.02),
    'jaw angle': side(eyeY - 0.42, 0.1, 0.04),
  };
  return Object.fromEntries(Object.entries(marks).filter(([, p]) => p).map(([k, p]) => [k, round(p)]));
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
  const planes = await bigPlanes(bust.positions, bust.indices);
  const bytes = await writeGlbParts(`${OUT}/${spec.id}.glb`, [
    { name: 'head', positions: bust.positions, indices: bust.indices },
    { name: 'planes', positions: planes.positions, indices: planes.indices },
  ]);
  catalogue.push({ id: spec.id, label: spec.label, file: `${spec.id}.glb`, bytes, landmarks: landmarks(bust.positions) });
  console.log(`${spec.id}: ${bust.positions.length / 3} vertices, ${bust.indices.length / 3} triangles, ${(bytes / 1024).toFixed(0)} KB, boundary loops ${bust.loops.join('/')}`);
}
writeFileSync(`${OUT}/index.json`, JSON.stringify({ license: 'CC0-1.0', source: 'MakeHuman base mesh and targets (makehumancommunity/mpfb2)', heads: catalogue }, null, 1));
