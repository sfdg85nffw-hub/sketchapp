import { captureSketch, expect, saveSketch, start, test } from './helpers';

test.describe('capture to journal', () => {
  test('photographs a page, rotates it, tags it, and files it under this month', async ({ page }) => {
    await start(page);
    await captureSketch(page);

    // The fixture is landscape; rotating makes it portrait.
    const preview = page.getByTestId('capture-preview');
    const before = await preview.evaluate((c) => (c as HTMLCanvasElement).width / (c as HTMLCanvasElement).height);
    expect(before).toBeGreaterThan(1);
    await page.getByRole('button', { name: 'Rotate right' }).click();
    await expect.poll(() => preview.evaluate((c) => (c as HTMLCanvasElement).width / (c as HTMLCanvasElement).height)).toBeLessThan(1);

    await page.getByRole('group', { name: 'Subject' }).getByRole('button', { name: 'Still life' }).click();
    await page.getByRole('group', { name: 'Feeling word' }).getByRole('button', { name: 'quiet' }).click();
    await page.getByRole('group', { name: 'Recent locations' }).getByRole('button', { name: '135th St B/C Station' }).click();
    await page.getByRole('group', { name: 'Minutes spent' }).getByRole('button', { name: '20', exact: true }).click();
    await page.getByRole('button', { name: 'Show all ten' }).click();
    await page.getByRole('group', { name: 'Weakness you were working on' }).getByRole('button', { name: 'Cast shadows' }).click();

    await page.getByRole('button', { name: 'More', exact: true }).click();
    await page.getByRole('checkbox', { name: /Mark as baseline/ }).check();
    await page.getByRole('button', { name: 'Done' }).click();

    await page.getByRole('button', { name: 'Save to journal' }).click();
    await expect(page.getByRole('heading', { name: '60-second reflection' })).toBeVisible();
    await page.getByRole('button', { name: 'Skip for now' }).click();

    // Entry detail: the stored photo is portrait, and the details are there.
    const canvas = page.getByTestId('tool-canvas');
    await expect(canvas).toHaveAttribute('data-rendered', 'original');
    expect(await canvas.evaluate((c) => (c as HTMLCanvasElement).width < (c as HTMLCanvasElement).height)).toBe(true);
    const details = page.getByRole('list', { name: 'Details' });
    await expect(details.getByText('Baseline')).toBeVisible();
    await expect(details.getByText('Still life')).toBeVisible();
    await expect(details.getByText('20 min')).toBeVisible();
    await expect(details.getByText('135th St B/C Station')).toBeVisible();
    await expect(page.getByText('quiet', { exact: true })).toBeVisible();

    // Timeline: one thumbnail under the current month, flagged as a baseline in words.
    await page.getByRole('link', { name: 'Journal' }).click();
    const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const section = page.getByRole('region', { name: month });
    await expect(section.getByRole('link')).toHaveCount(1);
    await expect(section.getByText('Baseline')).toBeVisible();
    const img = section.getByRole('img').first();
    await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  });

  test('stores photos at no more than 2048 px on the long edge', async ({ page }) => {
    await start(page);
    await saveSketch(page);
    const sizes = await page.evaluate(
      () =>
        new Promise<number[]>((resolve) => {
          const open = indexedDB.open('sketchbook-coach');
          open.onsuccess = () => {
            const all = open.result.transaction('images').objectStore('images').getAll();
            all.onsuccess = () => resolve((all.result as { width: number; height: number }[]).map((i) => Math.max(i.width, i.height)));
          };
        }),
    );
    expect(sizes).toHaveLength(2);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(2048);
    expect(Math.min(...sizes)).toBeLessThanOrEqual(560);
  });

  test('filters the timeline by subject', async ({ page }) => {
    await start(page);
    await saveSketch(page);
    await page.getByRole('link', { name: 'Journal' }).click();
    await page.getByRole('button', { name: 'Filter' }).click();
    const sheet = page.getByRole('dialog', { name: 'Filter the journal' });
    await sheet.getByRole('group', { name: 'Subject' }).getByRole('button', { name: 'Portrait' }).click();
    await sheet.getByRole('button', { name: /Show 0 sketches/ }).click();
    await expect(page.getByText('Nothing matches those filters.')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator('a.thumb')).toHaveCount(1);
  });
});
