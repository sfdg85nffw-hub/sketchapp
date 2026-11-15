import { getKv, putKv } from '../db/db';
import { decodeImage, renderToCanvas, canvasToBlob, THUMB_LONG_EDGE, MAX_LONG_EDGE } from '../db/images';
import { getImage, putImage, deleteImage } from '../db/db';
import { toDateKey } from '../lib/dates';
import { newId } from '../lib/id';
import type { LightGuess } from '../lib/ref/lighting';
import { pruneShown } from '../lib/ref/picker';
import type { Sequence } from '../lib/ref/session';

/** One of his own reference photos. The pixels live in the images store. */
export interface MyRef {
  id: string;
  imageId: string;
  thumbId: string;
  addedAt: string;
  /** Where it came from: an import, or a frozen mirror frame. */
  origin: 'import' | 'mirror';
}

export const getMyRefs = (): Promise<MyRef[]> => getKv<MyRef[]>('myRefs', []);
export const getLightGuesses = (): Promise<LightGuess[]> => getKv<LightGuess[]>('lightGuesses', []);
export const getSequences = (): Promise<Sequence[]> => getKv<Sequence[]>('refSequences', []);
export const getShown = (): Promise<Record<string, string>> => getKv<Record<string, string>>('refShown', {});

export async function saveSequences(sequences: Sequence[]): Promise<void> {
  await putKv('refSequences', sequences);
}

export async function recordGuess(error: number): Promise<void> {
  const guesses = await getLightGuesses();
  await putKv('lightGuesses', [...guesses, { date: toDateKey(new Date()), error: Math.round(error) }].slice(-200));
}

/** Remember what was shown today, so the next sessions can avoid it for a week. */
export async function recordShown(keys: readonly string[]): Promise<void> {
  if (keys.length === 0) return;
  const today = toDateKey(new Date());
  const shown = pruneShown(await getShown(), today);
  for (const key of keys) shown[key] = today;
  await putKv('refShown', shown, false);
}

async function storeBlob(blob: Blob, longEdge: number, prefix: string): Promise<string> {
  const canvas = renderToCanvas(await decodeImage(blob), { maxLongEdge: longEdge });
  const jpeg = await canvasToBlob(canvas);
  const id = newId(prefix);
  await putImage({ id, data: await jpeg.arrayBuffer(), type: 'image/jpeg', width: canvas.width, height: canvas.height });
  return id;
}

/** Add photos to My References, downscaled like journal photos. Returns how many were added. */
export async function addMyRefs(blobs: readonly Blob[], origin: MyRef['origin']): Promise<number> {
  const added: MyRef[] = [];
  for (const blob of blobs) {
    try {
      const imageId = await storeBlob(blob, MAX_LONG_EDGE, 'myref');
      const thumbId = await storeBlob(blob, THUMB_LONG_EDGE, 'myref-thumb');
      added.push({ id: newId('ref'), imageId, thumbId, addedAt: new Date().toISOString(), origin });
    } catch {
      // Skip files that are not images; the count tells him how many made it.
    }
  }
  if (added.length) await putKv('myRefs', [...(await getMyRefs()), ...added]);
  return added.length;
}

export async function removeMyRef(id: string): Promise<void> {
  const refs = await getMyRefs();
  const ref = refs.find((r) => r.id === id);
  if (!ref) return;
  await deleteImage(ref.imageId);
  await deleteImage(ref.thumbId);
  await putKv('myRefs', refs.filter((r) => r.id !== id));
}

export async function myRefBlob(ref: MyRef): Promise<Blob | null> {
  const image = await getImage(ref.imageId);
  return image ? new Blob([image.data], { type: image.type }) : null;
}
