import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  angleError,
  gradeGuess,
  LIGHTING_RECIPES,
  lightingFor,
  lightVector,
  nearestDialDirection,
  sampleLighting,
  screenLightAngle,
  summariseGuesses,
} from '../../src/lib/ref/lighting';
import {
  angularSpeed,
  centerOfMass,
  clipByteLength,
  forwardKinematics,
  lineOfAction,
  pickFrame,
  readFrame,
  sampleFigureCamera,
  scoreClip,
  supportBase,
  weightShift,
  type Frame,
  type MocapIndex,
} from '../../src/lib/ref/mocap';
import { attributionLine, attributionRequired, findPackItem, formatBytes, packFiles, parsePackIndex } from '../../src/lib/ref/packs';
import { describeScene, generateScene, relight, SHAPE_KINDS } from '../../src/lib/ref/scene';
import { direction, length, quatFromAxisAngle, sub, toView } from '../../src/lib/ref/vec';
import { fieldOfView, gestureReminder, GESTURE_REMINDERS, mirrorPrompt, sampleHeadView, samplePortraitFocal } from '../../src/lib/ref/views';
import { seededRandom } from '../../src/lib/rng';

describe('named lighting', () => {
  it('has every setup the brief names', () => {
    expect(LIGHTING_RECIPES.map((r) => r.id)).toEqual(['rembrandt', 'loop', 'split', 'butterfly', 'rim', 'under', 'overcast', 'two-light', 'raking', 'double-shadow']);
    expect(lightingFor('shapes').map((r) => r.id)).toEqual(expect.arrayContaining(['raking', 'double-shadow']));
    expect(lightingFor('portrait').map((r) => r.id)).not.toContain('raking');
  });

  it('samples inside each recipe, on either side, and is repeatable from a seed', () => {
    const sides = new Set<number>();
    for (let seed = 1; seed <= 60; seed++) {
      const setup = sampleLighting(seededRandom(seed), 'portrait', 'rembrandt');
      expect(setup.name).toBe('Rembrandt');
      expect(Math.abs(setup.key.azimuth)).toBeGreaterThanOrEqual(38);
      expect(Math.abs(setup.key.azimuth)).toBeLessThanOrEqual(52);
      expect(setup.key.elevation).toBeGreaterThanOrEqual(35);
      expect(setup.key.elevation).toBeLessThanOrEqual(48);
      sides.add(Math.sign(setup.key.azimuth));
    }
    expect(sides.size).toBe(2);
    expect(sampleLighting(seededRandom(9), 'shapes')).toEqual(sampleLighting(seededRandom(9), 'shapes'));
    const seen = new Set(Array.from({ length: 80 }, (_, i) => sampleLighting(seededRandom(i + 1), 'shapes').id));
    expect(seen.size).toBe(lightingFor('shapes').length);
  });

  it('puts split light at the side, butterfly in front and above, underlighting below', () => {
    const split = sampleLighting(seededRandom(4), 'portrait', 'split');
    expect(Math.abs(lightVector(split.key)[0])).toBeGreaterThan(0.9);
    const butterfly = sampleLighting(seededRandom(4), 'portrait', 'butterfly');
    expect(lightVector(butterfly.key)[1]).toBeGreaterThan(0.7);
    expect(lightVector(butterfly.key)[2]).toBeGreaterThan(0.4);
    expect(lightVector(sampleLighting(seededRandom(4), 'portrait', 'under').key)[1]).toBeLessThan(-0.5);
    expect(lightVector(sampleLighting(seededRandom(4), 'portrait', 'rim').key)[2]).toBeLessThan(-0.5);
    expect(sampleLighting(seededRandom(4), 'portrait', 'overcast').directional).toBe(false);
    expect(sampleLighting(seededRandom(4), 'shapes', 'double-shadow').second).toBeDefined();
  });

  it('only gives light with one clear direction when guess the light is on', () => {
    for (const use of ['portrait', 'figure', 'shapes'] as const) {
      const ids = new Set(Array.from({ length: 200 }, (_, i) => sampleLighting(seededRandom(i + 1), use, undefined, true).id));
      expect(ids.has('overcast')).toBe(false);
      expect(ids.size).toBeGreaterThan(3);
    }
    for (let seed = 1; seed < 60; seed++) expect(generateScene(seed, { directional: true }).lighting.directional).toBe(true);
  });
});

