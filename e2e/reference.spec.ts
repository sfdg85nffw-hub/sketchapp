import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';
import { canvasGreys, expect, SKETCH, start, test, toast } from './helpers';

/** Open a mode's setup screen, choose the source and a short timer, and start. */
async function startMode(page: Page, mode: string, options: { source?: string; seconds?: number; count?: number } = {}): Promise<void> {
  await page.goto(`/#/ref/${mode}`);
  if (options.source) await page.getByRole('radiogroup', { name: 'Reference source' }).getByRole('radio', { name: options.source }).click();
  if (options.seconds) await page.getByRole('slider', { name: 'Seconds per image' }).fill(String(options.seconds));
  if (options.count) {
    const now = Number(await page.getByTestId('ref-count').textContent());
    for (let i = now; i > options.count; i--) await page.getByRole('button', { name: 'Fewer images' }).click();
  }
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByTestId('ref-player')).toBeVisible();
}

async function waitForPicture(page: Page): Promise<void> {
  await expect(page.getByTestId('ref-canvas')).toHaveAttribute('data-rendered', /.+/, { timeout: 30_000 });
}

const title = (page: Page) => page.getByTestId('ref-title');

test.describe('timed reference', () => {
  test('the Practice tab leads to the mode picker, with every mode as a labelled tile', async ({ page }) => {
    await start(page);
    await page.getByRole('link', { name: 'Practice' }).click();
    await page.getByRole('link', { name: /Timed reference/ }).click();
    const grid = page.getByRole('list', { name: 'What to draw' });
    for (const label of ['Faces', 'Poses', 'Shapes', 'Skull', 'Hands & Feet', 'Urban Thumbnails', 'Mirror', 'My References']) {
      await expect(grid.getByRole('link', { name: new RegExp(`^${label.replace('&', '\\&')}`) })).toBeVisible();
    }
    for (const tile of await grid.getByRole('link').all()) expect((await tile.boundingBox())!.height).toBeGreaterThanOrEqual(48);
    await expect(page.getByRole('heading', { name: 'Class sessions' })).toBeVisible();
    await expect(page.getByText('10 × 30s, then 5 × 1m, then 2 × 5m')).toBeVisible();
  });

  test('a Faces photo session on a 5 second timer advances, pauses and resumes', async ({ page }) => {
    await start(page);
    await startMode(page, 'faces', { source: 'Photos', seconds: 5, count: 3 });
    await waitForPicture(page);
    await expect(page.getByText('Faces · 1 of 3')).toBeVisible();
    const first = await title(page).textContent();
    await expect(page.getByText(/Faces · 2 of 3/)).toBeVisible({ timeout: 10_000 });
    await waitForPicture(page);
    await expect(title(page)).not.toHaveText(first!);

    await page.getByTestId('ref-pause').click();
    await expect(page.getByText('Faces · 2 of 3 · paused')).toBeVisible();
    const held = await page.getByTestId('ref-countdown').textContent();
    await page.waitForTimeout(2_000);
    await expect(page.getByTestId('ref-countdown')).toHaveText(held!);
    await page.getByTestId('ref-pause').click();
    await expect(page.getByText('Faces · 2 of 3 · paused')).toBeHidden();
    await expect(page.getByText(/Faces · 3 of 3/)).toBeVisible({ timeout: 10_000 });
  });

  test('ending a session shows a contact sheet with attribution, then files the page in the journal', async ({ page }) => {
    await start(page);
    await startMode(page, 'faces', { source: 'Photos', seconds: 30, count: 5 });
    await waitForPicture(page);
    await page.getByTestId('ref-skip').click();
    await waitForPicture(page);
    await page.getByTestId('ref-end').click();

    await expect(page.getByRole('heading', { name: '2 images done' })).toBeVisible();
    const sheet = page.getByRole('list', { name: 'What you drew from' });
    await expect(sheet.getByRole('listitem')).toHaveCount(2);
    await expect(sheet.getByRole('listitem').first()).toContainText(/(CC0|Public domain|CC BY)/);

    await page.getByRole('button', { name: /^Right/ }).click();
    await expect(toast(page, /comes round again/)).toBeVisible();

    await page.locator('label', { hasText: 'Photograph your page' }).locator('input').setInputFiles(SKETCH);
    await expect(page.getByRole('heading', { name: 'New entry' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Subject' }).getByRole('button', { name: 'Portrait' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Save to journal' }).click();
    await page.getByRole('button', { name: 'Skip for now' }).click();
    await expect(page.getByRole('list', { name: 'Details' })).toContainText('Faces · 5 × 30s');
  });

  test('Shapes renders a seeded scene and the value toggle posterizes it', async ({ page }) => {
    await start(page);
    await startMode(page, 'shapes', { seconds: 60 });
    await waitForPicture(page);
    await expect(page.getByText(/^Seed \d+$/)).toBeVisible();
    const canvas = page.getByTestId('ref-canvas');
    expect((await canvasGreys(canvas)).levels.length).toBeGreaterThan(20);
    await page.getByTestId('ref-values').click();
    await expect(canvas).toHaveAttribute('data-rendered', 'steps-2');
    expect((await canvasGreys(canvas)).levels).toEqual([0, 255]);
    await page.getByTestId('ref-values').click();
    await expect(canvas).toHaveAttribute('data-rendered', 'steps-3');
    expect((await canvasGreys(canvas)).levels.length).toBeLessThanOrEqual(3);

    await page.getByRole('button', { name: 'More options' }).click();
    await page.getByRole('checkbox', { name: /terminator/ }).check();
    await page.getByRole('button', { name: 'Same scene, new light' }).click();
    await waitForPicture(page);
    await expect(page.locator('.ref-overlay').first()).toBeVisible();
  });

  test('the 3D head, the mannequin and the skull each render a picture', async ({ page }) => {
    test.slow();
    await start(page);
    for (const [mode, source] of [['faces', '3D heads'], ['poses', 'Mannequin'], ['skull', undefined]] as const) {
      await startMode(page, mode, { source, seconds: 60 });
      await waitForPicture(page);
      const levels = (await canvasGreys(page.getByTestId('ref-canvas'))).levels;
      // A real render has a spread of values, not a blank frame.
      expect(levels.length).toBeGreaterThan(20);
      await expect(title(page)).not.toHaveText('Loading…');
      await page.getByTestId('ref-end').click();
      await expect(page.getByRole('heading', { name: /1 image done/ })).toBeVisible();
    }
  });

  test('guess the light reveals the answer and how far off the guess was', async ({ page }) => {
    await start(page);
    await page.goto('/#/ref/skull');
    await page.getByRole('button', { name: 'More options' }).click();
    await page.getByRole('checkbox', { name: /Guess the light/ }).check();
    await page.getByRole('button', { name: 'Done' }).click();
    await page.getByRole('slider', { name: 'Seconds per image' }).fill('5');
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    await waitForPicture(page);
    await expect(title(page)).toHaveText('Where is the light?');
    const dial = page.getByRole('radiogroup', { name: 'Guess the light direction' });
    await expect(dial).toBeVisible({ timeout: 10_000 });
    await dial.getByRole('radio', { name: 'Light from upper left' }).click();
    await expect(page.getByText(/You were \d+° off/)).toBeVisible();
    await page.getByRole('button', { name: 'Next image' }).click();
    await page.getByTestId('ref-end').click();
    await page.goto('/#/ref');
    await expect(page.getByText(/Guess the light:\s*1 guess/)).toBeVisible();
  });

  test('My References imports photos and runs a session from them', async ({ page }) => {
    await start(page);
    await page.goto('/#/ref');
    await page.getByTestId('myref-input').setInputFiles([SKETCH, SKETCH]);
    await expect(toast(page, '2 photos added.')).toBeVisible();
    await startMode(page, 'mine', { seconds: 30 });
    await waitForPicture(page);
    await expect(title(page)).toHaveText('Your photo');
  });

  test('Make available offline saves a photo pack into the offline cache', async ({ page }) => {
    test.slow();
    await start(page);
    await page.goto('/#/ref');
    const pack = page.getByTestId('pack-urban');
    await expect(pack).toContainText('Not saved offline');
    await pack.getByRole('button', { name: 'Make available offline' }).click();
    await expect(pack).toContainText('On this phone', { timeout: 60_000 });
    const cached = await page.evaluate(async () => (await (await caches.open('sbc-packs-v1')).keys()).length);
    expect(cached).toBeGreaterThan(20);
    await pack.getByRole('button', { name: 'Remove from this phone' }).click();
    await expect(pack).toContainText('Not saved offline');
  });

  test('no screen in Timed Reference signals with red or green', async ({ page }) => {
    await start(page);
    for (const theme of ['Light', 'Dark']) {
      await page.goto('/#/settings');
      await page.getByRole('radiogroup', { name: 'Theme' }).getByRole('radio', { name: theme }).click();
      for (const route of ['/ref', '/ref/faces', '/ref/shapes', '/gesture']) {
        await page.goto(`/#${route}`);
        await expect(page.locator('main')).toBeVisible();
        const offenders = await page.evaluate(() => {
          const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
          const hues: string[] = [];
          for (const el of document.querySelectorAll<HTMLElement>('body *')) {
            if (el.closest('canvas, img, svg.ref-ring')) continue;
            const style = getComputedStyle(el);
            for (const value of [style.color, style.backgroundColor, style.borderTopColor]) {
              const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(value);
              if (!m || m[4] === '0') continue;
              const [r, g, b] = [m[1], m[2], m[3]].map((v) => lin(Number(v) / 255));
              const x = 0.4124 * r! + 0.3576 * g! + 0.1805 * b!;
              const y = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
              const z = 0.0193 * r! + 0.1192 * g! + 0.9505 * b!;
              const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
              const a = 500 * (f(x / 0.95047) - f(y));
              const bb = 200 * (f(y) - f(z / 1.08883));
              const chroma = Math.hypot(a, bb);
              const hue = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
              // Anything clearly coloured must sit in the blue range; reds, oranges and greens are out.
              if (chroma > 16 && !(hue > 230 && hue < 310)) hues.push(`${el.tagName}.${el.className} ${value}`);
            }
          }
          return hues;
        });
        expect(offenders, `${theme} #${route}`).toEqual([]);
      }
    }
  });
});

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.glb': 'model/gltf-binary',
  '.bin': 'application/octet-stream',
  '.webmanifest': 'application/manifest+json',
};

