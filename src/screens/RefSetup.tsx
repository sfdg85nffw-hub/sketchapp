import { useEffect, useState } from 'preact/hooks';
import { saveSettings } from '../db/db';
import { formatBytes, type PackIndex } from '../lib/ref/packs';
import {
  BUILTIN_SEQUENCES,
  clampCount,
  clampSeconds,
  describeBlocks,
  formatSeconds,
  MAX_IMAGES,
  MAX_SECONDS,
  MIN_SECONDS,
  PRESET_SECONDS,
  sequencePlan,
  simplePlan,
  STEP_SECONDS,
  planSeconds,
  type Block,
  type Sequence,
} from '../lib/ref/session';
import { newId } from '../lib/id';
import type { RefPrefs } from '../lib/types';
import { isRefMode, modeInfo, type RefMode } from '../ref/modes';
import { loadPackIndex, packStatuses, type PackStatus } from '../ref/packStore';
import { getMyRefs, getSequences, saveSequences } from '../ref/refStore';
import { setPendingSession } from '../ref/sessionStore';
import { useLive, useSettings } from '../ui/hooks';
import { Icon } from '../ui/Icon';
import { Button, Chips, Header, Section, Segmented, Sheet, toast } from '../ui/kit';
import { currentRoute, navigate } from '../ui/router';
import { Screen } from '../ui/Screen';
import { unlockAudio } from '../ui/session-io';

export function defaultPrefs(mode: RefMode): RefPrefs {
  const info = modeInfo(mode);
  return {
    mode,
    source: info.only3d ? '3d' : 'photos',
    seconds: info.seconds,
    count: mode === 'life' ? 6 : 10,
    memory: false,
    memoryLook: 15,
    guessLight: false,
    guidance: mode === 'poses' || mode === 'life',
    showLine: false,
    material: 'plaster',
    muted: false,
  };
}

/** The offline state of a photo pack, said in words with an icon. */
export function PackState({ status, bytes }: { status: PackStatus | undefined; bytes: number }) {
  return status ? (
    <span class="status">
      <Icon name="check" size={16} /> On this phone · {formatBytes(status.bytes)}
    </span>
  ) : (
    <span class="status">
      <Icon name="download" size={16} /> Not saved offline · {formatBytes(bytes)}
    </span>
  );
}

