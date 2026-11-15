import { expect, start, test } from './helpers';

/*
 * The fake camera runs at 30 fps, like a phone's, and the live view processes each
 * camera frame once, so this asks whether it keeps up with the camera. It runs in its
 * own Playwright project after every other test, so the 3D render tests cannot starve
 * it of CPU, and counts inside the page over two seconds, so the test's own
 * round-trips do not count against it.
 */
test('the live value camera keeps up at 24 frames a second or more', async ({ page }) => {
  await start(page);
  await page.getByRole('link', { name: 'See' }).click();
  await page.getByRole('button', { name: 'Start live view' }).click();
  const canvas = page.getByTestId('live-canvas');
  await expect.poll(async () => Number(await canvas.getAttribute('data-frames')), { timeout: 15_000 }).toBeGreaterThan(30);

  const fps = await canvas.evaluate(async (el: HTMLCanvasElement) => {
    const count = () => Number(el.dataset.frames ?? 0);
    const first = count();
    const t0 = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return ((count() - first) * 1000) / (performance.now() - t0);
  });
  // Logged so a CI run shows the headroom, not just pass or fail.
  console.log(`live value view: ${fps.toFixed(1)} frames a second`);
  expect(fps).toBeGreaterThanOrEqual(24);
});
