// Generates the app icons and paper textures into public/. Run with: npm run icons
// Uses the Playwright browser as a rasteriser so there is no native image dependency.
import { chromium } from '@playwright/test';
import { Buffer } from 'node:buffer';
import { mkdirSync, writeFileSync } from 'node:fs';

const PAPER = '#f5f0e6';
const INK = '#1c1b18';
const ACCENT = '#1d4b8f';

/** An original mark: one swelling fude stroke leaving the tip of a nib. No brand marks. */
function iconSvg({ size, scale = 1, radius = 0 }) {
  const offset = (512 * (1 - scale)) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${radius}" fill="${PAPER}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <path d="M296 220 C 246 252, 214 304, 170 334 C 138 356, 112 374, 84 412 C 132 398, 182 380, 222 350 C 268 314, 288 268, 296 220 Z" fill="${INK}"/>
    <path d="M84 412 C 70 430, 60 444, 54 458" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
    <path d="M290 226 L 330 142 L 398 74 L 440 116 L 372 184 Z" fill="${INK}"/>
    <path d="M398 74 L 440 116 L 462 94 A 30 30 0 0 0 420 52 Z" fill="${ACCENT}"/>
    <path d="M296 220 L 372 138" fill="none" stroke="${PAPER}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="376" cy="134" r="12" fill="${PAPER}"/>
  </g>
</svg>`;
}

const browser = await chromium.launch();
const page = await browser.newPage();

async function rasterise(svg, size, file) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0;background:${PAPER}">${svg}</body>`);
  writeFileSync(file, await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: size, height: size } }));
  console.log('wrote', file);
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon.svg', iconSvg({ size: 512, radius: 96 }));
await rasterise(iconSvg({ size: 192 }), 192, 'public/icons/icon-192.png');
await rasterise(iconSvg({ size: 512 }), 512, 'public/icons/icon-512.png');
await rasterise(iconSvg({ size: 512, scale: 0.72 }), 512, 'public/icons/icon-maskable-512.png');
await rasterise(iconSvg({ size: 180 }), 180, 'public/icons/apple-touch-icon.png');

/** A small tile of paper grain: faint specks and a few fibres, mostly transparent. */
async function texture(rgb, strength, file) {
  const dataUrl = await page.evaluate(
    ([color, amount]) => {
      const size = 128;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const image = ctx.createImageData(size, size);
      let seed = 20261111;
      const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
      for (let i = 0; i < size * size; i++) {
        image.data[i * 4] = color[0];
        image.data[i * 4 + 1] = color[1];
        image.data[i * 4 + 2] = color[2];
        // Quantised and sparse so the PNG stays small.
        const alpha = Math.round((rand() ** 3 * amount) / 6) * 6;
        image.data[i * 4 + 3] = alpha < 6 ? 0 : alpha;
      }
      ctx.putImageData(image, 0, 0);
      ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${amount / 900})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 26; i++) {
        const x = rand() * size;
        const y = rand() * size;
        const a = rand() * Math.PI;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * (6 + rand() * 12), y + Math.sin(a) * (6 + rand() * 12));
        ctx.stroke();
      }
      return canvas.toDataURL('image/png');
    },
    [rgb, strength],
  );
  writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('wrote', file);
}

await page.setContent('<body></body>');
await texture([60, 48, 30], 34, 'public/paper-light.png');
await texture([255, 244, 220], 22, 'public/paper-dark.png');

await browser.close();
