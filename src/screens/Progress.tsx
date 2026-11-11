import { useMemo } from 'preact/hooks';
import { SUBJECTS } from '../data/catalog';
import { weaknessById, WEAKNESSES } from '../data/weaknesses';
import { getEntries, getReviews } from '../db/db';
import { formatDay, formatMonth, fromDateKey, monthKey, toDateKey } from '../lib/dates';
import { daysDrawnInMonth, ratingSeries, recentAverage, reviewDueFor, trendOf, type RatingPoint, type Trend } from '../lib/stats';
import type { Entry, Rating } from '../lib/types';
import { entryAlt } from '../ui/EntryCard';
import { useLive, useSettings } from '../ui/hooks';
import { Icon, type IconName } from '../ui/Icon';
import { Divider, Empty, Header, RATING_OPTIONS, Section, StoredImg } from '../ui/kit';
import { Screen } from '../ui/Screen';
import { nowFor, thenFor } from './ThenNow';

const TREND: Record<Trend, { label: string; icon: IconName | null }> = {
  up: { label: 'rising', icon: 'arrowUp' },
  steady: { label: 'holding', icon: 'arrowFlat' },
  down: { label: 'slipping', icon: 'arrowDown' },
  none: { label: '', icon: null },
};

const SPARK_POINTS = 12;

/**
 * One small chart per weakness. Height carries the rating; the marker shape repeats it
 * (hollow, ringed, solid) so the chart reads in greyscale. The dashed line is a running average.
 */
function SkillChart({ points }: { points: readonly RatingPoint[] }) {
  const shown = points.slice(-SPARK_POINTS);
  const x = (i: number) => (shown.length === 1 ? 60 : 8 + (i * 104) / (shown.length - 1));
  const y = (rating: number) => 40 - rating * 16;
  const average = shown.map((_, i) => {
    const window = shown.slice(Math.max(0, i - 2), i + 1);
    return window.reduce((s, p) => s + p.rating, 0) / window.length;
  });
  return (
    <svg viewBox="0 0 120 48" aria-hidden="true">
      {[0, 1, 2].map((r) => (
        <line key={r} x1="4" x2="116" y1={y(r)} y2={y(r)} stroke="currentColor" stroke-width="0.6" stroke-dasharray="1 3" opacity="0.5" />
      ))}
      {shown.length > 1 && (
        <polyline points={average.map((a, i) => `${x(i)},${y(a)}`).join(' ')} fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 2.5" />
      )}
      {shown.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.rating)} r="3.4" fill={p.rating === 2 ? 'currentColor' : 'var(--paper-raised)'} stroke="currentColor" stroke-width="1.4" />
          {p.rating === 1 && <circle cx={x(i)} cy={y(p.rating)} r="1.2" fill="currentColor" />}
        </g>
      ))}
    </svg>
  );
}

