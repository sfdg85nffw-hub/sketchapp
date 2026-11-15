import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { getDrillStates, putDrillState } from '../db/db';
import { MINUTE_CHOICES } from '../data/catalog';
import { toDateKey } from '../lib/dates';
import { angleError, gradeGuess, nearestDialDirection } from '../lib/ref/lighting';
import {
  addTime,
  endSession,
  formatClock,
  inFinalCountdown,
  planLength,
  previous,
  progress,
  setPaused,
  skip,
  startSession,
  tick,
  type PlayerEvent,
  type PlayerState,
} from '../lib/ref/session';
import { gestureReminder } from '../lib/ref/views';
import { initialDrillState, reviewDrill } from '../lib/srs';
import type { DrillRating } from '../lib/types';
import { modeInfo } from '../ref/modes';
import { addMyRefs, getShown, recordGuess, recordShown } from '../ref/refStore';
import { createSource, type RefSource } from '../ref/sources';
import { pendingSession, type SessionConfig } from '../ref/sessionStore';
import type { RefImage } from '../ref/types';
import { setPendingCapture } from '../ui/captureStore';
import { prefersReducedMotion } from '../ui/hooks';
import { Icon, type IconName } from '../ui/Icon';
import { Button, Divider, FileButton, Header, Sheet, toast } from '../ui/kit';
import { LightDial } from '../ui/LightDial';
import { navigate } from '../ui/router';
import { Screen } from '../ui/Screen';
import { chime, useWakeLock } from '../ui/session-io';
import { blobToImageData, FilteredCanvas } from '../ui/ValueTools';
import { DRILL_RATINGS } from './Drills';
import { lightLabel } from './EntryDetail';

type Steps = 0 | 2 | 3 | 5;
const STEP_CYCLE: readonly (Steps | null)[] = [null, 2, 3, 5];

interface View {
  flip: boolean;
  grey: boolean;
  steps: Steps | null;
  squint: boolean;
  terminator: boolean;
  planes: boolean;
  landmarks: boolean;
  line: boolean;
}

