import { useMemo, useState } from 'preact/hooks';
import { INTENTION_ACTIONS, INTENTION_CUES } from '../data/catalog';
import { DRILL_KIND_LABEL, DRILLS } from '../data/drills';
import { WEAKNESS_IDS, weaknessById } from '../data/weaknesses';
import { getDrillStates, getEntries, getProjects, saveSettings } from '../db/db';
import { toDateKey } from '../lib/dates';
import { newId } from '../lib/id';
import { proposePractice, sessionMinutes } from '../lib/practice';
import { daysOverdue } from '../lib/srs';
import { needByWeakness } from '../lib/stats';
import type { Drill, DrillState } from '../lib/types';
import { useLive, useSettings } from '../ui/hooks';
import { Icon } from '../ui/Icon';
import { Button, Chips, Divider, Header, LevelPips, Section, Sheet } from '../ui/kit';
import { Screen } from '../ui/Screen';

/** Why a drill is on today's list, in a word, so the proposal never feels arbitrary. */
export function dueLabel(drill: Drill, state: DrillState | undefined, today: string, focus: readonly string[]): string {
  if (state?.lastDone === today) return 'Done today';
  if (!state || state.history.length === 0) return 'New';
  const overdue = daysOverdue(state, today);
  if (overdue >= 0) return overdue === 0 ? 'Due today' : `Due ${overdue}d ago`;
  if (drill.weaknessId && focus.includes(drill.weaknessId)) return 'Your focus';
  return `Due in ${-overdue}d`;
}

export function DrillCard({ drill, state, today, focus }: { drill: Drill; state: DrillState | undefined; today: string; focus: readonly string[] }) {
  const label = dueLabel(drill, state, today, focus);
  return (
    <a class="list-link" href={`#/drill/${drill.id}`}>
      <span class="grow">
        <span class="row-wrap" style={{ marginBottom: '0.25rem' }}>
          <span class={`tag${label === 'Done today' ? ' tag-solid' : ''}`}>
            {label === 'Done today' && <Icon name="check" size={12} />}
            {label}
          </span>
          <span class="small muted">
            {DRILL_KIND_LABEL[drill.kind]} · {drill.minutes} min
          </span>
        </span>
        {drill.title}
        <span class="sub">
          {drill.targets} <LevelPips level={state?.level ?? 1} />
        </span>
      </span>
      <Icon name="chevron" size={20} />
    </a>
  );
}

