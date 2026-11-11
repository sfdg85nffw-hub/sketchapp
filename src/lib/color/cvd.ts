import { linearToRgb, rgbToLinear, type RGB } from './convert';

export type CvdType = 'protanopia' | 'deuteranopia';

type Matrix = readonly [RGB, RGB, RGB];

/**
 * Severity-1.0 simulation matrices from Machado, Oliveira & Fernandes (2009),
 * "A Physiologically-based Model for Simulation of Color Vision Deficiency".
 * Applied in linear RGB.
 */
export const MACHADO_MATRICES: Record<CvdType, Matrix> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
};

export function simulateCvdLinear(lin: RGB, type: CvdType): RGB {
  const m = MACHADO_MATRICES[type];
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return [
    clamp(m[0][0] * lin[0] + m[0][1] * lin[1] + m[0][2] * lin[2]),
    clamp(m[1][0] * lin[0] + m[1][1] * lin[1] + m[1][2] * lin[2]),
    clamp(m[2][0] * lin[0] + m[2][1] * lin[1] + m[2][2] * lin[2]),
  ];
}

/** How an 8-bit sRGB colour appears to a dichromat of the given type. */
export function simulateCvd(rgb: RGB, type: CvdType): RGB {
  return linearToRgb(simulateCvdLinear(rgbToLinear(rgb), type));
}
