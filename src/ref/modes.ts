import type { IconName } from '../ui/Icon';
import type { PackId } from '../lib/ref/packs';
import type { SubjectId } from '../lib/types';

export type RefMode = 'faces' | 'poses' | 'shapes' | 'skull' | 'hands' | 'urban' | 'mirror' | 'mine' | 'life';

export interface ModeInfo {
  id: RefMode;
  label: string;
  icon: IconName;
  /** One line under the label. */
  blurb: string;
  /** Photo pack behind the "Photos" source, if any. */
  pack?: PackId;
  /** Has a generated 3D source: heads, mannequin, shapes, skull. */
  threeD?: boolean;
  /** Generated only: no photo source. */
  only3d?: boolean;
  /** Default seconds per image. */
  seconds: number;
  /** Start the value toggle here: urban thumbnails default to a two-value notan. */
  steps?: 0 | 2 | 3 | 5;
  journalSubject: SubjectId;
  /** Drill whose schedule the end-of-session rating feeds. */
  drillId: string;
  /** Names for the two sources, when there are two. */
  sources?: { photos: string; '3d': string };
}

export const MODES: readonly ModeInfo[] = [
  { id: 'faces', label: 'Faces', icon: 'portrait', blurb: 'Photographs, or 3D heads under named light', pack: 'face', threeD: true, seconds: 60, journalSubject: 'portrait', drillId: 'timed-faces', sources: { photos: 'Photos', '3d': '3D heads' } },
  { id: 'poses', label: 'Poses', icon: 'gesture', blurb: 'Photographs, or a mannequin moved by motion capture', pack: 'pose', threeD: true, seconds: 30, journalSubject: 'gesture', drillId: 'gesture-session', sources: { photos: 'Photos', '3d': 'Mannequin' } },
  { id: 'shapes', label: 'Shapes', icon: 'study', blurb: 'Lit solids with cast shadows, from a seed', threeD: true, only3d: true, seconds: 120, journalSubject: 'study', drillId: 'timed-shapes' },
  { id: 'skull', label: 'Skull', icon: 'skull', blurb: 'A real human skull, turned and lit', threeD: true, only3d: true, seconds: 180, journalSubject: 'study', drillId: 'timed-faces' },
  { id: 'hands', label: 'Hands & Feet', icon: 'hand', blurb: 'Photographs, casts and studies', pack: 'hands-feet', seconds: 60, journalSubject: 'study', drillId: 'gesture-session' },
  { id: 'urban', label: 'Urban Thumbnails', icon: 'urban', blurb: 'Street scenes in two values, for thumbnails', pack: 'urban', seconds: 150, steps: 2, journalSubject: 'urban', drillId: 'notan-thumbnail' },
  { id: 'mirror', label: 'Mirror', icon: 'mirror', blurb: 'Self-portrait from the front camera', seconds: 120, journalSubject: 'portrait', drillId: 'timed-faces' },
  { id: 'mine', label: 'My References', icon: 'image', blurb: 'Your own photos, kept on this phone', seconds: 60, journalSubject: 'study', drillId: 'gesture-session' },
  { id: 'life', label: 'From life', icon: 'timer', blurb: 'Just the timer: draw whoever is across from you', seconds: 60, journalSubject: 'gesture', drillId: 'gesture-session' },
];

export function modeInfo(id: string): ModeInfo {
  return MODES.find((m) => m.id === id) ?? MODES[0]!;
}

export function isRefMode(id: string): id is RefMode {
  return MODES.some((m) => m.id === id);
}
