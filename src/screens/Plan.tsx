import { useState } from 'preact/hooks';
import { FEELING_WORDS } from '../data/catalog';
import { getEntries, saveSettings } from '../db/db';
import type { SketchPlan } from '../lib/types';
import { recentValues } from '../ui/EntryFields';
import { useLive, useSettings } from '../ui/hooks';
import { Icon } from '../ui/Icon';
import { Button, Chips, Header, toast } from '../ui/kit';
import { navigate } from '../ui/router';
import { Screen } from '../ui/Screen';
import { lightLabel } from './EntryDetail';

const DIRECTIONS = [0, 45, 90, 135, 180, 225, 270, 315] as const;

/** A circular dial: eight tappable directions around a cube whose shadow falls away from the light. */
function LightDial({ value, onChange }: { value: number | undefined; onChange: (degrees: number) => void }) {
  const shadow = value === undefined ? null : { x: -Math.sin((value * Math.PI) / 180) * 22, y: Math.cos((value * Math.PI) / 180) * 22 };
  return (
    <div class="dial" role="radiogroup" aria-label="Light direction" style={{ position: 'relative', aspectRatio: '1' }}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" style={{ color: 'var(--ink)' }}>
        <circle cx="100" cy="100" r="52" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 5" />
        {shadow && <ellipse cx={100 + shadow.x} cy={108 + shadow.y} rx="26" ry="14" fill="currentColor" opacity="0.75" />}
        <path d="M100 78 122 90v24l-22 12-22-12V90Z" fill="var(--paper-raised)" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        <path d="M78 90l22 12 22-12M100 102v24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
      </svg>
      {DIRECTIONS.map((degrees) => {
        const rad = (degrees * Math.PI) / 180;
        const on = value === degrees;
        return (
          <button
            key={degrees}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={`Light from ${lightLabel(degrees)}`}
            class="icon-btn"
            style={{
              position: 'absolute',
              left: `${50 + Math.sin(rad) * 39}%`,
              top: `${50 - Math.cos(rad) * 39}%`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: on ? '2.5px solid var(--ink)' : '1.5px solid var(--line)',
              background: on ? 'var(--ink)' : 'var(--paper-raised)',
              color: on ? 'var(--paper)' : 'var(--ink-3)',
            }}
            onClick={() => onChange(degrees)}
          >
            <Icon name={on ? 'sun' : 'ratingNo'} size={on ? 24 : 12} />
          </button>
        );
      })}
    </div>
  );
}

const WATERCOLOR_CHECKS = [
  'Waterproof ink, and fully dry?',
  'Start with the biggest, lightest shape.',
  'Two passes for round forms: light wash, dry, then the shadow side.',
  'Leave white paper for the highlights.',
];

/** The pre-drawing ritual. Six short decisions, thumb-reachable, under thirty seconds. */
export function Plan() {
  const settings = useSettings();
  const entries = useLive(getEntries);
  const existing = settings.pendingPlan;
  const [feeling, setFeeling] = useState(existing?.feeling ?? '');
  const [light, setLight] = useState<number | undefined>(existing?.light);
  const [focal, setFocal] = useState(existing?.focal ?? '');
  const [thumbnails, setThumbnails] = useState(existing?.thumbnails ?? false);
  const [watercolor, setWatercolor] = useState(existing?.watercolor ?? false);

  const feelings = recentValues(entries ?? [], (e) => e.feeling, FEELING_WORDS, 12);

  const save = async () => {
    const plan: SketchPlan = {
      thumbnails,
      watercolor,
      createdAt: new Date().toISOString(),
      ...(feeling.trim() ? { feeling: feeling.trim() } : {}),
      ...(light !== undefined ? { light } : {}),
      ...(focal.trim() ? { focal: focal.trim() } : {}),
    };
    await saveSettings({ pendingPlan: plan });
    toast('Plan kept. It will be attached to your next capture.');
    navigate('/practice', { replace: true });
  };

  return (
    <Screen
      label="Plan a sketch"
      back="/practice"
      actions={
        <>
          {existing && (
            <Button
              variant="quiet"
              onClick={() => {
                void saveSettings({ pendingPlan: undefined });
                navigate('/practice', { replace: true });
              }}
            >
              Drop plan
            </Button>
          )}
          <Button variant="primary" large icon="nib" onClick={() => void save()}>
            Start drawing
          </Button>
        </>
      }
    >
      <Header title="Plan a sketch" kicker="Thirty seconds, six decisions" back="/practice" />

      <ol class="stack-lg">
        <li class="card">
          <h2>1. Feeling word</h2>
          <p class="muted small">Every choice should serve this word.</p>
          <Chips label="Feeling word" options={feelings.map((f) => ({ value: f, label: f }))} selected={feeling ? [feeling] : []} onToggle={(v) => setFeeling(feeling === v ? '' : v)} />
          <input
            class="input"
            type="text"
            aria-label="Or type your own feeling word"
            placeholder="Or type your own"
            autocapitalize="none"
            maxLength={40}
            value={feelings.includes(feeling) ? '' : feeling}
            onInput={(e) => setFeeling(e.currentTarget.value)}
          />
        </li>

        <li class="card">
          <h2>2. Light source</h2>
          <p class="muted small">Tap where the light comes from. The shadow falls the other way; draw it first.</p>
          <LightDial value={light} onChange={setLight} />
          <p class="small" aria-live="polite">
            {light === undefined ? 'No direction chosen yet.' : `Light from ${lightLabel(light)}. Cast shadows fall towards ${lightLabel(light + 180)}.`}
          </p>
        </li>

        <li class="card">
          <h2>3. Focal point</h2>
          <label class="muted small" for="plan-focal">
            One sentence. Where should the eye land?
          </label>
          <input id="plan-focal" class="input" type="text" maxLength={120} placeholder="The man asleep against the door" value={focal} onInput={(e) => setFocal(e.currentTarget.value)} />
        </li>

        <li class="card">
          <h2>4. Three value thumbnails?</h2>
          <label class="switch-row">
            <input class="check" type="checkbox" checked={thumbnails} onChange={(e) => setThumbnails(e.currentTarget.checked)} />
            <span>I'll do three small value thumbnails first</span>
          </label>
          <a class="btn btn-block" href="#/see">
            <Icon name="values" size={20} />
            <span>Open the live value-map camera</span>
          </a>
        </li>

        <li class="card">
          <h2>5. Line-weight plan</h2>
          <p>
            <strong>Bold</strong> = focal point and near edges. <strong>Fine</strong> = everything else.
          </p>
          <p class="muted small">Pen steeper for bold, flatter for fine.</p>
        </li>

        <li class="card">
          <h2>6. Watercolor?</h2>
          <label class="switch-row">
            <input class="check" type="checkbox" checked={watercolor} onChange={(e) => setWatercolor(e.currentTarget.checked)} />
            <span>Yes, paint is going on this one</span>
          </label>
          {watercolor && (
            <ul class="stack">
              {WATERCOLOR_CHECKS.map((check) => (
                <li key={check} class="row">
                  <Icon name="check" size={18} />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ol>
    </Screen>
  );
}
