import { PROJECT_STAGES, PROJECT_TEMPLATES } from '../data/projects';
import { addDays, toDateKey } from '../lib/dates';
import { newId } from '../lib/id';
import { initialDrillState, reviewDrill } from '../lib/srs';
import type { DrillRating, Entry, MediumId, Project, Rating, SubjectId, WeaknessId } from '../lib/types';
import { WEAKNESSES } from '../data/weaknesses';
import { getDrillStates, putDrillState, putEntry, putProject, saveSettings } from './db';
import { storePhoto } from './images';

/* Placeholder "sketches" are drawn with code: no real artwork is bundled with the app. */

const INK = '#1d1c1a';
const W = 900;
const H = 1200;

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Point = [number, number];

class Pen {
  constructor(
    readonly ctx: CanvasRenderingContext2D,
    readonly rand: () => number,
  ) {}

  /** A slightly wobbly line, like a pen held in a moving train. */
  line(a: Point, b: Point, width = 2.4): void {
    const { ctx, rand } = this;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    const mx = (a[0] + b[0]) / 2 + (rand() - 0.5) * 6;
    const my = (a[1] + b[1]) / 2 + (rand() - 0.5) * 6;
    ctx.quadraticCurveTo(mx, my, b[0] + (rand() - 0.5) * 3, b[1] + (rand() - 0.5) * 3);
    ctx.stroke();
  }

  poly(points: Point[], width = 2.4): void {
    points.forEach((p, i) => this.line(p, points[(i + 1) % points.length]!, width));
  }

  /** Parallel hatching clipped to a polygon. Smaller spacing reads darker. */
  hatch(points: Point[], spacing: number, angle = -0.9, width = 1.6): void {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.clip();
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    // Step perpendicular to the stroke direction so any angle covers the whole page.
    for (let t = -1100; t < 1100; t += spacing) {
      const ox = W / 2 - dy * t;
      const oy = H / 2 + dx * t;
      this.line([ox - dx * 1100, oy - dy * 1100], [ox + dx * 1100, oy + dy * 1100], width);
    }
    ctx.restore();
  }

  fill(points: Point[]): void {
    const { ctx } = this;
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.fill();
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, width = 2.4, fill = false): void {
    const { ctx } = this;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, (this.rand() - 0.5) * 0.06, 0, Math.PI * 2);
    if (fill) ctx.fill();
    else ctx.stroke();
  }

  scribble(cx: number, cy: number, r: number, density: number): void {
    const { ctx, rand } = this;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < density; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * r;
      const x = cx + Math.cos(a) * d;
      const y = cy + Math.sin(a) * d * 0.85;
      ctx.moveTo(x, y);
      ctx.arc(x, y, 5 + rand() * 9, a, a + 3 + rand() * 2);
    }
    ctx.stroke();
  }
}

/** `skill` 0-1: later demo pages gain cast shadows, cleaner light planes and real darks. */
type Motif = (pen: Pen, skill: number) => void;

function box(pen: Pen, x: number, y: number, s: number, skill: number): void {
  const top: Point[] = [[x, y], [x + s, y - s * 0.3], [x + s * 1.7, y], [x + s * 0.7, y + s * 0.3]];
  const left: Point[] = [[x, y], [x + s * 0.7, y + s * 0.3], [x + s * 0.7, y + s * 1.2], [x, y + s * 0.9]];
  const right: Point[] = [[x + s * 0.7, y + s * 0.3], [x + s * 1.7, y], [x + s * 1.7, y + s * 0.9], [x + s * 0.7, y + s * 1.2]];
  pen.poly(top);
  pen.poly(left, 2.4 + skill * 2);
  pen.poly(right);
  pen.hatch(right, skill > 0.5 ? 7 : 12);
  if (skill < 0.5) pen.hatch(left, 13, -0.4);
  if (skill > 0.35) {
    const shadow: Point[] = [[x + s * 0.7, y + s * 1.2], [x + s * 1.7, y + s * 0.9], [x + s * 2.6, y + s * 1.15], [x + s * 1.5, y + s * 1.5]];
    pen.hatch(shadow, skill > 0.7 ? 4 : 7, 0.2, 2);
  }
}

