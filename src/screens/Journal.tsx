import { useMemo, useState } from 'preact/hooks';
import { MEDIUMS, SUBJECTS, subjectLabel } from '../data/catalog';
import { WEAKNESSES } from '../data/weaknesses';
import { exportBackup } from '../db/backupIo';
import { getEntries, getReviews, saveSettings } from '../db/db';
import { formatMonth, toDateKey } from '../lib/dates';
import { BACKUP_REMINDER_DAYS, backupAgeDays, groupByMonth, reviewDueFor } from '../lib/stats';
import type { Entry, MediumId, Settings, SubjectId, WeaknessId } from '../lib/types';
import { setPendingCapture } from '../ui/captureStore';
import { EntryThumb } from '../ui/EntryCard';
import { useLive, useSettings } from '../ui/hooks';
import { Icon } from '../ui/Icon';
import { Button, Chips, Divider, Empty, FileButton, Header, Sheet, toast } from '../ui/kit';
import { navigate } from '../ui/router';
import { Screen } from '../ui/Screen';

interface Filters {
  subject: SubjectId | null;
  medium: MediumId | null;
  weakness: WeaknessId | null;
}

const NO_FILTERS: Filters = { subject: null, medium: null, weakness: null };

function matches(entry: Entry, f: Filters): boolean {
  return (
    (!f.subject || entry.subject === f.subject) &&
    (!f.medium || entry.medium === f.medium) &&
    (!f.weakness || entry.weaknessIds.includes(f.weakness) || (entry.reflection?.items.some((i) => i.weaknessId === f.weakness) ?? false))
  );
}

/** At most one notice at a time, so the journal never opens on a stack of chores. */
function Notice({ entries, settings, reviewMonth }: { entries: Entry[]; settings: Settings; reviewMonth: string | null }) {
  const now = new Date();
  if (reviewMonth) {
    return (
      <div class="card card-accent">
        <p class="kicker">Monthly review</p>
        <h2>Look back at {formatMonth(reviewMonth)}</h2>
        <p class="muted">Pick your best sketch, the one that taught you most, and one thing to focus on next. Two minutes.</p>
        <div class="row-wrap">
          <Button variant="primary" onClick={() => navigate(`/review/${reviewMonth}`)}>
            Start the review
          </Button>
          <Button variant="quiet" onClick={() => void saveSettings({ reviewSkippedMonth: reviewMonth })}>
            Skip this month
          </Button>
        </div>
      </div>
    );
  }

  const age = backupAgeDays(now, settings.lastBackupAt, settings.firstUseAt);
  const snoozed = settings.backupSnoozedUntil !== undefined && settings.backupSnoozedUntil > now.toISOString();
  if (entries.some((e) => !e.demo) && age >= BACKUP_REMINDER_DAYS && !snoozed) {
    return (
      <div class="card card-accent">
        <p class="kicker">Backup</p>
        <h2>{settings.lastBackupAt ? `Last backup was ${age} days ago` : 'No backup yet'}</h2>
        <p class="muted">iOS can clear a web app's storage without asking. One tap saves everything as a single file.</p>
        <div class="row-wrap">
          <Button
            variant="primary"
            icon="share"
            onClick={() =>
              void exportBackup().then(
                (outcome) => outcome !== 'cancelled' && toast('Backup saved. Keep the file somewhere off this phone.'),
                (error: unknown) => toast(error instanceof Error ? error.message : 'The backup could not be saved.'),
              )
            }
          >
            Back up now
          </Button>
          <Button
            variant="quiet"
            onClick={() => void saveSettings({ backupSnoozedUntil: new Date(now.getTime() + 7 * 86_400_000).toISOString() })}
          >
            Remind me next week
          </Button>
        </div>
      </div>
    );
  }

  if (!settings.baselinePromptDismissed) {
    const have = new Set(entries.filter((e) => e.baseline).map((e) => e.subject));
    const wanted = settings.subjects.filter((s) => !have.has(s));
    if (wanted.length === 0) return null;
    return (
      <div class="card card-note">
        <p class="kicker">When you're ready</p>
        <h2>Make a "before" for each subject</h2>
        <p class="muted">
          One dated drawing, done the way you draw today. Rough is the point. This is your "before." Capture it, then choose "Mark as baseline."
        </p>
        <ul class="row-wrap" aria-label="Subjects without a baseline yet">
          {wanted.map((s) => (
            <li key={s} class="tag">
              <Icon name="ratingNo" size={12} />
              {subjectLabel(s)}
            </li>
          ))}
        </ul>
        <Button variant="quiet" onClick={() => void saveSettings({ baselinePromptDismissed: true })}>
          Got it, don't show again
        </Button>
      </div>
    );
  }
  return null;
}

