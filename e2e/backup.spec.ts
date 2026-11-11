import { expect, test } from '@playwright/test';
import { captureSketch, start, toast } from './helpers';

test('backup export and import round-trip restores sketches, photos and reflections', async ({ page }, testInfo) => {
  await start(page);
  await captureSketch(page);
  await page.getByRole('group', { name: 'Recent locations' }).getByRole('button', { name: 'Park bench' }).click();
  await page.getByRole('button', { name: 'Save to journal' }).click();
  await page.getByRole('radiogroup').first().getByRole('radio', { name: 'Yes' }).click();
  await page.getByRole('button', { name: 'Save reflection' }).click();
  await expect(page.getByRole('button', { name: 'Edit reflection' })).toBeVisible();

  // Export: one zip file.
  await page.goto('/#/settings');
  await expect(page.getByText('No backup yet.')).toBeVisible();
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export everything (.zip)' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/^sketchbook-coach-backup-\d{4}-\d{2}-\d{2}\.zip$/);
  const zipPath = testInfo.outputPath('backup.zip');
  await download.saveAs(zipPath);
  await expect(page.getByText(/Last backup:/)).toBeVisible();

  // Wipe the phone.
  await page.getByRole('button', { name: 'Erase everything on this phone' }).click();
  await page.getByRole('button', { name: 'Erase permanently' }).click();
  await page.getByRole('dialog', { name: 'Welcome' }).getByRole('button', { name: 'Skip' }).click();
  await page.goto('/#/journal');
  await expect(page.getByRole('heading', { name: 'No pages yet' })).toBeVisible();

  // Import the file.
  await page.goto('/#/settings');
  await page.getByTestId('import-input').setInputFiles(zipPath);
  await expect(toast(page, 'Backup restored: 1 sketch.')).toBeVisible();

  await page.goto('/#/journal');
  const thumb = page.locator('a.thumb');
  await expect(thumb).toHaveCount(1);
  await expect(thumb).toContainText('Park bench');
  await expect.poll(() => thumb.getByRole('img').evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

  await thumb.click();
  await expect(page.getByTestId('tool-canvas')).toHaveAttribute('data-rendered', 'original');
  await expect(page.getByRole('button', { name: 'Edit reflection' })).toBeVisible();
});

test('importing something that is not a backup says so plainly and changes nothing', async ({ page }) => {
  await start(page);
  await page.goto('/#/settings');
  await page.getByTestId('import-input').setInputFiles({ name: 'holiday.zip', mimeType: 'application/zip', buffer: Buffer.from('not a zip') });
  await expect(toast(page, /not a zip archive/)).toBeVisible();
});

test('demo data fills every screen and clears without touching real sketches', async ({ page }) => {
  test.slow();
  await start(page);
  await captureSketch(page);
  await page.getByRole('button', { name: 'Save to journal' }).click();
  await page.getByRole('button', { name: 'Skip for now' }).click();

  await page.goto('/#/settings');
  await page.getByRole('button', { name: 'Load demo data' }).click();
  await expect(page.getByRole('button', { name: 'Clear demo data' })).toBeVisible({ timeout: 30_000 });

  await page.goto('/#/journal');
  await expect(page.locator('a.thumb')).toHaveCount(15);
  await page.goto('/#/progress');
  await expect(page.locator('.skill > svg')).toHaveCount(10);
  await page.goto('/#/projects');
  await expect(page.getByRole('link', { name: /From my seat/ })).toBeVisible();

  await page.goto('/#/settings');
  await page.getByRole('button', { name: 'Clear demo data' }).click();
  await expect(page.getByRole('button', { name: 'Load demo data' })).toBeVisible();
  await page.goto('/#/journal');
  await expect(page.locator('a.thumb')).toHaveCount(1);
});
