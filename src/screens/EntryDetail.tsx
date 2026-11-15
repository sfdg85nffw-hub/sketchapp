import { useEffect, useState } from 'preact/hooks';
import { mediumLabel, subjectIcon, subjectLabel } from '../data/catalog';
import { weaknessById, WEAKNESSES } from '../data/weaknesses';
import { deleteEntry, deleteImage, getEntries, getPaints, putEntry, putImage } from '../db/db';
import { canvasToBlob, decodeImage, imageBlob, MAX_LONG_EDGE, renderToCanvas } from '../db/images';
import { copyText, shareOrDownload } from '../db/share';
import { buildCritiquePrompt } from '../lib/critique';
import { formatDayLong, toDateKey } from '../lib/dates';
import { newId } from '../lib/id';
import type { Entry } from '../lib/types';
import { buildCritiqueImage } from '../ui/critiqueImage';
import { draftFromEntry, EntryFields, type EntryDraft } from '../ui/EntryFields';
import { useLive, useSettings } from '../ui/hooks';
import { Icon } from '../ui/Icon';
import { Button, Divider, Header, RatingMark, Section, Sheet, toast } from '../ui/kit';
import { navigate } from '../ui/router';
import { Screen } from '../ui/Screen';
import { ValueTools } from '../ui/ValueTools';

const COMPASS = ['above', 'upper right', 'the right', 'lower right', 'below', 'lower left', 'the left', 'upper left'];

export function lightLabel(degrees: number): string {
  return COMPASS[Math.round((((degrees % 360) + 360) % 360) / 45) % 8]!;
}

type SheetKind = 'more' | 'edit' | 'delete' | null;

