import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { DEFAULT_PAINTS } from '../data/paints';
import type { BackupRecords } from '../lib/backup';
import type { DrillState, Entry, MonthlyReview, Paint, Project, Settings, StoredImage } from '../lib/types';

interface Schema extends DBSchema {
  entries: { key: string; value: Entry };
  images: { key: string; value: StoredImage };
  drillStates: { key: string; value: DrillState };
  paints: { key: string; value: Paint };
  projects: { key: string; value: Project };
  reviews: { key: string; value: MonthlyReview };
  kv: { key: string; value: unknown };
}

const DB_NAME = 'sketchbook-coach';
const SETTINGS_KEY = 'settings';

let dbPromise: Promise<IDBPDatabase<Schema>> | null = null;

function db(): Promise<IDBPDatabase<Schema>> {
  dbPromise ??= openDB<Schema>(DB_NAME, 1, {
    upgrade(database) {
      database.createObjectStore('entries', { keyPath: 'id' });
      database.createObjectStore('images', { keyPath: 'id' });
      database.createObjectStore('drillStates', { keyPath: 'drillId' });
      database.createObjectStore('paints', { keyPath: 'id' });
      database.createObjectStore('projects', { keyPath: 'id' });
      database.createObjectStore('reviews', { keyPath: 'month' });
      database.createObjectStore('kv');
    },
  });
  return dbPromise;
}

/* ---------- change notification ---------- */

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function changed(): void {
  for (const listener of [...listeners]) listener();
}

/* ---------- small keyed records ---------- */

/** Keyed records that travel with a backup. Everything else in kv is either settings or rebuilt. */
export const BACKUP_KV_KEYS = ['myRefs', 'lightGuesses', 'refSequences', 'refShown'] as const;
export type KvKey = (typeof BACKUP_KV_KEYS)[number] | 'packsCached';

export async function getKv<T>(key: KvKey, fallback: T): Promise<T> {
  const value = (await (await db()).get('kv', key)) as T | undefined;
  return value ?? fallback;
}

export async function putKv(key: KvKey, value: unknown, notify = true): Promise<void> {
  await (await db()).put('kv', value, key);
  if (notify) changed();
}

/* ---------- settings ---------- */

export function defaultSettings(): Settings {
  return {
    onboarded: false,
    theme: 'system',
    textScale: 1,
    redGreenMode: true,
    subjects: ['urban', 'interior', 'still-life', 'gesture', 'study'],
    focus: [],
    intentions: [{ id: 'starter', cue: "I'm on the train", action: 'do one 2-minute gesture' }],
    baselinePromptDismissed: false,
    firstUseAt: new Date().toISOString(),
    demoLoaded: false,
  };
}

let settingsCache: Settings | null = null;

export async function loadSettings(): Promise<Settings> {
  if (settingsCache) return settingsCache;
  const stored = (await (await db()).get('kv', SETTINGS_KEY)) as Partial<Settings> | undefined;
  settingsCache = { ...defaultSettings(), ...stored };
  if (!stored) await (await db()).put('kv', settingsCache, SETTINGS_KEY);
  return settingsCache;
}

/** Settings as last loaded. Call loadSettings() once at start-up before relying on this. */
export function currentSettings(): Settings {
  return settingsCache ?? defaultSettings();
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await loadSettings()), ...patch };
  settingsCache = next;
  await (await db()).put('kv', next, SETTINGS_KEY);
  changed();
  return next;
}

/* ---------- entries ---------- */

