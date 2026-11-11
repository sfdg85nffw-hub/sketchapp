import { canvasGreys, expect, REFERENCE, saveSketch, SKETCH, start, tapAt, test } from './helpers';

/*
 * The fixture "sketch" is paper (L* about 93) with a black block, a mid-grey block
 * (L* about 51), an ultramarine patch and a burnt-sienna patch, so the expected
 * output of each tool is known exactly.
 */

test.describe('value tools on a captured photo', () => {
  test.beforeEach(async ({ page }) => {
    await start(page);
    await saveSketch(page);
  });

  test('value map posterizes to exactly 2, 3 or 5 greys', async ({ page }) => {
    const canvas = page.getByTestId('tool-canvas');
    await page.getByRole('group', { name: 'View' }).getByRole('button', { name: 'Value map' }).click();

    await expect(canvas).toHaveAttribute('data-rendered', 'steps-3');
    let greys = await canvasGreys(canvas);
    expect(greys.neutral).toBe(true);
    expect(greys.levels).toHaveLength(3);
    expect(greys.levels[0]).toBe(0);
    expect(greys.levels[2]).toBe(255);

    const steps = page.getByRole('radiogroup', { name: 'Number of values' });
    await steps.getByRole('radio', { name: /2/ }).click();
    await expect(canvas).toHaveAttribute('data-rendered', 'steps-2');
    greys = await canvasGreys(canvas);
    expect(greys.levels).toEqual([0, 255]);

    await steps.getByRole('radio', { name: /5/ }).click();
    await expect(canvas).toHaveAttribute('data-rendered', 'steps-5');
    greys = await canvasGreys(canvas);
    expect(greys.neutral).toBe(true);
    expect(greys.levels.length).toBeGreaterThanOrEqual(4);
    expect(greys.levels.length).toBeLessThanOrEqual(5);
  });

  test('grayscale uses perceptual lightness: neutral pixels, blue darker than grey', async ({ page }) => {
    const canvas = page.getByTestId('tool-canvas');
    await page.getByRole('group', { name: 'View' }).getByRole('button', { name: 'Grayscale' }).click();
    await expect(canvas).toHaveAttribute('data-rendered', 'steps-0');
    const greys = await canvasGreys(canvas);
    expect(greys.neutral).toBe(true);
    expect(greys.levels.length).toBeGreaterThan(5);

    const sample = (fx: number, fy: number) =>
      canvas.evaluate(
        (c, [x, y]) => {
          const el = c as HTMLCanvasElement;
          return el.getContext('2d')!.getImageData(Math.round(el.width * x!), Math.round(el.height * y!), 1, 1).data[0]!;
        },
        [fx, fy],
      );
    const grey = await sample(0.667, 0.333);
    const blue = await sample(0.208, 0.778);
    // #7a7a7a stays itself; ultramarine (L* about 32) must come out clearly darker.
    expect(Math.abs(grey - 0x7a)).toBeLessThanOrEqual(3);
    expect(blue).toBeLessThan(grey - 30);
  });

  test('squint, passerby and mirror flip change how the photo is shown', async ({ page }) => {
    const view = page.getByRole('group', { name: 'View' });
    const canvas = page.getByTestId('tool-canvas');

    await view.getByRole('button', { name: 'Squint' }).click();
    await expect(canvas).toHaveCSS('filter', /blur\(6px\)/);
    await page.getByRole('slider', { name: /Squint/ }).fill('12');
    await expect(canvas).toHaveCSS('filter', /blur\(12px\)/);

    await view.getByRole('button', { name: 'Passerby' }).click();
    await expect(page.getByText('What reads at a glance?')).toBeVisible();
    expect((await canvas.boundingBox())!.width).toBeLessThan(130);

    const flip = page.getByRole('button', { name: 'Mirror flip' });
    await flip.click();
    await expect(page.getByRole('button', { name: /Mirrored/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.flip')).toHaveCount(1);
  });

  test('compare shows sketch and reference at the same number of values', async ({ page }) => {
    await page.getByRole('group', { name: 'View' }).getByRole('button', { name: 'Compare' }).click();
    await expect(page.getByText('Add a photo of the scene to check your values against reality.')).toBeVisible();
    await page.getByTestId('reference-input').setInputFiles(REFERENCE);

    const sketch = page.getByTestId('compare-sketch');
    const reference = page.getByTestId('compare-reference');
    await expect(sketch).toHaveAttribute('data-rendered', 'steps-3');
    await expect(reference).toHaveAttribute('data-rendered', 'steps-3');
    expect((await canvasGreys(reference)).levels).toHaveLength(3);

    await page.getByRole('radiogroup', { name: 'Number of values' }).getByRole('radio', { name: /2/ }).click();
    await expect(sketch).toHaveAttribute('data-rendered', 'steps-2');
    await expect(reference).toHaveAttribute('data-rendered', 'steps-2');
    expect((await canvasGreys(reference)).levels).toEqual([0, 255]);

    // The reference is kept with the entry.
    await page.reload();
    await page.getByRole('group', { name: 'View' }).getByRole('button', { name: 'Compare' }).click();
    await expect(page.getByTestId('compare-reference')).toHaveAttribute('data-rendered', 'steps-3');
  });

  test('color identifier names a tapped patch, with temperature, value and closest paint', async ({ page }) => {
    await page.getByRole('group', { name: 'View' }).getByRole('button', { name: 'Identify color' }).click();
    const canvas = page.getByTestId('tool-canvas');
    const reading = page.getByTestId('color-reading');

    await tapAt(canvas, 0.208, 0.778);
    await expect(reading).toContainText('deep blue (like ultramarine)');
    await expect(reading).toContainText('Cool');
    await expect(reading).toContainText(/Value\s*7 of 10/);
    await expect(reading).toContainText('Ultramarine');
    await expect(reading).not.toContainText('confusable zone');

    await tapAt(canvas, 0.542, 0.778);
    await expect(reading).toContainText('warm brown (like burnt sienna)');
    await expect(reading).toContainText('Warm');
    await expect(reading).toContainText('Burnt Sienna');
    await expect(reading).toContainText('In your confusable zone.');

    await tapAt(canvas, 0.667, 0.333);
    await expect(reading).toContainText('mid grey');
    await expect(reading).toContainText('Neutral');

    // Uncalibrated, the warm paper reads as cream. Calibrated on it, it is white, value 1.
    await tapAt(canvas, 0.917, 0.944);
    await expect(reading).toContainText(/Value\s*1 of 10/);
    await page.getByRole('button', { name: 'Calibrate on white paper' }).click();
    await expect(page.getByText('Now tap a clean, bare area of the paper.')).toBeVisible();
    await tapAt(canvas, 0.917, 0.944);
    await expect(page.getByRole('button', { name: 'Recalibrate on white paper' })).toBeVisible();
    await tapAt(canvas, 0.917, 0.1);
    await expect(reading).toContainText('white (bare paper)');
    await expect(reading).toContainText('Neutral');
    await expect(page.getByText(/Phone cameras shift color/)).toBeVisible();
  });
});

test('the See tab offers the same tools on a photo without saving it', async ({ page }) => {
  await start(page);
  await page.getByRole('link', { name: 'See' }).click();
  await page.getByTestId('values-input').first().setInputFiles(SKETCH);
  const canvas = page.getByTestId('tool-canvas');
  await expect(canvas).toHaveAttribute('data-rendered', 'steps-3');
  expect((await canvasGreys(canvas)).levels).toHaveLength(3);
  await page.getByRole('link', { name: 'Journal' }).click();
  await expect(page.getByRole('heading', { name: 'No pages yet' })).toBeVisible();
});

test('live value camera posterizes the feed, or falls back gracefully', async ({ page, browserName }) => {
  await start(page);
  await page.getByRole('link', { name: 'See' }).click();
  const startButton = page.getByRole('button', { name: 'Start live view' });
  const fallback = page.getByTestId('camera-fallback');
  await expect(startButton.or(fallback)).toBeVisible();

  if (browserName !== 'chromium') {
    // No camera in this engine's test build. Whatever the camera does, the same
    // tools must stay one tap away on a photo.
    if (await startButton.isVisible()) await startButton.click();
    await page.getByTestId('values-input').last().setInputFiles(SKETCH);
    await expect(page.getByTestId('tool-canvas')).toHaveAttribute('data-rendered', 'steps-3');
    return;
  }

  await startButton.click();
  const canvas = page.getByTestId('live-canvas');
  await expect.poll(async () => Number(await canvas.getAttribute('data-frames')), { timeout: 15_000 }).toBeGreaterThan(5);
  expect((await canvasGreys(canvas)).levels.length).toBeLessThanOrEqual(3);

  // Frame rate over one second of the fake camera feed.
  const first = Number(await canvas.getAttribute('data-frames'));
  await page.waitForTimeout(1000);
  const fps = Number(await canvas.getAttribute('data-frames')) - first;
  expect(fps).toBeGreaterThanOrEqual(24);

  await page.getByRole('radiogroup', { name: 'Number of values' }).getByRole('radio', { name: /2/ }).click();
  await expect.poll(async () => (await canvasGreys(canvas)).levels.length).toBeLessThanOrEqual(2);

  await page.getByRole('button', { name: 'Freeze and identify a color' }).click();
  await expect(page.getByTestId('tool-canvas')).toHaveAttribute('data-rendered', 'original');
  await tapAt(page.getByTestId('tool-canvas'), 0.5, 0.5);
  await expect(page.getByTestId('color-reading')).toContainText(/of 10/);
});
