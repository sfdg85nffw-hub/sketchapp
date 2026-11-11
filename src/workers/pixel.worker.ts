/// <reference lib="webworker" />
import { applyValueFilter, type ValueFilter } from '../lib/image/filters';

export interface PixelRequest {
  id: number;
  buffer: ArrayBuffer;
  filter: ValueFilter;
}

export interface PixelResponse {
  id: number;
  buffer: ArrayBuffer;
}

const scope = self as unknown as DedicatedWorkerGlobalScope;

scope.onmessage = (event: MessageEvent<PixelRequest>) => {
  const { id, buffer, filter } = event.data;
  const pixels = new Uint8ClampedArray(buffer);
  applyValueFilter(pixels, filter);
  const response: PixelResponse = { id, buffer };
  scope.postMessage(response, [buffer]);
};
