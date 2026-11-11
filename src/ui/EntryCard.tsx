import { subjectIcon, subjectLabel } from '../data/catalog';
import { formatDay } from '../lib/dates';
import type { Entry } from '../lib/types';
import { Icon } from './Icon';
import { StoredImg } from './kit';

export function entryAlt(entry: Entry): string {
  return `${subjectLabel(entry.subject)} sketch, ${formatDay(entry.date)}${entry.location ? `, ${entry.location}` : ''}`;
}

interface EntryThumbProps {
  entry: Entry;
  /** When given, the card is a toggle button instead of a link to the entry. */
  onPick?: (entry: Entry) => void;
  picked?: boolean;
}

/** A journal thumbnail: photo, date, subject icon, and a flagged label for baselines. */
export function EntryThumb({ entry, onPick, picked }: EntryThumbProps) {
  const body = (
    <>
      <div class="thumb-img">
        <StoredImg id={entry.thumbId} alt={entryAlt(entry)} />
        {entry.baseline && (
          <span class="tag tag-solid">
            <Icon name="flag" size={12} />
            Baseline
          </span>
        )}
      </div>
      <div class="thumb-cap">
        <Icon name={subjectIcon(entry.subject)} size={16} />
        <span>
          {formatDay(entry.date)}
          {entry.location ? ` · ${entry.location}` : ''}
        </span>
      </div>
    </>
  );
  if (onPick) {
    return (
      <button type="button" class="thumb" aria-pressed={picked ?? false} onClick={() => onPick(entry)}>
        {body}
      </button>
    );
  }
  return (
    <a class="thumb" href={`#/entry/${entry.id}`}>
      {body}
    </a>
  );
}
