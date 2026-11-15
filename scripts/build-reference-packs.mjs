// Dev-time only: builds the bundled photo packs. The app never runs this and never
// downloads from anywhere but its own origin.
//
// Reads the hand-curated reference-packs/manifest.json (direct image-file URLs with
// source page, author and licence), downloads each file, checks it really is an image,
// optionally crops, resizes to a 1400 px long edge, strips metadata, and writes
//   public/packs/<category>/<id>.webp   the reference itself
//   public/packs/<category>/<id>.jpg    a small JPEG: thumbnail and fallback
// plus public/packs/index.json (attribution and tags) and the photo section of CREDITS.md.
//
// Run with: node scripts/build-reference-packs.mjs [category ...]
// Needs network access and `sharp` (npm install). Already-built files are kept unless FORCE=1.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const UA = 'SketchbookCoachPackBuilder/1.0 (dev-time asset script; GitHub Actions)';
const OUT = 'public/packs';
const LONG_EDGE = 1400;
const THUMB_EDGE = 480;
const WEBP_QUALITY = Number(process.env.WEBP_QUALITY ?? 62);
const ALLOWED = /^(public domain|cc0|cc by \d\.\d)$/i;
const CATEGORIES = ['face', 'pose', 'hands-feet', 'urban'];
const LABELS = { face: 'Faces', pose: 'Poses', 'hands-feet': 'Hands and feet', urban: 'Urban scenes' };
const only = process.argv.slice(2);
const force = process.env.FORCE === '1';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*' } });
      if ([403, 429].includes(response.status) || response.status >= 500) throw new Error(`HTTP ${response.status}`);
      if (!response.ok) return { error: `HTTP ${response.status}` };
      const type = response.headers.get('content-type') ?? '';
      if (!type.startsWith('image/')) return { error: `not an image (${type || 'no content type'})` };
      return { bytes: Buffer.from(await response.arrayBuffer()) };
    } catch (error) {
      if (attempt === 5) return { error: error.message };
      await sleep(1500 * attempt * attempt);
    }
  }
  return { error: 'unreachable' };
}

/** Wikimedia asks bulk users to take a scaled rendering rather than the multi-megabyte original. */
function candidates(url) {
  const match = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([0-9a-f])\/([0-9a-f]{2})\/([^/?]+)$/.exec(url);
  if (!match) return [url];
  const [, a, ab, name] = match;
  const page = /\.tiff?$/i.test(name) ? 'lossy-page1-' : '';
  const suffix = /\.(tiff?|png)$/i.test(name) && page ? '.jpg' : '';
  return [`https://upload.wikimedia.org/wikipedia/commons/thumb/${a}/${ab}/${name}/${page}1920px-${name}${suffix}`, url];
}

async function build(entry) {
  const dir = `${OUT}/${entry.category}`;
  const full = `${dir}/${entry.id}.webp`;
  const thumb = `${dir}/${entry.id}.jpg`;
  if (!force && existsSync(full) && existsSync(thumb)) return describe(entry, full, thumb);

  let source = null;
  let problem = 'no URL worked';
  for (const url of candidates(entry.url)) {
    const result = await download(url);
    if (result.bytes) {
      source = result.bytes;
      break;
    }
    problem = result.error;
  }
  if (!source) return { failed: problem };

  try {
    // .rotate() applies the camera's orientation; everything else in the metadata is dropped on output.
    let image = sharp(source, { limitInputPixels: 400_000_000 }).rotate();
    const meta = await image.metadata();
    if (!meta.width || !meta.height || !['jpeg', 'png', 'tiff', 'webp'].includes(meta.format ?? '')) return { failed: `unsupported image (${meta.format})` };
    const upright = (meta.orientation ?? 1) >= 5 ? { width: meta.height, height: meta.width } : { width: meta.width, height: meta.height };
    if (entry.crop) {
      const [x, y, w, h] = entry.crop;
      image = image.extract({
        left: Math.round(x * upright.width),
        top: Math.round(y * upright.height),
        width: Math.round(w * upright.width),
        height: Math.round(h * upright.height),
      });
    }
    const flat = await image.flatten({ background: '#ffffff' }).toColourspace('srgb').toBuffer();
    if (Math.max(upright.width, upright.height) < 700) return { failed: 'too small to be a useful reference' };
    mkdirSync(dir, { recursive: true });
    await sharp(flat).resize(LONG_EDGE, LONG_EDGE, { fit: 'inside', withoutEnlargement: true }).webp({ quality: WEBP_QUALITY, effort: 5 }).toFile(full);
    await sharp(flat).resize(THUMB_EDGE, THUMB_EDGE, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 70, mozjpeg: true }).toFile(thumb);
    return describe(entry, full, thumb);
  } catch (error) {
    return { failed: `could not be processed: ${error.message}` };
  }
}

