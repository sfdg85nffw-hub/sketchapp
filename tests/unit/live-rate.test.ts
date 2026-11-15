import { describe, expect, it } from 'vitest';
import { keepingUp, LIVE_HEIGHTS, nextRung, TARGET_FPS } from '../../src/lib/image/liveRate';

describe('live view frame rate', () => {
  it('is keeping up at the target rate, whatever the camera delivered', () => {
    expect(keepingUp({ processed: TARGET_FPS, presented: 60, seconds: 1 })).toBe(true);
    expect(keepingUp({ processed: 30, presented: 30, seconds: 1 })).toBe(true);
  });

  it('is keeping up with a camera that slowed itself down in dim light', () => {
    expect(keepingUp({ processed: 15, presented: 15, seconds: 1 })).toBe(true);
    expect(keepingUp({ processed: 14, presented: 15, seconds: 1 })).toBe(true);
  });

  it('is falling behind when it draws well under the frames the camera presented', () => {
    expect(keepingUp({ processed: 20, presented: 30, seconds: 1 })).toBe(false);
    expect(keepingUp({ processed: 31, presented: 45, seconds: 1.5 })).toBe(false);
  });

  it('treats an empty window as keeping up', () => {
    expect(keepingUp({ processed: 0, presented: 0, seconds: 0 })).toBe(true);
  });

  it('steps down one rung after two slow windows, and stops at the last', () => {
    expect(nextRung(0, 1)).toBe(0);
    expect(nextRung(0, 2)).toBe(1);
    expect(nextRung(1, 3)).toBe(2);
    expect(nextRung(LIVE_HEIGHTS.length - 1, 5)).toBe(LIVE_HEIGHTS.length - 1);
    expect([...LIVE_HEIGHTS]).toEqual([...LIVE_HEIGHTS].sort((a, b) => b - a));
  });
});