export async function getEntries(): Promise<Entry[]> {
  const all = await (await db()).getAll('entries');
  return all.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export async function putEntry(entry: Entry): Promise<void> {
  await (await db()).put('entries', entry);
  changed();
}

export async function deleteEntry(id: string): Promise<void> {
  const database = await db();
  const entry = await database.get('entries', id);
  if (!entry) return;
  const tx = database.transaction(['entries', 'images', 'projects'], 'readwrite');
  await tx.objectStore('entries').delete(id);
  for (const imageId of [entry.imageId, entry.thumbId, entry.refImageId]) {
    if (imageId) await tx.objectStore('images').delete(imageId);
  }
  for (const project of await tx.objectStore('projects').getAll()) {
    if (project.entryIds.includes(id)) {
      await tx.objectStore('projects').put({ ...project, entryIds: project.entryIds.filter((e) => e !== id) });
    }
  }
  await tx.done;
  changed();
}

/* ---------- images ---------- */

export async function getImage(id: string): Promise<StoredImage | undefined> {
  return (await db()).get('images', id);
}

export async function putImage(image: StoredImage): Promise<void> {
  await (await db()).put('images', image);
}

export async function deleteImage(id: string): Promise<void> {
  await (await db()).delete('images', id);
}

/* ---------- drills ---------- */

export async function getDrillStates(): Promise<Map<string, DrillState>> {
  const all = await (await db()).getAll('drillStates');
  return new Map(all.map((s) => [s.drillId, s]));
}

export async function putDrillState(state: DrillState): Promise<void> {
  await (await db()).put('drillStates', state);
  changed();
}

/* ---------- paints ---------- */

export async function getPaints(): Promise<Paint[]> {
  const database = await db();
  let paints = await database.getAll('paints');
  if (paints.length === 0 && !(await database.get('kv', 'paintsSeeded'))) {
    const tx = database.transaction(['paints', 'kv'], 'readwrite');
    for (const paint of DEFAULT_PAINTS) await tx.objectStore('paints').put({ ...paint });
    await tx.objectStore('kv').put(true, 'paintsSeeded');
    await tx.done;
    paints = DEFAULT_PAINTS.map((p) => ({ ...p }));
  }
  return paints.sort((a, b) => a.slot - b.slot);
}

export async function putPaint(paint: Paint): Promise<void> {
  await (await db()).put('paints', paint);
  changed();
}

export async function deletePaint(id: string): Promise<void> {
  await (await db()).delete('paints', id);
  changed();
}

/* ---------- projects ---------- */

export async function getProjects(): Promise<Project[]> {
  const all = await (await db()).getAll('projects');
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function putProject(project: Project): Promise<void> {
  await (await db()).put('projects', project);
  changed();
}

export async function deleteProject(id: string): Promise<void> {
  await (await db()).delete('projects', id);
  changed();
}

/* ---------- monthly reviews ---------- */

export async function getReviews(): Promise<MonthlyReview[]> {
  return (await db()).getAll('reviews');
}

export async function putReview(review: MonthlyReview): Promise<void> {
  await (await db()).put('reviews', review);
  changed();
}

/* ---------- backup, restore, demo, reset ---------- */

export async function exportEverything(): Promise<{ records: BackupRecords; images: StoredImage[] }> {
  const database = await db();
  const [entries, drillStates, paints, projects, reviews, images] = await Promise.all([
    database.getAll('entries'),
    database.getAll('drillStates'),
    database.getAll('paints'),
    database.getAll('projects'),
    database.getAll('reviews'),
    database.getAll('images'),
  ]);
  const extra: Record<string, unknown> = {};
  for (const key of BACKUP_KV_KEYS) {
    const value = await database.get('kv', key);
    if (value !== undefined) extra[key] = value;
  }
  return { records: { entries, drillStates, paints, projects, reviews, settings: await loadSettings(), extra }, images };
}

/**
 * Merge a backup into the database. Anything in the backup replaces the item
 * with the same id; nothing already on the phone is deleted.
 */
export async function importEverything(records: BackupRecords, images: readonly StoredImage[]): Promise<void> {
  const database = await db();
  const tx = database.transaction(['entries', 'images', 'drillStates', 'paints', 'projects', 'reviews', 'kv'], 'readwrite');
  for (const image of images) await tx.objectStore('images').put(image);
  for (const entry of records.entries) await tx.objectStore('entries').put(entry);
  for (const state of records.drillStates) await tx.objectStore('drillStates').put(state);
  for (const paint of records.paints) await tx.objectStore('paints').put(paint);
  if (records.paints.length) await tx.objectStore('kv').put(true, 'paintsSeeded');
  for (const project of records.projects) await tx.objectStore('projects').put(project);
  for (const review of records.reviews) await tx.objectStore('reviews').put(review);
  for (const key of BACKUP_KV_KEYS) {
    if (records.extra && key in records.extra) await tx.objectStore('kv').put(records.extra[key], key);
  }
  if (records.settings) {
    const merged: Settings = {
      ...defaultSettings(),
      ...records.settings,
      onboarded: true,
      lastBackupAt: new Date().toISOString(),
    };
    await tx.objectStore('kv').put(merged, SETTINGS_KEY);
    settingsCache = merged;
  }
  await tx.done;
  changed();
}

/** Remove everything that was created by "Load demo data", and nothing else. */
export async function clearDemoData(): Promise<void> {
  const database = await db();
  const tx = database.transaction(['entries', 'images', 'drillStates', 'projects'], 'readwrite');
  for (const entry of await tx.objectStore('entries').getAll()) {
    if (entry.demo) await tx.objectStore('entries').delete(entry.id);
  }
  for (const image of await tx.objectStore('images').getAll()) {
    if (image.demo) await tx.objectStore('images').delete(image.id);
  }
  for (const project of await tx.objectStore('projects').getAll()) {
    if (project.demo) await tx.objectStore('projects').delete(project.id);
  }
  for (const state of await tx.objectStore('drillStates').getAll()) {
    const history = state.history.filter((h) => !h.demo);
    if (history.length === state.history.length) continue;
    if (history.length === 0) await tx.objectStore('drillStates').delete(state.drillId);
    else await tx.objectStore('drillStates').put({ ...state, history });
  }
  await tx.done;
  await saveSettings({ demoLoaded: false });
}

/** Erase all data on this device. Used by "Erase everything" in settings. */
export async function eraseEverything(): Promise<void> {
  const database = await db();
  const stores = ['entries', 'images', 'drillStates', 'paints', 'projects', 'reviews', 'kv'] as const;
  const tx = database.transaction([...stores], 'readwrite');
  for (const store of stores) await tx.objectStore(store).clear();
  await tx.done;
  settingsCache = null;
  await loadSettings();
  changed();
}
