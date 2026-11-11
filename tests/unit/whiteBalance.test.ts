import { describe, expect, it } from 'vitest';
import { rgbToLab, rgbToLinear } from '../../src/lib/color/convert';
import { applyGains, applyGainsLinear, gainsFromWhiteReference, NO_GAINS } from '../../src/lib/color/whiteBalance';

describe('white-paper calibration', () => {
  it('turns the sampled paper into neutral white', () => {
    const warmPaper = [214, 196, 168] as const; // paper under tungsten light
    const gains = gainsFromWhiteReference(warmPaper);
    const [l, a, b] = rgbToLab(applyGains(warmPaper, gains));
    expect(l).toBeGreaterThan(99);
    expect(Math.abs(a)).toBeLessThan(0.6);
    expect(Math.abs(b)).toBeLessThan(0.6);
  });

  it('gains are the reciprocal of the reference in linear light', () => {
    const paper = [200, 180, 160] as const;
    const lin = rgbToLinear(paper);
    const gains = gainsFromWhiteReference(paper);
    expect(gains[0]).toBeCloseTo(1 / lin[0], 10);
    expect(gains[1]).toBeCloseTo(1 / lin[1], 10);
    expect(gains[2]).toBeCloseTo(1 / lin[2], 10);
  });

  it('removes the same cast from other colours in the photo', () => {
    // A neutral grey photographed under the same warm light picks up the same cast.
    const paper = [220, 200, 170] as const;
    const greyUnderCast = rgbToLinear(paper).map((c) => c * 0.25) as [number, number, number];
    const corrected = applyGainsLinear(greyUnderCast, gainsFromWhiteReference(paper));
    expect(corrected[0]).toBeCloseTo(0.25, 6);
    expect(corrected[1]).toBeCloseTo(0.25, 6);
    expect(corrected[2]).toBeCloseTo(0.25, 6);
  });

  it('leaves a perfect white reference unchanged', () => {
    const gains = gainsFromWhiteReference([255, 255, 255]);
    expect(applyGains([120, 80, 40], gains)).toEqual([120, 80, 40]);
  });

  it('clamps instead of overflowing', () => {
    const gains = gainsFromWhiteReference([128, 128, 128]);
    expect(applyGains([250, 250, 250], gains)).toEqual([255, 255, 255]);
  });

  it('rejects a reference too dark to be paper, and caps extreme gains', () => {
    expect(gainsFromWhiteReference([8, 8, 8])).toEqual(NO_GAINS);
    const gains = gainsFromWhiteReference([200, 190, 30]);
    expect(Math.max(...gains)).toBeLessThanOrEqual(8);
  });
});