function useObjectUrl(blob: Blob | null | undefined): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) {
      setUrl(undefined);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

/** The picture, through the same value filter as the See tab, plus any overlays. */
function Stage({ image, view, hidden }: { image: RefImage; view: View; hidden: boolean }) {
  const [data, setData] = useState<ImageData | null>(null);
  const source = view.planes && image.overlays?.planes ? image.overlays.planes : image.blob;
  const terminatorUrl = useObjectUrl(view.terminator ? image.overlays?.terminator : null);
  useEffect(() => {
    let alive = true;
    setData(null);
    if (source) void blobToImageData(source).then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [source]);
  const steps = view.steps ?? (view.grey ? 0 : null);
  const label = `${image.title}${steps === null ? '' : steps === 0 ? ', in grayscale' : `, in ${steps} values`}${view.flip ? ', mirrored' : ''}`;
  return (
    <div class={`ref-picture${view.flip ? ' flip' : ''}`} style={{ visibility: hidden ? 'hidden' : 'visible' }}>
      <FilteredCanvas data={data} steps={steps} autoRange={false} label={label} testId="ref-canvas" style={view.squint ? { filter: 'blur(8px)' } : {}} />
      {terminatorUrl && <img class="ref-overlay" src={terminatorUrl} alt="" />}
      {view.landmarks &&
        image.overlays?.landmarks?.map((l) => (
          <span key={l.label} class="ref-landmark" style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%` }}>
            {l.label}
          </span>
        ))}
      {view.line && image.overlays?.line && (
        <svg class="ref-overlay" viewBox="0 0 100 125" preserveAspectRatio="none" aria-label="Line of action">
          <polyline points={image.overlays.line.map(([x, y]) => `${x * 100},${y * 125}`).join(' ')} class="ref-line-casing" />
          <polyline points={image.overlays.line.map(([x, y]) => `${x * 100},${y * 125}`).join(' ')} class="ref-line" />
        </svg>
      )}
    </div>
  );
}

/** Front camera with a pose prompt. Freezes one frame to draw from. Nothing is recorded or sent. */
function MirrorStage({ prompt, onFrozen }: { prompt: string; onFrozen: (frame: Blob) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<'starting' | 'live' | 'unavailable'>('starting');
  const [count, setCount] = useState(5);
  useEffect(() => {
    let stream: MediaStream | null = null;
    let alive = true;
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unavailable');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: { facingMode: 'user', width: { ideal: 1280 } } })
      .then(async (media) => {
        if (!alive) return media.getTracks().forEach((t) => t.stop());
        stream = media;
        video.current!.srcObject = media;
        await video.current!.play();
        setState('live');
      })
      .catch(() => alive && setState('unavailable'));
    return () => {
      alive = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  const freeze = () => {
    const v = video.current;
    if (!v || v.videoWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d')!;
    // Show it as a mirror shows it.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    canvas.toBlob((blob) => blob && onFrozen(blob), 'image/jpeg', 0.9);
  };
  useEffect(() => {
    if (state !== 'live') return;
    if (count <= 0) {
      freeze();
      return;
    }
    const t = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(t);
  }, [state, count]);
  if (state === 'unavailable') {
    return (
      <div class="ref-message" role="alert">
        <h2>No front camera here</h2>
        <p>Mirror mode needs the front camera, and this browser will not open it. Allow the camera for this app in Settings › Safari › Camera, or use a mirror and the From life timer.</p>
      </div>
    );
  }
  return (
    <div class="ref-picture mirror-live">
      <video ref={video} playsInline muted class="flip" aria-label="Front camera, live" />
      <div class="ref-prompt" role="status">
        <p class="h2">{prompt}</p>
        <p>{state === 'live' ? `Holding this frame in ${count}…` : 'Starting the camera…'}</p>
        {state === 'live' && (
          <Button variant="primary" icon="camera" onClick={freeze}>
            Freeze now
          </Button>
        )}
      </div>
    </div>
  );
}

function Control({ icon, label, onClick, pressed, testId }: { icon: IconName; label: string; onClick: () => void; pressed?: boolean; testId?: string }) {
  return (
    <button type="button" class="ref-control" aria-pressed={pressed} onClick={onClick} data-testid={testId}>
      <Icon name={icon} size={22} />
      <span>{label}</span>
    </button>
  );
}

interface Guess {
  index: number;
  value?: number;
  revealed: boolean;
}

export function RefPlayer() {
  const config = useMemo<SessionConfig | null>(() => pendingSession(), []);
  if (!config) {
    return (
      <Screen label="Timed reference">
        <Header title="No session running" back="/ref" />
        <p class="muted">Sessions are not kept after the app closes. Start a new one from Timed Reference.</p>
        <Button variant="primary" onClick={() => navigate('/ref', { replace: true })}>
          Open Timed Reference
        </Button>
      </Screen>
    );
  }
  return <Player config={config} />;
}

function Player({ config }: { config: SessionConfig }) {
  const { plan, prefs, mode } = config;
  const info = modeInfo(mode);
  const total = planLength(plan);
  const guessing = prefs.guessLight && (info.only3d || (info.threeD && prefs.source === '3d'));
  const [player, setPlayer] = useState<PlayerState>(() => startSession(plan));
  const [images, setImages] = useState<(RefImage | undefined)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chrome, setChrome] = useState(true);
  const [view, setView] = useState<View>({ flip: false, grey: false, steps: info.steps ?? null, squint: false, terminator: false, planes: false, landmarks: false, line: false });
  const [more, setMore] = useState(false);
  const [muted, setMuted] = useState(prefs.muted);
  const [flash, setFlash] = useState(0);
  const [guess, setGuess] = useState<Guess | null>(null);
  const [guessed, setGuessed] = useState<Set<number>>(new Set());
  const [ended, setEnded] = useState(false);
  const source = useRef<RefSource | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const loading = useRef<Map<number, Promise<void>>>(new Map());
  const last = useRef(Date.now());

  useWakeLock(!ended);

  useEffect(() => {
    void getShown().then((lastShown) => {
      source.current = createSource({ mode, source: prefs.source, material: prefs.material, lastShown, directionalLight: guessing });
      ensure(0);
    });
  }, []);

  /** Make sure image `index` is loaded (or loading). */
  function ensure(index: number): void {
    if (!source.current || loading.current.has(index)) return;
    const job = source.current
      .next(seen.current)
      .then((image) => {
        if (!image) {
          setError(index === 0 ? 'There is nothing to show yet. Add some photos first.' : null);
          if (index > 0) setPlayer((p) => endSession(p));
          return;
        }
        seen.current.add(image.key);
        setImages((list) => {
          const next = [...list];
          next[index] = image;
          return next;
        });
      })
      .catch((e: unknown) => {
        loading.current.delete(index);
        setError(e instanceof Error ? e.message : 'That reference could not be loaded.');
      });
    loading.current.set(index, job);
  }

  const current = images[player.index];
  const waitingForMirror = mode === 'mirror' && current && !current.blob;
  const held = !current || !!guess || !!waitingForMirror || ended || !!error;

  // Load the current image and the one after it.
  useEffect(() => {
    if (player.done) return;
    ensure(player.index);
    if (current && (total === null || player.index + 1 < total)) ensure(player.index + 1);
  }, [player.index, player.done, current]);

  // The clock. It holds while an image is loading, while guessing and while the mirror waits.
  useEffect(() => {
    last.current = Date.now();
    if (held || player.paused || player.done) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const dt = (now - last.current) / 1000;
      last.current = now;
      setPlayer((p) => {
        const image = images[p.index];
        if (
          guessing &&
          image?.light?.guessable &&
          !guessed.has(p.index) &&
          !plan.memoryLook &&
          p.phase === 'look' &&
          p.remaining - dt <= 0
        ) {
          setGuess({ index: p.index, revealed: false });
          return { ...p, remaining: 0 };
        }
        const step = tick(plan, p, dt);
        handle(step.events);
        return step.state;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [held, player.paused, player.done, images, guessed]);

  useEffect(() => {
    if (player.done && !ended) finish();
  }, [player.done]);

  function handle(events: PlayerEvent[]): void {
    if (events.includes('image-end') || events.includes('hide') || events.includes('finish')) {
      if (!muted) chime();
      if (!prefersReducedMotion()) setFlash((n) => n + 1);
    }
    if (events.includes('reveal') && prefs.showLine) setView((v) => ({ ...v, line: true }));
    if (events.includes('image-end')) setView((v) => ({ ...v, line: false }));
  }

  function finish(): void {
    setEnded(true);
    void recordShown(images.filter((i): i is RefImage => !!i && !i.key.startsWith('life:') && !i.key.startsWith('mirror:')).map((i) => i.key));
  }

  const go = (fn: (p: PlayerState) => PlayerState) => {
    setGuess(null);
    setView((v) => ({ ...v, line: false }));
    setPlayer((p) => fn(p));
  };

  const submitGuess = (value: number) => {
    if (!guess || !current?.light) return;
    const error = angleError(value, current.light.angle);
    void recordGuess(error);
    setGuess({ ...guess, value, revealed: true });
    setGuessed((g) => new Set(g).add(guess.index));
  };

  const relight = async () => {
    if (!current?.relight) return;
    setMore(false);
    const next = await current.relight();
    setImages((list) => list.map((img, i) => (i === player.index ? next : img)));
    setGuessed((g) => {
      const n = new Set(g);
      n.delete(player.index);
      return n;
    });
  };

  if (ended) {
    // A natural finish leaves the index one past the end; ending early keeps the image on screen.
    const shown = total !== null && player.index >= total ? total : player.index + 1;
    return <ContactSheet config={config} images={images.slice(0, shown).filter((i): i is RefImage => !!i)} />;
  }

  const count = total === null ? `${player.index + 1}` : `${Math.min(player.index + 1, total)} of ${total}`;
  const final = inFinalCountdown(player) && !held;
  const lightHidden = guessing && !guessed.has(player.index);
  const phaseLabel = player.phase === 'memory' ? 'Draw from memory' : player.phase === 'reveal' ? (plan.memoryLook ? 'Compare' : 'Check the line') : null;
  const showsPicture = current?.blob && player.phase !== 'memory';

  return (
    <div class={`ref-player${chrome ? '' : ' bare'}`} data-testid="ref-player">
      {chrome && (
        <header class="ref-top">
          <div class="grow">
            <p class="kicker">
              {info.label} · {count}
              {player.paused ? ' · paused' : ''}
            </p>
            <p class="ref-title" data-testid="ref-title">
              {current ? (lightHidden && current.light ? 'Where is the light?' : current.title) : 'Loading…'}
            </p>
          </div>
          <button type="button" class="icon-btn" aria-label="More options" onClick={() => setMore(true)}>
            <Icon name="more" />
          </button>
        </header>
      )}

      <main
        class={`ref-stage${flash ? ' ref-flash' : ''}`}
        key={`flash-${flash}`}
        aria-label="Reference"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button, a, .ref-prompt')) return;
          setChrome(!chrome);
        }}
      >
        {error ? (
          <div class="ref-message" role="alert">
            <h2>Can't show this one</h2>
            <p>{error}</p>
            <Button onClick={() => navigate('/ref', { replace: true })}>Back to Timed Reference</Button>
          </div>
        ) : !current ? (
          <p class="ref-message" role="status">
            Getting the next reference…
          </p>
        ) : waitingForMirror ? (
          <MirrorStage
            prompt={current.prompt ?? ''}
            onFrozen={(blob) => setImages((list) => list.map((img, i) => (i === player.index ? { ...current, blob } : img)))}
          />
        ) : current.blob ? (
          <>
            <Stage image={current} view={view} hidden={player.phase === 'memory'} />
            {player.phase === 'memory' && (
              <div class="ref-message">
                <p class="h2">Draw it from memory.</p>
                <p class="muted">It comes back for comparison when the time is up.</p>
              </div>
            )}
          </>
        ) : null}

        {current && !error && !waitingForMirror && (
          <div class={`ref-clock${current.blob && player.phase !== 'memory' ? '' : ' big'}${final ? ' final' : ''}`} aria-hidden={current.blob ? undefined : 'false'}>
            <svg class="ref-ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="44" />
            </svg>
            <span role="timer" aria-label={`${Math.ceil(player.remaining)} seconds left`} data-testid="ref-countdown">
              {formatClock(player.remaining)}
            </span>
          </div>
        )}
        {phaseLabel && <p class="ref-phase">{phaseLabel}</p>}
        {prefs.guidance && current && player.phase === 'look' && player.total - player.remaining < 3 && <p class="ref-guidance">{gestureReminder(player.index)}</p>}
        {current?.seed !== undefined && showsPicture && <span class="ref-seed">Seed {current.seed}</span>}
        {current?.credit && showsPicture && chrome && <p class="ref-credit">{current.credit.line}</p>}
        {!current?.blob && current && mode === 'life' && !prefs.guidance && <p class="ref-life">Line of action first. Weight, then limbs.</p>}
      </main>

      <div class="ref-progress" aria-hidden="true">
        <i style={{ width: `${progress(player) * 100}%` }} />
      </div>

      {chrome && (
        <nav class="ref-controls" aria-label="Session controls">
          <Control icon="prev" label="Previous" onClick={() => go((p) => previous(plan, p))} />
          <Control icon={player.paused ? 'play' : 'pause'} label={player.paused ? 'Resume' : 'Pause'} onClick={() => setPlayer((p) => setPaused(p, !p.paused))} testId="ref-pause" />
          <Control icon="skip" label="Skip" onClick={() => go((p) => skip(plan, p).state)} testId="ref-skip" />
          <Control icon="plus30" label="Add 30s" onClick={() => setPlayer((p) => addTime(p))} />
          <Control icon="stop" label="End" onClick={() => go((p) => endSession(p))} testId="ref-end" />
          <Control icon="flip" label="Flip" pressed={view.flip} onClick={() => setView({ ...view, flip: !view.flip })} />
          <Control icon="neutral" label="Gray" pressed={view.grey} onClick={() => setView({ ...view, grey: !view.grey })} />
          <Control
            icon="values"
            label={view.steps === null ? 'Values' : `${view.steps} values`}
            pressed={view.steps !== null}
            onClick={() => setView({ ...view, steps: STEP_CYCLE[(STEP_CYCLE.indexOf(view.steps) + 1) % STEP_CYCLE.length]! })}
            testId="ref-values"
          />
          <Control icon="squint" label="Squint" pressed={view.squint} onClick={() => setView({ ...view, squint: !view.squint })} />
          <Control icon={muted ? 'mute' : 'sound'} label={muted ? 'Muted' : 'Chime'} pressed={muted} onClick={() => setMuted(!muted)} />
        </nav>
      )}

      {guess && current?.light && (
        <Sheet
          title={guess.revealed ? 'The light' : 'Where is the light coming from?'}
          onClose={() => {
            setGuessed((g) => new Set(g).add(guess.index));
            go((p) => skip(plan, p).state);
          }}
        >
          <p class="muted small">{guess.revealed ? `${current.light.name}. ${current.light.note}` : 'Tap the direction on the dial, as it appears in the picture.'}</p>
          <LightDial
            label="Guess the light direction"
            value={guess.value}
            answer={guess.revealed ? current.light.angle : undefined}
            onChange={(v) => !guess.revealed && submitGuess(v)}
          />
          {guess.revealed && guess.value !== undefined && (
            <p class="h3" role="status">
              Light from {lightLabel(nearestDialDirection(current.light.angle))}. You were {Math.round(angleError(guess.value, current.light.angle))}° off:{' '}
              {{ right: 'right.', close: 'close.', off: 'look again at where the shadows fall.' }[gradeGuess(angleError(guess.value, current.light.angle))]}
            </p>
          )}
          {guess.revealed ? (
            <Button variant="primary" block large onClick={() => go((p) => skip(plan, p).state)}>
              Next image
            </Button>
          ) : (
            <Button variant="quiet" onClick={() => {
              setGuessed((g) => new Set(g).add(guess.index));
              go((p) => skip(plan, p).state);
            }}>
              Skip the guess
            </Button>
          )}
        </Sheet>
      )}

      {more && (
        <Sheet title="Options" onClose={() => setMore(false)}>
          {current?.overlays?.terminator && (
            <label class="switch-row">
              <input class="check" type="checkbox" checked={view.terminator} onChange={(e) => setView({ ...view, terminator: e.currentTarget.checked })} />
              <span>Show the terminator: the line where light turns to shadow</span>
            </label>
          )}
          {current?.overlays?.planes && (
            <label class="switch-row">
              <input class="check" type="checkbox" checked={view.planes} onChange={(e) => setView({ ...view, planes: e.currentTarget.checked })} />
              <span>Show the big planes of the head</span>
            </label>
          )}
          {current?.overlays?.landmarks && current.overlays.landmarks.length > 0 && (
            <label class="switch-row">
              <input class="check" type="checkbox" checked={view.landmarks} onChange={(e) => setView({ ...view, landmarks: e.currentTarget.checked })} />
              <span>Label the landmarks</span>
            </label>
          )}
          {current?.overlays?.line && (
            <label class="switch-row">
              <input class="check" type="checkbox" checked={view.line} onChange={(e) => setView({ ...view, line: e.currentTarget.checked })} />
              <span>Show the line of action</span>
            </label>
          )}
          {current?.relight && (
            <Button block icon="sun" onClick={() => void relight()}>
              Same scene, new light
            </Button>
          )}
          {current?.light && !lightHidden && (
            <p class="small muted">
              {current.light.name}: light from {lightLabel(nearestDialDirection(current.light.angle))}. {current.detail}
            </p>
          )}
          {current?.credit && (
            <p class="small">
              {current.credit.line}{' '}
              <a href={current.credit.source} target="_blank" rel="noreferrer">
                Source
              </a>
            </p>
          )}
          <Button variant="primary" block onClick={() => setMore(false)}>
            Done
          </Button>
        </Sheet>
      )}
    </div>
  );
}

function snapMinutes(minutes: number): number {
  return MINUTE_CHOICES.reduce((best, m) => (Math.abs(m - minutes) < Math.abs(best - minutes) ? m : best), MINUTE_CHOICES[0]!);
}

function Thumb({ image }: { image: RefImage }) {
  const url = useObjectUrl(image.thumbUrl ? null : image.blob);
  const src = image.thumbUrl ?? url;
  return src ? <img src={src} alt={image.title} loading="lazy" /> : <div class="ref-thumb-empty" aria-hidden="true" />;
}

/** End of session: what he drew from, a way to photograph the page, and a rating for the schedule. */
function ContactSheet({ config, images }: { config: SessionConfig; images: RefImage[] }) {
  const info = modeInfo(config.mode);
  const [rated, setRated] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const pictures = images.filter((i) => i.blob);
  const seconds = Math.round(images.length * (config.plan.blocks[0]?.seconds ?? 60));

  const rate = async (rating: DrillRating) => {
    const today = toDateKey(new Date());
    const state = (await getDrillStates()).get(info.drillId) ?? initialDrillState(info.drillId, today);
    const next = reviewDrill(state, rating, today);
    await putDrillState(next);
    setRated(true);
    toast(`Logged. This practice comes round again in ${next.intervalDays} ${next.intervalDays === 1 ? 'day' : 'days'}.`);
  };

  return (
    <Screen
      label="Session finished"
      back="/ref"
      actions={
        <FileButton
          variant="primary"
          large
          icon="camera"
          camera
          onFile={(file) => {
            setPendingCapture(file, {
              subject: info.journalSubject,
              minutes: snapMinutes(Math.max(1, seconds / 60)),
              reference: { mode: info.label, summary: config.summary },
              drillId: info.drillId,
            });
            navigate('/capture');
          }}
        >
          Photograph your page
        </FileButton>
      }
    >
      <Header title={`${images.length} ${images.length === 1 ? 'image' : 'images'} done`} kicker={`${info.label} · ${config.summary}`} back="/ref" />
      {pictures.length > 0 ? (
        <ul class="ref-sheet" aria-label="What you drew from">
          {pictures.map((image) => (
            <li key={image.key}>
              <Thumb image={image} />
              {image.credit && <p class="small">{image.credit.line}</p>}
              {image.key.startsWith('mirror:') && (
                <Button
                  variant="quiet"
                  disabled={saved.has(image.key)}
                  onClick={() =>
                    void addMyRefs([image.blob!], 'mirror').then(() => {
                      setSaved((s) => new Set(s).add(image.key));
                      toast('Saved to My References.');
                    })
                  }
                >
                  {saved.has(image.key) ? 'Saved' : 'Save to My References'}
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p class="muted">Drawn from life: nothing to show here but your page.</p>
      )}
      {config.mode === 'mirror' && <p class="small muted">Mirror frames stay on this phone only if you save them. The rest are gone when you leave.</p>}
      <Divider />
      {!rated ? (
        <section class="stack" aria-label="How did it go?">
          <h2>How did it go?</h2>
          <p class="muted small">This feeds the practice schedule.</p>
          {DRILL_RATINGS.map((option) => (
            <button key={option.value} type="button" class="list-link" onClick={() => void rate(option.value)}>
              <Icon name={option.icon} />
              <span class="grow">
                {option.label}
                <span class="sub">{option.detail}</span>
              </span>
            </button>
          ))}
        </section>
      ) : (
        <p class="card card-soft">Rated. Photograph the page to keep it in the journal.</p>
      )}
      <Button block icon="shuffle" onClick={() => navigate(`/ref/${config.mode}`, { replace: true })}>
        Another session
      </Button>
    </Screen>
  );
}
