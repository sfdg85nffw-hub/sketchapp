// Renders the UI palette as seen with typical vision, deuteranopia and protanopia.
// Run with: npm run simulate   ->   docs/palette-simulation-{light,dark}.png
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { contrastRatio, rgbToHex, type RGB } from '../src/lib/color/convert';
import { simulateCvd, type CvdType } from '../src/lib/color/cvd';
import { CONTRAST_PAIRS, readThemeTokens, type ThemeName, type ThemeTokens } from './lib/tokens';

type Vision = 'typical' | CvdType;
const VISIONS: readonly { id: Vision; label: string }[] = [
  { id: 'typical', label: 'Typical vision' },
  { id: 'deuteranopia', label: 'Deuteranopia (simulated)' },
  { id: 'protanopia', label: 'Protanopia (simulated)' },
];

const see = (rgb: RGB, vision: Vision): RGB => (vision === 'typical' ? rgb : simulateCvd(rgb, vision));

function column(tokens: ThemeTokens, vision: Vision, label: string): string {
  const c = (name: string) => rgbToHex(see(tokens[name]!, vision));
  const swatches = Object.keys(tokens)
    .map((name) => `<div class="sw"><i style="background:${c(name)}"></i><span>${name}<br><b>${c(name)}</b></span></div>`)
    .join('');
  const pairs = CONTRAST_PAIRS.map(({ fg, bg, min, use }) => {
    const ratio = contrastRatio(see(tokens[fg]!, vision), see(tokens[bg]!, vision));
    return `<tr><td><span class="chip" style="color:${c(fg)};background:${c(bg)};border-color:${c('line')}">Aa</span></td><td>${use}</td><td>${ratio.toFixed(1)}:1</td><td>${ratio >= min ? 'passes' : 'FAILS'} ${min}:1</td></tr>`;
  }).join('');
  return `<section style="background:${c('paper')};color:${c('ink')}">
    <h2>${label}</h2>
    <div class="mock" style="border-color:${c('ink')};background:${c('paper-raised')}">
      <p style="color:${c('ink-3')}" class="k">REFLECTION</p>
      <p class="q">Where is the cast shadow?</p>
      <div class="r">
        <span style="border-color:${c('line')}">&#9675; Not yet</span>
        <span style="border-color:${c('ink')};background:${c('accent-soft')};border-width:2.5px">&#9680; Partly</span>
        <span style="border-color:${c('line')}">&#9679; Yes</span>
      </div>
      <div class="r">
        <span style="background:${c('ink')};color:${c('paper')};border-color:${c('ink')}">&#10003; Urban</span>
        <span style="border-color:${c('line')}">Interior</span>
      </div>
      <button style="background:${c('accent')};color:${c('accent-ink')};border-color:${c('ink')};box-shadow:0 2px 0 ${c('ink')}">Save reflection</button>
      <p style="color:${c('ink-2')}">Secondary text, and a <u style="color:${c('accent')}">link</u>.</p>
    </div>
    <div class="grid">${swatches}</div>
    <table>${pairs}</table>
  </section>`;
}

function page(theme: ThemeName, tokens: ThemeTokens): string {
  return `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;font:15px/1.4 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:grid;grid-template-columns:repeat(3,400px)}
    section{padding:20px} h2{font:600 19px Georgia,serif;margin:0 0 12px}
    .mock{border:1.5px solid;border-radius:12px;padding:14px;margin-bottom:16px}
    .mock p{margin:0 0 8px}.k{font-size:11px;font-weight:700;letter-spacing:.09em}.q{font:600 18px Georgia,serif}
    .r{display:flex;gap:6px;margin-bottom:10px}.r span{border:1.5px solid;border-radius:999px;padding:8px 12px;font-weight:600;font-size:14px}
    button{font:inherit;font-weight:650;border:1.5px solid;border-radius:12px;padding:12px 16px;margin-bottom:10px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
    .sw{display:flex;gap:8px;align-items:center;font-size:12px}.sw i{width:34px;height:34px;border-radius:6px;border:1px solid #8888;flex:none}
    table{border-collapse:collapse;font-size:12px;width:100%}td{padding:3px 6px 3px 0;vertical-align:middle}
    .chip{display:inline-block;border:1.5px solid;border-radius:6px;padding:2px 8px;font-weight:700}
  </style><body data-theme="${theme}">${VISIONS.map((v) => column(tokens, v.id, v.label)).join('')}</body>`;
}

const themes = readThemeTokens();
mkdirSync('docs', { recursive: true });
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
let failures = 0;
for (const theme of ['light', 'dark'] as const) {
  await tab.setContent(page(theme, themes[theme]));
  const file = `docs/palette-simulation-${theme}.png`;
  await tab.screenshot({ path: file, fullPage: true });
  console.log(`wrote ${file}`);
  for (const vision of VISIONS) {
    for (const { fg, bg, min, use } of CONTRAST_PAIRS) {
      const ratio = contrastRatio(see(themes[theme][fg]!, vision.id), see(themes[theme][bg]!, vision.id));
      if (ratio < min) {
        failures++;
        console.error(`FAIL ${theme} / ${vision.label}: ${use} (${fg} on ${bg}) is ${ratio.toFixed(2)}:1, needs ${min}:1`);
      }
    }
  }
}
await browser.close();
if (failures > 0) process.exit(1);
console.log('Every text and control pair passes in both themes, for all three kinds of vision.');
