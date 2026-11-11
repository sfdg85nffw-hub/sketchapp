import { useState } from 'preact/hooks';
import { SUBJECTS } from '../data/catalog';
import { saveSettings } from '../db/db';
import type { SubjectId } from '../lib/types';
import { useSettings } from '../ui/hooks';
import { Icon } from '../ui/Icon';
import { Button, Chips, Divider } from '../ui/kit';

const STEPS = 3;

/** Three screens at most, every one skippable. */
export function Onboarding() {
  const settings = useSettings();
  const [step, setStep] = useState(0);
  const [subjects, setSubjects] = useState<SubjectId[]>(settings.subjects);
  const [redGreen, setRedGreen] = useState(settings.redGreenMode);

  const finish = () => void saveSettings({ onboarded: true, subjects, redGreenMode: redGreen });
  const next = () => (step === STEPS - 1 ? finish() : setStep(step + 1));

  return (
    <div class="onboard" role="dialog" aria-modal="true" aria-label="Welcome">
      <div class="onboard-body">
        {step === 0 && (
          <>
            <Icon name="nib" size={44} />
            <h1>Sketchbook Coach</h1>
            <p class="h2">A field notebook for getting better on purpose.</p>
            <Divider />
            <p>Photograph each page. Check its values. Answer three honest questions. Practice the one thing that is holding the drawings back.</p>
            <p class="muted">Everything stays on this phone. No account, no network, no streaks to lose.</p>
          </>
        )}
        {step === 1 && (
          <>
            <p class="kicker">Step 2 of 3</p>
            <h1>What do you draw?</h1>
            <p class="muted">Pick what you care about. It sets which baselines and prompts you are offered. Change it any time.</p>
            <Chips
              label="Subjects you draw"
              tiles
              options={SUBJECTS.map((s) => ({ value: s.id, label: s.label, icon: s.icon }))}
              selected={subjects}
              onToggle={(id) => setSubjects(subjects.includes(id) ? subjects.filter((s) => s !== id) : [...subjects, id])}
            />
            <Divider />
            <label class="switch-row">
              <input class="check" type="checkbox" checked={redGreen} onChange={(e) => setRedGreen(e.currentTarget.checked)} />
              <span>
                <strong>Red-green colorblind mode</strong>
                <span class="hint small" style={{ display: 'block' }}>
                  Colors are described by value and warm or cool, and paints you are likely to confuse get flagged.
                </span>
              </span>
            </label>
          </>
        )}
        {step === 2 && (
          <>
            <p class="kicker">Step 3 of 3</p>
            <h1>Make a baseline drawing whenever you're ready.</h1>
            <p class="h2">Rough is the point. This is your "before."</p>
            <Divider />
            <p>
              One dated drawing per subject, done the way you draw today. Nobody sees it but you. In a few months it is the most useful page in the book, because it is the only honest way to see how far you have moved.
            </p>
            <p class="muted">To make one: capture any sketch, then choose "Mark as baseline."</p>
          </>
        )}
      </div>
      <div class="dots" aria-hidden="true">
        {Array.from({ length: STEPS }, (_, i) => (
          <i key={i} class={i === step ? 'on' : ''} />
        ))}
      </div>
      <div class="actionbar">
        <Button variant="quiet" onClick={finish}>
          Skip
        </Button>
        <Button variant="primary" large onClick={next}>
          {step === 0 ? 'Get started' : step === STEPS - 1 ? 'Open my journal' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
