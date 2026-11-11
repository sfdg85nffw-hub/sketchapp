import { useState } from 'preact/hooks';
import { WEAKNESS_IDS, WEAKNESSES } from '../data/weaknesses';
import { getEntries, putReview, saveSettings } from '../db/db';
import { formatMonth, monthKey } from '../lib/dates';
import { needByWeakness } from '../lib/stats';
import type { WeaknessId } from '../lib/types';
import { EntryThumb } from '../ui/EntryCard';
import { useLive } from '../ui/hooks';
import { Button, Chips, Header, Section, toast } from '../ui/kit';
import { navigate } from '../ui/router';
import { Screen } from '../ui/Screen';

/** The monthly review: three choices, made by looking at the month's pages. */
export function Review({ month }: { month: string }) {
  const entries = useLive(getEntries);
  const [best, setBest] = useState<string | null>(null);
  const [taught, setTaught] = useState<string | null>(null);
  const [focus, setFocus] = useState<WeaknessId | null>(null);

  if (!entries) return <Screen label="Monthly review">{null}</Screen>;
  const ofMonth = entries.filter((e) => monthKey(e.date) === month);
  const need = needByWeakness(entries, WEAKNESS_IDS);
  const byNeed = [...WEAKNESSES].sort((a, b) => need[b.id] - need[a.id]);

  const save = async () => {
    await putReview({
      month,
      at: new Date().toISOString(),
      ...(best ? { bestEntryId: best } : {}),
      ...(taught ? { taughtEntryId: taught } : {}),
      ...(focus ? { focus } : {}),
    });
    if (focus) await saveSettings({ focus: [focus] });
    toast(focus ? 'Review saved. Practice will lean towards your new focus.' : 'Review saved.');
    navigate('/progress', { replace: true });
  };

  return (
    <Screen
      label="Monthly review"
      back="/progress"
      actions={
        <Button variant="primary" large icon="check" disabled={!best && !taught && !focus} onClick={() => void save()}>
          Save review
        </Button>
      }
    >
      <Header title={formatMonth(month)} kicker="Monthly review" back="/progress" />
      {ofMonth.length === 0 ? (
        <p class="muted">No sketches from that month.</p>
      ) : (
        <>
          <p class="muted">
            {ofMonth.length} {ofMonth.length === 1 ? 'sketch' : 'sketches'}. Look at them together before choosing.
          </p>
          <Section title="1. Your best sketch" hint="The one you would show someone.">
            <div class="thumb-grid thumb-grid-3">
              {ofMonth.map((e) => (
                <EntryThumb key={e.id} entry={e} picked={best === e.id} onPick={(p) => setBest(best === p.id ? null : p.id)} />
              ))}
            </div>
          </Section>
          <Section title="2. The one that taught you most" hint="Often not the best one. Often the one that went wrong.">
            <div class="thumb-grid thumb-grid-3">
              {ofMonth.map((e) => (
                <EntryThumb key={e.id} entry={e} picked={taught === e.id} onPick={(p) => setTaught(taught === p.id ? null : p.id)} />
              ))}
            </div>
          </Section>
        </>
      )}
      <Section title="3. One focus for next month" hint="One, not three. Listed with your lowest self-rated first.">
        <Chips
          label="Focus weakness"
          options={byNeed.map((w) => ({ value: w.id, label: w.skill }))}
          selected={focus ? [focus] : []}
          onToggle={(id) => setFocus(focus === id ? null : id)}
        />
      </Section>
    </Screen>
  );
}
