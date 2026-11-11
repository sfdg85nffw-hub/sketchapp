import { describe, expect, it } from 'vitest';
import { backupFileName, packBackup, unpackBackup, type BackupRecords } from '../../src/lib/backup';
import { buildCritiquePrompt } from '../../src/lib/critique';
import { addDays, diffDays, formatMonth, monthKey, previousMonth, toDateKey } from '../../src/lib/dates';
import {
  backupAgeDays,
  daysDrawnInMonth,
  groupByMonth,
  needByWeakness,
  ratingSeries,
  recentAverage,
  reviewDueFor,
  trendOf,
} from '../../src/lib/stats';
import type { Entry, Rating, StoredImage } from '../../src/lib/types';
import { WEAKNESS_IDS, WEAKNESSES } from '../../src/data/weaknesses';
import { zipSync, strToU8 } from 'fflate';

function entry(id: string, date: string, ratings: Rating[] = [], extra: Partial<Entry> = {}): Entry {
  return {
    id,
    createdAt: `${date}T12:00:00.000Z`,
    date,
    imageId: `img-${id}`,
    thumbId: `th-${id}`,
    subject: 'urban',
    medium: 'ink',
    weaknessIds: [],
    baseline: false,
    ...(ratings.length
      ? {
          reflection: {
            at: `${date}T12:05:00.000Z`,
            items: ratings.map((rating) => ({ weaknessId: 'cast-shadows' as const, prompt: 'p', rating })),
          },
        }
      : {}),
    ...extra,
  };
}

describe('dates', () => {
  it('adds and diffs days across month and year ends', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(diffDays('2026-10-31', '2026-11-02')).toBe(2);
    expect(diffDays('2026-11-02', '2026-10-31')).toBe(-2);
  });

  it('diffs correctly across a daylight-saving change', () => {
    expect(diffDays('2026-10-31', '2026-11-03')).toBe(3);
    expect(diffDays('2026-03-07', '2026-03-09')).toBe(2);
  });

  it('handles month keys', () => {
    expect(monthKey('2026-11-11')).toBe('2026-11');
    expect(previousMonth('2026-01')).toBe('2025-12');
    expect(previousMonth('2026-11')).toBe('2026-10');
    expect(formatMonth('2026-11', 'en-US')).toBe('November 2026');
    expect(toDateKey(new Date(2026, 10, 1))).toBe('2026-11-01');
  });
});

describe('progress stats', () => {
  const entries = [
    entry('a', '2026-10-03', [0]),
    entry('b', '2026-10-03', [0]),
    entry('c', '2026-10-20', [1]),
    entry('d', '2026-11-02', [1]),
    entry('e', '2026-11-05', [2]),
    entry('f', '2026-11-09', [2]),
  ];

  it('counts distinct days drawn, not sketches, and no streaks', () => {
    expect(daysDrawnInMonth(entries, '2026-10')).toBe(2);
    expect(daysDrawnInMonth(entries, '2026-11')).toBe(3);
    expect(daysDrawnInMonth(entries, '2026-09')).toBe(0);
  });

  it('groups the timeline by month, newest first', () => {
    const groups = groupByMonth(entries);
    expect(groups.map((g) => g.month)).toEqual(['2026-11', '2026-10']);
    expect(groups[0]!.entries.map((e) => e.id)).toEqual(['f', 'e', 'd']);
  });

  it('builds a rating series per weakness, oldest first', () => {
    const series = ratingSeries(entries).get('cast-shadows')!;
    expect(series.map((p) => p.rating)).toEqual([0, 0, 1, 1, 2, 2]);
    expect(recentAverage(series)).toBeCloseTo((0 + 1 + 1 + 2 + 2) / 5, 10);
    expect(trendOf(series)).toBe('up');
    expect(trendOf(series.slice(0, 3))).toBe('none');
    expect(trendOf([...series].reverse())).toBe('down');
  });

  it('turns ratings into need, with unrated weaknesses in the middle', () => {
    const need = needByWeakness(entries, WEAKNESS_IDS);
    expect(need['cast-shadows']).toBeCloseTo(1 - 1.2 / 2, 10);
    expect(need['figures']).toBe(0.5);
  });

  it('asks for a monthly review only when last month has sketches and no review', () => {
    expect(reviewDueFor('2026-11-01', entries, [])).toBe('2026-10');
    expect(reviewDueFor('2026-11-20', entries, [{ month: '2026-10', at: 'x' }])).toBeNull();
    expect(reviewDueFor('2026-11-20', entries, [], '2026-10')).toBeNull();
    expect(reviewDueFor('2026-12-01', entries.slice(0, 3), [])).toBeNull();
  });

  it('measures backup age from the last backup, or from first use', () => {
    const now = new Date('2026-11-20T10:00:00Z');
    expect(backupAgeDays(now, '2026-11-01T10:00:00Z', '2026-06-01T00:00:00Z')).toBe(19);
    expect(backupAgeDays(now, undefined, '2026-11-18T10:00:00Z')).toBe(2);
  });
});

