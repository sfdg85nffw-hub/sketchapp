// Draws the test photos used by the e2e suite. Run with: node scripts/make-fixtures.mjs
// Generated, not photographed, so the pixel values the tests check are known exactly.
import { chromium } from '@playwright/test';
import { Buffer } from 'node:buffer';
import { mkdirSync, writeFileSync } from 'node:fs';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<body></body>');

async function draw(file, width, height, blocks) {
  const dataUrl = await page.evaluate(
    ([w, h, shapes]) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      for (const [color, x, y, bw, bh] of shapes) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, bw, bh);
      }
      return canvas.toDataURL('image/jpeg', 0.95);
    },
    [width, height, blocks],
  );
  writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('wrote', file);
}

mkdirSync('e2e/fixtures', { recursive: true });

// A "sketch page": paper, a black block, a mid-grey block, a blue and a brown patch.
await draw('e2e/fixtures/sketch.jpg', 1200, 900, [
  ['#f0ebe0', 0, 0, 1200, 900],
  ['#141414', 100, 100, 400, 400],
  ['#7a7a7a', 600, 100, 400, 400],
  ['#2b3fa8', 100, 600, 300, 200],
  ['#8a4a2b', 500, 600, 300, 200],
]);

// A "photo of the scene" for Compare mode: darker overall, different layout.
await draw('e2e/fixtures/reference.jpg', 1200, 900, [
  ['#b9b2a4', 0, 0, 1200, 900],
  ['#101010', 0, 450, 1200, 450],
  ['#f4f4f4', 800, 80, 250, 250],
]);

await browser.close();