function cup(pen: Pen, cx: number, cy: number, r: number, skill: number): void {
  pen.ellipse(cx, cy, r, r * 0.32);
  pen.line([cx - r, cy], [cx - r * 0.8, cy + r * 1.7], 2.4 + skill * 2);
  pen.line([cx + r, cy], [cx + r * 0.8, cy + r * 1.7]);
  pen.ctx.beginPath();
  pen.ctx.ellipse(cx, cy + r * 1.7, r * 0.8, r * 0.26, 0, 0, Math.PI);
  pen.ctx.stroke();
  if (skill > 0.4) {
    const inside: Point[] = [[cx - r, cy], [cx - r * 0.5, cy - r * 0.26], [cx + r * 0.5, cy - r * 0.26], [cx + r, cy], [cx + r * 0.6, cy + r * 0.25], [cx - r * 0.6, cy + r * 0.25]];
    pen.hatch(inside, 5, -1.2);
    pen.hatch([[cx + r * 0.8, cy + r * 1.8], [cx + r * 2.4, cy + r * 1.75], [cx + r * 2.2, cy + r * 2.1], [cx, cy + r * 2.05]], 5, 0.15, 2);
  }
  pen.hatch([[cx + r * 0.2, cy + r * 0.2], [cx + r, cy], [cx + r * 0.8, cy + r * 1.7], [cx + r * 0.2, cy + r * 1.9]], skill > 0.5 ? 7 : 12);
}

