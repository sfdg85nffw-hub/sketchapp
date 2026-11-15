/** The bundled photo packs: index parsing, attribution and sizes. Pure. */

export type PackId = 'face' | 'pose' | 'hands-feet' | 'urban';
export const PACK_IDS: readonly PackId[] = ['face', 'pose', 'hands-feet', 'urban'];

export const PACK_LABELS: Record<PackId, string> = {
  face: 'Faces',
  pose: 'Poses',
  'hands-feet': 'Hands and feet',
  urban: 'Urban scenes',
};

export interface PackTags {
  angle?: 'front' | '3-4' | 'profile' | 'up' | 'down';
  lighting?: 'side' | 'top' | 'rim' | 'soft' | 'dramatic';
  age?: 'child' | 'young' | 'adult' | 'older';
  /** Free-form kind: "photo", "sculpture", "painting", "drawing". */
  kind?: string;
}

export interface PackItem {
  /** Stable id, unique across packs, e.g. "face-met-283121". */
  id: string;
  /** Path of the full image, relative to the packs folder. */
  file: string;
  /** Small JPEG: the thumbnail, and the fallback where WebP cannot be shown. */
  thumb: string;
  width: number;
  height: number;
  bytes: number;
  thumbBytes: number;
  title: string;
  author: string;
  license: string;
  licenseUrl?: string;
  /** The page the image came from. */
  source: string;
  /** Holding institution or collection, when known. */
  credit?: string;
  tags: PackTags;
}

export interface Pack {
  id: PackId;
  items: PackItem[];
  /** Everything the pack needs offline: full images plus thumbnails. */
  bytes: number;
}

export type PackIndex = Record<PackId, Pack>;

const isText = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

function parseItem(raw: unknown): PackItem | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (!isText(r.id) || !isText(r.file) || !isText(r.thumb) || !isText(r.license) || !isText(r.source)) return null;
  // Never show an image whose licence or source was not recorded.
  const tags = typeof r.tags === 'object' && r.tags !== null ? (r.tags as PackTags) : {};
  return {
    id: r.id,
    file: r.file,
    thumb: r.thumb,
    width: isCount(r.width) ? r.width : 0,
    height: isCount(r.height) ? r.height : 0,
    bytes: isCount(r.bytes) ? r.bytes : 0,
    thumbBytes: isCount(r.thumbBytes) ? r.thumbBytes : 0,
    title: isText(r.title) ? r.title : 'Untitled',
    author: isText(r.author) ? r.author : 'Unknown',
    license: r.license,
    ...(isText(r.licenseUrl) ? { licenseUrl: r.licenseUrl } : {}),
    source: r.source,
    ...(isText(r.credit) ? { credit: r.credit } : {}),
    tags,
  };
}

/** Read packs/index.json defensively: unknown packs and malformed items are dropped, never guessed at. */
export function parsePackIndex(json: unknown): PackIndex {
  const packs = (typeof json === 'object' && json !== null ? (json as { packs?: Record<string, unknown> }).packs : undefined) ?? {};
  const index = {} as PackIndex;
  for (const id of PACK_IDS) {
    const raw = packs[id] as { items?: unknown[] } | undefined;
    const items = (Array.isArray(raw?.items) ? raw.items : []).map(parseItem).filter((i): i is PackItem => i !== null);
    index[id] = { id, items, bytes: items.reduce((sum, i) => sum + i.bytes + i.thumbBytes, 0) };
  }
  return index;
}

export function findPackItem(index: PackIndex, id: string): PackItem | undefined {
  for (const pack of PACK_IDS) {
    const hit = index[pack].items.find((i) => i.id === id);
    if (hit) return hit;
  }
  return undefined;
}

/** CC BY needs the credit shown; public domain and CC0 do not, though the app shows it anyway. */
export function attributionRequired(license: string): boolean {
  return /^cc[ -]by/i.test(license.trim());
}

/** "Title. Author. CC0, The Metropolitan Museum of Art." */
export function attributionLine(item: Pick<PackItem, 'title' | 'author' | 'license' | 'credit'>): string {
  const parts = [item.title, item.author === 'Unknown' ? 'Unknown photographer' : item.author, item.credit ? `${item.license}, ${item.credit}` : item.license];
  return `${parts.join('. ')}.`;
}

/** Every file a pack needs to work offline, relative to the packs folder. */
export function packFiles(pack: Pack): string[] {
  return pack.items.flatMap((i) => [i.file, i.thumb]);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
}
