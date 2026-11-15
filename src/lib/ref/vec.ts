/** Minimal 3D maths over plain tuples, so the reference engines' logic stays testable without a renderer. */

export type Vec3 = readonly [number, number, number];
/** x, y, z, w */
export type Quat = readonly [number, number, number, number];

export const RAD = Math.PI / 180;

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const length = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export function normalize(a: Vec3): Vec3 {
  const l = length(a);
  return l === 0 ? [0, 0, 0] : scale(a, 1 / l);
}

export function quatMultiply(a: Quat, b: Quat): Quat {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
  ];
}

export function rotate(v: Vec3, q: Quat): Vec3 {
  const u: Vec3 = [q[0], q[1], q[2]];
  const t = scale(cross(u, v), 2);
  return add(add(v, scale(t, q[3])), cross(u, t));
}

/** Angle in radians between two orientations. */
export function quatAngle(a: Quat, b: Quat): number {
  const d = Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]);
  return 2 * Math.acos(Math.min(1, d));
}

export function quatFromAxisAngle(axis: Vec3, radians: number): Quat {
  const n = normalize(axis);
  const s = Math.sin(radians / 2);
  return [n[0] * s, n[1] * s, n[2] * s, Math.cos(radians / 2)];
}

/**
 * Unit vector from the subject towards a point at the given azimuth and elevation (degrees).
 * Azimuth 0 is straight in front (+Z), 90 is to the picture's right (+X), 180 is behind.
 */
export function direction(azimuth: number, elevation: number): Vec3 {
  const a = azimuth * RAD;
  const e = elevation * RAD;
  return [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
}

/** A world-space vector as seen by a camera orbiting at (azimuth, elevation): [right, up, towards camera]. */
export function toView(v: Vec3, cameraAzimuth: number, cameraElevation: number): Vec3 {
  const a = cameraAzimuth * RAD;
  const e = cameraElevation * RAD;
  const towards = direction(cameraAzimuth, cameraElevation);
  const right: Vec3 = [Math.cos(a), 0, -Math.sin(a)];
  const up: Vec3 = [-Math.sin(e) * Math.sin(a), Math.cos(e), -Math.sin(e) * Math.cos(a)];
  return [dot(v, right), dot(v, up), dot(v, towards)];
}

/** Turn a vector about the vertical axis by `degrees` (positive turns +Z towards +X). */
export function turnY(v: Vec3, degrees: number): Vec3 {
  const a = degrees * RAD;
  return [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
}