async function describe(entry, full, thumb) {
  const meta = await sharp(full).metadata();
  return {
    item: {
      id: entry.id,
      file: `${entry.category}/${entry.id}.webp`,
      thumb: `${entry.category}/${entry.id}.jpg`,
      width: meta.width,
      height: meta.height,
      bytes: statSync(full).size,
      thumbBytes: statSync(thumb).size,
      title: entry.title,
      author: entry.author,
      license: entry.license,
      ...(entry.licenseUrl ? { licenseUrl: entry.licenseUrl } : {}),
      source: entry.source,
      ...(entry.credit ? { credit: entry.credit } : {}),
      tags: entry.tags ?? {},
    },
  };
}

function writeCredits(packs) {
  const lines = [];
  for (const category of CATEGORIES) {
    const items = packs[category]?.items ?? [];
    lines.push(`### ${LABELS[category]} (${items.length})`, '');
    for (const item of items) {
      const title = item.title.replace(/([[\]|])/g, "\\$1");
      lines.push(`- [${title}](${item.source}), ${item.author}. ${item.license}${item.credit ? `, ${item.credit}` : ''}. \`${item.id}\``);
    }
    lines.push('');
  }
  const START = '<!-- photo-packs:start -->';
  const END = '<!-- photo-packs:end -->';
  const section = `${START}\n${lines.join('\n')}${END}`;
  const file = 'CREDITS.md';
  const current = existsSync(file) ? readFileSync(file, 'utf8') : `# Credits\n\n## Bundled photographs\n\n${START}\n${END}\n`;
  const next = current.includes(START) ? current.replace(new RegExp(`${START}[\\s\\S]*${END}`), section) : `${current.trimEnd()}\n\n## Bundled photographs\n\n${section}\n`;
  writeFileSync(file, next);
}

const manifest = JSON.parse(readFileSync('reference-packs/manifest.json', 'utf8'));
const previous = existsSync(`${OUT}/index.json`) ? JSON.parse(readFileSync(`${OUT}/index.json`, 'utf8')).packs : {};
const packs = {};
const failures = [];

for (const category of CATEGORIES) {
  const entries = manifest.entries.filter((e) => e.category === category);
  if (only.length && !only.includes(category)) {
    packs[category] = previous[category] ?? { items: [] };
    continue;
  }
  const items = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      while (next < entries.length) {
        const entry = entries[next++];
        if (!ALLOWED.test(entry.license) || !entry.source || !entry.url) {
          failures.push({ id: entry.id, reason: 'licence, source or URL missing or not allowed' });
          continue;
        }
        const result = await build(entry);
        if (result.item) items.push(result.item);
        else failures.push({ id: entry.id, url: entry.url, reason: result.failed });
        await sleep(120);
      }
    }),
  );
  const order = new Map(entries.map((e, i) => [e.id, i]));
  items.sort((a, b) => order.get(a.id) - order.get(b.id));
  packs[category] = { items };

  // Remove files for entries that are no longer in the manifest.
  const keep = new Set(items.flatMap((i) => [`${i.id}.webp`, `${i.id}.jpg`]));
  if (existsSync(`${OUT}/${category}`)) for (const file of readdirSync(`${OUT}/${category}`)) if (!keep.has(file)) rmSync(`${OUT}/${category}/${file}`);
  const bytes = items.reduce((sum, i) => sum + i.bytes + i.thumbBytes, 0);
  console.log(`${category}: ${items.length} of ${entries.length} built, ${(bytes / 1e6).toFixed(1)} MB`);
}

mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/index.json`, `${JSON.stringify({ version: 1, packs }, null, 1)}\n`);
writeCredits(packs);
writeFileSync('reference-packs/build-report.json', `${JSON.stringify({ failures }, null, 1)}\n`);
const total = Object.values(packs).reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.bytes + i.thumbBytes, 0), 0);
console.log(`total ${(total / 1e6).toFixed(1)} MB; ${failures.length} entries failed (see reference-packs/build-report.json)`);
