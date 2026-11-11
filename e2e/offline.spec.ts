import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { captureSketch, expect, start, test } from './helpers';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

/** A throwaway static server for dist/, so the test can take the network away for real. */
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

test('works with the network off after the first load', async ({ page }) => {
  const site = await serveDist();
  await page.goto(site.url);
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(page.getByRole('heading', { name: 'Journal', level: 1 })).toBeVisible();

  // First load installs the service worker and precaches the whole app.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    }
  });

  // Take the network away for real: the server is gone, so only the cache can answer.
  await site.stop();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Journal', level: 1 })).toBeVisible();
  await expect(page.locator('link[rel="stylesheet"]')).toHaveCount(1);
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');

  // Every tab still opens, and a capture still saves, with no network at all.
  await page.getByRole('link', { name: 'Practice' }).click();
  await expect(page.getByRole('heading', { name: "Today's practice" })).toBeVisible();
  await page.getByRole('link', { name: 'Progress' }).click();
  await expect(page.getByRole('heading', { name: 'Progress', level: 1 })).toBeVisible();

  await captureSketch(page);
  await page.getByRole('button', { name: 'Save to journal' }).click();
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.getByRole('group', { name: 'View' }).getByRole('button', { name: 'Value map' }).click();
  await expect(page.getByTestId('tool-canvas')).toHaveAttribute('data-rendered', 'steps-3');

  await page.reload();
  await expect(page.getByTestId('tool-canvas')).toHaveAttribute('data-rendered', 'original');
});

test('makes no network requests beyond its own origin', async ({ page }) => {
  const foreign: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['localhost:4173'].includes(url.host) && !['blob:', 'data:'].includes(url.protocol)) foreign.push(request.url());
  });
  await start(page);
  for (const route of ['practice', 'see', 'palette', 'progress', 'settings', 'materials', 'projects', 'drills']) {
    await page.goto(`/#/${route}`);
    await expect(page.locator('main h1')).toBeVisible();
  }
  expect(foreign).toEqual([]);
});

test('ships an installable manifest with icons and a standalone display', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifest = await (await request.get(new URL(href!, page.url()).href)).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBeTruthy();
  const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
  expect(sizes).toContain('192x192');
  expect(sizes).toContain('512x512');
  for (const icon of manifest.icons as { src: string }[]) {
    expect((await request.get(new URL(icon.src, new URL(href!, page.url())).href)).ok()).toBe(true);
  }
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/);
});