describe('guess the light', () => {
  it('reads the light direction as it appears in the picture', () => {
    // Camera in front, level: a light up and to the right appears up-right.
    expect(screenLightAngle(direction(90, 0), 0, 0)).toBeCloseTo(90, 5);
    expect(screenLightAngle(direction(0, 80), 0, 0)).toBeCloseTo(0, 5);
    expect(screenLightAngle(direction(-90, 0), 0, 0)).toBeCloseTo(270, 5);
    expect(screenLightAngle(direction(45, 45), 0, 0)).toBeGreaterThan(30);
    expect(screenLightAngle(direction(45, 45), 0, 0)).toBeLessThan(45);
    // Walk the camera round to the right side: the same light now appears on the left.
    expect(screenLightAngle(direction(0, 30), 90, 0)).toBeGreaterThan(270);
    // Underlighting appears from below.
    expect(angleError(screenLightAngle(direction(0, -45), 0, 0), 180)).toBeLessThan(1);
  });

  it('measures the error the short way round', () => {
    expect(angleError(350, 10)).toBe(20);
    expect(angleError(10, 350)).toBe(20);
    expect(angleError(0, 180)).toBe(180);
    expect(angleError(90, 90)).toBe(0);
    expect(angleError(45, 405)).toBe(0);
  });

  it('snaps to the eight-way dial and grades the answer', () => {
    expect(nearestDialDirection(50)).toBe(45);
    expect(nearestDialDirection(340)).toBe(0);
    expect(nearestDialDirection(200)).toBe(180);
    expect(gradeGuess(10)).toBe('right');
    expect(gradeGuess(45)).toBe('close');
    expect(gradeGuess(100)).toBe('off');
  });

  it('tracks accuracy over time', () => {
    expect(summariseGuesses([])).toEqual({ count: 0, recent: null, earlier: null });
    const guesses = [...Array.from({ length: 10 }, () => ({ date: 'd', error: 60 })), ...Array.from({ length: 10 }, () => ({ date: 'd', error: 20 }))];
    expect(summariseGuesses(guesses)).toEqual({ count: 20, recent: 20, earlier: 60 });
  });
});

describe('view maths', () => {
  it('converts to camera space', () => {
    const [right, up, towards] = toView([0, 0, 1], 0, 0);
    expect([right, up, towards].map((v) => Math.round(v))).toEqual([0, 0, 1]);
    expect(toView([1, 0, 0], 90, 0)[2]).toBeCloseTo(1, 6);
    expect(toView([0, 1, 0], 30, 90)[2]).toBeCloseTo(1, 6);
  });

  it('samples artist-useful head views and portrait lenses', () => {
    const ids = new Set<string>();
    for (let seed = 1; seed <= 200; seed++) {
      const view = sampleHeadView(seededRandom(seed));
      ids.add(view.id);
      expect(Math.abs(view.yaw)).toBeLessThanOrEqual(96);
      expect(Math.abs(view.pitch)).toBeLessThanOrEqual(30);
      expect(Math.abs(view.roll)).toBeLessThanOrEqual(20);
      const focal = samplePortraitFocal(seededRandom(seed));
      expect(focal).toBeGreaterThanOrEqual(50);
      expect(focal).toBeLessThanOrEqual(85);
    }
    expect([...ids].sort()).toEqual(['down', 'front', 'profile', 'three-quarter', 'tilted', 'up']);
    expect(fieldOfView(50)).toBeCloseTo(39.6, 1);
    expect(fieldOfView(85)).toBeLessThan(fieldOfView(50));
  });

  it('rotates gesture reminders and writes mirror prompts', () => {
    expect(GESTURE_REMINDERS).toHaveLength(4);
    expect(gestureReminder(0)).toBe('Line of action first.');
    expect(gestureReminder(5)).toBe('Shoulders vs. hips tilt.');
    expect(mirrorPrompt(seededRandom(2)).split(', ')).toHaveLength(3);
  });
});