async function serveDist(): Promise<{ url: string; stop: () => Promise<void> }> {
  const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
  const server = createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    const file = path.join(dist, pathname.endsWith('/') ? `${pathname}index.html` : pathname);
    readFile(file).then(
      (body) => {
        response.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
        response.end(body);
      },
      () => {
        response.writeHead(404);
        response.end();
      },
    );
  });
  await new Promise<void>((resolve) => server.listen(0, 'localhost', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://localhost:${port}/`,
    stop: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}

test('with the network gone, every mode works except a photo pack that was never saved', async ({ page }) => {
  test.slow();
  const site = await serveDist();
  await page.goto(site.url);
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    }
  });
  // Save one pack while online.
  await page.goto(`${site.url}#/ref`);
  await page.getByTestId('pack-urban').getByRole('button', { name: 'Make available offline' }).click();
  await expect(page.getByTestId('pack-urban')).toContainText('On this phone', { timeout: 60_000 });

  await site.stop();
  await page.reload();
  const run = async (mode: string, source?: string) => {
    await page.goto(`${site.url}#/ref/${mode}`);
    if (source) await page.getByRole('radiogroup', { name: 'Reference source' }).getByRole('radio', { name: source }).click();
    await page.getByRole('button', { name: 'Start', exact: true }).click();
  };
  for (const [mode, source] of [['urban', undefined], ['shapes', undefined], ['skull', undefined], ['faces', '3D heads'], ['poses', 'Mannequin']] as const) {
    await run(mode, source);
    await expect(page.getByTestId('ref-canvas')).toHaveAttribute('data-rendered', /.+/, { timeout: 30_000 });
    await page.getByTestId('ref-end').click();
  }
  await run('life');
  await expect(page.getByTestId('ref-countdown')).toBeVisible();
  await page.getByTestId('ref-end').click();

  // A pack that was never saved says so plainly.
  await run('hands');
  await expect(page.getByRole('alert')).toContainText("This pack isn't on this phone yet");
});

test('timed reference makes no requests to any other origin', async ({ page }) => {
  const foreign: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.host !== 'localhost:4173' && !['blob:', 'data:'].includes(url.protocol)) foreign.push(request.url());
  });
  await start(page);
  for (const [mode, source] of [['faces', 'Photos'], ['poses', 'Mannequin'], ['shapes', undefined], ['skull', undefined]] as const) {
    await startMode(page, mode, { source, seconds: 60 });
    await waitForPicture(page);
    await page.getByTestId('ref-end').click();
  }
  expect(foreign).toEqual([]);
});
