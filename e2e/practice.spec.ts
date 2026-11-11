import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow, SKETCH, start, toast } from './helpers';

test.describe('practice', () => {
  test("today's practice proposes one to three drills and logs a rated drill with a photo", async ({ page }) => {
    await start(page);
    await page.getByRole('link', { name: 'Practice' }).click();
    const today = page.locator('section', { has: page.getByRole('heading', { name: "Today's practice" }) });
    const drills = today.getByRole('link');
    await expect(drills.first()).toBeVisible();
    const count = await drills.count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(3);
    await expect(today).toContainText(/about (1\d|20) minutes/);

    await drills.first().click();
    await expect(page.getByText('It worked if')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Steps' })).toBeVisible();
    await page.getByRole('button', { name: 'Done · rate it' }).click();

    const sheet = page.getByRole('dialog', { name: 'How did it go?' });
    await sheet.getByTestId('drill-photo-input').setInputFiles(SKETCH);
    await expect(sheet.getByText('Photo attached.')).toBeVisible();
    for (const label of ['Harder', 'Right', 'Easier']) await expect(sheet.getByRole('button', { name: new RegExp(`^${label}`) })).toBeVisible();
    await sheet.getByRole('button', { name: /^Right/ }).click();

    await expect(toast(page, 'Back in 2 days')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();
    await expect(page.getByText(/Right · level 1/)).toBeVisible();

    // The photo is attached to the drill history and is in the journal too.
    await page.getByRole('button', { name: 'Back' }).first().click();
    await expect(page.getByText('Done today')).toBeVisible();
    await page.getByRole('link', { name: 'Journal' }).click();
    await expect(page.locator('a.thumb')).toHaveCount(1);
  });

  test('gesture timer counts down through poses and finishes', async ({ page }) => {
    await page.clock.install();
    await start(page);
    await page.goto('/#/gesture');
    await page.getByRole('radiogroup', { name: 'Pose length' }).getByRole('radio', { name: '30 sec' }).click();
    await page.getByRole('group', { name: 'Number of poses' }).getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('button', { name: 'Start 3 poses' }).click();

    await expect(page.getByText('Pose 1 of 3')).toBeVisible();
    await expect(page.getByRole('timer')).toHaveText('30');
    await page.clock.runFor(31_000);
    await expect(page.getByText('Pose 2 of 3')).toBeVisible();
    await page.getByRole('button', { name: 'Next pose' }).click();
    await expect(page.getByText('Pose 3 of 3')).toBeVisible();
    await page.clock.runFor(31_000);
    await expect(page.getByRole('heading', { name: '3 poses done' })).toBeVisible();
    await expect(page.getByText('Photograph the page')).toBeVisible();
  });

  test('a plan made before drawing pre-fills the next capture', async ({ page }) => {
    await start(page);
    await page.goto('/#/plan');
    await page.getByRole('group', { name: 'Feeling word' }).getByRole('button', { name: 'anonymous' }).click();
    await page.getByRole('radio', { name: 'Light from upper left' }).click();
    await expect(page.getByText('Light from upper left. Cast shadows fall towards lower right.')).toBeVisible();
    await page.getByLabel('One sentence. Where should the eye land?').fill('The man asleep against the door');
    await page.getByRole('button', { name: 'Start drawing' }).click();
    await expect(page.getByText('A plan is waiting for your next capture')).toBeVisible();

    await page.getByTestId('capture-input').setInputFiles(SKETCH);
    await expect(page.getByRole('group', { name: 'Feeling word' }).getByRole('button', { name: 'anonymous' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Save to journal' }).click();
    await page.getByRole('button', { name: 'Skip for now' }).click();
    await expect(page.getByText('Plan: light from upper left; focal point: The man asleep against the door.')).toBeVisible();
  });

  test('a project starts from a template in one tap and tracks its stages', async ({ page }) => {
    await start(page);
    await page.goto('/#/projects');
    for (const title of ['From my seat', 'One commute in panels', 'A night scene that is mostly black', 'Self-portrait through your stuff']) {
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
    }
    await page.getByRole('button', { name: 'Start "From my seat"' }).click();
    await expect(page.getByRole('heading', { name: 'From my seat', level: 1 })).toBeVisible();
    await expect(page.getByText('together but alone')).toBeVisible();
    await page.getByRole('checkbox', { name: /1\. Thumbnails/ }).check();
    await expect(page.getByText('1 of 5 stages · next: value plan')).toBeVisible();
  });
});

test.describe('palette lab', () => {
  test('lists labelled pans, recipes by use, and confusable pairs', async ({ page }) => {
    await start(page);
    await page.goto('/#/palette');
    await expect(page.getByText('Your blue')).toBeVisible();
    await expect(page.getByText(/Use it for: subway shadows/)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Easy for you to confuse' })).toBeVisible();
    const pairs = page.locator('section', { has: page.getByRole('heading', { name: 'Easy for you to confuse' }) }).getByRole('listitem');
    expect(await pairs.count()).toBeGreaterThan(2);

    // Rename a placeholder pan with the name printed on it.
    await page.getByRole('button', { name: /^Leaf Green/ }).click();
    await page.getByLabel('Name printed on the pan').fill('Permanent Green Olive');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('button', { name: /^Permanent Green Olive/ })).toBeVisible();

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Make a blank chart to paint' }).click();
    expect((await download).suggestedFilename()).toBe('swatch-chart-template.png');
  });

  test('samples a pan from a swatch photo', async ({ page }) => {
    await start(page);
    await page.goto('/#/sample');
    await page.getByTestId('chart-input').setInputFiles(SKETCH);
    const canvas = page.getByTestId('chart-canvas');
    await expect(canvas).toHaveAttribute('data-rendered', 'original');
    await page.getByRole('group', { name: 'Paint to sample' }).getByRole('button', { name: /Ultramarine/ }).click();
    const box = (await canvas.boundingBox())!;
    await canvas.click({ position: { x: box.width * 0.208, y: box.height * 0.778 } });
    await expect(toast(page, /Ultramarine: cool, value 7 of 10/)).toBeVisible();
    await expect(page.getByRole('group', { name: 'Paint to sample' }).getByRole('button', { name: '● Ultramarine' })).toBeVisible();
  });
});

test.describe('layout and accessibility', () => {
  const ROUTES = ['journal', 'practice', 'see', 'progress', 'palette', 'settings', 'materials', 'projects', 'drills', 'plan', 'gesture', 'thennow', 'drill/two-pass-cylinder'];

  test('no screen scrolls sideways at the largest text size, in either theme', async ({ page }) => {
    test.slow();
    await start(page);
    await page.goto('/#/settings');
    await page.getByRole('button', { name: 'Load demo data' }).click();
    await expect(page.getByRole('button', { name: 'Clear demo data' })).toBeVisible({ timeout: 30_000 });
    await page.getByRole('radiogroup', { name: 'Text size' }).getByRole('radio', { name: 'Largest' }).click();
    for (const theme of ['Dark', 'Light']) {
      await page.goto('/#/settings');
      await page.getByRole('radiogroup', { name: 'Theme' }).getByRole('radio', { name: theme }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme.toLowerCase());
      for (const route of ROUTES) {
        await page.goto(`/#/${route}`);
        await expect(page.locator('main h1')).toBeVisible();
        await expectNoHorizontalOverflow(page);
      }
    }
  });

  test('every control has an accessible name and a 48pt target', async ({ page }) => {
    await start(page);
    for (const route of ROUTES) {
      await page.goto(`/#/${route}`);
      await expect(page.locator('main h1')).toBeVisible();
      const problems = await page.evaluate(() => {
        const issues: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>('button, a[href], label.btn, label.capture-tab')) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0) continue;
          const name = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim() || el.querySelector('input')?.getAttribute('aria-label');
          if (!name) issues.push(`unnamed ${el.tagName} ${el.className}`);
          if (rect.height < 47.5 && !el.closest('p, li.tag')) issues.push(`small target (${Math.round(rect.height)}px): ${name}`);
        }
        return issues;
      });
      expect(problems, `on #/${route}`).toEqual([]);
    }
  });
});
