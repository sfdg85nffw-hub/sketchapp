import { getKv, putKv } from '../db/db';
import { packFiles, parsePackIndex, type Pack, type PackId, type PackIndex, type PackItem } from '../lib/ref/packs';

/*
 * The photo packs are static files on the app's own origin. They are not part of the
 * app shell: each pack is copied into its own cache only when he asks for it.
 * The service worker answers from any cache, so once copied a pack works offline.
 */

/** Not under the service worker's prefix, so an app update never clears it. */
export const PACK_CACHE = 'sbc-packs-v1';
const BASE = './packs/';

export interface PackStatus {
  /** Bytes stored on this phone when it was made available offline. */
  bytes: number;
  at: string;
}

let indexPromise: Promise<PackIndex> | null = null;

/** The pack index, bundled with the app shell so the list shows offline. */
export function loadPackIndex(): Promise<PackIndex> {
  indexPromise ??= fetch(`${BASE}index.json`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
    .then((json) => parsePackIndex(json));
  return indexPromise;
}

export const packUrl = (file: string): string => new URL(`${BASE}${file}`, document.baseURI).href;

async function openCache(): Promise<Cache | null> {
  try {
    return 'caches' in window ? await caches.open(PACK_CACHE) : null;
  } catch {
    return null;
  }
}

export async function packStatuses(): Promise<Partial<Record<PackId, PackStatus>>> {
  return getKv<Partial<Record<PackId, PackStatus>>>('packsCached', {});
}

/** Copy every file of a pack into the offline cache. Reports progress as files done / total. */
export async function makePackOffline(pack: Pack, onProgress: (done: number, total: number) => void): Promise<PackStatus> {
  const cache = await openCache();
  if (!cache) throw new Error('This browser cannot keep files offline.');
  const files = packFiles(pack);
  let done = 0;
  let bytes = 0;
  let next = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < files.length) {
        const url = packUrl(files[next++]!);
        if (!(await cache.match(url))) {
          const response = await fetch(url, { cache: 'reload' });
          if (!response.ok) throw new Error('A file could not be downloaded. Check the connection and try again.');
          await cache.put(url, response.clone());
          bytes += (await response.blob()).size;
        } else {
          bytes += (await (await cache.match(url))!.blob()).size;
        }
        onProgress(++done, files.length);
      }
    }),
  );
  const status: PackStatus = { bytes, at: new Date().toISOString() };
  await putKv('packsCached', { ...(await packStatuses()), [pack.id]: status });
  return status;
}

export async function removePackOffline(pack: Pack): Promise<void> {
  const cache = await openCache();
  if (cache) await Promise.all(packFiles(pack).map((file) => cache.delete(packUrl(file))));
  const statuses = await packStatuses();
  delete statuses[pack.id];
  await putKv('packsCached', statuses);
}

export class PackUnavailableError extends Error {
  constructor() {
    super("This pack isn't on this phone yet. Connect to the internet once, then open Timed Reference and tap Make available offline.");
    this.name = 'PackUnavailableError';
  }
}

/** The full image of one pack item, from the offline cache if it is there, otherwise from the app's own server. */
export async function packImage(item: PackItem): Promise<Blob> {
  for (const file of [item.file, item.thumb]) {
    const url = packUrl(file);
    const cache = await openCache();
    const cached = await cache?.match(url);
    if (cached) return cached.blob();
    try {
      const response = await fetch(url);
      if (response.ok) return response.blob();
    } catch {
      // Offline and not cached: try the thumbnail, then give up with a clear message.
    }
  }
  throw new PackUnavailableError();
}