export function EntryDetail({ id }: { id: string }) {
  const entries = useLive(getEntries);
  const paints = useLive(getPaints);
  const settings = useSettings();
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [reference, setReference] = useState<Blob | null>(null);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [draft, setDraft] = useState<EntryDraft | null>(null);
  const [busy, setBusy] = useState(false);

  const entry = entries?.find((e) => e.id === id);
  const imageId = entry?.imageId;
  const refImageId = entry?.refImageId;

  useEffect(() => {
    let alive = true;
    if (imageId) void imageBlob(imageId).then((blob) => alive && setPhoto(blob));
    return () => {
      alive = false;
    };
  }, [imageId]);

  useEffect(() => {
    let alive = true;
    setReference(null);
    if (refImageId) void imageBlob(refImageId).then((blob) => alive && setReference(blob));
    return () => {
      alive = false;
    };
  }, [refImageId]);

  if (!entries || !paints) return <Screen label="Sketch">{null}</Screen>;
  if (!entry) {
    return (
      <Screen label="Sketch">
        <Header title="Not found" back="/journal" />
        <p class="muted">That sketch is no longer in the journal.</p>
      </Screen>
    );
  }

  const update = (patch: Partial<Entry>) => putEntry({ ...entry, ...patch });

  const addReference = async (file: File) => {
    const canvas = renderToCanvas(await decodeImage(file), { maxLongEdge: MAX_LONG_EDGE });
    const blob = await canvasToBlob(canvas);
    const refId = newId('ref');
    await putImage({ id: refId, data: await blob.arrayBuffer(), type: 'image/jpeg', width: canvas.width, height: canvas.height });
    if (entry.refImageId) await deleteImage(entry.refImageId);
    await update({ refImageId: refId });
  };

  const shareCritique = async () => {
    if (!photo || busy) return;
    setBusy(true);
    try {
      const image = await buildCritiqueImage(entry, photo);
      const file = new File([image], `sketch-${entry.date}-for-critique.jpg`, { type: 'image/jpeg' });
      const outcome = await shareOrDownload(file, 'Sketch for critique');
      if (outcome === 'downloaded') toast('Image saved.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not build the image.');
    } finally {
      setBusy(false);
    }
  };

  const copyPrompt = async () => {
    const text = buildCritiquePrompt({
      entry,
      subjectLabel: subjectLabel(entry.subject),
      mediumLabel: mediumLabel(entry.medium),
      weaknessTitles: WEAKNESSES.map((w) => w.title),
      focusTitles: entry.weaknessIds.map((w) => weaknessById(w).title),
    });
    toast((await copyText(text)) ? 'Critique prompt copied. Paste it alongside the image.' : 'Could not copy. Try again.');
  };

  const saveEdit = async () => {
    if (!draft) return;
    await update({
      subject: draft.subject,
      medium: draft.medium,
      minutes: draft.minutes,
      location: draft.location.trim() || undefined,
      feeling: draft.feeling.trim() || undefined,
      weaknessIds: draft.weaknessIds,
      date: draft.date,
    });
    setSheet(null);
    toast('Details updated.');
  };

  const reflection = entry.reflection;

  return (
    <Screen label="Sketch">
      <Header title={formatDayLong(entry.date)} kicker={subjectLabel(entry.subject)} back="/journal">
        <button type="button" class="icon-btn" aria-label="More options" onClick={() => setSheet('more')}>
          <Icon name="more" />
        </button>
      </Header>

      {photo ? (
        <ValueTools
          blob={photo}
          paints={paints}
          redGreenMode={settings.redGreenMode}
          whiteRef={entry.whiteRef}
          onWhiteRef={(rgb) => void update({ whiteRef: rgb })}
          referenceBlob={reference}
          onReference={(file) => void addReference(file)}
        />
      ) : (
        <div class="stage" />
      )}

      <Divider />

      <ul class="row-wrap" aria-label="Details">
        {entry.baseline && (
          <li class="tag tag-solid">
            <Icon name="flag" size={12} />
            Baseline
          </li>
        )}
        <li class="tag">
          <Icon name={subjectIcon(entry.subject)} size={12} />
          {subjectLabel(entry.subject)}
        </li>
        <li class="tag">{mediumLabel(entry.medium)}</li>
        {entry.minutes && <li class="tag">{entry.minutes} min</li>}
        {entry.location && <li class="tag">{entry.location}</li>}
        {entry.reference && (
          <li class="tag">
            <Icon name="timer" size={12} />
            {entry.reference.mode} · {entry.reference.summary}
          </li>
        )}
      </ul>

      {entry.feeling ? (
        <p>
          <span class="kicker">Feeling word</span>
          <br />
          <span class="hand h2">{entry.feeling}</span>
        </p>
      ) : (
        <p class="muted small">No feeling word. Next time, choose one before the first line.</p>
      )}

      {entry.weaknessIds.length > 0 && (
        <p class="small">
          <strong>Working on:</strong> {entry.weaknessIds.map((w) => weaknessById(w).skill).join(', ')}
        </p>
      )}

      {entry.plan && (entry.plan.light !== undefined || entry.plan.focal) && (
        <p class="small muted">
          Plan: {entry.plan.light !== undefined ? `light from ${lightLabel(entry.plan.light)}` : ''}
          {entry.plan.light !== undefined && entry.plan.focal ? '; ' : ''}
          {entry.plan.focal ? `focal point: ${entry.plan.focal}` : ''}.
        </p>
      )}

      <Section title="Reflection">
        {reflection && reflection.items.length > 0 ? (
          <ul class="stack">
            {reflection.items.map((item) => (
              <li key={item.weaknessId} class="card card-soft">
                <p class="small">{item.prompt}</p>
                <p class="h3">
                  <RatingMark rating={item.rating} />
                </p>
                {item.note && <p class="hand small">{item.note}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p class="muted">Not reflected on yet. Three or four questions, about a minute.</p>
        )}
        <Button variant={reflection ? 'secondary' : 'primary'} block icon="edit" onClick={() => navigate(`/reflect/${entry.id}`)}>
          {reflection ? 'Edit reflection' : 'Reflect on this sketch'}
        </Button>
      </Section>

      <Section title="Ask for critique" hint="One image with your answers underneath, and a prompt that explains what kind of critique you want.">
        <Button block icon="share" disabled={busy || !photo} onClick={() => void shareCritique()}>
          {busy ? 'Building image…' : 'Export for critique'}
        </Button>
        <Button block icon="copy" onClick={() => void copyPrompt()}>
          Copy critique prompt
        </Button>
      </Section>

      {sheet === 'more' && (
        <Sheet title="This sketch" onClose={() => setSheet(null)}>
          <Button
            block
            icon="flag"
            aria-pressed={entry.baseline}
            onClick={() => {
              void update({ baseline: !entry.baseline });
              setSheet(null);
              toast(entry.baseline ? 'No longer a baseline.' : 'Marked as a baseline. This is your "before."');
            }}
          >
            {entry.baseline ? 'Remove baseline mark' : 'Mark as baseline'}
          </Button>
          <Button block icon="slider" onClick={() => navigate(`/thennow?b=${entry.id}`)}>
            Compare in Then / Now
          </Button>
          <Button
            block
            icon="edit"
            onClick={() => {
              setDraft(draftFromEntry(entry));
              setSheet('edit');
            }}
          >
            Edit details
          </Button>
          <Button block icon="trash" onClick={() => setSheet('delete')}>
            Delete this sketch
          </Button>
        </Sheet>
      )}

      {sheet === 'edit' && draft && (
        <Sheet title="Edit details" onClose={() => setSheet(null)}>
          <div class="field">
            <label for="edit-date">Date drawn</label>
            <input
              id="edit-date"
              class="input"
              type="date"
              value={draft.date}
              max={toDateKey(new Date())}
              onInput={(e) => e.currentTarget.value && setDraft({ ...draft, date: e.currentTarget.value })}
            />
          </div>
          <EntryFields draft={draft} onChange={setDraft} history={entries} focus={settings.focus} />
          <Button variant="primary" block large onClick={() => void saveEdit()}>
            Save changes
          </Button>
        </Sheet>
      )}

      {sheet === 'delete' && (
        <Sheet title="Delete this sketch?" onClose={() => setSheet(null)}>
          <p>The photo and its reflection will be removed from this phone. This cannot be undone.</p>
          <Button
            block
            icon="trash"
            onClick={() => {
              void deleteEntry(entry.id).then(() => {
                toast('Sketch deleted.');
                navigate('/journal', { replace: true });
              });
            }}
          >
            Delete permanently
          </Button>
          <Button variant="primary" block onClick={() => setSheet(null)}>
            Keep it
          </Button>
        </Sheet>
      )}
    </Screen>
  );
}
