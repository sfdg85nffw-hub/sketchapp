import type { MaterialChoice } from '../lib/ref/scene';

export type RefMode = 'faces' | 'poses' | 'shapes' | 'skull' | 'hands' | 'urban' | 'mirror' | 'mine';
export type RefSourceKind = 'photos' | '3d' | 'life';

/** A label pinned to a point on the picture, in 0-1 coordinates from the top-left. */
export interface Landmark {
  label: string;
  x: number;
  y: number;
}

export interface RefLight {
  /** Where the key light comes from in the picture: degrees clockwise from straight up. */
  angle: number;
  name: string;
  note: string;
  /** False when there is no single direction worth guessing (overcast). */
  guessable: boolean;
}

/** One reference to draw from, whatever engine made it. */
export interface RefImage {
  /** Stable identity, used for no-repeat and for the contact sheet. */
  key: string;
  /** The picture. Null only for "from life", where the timer runs with nothing on screen. */
  blob: Blob | null;
  /** A small static thumbnail URL when one exists (bundled photos); otherwise made from the blob. */
  thumbUrl?: string;
  title: string;
  detail?: string;
  credit?: { line: string; source: string; required: boolean };
  light?: RefLight;
  /** Shown before drawing, e.g. a mirror pose prompt. */
  prompt?: string;
  seed?: number;
  overlays?: {
    /** Transparent PNG of the terminator line. */
    terminator?: Blob;
    /** The same view rendered as flat planes. */
    planes?: Blob;
    landmarks?: Landmark[];
    /** Line of action as picture coordinates. */
    line?: [number, number][];
  };
  /** Re-render the same arrangement under a new light. */
  relight?: () => Promise<RefImage>;
}

export interface RefSource {
  /** The next image, or null when there is nothing left to show. */
  next(index: number): Promise<RefImage | null>;
  dispose?(): void;
}

export interface EngineOptions {
  material: MaterialChoice;
  random: () => number;
}
