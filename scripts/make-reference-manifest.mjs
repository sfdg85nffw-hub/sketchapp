// Dev-time: turns the curation notes into reference-packs/manifest.json.
// reference-packs/curation/<category>.json is the candidate list a harvest produced;
// <category>.txt lists the numbers a person kept, with tags: "n angle lighting age kind [crop=x,y,w,h]".
// Run with: node scripts/make-reference-manifest.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const DIR = 'reference-packs/curation';
const CATEGORIES = ['face', 'pose', 'hands-feet', 'urban'];
const LICENSE_URLS = {
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'Public domain': 'https://creativecommons.org/publicdomain/mark/1.0/',
};
const clean = (text, max) => {
  const t = String(text ?? '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

const entries = [];
const seen = new Set();
for (const category of CATEGORIES) {
  if (!existsSync(`${DIR}/${category}.txt`)) continue;
  const candidates = new Map(JSON.parse(readFileSync(`${DIR}/${category}.json`, 'utf8')).map((c) => [c.n, c]));
  for (const line of readFileSync(`${DIR}/${category}.txt`, 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [n, angle, lighting, age, kind, ...rest] = line.trim().split(/\s+/);
    const c = candidates.get(Number(n));
    if (!c) throw new Error(`${category}: no candidate number ${n}`);
    const id = `${category}-${c.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const crop = rest.find((r) => r.startsWith('crop='))?.slice(5).split(',').map(Number);
    const tags = Object.fromEntries(
      Object.entries({ angle, lighting, age, kind }).filter(([, v]) => v && v !== '-'),
    );
    entries.push({
      id,
      category,
      url: c.url.split('?')[0],
      source: c.source,
      title: clean(c.title, 120),
      author: clean(c.author, 80) || 'Unknown',
      ...(c.date ? { date: clean(c.date, 40) } : {}),
      license: c.license,
      licenseUrl: c.licenseUrl || LICENSE_URLS[c.license] || '',
      credit: c.from === 'met' ? 'The Metropolitan Museum of Art, Open Access' : 'Wikimedia Commons',
      tags,
      ...(crop ? { crop } : {}),
    });
  }
}
const manifest = {
  note: 'Hand-curated list of the photographs bundled with the app. Every file is public domain, CC0 or CC BY. scripts/build-reference-packs.mjs downloads and optimises them into public/packs.',
  entries,
};
writeFileSync('reference-packs/manifest.json', `${JSON.stringify(manifest, null, 1)}\n`);
const count = (k) => entries.filter((e) => e.category === k).length;
console.log(CATEGORIES.map((k) => `${k}: ${count(k)}`).join(', '));
const licenses = {};
for (const e of entries) licenses[e.license] = (licenses[e.license] ?? 0) + 1;
console.log(licenses);