export function Journal() {
  const entries = useLive(getEntries);
  const reviews = useLive(getReviews);
  const settings = useSettings();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const visible = useMemo(() => (entries ?? []).filter((e) => matches(e, filters)), [entries, filters]);
  const groups = useMemo(() => groupByMonth(visible), [visible]);
  const active = [filters.subject, filters.medium, filters.weakness].filter(Boolean).length;

  if (!entries || !reviews) return <Screen label="Journal">{null}</Screen>;

  const reviewMonth = reviewDueFor(toDateKey(new Date()), entries, reviews, settings.reviewSkippedMonth);
  const toggle = <K extends keyof Filters>(key: K, value: NonNullable<Filters[K]>) =>
    setFilters({ ...filters, [key]: filters[key] === value ? null : value });

  return (
    <Screen label="Journal">
      <Header title="Journal">
        {entries.length > 1 && (
          <a class="icon-btn" href="#/thennow" aria-label="Then and now comparison">
            <Icon name="slider" />
          </a>
        )}
        {entries.length > 0 && (
          <button type="button" class="icon-btn" aria-label={active ? `Filter, ${active} active` : 'Filter'} onClick={() => setFilterOpen(true)}>
            <Icon name="filter" />
          </button>
        )}
      </Header>

      <Notice entries={entries} settings={settings} reviewMonth={reviewMonth} />

      {entries.length === 0 && (
        <Empty icon="journal" title="No pages yet">
          <p class="muted">Photograph a sketchbook page and it lands here, dated. The Capture button is under your thumb.</p>
          <FileButton
            variant="quiet"
            icon="image"
            testId="library-input"
            onFile={(file) => {
              setPendingCapture(file);
              navigate('/capture');
            }}
          >
            Or add a photo from your library
          </FileButton>
        </Empty>
      )}

      {active > 0 && (
        <div class="row">
          <p class="grow small">
            Showing {visible.length} of {entries.length} sketches.
          </p>
          <Button variant="quiet" onClick={() => setFilters(NO_FILTERS)}>
            Clear filters
          </Button>
        </div>
      )}

      {groups.map((group) => (
        <section key={group.month} class="stack" aria-label={formatMonth(group.month)}>
          <div class="month-head">
            <h2>{formatMonth(group.month)}</h2>
            <span class="count">
              {group.entries.length} {group.entries.length === 1 ? 'sketch' : 'sketches'}
            </span>
          </div>
          <Divider />
          <div class="thumb-grid">
            {group.entries.map((entry) => (
              <EntryThumb key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ))}

      {entries.length > 0 && visible.length === 0 && <p class="muted">Nothing matches those filters.</p>}

      {filterOpen && (
        <Sheet title="Filter the journal" onClose={() => setFilterOpen(false)}>
          <div class="field">
            <span class="label">Subject</span>
            <Chips
              label="Subject"
              options={SUBJECTS.map((s) => ({ value: s.id, label: s.label, icon: s.icon }))}
              selected={filters.subject ? [filters.subject] : []}
              onToggle={(v) => toggle('subject', v)}
            />
          </div>
          <div class="field">
            <span class="label">Medium</span>
            <Chips
              label="Medium"
              options={MEDIUMS.map((m) => ({ value: m.id, label: m.label }))}
              selected={filters.medium ? [filters.medium] : []}
              onToggle={(v) => toggle('medium', v)}
            />
          </div>
          <div class="field">
            <span class="label">Weakness worked on or reflected on</span>
            <Chips
              label="Weakness"
              options={WEAKNESSES.map((w) => ({ value: w.id, label: w.skill }))}
              selected={filters.weakness ? [filters.weakness] : []}
              onToggle={(v) => toggle('weakness', v)}
            />
          </div>
          <Button variant="primary" block onClick={() => setFilterOpen(false)}>
            Show {visible.length} {visible.length === 1 ? 'sketch' : 'sketches'}
          </Button>
        </Sheet>
      )}
    </Screen>
  );
}
