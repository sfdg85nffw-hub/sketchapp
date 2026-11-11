import { captureSketch, expect, start, test } from './helpers';

test('works with the network off after the first load', async ({ page, context }) => {
  await start(page);

  // First load installs the service worker and precaches the whole app.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    }
  });

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Journal', level: 1 })).toBeVisible();

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
