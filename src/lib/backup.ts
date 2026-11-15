import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from 'fflate';
import type { DrillState, Entry, MonthlyReview, Paint, Project, Settings, StoredImage } from './types';

export const BACKUP_APP_ID = 'sketchbook-coach';
export const BACKUP_VERSION = 1;

export interface BackupRecords {
  entries: Entry[];
  drillStates: DrillState[];
  paints: Paint[];
  projects: Project[];
  reviews: MonthlyReview[];
  settings: Settings | null;
  /** Small records kept by key: My References, light guesses, saved sequences. */
  extra?: Record<string, unknown>;
}

interface ImageManifestItem {
  id: string;
  file: string;
  type: string;
  width: number;
  height: number;
  demo?: boolean;
}

interface BackupManifest extends BackupRecords {
  app: typeof BACKUP_APP_ID;
  version: number;
  exportedAt: string;
  images: ImageManifestItem[];
}

function extensionFor(type: string): string {
  return type === 'image/png' ? 'png' : 'jpg';
}

/** Pack every record and image into one zip: data.json plus images/<id>.<ext>. */
export function packBackup(records: BackupRecords, images: readonly StoredImage[], exportedAt: string): Uint8Array {
  const files: Zippable = {};
  const manifest: BackupManifest = {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt,
    ...records,
    images: images.map((img) => ({
      id: img.id,
      file: `images/${img.id}.${extensionFor(img.type)}`,
      type: img.type,
      width: img.width,
      height: img.height,
      ...(img.demo ? { demo: true } : {}),
    })),
  };
  files['data.json'] = strToU8(JSON.stringify(manifest, null, 1));
  for (const [i, img] of images.entries()) {
    // JPEGs are already compressed: store them rather than spend battery deflating.
    files[manifest.images[i]!.file] = [new Uint8Array(img.data), { level: 0 }];
  }
  return zipSync(files);
}

export interface UnpackedBackup {
  records: BackupRecords;
  images: StoredImage[];
  exportedAt: string;
}

/** Read a backup zip. Throws an Error with a plain-language message if the file is not one. */
export function unpackBackup(zip: Uint8Array): UnpackedBackup {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(zip);
  } catch {
    throw new Error('That file is not a zip archive. Choose a Sketchbook Coach backup (.zip).');
  }
  const json = files['data.json'];
  if (!json) throw new Error('No data.json inside that zip. It does not look like a Sketchbook Coach backup.');
  let manifest: BackupManifest;
  try {
    manifest = JSON.parse(strFromU8(json)) as BackupManifest;
  } catch {
    throw new Error('The backup data is damaged and could not be read.');
  }
  if (manifest.app !== BACKUP_APP_ID) throw new Error('That zip was not made by Sketchbook Coach.');
  if (manifest.version > BACKUP_VERSION) {
    throw new Error('That backup was made by a newer version of the app. Update the app, then import again.');
  }
  const images: StoredImage[] = [];
  for (const item of manifest.images ?? []) {
    const bytes = files[item.file];
    if (!bytes) continue;
    const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    images.push({ id: item.id, data, type: item.type, width: item.width, height: item.height, ...(item.demo ? { demo: true } : {}) });
  }
  return {
    records: {
      entries: manifest.entries ?? [],
      drillStates: manifest.drillStates ?? [],
      paints: manifest.paints ?? [],
      projects: manifest.projects ?? [],
      reviews: manifest.reviews ?? [],
      settings: manifest.settings ?? null,
      ...(manifest.extra && typeof manifest.extra === 'object' ? { extra: manifest.extra } : {}),
    },
    images,
    exportedAt: manifest.exportedAt,
  };
}

export function backupFileName(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `sketchbook-coach-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.zip`;
}
