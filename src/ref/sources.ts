import { toDateKey } from '../lib/dates';
import type { PackItem } from '../lib/ref/packs';
import { attributionLine, attributionRequired } from '../lib/ref/packs';
import { pickNext } from '../lib/ref/picker';
import type { MaterialChoice } from '../lib/ref/scene';
import { mirrorPrompt } from '../lib/ref/views';
import { newSeed } from '../lib/rng';
import { loadPackIndex, packImage, packUrl } from './packStore';
import type { RefMode } from './modes';
import { modeInfo } from './modes';
import { getMyRefs, myRefBlob } from './refStore';
import type { RefImage } from './types';

export interface SourceOptions {
  mode: RefMode;
  source: 'photos' | '3d';
  material: MaterialChoice;
  lastShown: Record<string, string>;
}

export interface RefSource {
  /** The next image, or null when the pool has run out this session. Throws with a readable message on failure. */
  next(seen: ReadonlySet<string>): Promise<RefImage | null>;
}

function photoImage(item: PackItem, blob: Blob): RefImage {
  return {
    key: item.id,
    blob,
    thumbUrl: packUrl(item.thumb),
    title: item.title,
    detail: item.author === 'Unknown' ? undefined : item.author,
    credit: { line: attributionLine(item), source: item.source, required: attributionRequired(item.license) },
  };
}

/** Pick from a fixed pool without repeats, avoiding the last week when it can. */
function poolSource<T>(load: () => Promise<{ key: string; value: T }[]>, make: (value: T) => Promise<RefImage>, lastShown: Record<string, string>): RefSource {
  let pool: Promise<{ key: string; value: T }[]> | null = null;
  return {
    async next(seen) {
      pool ??= load();
      const items = await pool;
      const key = pickNext({ pool: items.map((i) => i.key), seen, lastShown, today: toDateKey(new Date()), random: Math.random });
      if (!key) return null;
      return make(items.find((i) => i.key === key)!.value);
    },
  };
}

/** Generated images: endless, so "no repeats" means re-rolling the rare duplicate. */
function generatedSource(render: () => Promise<RefImage>): RefSource {
  return {
    async next(seen) {
      for (let attempt = 0; attempt < 6; attempt++) {
        const image = await render();
        if (!seen.has(image.key)) return image;
      }
      return render();
    },
  };
}

export function createSource(options: SourceOptions): RefSource {
  const { mode, lastShown } = options;
  const info = modeInfo(mode);
  const use3d = info.only3d || (info.threeD && options.source === '3d');

  if (mode === 'life' || mode === 'mirror') {
    let n = 0;
    return {
      async next() {
        n++;
        return mode === 'life'
          ? { key: `life:${Date.now()}:${n}`, blob: null, title: 'Draw from life' }
          : { key: `mirror:${Date.now()}:${n}`, blob: null, title: 'Self-portrait', prompt: mirrorPrompt(Math.random) };
      },
    };
  }

  if (mode === 'mine') {
    return poolSource(
      async () => (await getMyRefs()).map((r) => ({ key: `mine:${r.id}`, value: r })),
      async (ref) => {
        const blob = await myRefBlob(ref);
        if (!blob) throw new Error('That photo is missing from this phone.');
        return { key: `mine:${ref.id}`, blob, title: ref.origin === 'mirror' ? 'Your mirror frame' : 'Your photo' };
      },
      lastShown,
    );
  }

  if (use3d) {
    // The 3D engines pull in three.js; load them only when a 3D mode starts.
    const engines = import('./engines');
    return generatedSource(async () => {
      const e = await engines;
      if (!e.webglAvailable()) throw new Error('This browser cannot draw 3D here. The photo packs still work.');
      const random = Math.random;
      switch (mode) {
        case 'faces':
          return e.renderHead(random);
        case 'poses':
          return e.renderMannequin(random);
        case 'skull':
          return e.renderSkull(random);
        default:
          return e.renderShapes(newSeed(), { material: options.material });
      }
    });
  }

  return poolSource(
    async () => {
      const index = await loadPackIndex();
      return index[info.pack ?? 'face'].items.map((item) => ({ key: item.id, value: item }));
    },
    async (item) => photoImage(item, await packImage(item)),
    lastShown,
  );
}
