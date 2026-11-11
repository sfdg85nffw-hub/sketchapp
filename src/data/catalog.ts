import type { IconName } from '../ui/Icon';
import type { MediumId, SubjectId } from '../lib/types';

export interface SubjectType {
  id: SubjectId;
  label: string;
  icon: IconName;
}

export const SUBJECTS: readonly SubjectType[] = [
  { id: 'urban', label: 'Urban', icon: 'urban' },
  { id: 'interior', label: 'Interior', icon: 'interior' },
  { id: 'still-life', label: 'Still life', icon: 'stillLife' },
  { id: 'portrait', label: 'Portrait', icon: 'portrait' },
  { id: 'gesture', label: 'Gesture', icon: 'gesture' },
  { id: 'study', label: 'Study', icon: 'study' },
  { id: 'watercolor', label: 'Watercolor', icon: 'drop' },
];

export function subjectLabel(id: SubjectId): string {
  return SUBJECTS.find((s) => s.id === id)?.label ?? id;
}

export function subjectIcon(id: SubjectId): IconName {
  return SUBJECTS.find((s) => s.id === id)?.icon ?? 'study';
}

export const MEDIUMS: readonly { id: MediumId; label: string }[] = [
  { id: 'ink', label: 'Ink' },
  { id: 'ink-watercolor', label: 'Ink + watercolor' },
  { id: 'watercolor', label: 'Watercolor' },
  { id: 'pencil', label: 'Pencil' },
  { id: 'other', label: 'Other' },
];

export function mediumLabel(id: MediumId): string {
  return MEDIUMS.find((m) => m.id === id)?.label ?? id;
}

export const MINUTE_CHOICES: readonly number[] = [2, 5, 10, 20, 30, 45, 60, 90];

export const FEELING_WORDS: readonly string[] = [
  'tired',
  'anonymous',
  'home',
  'restless',
  'quiet',
  'crowded',
  'tender',
  'cold',
  'together but alone',
  'rushed',
  'heavy',
  'awake',
  'small',
  'steady',
];

/** Starting points for the location chips until he has his own recent locations. */
export const STARTER_LOCATIONS: readonly string[] = ['135th St B/C Station', 'On the train', 'Café', 'Park bench', 'Home'];

export const INTENTION_CUES: readonly string[] = [
  "I'm on the train",
  'my coffee arrives',
  "I'm waiting on the platform",
  'I sit down on a park bench',
  'I get home',
];

export const INTENTION_ACTIONS: readonly string[] = [
  'do one 2-minute gesture',
  'draw one notan thumbnail',
  'draw the nearest cup with its inside shaded',
  'pick a feeling word before the first line',
  'do one drill from Today',
];
