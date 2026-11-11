import { useMemo, useState } from 'preact/hooks';
import { SUBJECTS, subjectLabel } from '../data/catalog';
import { getEntries } from '../db/db';
import { diffDays, formatDay } from '../lib/dates';
import type { Entry, SubjectId } from '../lib/types';
import { entryAlt, EntryThumb } from '../ui/EntryCard';
import { useImageUrl, useLive, useSettings } from '../ui/hooks';
import { Icon } from '../ui/Icon';
import { Button, Chips, Divider, Empty, Header, Segmented, Sheet, StoredImg } from '../ui/kit';
import { Screen } from '../ui/Screen';

/** The earliest baseline for a subject, or failing that the earliest sketch. */
export function thenFor(entries: readonly Entry[], subject: SubjectId): Entry | undefined {
  const ofSubject = entries.filter((e) => e.subject === subject).sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
  return ofSubject.find((e) => e.baseline) ?? ofSubject[0];
}

export function nowFor(entries: readonly Entry[], subject: SubjectId, notId?: string): Entry | undefined {
  return entries
    .filter((e) => e.subject === subject && e.id !== notId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))[0];
}

function SwipeCompare({ then, now }: { then: Entry; now: Entry }) {
  const [split, setSplit] = useState(50);
  const thenUrl = useImageUrl(then.imageId);
  const nowUrl = useImageUrl(now.imageId);
  const drag = (event: PointerEvent) => {
    if (event.buttons === 0 && event.type !== 'pointerdown') return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setSplit(Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)));
  };
  return (
    <div class="stack">
      <div class="stage">
        <div class="slider-compare" style={{ aspectRatio: '3 / 4', maxHeight: '60vh' }} onPointerDown={drag} onPointerMove={drag}>
          {nowUrl && <img src={nowUrl} alt={`Now: ${entryAlt(now)}`} draggable={false} />}
          <div class="over" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
            {thenUrl && <img src={thenUrl} alt={`Then: ${entryAlt(then)}`} draggable={false} />}
          </div>
          <div class="bar" style={{ left: `${split}%` }} />
        </div>
      </div>
      <div class="field">
        <label for="then-now-split">
          Then <span class="hint">← slide →</span> Now
        </label>
        <input id="then-now-split" type="range" min={0} max={100} value={split} onInput={(e) => setSplit(Number(e.currentTarget.value))} />
      </div>
    </div>
  );
}

interface ThenNowProps {
  initialA: string | null;
  initialB: string | null;
}

export function ThenNow({ initialA, initialB }: ThenNowProps) {
  const entries = useLive(getEntries);
  const settings = useSettings();
  const [subject, setSubject] = useState<SubjectId | null>(null);
  const [thenId, setThenId] = useState<string | null>(initialA);
  const [nowId, setNowId] = useState<string | null>(initialB);
  const [view, setView] = useState<'side' | 'swipe'>('side');
  const [picking, setPicking] = useState<'then' | 'now' | null>(null);

  const counts = useMemo(() => {
    const map = new Map<SubjectId, number>();
    for (const e of entries ?? []) map.set(e.subject, (map.get(e.subject) ?? 0) + 1);
    return map;
  }, [entries]);

  if (!entries) return <Screen label="Then and now">{null}</Screen>;

  const seeded = entries.find((e) => e.id === (initialB ?? initialA));
  const fallbackSubject =
    seeded?.subject ?? entries.find((e) => e.baseline)?.subject ?? [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const activeSubject = subject ?? fallbackSubject;

  const now = entries.find((e) => e.id === nowId) ?? (activeSubject ? nowFor(entries, activeSubject, thenId ?? undefined) : undefined);
  const thenDefault = activeSubject ? thenFor(entries, activeSubject) : undefined;
  const then = entries.find((e) => e.id === thenId) ?? (thenDefault?.id !== now?.id ? thenDefault : undefined);

  const baselines = new Set(entries.filter((e) => e.baseline).map((e) => e.subject));
  const pickable = entries.filter((e) => !activeSubject || e.subject === activeSubject);

  return (
    <Screen label="Then and now">
      <Header title="Then / Now" back="/journal" />

      {entries.length < 2 ? (
        <Empty icon="slider" title="Two sketches make a comparison">
          <p class="muted">Once there are two pages of the same subject, they show up here side by side. A flagged baseline is used as "then."</p>
        </Empty>
      ) : (
        <>
          <Chips
            label="Subject"
            scroll
            options={SUBJECTS.filter((s) => counts.has(s.id)).map((s) => ({ value: s.id, label: `${s.label} (${counts.get(s.id)})`, icon: s.icon }))}
            selected={activeSubject ? [activeSubject] : []}
            onToggle={(id) => {
              setSubject(id);
              setThenId(null);
              setNowId(null);
            }}
          />

          {then && now ? (
            <>
              <Segmented
                label="Layout"
                options={[
                  { value: 'side', label: 'Side by side' },
                  { value: 'swipe', label: 'Swipe slider' },
                ]}
                value={view}
                onChange={setView}
              />
              {view === 'side' ? (
                <div class="pair">
                  {(
                    [
                      ['Then', then],
                      ['Now', now],
                    ] as const
                  ).map(([label, entry]) => (
                    <figure key={label}>
                      <StoredImg id={entry.imageId} alt={`${label}: ${entryAlt(entry)}`} />
                      <figcaption>
                        <span class="kicker">{label}</span>
                        <br />
                        {formatDay(entry.date)}
                        {entry.baseline ? ' · baseline' : ''}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <SwipeCompare then={then} now={now} />
              )}
              <p class="muted small">
                {Math.abs(diffDays(then.date, now.date))} days apart. Look for one thing that changed, and one thing that has not yet.
              </p>
              <div class="row-wrap">
                <Button onClick={() => setPicking('then')}>Change "then"</Button>
                <Button onClick={() => setPicking('now')}>Change "now"</Button>
              </div>
            </>
          ) : (
            <p class="card card-note">
              Only one {activeSubject ? subjectLabel(activeSubject).toLowerCase() : ''} sketch so far. Draw another and the pair appears here.
            </p>
          )}
        </>
      )}

      <Divider />
      <section class="stack">
        <h2>Baselines</h2>
        <p class="muted small">A dated "before" for each subject you care about. Rough is the point.</p>
        <ul class="stack">
          {settings.subjects.map((s) => (
            <li key={s} class="row">
              <Icon name={baselines.has(s) ? 'ratingYes' : 'ratingNo'} size={18} />
              <span class="grow">{subjectLabel(s)}</span>
              <span class="small muted">{baselines.has(s) ? 'Baseline saved' : 'No baseline yet'}</span>
            </li>
          ))}
        </ul>
      </section>

      {picking && (
        <Sheet title={picking === 'then' ? 'Choose "then"' : 'Choose "now"'} onClose={() => setPicking(null)}>
          <div class="thumb-grid">
            {pickable.map((entry) => (
              <EntryThumb
                key={entry.id}
                entry={entry}
                picked={entry.id === (picking === 'then' ? then?.id : now?.id)}
                onPick={(picked) => {
                  if (picking === 'then') setThenId(picked.id);
                  else setNowId(picked.id);
                  setPicking(null);
                }}
              />
            ))}
          </div>
        </Sheet>
      )}
    </Screen>
  );
}
