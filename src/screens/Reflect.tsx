import { useEffect, useState } from 'preact/hooks';
import { WEAKNESS_IDS, weaknessById, WEAKNESSES } from '../data/weaknesses';
import { getEntries, putEntry } from '../db/db';
import { toDateKey } from '../lib/dates';
import { chooseReflectionPrompts, type ChosenPrompt } from '../lib/reflection';
import { needByWeakness } from '../lib/stats';
import type { Rating, ReflectionItem } from '../lib/types';
import { entryAlt } from '../ui/EntryCard';
import { useLive } from '../ui/hooks';
import { Button, Divider, Header, RatingPicker, StoredImg, toast } from '../ui/kit';
import { navigate } from '../ui/router';
import { Screen } from '../ui/Screen';

interface Answer {
  rating: Rating | null;
  note: string;
}

/** The 60-second reflection: three or four prompts, each answered from memory of the drawing. */
export function Reflect({ id }: { id: string }) {
  const entries = useLive(getEntries);
  const [prompts, setPrompts] = useState<ChosenPrompt[] | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const entry = entries?.find((e) => e.id === id);

  useEffect(() => {
    if (!entries || !entry || prompts) return;
    const others = entries.filter((e) => e.id !== entry.id);
    if (entry.reflection) {
      // Editing an earlier reflection: keep the same prompts and answers.
      setPrompts(entry.reflection.items.map((i) => ({ weaknessId: i.weaknessId, prompt: i.prompt })));
      setAnswers(entry.reflection.items.map((i) => ({ rating: i.rating, note: i.note ?? '' })));
      return;
    }
    const chosen = chooseReflectionPrompts({
      weaknesses: WEAKNESSES,
      subject: entry.subject,
      focus: entry.weaknessIds,
      need: needByWeakness(others, WEAKNESS_IDS),
      history: others.flatMap((e) => (e.reflection?.items ?? []).map((i) => ({ weaknessId: i.weaknessId, date: e.date }))),
      today: toDateKey(new Date()),
    });
    setPrompts(chosen);
    setAnswers(chosen.map(() => ({ rating: null, note: '' })));
  }, [entries, entry, prompts]);

  if (!entries) return <Screen label="Reflection">{null}</Screen>;
  if (!entry || !prompts) {
    return (
      <Screen label="Reflection">
        <Header title="Reflection" back="/journal" />
        {!entry && <p class="muted">That sketch is no longer in the journal.</p>}
      </Screen>
    );
  }

  const answered = answers.filter((a) => a.rating !== null).length;
  const done = () => navigate(`/entry/${entry.id}`, { replace: true });

  const save = async () => {
    const items: ReflectionItem[] = prompts.flatMap((p, i) => {
      const answer = answers[i];
      if (!answer || answer.rating === null) return [];
      return [{ weaknessId: p.weaknessId, prompt: p.prompt, rating: answer.rating, ...(answer.note.trim() ? { note: answer.note.trim() } : {}) }];
    });
    await putEntry({ ...entry, reflection: { at: new Date().toISOString(), items } });
    toast('Reflection saved.');
    done();
  };

  const update = (index: number, patch: Partial<Answer>) => setAnswers(answers.map((a, i) => (i === index ? { ...a, ...patch } : a)));

  return (
    <Screen
      label="Reflection"
      actions={
        <>
          <Button variant="quiet" onClick={done}>
            Skip for now
          </Button>
          <Button variant="primary" large icon="check" disabled={answered === 0} onClick={() => void save()}>
            Save reflection
          </Button>
        </>
      }
    >
      <Header title="60-second reflection" kicker="Answer from memory, then look" />
      <div class="row">
        <StoredImg id={entry.thumbId} alt={entryAlt(entry)} class="swatch" />
        <p class="muted small grow">
          {entry.feeling ? (
            <>
              Your word was <span class="hand">{entry.feeling}</span>.{' '}
            </>
          ) : null}
          Be straight with yourself. "Not yet" is information, not a grade.
        </p>
      </div>
      <Divider />
      <ol class="stack-lg">
        {prompts.map((prompt, i) => (
          <li key={prompt.weaknessId} class="stack">
            <p class="kicker">
              {i + 1} of {prompts.length} · {weaknessById(prompt.weaknessId).skill}
            </p>
            <p class="h2" id={`prompt-${i}`}>
              {prompt.prompt}
            </p>
            <RatingPicker label={prompt.prompt} value={answers[i]?.rating ?? null} onChange={(rating) => update(i, { rating })} />
            <input
              class="input"
              type="text"
              aria-label={`Note for: ${prompt.prompt}`}
              placeholder="One line, if you want"
              maxLength={140}
              value={answers[i]?.note ?? ''}
              onInput={(e) => update(i, { note: e.currentTarget.value })}
            />
          </li>
        ))}
      </ol>
    </Screen>
  );
}
