import { expect, test } from '@playwright/test';
import { captureSketch, start, toast } from './helpers';

test.describe('post-sketch reflection', () => {
  test('offers prompts, records labelled ratings, and feeds the skills view', async ({ page }) => {
    await start(page);
    await captureSketch(page);
    await page.getByRole('group', { name: 'Feeling word' }).getByRole('button', { name: 'tired' }).click();
    await page.getByRole('button', { name: 'Save to journal' }).click();

    await expect(page.getByRole('heading', { name: '60-second reflection' })).toBeVisible();
    await expect(page.getByText('Your word was')).toContainText('tired');
    const prompts = page.getByRole('radiogroup');
    await expect(prompts).toHaveCount(4);

    // Every rating is an icon plus a word, never a colour.
    for (const label of ['Not yet', 'Partly', 'Yes']) {
      await expect(prompts.first().getByRole('radio', { name: label })).toBeVisible();
    }
    const save = page.getByRole('button', { name: 'Save reflection' });
    await expect(save).toBeDisabled();

    const firstPrompt = await prompts.nth(0).getAttribute('aria-label');
    await prompts.nth(0).getByRole('radio', { name: 'Yes' }).click();
    await expect(prompts.nth(0).getByRole('radio', { name: 'Yes' })).toHaveAttribute('aria-checked', 'true');
    await prompts.nth(1).getByRole('radio', { name: 'Not yet' }).click();
    await prompts.nth(2).getByRole('radio', { name: 'Partly' }).click();
    await page.getByRole('textbox', { name: `Note for: ${firstPrompt}` }).fill('The bench finally sits.');
    await save.click();

    // Back on the entry, the answers are listed with their labels.
    const reflection = page.getByRole('region').filter({ has: page.getByRole('heading', { name: 'Reflection' }) }).or(page.locator('section', { has: page.getByRole('heading', { name: 'Reflection' }) }));
    await expect(reflection.first().getByRole('listitem')).toHaveCount(3);
    await expect(reflection.first()).toContainText(firstPrompt!);
    await expect(reflection.first()).toContainText('The bench finally sits.');
    await expect(reflection.first()).toContainText('Not yet');
    await expect(reflection.first()).toContainText('Partly');
    await expect(page.getByRole('button', { name: 'Edit reflection' })).toBeVisible();

    // Progress now has ratings to chart.
    await page.getByRole('link', { name: 'Progress' }).click();
    await expect(page.getByRole('heading', { name: 'Skill trends' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'No ratings yet' })).toBeHidden();
    await expect(page.locator('.skill > svg')).toHaveCount(3);
    await expect(page.locator('.skill').filter({ hasText: 'Lately: yes' })).toHaveCount(1);
  });

  test('exports a critique image and copies a critique prompt', async ({ page, browserName }) => {
    await start(page);
    await captureSketch(page);
    await page.getByRole('button', { name: 'Save to journal' }).click();
    await page.getByRole('radiogroup').first().getByRole('radio', { name: 'Partly' }).click();
    await page.getByRole('button', { name: 'Save reflection' }).click();

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export for critique' }).click();
    expect((await download).suggestedFilename()).toMatch(/^sketch-\d{4}-\d{2}-\d{2}-for-critique\.jpg$/);

    await page.getByRole('button', { name: 'Copy critique prompt' }).click();
    await expect(toast(page, /copied|Could not copy/)).toBeVisible();
    if (browserName === 'chromium') {
      const text = await page.evaluate(() => navigator.clipboard.readText());
      expect(text).toContain('red-green colourblind');
      expect(text).toContain('Partly.');
      expect(text).toContain('10. No emotional intent');
    }
  });

  test('reflection can be skipped, and done later from the entry', async ({ page }) => {
    await start(page);
    await captureSketch(page);
    await page.getByRole('button', { name: 'Save to journal' }).click();
    await page.getByRole('button', { name: 'Skip for now' }).click();
    await expect(page.getByText('Not reflected on yet.')).toBeVisible();
    await page.getByRole('button', { name: 'Reflect on this sketch' }).click();
    await expect(page.getByRole('heading', { name: '60-second reflection' })).toBeVisible();
  });
});