const MOTIFS: Record<SubjectId, Motif> = {
  urban(pen, skill) {
    const horizon = 520;
    pen.line([40, horizon], [860, horizon], 1.6);
    // Buildings receding to a vanishing point on the right.
    for (let i = 0; i < 4; i++) {
      const x = 60 + i * 170;
      const h = 380 - i * 60;
      const face: Point[] = [[x, horizon - h], [x + 140, horizon - h * 0.86], [x + 140, horizon + 60 - i * 12], [x, horizon + 90 - i * 16]];
      pen.poly(face, i === 0 ? 2.4 + skill * 2.4 : 1.8);
      if (i === 0 || skill < 0.5) for (let r = 0; r < 5; r++) pen.line([x + 20, horizon - h + 50 + r * 55], [x + 120, horizon - h * 0.86 + 50 + r * 52], 1.4);
      if (i % 2 === 0) pen.hatch(face, skill > 0.5 ? 9 : 14);
    }
    // A bench in the foreground: with or without its cast shadow.
    pen.poly([[180, 860], [560, 830], [600, 880], [220, 915]], 2.4 + skill * 2.6);
    pen.line([220, 915], [222, 990], 3);
    pen.line([600, 880], [602, 955], 3);
    pen.line([180, 860], [182, 800], 3);
    pen.line([560, 830], [562, 770], 3);
    pen.line([182, 800], [562, 770], 2.6);
    if (skill > 0.4) pen.hatch([[220, 990], [610, 955], [760, 1010], [360, 1050]], skill > 0.7 ? 4 : 7, 0.15, 2.2);
    // Street tree: uniform scribble early, lit side later.
    pen.line([720, 880], [724, 640], 4);
    if (skill > 0.5) {
      pen.scribble(760, 560, 90, 150);
      pen.scribble(690, 540, 80, 30);
    } else {
      pen.scribble(722, 550, 120, 110);
    }
  },
  interior(pen, skill) {
    pen.poly([[80, 700], [820, 640], [860, 760], [120, 840]], 2.4 + skill * 2);
    pen.line([120, 840], [124, 1100], 3);
    pen.line([860, 760], [862, 1040], 3);
    cup(pen, 330, 600, 70, skill);
    cup(pen, 600, 560, 54, skill);
    pen.poly([[520, 120], [820, 100], [820, 420], [520, 440]], 1.6);
    pen.line([670, 110], [670, 430], 1.4);
    if (skill > 0.6) pen.fill([[524, 124], [666, 114], [666, 428], [524, 436]]);
    else pen.hatch([[520, 120], [820, 100], [820, 420], [520, 440]], 12);
  },
  'still-life'(pen, skill) {
    pen.line([40, 760], [860, 720], 1.8);
    box(pen, 120, 520, 150, skill);
    cup(pen, 620, 470, 84, skill);
    pen.ellipse(470, 800, 76, 70, 2.4 + skill * 2);
    pen.hatch([[470, 730], [546, 800], [470, 870], [450, 800]], skill > 0.5 ? 6 : 11);
    if (skill > 0.4) pen.hatch([[500, 862], [680, 850], [640, 900], [470, 900]], 5, 0.1, 2);
  },
  portrait(pen, skill) {
    pen.ellipse(450, 470, 210, 280, 2.6 + skill * 2);
    pen.line([330, 430], [410, 424], 3);
    pen.line([490, 424], [570, 430], 3);
    pen.line([450, 450], [432, 570], 2);
    pen.line([432, 570], [470, 578], 2);
    pen.line([380, 650], [520, 646], 2.6);
    pen.line([330, 730], [300, 1000], 3);
    pen.line([570, 730], [620, 1000], 3);
    pen.hatch([[450, 200], [660, 470], [560, 740], [450, 740]], skill > 0.5 ? 7 : 12);
    if (skill > 0.6) pen.hatch([[560, 740], [620, 1000], [450, 1000], [450, 740]], 4, 0.3, 2);
    pen.scribble(450, 230, 190, 120 + skill * 120);
  },
  gesture(pen, skill) {
    for (let i = 0; i < 6; i++) {
      const x = 170 + (i % 3) * 280;
      const y = 150 + Math.floor(i / 3) * 540;
      const lean = (pen.rand() - 0.5) * (40 + skill * 120);
      pen.ellipse(x + lean * 0.3, y, 30, 38, 2.4);
      pen.line([x + lean * 0.3, y + 38], [x + lean, y + 200], 2.6 + skill * 2.4);
      pen.line([x + lean, y + 200], [x + lean - 50, y + 400], 2.6);
      pen.line([x + lean, y + 200], [x + lean + 60, y + 400], 2.6 + skill * 2);
      pen.line([x + lean * 0.5, y + 80], [x - 80, y + 210], 2);
      pen.line([x + lean * 0.5, y + 80], [x + 100, y + 190], 2);
      if (skill > 0.5) pen.hatch([[x - 60, y + 400], [x + 130, y + 396], [x + 170, y + 424], [x - 20, y + 430]], 5, 0.1, 2);
    }
  },
  study(pen, skill) {
    for (let i = 0; i < 5; i++) {
      const cell: Point[] = [[90 + i * 150, 120], [220 + i * 150, 120], [220 + i * 150, 250], [90 + i * 150, 250]];
      pen.poly(cell, 1.8);
      if (i > 0) pen.hatch(cell, 22 - i * 4.4);
    }
    box(pen, 110, 470, 130, skill);
    box(pen, 500, 420, 100, skill);
    cup(pen, 300, 860, 70, skill);
    cup(pen, 620, 880, 56, skill);
  },
  watercolor(pen, skill) {
    const { ctx } = pen;
    const wash = (color: string, pts: Point[], alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      pen.fill(pts);
      ctx.restore();
    };
    wash('#2c3ea0', [[40, 60], [860, 60], [860, 430], [40, 470]], 0.28);
    wash('#8c4c2c', [[120, 470], [520, 440], [520, 900], [120, 930]], 0.5);
    wash('#c4943a', [[520, 440], [820, 460], [820, 880], [520, 900]], 0.45);
    if (skill > 0.5) wash('#3a3a52', [[520, 900], [820, 880], [880, 1010], [330, 1040]], 0.6);
    ctx.fillStyle = INK;
    pen.poly([[120, 470], [520, 440], [520, 900], [120, 930]], 2.4 + skill * 2);
    pen.poly([[520, 440], [820, 460], [820, 880], [520, 900]], 2);
    for (let r = 0; r < 3; r++) pen.poly([[180, 540 + r * 120], [300, 532 + r * 120], [300, 610 + r * 120], [180, 618 + r * 120]], 1.6);
  },
};

