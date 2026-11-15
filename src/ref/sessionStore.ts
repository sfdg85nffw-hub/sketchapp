import type { SessionPlan } from '../lib/ref/session';
import type { RefPrefs } from '../lib/types';
import type { RefMode } from './modes';

/** What the setup screen hands the player. Kept in memory: a session is not resumed after a reload. */
export interface SessionConfig {
  mode: RefMode;
  plan: SessionPlan;
  prefs: RefPrefs;
  /** "10 × 1m", for the journal tag. */
  summary: string;
}

let pending: SessionConfig | null = null;

export function setPendingSession(config: SessionConfig): void {
  pending = config;
}

export function pendingSession(): SessionConfig | null {
  return pending;
}
