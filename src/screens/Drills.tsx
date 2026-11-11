import { useEffect, useRef, useState } from 'preact/hooks';
import { DRILL_KIND_LABEL, drillById, DRILLS } from '../data/drills';
import { weaknessById, WEAKNESSES } from '../data/weaknesses';
import { getDrillStates, getEntries, putDrillState, putEntry } from '../db/db';
import { decodeImage, storePhoto } from '../db/images';
import { formatDay, toDateKey } from '../lib/dates';
import { newId } from '../lib/id';
import { initialDrillState, reviewDrill } from '../lib/srs';
import type { Drill, DrillRating, Entry } from '../lib/types';
import { useLive, useSettings } from '../ui/hooks';
import { Icon, type IconName } from '../ui/Icon';
import { Button, Divider, FileButton, Header, LevelPips, Section, Sheet, StoredImg, toast } from '../ui/kit';
import { navigate } from '../ui/router';
import { Screen } from '../ui/Screen';
import { DrillCard } from './Practice';

export const DRILL_RATINGS: readonly { value: DrillRating; label: string; detail: string; icon: IconName }[] = [
  { value: 'harder', label: 'Harder', detail: 'Tougher than it should be. Back tomorrow, one step easier.', icon: 'arrowUp' },
  { value: 'right', label: 'Right', detail: 'A stretch, and I met the criterion. Space it out.', icon: 'arrowFlat' },
  { value: 'easier', label: 'Easier', detail: 'Too comfortable. Make it harder and leave it longer.', icon: 'arrowDown' },
];

function formatClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** A plain countdown. Runs off the clock, so it stays right if the screen sleeps. */
function DrillTimer({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const endsAt = useRef(0);

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => {
      const remaining = (endsAt.current - Date.now()) / 1000;
      setLeft(remaining);
      if (remaining <= 0) {
        setRunning(false);
        navigator.vibrate?.(200);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [running]);

  const toggle = () => {
    if (!running) endsAt.current = Date.now() + (left > 0 ? left : seconds) * 1000;
    if (left <= 0) setLeft(seconds);
    setRunning(!running);
  };

  return (
    <div class="card card-soft row">
      <span class="h2 grow" role="timer" aria-label="Time left" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {left <= 0 ? 'Time' : formatClock(left)}
      </span>
      <Button icon={running ? 'pause' : 'play'} onClick={toggle}>
        {running ? 'Pause' : left <= 0 ? 'Restart' : left < seconds ? 'Resume' : 'Start timer'}
      </Button>
    </div>
  );
}

const SUBJECT_FOR_KIND = { ink: 'study', watercolor: 'watercolor', gesture: 'gesture' } as const;
const MEDIUM_FOR_KIND = { ink: 'ink', watercolor: 'watercolor', gesture: 'ink' } as const;

async function saveDrillPhoto(drill: Drill, file: File): Promise<Entry> {
  const { imageId, thumbId } = await storePhoto(await decodeImage(file));
  const entry: Entry = {
    id: newId('entry'),
    createdAt: new Date().toISOString(),
    date: toDateKey(new Date()),
    imageId,
    thumbId,
    subject: SUBJECT_FOR_KIND[drill.kind],
    medium: MEDIUM_FOR_KIND[drill.kind],
    weaknessIds: drill.weaknessId ? [drill.weaknessId] : [],
    baseline: false,
    drillId: drill.id,
  };
  await putEntry(entry);
  return entry;
}

export function DrillDetail({ id }: { id: string }) {
  const drill = drillById(id);
  const states = useLive(getDrillStates);
  const entries = useLive(getEntries);
  const [rating, setRating] = useState(false);
  const [photo, setPhoto] = useState<Entry | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const today = toDateKey(new Date());

  if (!drill) {
    return (
      <Screen label="Drill">
        <Header title="Drill not found" back="/practice" />
      </Screen>
    );
  }
  if (!states || !entries) return <Screen label={drill.title}>{null}</Screen>;

  const state = states.get(drill.id) ?? initialDrillState(drill.id, today);
  const weakness = drill.weaknessId ? weaknessById(drill.weaknessId) : null;

  const attach = async (file: File) => {
    setSavingPhoto(true);
    try {
      setPhoto(await saveDrillPhoto(drill, file));
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not save that photo.');
    } finally {
      setSavingPhoto(false);
    }
  };

  const rate = async (value: DrillRating) => {
    const next = reviewDrill(state, value, today, photo ? { entryId: photo.id } : {});
    await putDrillState(next);
    setRating(false);
    setPhoto(null);
    toast(`Logged. Back in ${next.intervalDays} ${next.intervalDays === 1 ? 'day' : 'days'}, at difficulty ${next.level}.`);
  };

  return (
    <Screen
      label={drill.title}
      back="/practice"
      actions={
        <Button variant="primary" large icon="check" onClick={() => setRating(true)}>
          Done · rate it
        </Button>
      }
    >
      <Header title={drill.title} kicker={`${DRILL_KIND_LABEL[drill.kind]} · ${drill.minutes} min`} back="/practice" />

      <p>{drill.why}</p>
      <ul class="row-wrap">
        <li class="tag">Fixes: {weakness ? weakness.title : drill.targets}</li>
      </ul>

      <div class="card card-accent">
        <p class="kicker">It worked if</p>
        <p class="h3">{drill.success}</p>
      </div>

      <Section title="Steps">
        <ol class="steps">
          {drill.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </Section>

      <div class="card card-soft">
        <p class="kicker">
          Difficulty <LevelPips level={state.level} /> {state.level} of 3
        </p>
        <p>{drill.levels[state.level - 1]}</p>
        {state.level < 3 && <p class="small muted">Next step up: {drill.levels[state.level as 1 | 2]}</p>}
      </div>

      {drill.kind === 'gesture' ? (
        <Button block icon="timer" onClick={() => navigate('/gesture')}>
          Open the gesture timer
        </Button>
      ) : (
        <DrillTimer seconds={drill.timerSeconds ?? drill.minutes * 60} />
      )}

      {state.history.length > 0 && (
        <>
          <Divider />
          <Section title="History" hint={state.lastDone === today ? 'Done today.' : `Next due ${formatDay(state.due)}.`}>
            <ul class="stack">
              {[...state.history].reverse().map((log, i) => {
                const meta = DRILL_RATINGS.find((r) => r.value === log.rating)!;
                const linked = log.entryId ? entries.find((e) => e.id === log.entryId) : undefined;
                return (
                  <li key={`${log.date}-${i}`} class="row">
                    <Icon name={meta.icon} size={18} />
                    <span class="grow">
                      {formatDay(log.date)} · {meta.label} · level {log.level}
                    </span>
                    {linked && (
                      <a href={`#/entry/${linked.id}`} aria-label={`Open the photo from ${formatDay(log.date)}`}>
                        <StoredImg id={linked.thumbId} alt="" class="swatch" />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </Section>
        </>
      )}

      {rating && (
        <Sheet title="How did it go?" onClose={() => setRating(false)}>
          <p class="muted small">Check it against the criterion: {drill.success}</p>
          {photo ? (
            <p class="card card-soft row">
              <StoredImg id={photo.thumbId} alt="Your drill result" class="swatch" />
              <span>Photo attached. It is in your journal too.</span>
            </p>
          ) : (
            <FileButton block icon="camera" camera testId="drill-photo-input" onFile={(file) => void attach(file)}>
              {savingPhoto ? 'Saving photo…' : 'Photograph the result (optional)'}
            </FileButton>
          )}
          <div class="stack" role="group" aria-label="Rate the drill">
            {DRILL_RATINGS.map((option) => (
              <button key={option.value} type="button" class="list-link" onClick={() => void rate(option.value)}>
                <Icon name={option.icon} />
                <span class="grow">
                  {option.label}
                  <span class="sub">{option.detail}</span>
                </span>
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </Screen>
  );
}

export function DrillLibrary() {
  const states = useLive(getDrillStates);
  const settings = useSettings();
  const today = toDateKey(new Date());
  if (!states) return <Screen label="Drill library">{null}</Screen>;

  const groups: { title: string; drills: Drill[] }[] = [
    ...WEAKNESSES.map((w) => ({ title: w.skill, drills: DRILLS.filter((d) => d.weaknessId === w.id) })),
    { title: 'Watercolor handling', drills: DRILLS.filter((d) => d.weaknessId === null) },
  ].filter((g) => g.drills.length > 0);

  return (
    <Screen label="Drill library">
      <Header title="Drill library" back="/practice" />
      <p class="muted">Grouped by what they fix. Each one has a criterion, so you know whether it worked.</p>
      {groups.map((group) => (
        <section key={group.title} class="stack">
          <h2>{group.title}</h2>
          <ul class="stack">
            {group.drills.map((drill) => (
              <li key={drill.id}>
                <DrillCard drill={drill} state={states.get(drill.id)} today={today} focus={settings.focus} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Screen>
  );
}