describe('seeded shape scenes', () => {
  it('is a pure function of the seed', () => {
    expect(generateScene(4242)).toEqual(generateScene(4242));
    expect(generateScene(4242)).not.toEqual(generateScene(4243));
  });

  it('makes one to four shapes that sit on the ground or on another shape', () => {
    const kinds = new Set<string>();
    let stacked = 0;
    let cups = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const scene = generateScene(seed);
      expect(scene.shapes.length).toBeGreaterThanOrEqual(1);
      expect(scene.shapes.length).toBeLessThanOrEqual(4);
      for (const shape of scene.shapes) {
        kinds.add(shape.kind);
        expect(shape.material).toBe('plaster');
        expect(shape.height).toBeGreaterThan(0);
        expect(Math.hypot(shape.x, shape.z)).toBeLessThan(1.3);
        if (shape.y > 0) {
          stacked++;
          const base = scene.shapes.find((s) => s.y === 0 && s.x === shape.x && s.z === shape.z)!;
          expect(base.height).toBe(shape.y);
          expect(shape.radius).toBeLessThanOrEqual(base.radius);
        }
      }
      if (scene.shapes.some((s) => s.kind === 'cup')) cups++;
      expect(scene.camera.elevation).toBeGreaterThan(0);
      expect(scene.lighting.name.length).toBeGreaterThan(0);
    }
    expect([...kinds].sort()).toEqual([...SHAPE_KINDS].sort());
    expect(stacked).toBeGreaterThan(10);
    // The hollow cup is weighted up: it should turn up in a good share of scenes.
    expect(cups).toBeGreaterThan(60);
  });

  it('"same scene, new light" changes only the lighting', () => {
    const scene = generateScene(77);
    const again = relight(scene, 78);
    expect(again.shapes).toEqual(scene.shapes);
    expect(again.camera).toEqual(scene.camera);
    expect(again.lighting).not.toEqual(scene.lighting);
    expect(again.seed).toBe(77);
    expect(again.lightSeed).toBe(78);
  });

  it('honours the material choice and describes the scene in words', () => {
    expect(generateScene(5, { material: 'metal' }).shapes.every((s) => s.material === 'metal')).toBe(true);
    const mixed = new Set(Array.from({ length: 40 }, (_, i) => generateScene(i + 1, { material: 'mixed' }).shapes.map((s) => s.material)).flat());
    expect(mixed.size).toBe(3);
    expect(describeScene(generateScene(4242))).toMatch(/^[a-z ,]+$/);
  });
});