function MonthGrid({ entries, today }: { entries: readonly Entry[]; today: string }) {
  const month = monthKey(today);
  const first = fromDateKey(`${month}-01`);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const drawn = new Set(entries.filter((e) => monthKey(e.date) === month).map((e) => Number(e.date.slice(8))));
  const cells: (number | null)[] = [...Array.from({ length: first.getDay() }, () => null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  return (
    <div class="daygrid" role="img" aria-label={`${formatMonth(month)}: drew on ${drawn.size} ${drawn.size === 1 ? 'day' : 'days'}`}>
      {cells.map((day, i) =>
        day === null ? (
          <span key={i} class="pad" />
        ) : (
          <span key={i} class={`${drawn.has(day) ? 'drawn' : ''}${day === Number(today.slice(8)) ? ' today' : ''}`}>
            {drawn.has(day) ? '●' : day}
          </span>
        ),
      )}
    </div>
  );
}

export function Progress() {
  const entries = useLive(getEntries);
  const reviews = useLive(getReviews);
  const settings = useSettings();
  const today = toDateKey(new Date());

  const series = useMemo(() => ratingSeries(entries ?? []), [entries]);
  if (!entries || !reviews) return <Screen label="Progress">{null}</Screen>;

  const month = monthKey(today);
  const days = daysDrawnInMonth(entries, month);
  const reviewMonth = reviewDueFor(today, entries, reviews, settings.reviewSkippedMonth);
  const lastReview = [...reviews].sort((a, b) => b.month.localeCompare(a.month))[0];
  const pairs = SUBJECTS.flatMap((s) => {
    const then = thenFor(entries, s.id);
    const now = then ? nowFor(entries, s.id, then.id) : undefined;
    return then?.baseline && now ? [{ subject: s, then, now }] : [];
  });
  const rated = WEAKNESSES.filter((w) => (series.get(w.id)?.length ?? 0) > 0).length;

  return (
    <Screen label="Progress">
      <Header title="Progress">
        <a class="icon-btn" href="#/settings" aria-label="Settings and backup">
          <Icon name="settings" />
        </a>
      </Header>

      <div class="stat-pair">
        <div class="card">
          <p class="bignum">{days}</p>
          <p class="small">
            <strong>{days === 1 ? 'day' : 'days'} drawn</strong> in {formatMonth(month).split(' ')[0]}
          </p>
        </div>
        <div class="card">
          <p class="bignum">{entries.length}</p>
          <p class="small">
            <strong>{entries.length === 1 ? 'sketch' : 'sketches'}</strong> in the journal
          </p>
        </div>
      </div>
      <MonthGrid entries={entries} today={today} />
      <p class="small muted">Filled squares are days you drew. No streaks: a missed day costs nothing.</p>

      {reviewMonth && (
        <a class="list-link" href={`#/review/${reviewMonth}`}>
          <Icon name="calendar" />
          <span class="grow">
            Review {formatMonth(reviewMonth)}
            <span class="sub">Best sketch, the one that taught you most, next focus</span>
          </span>
          <Icon name="chevron" size={20} />
        </a>
      )}

      <Divider />

      <Section
        title="Skill trends"
        hint={
          rated === 0
            ? 'These fill in from your own answers in the reflection after each sketch.'
            : 'From your own reflection answers. Each dot is one sketch: low is "not yet", middle "partly", top "yes".'
        }
      >
        {rated === 0 ? (
          <Empty icon="chart" title="No ratings yet">
            <p class="muted">Capture a sketch and answer the reflection. Three or four taps per sketch is all this needs.</p>
          </Empty>
        ) : (
          <>
            <ul class="row-wrap small" aria-label="Chart key">
              {RATING_OPTIONS.map((o) => (
                <li key={o.value} class="row-wrap" style={{ gap: '0.25rem' }}>
                  <Icon name={o.value === 1 ? 'ratingPartly' : o.icon} size={14} /> {o.label}
                </li>
              ))}
              <li>╌ running average</li>
            </ul>
            <div class="skill-grid">
              {WEAKNESSES.map((w) => {
                const points = series.get(w.id) ?? [];
                const average = recentAverage(points);
                const trend = TREND[trendOf(points)];
                const now = average === null ? null : RATING_OPTIONS[Math.round(average) as Rating]!;
                return (
                  <div key={w.id} class="skill">
                    <h3>
                      {w.skill}
                      {settings.focus.includes(w.id) && <span class="tag" style={{ marginLeft: '0.35rem' }}>Focus</span>}
                    </h3>
                    {points.length > 0 ? <SkillChart points={points} /> : <p class="small muted" style={{ minHeight: '3rem' }}>Not rated yet.</p>}
                    {now && (
                      <p class="now">
                        <Icon name={now.icon} size={14} />
                        <span>
                          Lately: {now.label.toLowerCase()}
                          {trend.label ? `, ${trend.label}` : ''}
                        </span>
                        {trend.icon && <Icon name={trend.icon} size={14} />}
                      </p>
                    )}
                    <p class="vh">
                      {points.length} ratings: {points.map((p) => RATING_OPTIONS[p.rating]!.label).join(', ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Section>

      <Divider />

      <Section title="Then / Now" hint="Your baselines against your latest work.">
        {pairs.length === 0 ? (
          <p class="card card-note">
            No baseline pairs yet. Mark a sketch as a baseline, draw the same kind of subject again later, and the two appear here.
          </p>
        ) : (
          <ul class="stack">
            {pairs.map(({ subject, then, now }) => (
              <li key={subject.id}>
                <a class="list-link" href={`#/thennow?a=${then.id}&b=${now.id}`}>
                  <StoredImg id={then.thumbId} alt={`Then: ${entryAlt(then)}`} class="swatch" />
                  <StoredImg id={now.thumbId} alt={`Now: ${entryAlt(now)}`} class="swatch" />
                  <span class="grow">
                    {subject.label}
                    <span class="sub">
                      {formatDay(then.date)} → {formatDay(now.date)}
                    </span>
                  </span>
                  <Icon name="chevron" size={20} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {lastReview && (
        <Section title="Last monthly review" hint={formatMonth(lastReview.month)}>
          <p>
            {lastReview.focus ? (
              <>
                You chose to focus on <strong>{weaknessById(lastReview.focus).skill.toLowerCase()}</strong>.
              </>
            ) : (
              'No focus chosen.'
            )}
          </p>
        </Section>
      )}

      <Divider />

      <ul class="stack">
        <li>
          <a class="list-link" href="#/materials">
            <Icon name="book" />
            <span class="grow">
              Materials notes
              <span class="sub">Ink, paper, the water brush, the fude nib</span>
            </span>
            <Icon name="chevron" size={20} />
          </a>
        </li>
        <li>
          <a class="list-link" href="#/settings">
            <Icon name="settings" />
            <span class="grow">
              Settings and backup
              <span class="sub">
                {settings.lastBackupAt ? `Last backup ${formatDay(toDateKey(new Date(settings.lastBackupAt)))}` : 'No backup yet'}
              </span>
            </span>
            <Icon name="chevron" size={20} />
          </a>
        </li>
      </ul>
    </Screen>
  );
}
