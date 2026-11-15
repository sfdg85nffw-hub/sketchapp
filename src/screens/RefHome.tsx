import { useEffect, useState } from 'preact/hooks';
import { summariseGuesses } from '../lib/ref/lighting';
import { PACK_IDS, PACK_LABELS, type PackIndex } from '../lib/ref/packs';
import { BUILTIN_SEQUENCES, describeBlocks, formatSeconds } from '../lib/ref/session';
import { MODES, modeInfo } from '../ref/modes';
import { loadPackIndex, makePackOffline, packStatuses, removePackOffline } from '../ref/packStore';
import { addMyRefs, getLightGuesses, getMyRefs, getSequences, removeMyRef, saveSequences, type MyRef } from '../ref/refStore';
import { useLive, useSettings } from '../ui/hooks';
import { Icon } from '../ui/Icon';
import { Button, Divider, Header, Section, Sheet, StoredImg, toast } from '../ui/kit';
import { navigate } from '../ui/router';
import { Screen } from '../ui/Screen';
import { PackState } from './RefSetup';

function MyReferences() {
  const refs = useLive(getMyRefs);
  const [managing, setManaging] = useState<MyRef | null>(null);
  const [busy, setBusy] = useState(false);
  if (!refs) return null;
  return (
    <Section title="My References" hint="Your own photos, kept on this phone and in your backups. Good for your NYC shots.">
      {refs.length > 0 && (
        <div class="myref-grid">
          {refs.slice(-12).map((ref) => (
            <button key={ref.id} type="button" aria-label="Your photo. Tap to remove it." onClick={() => setManaging(ref)}>
              <StoredImg id={ref.thumbId} alt="" />
            </button>
          ))}
        </div>
      )}
      <p class="small muted">{refs.length === 0 ? 'None yet.' : `${refs.length} ${refs.length === 1 ? 'photo' : 'photos'}.`}</p>
      <label class="btn btn-block">
        <Icon name="plus" size={20} />
        <span>{busy ? 'Adding…' : 'Add photos'}</span>
        <input
          class="vh"
          type="file"
          accept="image/*"
          multiple
          data-testid="myref-input"
          onChange={(event) => {
            const input = event.currentTarget;
            const files = [...(input.files ?? [])];
            input.value = '';
            if (!files.length) return;
            setBusy(true);
            void addMyRefs(files, 'import').then((n) => {
              setBusy(false);
              toast(n === files.length ? `${n} ${n === 1 ? 'photo' : 'photos'} added.` : `${n} of ${files.length} added. The rest were not images.`);
            });
          }}
        />
      </label>
      {managing && (
        <Sheet title="Remove this photo?" onClose={() => setManaging(null)}>
          <StoredImg id={managing.thumbId} alt="The photo to remove" />
          <p>It comes out of My References on this phone. Photos in your camera roll are not touched.</p>
          <Button
            block
            icon="trash"
            onClick={() => {
              void removeMyRef(managing.id);
              setManaging(null);
            }}
          >
            Remove
          </Button>
          <Button variant="primary" block onClick={() => setManaging(null)}>
            Keep it
          </Button>
        </Sheet>
      )}
    </Section>
  );
}