describe('motion capture', () => {
  const index = JSON.parse(readFileSync('public/mocap/index.json', 'utf8')) as MocapIndex;
  const file = readFileSync('public/mocap/clips.bin');
  const data = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
  const clip = (id: string) => index.clips.find((c) => c.id === id)!;
  const frames = (id: string): Frame[] => Array.from({ length: clip(id).frames }, (_, f) => readFrame(data, clip(id), index.bones.length, f));
  const mean = (list: number[]) => list.reduce((a, b) => a + b, 0) / list.length;

  it('bundles 40 to 80-odd clips with ids, descriptions and tidy byte ranges', () => {
    expect(index.clips.length).toBeGreaterThanOrEqual(40);
    expect(index.bones).toHaveLength(25);
    let offset = 0;
    for (const c of index.clips) {
      expect(c.id).toMatch(/^\d+_\d+$/);
      expect(c.description.length).toBeGreaterThan(0);
      expect(c.byteOffset).toBe(offset);
      offset += clipByteLength(c.frames, index.bones.length);
    }
    expect(offset).toBe(data.byteLength);
  });

  it('forward kinematics keeps every bone its own length and the figure about 1.75 tall', () => {
    const walk = clip('07_01');
    const pose = forwardKinematics(index, walk.offsets, readFrame(data, walk, index.bones.length, 5));
    index.parents.forEach((parent, b) => {
      if (parent >= 0) expect(length(sub(pose.positions[b]!, pose.positions[parent]!))).toBeCloseTo(length(walk.offsets[b]!), 3);
    });
    const head = pose.positions[index.bones.indexOf('Head')]![1];
    expect(head).toBeGreaterThan(1.4);
    expect(head).toBeLessThan(1.8);
    const feet = Math.min(pose.positions[index.bones.indexOf('LeftFoot')]![1], pose.positions[index.bones.indexOf('RightFoot')]![1]);
    expect(feet).toBeLessThan(0.2);
    const com = centerOfMass(index, pose);
    expect(com[1]).toBeGreaterThan(0.8);
    expect(com[1]).toBeLessThan(1.2);
  });

  it('scores dynamic moments above standing still', () => {
    const still: Frame = { root: [0, 0.95, 0], rotations: index.bones.map(() => [0, 0, 0, 1] as const) };
    const tpose = clip('07_01');
    const standing = scoreClip(index, tpose, [still, still, still], index.fps)[1]!;
    const cartwheel = mean(scoreClip(index, clip('49_06'), frames('49_06'), index.fps));
    const sitting = mean(scoreClip(index, clip('13_04'), frames('13_04'), index.fps));
    const run = mean(scoreClip(index, clip('09_01'), frames('09_01'), index.fps));
    expect(cartwheel).toBeGreaterThan(sitting);
    expect(run).toBeGreaterThan(sitting);
    expect(standing).toBeLessThan(0.3);
    expect(cartwheel).toBeGreaterThan(standing * 2);
  });

  it('measures limb speed and weight shift', () => {
    const still: Frame = { root: [0, 0.95, 0], rotations: index.bones.map(() => [0, 0, 0, 1] as const) };
    const moved: Frame = { ...still, rotations: still.rotations.map((q, b) => (index.bones[b] === 'LeftArm' ? quatFromAxisAngle([0, 0, 1], 1) : q)) };
    expect(angularSpeed(index, still, still, 0.2)).toBe(0);
    expect(angularSpeed(index, still, moved, 0.2)).toBeCloseTo(1 / 10 / 0.2, 5);
    const jump = frames('13_11').map((f) => forwardKinematics(index, clip('13_11').offsets, f));
    const airborne = jump.filter((p) => supportBase(index, p).center === null);
    expect(airborne.length).toBeGreaterThan(0);
    expect(weightShift(index, airborne[0]!)).toBe(1);
  });

  it('prefers high-scoring frames when picking', () => {
    const scores = [0.1, 0.1, 0.9, 0.1];
    const picks = Array.from({ length: 200 }, (_, i) => pickFrame(seededRandom(i + 1), scores));
    expect(picks.filter((p) => p === 2).length).toBeGreaterThan(180);
    expect(pickFrame(seededRandom(1), [])).toBe(0);
  });

  it('draws the line of action from the crown down the spine to the supporting foot', () => {
    const walk = clip('07_01');
    for (const f of [2, 9, 16, 23]) {
      const pose = forwardKinematics(index, walk.offsets, readFrame(data, walk, index.bones.length, f));
      const line = lineOfAction(index, pose, walk.tips.head);
      expect(line.points).toHaveLength(6);
      // Top to bottom.
      expect(line.points[0]![1]).toBeGreaterThan(line.points[1]![1]);
      expect(line.points[1]![1]).toBeGreaterThan(line.points[3]![1]);
      expect(line.points[3]![1]).toBeGreaterThan(line.points[5]![1]);
      // It ends on the foot that is on the ground.
      const support = supportBase(index, pose);
      if (support.left !== support.right) expect(line.supportSide).toBe(support.left ? 'left' : 'right');
      expect(line.points[5]).toEqual(pose.positions[index.bones.indexOf(line.supportSide === 'left' ? 'LeftFoot' : 'RightFoot')]);
    }
  });

  it('samples cameras all round the figure, including low and high viewpoints', () => {
    const viewpoints = new Set<string>();
    const quadrants = new Set<number>();
    for (let seed = 1; seed <= 200; seed++) {
      const camera = sampleFigureCamera(seededRandom(seed));
      viewpoints.add(camera.viewpoint);
      quadrants.add(Math.floor((camera.azimuth + 180) / 90));
      expect(camera.elevation).toBeGreaterThanOrEqual(-4);
      expect(camera.elevation).toBeLessThanOrEqual(48);
      if (camera.viewpoint === 'low') expect(camera.elevation).toBeLessThanOrEqual(3);
      if (camera.viewpoint === 'high') expect(camera.elevation).toBeGreaterThanOrEqual(28);
    }
    expect([...viewpoints].sort()).toEqual(['eye level', 'high', 'low']);
    expect(quadrants.size).toBe(4);
  });
});

