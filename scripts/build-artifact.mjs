// Builds the claude.ai Artifact preview of the app into dist-artifact/.
// Run with: npm run build:artifact
// The Artifact host wraps the page in its own <html>/<head>/<body>, so index.html is
// reduced to the title, the stylesheet, the mount point and the module script.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const OUT = 'dist-artifact';
rmSync(OUT, { recursive: true, force: true });
execFileSync('npx', ['vite', 'build', '--mode', 'artifact', '--outDir', OUT], { stdio: 'inherit' });

const built = readFileSync(`${OUT}/index.html`, 'utf8');
const pick = (pattern, what) => {
  const match = built.match(pattern);
  if (!match) throw new Error(`build-artifact: no ${what} in the built index.html`);
  return match[0];
};
const title = pick(/<title>[^<]*<\/title>/, 'title');
const script = pick(/<script type="module"[^>]*><\/script>/, 'module script');
const stylesheet = pick(/<link rel="stylesheet"[^>]*>/, 'stylesheet');

const page = `${title}
<meta name="theme-color" content="#f5f0e6">
${stylesheet}
<style>
  /* The host already pads the page by the phone's safe areas. */
  :root { --safe-top: 0px; --safe-bottom: 0px; }
</style>
<div id="app"></div>
<noscript>Sketchbook Coach needs JavaScript to run.</noscript>
${script}
`;
writeFileSync(`${OUT}/index.html`, page);

// The 3D models and motion data are bundled into script chunks for this build (see
// src/ref3d/binary.ts); the host cannot serve the raw .glb and .bin files.
for (const dir of [`${OUT}/models`, `${OUT}/models/heads`]) {
  for (const file of readdirSync(dir)) if (file.endsWith('.glb')) rmSync(`${dir}/${file}`);
}
rmSync(`${OUT}/mocap/clips.bin`, { force: true });

// An Artifact holds a few hundred files, not all 888 pack images: keep an even sample of each pack.
const SAMPLE = 25;
const packs = `${OUT}/packs`;
const index = JSON.parse(readFileSync(`${packs}/index.json`, 'utf8'));
const keep = new Set();
for (const pack of Object.values(index.packs)) {
  const step = pack.items.length / SAMPLE;
  pack.items = pack.items.length <= SAMPLE ? pack.items : Array.from({ length: SAMPLE }, (_, i) => pack.items[Math.floor(i * step)]);
  for (const item of pack.items) keep.add(item.file).add(item.thumb);
}
writeFileSync(`${packs}/index.json`, JSON.stringify(index));
for (const category of readdirSync(packs)) {
  if (category === 'index.json') continue;
  for (const file of readdirSync(`${packs}/${category}`)) if (!keep.has(`${category}/${file}`)) rmSync(`${packs}/${category}/${file}`);
}
console.log(`kept ${keep.size / 2} pack images`);
console.log(`wrote ${OUT}/index.html`);
