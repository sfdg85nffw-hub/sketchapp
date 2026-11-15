// Builds nothing itself: run `npm run build` first, then `npm run screenshots`.
// Serves dist/, loads the demo data, and photographs the main screens at iPhone 14
// size in both themes, plus two screens through simulated deuteranopia and protanopia.
import { chromium, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { preview } from 'vite';
import { MACHADO_MATRICES, type CvdType } from '../src/lib/color/cvd';

const OUT = 'docs/screenshots';
const PORT = 4179;
const BASE = `http://localhost:${PORT}`;

interface Shot {
  name: string;
  go: (page: Page) => Promise<void>;
}

const openFirstEntry = async (page: Page) => {
  await page.goto(`${BASE}/#/journal`);
  await page.locator('a.thumb').nth(1).click();
  await page.getByTestId('tool-canvas').waitFor();
};

const SHOTS: readonly Shot[] = [
  { name: 'journal', go: (page) => page.goto(`${BASE}/#/journal`).then(() => undefined) },
  {
    name: 'value-map',
    go: async (page) => {
      await openFirstEntry(page);
      await page.getByRole('group', { name: 'View' }).getByRole('button', { name: 'Value map' }).click();
    },
  },
  {
    name: 'identify-color',
    go: async (page) => {
      await page.goto(`${BASE}/#/journal`);
      await page.locator('a.thumb', { hasText: 'Home' }).nth(1).click();
      await page.getByRole('group', { name: 'View' }).getByRole('button', { name: 'Identify color' }).click();
      const canvas = page.getByTestId('tool-canvas');
      const box = (await canvas.boundingBox())!;
      await canvas.click({ position: { x: box.width * 0.33, y: box.height * 0.6 } });
      await page.getByTestId('color-reading').scrollIntoViewIfNeeded();
    },
  },
  {
    name: 'reflection',
    go: async (page) => {
      await openFirstEntry(page);
      await page.getByRole('button', { name: 'Edit reflection' }).click();
      await page.getByRole('heading', { name: '60-second reflection' }).waitFor();
    },
  },
  { name: 'practice', go: (page) => page.goto(`${BASE}/#/practice`).then(() => undefined) },
  { name: 'drill', go: (page) => page.goto(`${BASE}/#/drill/cast-shadow-five`).then(() => undefined) },
  { name: 'plan', go: (page) => page.goto(`${BASE}/#/plan`).then(() => undefined) },
  { name: 'palette-lab', go: (page) => page.goto(`${BASE}/#/palette`).then(() => undefined) },
  {
    name: 'progress',
    go: async (page) => {
      await page.goto(`${BASE}/#/progress`);
      await page.getByRole('heading', { name: 'Skill trends' }).scrollIntoViewIfNeeded();
    },
  },
  { name: 'ref-home', go: (page) => page.goto(`${BASE}/#/ref`).then(() => undefined) },
  { name: 'ref-setup', go: (page) => page.goto(`${BASE}/#/ref/faces`).then(() => undefined) },
  ...(
    [
      ['faces-photos', 'faces', 'Photos'],
      ['faces-3d', 'faces', '3D heads'],
      ['poses-photos', 'poses', 'Photos'],
      ['poses-mannequin', 'poses', 'Mannequin'],
      ['shapes', 'shapes', undefined],
      ['skull', 'skull', undefined],
      ['hands', 'hands', undefined],
      ['urban', 'urban', undefined],
      ['mine', 'mine', undefined],
      ['life', 'life', undefined],
    ] as const
  ).map(([name, mode, source]) => ({
    name: `ref-${name}`,
    go: async (page: Page) => {
      await page.goto(`${BASE}/#/ref/${mode}`);
      if (source) await page.getByRole('radiogroup', { name: 'Reference source' }).getByRole('radio', { name: source }).click();
      await page.getByRole('button', { name: 'Start', exact: true }).click();
      if (mode !== 'life') await page.locator('[data-testid="ref-canvas"][data-rendered]').waitFor({ timeout: 60_000 });
      await page.waitForTimeout(mode === 'life' ? 2500 : 4200);
    },
  })),
  {
    name: 'ref-contact-sheet',
    go: async (page) => {
      await page.goto(`${BASE}/#/ref/faces`);
      await page.getByRole('radiogroup', { name: 'Reference source' }).getByRole('radio', { name: 'Photos' }).click();
      await page.getByRole('button', { name: 'Start', exact: true }).click();
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-testid="ref-canvas"][data-rendered]').waitFor({ timeout: 60_000 });
        await page.getByTestId(i < 2 ? 'ref-skip' : 'ref-end').click();
      }
      await page.getByRole('heading', { name: /images done/ }).waitFor();
    },
  },
  {
    name: 'then-now',
    go: async (page) => {
      await page.goto(`${BASE}/#/thennow`);
      await page.locator('.pair img').first().waitFor();
    },
  },
];

/** An SVG colour-matrix filter over the whole page. feColorMatrix works in linear RGB, as the Machado matrices expect. */
async function simulate(page: Page, type: CvdType | null): Promise<void> {
  const matrix = type ? MACHADO_MATRICES[type].map((row) => [...row, 0, 0].join(' ')).join(' ') + ' 0 0 0 1 0' : null;
  await page.evaluate((values) => {
    document.getElementById('cvd-filter')?.remove();
    document.documentElement.style.filter = '';
    if (!values) return;
    document.body.insertAdjacentHTML(
      'beforeend',
      `<svg id="cvd-filter" width="0" height="0" style="position:absolute"><filter id="cvd" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="${values}"/></filter></svg>`,
    );
    document.documentElement.style.filter = 'url(#cvd)';
  }, matrix);
}

mkdirSync(OUT, { recursive: true });
const server = await preview({ preview: { port: PORT, strictPort: true } });
const browser = await chromium.launch();

for (const scheme of ['light', 'dark'] as const) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(BASE);
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.goto(`${BASE}/#/settings`);
  await page.getByRole('button', { name: 'Load demo data' }).click();
  await page.getByRole('button', { name: 'Clear demo data' }).waitFor({ timeout: 60_000 });
  await page.locator('.toast').waitFor({ state: 'detached', timeout: 10_000 });
  await page.goto(`${BASE}/#/ref`);
  await page.getByTestId('myref-input').setInputFiles(['e2e/fixtures/sketch.jpg']);
  await page.locator('.toast').waitFor({ state: 'detached', timeout: 10_000 });

  for (const shot of SHOTS) {
    await shot.go(page);
    await page.waitForTimeout(500);
    await page.locator('.toast').waitFor({ state: 'detached', timeout: 10_000 });
    await page.screenshot({ path: `${OUT}/${shot.name}-${scheme}.jpg`, type: 'jpeg', quality: 82 });
    console.log(`wrote ${OUT}/${shot.name}-${scheme}.jpg`);
    if (scheme === 'light' && (shot.name === 'reflection' || shot.name === 'progress' || shot.name === 'palette-lab' || shot.name === 'ref-home' || shot.name === 'ref-shapes')) {
      for (const type of ['deuteranopia', 'protanopia'] as const) {
        await simulate(page, type);
        await page.screenshot({ path: `${OUT}/${shot.name}-${type}.jpg`, type: 'jpeg', quality: 82 });
        console.log(`wrote ${OUT}/${shot.name}-${type}.jpg`);
      }
      await simulate(page, null);
    }
  }
  await context.close();
}

await browser.close();
await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
