import { fitWithin } from '../lib/image/filters';
import { newId } from '../lib/id';
import type { StoredImage } from '../lib/types';
import { getImage, putImage } from './db';

export const MAX_LONG_EDGE = 2048;
export const THUMB_LONG_EDGE = 560;
export const JPEG_QUALITY = 0.85;

export type Rotation = 0 | 90 | 180 | 270;

/** A crop rectangle in 0-1 coordinates of the (already rotated) image. */
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const FULL_CROP: CropRect = { x: 0, y: 0, width: 1, height: 1 };

/** Decode a file or blob to an image element. Browsers apply EXIF orientation here. */
export function decodeImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file could not be read as an image.'));
    };
    img.src = url;
  });
}

type Drawable = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;

function sizeOf(source: Drawable): { width: number; height: number } {
  if (source instanceof HTMLImageElement) return { width: source.naturalWidth, height: source.naturalHeight };
  if (source instanceof HTMLVideoElement) return { width: source.videoWidth, height: source.videoHeight };
  return { width: source.width, height: source.height };
}

/** Rotate, crop and downscale into a new canvas whose long edge is at most `maxLongEdge`. */
export function renderToCanvas(
  source: Drawable,
  options: { rotation?: Rotation; crop?: CropRect; maxLongEdge: number },
): HTMLCanvasElement {
  const rotation = options.rotation ?? 0;
  const crop = options.crop ?? FULL_CROP;
  const src = sizeOf(source);
  const quarterTurn = rotation === 90 || rotation === 270;
  const rotated = { width: quarterTurn ? src.height : src.width, height: quarterTurn ? src.width : src.height };
  const cropPx = {
    x: crop.x * rotated.width,
    y: crop.y * rotated.height,
    width: Math.max(1, crop.width * rotated.width),
    height: Math.max(1, crop.height * rotated.height),
  };
  const out = fitWithin(cropPx.width, cropPx.height, options.maxLongEdge);
  const scale = out.width / cropPx.width;

  const canvas = document.createElement('canvas');
  canvas.width = out.width;
  canvas.height = out.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser could not create a drawing surface.');
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(scale, scale);
  ctx.translate(-cropPx.x, -cropPx.y);
  ctx.translate(rotated.width / 2, rotated.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(source, -src.width / 2, -src.height / 2);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = JPEG_QUALITY): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the image.'))), type, quality);
  });
}

async function storeCanvas(canvas: HTMLCanvasElement, prefix: string, demo: boolean, quality: number): Promise<string> {
  const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  const image: StoredImage = {
    id: newId(prefix),
    data: await blob.arrayBuffer(),
    type: 'image/jpeg',
    width: canvas.width,
    height: canvas.height,
    ...(demo ? { demo: true } : {}),
  };
  await putImage(image);
  return image.id;
}

/** Store a photo at up to 2048 px plus a thumbnail. Returns both ids. */
export async function storePhoto(
  source: Drawable,
  options: { rotation?: Rotation; crop?: CropRect; demo?: boolean } = {},
): Promise<{ imageId: string; thumbId: string }> {
  const full = renderToCanvas(source, { ...options, maxLongEdge: MAX_LONG_EDGE });
  const thumb = renderToCanvas(full, { maxLongEdge: THUMB_LONG_EDGE });
  const demo = options.demo ?? false;
  const imageId = await storeCanvas(full, 'img', demo, JPEG_QUALITY);
  const thumbId = await storeCanvas(thumb, 'thumb', demo, 0.8);
  return { imageId, thumbId };
}

export async function imageBlob(id: string): Promise<Blob | null> {
  const image = await getImage(id);
  return image ? new Blob([image.data], { type: image.type }) : null;
}
