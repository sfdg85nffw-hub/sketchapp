import { useEffect, useState } from 'preact/hooks';
import { SUBJECTS } from '../data/catalog';
import { WEAKNESSES } from '../data/weaknesses';
import { exportBackup, importBackup } from '../db/backupIo';
import { clearDemoData, eraseEverything, saveSettings } from '../db/db';
import { loadDemoData } from '../db/demo';
import { formatDayLong, toDateKey } from '../lib/dates';
import type { ThemeChoice } from '../lib/types';
import { TEXT_SCALES } from '../ui/appearance';
import { useSettings } from '../ui/hooks';
import { Button, Chips, Divider, FileButton, Header, Section, Segmented, Sheet, toast } from '../ui/kit';
import { Screen } from '../ui/Screen';

const THEMES: readonly { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'Match phone' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function SettingsScreen() {
  const settings = useSettings();
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmErase, setConfirmErase] = useState(false);

  useEffect(() => {
    void navigator.storage?.persisted?.().then(setPersisted);
  }, []);

  const run = async (label: string, work: () => Promise<string | null>) => {
    setBusy(label);
    try {
      const message = await work();
      if (message) toast(message);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'That did not work. Try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen label="Settings">
      <Header title="Settings" back="/progress" />

      <Section title="Backup" hint="Everything lives on this phone only. iOS can clear a web app's storage if space runs low or the app goes unused, so save a copy every couple of weeks.">
        <p class="small">
          {settings.lastBackupAt ? `Last backup: ${formatDayLong(toDateKey(new Date(settings.lastBackupAt)))}.` : 'No backup yet.'}{' '}
          {persisted === null ? '' : persisted ? 'Storage is marked persistent on this device.' : 'Storage is best-effort on this device: install to the home screen and back up regularly.'}
        </p>
        <Button
          variant="primary"
          block
          large
          icon="share"
          disabled={busy !== null}
          onClick={() =>
            void run('export', async () => {
              const outcome = await exportBackup();
              return outcome === 'cancelled' ? null : outcome === 'shared' ? 'Backup shared. Save it to Files or iCloud Drive.' : 'Backup saved to your downloads.';
            })
          }
        >
          {busy === 'export' ? 'Packing…' : 'Export everything (.zip)'}
        </Button>
        <FileButton
          block
          icon="upload"
          accept=".zip,application/zip,application/x-zip-compressed"
          testId="import-input"
          onFile={(file) =>
            void run('import', async () => {
              const count = await importBackup(file);
              return `Backup restored: ${count} ${count === 1 ? 'sketch' : 'sketches'}.`;
            })
          }
        >
          {busy === 'import' ? 'Restoring…' : 'Import from a backup file'}
        </FileButton>
        <p class="small muted">Importing merges: items in the file replace matching ones here, and nothing else is removed.</p>
      </Section>

      <Divider />

      <Section title="Appearance">
        <div class="field">
          <span class="label">Theme</span>
          <Segmented label="Theme" options={THEMES} value={settings.theme} onChange={(theme) => void saveSettings({ theme })} />
        </div>
        <div class="field">
          <span class="label">
            Text size <span class="hint">· also follows your iPhone's text size setting</span>
          </span>
          <Segmented label="Text size" options={TEXT_SCALES} value={settings.textScale} onChange={(textScale) => void saveSettings({ textScale })} />
        </div>
      </Section>

      <Divider />

      <Section title="What you're working on" hint="Your choices. Practice and reflection lean towards them; nothing is locked out.">
        <div class="field">
          <span class="label">Focus areas</span>
          <Chips
            label="Focus areas"
            options={WEAKNESSES.map((w) => ({ value: w.id, label: w.skill }))}
            selected={settings.focus}
            onToggle={(id) => void saveSettings({ focus: settings.focus.includes(id) ? settings.focus.filter((f) => f !== id) : [...settings.focus, id] })}
          />
        </div>
        <div class="field">
          <span class="label">Subjects you draw</span>
          <Chips
            label="Subjects you draw"
            options={SUBJECTS.map((s) => ({ value: s.id, label: s.label, icon: s.icon }))}
            selected={settings.subjects}
            onToggle={(id) =>
              void saveSettings({ subjects: settings.subjects.includes(id) ? settings.subjects.filter((s) => s !== id) : [...settings.subjects, id] })
            }
          />
        </div>
        <label class="switch-row">
          <input class="check" type="checkbox" checked={settings.redGreenMode} onChange={(e) => void saveSettings({ redGreenMode: e.currentTarget.checked })} />
          <span>
            <strong>Red-green colorblind mode</strong>
            <span class="hint small" style={{ display: 'block' }}>
              Flags paints you are likely to confuse and warns when a sampled color sits in the red, green, brown and orange zone. The app itself never relies on color either way.
            </span>
          </span>
        </label>
      </Section>

      <Divider />

      <Section title="Demo data" hint="Generated placeholder sketches so you can see every screen filled in. Clearing removes only the demo items.">
        {settings.demoLoaded ? (
          <Button block disabled={busy !== null} onClick={() => void run('demo', async () => (await clearDemoData(), 'Demo data cleared.'))}>
            {busy === 'demo' ? 'Clearing…' : 'Clear demo data'}
          </Button>
        ) : (
          <Button block disabled={busy !== null} onClick={() => void run('demo', async () => (await loadDemoData(), 'Demo data loaded. Look around.'))}>
            {busy === 'demo' ? 'Drawing demo pages…' : 'Load demo data'}
          </Button>
        )}
      </Section>

      <Divider />

      <Section title="Install on your iPhone">
        <ol class="steps">
          <li>Open this page in Safari.</li>
          <li>Tap the Share button, then "Add to Home Screen."</li>
          <li>Open it from the home screen. It runs full-screen and works with no signal.</li>
        </ol>
      </Section>

      <Divider />

      <Section title="Start over">
        <Button block icon="trash" onClick={() => setConfirmErase(true)}>
          Erase everything on this phone
        </Button>
        <p class="small muted">Sketchbook Coach 1.0 · no account, no analytics, no network after the first load.</p>
      </Section>

      {confirmErase && (
        <Sheet title="Erase everything?" onClose={() => setConfirmErase(false)}>
          <p>Every sketch, reflection, paint and setting on this phone will be removed. Export a backup first if there is anything you want to keep.</p>
          <Button
            block
            icon="trash"
            onClick={() => {
              setConfirmErase(false);
              void run('erase', async () => (await eraseEverything(), 'Everything erased.'));
            }}
          >
            Erase permanently
          </Button>
          <Button variant="primary" block onClick={() => setConfirmErase(false)}>
            Keep my data
          </Button>
        </Sheet>
      )}
    </Screen>
  );
}
