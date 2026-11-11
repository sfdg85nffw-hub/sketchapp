/**
 * Colour conversions: 8-bit sRGB -> linear RGB -> CIE XYZ (D65) -> CIELAB.
 * Everything here is a pure function over plain tuples.
 */

export type RGB = readonly [number, number, number];
export type Lab = readonly [number, number, number];

/** D65 reference white (2 degree observer), Y normalised to 1. */
export const D65 = [0.95047, 1, 1.08883] as const;

/** One 8-bit sRGB channel (0-255) to linear light (0-1). */
export function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Linear light (0-1) to one 8-bit sRGB channel (0-255, unrounded, clamped). */
export function linearToSrgb(linear: number): number {
  const l = Math.min(1, Math.max(0, linear));
  const c = l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055;
  return c * 255;
}

export function rgbToLinear(rgb: RGB): RGB {
  return [srgbToLinear(rgb[0]), srgbToLinear(rgb[1]), srgbToLinear(rgb[2])];
}

export function linearToRgb(lin: RGB): RGB {
  return [Math.round(linearToSrgb(lin[0])), Math.round(linearToSrgb(lin[1])), Math.round(linearToSrgb(lin[2]))];
}

/** Relative luminance Y (0-1) of linear RGB. */
export function luminanceOfLinear(lin: RGB): number {
  return 0.2126729 * lin[0] + 0.7151522 * lin[1] + 0.072175 * lin[2];
}

export function linearToXyz(lin: RGB): RGB {
  const [r, g, b] = lin;
  return [
    0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
    0.2126729 * r + 0.7151522 * g + 0.072175 * b,
    0.0193339 * r + 0.119192 * g + 0.9503041 * b,
  ];
}

const EPSILON = 216 / 24389;
const KAPPA = 24389 / 27;

function labF(t: number): number {
  return t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116;
}

function labFInverse(f: number): number {
  const cubed = f ** 3;
  return cubed > EPSILON ? cubed : (116 * f - 16) / KAPPA;
}

/** CIE lightness L* (0-100) from relative luminance Y (0-1). */
export function lstarFromLuminance(y: number): number {
  return 116 * labF(y) - 16;
}

export function xyzToLab(xyz: RGB): Lab {
  const fx = labF(xyz[0] / D65[0]);
  const fy = labF(xyz[1] / D65[1]);
  const fz = labF(xyz[2] / D65[2]);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function linearToLab(lin: RGB): Lab {
  return xyzToLab(linearToXyz(lin));
}

/** 8-bit sRGB to CIELAB (D65). */
export function rgbToLab(rgb: RGB): Lab {
  return linearToLab(rgbToLinear(rgb));
}

/** L* (0-100) of an 8-bit sRGB colour: true perceptual lightness, not a channel average. */
export function lstarOfRgb(rgb: RGB): number {
  return lstarFromLuminance(luminanceOfLinear(rgbToLinear(rgb)));
}

/** The 8-bit grey level that displays a given L*. */
export function greyForLstar(lstar: number): number {
  const y = labFInverse((Math.min(100, Math.max(0, lstar)) + 16) / 116);
  return Math.round(linearToSrgb(y));
}

/** Chroma C*ab and hue angle h (degrees, 0-360) of a Lab colour. */
export function chromaHue(lab: Lab): { chroma: number; hue: number } {
  const chroma = Math.hypot(lab[1], lab[2]);
  const hue = ((Math.atan2(lab[2], lab[1]) * 180) / Math.PI + 360) % 360;
  return { chroma, hue };
}

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(rgb: RGB): string {
  return `#${rgb.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('')}`;
}

/** WCAG 2 contrast ratio between two 8-bit sRGB colours. */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = luminanceOfLinear(rgbToLinear(a));
  const lb = luminanceOfLinear(rgbToLinear(b));
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