function drawDemoSketch(subject: SubjectId, skill: number, seed: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#efe8da';
  ctx.fillRect(0, 0, W, H);
  // Uneven phone-photo lighting across the page.
  const glow = ctx.createRadialGradient(W * 0.35, H * 0.3, 80, W * 0.5, H * 0.5, H * 0.85);
  glow.addColorStop(0, 'rgba(255,252,244,0.55)');
  glow.addColorStop(1, 'rgba(120,108,90,0.22)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  MOTIFS[subject](new Pen(ctx, rng(seed)), skill);
  return canvas;
}

interface DemoSpec {
  daysAgo: number;
  subject: SubjectId;
  medium: MediumId;
  location: string;
  feeling?: string;
  minutes: number;
  baseline?: boolean;
  focus: WeaknessId[];
  ratings: Partial<Record<WeaknessId, Rating>>;
  note?: string;
}

const DEMO: readonly DemoSpec[] = [
  { daysAgo: 128, subject: 'urban', medium: 'ink', location: 'Park bench', minutes: 30, baseline: true, focus: [], ratings: { 'cast-shadows': 0, 'line-weight': 0, 'true-darks': 0, intent: 0 }, note: 'The bench is floating.' },
  { daysAgo: 121, subject: 'still-life', medium: 'ink', location: 'Home', minutes: 20, baseline: true, focus: [], ratings: { ellipses: 0, 'cast-shadows': 0, 'light-planes': 1, intent: 0 } },
  { daysAgo: 109, subject: 'study', medium: 'ink', location: 'Home', minutes: 20, focus: ['light-planes'], ratings: { 'light-planes': 1, 'cast-shadows': 1, ellipses: 0, 'true-darks': 0 } },
  { daysAgo: 96, subject: 'interior', medium: 'ink', location: 'Café', feeling: 'quiet', minutes: 45, focus: ['ellipses'], ratings: { ellipses: 1, background: 0, 'line-weight': 0, intent: 1 } },
  { daysAgo: 84, subject: 'gesture', medium: 'ink', location: 'On the train', feeling: 'restless', minutes: 10, baseline: true, focus: ['figures'], ratings: { figures: 0, 'line-weight': 1, intent: 1 } },
  { daysAgo: 71, subject: 'urban', medium: 'ink', location: '135th St B/C Station', feeling: 'anonymous', minutes: 30, focus: ['cast-shadows'], ratings: { 'cast-shadows': 1, foliage: 0, 'true-darks': 1, background: 0 } },
  { daysAgo: 58, subject: 'watercolor', medium: 'ink-watercolor', location: 'Home', feeling: 'home', minutes: 45, focus: ['highlights'], ratings: { highlights: 0, 'cast-shadows': 1, background: 1, intent: 1 }, note: 'Ink bled. Dye cartridge.' },
  { daysAgo: 44, subject: 'still-life', medium: 'ink', location: 'Café', feeling: 'tender', minutes: 20, focus: ['ellipses'], ratings: { ellipses: 2, 'cast-shadows': 1, 'light-planes': 2, 'true-darks': 1 } },
  { daysAgo: 37, subject: 'gesture', medium: 'ink', location: 'On the train', feeling: 'tired', minutes: 10, focus: ['figures'], ratings: { figures: 1, 'line-weight': 1, intent: 1 } },
  { daysAgo: 29, subject: 'urban', medium: 'ink', location: 'Park bench', feeling: 'cold', minutes: 30, focus: ['foliage'], ratings: { foliage: 1, 'cast-shadows': 2, 'line-weight': 1, background: 1 } },
  { daysAgo: 20, subject: 'portrait', medium: 'ink', location: 'Café', feeling: 'tender', minutes: 30, baseline: true, focus: ['true-darks'], ratings: { 'true-darks': 1, 'line-weight': 2, background: 1, figures: 1 } },
  { daysAgo: 9, subject: 'interior', medium: 'ink', location: 'On the train', feeling: 'together but alone', minutes: 45, focus: ['true-darks'], ratings: { 'true-darks': 2, 'line-weight': 2, figures: 1, intent: 2 }, note: 'Finally filled the windows black.' },
  { daysAgo: 5, subject: 'urban', medium: 'ink', location: '135th St B/C Station', feeling: 'anonymous', minutes: 30, focus: ['background'], ratings: { 'cast-shadows': 2, foliage: 1, background: 2, highlights: 1 } },
  { daysAgo: 2, subject: 'still-life', medium: 'ink-watercolor', location: 'Home', feeling: 'home', minutes: 30, focus: ['highlights'], ratings: { ellipses: 2, highlights: 1, 'cast-shadows': 2, intent: 2 } },
];

const DEMO_DRILLS: readonly { id: string; ratings: readonly [number, DrillRating][] }[] = [
  { id: 'cast-shadow-five', ratings: [[40, 'harder'], [38, 'right'], [33, 'right'], [20, 'right']] },
  { id: 'gesture-session', ratings: [[30, 'right'], [25, 'right'], [12, 'easier']] },
  { id: 'hatching-gradation', ratings: [[50, 'easier'], [36, 'easier']] },
  { id: 'commit-blacks', ratings: [[10, 'harder'], [8, 'right']] },
];

/** Fill the app with generated placeholder pages so every screen can be seen populated. */
export async function loadDemoData(): Promise<void> {
  const today = toDateKey(new Date());
  const ids: string[] = [];
  for (const [index, spec] of DEMO.entries()) {
    const skill = index / (DEMO.length - 1);
    const { imageId, thumbId } = await storePhoto(drawDemoSketch(spec.subject, skill, 1000 + index * 37), { demo: true });
    const date = addDays(today, -spec.daysAgo);
    const items = Object.entries(spec.ratings).map(([weaknessId, rating], i) => ({
      weaknessId: weaknessId as WeaknessId,
      prompt: WEAKNESSES.find((w) => w.id === weaknessId)!.prompts[index % 2]!,
      rating: rating as Rating,
      ...(i === 0 && spec.note ? { note: spec.note } : {}),
    }));
    const entry: Entry = {
      id: newId('demo'),
      createdAt: `${date}T16:${String(10 + index).padStart(2, '0')}:00.000Z`,
      date,
      imageId,
      thumbId,
      subject: spec.subject,
      medium: spec.medium,
      minutes: spec.minutes,
      location: spec.location,
      weaknessIds: spec.focus,
      baseline: spec.baseline ?? false,
      reflection: { at: `${date}T16:40:00.000Z`, items },
      demo: true,
      ...(spec.feeling ? { feeling: spec.feeling } : {}),
    };
    await putEntry(entry);
    ids.push(entry.id);
  }

  const states = await getDrillStates();
  for (const demo of DEMO_DRILLS) {
    let state = states.get(demo.id) ?? initialDrillState(demo.id, today);
    for (const [daysAgo, rating] of demo.ratings) state = reviewDrill(state, rating, addDays(today, -daysAgo), { demo: true });
    await putDrillState(state);
  }

  const template = PROJECT_TEMPLATES[0]!;
  const project: Project = {
    id: newId('demo-project'),
    templateId: template.id,
    title: template.title,
    brief: template.brief,
    feeling: template.feeling,
    weaknessIds: [...template.weaknessIds],
    targets: [...template.targets],
    stages: PROJECT_STAGES.map((s, i) => ({ key: s.key, done: i < 2, ...(i === 0 ? { note: 'Third thumbnail: knees big, strangers small.' } : {}) })),
    entryIds: ids.slice(11, 12),
    createdAt: new Date().toISOString(),
    demo: true,
  };
  await putProject(project);
  await saveSettings({ demoLoaded: true });
}