function Packs() {
  const [index, setIndex] = useState<PackIndex | null>(null);
  const statuses = useLive(packStatuses);
  const [working, setWorking] = useState<{ id: string; done: number; total: number } | null>(null);
  useEffect(() => void loadPackIndex().then(setIndex), []);
  if (!index || !statuses) return null;
  const packs = PACK_IDS.map((id) => index[id]).filter((p) => p.items.length > 0);
  if (packs.length === 0) {
    return (
      <Section title="Photo packs">
        <p class="card card-note">The photo packs have not been built into this copy of the app yet. The 3D modes, Shapes, Skull, Mirror and My References all work without them.</p>
      </Section>
    );
  }
  return (
    <Section title="Photo packs" hint="Real photographs, paintings and sculpture, all public domain or openly licensed. Save a pack to use it with no signal.">
      <ul class="stack">
        {packs.map((pack) => {
          const status = statuses[pack.id];
          const busy = working?.id === pack.id;
          return (
            <li key={pack.id} class="card card-soft stack" data-testid={`pack-${pack.id}`}>
              <div class="row">
                <span class="grow">
                  <strong>{PACK_LABELS[pack.id]}</strong> <span class="small muted">· {pack.items.length} images</span>
                </span>
              </div>
              <PackState status={status} bytes={pack.bytes} />
              {busy ? (
                <p class="small" role="status">
                  Saving {working.done} of {working.total} files…
                </p>
              ) : status ? (
                <Button variant="quiet" onClick={() => void removePackOffline(pack).then(() => toast(`${PACK_LABELS[pack.id]} removed from this phone.`))}>
                  Remove from this phone
                </Button>
              ) : (
                <Button
                  icon="download"
                  disabled={working !== null}
                  onClick={() => {
                    setWorking({ id: pack.id, done: 0, total: pack.items.length * 2 });
                    makePackOffline(pack, (done, total) => setWorking({ id: pack.id, done, total })).then(
                      () => {
                        setWorking(null);
                        toast(`${PACK_LABELS[pack.id]} saved. It works offline now.`);
                      },
                      (e: unknown) => {
                        setWorking(null);
                        toast(e instanceof Error ? e.message : 'Could not save the pack.');
                      },
                    );
                  }}
                >
                  Make available offline
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

export function RefHome() {
  const settings = useSettings();
  const guesses = useLive(getLightGuesses);
  const sequences = useLive(getSequences);
  const last = settings.reference;
  const lastMode = last ? modeInfo(last.mode) : null;
  const summary = summariseGuesses(guesses ?? []);
  const grid = MODES.filter((m) => m.id !== 'life');

  return (
    <Screen
      label="Timed reference"
      back="/practice"
      actions={
        <Button variant="primary" large icon="play" onClick={() => navigate(`/ref/${lastMode?.id ?? 'poses'}`)}>
          {lastMode ? `Quick start: ${lastMode.label}` : 'Start with poses'}
        </Button>
      }
    >
      <Header title="Timed reference" back="/practice" />
      <p class="muted">Something to draw, on a timer. Everything here works offline and comes from the app itself.</p>
      <ul class="ref-grid" aria-label="What to draw">
        {grid.map((mode) => (
          <li key={mode.id} style={{ display: 'grid' }}>
            <a class="ref-tile" href={`#/ref/${mode.id}`}>
              <Icon name={mode.icon} size={28} />
              <strong>{mode.label}</strong>
              <span class="sub">{mode.sources ? `${mode.sources.photos} · ${mode.sources['3d']}` : mode.blurb}</span>
            </a>
          </li>
        ))}
      </ul>
      <a class="list-link" href="#/gesture">
        <Icon name="timer" />
        <span class="grow">
          From life
          <span class="sub">Just the timer, for the people across from you on the train</span>
        </span>
        <Icon name="chevron" size={20} />
      </a>

      {lastMode && last && (
        <p class="small muted">
          Last time: {lastMode.label}, {last.sequenceId ? (BUILTIN_SEQUENCES.find((s) => s.id === last.sequenceId)?.name ?? 'your sequence') : `${last.count ?? 'until stopped'} × ${formatSeconds(last.seconds)}`}.
        </p>
      )}

      {summary.count > 0 && (
        <p class="card card-soft">
          <strong>Guess the light:</strong> {summary.count} {summary.count === 1 ? 'guess' : 'guesses'}, lately {Math.round(summary.recent ?? 0)}° off on average
          {summary.earlier !== null ? `, down from ${Math.round(summary.earlier)}°` : ''}.
        </p>
      )}

      <Divider />
      <Section title="Class sessions" hint="Ramp up the way a life class does. Choose one in any mode under Class mode.">
        <ul class="stack">
          {[...BUILTIN_SEQUENCES, ...(sequences ?? [])].map((s) => (
            <li key={s.id} class="row card card-soft">
              <span class="grow">
                <strong>{s.name}</strong>
                <span class="small muted" style={{ display: 'block' }}>
                  {describeBlocks(s.blocks)}
                </span>
              </span>
              {!BUILTIN_SEQUENCES.includes(s) && (
                <button type="button" class="icon-btn" aria-label={`Delete ${s.name}`} onClick={() => void saveSequences((sequences ?? []).filter((x) => x.id !== s.id))}>
                  <Icon name="trash" size={20} />
                </button>
              )}
              <a class="icon-btn" href={`#/ref/${lastMode?.id ?? 'poses'}?seq=${s.id}`} aria-label={`Use ${s.name}`}>
                <Icon name="chevron" size={20} />
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Divider />
      <MyReferences />
      <Divider />
      <Packs />
    </Screen>
  );
}