describe('photo pack index', () => {
  const raw = {
    version: 1,
    packs: {
      face: {
        items: [
          { id: 'face-1', file: 'face/face-1.webp', thumb: 'face/face-1.jpg', width: 1000, height: 1400, bytes: 90_000, thumbBytes: 20_000, title: 'Portrait of a Man', author: 'Nadar', license: 'CC0', source: 'https://example.org/1', credit: 'The Metropolitan Museum of Art', tags: { angle: '3-4', lighting: 'side' } },
          { id: 'face-2', file: 'face/face-2.webp', thumb: 'face/face-2.jpg', bytes: 50_000, thumbBytes: 10_000, title: 'Worker', author: 'Jane Doe', license: 'CC BY 4.0', source: 'https://example.org/2', tags: {} },
          { id: 'face-3', file: 'face/face-3.webp', thumb: 'face/face-3.jpg', title: 'No licence recorded', source: 'https://example.org/3' },
          { id: 'face-4', file: 'face/face-4.webp', thumb: 'face/face-4.jpg', license: 'CC0' },
          'nonsense',
        ],
      },
      mystery: { items: [{ id: 'x', file: 'x', thumb: 'x', license: 'CC0', source: 's' }] },
    },
  };

  it('keeps well-formed items and drops any without a licence or a source', () => {
    const index = parsePackIndex(raw);
    expect(index.face.items.map((i) => i.id)).toEqual(['face-1', 'face-2']);
    expect(index.face.bytes).toBe(170_000);
    expect(index.pose.items).toEqual([]);
    expect(index.urban.bytes).toBe(0);
    expect(Object.keys(index).sort()).toEqual(['face', 'hands-feet', 'pose', 'urban']);
    expect(parsePackIndex(null).face.items).toEqual([]);
    expect(parsePackIndex({ packs: { face: { items: 'oops' } } }).face.items).toEqual([]);
  });

  it('looks up attribution for any image', () => {
    const index = parsePackIndex(raw);
    const item = findPackItem(index, 'face-1')!;
    expect(attributionLine(item)).toBe('Portrait of a Man. Nadar. CC0, The Metropolitan Museum of Art.');
    expect(attributionLine(findPackItem(index, 'face-2')!)).toBe('Worker. Jane Doe. CC BY 4.0.');
    expect(attributionLine({ title: 'Street', author: 'Unknown', license: 'Public domain' })).toBe('Street. Unknown photographer. Public domain.');
    expect(findPackItem(index, 'nope')).toBeUndefined();
    expect(attributionRequired('CC BY 4.0')).toBe(true);
    expect(attributionRequired('CC0')).toBe(false);
    expect(attributionRequired('Public domain')).toBe(false);
  });

  it('lists the files to cache and formats sizes', () => {
    expect(packFiles(parsePackIndex(raw).face)).toEqual(['face/face-1.webp', 'face/face-1.jpg', 'face/face-2.webp', 'face/face-2.jpg']);
    expect(formatBytes(170_000)).toBe('166 KB');
    expect(formatBytes(12.4 * 1024 * 1024)).toBe('12 MB');
    expect(formatBytes(3.26 * 1024 * 1024)).toBe('3.3 MB');
  });
});
