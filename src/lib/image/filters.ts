import type { RGB } from '../color/convert';
import { lstarFromLuminance } from '../color/convert';
import { buildGreyLut, luminanceIndex, SRGB_TO_LINEAR_LUT } from '../color/value';

/** RGBA pixel buffer, as in ImageData.data. */
export type Pixels = Uint8ClampedArray;

export interface ValueFilter {
  /** 0 for continuous greyscale; 2, 3 or 5 for a posterized value map. */
  steps: number;
  /** Stretch the image's own darkest-to-lightest range across the full scale first. */
  autoRange: boolean;
}

/**
 * The L* at the given low and high percentiles of an image, for auto-ranging a
 * dim phone photo so that paper reads as white and ink as black.
 */
export function lstarPercentiles(pixels: Pixels, lowPct = 0.02, highPct = 0.98): { low: number; high: number } {
  const histogram = new Uint32Array(101);
  let count = 0;
  for (let i = 0; i < pixels.length; i += 16) {
    const y =
      0.2126729 * SRGB_TO_LINEAR_LUT[pixels[i]!]! +
      0.7151522 * SRGB_TO_LINEAR_LUT[pixels[i + 1]!]! +
      0.072175 * SRGB_TO_LINEAR_LUT[pixels[i + 2]!]!;
    const bin = Math.round(lstarFromLuminance(y));
    histogram[bin] = histogram[bin]! + 1;
    count++;
  }
  let low = 0;
  let high = 100;
  let seen = 0;
  for (let l = 0; l <= 100; l++) {
    seen += histogram[l]!;
    if (seen >= count * lowPct) {
      low = l;
      break;
    }
  }
  seen = 0;
  for (let l = 100; l >= 0; l--) {
    seen += histogram[l]!;
    if (seen >= count * (1 - highPct)) {
      high = l;
      break;
    }
  }
  return high - low < 10 ? { low: 0, high: 100 } : { low, high };
}

/** Greyscale by true L*, optionally posterized. Writes into `pixels` and returns it. */
export function applyValueFilter(pixels: Pixels, filter: ValueFilter): Pixels {
  const range = filter.autoRange ? lstarPercentiles(pixels) : undefined;
  const lut = buildGreyLut(filter.steps, range);
  for (let i = 0; i < pixels.length; i += 4) {
    const grey = lut[luminanceIndex(pixels[i]!, pixels[i + 1]!, pixels[i + 2]!)]!;
    pixels[i] = grey;
    pixels[i + 1] = grey;
    pixels[i + 2] = grey;
  }
  return pixels;
}

/**
 * Average colour of a square patch centred on (cx, cy), averaged in linear light.
 * Sampling a patch instead of one pixel rides over paper grain and JPEG noise.
 */
export function averagePatch(
  pixels: Pixels,
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number,
): RGB {
  const x0 = Math.max(0, Math.round(cx) - radius);
  const x1 = Math.min(width - 1, Math.round(cx) + radius);
  const y0 = Math.max(0, Math.round(cy) - radius);
  const y1 = Math.min(height - 1, Math.round(cy) + radius);
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * width + x) * 4;
      r += SRGB_TO_LINEAR_LUT[pixels[i]!]!;
      g += SRGB_TO_LINEAR_LUT[pixels[i + 1]!]!;
      b += SRGB_TO_LINEAR_LUT[pixels[i + 2]!]!;
      n++;
    }
  }
  if (n === 0) return [0, 0, 0];
  const toSrgb = (lin: number) => {
    const c = lin <= 0.0031308 ? lin * 12.92 : 1.055 * lin ** (1 / 2.4) - 0.055;
    return Math.round(c * 255);
  };
  return [toSrgb(r / n), toSrgb(g / n), toSrgb(b / n)];
}

/** Fit a width x height box inside a maximum long edge, never upscaling. */
export function fitWithin(width: number, height: number, maxLongEdge: number): { width: number; height: number } {
  const long = Math.max(width, height);
  if (long <= maxLongEdge) return { width, height };
  const scale = maxLongEdge / long;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
