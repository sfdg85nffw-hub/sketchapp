import { useEffect, useRef, useState } from 'preact/hooks';
import { getDrillStates, putDrillState } from '../db/db';
import { toDateKey } from '../lib/dates';
import { initialDrillState, reviewDrill } from '../lib/srs';
import type { DrillRating } from '../lib/types';
import { setPendingCapture } from '../ui/captureStore';
import { prefersReducedMotion } from '../ui/hooks';
import { Button, Chips, FileButton, Header, Segmented, toast } from '../ui/kit';
import { navigate } from '../ui/router';
import { Screen } from '../ui/Screen';
import { DRILL_RATINGS } from './Drills';

const POSE_LENGTHS = [
  { value: 30, label: '30 sec' },
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
] as const;

const POSE_COUNTS = [3, 5, 6, 10, 15, 20] as const;

type Phase = 'setup' | 'running' | 'paused' | 'finished';

/** A soft two-note chime. Quiet on purpose: this gets used on the subway. */
function chime(audio: AudioContext | null): void {
  navigator.vibrate?.(120);
  if (!audio) return;
  const now = audio.currentTime;
  for (const [i, frequency] of [660, 880].entries()) {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    const start = now + i * 0.16;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.5);
  }
}

export function Gesture() {
  const [seconds, setSeconds] = useState<number>(60);
  const [count, setCount] = useState<number>(6);
  const [phase, setPhase] = useState<Phase>('setup');
  const [pose, setPose] = useState(1);
  const [left, setLeft] = useState(60);
  const [flash, setFlash] = useState(0);
  const [logged, setLogged] = useState(false);
  const endsAt = useRef(0);
  const audio = useRef<AudioContext | null>(null);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  const release = () => {
    void wakeLock.current?.release().catch(() => undefined);
    wakeLock.current = null;
  };

  useEffect(() => {
    if (phase !== 'running') return;
    const tick = setInterval(() => {
      const remaining = (endsAt.current - Date.now()) / 1000;
      if (remaining > 0) {
        setLeft(remaining);
        return;
      }
      chime(audio.current);
      setFlash((n) => n + 1);
      setPose((current) => {
        if (current >= count) {
          setPhase('finished');
          release();
          return current;
        }
        endsAt.current = Date.now() + seconds * 1000;
        setLeft(seconds);
        return current + 1;
      });
    }, 200);
    return () => clearInterval(tick);
  }, [phase, count, seconds]);

  useEffect(() => release, []);

  const start = () => {
    try {
      // Created inside the tap so iOS allows sound later.
      audio.current ??= new AudioContext();
      void audio.current.resume();
    } catch {
      audio.current = null;
    }
    void navigator.wakeLock
      ?.request('screen')
      .then((lock) => (wakeLock.current = lock))
      .catch(() => undefined);
    setPose(1);
    setLeft(seconds);
    setLogged(false);
    endsAt.current = Date.now() + seconds * 1000;
    setPhase('running');
  };

  const pauseOrResume = () => {
    if (phase === 'running') {
      setPhase('paused');
    } else {
      endsAt.current = Date.now() + left * 1000;
      setPhase('running');
    }
  };

  const next = () => {
    if (pose >= count) {
      setPhase('finished');
      release();
      return;
    }
    setPose(pose + 1);
    setLeft(seconds);
    endsAt.current = Date.now() + seconds * 1000;
  };

  const log = async (rating: DrillRating) => {
    const today = toDateKey(new Date());
    const state = (await getDrillStates()).get('gesture-session') ?? initialDrillState('gesture-session', today);
    await putDrillState(reviewDrill(state, rating, today));
    setLogged(true);
    toast('Logged against the gesture drill.');
  };

  if (phase === 'setup') {
    return (
      <Screen
        label="Gesture timer"
        back="/practice"
        actions={
          <Button variant="primary" large icon="play" onClick={start}>
            Start {count} poses
          </Button>
        }
      >
        <Header title="Gesture timer" back="/practice" />
        <p class="muted">One line of action, then weight, then limbs. When the chime goes, stop mid-line and start the next. No faces.</p>
        <div class="field">
          <span class="label">Pose length</span>
          <Segmented label="Pose length" options={POSE_LENGTHS} value={seconds as 30 | 60 | 120} onChange={setSeconds} />
        </div>
        <div class="field">
          <span class="label">Number of poses</span>
          <Chips label="Number of poses" options={POSE_COUNTS.map((n) => ({ value: n, label: String(n) }))} selected={[count]} onToggle={setCount} />
        </div>
        <p class="small muted">
          About {Math.round((seconds * count) / 60)} {Math.round((seconds * count) / 60) === 1 ? 'minute' : 'minutes'}. The chime is quiet; the screen also flashes, and the phone vibrates where it can.
        </p>
      </Screen>
    );
  }

  if (phase === 'finished') {
    return (
      <Screen
        label="Gesture session finished"
        back="/practice"
        actions={
          <Button large onClick={() => setPhase('setup')}>
            Another session
          </Button>
        }
      >
        <Header title={`${count} poses done`} kicker="Gesture session" back="/practice" />
        <p>Quantity is the point. Count how many show which way the weight is going.</p>
        <FileButton
          variant="primary"
          block
          large
          icon="camera"
          camera
          onFile={(file) => {
            setPendingCapture(file, { subject: 'gesture' });
            navigate('/capture');
          }}
        >
          Photograph the page
        </FileButton>
        {!logged && (
          <div class="stack" role="group" aria-label="How did the session go?">
            <h2>How did it go?</h2>
            {DRILL_RATINGS.map((option) => (
              <Button key={option.value} block icon={option.icon} onClick={() => void log(option.value)}>
                {option.label}
              </Button>
            ))}
          </div>
        )}
      </Screen>
    );
  }

  const shown = Math.max(0, Math.ceil(left));
  return (
    <Screen
      label="Gesture session"
      actions={
        <>
          <Button
            variant="quiet"
            onClick={() => {
              release();
              setPhase('setup');
            }}
          >
            Stop
          </Button>
          <Button icon={phase === 'running' ? 'pause' : 'play'} onClick={pauseOrResume}>
            {phase === 'running' ? 'Pause' : 'Resume'}
          </Button>
          <Button variant="primary" icon="skip" onClick={next}>
            Next pose
          </Button>
        </>
      }
    >
      <div key={flash} class={`stack-lg${flash > 0 && !prefersReducedMotion() ? ' pose-flash' : ''}`} style={{ paddingTop: '2rem', borderRadius: '12px' }}>
        <p class="kicker" style={{ textAlign: 'center' }} aria-live="polite">
          Pose {pose} of {count}
          {phase === 'paused' ? ' · paused' : ''}
        </p>
        <p class="countdown" role="timer" aria-label={`${shown} seconds left`}>
          {shown >= 60 ? `${Math.floor(shown / 60)}:${String(shown % 60).padStart(2, '0')}` : shown}
        </p>
        <div class="timer-ring" aria-hidden="true">
          <i style={{ width: `${Math.max(0, Math.min(100, (left / seconds) * 100))}%` }} />
        </div>
        <p class="muted" style={{ textAlign: 'center' }}>
          Line of action first.
        </p>
      </div>
    </Screen>
  );
}
