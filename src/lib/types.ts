import type { RGB } from './color/convert';

export type SubjectId = 'urban' | 'interior' | 'still-life' | 'portrait' | 'gesture' | 'study' | 'watercolor';
export type MediumId = 'ink' | 'ink-watercolor' | 'watercolor' | 'pencil' | 'other';
export type WeaknessId =
  | 'cast-shadows'
  | 'light-planes'
  | 'foliage'
  | 'line-weight'
  | 'true-darks'
  | 'background'
  | 'highlights'
  | 'ellipses'
  | 'figures'
  | 'intent';

/** Self-rating on a reflection prompt: 0 not yet, 1 partly, 2 yes. */
export type Rating = 0 | 1 | 2;
export type DrillRating = 'harder' | 'right' | 'easier';
export type DrillLevel = 1 | 2 | 3;
export type DrillKind = 'ink' | 'watercolor' | 'gesture';

export interface ReflectionItem {
  weaknessId: WeaknessId;
  prompt: string;
  rating: Rating;
  note?: string;
}

export interface Reflection {
  at: string;
  items: ReflectionItem[];
}

export interface SketchPlan {
  feeling?: string;
  /** Light direction in degrees, clockwise from straight above. */
  light?: number;
  focal?: string;
  thumbnails: boolean;
  watercolor: boolean;
  createdAt: string;
}

export interface Entry {
  id: string;
  createdAt: string;
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  imageId: string;
  thumbId: string;
  /** Optional reference photo of the scene, for Compare mode. */
  refImageId?: string;
  subject: SubjectId;
  medium: MediumId;
  minutes?: number;
  location?: string;
  feeling?: string;
  weaknessIds: WeaknessId[];
  baseline: boolean;
  plan?: SketchPlan;
  reflection?: Reflection;
  projectId?: string;
  drillId?: string;
  /** White-paper sample used to white-balance colour sampling for this photo. */
  whiteRef?: RGB;
  demo?: boolean;
}

export interface StoredImage {
  id: string;
  data: ArrayBuffer;
  type: string;
  width: number;
  height: number;
  demo?: boolean;
}

export interface DrillLog {
  date: string;
  rating: DrillRating;
  level: DrillLevel;
  entryId?: string;
  demo?: boolean;
}

export interface DrillState {
  drillId: string;
  level: DrillLevel;
  intervalDays: number;
  ease: number;
  /** Consecutive completions that were not rated "harder". */
  reps: number;
  due: string;
  lastDone?: string;
  history: DrillLog[];
}

export interface Drill {
  id: string;
  title: string;
  /** The named weakness this drill works on; null for watercolour handling drills. */
  weaknessId: WeaknessId | null;
  /** Plain-language target shown on the card. */
  targets: string;
  kind: DrillKind;
  minutes: number;
  why: string;
  steps: string[];
  success: string;
  /** What changes at difficulty 1, 2 and 3. */
  levels: [string, string, string];
  timerSeconds?: number;
}

export interface Paint {
  id: string;
  slot: number;
  name: string;
  rgb: RGB;
  /** True once the colour has been sampled from a photo of his real swatch. */
  sampled: boolean;
  /** True until he types the name printed on the pan. */
  placeholder: boolean;
  inLimited: boolean;
}

export interface ProjectStage {
  key: string;
  done: boolean;
  note?: string;
}

export interface Project {
  id: string;
  templateId?: string;
  title: string;
  brief: string;
  feeling: string;
  weaknessIds: WeaknessId[];
  targets: string[];
  stages: ProjectStage[];
  entryIds: string[];
  createdAt: string;
  demo?: boolean;
}

export interface MonthlyReview {
  /** YYYY-MM of the month being reviewed. */
  month: string;
  bestEntryId?: string;
  taughtEntryId?: string;
  focus?: WeaknessId;
  at: string;
}

export interface Intention {
  id: string;
  cue: string;
  action: string;
}

export type ThemeChoice = 'system' | 'light' | 'dark';

export interface Settings {
  onboarded: boolean;
  theme: ThemeChoice;
  textScale: number;
  redGreenMode: boolean;
  subjects: SubjectId[];
  focus: WeaknessId[];
  intentions: Intention[];
  baselinePromptDismissed: boolean;
  lastBackupAt?: string;
  backupSnoozedUntil?: string;
  reviewSkippedMonth?: string;
  pendingPlan?: SketchPlan;
  firstUseAt: string;
  demoLoaded: boolean;
}