function SequenceBuilder({ onSave, onClose }: { onSave: (sequence: Sequence) => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([{ count: 5, seconds: 30 }]);
  const update = (i: number, patch: Partial<Block>) => setBlocks(blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  return (
    <Sheet title="Build a class sequence" onClose={onClose}>
      <div class="field">
        <label for="seq-name">Name</label>
        <input id="seq-name" class="input" type="text" maxLength={40} placeholder="Train ride" value={name} onInput={(e) => setName(e.currentTarget.value)} />
      </div>
      <ol class="stack">
        {blocks.map((block, i) => (
          <li key={i} class="card card-soft stack">
            <p class="kicker">Part {i + 1}</p>
            <div class="row">
              <span class="grow small">Images</span>
              <div class="stepper" style={{ width: '9rem' }}>
                <button type="button" aria-label={`Fewer images in part ${i + 1}`} onClick={() => update(i, { count: clampCount(block.count - 1) })}>
                  −
                </button>
                <output aria-live="polite">{block.count}</output>
                <button type="button" aria-label={`More images in part ${i + 1}`} onClick={() => update(i, { count: clampCount(block.count + 1) })}>
                  +
                </button>
              </div>
            </div>
            <Chips
              label={`Time per image in part ${i + 1}`}
              options={PRESET_SECONDS.map((s) => ({ value: s, label: formatSeconds(s) }))}
              selected={[block.seconds]}
              onToggle={(seconds) => update(i, { seconds })}
            />
            {blocks.length > 1 && (
              <Button variant="quiet" onClick={() => setBlocks(blocks.filter((_, j) => j !== i))}>
                Remove this part
              </Button>
            )}
          </li>
        ))}
      </ol>
      <Button block icon="plus" onClick={() => setBlocks([...blocks, { count: 3, seconds: 60 }])}>
        Add a part
      </Button>
      <p class="small muted">{describeBlocks(blocks)}</p>
      <Button
        variant="primary"
        block
        large
        onClick={() => onSave({ id: newId('seq'), name: name.trim() || describeBlocks(blocks), blocks })}
      >
        Save sequence
      </Button>
    </Sheet>
  );
}

export function RefSetup({ mode: modeParam }: { mode: string }) {
  const mode: RefMode = isRefMode(modeParam) ? modeParam : 'faces';
  const info = modeInfo(mode);
  const settings = useSettings();
  const saved = settings.reference?.mode === mode ? settings.reference : undefined;
  const [prefs, setPrefs] = useState<RefPrefs>(() => ({ ...defaultPrefs(mode), ...saved, mode }));
  const [timing, setTiming] = useState<'one' | 'class'>(() => (currentRoute().query.get('seq') || saved?.sequenceId ? 'class' : 'one'));
  const [sequenceId, setSequenceId] = useState<string>(() => currentRoute().query.get('seq') ?? saved?.sequenceId ?? BUILTIN_SEQUENCES[1]!.id);
  const [more, setMore] = useState(false);
  const [building, setBuilding] = useState(false);
  const sequences = useLive(getSequences) ?? [];
  const myRefs = useLive(getMyRefs);
  const statuses = useLive(packStatuses);
  const [index, setIndex] = useState<PackIndex | null>(null);
  useEffect(() => void loadPackIndex().then(setIndex), []);

  const set = (patch: Partial<RefPrefs>) => setPrefs({ ...prefs, ...patch });
  const allSequences = [...BUILTIN_SEQUENCES, ...sequences];
  const sequence = allSequences.find((s) => s.id === sequenceId) ?? BUILTIN_SEQUENCES[0]!;
  const usesPhotos = info.pack && !(info.threeD && prefs.source === '3d');
  const uses3d = info.only3d || (info.threeD && prefs.source === '3d');
  const pack = info.pack && index ? index[info.pack] : undefined;
  const memoryLook = prefs.memory ? prefs.memoryLook : undefined;
  const plan = timing === 'class' ? sequencePlan(sequence, memoryLook) : simplePlan(prefs.seconds, prefs.count, memoryLook);
  if (prefs.showLine && uses3d && mode === 'poses') plan.review = 6;
  const total = planSeconds(plan);
  const summary = timing === 'class' ? describeBlocks(sequence.blocks) : `${prefs.count === null ? 'until stopped' : `${prefs.count} ×`} ${formatSeconds(clampSeconds(prefs.seconds))}`;
  const empty = mode === 'mine' && myRefs !== undefined && myRefs.length === 0;
  const packEmpty = usesPhotos && pack && pack.items.length === 0;

  const start = () => {
    unlockAudio();
    const chosen: RefPrefs = { ...prefs, seconds: clampSeconds(prefs.seconds), ...(timing === 'class' ? { sequenceId } : { sequenceId: undefined }) };
    void saveSettings({ reference: chosen });
    setPendingSession({ mode, plan, prefs: chosen, summary });
    navigate('/refplay');
  };

  return (
    <Screen
      label={info.label}
      back="/ref"
      actions={
        <Button variant="primary" large icon="play" disabled={empty || !!packEmpty} onClick={start}>
          Start
        </Button>
      }
    >
      <Header title={info.label} kicker="Timed reference" back="/ref">
        <button type="button" class="icon-btn" aria-label="More options" onClick={() => setMore(true)}>
          <Icon name="settings" />
        </button>
      </Header>
      <p class="muted">{info.blurb}.</p>

      {info.sources && (
        <Segmented
          label="Reference source"
          options={[
            { value: 'photos', label: info.sources.photos },
            { value: '3d', label: info.sources['3d'] },
          ]}
          value={prefs.source}
          onChange={(source) => set({ source })}
        />
      )}

      {usesPhotos && pack && (
        <p class="card card-soft small">
          {pack.items.length} images. <PackState status={statuses?.[pack.id]} bytes={pack.bytes} />
          {!statuses?.[pack.id] && <span class="muted" style={{ display: 'block' }}>Shown from the app's own server while you are online. Save it offline from Timed Reference.</span>}
        </p>
      )}
      {packEmpty && <p class="card" role="alert">This pack has not been built into the app yet.</p>}
      {uses3d && mode !== 'shapes' && <p class="small muted">Generated on this phone: every image is new.</p>}
      {mode === 'mirror' && <p class="small muted">Uses the front camera. Frames stay on this phone and are kept only if you save them.</p>}
      {empty && (
        <p class="card" role="alert">
          No photos of your own yet. Add some from Timed Reference › My References.
        </p>
      )}

      <Section title="Timing">
        {mode !== 'life' && (
          <Segmented
            label="Timing"
            options={[
              { value: 'one', label: 'One timing' },
              { value: 'class', label: 'Class mode' },
            ]}
            value={timing}
            onChange={setTiming}
          />
        )}
        {timing === 'one' || mode === 'life' ? (
          <>
            <div class="field">
              <span class="label">
                Each image <span class="hint">· {formatSeconds(clampSeconds(prefs.seconds))}</span>
              </span>
              <Chips
                label="Time per image"
                options={PRESET_SECONDS.map((s) => ({ value: s, label: formatSeconds(s) }))}
                selected={[clampSeconds(prefs.seconds)]}
                onToggle={(seconds) => set({ seconds })}
              />
              <input
                type="range"
                aria-label="Seconds per image"
                min={MIN_SECONDS}
                max={MAX_SECONDS}
                step={STEP_SECONDS}
                value={clampSeconds(prefs.seconds)}
                onInput={(e) => set({ seconds: Number(e.currentTarget.value) })}
              />
            </div>
            <div class="field">
              <span class="label">How many</span>
              <div class="row">
                <div class="stepper grow" style={{ opacity: prefs.count === null ? 0.45 : 1 }}>
                  <button type="button" aria-label="Fewer images" disabled={prefs.count === null} onClick={() => set({ count: clampCount((prefs.count ?? 10) - 1) })}>
                    −
                  </button>
                  <output aria-live="polite" data-testid="ref-count">
                    {prefs.count === null ? '∞' : prefs.count}
                  </output>
                  <button type="button" aria-label="More images" disabled={prefs.count === null || prefs.count >= MAX_IMAGES} onClick={() => set({ count: clampCount((prefs.count ?? 10) + 1) })}>
                    +
                  </button>
                </div>
                <button type="button" class="chip" aria-pressed={prefs.count === null} onClick={() => set({ count: prefs.count === null ? 10 : null })}>
                  <span class="tick">
                    <Icon name="check" size={16} />
                  </span>
                  Until I stop
                </button>
              </div>
            </div>
          </>
        ) : (
          <div class="stack" role="radiogroup" aria-label="Class sequence">
            {allSequences.map((s) => (
              <button key={s.id} type="button" role="radio" aria-checked={s.id === sequenceId} class="list-link" onClick={() => setSequenceId(s.id)}>
                <Icon name={s.id === sequenceId ? 'ratingYes' : 'ratingNo'} size={20} />
                <span class="grow">
                  {s.name}
                  <span class="sub">{describeBlocks(s.blocks)}</span>
                </span>
              </button>
            ))}
            <Button block icon="plus" onClick={() => setBuilding(true)}>
              Build a sequence
            </Button>
          </div>
        )}
        <p class="small muted" data-testid="ref-summary">
          {total === null ? 'Runs until you stop it.' : `About ${Math.max(1, Math.round(total / 60))} ${Math.round(total / 60) === 1 ? 'minute' : 'minutes'} in all.`}
          {prefs.memory ? ` Drawing from memory: ${formatSeconds(prefs.memoryLook)} to look, then it hides.` : ''}
          {prefs.guessLight && uses3d ? ' Guess the light is on.' : ''}
        </p>
      </Section>

      {more && (
        <Sheet title="More options" onClose={() => setMore(false)}>
          {mode !== 'life' && mode !== 'mirror' && (
            <label class="switch-row">
              <input class="check" type="checkbox" checked={prefs.memory} onChange={(e) => set({ memory: e.currentTarget.checked })} />
              <span>
                <strong>Draw from memory</strong>
                <span class="hint small" style={{ display: 'block' }}>
                  Look, then the image hides while you draw, then it comes back to compare.
                </span>
              </span>
            </label>
          )}
          {prefs.memory && (
            <Chips label="Seconds to look" options={[5, 10, 15, 30, 60].map((s) => ({ value: s, label: `Look ${formatSeconds(s)}` }))} selected={[prefs.memoryLook]} onToggle={(memoryLook) => set({ memoryLook })} />
          )}
          {uses3d && (
            <label class="switch-row">
              <input class="check" type="checkbox" checked={prefs.guessLight} onChange={(e) => set({ guessLight: e.currentTarget.checked })} />
              <span>
                <strong>Guess the light</strong>
                <span class="hint small" style={{ display: 'block' }}>
                  At the end of each image, tap where the light came from. The app shows how far off you were.
                </span>
              </span>
            </label>
          )}
          {(mode === 'poses' || mode === 'life') && (
            <label class="switch-row">
              <input class="check" type="checkbox" checked={prefs.guidance} onChange={(e) => set({ guidance: e.currentTarget.checked })} />
              <span>
                <strong>Gesture reminders</strong>
                <span class="hint small" style={{ display: 'block' }}>
                  One line at the start of each pose: line of action, shoulders against hips, the weight-bearing leg.
                </span>
              </span>
            </label>
          )}
          {mode === 'poses' && uses3d && (
            <label class="switch-row">
              <input class="check" type="checkbox" checked={prefs.showLine} onChange={(e) => set({ showLine: e.currentTarget.checked })} />
              <span>
                <strong>Show the line of action after each pose</strong>
                <span class="hint small" style={{ display: 'block' }}>
                  Six seconds to check your drawing against it.
                </span>
              </span>
            </label>
          )}
          {mode === 'shapes' && (
            <div class="field">
              <span class="label">Material</span>
              <Segmented
                label="Material"
                options={[
                  { value: 'plaster', label: 'Plaster' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'metal', label: 'Metal' },
                  { value: 'mixed', label: 'Mixed' },
                ]}
                value={prefs.material}
                onChange={(material) => set({ material })}
              />
            </div>
          )}
          <label class="switch-row">
            <input class="check" type="checkbox" checked={prefs.muted} onChange={(e) => set({ muted: e.currentTarget.checked })} />
            <span>
              <strong>No chime</strong>
              <span class="hint small" style={{ display: 'block' }}>
                The screen still flashes when the time is up.
              </span>
            </span>
          </label>
          <Button variant="primary" block onClick={() => setMore(false)}>
            Done
          </Button>
        </Sheet>
      )}

      {building && (
        <SequenceBuilder
          onClose={() => setBuilding(false)}
          onSave={(s) => {
            void saveSequences([...sequences, s]);
            setSequenceId(s.id);
            setBuilding(false);
            toast('Sequence saved.');
          }}
        />
      )}
    </Screen>
  );
}
