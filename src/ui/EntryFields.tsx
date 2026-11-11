import { useState } from 'preact/hooks';
import { FEELING_WORDS, MEDIUMS, MINUTE_CHOICES, STARTER_LOCATIONS, SUBJECTS } from '../data/catalog';
import { WEAKNESSES } from '../data/weaknesses';
import type { Entry, MediumId, SubjectId, WeaknessId } from '../lib/types';
import { Button, Chips } from './kit';

export interface EntryDraft {
  subject: SubjectId;
  medium: MediumId;
  minutes?: number;
  location: string;
  feeling: string;
  weaknessIds: WeaknessId[];
  baseline: boolean;
  date: string;
  projectId?: string;
}

export function draftFromEntry(entry: Entry): EntryDraft {
  return {
    subject: entry.subject,
    medium: entry.medium,
    minutes: entry.minutes,
    location: entry.location ?? '',
    feeling: entry.feeling ?? '',
    weaknessIds: entry.weaknessIds,
    baseline: entry.baseline,
    date: entry.date,
    projectId: entry.projectId,
  };
}

/** Most recent distinct values first, topped up with starter suggestions, so he taps instead of typing. */
export function recentValues(entries: readonly Entry[], pick: (e: Entry) => string | undefined, starters: readonly string[], limit = 6): string[] {
  const seen: string[] = [];
  for (const entry of entries) {
    const value = pick(entry)?.trim();
    if (value && !seen.includes(value)) seen.push(value);
  }
  for (const starter of starters) if (!seen.includes(starter)) seen.push(starter);
  return seen.slice(0, limit);
}

interface EntryFieldsProps {
  draft: EntryDraft;
  onChange: (draft: EntryDraft) => void;
  /** Past entries, newest first, used to pre-fill recent locations and feeling words. */
  history: readonly Entry[];
  /** Weaknesses to offer first: his chosen focus areas. */
  focus: readonly WeaknessId[];
}

/** The quick-entry fields. Everything is a tap; the two text fields are optional extras. */
export function EntryFields({ draft, onChange, history, focus }: EntryFieldsProps) {
  const [allWeaknesses, setAllWeaknesses] = useState(false);
  const set = <K extends keyof EntryDraft>(key: K, value: EntryDraft[K]) => onChange({ ...draft, [key]: value });

  const locations = recentValues(history, (e) => e.location, STARTER_LOCATIONS);
  const feelings = recentValues(history, (e) => e.feeling, FEELING_WORDS, 10);

  const preferred = [...new Set([...draft.weaknessIds, ...focus])];
  const shortList = WEAKNESSES.filter((w) => preferred.includes(w.id) || preferred.length === 0).slice(0, preferred.length === 0 ? 4 : 10);
  const offered = allWeaknesses ? WEAKNESSES : shortList;

  return (
    <div class="stack-lg">
      <div class="field">
        <span class="label">Subject</span>
        <Chips
          label="Subject"
          tiles
          options={SUBJECTS.map((s) => ({ value: s.id, label: s.label, icon: s.icon }))}
          selected={[draft.subject]}
          onToggle={(v) => set('subject', v)}
        />
      </div>

      <div class="field">
        <span class="label">
          Feeling word <span class="hint">· what was it like to be there?</span>
        </span>
        <Chips
          label="Feeling word"
          scroll
          options={feelings.map((f) => ({ value: f, label: f }))}
          selected={draft.feeling ? [draft.feeling] : []}
          onToggle={(v) => set('feeling', draft.feeling === v ? '' : v)}
        />
        <input
          class="input"
          type="text"
          aria-label="Or type your own feeling word"
          placeholder="Or type your own"
          autocapitalize="none"
          maxLength={40}
          value={feelings.includes(draft.feeling) ? '' : draft.feeling}
          onInput={(e) => set('feeling', e.currentTarget.value)}
        />
      </div>

      <div class="field">
        <span class="label">
          Working on <span class="hint">· optional</span>
        </span>
        <Chips
          label="Weakness you were working on"
          options={offered.map((w) => ({ value: w.id, label: w.skill }))}
          selected={draft.weaknessIds}
          onToggle={(id) => set('weaknessIds', draft.weaknessIds.includes(id) ? draft.weaknessIds.filter((w) => w !== id) : [...draft.weaknessIds, id])}
        />
        {!allWeaknesses && offered.length < WEAKNESSES.length && (
          <Button variant="quiet" onClick={() => setAllWeaknesses(true)}>
            Show all ten
          </Button>
        )}
      </div>

      <div class="field">
        <span class="label">
          Where <span class="hint">· optional</span>
        </span>
        <Chips
          label="Recent locations"
          scroll
          options={locations.map((l) => ({ value: l, label: l }))}
          selected={draft.location ? [draft.location] : []}
          onToggle={(v) => set('location', draft.location === v ? '' : v)}
        />
        <input
          class="input"
          type="text"
          aria-label="Or type a location"
          placeholder="Or type a place"
          maxLength={60}
          value={locations.includes(draft.location) ? '' : draft.location}
          onInput={(e) => set('location', e.currentTarget.value)}
        />
      </div>

      <div class="field">
        <span class="label">Medium</span>
        <Chips label="Medium" options={MEDIUMS.map((m) => ({ value: m.id, label: m.label }))} selected={[draft.medium]} onToggle={(v) => set('medium', v)} />
      </div>

      <div class="field">
        <span class="label">
          Minutes spent <span class="hint">· optional</span>
        </span>
        <Chips
          label="Minutes spent"
          scroll
          options={MINUTE_CHOICES.map((m) => ({ value: m, label: m >= 90 ? '90+' : String(m) }))}
          selected={draft.minutes ? [draft.minutes] : []}
          onToggle={(v) => set('minutes', draft.minutes === v ? undefined : v)}
        />
      </div>
    </div>
  );
}
