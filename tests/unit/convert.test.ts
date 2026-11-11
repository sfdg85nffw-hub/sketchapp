import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  greyForLstar,
  hexToRgb,
  linearToSrgb,
  lstarFromLuminance,
  lstarOfRgb,
  rgbToHex,
  rgbToLab,
  rgbToLinear,
  linearToXyz,
  srgbToLinear,
} from '../../src/lib/color/convert';

describe('sRGB <-> linear', () => {
  it('maps the end points exactly', () => {
    expect(srgbToLinear(0)).toBe(0);
    expect(srgbToLinear(255)).toBeCloseTo(1, 10);
  });

  it('uses the linear toe below the 0.04045 knee', () => {
    expect(srgbToLinear(10)).toBeCloseTo(10 / 255 / 12.92, 10);
  });

  it('puts sRGB mid-grey 128 at about 21.6% luminance, not 50%', () => {
    expect(srgbToLinear(128)).toBeCloseTo(0.2158, 3);
  });

  it('round-trips every 8-bit value', () => {
    for (let v = 0; v <= 255; v++) expect(Math.round(linearToSrgb(srgbToLinear(v)))).toBe(v);
  });
});

describe('linear RGB -> XYZ (D65)', () => {
  it('maps white to the D65 white point', () => {
    const [x, y, z] = linearToXyz([1, 1, 1]);
    expect(x).toBeCloseTo(0.95047, 4);
    expect(y).toBeCloseTo(1, 4);
    expect(z).toBeCloseTo(1.08883, 4);
  });

  it('gives the sRGB primaries their standard luminances', () => {
    expect(linearToXyz(rgbToLinear([255, 0, 0]))[1]).toBeCloseTo(0.2127, 3);
    expect(linearToXyz(rgbToLinear([0, 255, 0]))[1]).toBeCloseTo(0.7152, 3);
    expect(linearToXyz(rgbToLinear([0, 0, 255]))[1]).toBeCloseTo(0.0722, 3);
  });
});

describe('sRGB -> CIELAB', () => {
  const cases: [string, [number, number, number], [number, number, number]][] = [
    ['white', [255, 255, 255], [100, 0, 0]],
    ['black', [0, 0, 0], [0, 0, 0]],
    ['red', [255, 0, 0], [53.2408, 80.0925, 67.2032]],
    ['green', [0, 255, 0], [87.7347, -86.1827, 83.1793]],
    ['blue', [0, 0, 255], [32.297, 79.1875, -107.8602]],
    ['mid grey', [128, 128, 128], [53.585, 0, 0]],
  ];
  for (const [name, rgb, lab] of cases) {
    it(`converts ${name}`, () => {
      const got = rgbToLab(rgb);
      expect(got[0]).toBeCloseTo(lab[0], 1);
      expect(got[1]).toBeCloseTo(lab[1], 1);
      expect(got[2]).toBeCloseTo(lab[2], 1);
    });
  }
});

describe('lightness', () => {
  it('L* is perceptual: a saturated green is far lighter than a saturated blue', () => {
    expect(lstarOfRgb([0, 255, 0])).toBeGreaterThan(85);
    expect(lstarOfRgb([0, 0, 255])).toBeLessThan(35);
    // A naive channel average would call these two equal.
    expect((0 + 255 + 0) / 3).toBe((0 + 0 + 255) / 3);
  });

  it('18% grey card luminance is L* 50', () => {
    expect(lstarFromLuminance(0.1842)).toBeCloseTo(50, 1);
  });

  it('greyForLstar inverts lstarOfRgb for greys', () => {
    for (const g of [0, 40, 119, 200, 255]) expect(greyForLstar(lstarOfRgb([g, g, g]))).toBe(g);
  });
});

describe('helpers', () => {
  it('parses and formats hex', () => {
    expect(hexToRgb('#1d4b8f')).toEqual([29, 75, 143]);
    expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
    expect(rgbToHex([29, 75, 143])).toBe('#1d4b8f');
  });

  it('computes WCAG contrast', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
    expect(contrastRatio([119, 119, 119], [255, 255, 255])).toBeCloseTo(4.48, 1);
  });
});
