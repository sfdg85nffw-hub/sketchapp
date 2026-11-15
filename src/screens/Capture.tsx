import { useEffect, useState } from 'preact/hooks';
import { getEntries, getProjects, putEntry, putProject, saveSettings } from '../db/db';
import { decodeImage, FULL_CROP, storePhoto, type CropRect, type Rotation } from '../db/images';
import { toDateKey } from '../lib/dates';
import { newId } from '../lib/id';
import type { Entry, SubjectId } from '../lib/types';
import { takePendingCapture, type CaptureIntent } from '../ui/captureStore';
import { CropEditor } from '../ui/CropEditor';
import { EntryFields, type EntryDraft } from '../ui/EntryFields';
import { useLive, useSettings } from '../ui/hooks';
import { Icon } from '../ui/Icon';
import { Button, Chips, Divider, FileButton, Header, Sheet, toast } from '../ui/kit';
import { navigate } from '../ui/router';
import { Screen } from '../ui/Screen';

const INSET_CROP: CropRect = { x: 0.06, y: 0.06, width: 0.88, height: 0.88 };

export function Capture() {
  const settings = useSettings();
  const history = useLive(getEntries);
  const projects = useLive(getProjects);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [intent, setIntent] = useState<CaptureIntent>({});
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState<Rotation>(0);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [draft, setDraft] = useState<EntryDraft | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = (file: File) => {
    setError(null);
    decodeImage(file).then(setImage, (e: Error) => setError(e.message));
  };

  useEffect(() => {
    const pending = takePendingCapture();
    setIntent(pending.intent);
    if (pending.file) load(pending.file);
  }, []);

  // Pre-fill from the plan he just made, then from his last sketch: recognition over recall.
  useEffect(() => {
    if (draft || !history) return;
    const last = history[0];
    const plan = settings.pendingPlan;
    setDraft({
      subject: (intent.subject as SubjectId | undefined) ?? last?.subject ?? settings.subjects[0] ?? 'urban',
      medium: plan?.watercolor ? 'ink-watercolor' : (last?.medium ?? 'ink'),
      location: '',
      feeling: plan?.feeling ?? '',
      weaknessIds: settings.focus.slice(0, 1),
      baseline: false,
      date: toDateKey(new Date()),
      projectId: intent.projectId,
      ...(intent.minutes ? { minutes: intent.minutes } : {}),
    });
  }, [history, draft, settings, intent]);

  const rotate = (by: 90 | -90) => {
    setRotation((((rotation + by + 360) % 360) as Rotation));
    setCrop(null);
  };

  const save = async () => {
    if (!image || !draft || saving) return;
    setSaving(true);
    try {
      const { imageId, thumbId } = await storePhoto(image, { rotation, crop: crop ?? FULL_CROP });
      const plan = settings.pendingPlan;
      const entry: Entry = {
        id: newId('entry'),
        createdAt: new Date().toISOString(),
        date: draft.date,
        imageId,
        thumbId,
        subject: draft.subject,
        medium: draft.medium,
        weaknessIds: draft.weaknessIds,
        baseline: draft.baseline,
        ...(draft.minutes ? { minutes: draft.minutes } : {}),
        ...(intent.reference ? { reference: intent.reference } : {}),
        ...(intent.drillId ? { drillId: intent.drillId } : {}),
        ...(draft.location.trim() ? { location: draft.location.trim() } : {}),
        ...(draft.feeling.trim() ? { feeling: draft.feeling.trim() } : {}),
        ...(draft.projectId ? { projectId: draft.projectId } : {}),
        ...(plan ? { plan } : {}),
      };
      await putEntry(entry);
      if (draft.projectId) {
        const project = projects?.find((p) => p.id === draft.projectId);
        if (project) await putProject({ ...project, entryIds: [...project.entryIds, entry.id] });
      }
      if (plan) await saveSettings({ pendingPlan: undefined });
      toast('Saved to your journal.');
      navigate(`/reflect/${entry.id}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the photo.');
      setSaving(false);
    }
  };

  if (!image) {
    return (
      <Screen label="Capture">
        <Header title="Capture a sketch" back="/journal" />
        {error && (
          <p class="card" role="alert">
            {error}
          </p>
        )}
        <div class="card stack">
          <p class="muted">Lay the page flat in even light. Fill the frame with the page; sideways is fine, you can rotate it next.</p>
          <FileButton variant="primary" block large icon="camera" camera onFile={load}>
            Take a photo
          </FileButton>
          <FileButton block icon="image" testId="capture-library-input" onFile={load}>
            Choose from library
          </FileButton>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      label="New journal entry"
      actions={
        <>
          <Button variant="quiet" onClick={() => navigate('/journal', { replace: true })}>
            Discard
          </Button>
          <Button variant="primary" large icon="check" disabled={saving || !draft} onClick={() => void save()}>
            {saving ? 'Saving…' : 'Save to journal'}
          </Button>
        </>
      }
    >
      <Header title="New entry" kicker={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} />
      {error && (
        <p class="card" role="alert">
          {error}
        </p>
      )}

      <div class="stage">
        <CropEditor image={image} rotation={rotation} crop={crop} onCrop={setCrop} />
      </div>

      <div class="row-wrap">
        <Button icon="rotateLeft" aria-label="Rotate left" onClick={() => rotate(-90)}>
          Left
        </Button>
        <Button icon="rotateRight" aria-label="Rotate right" onClick={() => rotate(90)}>
          Right
        </Button>
        <Button icon="crop" aria-pressed={crop !== null} onClick={() => setCrop(crop ? null : INSET_CROP)}>
          {crop ? 'Remove crop' : 'Crop'}
        </Button>
        <Button variant="quiet" onClick={() => setMoreOpen(true)}>
          More
        </Button>
      </div>

      {settings.pendingPlan && (
        <p class="card card-note small">
          <Icon name="check" size={16} /> Using the plan you made before drawing
          {settings.pendingPlan.feeling ? (
            <>
              : feeling word <span class="hand">{settings.pendingPlan.feeling}</span>
            </>
          ) : null}
          .
        </p>
      )}

      <Divider />

      {draft && history && <EntryFields draft={draft} onChange={setDraft} history={history} focus={settings.focus} />}

      {moreOpen && draft && (
        <Sheet title="More options" onClose={() => setMoreOpen(false)}>
          <label class="switch-row">
            <input class="check" type="checkbox" checked={draft.baseline} onChange={(e) => setDraft({ ...draft, baseline: e.currentTarget.checked })} />
            <span>
              <strong>Mark as baseline</strong>
              <span class="hint small" style={{ display: 'block' }}>
                Your "before" for this subject. Rough is the point.
              </span>
            </span>
          </label>
          <div class="field">
            <label for="entry-date">Date drawn</label>
            <input
              id="entry-date"
              class="input"
              type="date"
              value={draft.date}
              max={toDateKey(new Date())}
              onInput={(e) => e.currentTarget.value && setDraft({ ...draft, date: e.currentTarget.value })}
            />
          </div>
          {projects && projects.length > 0 && (
            <div class="field">
              <span class="label">Part of a project</span>
              <Chips
                label="Project"
                options={projects.map((p) => ({ value: p.id, label: p.title }))}
                selected={draft.projectId ? [draft.projectId] : []}
                onToggle={(id) => setDraft({ ...draft, projectId: draft.projectId === id ? undefined : id })}
              />
            </div>
          )}
          <FileButton
            block
            icon="image"
            onFile={(file) => {
              setMoreOpen(false);
              setRotation(0);
              setCrop(null);
              load(file);
            }}
          >
            Use a different photo
          </FileButton>
          <Button variant="primary" block onClick={() => setMoreOpen(false)}>
            Done
          </Button>
        </Sheet>
      )}
    </Screen>
  );
}