describe('backup zip', () => {
  const records: BackupRecords = {
    entries: [entry('a', '2026-11-02', [1], { location: '135th St B/C Station', feeling: 'tired' })],
    drillStates: [],
    paints: [],
    projects: [],
    reviews: [{ month: '2026-10', at: '2026-11-01T09:00:00Z', focus: 'true-darks' }],
    settings: null,
  };
  const image: StoredImage = {
    id: 'img-a',
    data: Uint8Array.from([255, 216, 255, 224, 1, 2, 3, 4, 255, 217]).buffer,
    type: 'image/jpeg',
    width: 4,
    height: 3,
  };

  it('round-trips records and image bytes exactly', () => {
    const zip = packBackup(records, [image], '2026-11-11T00:00:00Z');
    const out = unpackBackup(zip);
    expect(out.records).toEqual(records);
    expect(out.exportedAt).toBe('2026-11-11T00:00:00Z');
    expect(out.images).toHaveLength(1);
    expect(out.images[0]).toMatchObject({ id: 'img-a', type: 'image/jpeg', width: 4, height: 3 });
    expect([...new Uint8Array(out.images[0]!.data)]).toEqual([...new Uint8Array(image.data)]);
  });

  it('rejects files that are not backups, in plain language', () => {
    expect(() => unpackBackup(Uint8Array.from([1, 2, 3]))).toThrow(/not a zip/);
    expect(() => unpackBackup(zipSync({ 'hello.txt': strToU8('hi') }))).toThrow(/data\.json/);
    expect(() => unpackBackup(zipSync({ 'data.json': strToU8('{"app":"other"}') }))).toThrow(/not made by/);
    expect(() =>
      unpackBackup(zipSync({ 'data.json': strToU8('{"app":"sketchbook-coach","version":99}') })),
    ).toThrow(/newer version/);
  });

  it('names the file by date', () => {
    expect(backupFileName(new Date(2026, 10, 5))).toBe('sketchbook-coach-backup-2026-11-05.zip');
  });
});

describe('critique prompt', () => {
  it('includes his profile, the sketch facts, his self-ratings and all ten weaknesses', () => {
    const e = entry('a', '2026-11-02', [1], { feeling: 'tired', location: '135th St B/C Station', minutes: 20 });
    e.reflection!.items[0]!.prompt = 'Where is the cast shadow?';
    e.reflection!.items[0]!.note = 'forgot the bench again';
    const text = buildCritiquePrompt({
      entry: e,
      subjectLabel: 'Urban',
      mediumLabel: 'Ink',
      weaknessTitles: WEAKNESSES.map((w) => w.title),
      focusTitles: [],
    });
    expect(text).toContain('red-green colorblind');
    expect(text).toContain('Feeling word I was aiming for: tired');
    expect(text).toContain('135th St B/C Station');
    expect(text).toContain('Where is the cast shadow? Partly. Note: forgot the bench again');
    for (const w of WEAKNESSES) expect(text).toContain(w.title);
    expect(text).toContain('honest');
  });
});