export function Practice() {
  const settings = useSettings();
  const states = useLive(getDrillStates);
  const entries = useLive(getEntries);
  const projects = useLive(getProjects);
  const [adding, setAdding] = useState(false);
  const [cue, setCue] = useState('');
  const [action, setAction] = useState('');
  const today = toDateKey(new Date());

  const proposal = useMemo(() => {
    if (!states || !entries) return [];
    // Drills finished today stay on the list, marked done, instead of being swapped for new ones.
    const beforeToday = new Map([...states].map(([id, s]) => [id, s.lastDone === today ? { ...s, due: today } : s]));
    return proposePractice({
      drills: DRILLS,
      states: beforeToday,
      need: needByWeakness(entries, WEAKNESS_IDS),
      focus: settings.focus,
      today,
    });
  }, [states, entries, settings.focus, today]);

  if (!states || !entries) return <Screen label="Practice">{null}</Screen>;

  const focusText = settings.focus.map((id) => weaknessById(id).skill.toLowerCase()).join(', ');
  const addIntention = () => {
    if (!cue.trim() || !action.trim()) return;
    void saveSettings({ intentions: [...settings.intentions, { id: newId('int'), cue: cue.trim(), action: action.trim() }] });
    setAdding(false);
    setCue('');
    setAction('');
  };

  return (
    <Screen label="Practice">
      <Header title="Practice" />

      <Section
        title="Today's practice"
        hint={`${proposal.length} ${proposal.length === 1 ? 'drill' : 'drills'}, about ${sessionMinutes(proposal)} minutes, mixed on purpose. ${
          focusText ? `Weighted towards your focus: ${focusText}.` : 'Weighted towards what is due and what you rate lowest.'
        } Suggestions, not orders.`}
      >
        <ul class="stack">
          {proposal.map((drill) => (
            <li key={drill.id}>
              <DrillCard drill={drill} state={states.get(drill.id)} today={today} focus={settings.focus} />
            </li>
          ))}
        </ul>
      </Section>

      <Divider />

      <ul class="stack">
        <li>
          <a class="list-link" href="#/plan">
            <Icon name="sun" />
            <span class="grow">
              Plan a sketch
              <span class="sub">{settings.pendingPlan ? 'A plan is waiting for your next capture' : 'Thirty seconds before the first line'}</span>
            </span>
            <Icon name="chevron" size={20} />
          </a>
        </li>
        <li>
          <a class="list-link" href="#/ref">
            <Icon name="portrait" />
            <span class="grow">
              Timed reference
              <span class="sub">Faces, poses, lit shapes, a skull, your own photos. All offline.</span>
            </span>
            <Icon name="chevron" size={20} />
          </a>
        </li>
        <li>
          <a class="list-link" href="#/gesture">
            <Icon name="timer" />
            <span class="grow">
              Gesture timer
              <span class="sub">Draw from life on the train: 30 s, 1 min or 2 min poses.</span>
            </span>
            <Icon name="chevron" size={20} />
          </a>
        </li>
        <li>
          <a class="list-link" href="#/drills">
            <Icon name="book" />
            <span class="grow">
              Drill library
              <span class="sub">All {DRILLS.length} drills, by what they fix</span>
            </span>
            <Icon name="chevron" size={20} />
          </a>
        </li>
        <li>
          <a class="list-link" href="#/projects">
            <Icon name="layers" />
            <span class="grow">
              Projects
              <span class="sub">
                {projects && projects.length > 0 ? `${projects.length} under way` : 'Bigger spreads with a feeling behind them'}
              </span>
            </span>
            <Icon name="chevron" size={20} />
          </a>
        </li>
      </ul>

      <Divider />

      <Section title="When, then" hint="A plan tied to a moment gets done. A vague intention does not.">
        <ul class="stack">
          {settings.intentions.map((intention) => (
            <li key={intention.id} class="card card-soft row">
              <p class="grow">
                When <strong>{intention.cue}</strong>, I'll <strong>{intention.action}</strong>.
              </p>
              <button
                type="button"
                class="icon-btn"
                aria-label={`Remove: when ${intention.cue}, I'll ${intention.action}`}
                onClick={() => void saveSettings({ intentions: settings.intentions.filter((i) => i.id !== intention.id) })}
              >
                <Icon name="close" size={20} />
              </button>
            </li>
          ))}
        </ul>
        <Button block icon="plus" onClick={() => setAdding(true)}>
          Add a when-then plan
        </Button>
      </Section>

      {adding && (
        <Sheet title="When, then" onClose={() => setAdding(false)}>
          <div class="field">
            <span class="label">When…</span>
            <Chips label="When" options={INTENTION_CUES.map((c) => ({ value: c, label: c }))} selected={[cue]} onToggle={setCue} />
            <input class="input" type="text" aria-label="Or type your own moment" placeholder="Or type your own moment" value={INTENTION_CUES.includes(cue) ? '' : cue} onInput={(e) => setCue(e.currentTarget.value)} />
          </div>
          <div class="field">
            <span class="label">…I'll</span>
            <Chips label="I will" options={INTENTION_ACTIONS.map((a) => ({ value: a, label: a }))} selected={[action]} onToggle={setAction} />
            <input class="input" type="text" aria-label="Or type your own action" placeholder="Or type your own action" value={INTENTION_ACTIONS.includes(action) ? '' : action} onInput={(e) => setAction(e.currentTarget.value)} />
          </div>
          <Button variant="primary" block large disabled={!cue.trim() || !action.trim()} onClick={addIntention}>
            Save plan
          </Button>
        </Sheet>
      )}
    </Screen>
  );
}
