import { describe, expect, it } from 'vitest';
import { greyForLstar, lstarOfRgb } from '../../src/lib/color/convert';
import {
  bandLstar,
  buildGreyLut,
  luminanceIndex,
  posterizeBand,
  posterizeLstar,
  posterizeThresholds,
  valueFromLstar,
} from '../../src/lib/color/value';
import { applyValueFilter, averagePatch, fitWithin, lstarPercentiles } from '../../src/lib/image/filters';

function pixelsOf(colours: [number, number, number][]): Uint8ClampedArray {
  return Uint8ClampedArray.from(colours.flatMap(([r, g, b]) => [r, g, b, 255]));
}

describe('value 1-10', () => {
  it('runs from 1 for white paper to 10 for black ink', () => {
    expect(valueFromLstar(100)).toBe(1);
    expect(valueFromLstar(95)).toBe(1);
    expect(valueFromLstar(0)).toBe(10);
    expect(valueFromLstar(5)).toBe(10);
  });

  it('uses ten equal L* bands', () => {
    expect(valueFromLstar(90)).toBe(1);
    expect(valueFromLstar(89.9)).toBe(2);
    expect(valueFromLstar(50)).toBe(5);
    expect(valueFromLstar(49.9)).toBe(6);
    expect(valueFromLstar(10)).toBe(9);
    expect(valueFromLstar(9.9)).toBe(10);
  });

  it('clamps out-of-range input', () => {
    expect(valueFromLstar(140)).toBe(1);
    expect(valueFromLstar(-3)).toBe(10);
  });

  it('gets darker as L* falls, never lighter', () => {
    let previous = 0;
    for (let l = 100; l >= 0; l--) {
      const v = valueFromLstar(l);
      expect(v).toBeGreaterThanOrEqual(previous);
      previous = v;
    }
  });
});

describe('posterization thresholds', () => {
  it('splits L* into equal bands', () => {
    expect(posterizeThresholds(2)).toEqual([50]);
    expect(posterizeThresholds(3)[0]).toBeCloseTo(33.333, 2);
    expect(posterizeThresholds(3)[1]).toBeCloseTo(66.667, 2);
    expect(posterizeThresholds(5)).toEqual([20, 40, 60, 80]);
  });

  it('assigns bands on either side of each threshold', () => {
    expect(posterizeBand(49.9, 2)).toBe(0);
    expect(posterizeBand(50, 2)).toBe(1);
    expect(posterizeBand(19.9, 5)).toBe(0);
    expect(posterizeBand(20, 5)).toBe(1);
    expect(posterizeBand(79.9, 5)).toBe(3);
    expect(posterizeBand(80, 5)).toBe(4);
    expect(posterizeBand(100, 5)).toBe(4);
    expect(posterizeBand(0, 3)).toBe(0);
  });

  it('draws bands evenly from black to paper white', () => {
    expect([0, 1].map((b) => bandLstar(b, 2))).toEqual([0, 100]);
    expect([0, 1, 2].map((b) => bandLstar(b, 3))).toEqual([0, 50, 100]);
    expect([0, 1, 2, 3, 4].map((b) => bandLstar(b, 5))).toEqual([0, 25, 50, 75, 100]);
    expect(posterizeLstar(72, 5)).toBe(75);
    expect(posterizeLstar(30, 2)).toBe(0);
  });
});

describe('grey lookup table', () => {
  it('continuous mode reproduces L* as a grey level', () => {
    const lut = buildGreyLut(0);
    for (const rgb of [[255, 0, 0], [0, 255, 0], [0, 0, 255], [90, 90, 90]] as const) {
      const grey = lut[luminanceIndex(rgb[0], rgb[1], rgb[2])]!;
      expect(Math.abs(grey - greyForLstar(lstarOfRgb(rgb)))).toBeLessThanOrEqual(2);
    }
  });

  it('posterized mode produces exactly `steps` distinct greys', () => {
    for (const steps of [2, 3, 5]) {
      expect(new Set(buildGreyLut(steps)).size).toBe(steps);
    }
  });

  it('auto-range stretches a dim photo to the full scale', () => {
    const lut = buildGreyLut(2, { low: 20, high: 60 });
    // L* 35 is below the midpoint of 20-60, L* 45 is above it.
    const dark = greyForLstar(35);
    const light = greyForLstar(45);
    expect(lut[luminanceIndex(dark, dark, dark)]).toBe(0);
    expect(lut[luminanceIndex(light, light, light)]).toBe(255);
  });
});

describe('value filter on pixels', () => {
  it('turns colour into greys with equal channels and leaves alpha alone', () => {
    const px = pixelsOf([[255, 0, 0], [0, 0, 255]]);
    applyValueFilter(px, { steps: 0, autoRange: false });
    expect(px[0]).toBe(px[1]);
    expect(px[1]).toBe(px[2]);
    expect(px[3]).toBe(255);
    expect(px[0]!).toBeGreaterThan(px[4]!);
  });

  it('notan maps everything to pure black or pure white', () => {
    const px = pixelsOf([[250, 247, 240], [30, 30, 30], [200, 40, 40], [240, 220, 60]]);
    applyValueFilter(px, { steps: 2, autoRange: false });
    expect([px[0], px[4], px[8], px[12]]).toEqual([255, 0, 0, 255]);
  });

  it('finds the L* range of a dim photo', () => {
    const colours: [number, number, number][] = [];
    for (let i = 0; i < 400; i++) colours.push(i % 8 < 4 ? [60, 60, 60] : [150, 150, 150]);
    const range = lstarPercentiles(pixelsOf(colours));
    expect(range.low).toBeCloseTo(lstarOfRgb([60, 60, 60]), 0);
    expect(range.high).toBeCloseTo(lstarOfRgb([150, 150, 150]), 0);
  });

  it('refuses to stretch a flat image', () => {
    const flat = pixelsOf(Array.from({ length: 64 }, () => [120, 120, 120] as [number, number, number]));
    expect(lstarPercentiles(flat)).toEqual({ low: 0, high: 100 });
  });
});

describe('patch sampling', () => {
  it('averages a patch rather than reading one pixel', () => {
    // 3x3 image: centre pixel is black noise in a field of white.
    const colours: [number, number, number][] = Array.from({ length: 9 }, () => [255, 255, 255]);
    colours[4] = [0, 0, 0];
    const avg = averagePatch(pixelsOf(colours), 3, 3, 1, 1, 1);
    expect(avg[0]).toBeGreaterThan(230);
    expect(avg[0]).toBe(avg[1]);
  });

  it('clips the patch at the image edge', () => {
    const px = pixelsOf([[10, 20, 30], [10, 20, 30], [10, 20, 30], [10, 20, 30]]);
    expect(averagePatch(px, 2, 2, 0, 0, 5)).toEqual([10, 20, 30]);
  });
});

describe('fitWithin', () => {
  it('downscales the long edge to the limit and never upscales', () => {
    expect(fitWithin(4032, 3024, 2048)).toEqual({ width: 2048, height: 1536 });
    expect(fitWithin(3024, 4032, 2048)).toEqual({ width: 1536, height: 2048 });
    expect(fitWithin(800, 600, 2048)).toEqual({ width: 800, height: 600 });
  });
});
