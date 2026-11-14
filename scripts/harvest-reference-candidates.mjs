// Dev-time helper for curating the photo packs. Not part of the app, never run at runtime.
//
// It takes the shortlists in reference-packs/ (Met object ids, Wikimedia Commons search
// phrases), asks each source for the file URL, author and licence, keeps only public-domain,
// CC0 and CC BY files, and writes numbered contact sheets plus a JSON list per category
// into candidates/. A person then looks at the sheets and copies the keepers, with tags,
// into reference-packs/manifest.json. The app is built only from that manifest.
//
// Run with: node scripts/harvest-reference-candidates.mjs [category ...]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const UA = 'SketchbookCoachPackBuilder/1.0 (dev-time asset script; GitHub Actions)';
const OUT = 'candidates';
const CELL = 200;
const COLS = 8;
const ROWS = 6;
const PER_QUERY = 20;
const only = process.argv.slice(2);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, as = 'json', tries = 4) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': UA, Accept: as === 'json' ? 'application/json' : 'image/*' } });
      if (response.status === 429 || response.status >= 500) throw new Error(`HTTP ${response.status}`);
      if (!response.ok) return null;
      return as === 'json' ? await response.json() : Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (attempt >= tries) {
        console.warn(`gave up on ${url}: ${error.message}`);
        return null;
      }
      await sleep(800 * attempt * attempt);
    }
  }
}

async function pool(items, size, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await worker(items[i], i);
      }
    }),
  );
  return results;
}

const stripHtml = (html) => String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();

/** Public domain, CC0 and plain CC BY only. Anything ShareAlike, NonCommercial or NoDerivs is out. */
export function acceptableLicense(name) {
  const n = String(name ?? '').toLowerCase().trim();
  if (!n || /\b(sa|nc|nd)\b/.test(n.replace(/-/g, ' '))) return null;
  if (/^(public domain|pd\b.*|no restrictions|no known copyright restrictions)$/.test(n)) return 'Public domain';
  if (/^(cc0|cc zero|cc0 1\.0)/.test(n.replace(/-/g, ' '))) return 'CC0';
  const by = /^cc by (\d\.\d)/.exec(n.replace(/-/g, ' '));
  return by ? `CC BY ${by[1]}` : null;
}

async function metCandidate(id) {
  const o = await get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
  if (!o || !o.isPublicDomain || !o.primaryImage) return null;
  return {
    from: 'met',
    id: `met-${id}`,
    title: o.title || o.objectName || 'Untitled',
    author: o.artistDisplayName || o.culture || 'Unknown',
    date: o.objectDate || '',
    license: 'CC0',
    url: o.primaryImage,
    preview: o.primaryImageSmall || o.primaryImage,
    source: o.objectURL || `https://www.metmuseum.org/art/collection/search/${id}`,
    credit: 'The Metropolitan Museum of Art, Open Access',
    medium: o.medium || '',
  };
}

async function commonsCandidates(query) {
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=50' +
    `&gsrsearch=${encodeURIComponent(`filetype:bitmap ${query}`)}` +
    '&prop=imageinfo&iiprop=url%7Csize%7Cmime%7Cextmetadata&iiurlwidth=500';
  const data = await get(api);
  const pages = Object.values(data?.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const found = [];
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    const meta = info?.extmetadata ?? {};
    const license = acceptableLicense(meta.LicenseShortName?.value);
    if (!info || !license) continue;
    if (!/^image\/(jpeg|png|tiff)$/.test(info.mime) || Math.max(info.width, info.height) < 1000) continue;
    found.push({
      from: 'commons',
      id: `commons-${page.pageid}`,
      title: stripHtml(page.title).replace(/^File:/, '').replace(/\.[a-z]+$/i, ''),
      author: stripHtml(meta.Artist?.value) || 'Unknown',
      date: '',
      license,
      licenseUrl: meta.LicenseUrl?.value || '',
      url: info.url,
      preview: info.thumburl,
      source: info.descriptionurl,
      credit: stripHtml(meta.Credit?.value).slice(0, 160),
      query,
    });
    if (found.length >= PER_QUERY) break;
  }
  return found;
}

async function sheet(category, number, cells) {
  const composites = [];
  await pool(cells, 6, async (cell, i) => {
    const bytes = cell.preview ? await get(cell.preview, 'image') : null;
    if (!bytes) return;
    try {
      const tile = await sharp(bytes).rotate().resize(CELL, CELL, { fit: 'contain', background: '#777' }).jpeg().toBuffer();
      composites.push({ input: tile, left: (i % COLS) * CELL, top: Math.floor(i / COLS) * CELL });
    } catch {
      cell.broken = true;
    }
  });
  const labels = cells
    .map((cell, i) => {
      const x = (i % COLS) * CELL;
      const y = Math.floor(i / COLS) * CELL;
      return `<rect x="${x}" y="${y}" width="46" height="20" fill="#000"/><text x="${x + 4}" y="${y + 15}" font-family="monospace" font-size="15" fill="#fff">${cell.n}</text>`;
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS * CELL}" height="${ROWS * CELL}">${labels}</svg>`;
  const file = `${OUT}/${category}-${String(number).padStart(2, '0')}.jpg`;
  await sharp({ create: { width: COLS * CELL, height: ROWS * CELL, channels: 3, background: '#444' } })
    .composite([...composites, { input: Buffer.from(svg), left: 0, top: 0 }])
    .jpeg({ quality: 72 })
    .toFile(file);
  console.log('wrote', file);
}

const met = JSON.parse(readFileSync('reference-packs/met-candidates.json', 'utf8'));
const commons = JSON.parse(readFileSync('reference-packs/commons-queries.json', 'utf8'));
mkdirSync(OUT, { recursive: true });

for (const category of Object.keys(met)) {
  if (only.length && !only.includes(category)) continue;
  const fromMet = (await pool(met[category] ?? [], 4, metCandidate)).filter(Boolean);
  const fromCommons = [];
  for (const query of commons[category] ?? []) {
    fromCommons.push(...(await commonsCandidates(query)));
    await sleep(300);
  }
  const seen = new Set();
  const all = [...fromCommons, ...fromMet].filter((c) => !seen.has(c.id) && seen.add(c.id));
  all.forEach((c, i) => (c.n = i + 1));
  console.log(`${category}: ${fromMet.length} from the Met, ${fromCommons.length} from Commons`);
  for (let i = 0; i < all.length; i += COLS * ROWS) {
    await sheet(category, i / (COLS * ROWS) + 1, all.slice(i, i + COLS * ROWS));
  }
  writeFileSync(`${OUT}/${category}.json`, JSON.stringify(all.map(({ preview: _preview, ...rest }) => rest), null, 1));
}
