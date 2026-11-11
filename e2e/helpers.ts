import { test as base, expect, type Locator, type Page } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const SKETCH = path.join(here, 'fixtures', 'sketch.jpg');
export const REFERENCE = path.join(here, 'fixtures', 'reference.jpg');

/**
 * The test browsers have no share sheet to drive, so exports take the app's
 * download path. On the phone the same code hands the file to the iOS share sheet.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }));
    await use(page);
  },
});

export { expect };

/** Open the app fresh and skip the welcome screens. */
export async function start(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(page.getByRole('heading', { name: 'Journal', level: 1 })).toBeVisible();
}

/** Tap Capture with the fixture photo and stop on the quick-entry screen. */
export async function captureSketch(page: Page): Promise<void> {
  await page.getByTestId('capture-input').setInputFiles(SKETCH);
  await expect(page.getByRole('heading', { name: 'New entry' })).toBeVisible();
  await expect(page.getByTestId('capture-preview')).toBeVisible();
}

/** Capture and save with defaults, skip the reflection, and land on the entry. */
export async function saveSketch(page: Page): Promise<void> {
  await captureSketch(page);
  await page.getByRole('button', { name: 'Save to journal' }).click();
  await expect(page.getByRole('heading', { name: '60-second reflection' })).toBeVisible();
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await expect(page.getByTestId('tool-canvas')).toHaveAttribute('data-rendered', 'original');
}

/** The set of distinct grey levels on a canvas, and whether every pixel is neutral. */
export async function canvasGreys(canvas: Locator): Promise<{ levels: number[]; neutral: boolean }> {
  return canvas.evaluate((element) => {
    const source = element as HTMLCanvasElement;
    // Copy through a 2D canvas so this also works for the WebGL live view.
    const copy = document.createElement('canvas');
    copy.width = source.width;
    copy.height = source.height;
    const ctx = copy.getContext('2d')!;
    ctx.drawImage(source, 0, 0);
    const { data } = ctx.getImageData(0, 0, copy.width, copy.height);
    const levels = new Set<number>();
    let neutral = true;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== data[i + 1] || data[i + 1] !== data[i + 2]) neutral = false;
      levels.add(data[i]!);
    }
    return { levels: [...levels].sort((a, b) => a - b), neutral };
  });
}

/** Tap a canvas at a position given as fractions of its width and height. */
export async function tapAt(canvas: Locator, fx: number, fy: number): Promise<void> {
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas is not visible');
  await canvas.click({ position: { x: box.width * fx, y: box.height * fy } });
}

/** No sideways scrolling: nothing on the screen is wider than the phone. */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main ? main.scrollWidth - main.clientWidth : 0;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

/** The brief confirmation message, matched by its text. */
export function toast(page: Page, text: string | RegExp): Locator {
  return page.locator('.toast').filter({ hasText: text });
}
