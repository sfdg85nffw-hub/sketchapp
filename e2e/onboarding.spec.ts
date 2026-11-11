import { expect, test } from './helpers';

test.describe('onboarding', () => {
  test('is three screens, confirms colorblind mode, and ends on the journal', async ({ page }) => {
    await page.goto('/');
    const welcome = page.getByRole('dialog', { name: 'Welcome' });
    await expect(welcome.getByRole('heading', { name: 'Sketchbook Coach' })).toBeVisible();
    await welcome.getByRole('button', { name: 'Get started' }).click();

    await expect(welcome.getByRole('heading', { name: 'What do you draw?' })).toBeVisible();
    const colorblind = welcome.getByRole('checkbox', { name: /Red-green colorblind mode/ });
    await expect(colorblind).toBeChecked();
    const portrait = welcome.getByRole('button', { name: 'Portrait' });
    await expect(portrait).toHaveAttribute('aria-pressed', 'false');
    await portrait.click();
    await expect(portrait).toHaveAttribute('aria-pressed', 'true');
    await welcome.getByRole('button', { name: 'Next' }).click();

    await expect(welcome.getByRole('heading', { name: /Make a baseline drawing whenever you're ready/ })).toBeVisible();
    await expect(welcome.getByText('Rough is the point. This is your "before."')).toBeVisible();
    await welcome.getByRole('button', { name: 'Open my journal' }).click();

    await expect(welcome).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Journal', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'No pages yet' })).toBeVisible();

    // The choice persists, and onboarding does not come back.
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Journal', level: 1 })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Welcome' })).toBeHidden();
    await page.goto('/#/settings');
    await expect(page.getByRole('group', { name: 'Subjects you draw' }).getByRole('button', { name: 'Portrait' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('can be skipped from the first screen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.getByRole('dialog', { name: 'Welcome' })).toBeHidden();
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  });

  test('puts Capture one tap from launch, in the thumb zone, at 48pt or more', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Skip' }).click();
    const disc = page.locator('.capture-disc');
    const box = (await disc.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(48);
    expect(box.height).toBeGreaterThanOrEqual(48);
    // Bottom third of an 844pt screen.
    expect(box.y).toBeGreaterThan(844 * (2 / 3));
    await expect(page.getByLabel('Capture a sketch')).toHaveAttribute('capture', 'environment');
    for (const tab of await page.getByRole('navigation', { name: 'Main' }).getByRole('link').all()) {
      expect((await tab.boundingBox())!.height).toBeGreaterThanOrEqual(48);
    }
  });
});
