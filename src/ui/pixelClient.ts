import { applyValueFilter, type ValueFilter } from '../lib/image/filters';
import type { PixelRequest, PixelResponse } from '../workers/pixel.worker';

let worker: Worker | null = null;
let workerBroken = false;
let nextId = 1;
const waiting = new Map<number, (buffer: ArrayBuffer) => void>();

function getWorker(): Worker | null {
  if (workerBroken) return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL('../workers/pixel.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<PixelResponse>) => {
      waiting.get(event.data.id)?.(event.data.buffer);
      waiting.delete(event.data.id);
    };
    worker.onerror = () => {
      // Fall back to the main thread for this and every later request.
      workerBroken = true;
      worker = null;
      for (const [, resolve] of waiting) resolve(new ArrayBuffer(0));
      waiting.clear();
    };
    return worker;
  } catch {
    workerBroken = true;
    return null;
  }
}

/**
 * Greyscale / posterize a copy of the given pixels off the main thread.
 * Falls back to doing the work inline when workers are unavailable.
 */
export async function filterPixels(source: ImageData, filter: ValueFilter): Promise<ImageData> {
  const copy = new Uint8ClampedArray(source.data);
  const w = getWorker();
  if (w) {
    const id = nextId++;
    const buffer = await new Promise<ArrayBuffer>((resolve) => {
      waiting.set(id, resolve);
      const request: PixelRequest = { id, buffer: copy.buffer, filter };
      w.postMessage(request, [copy.buffer]);
    });
    if (buffer.byteLength > 0) return new ImageData(new Uint8ClampedArray(buffer), source.width, source.height);
  }
  const inline = new Uint8ClampedArray(source.data);
  applyValueFilter(inline, filter);
  return new ImageData(inline, source.width, source.height);
}
