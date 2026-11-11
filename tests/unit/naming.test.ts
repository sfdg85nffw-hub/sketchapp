import { describe, expect, it } from 'vitest';
import { hexToRgb, rgbToLab, type RGB } from '../../src/lib/color/convert';
import { COLOR_NAMES, isConfusableFamily, nearestColorName } from '../../src/lib/color/names';
import {
  BOUNDARY_HALF_WIDTH,
  classifyTemperature,
  COOL_TO_WARM_HUE,
  NEUTRAL_CHROMA,
  WARM_TO_COOL_HUE,
} from '../../src/lib/color/temperature';
import { closestPaintOrMix } from '../../src/lib/color/match';
import { DEFAULT_PAINTS } from '../../src/data/paints';

const name = (rgb: RGB) => nearestColorName(rgbToLab(rgb));

describe('nearest colour name', () => {
  it('has a curated list of about forty names, all distinct', () => {
    expect(COLOR_NAMES.length).toBeGreaterThanOrEqual(38);
    expect(COLOR_NAMES.length).toBeLessThanOrEqual(46);
    expect(new Set(COLOR_NAMES.map((c) => c.name)).size).toBe(COLOR_NAMES.length);
    expect(new Set(COLOR_NAMES.map((c) => c.hex)).size).toBe(COLOR_NAMES.length);
  });

  it('returns each listed colour for its own hex, at distance zero', () => {
    for (const c of COLOR_NAMES) {
      const match = name(hexToRgb(c.hex));
      expect(match.name).toBe(c.name);
      expect(match.distance).toBeCloseTo(0, 6);
    }
  });

  it('names nearby colours sensibly', () => {
    expect(name([255, 255, 255]).name).toBe('white (bare paper)');
    expect(name([10, 10, 10]).name).toBe('black (like ink)');
    expect(name([128, 128, 128]).name).toBe('mid grey');
    expect(name([120, 135, 150]).name).toBe('muted blue-grey');
    expect(name([140, 72, 40]).name).toBe('warm brown (like burnt sienna)');
    expect(name([40, 60, 170]).name).toBe('deep blue (like ultramarine)');
    expect(name([200, 150, 60]).name).toBe('dull gold-yellow (like yellow ochre)');
  });

  it('puts confusable hues in their families', () => {
    expect(name([210, 30, 40]).family).toBe('red');
    expect(name([40, 160, 80]).family).toBe('green');
    expect(name([90, 60, 45]).family).toBe('brown');
    expect(isConfusableFamily('green')).toBe(true);
    expect(isConfusableFamily('brown')).toBe(true);
    expect(isConfusableFamily('blue')).toBe(false);
    expect(isConfusableFamily('yellow')).toBe(false);
  });
});

describe('warm / cool', () => {
  const temp = (rgb: RGB) => classifyTemperature(rgbToLab(rgb));

  it('calls reds, oranges, yellows and browns warm', () => {
    expect(temp([200, 40, 40])).toBe('warm');
    expect(temp([238, 132, 37])).toBe('warm');
    expect(temp([246, 198, 36])).toBe('warm');
    expect(temp([138, 74, 43])).toBe('warm');
  });

  it('calls blues, blue-greens and violets cool', () => {
    expect(temp([43, 63, 168])).toBe('cool');
    expect(temp([42, 157, 157])).toBe('cool');
    expect(temp([31, 122, 96])).toBe('cool');
    expect(temp([106, 63, 160])).toBe('cool');
  });

  it('has an explicit neutral band for low chroma', () => {
    expect(temp([128, 128, 128])).toBe('neutral');
    expect(temp([250, 250, 248])).toBe('neutral');
    expect(classifyTemperature([50, NEUTRAL_CHROMA - 0.5, 0])).toBe('neutral');
    expect(classifyTemperature([50, NEUTRAL_CHROMA + 0.5, 0])).toBe('warm');
  });

  it('is neutral inside the boundary bands and decided just outside them', () => {
    const at = (hue: number): [number, number, number] => [
      60,
      40 * Math.cos((hue * Math.PI) / 180),
      40 * Math.sin((hue * Math.PI) / 180),
    ];
    expect(classifyTemperature(at(WARM_TO_COOL_HUE))).toBe('neutral');
    expect(classifyTemperature(at(COOL_TO_WARM_HUE))).toBe('neutral');
    expect(classifyTemperature(at(WARM_TO_COOL_HUE - BOUNDARY_HALF_WIDTH - 2))).toBe('warm');
    expect(classifyTemperature(at(WARM_TO_COOL_HUE + BOUNDARY_HALF_WIDTH + 2))).toBe('cool');
    expect(classifyTemperature(at(COOL_TO_WARM_HUE - BOUNDARY_HALF_WIDTH - 2))).toBe('cool');
    expect(classifyTemperature(at(COOL_TO_WARM_HUE + BOUNDARY_HALF_WIDTH + 2))).toBe('warm');
    expect(classifyTemperature(at(350))).toBe('warm');
  });
});

describe('closest paint or mix', () => {
  it('matches a paint to itself at full strength', () => {
    const sienna = DEFAULT_PAINTS.find((p) => p.name === 'Burnt Sienna')!;
    const match = closestPaintOrMix(rgbToLab(sienna.rgb), DEFAULT_PAINTS);
    expect(match?.paintIds).toEqual([sienna.id]);
    expect(match?.dilution).toBe('full strength');
    expect(match?.distance).toBeCloseTo(0, 6);
  });

  it('suggests the blue + brown mix for a neutral dark grey', () => {
    const limitedOnly = DEFAULT_PAINTS.filter((p) => p.inLimited);
    const match = closestPaintOrMix(rgbToLab([70, 66, 70]), limitedOnly);
    expect(match?.paintIds).toHaveLength(2);
    expect(match?.label).toContain('Ultramarine');
    expect(match?.label).toContain('Burnt Sienna');
  });

  it('suggests a pale wash for a pale colour', () => {
    const match = closestPaintOrMix(rgbToLab([206, 214, 238]), DEFAULT_PAINTS);
    expect(match?.dilution).toBe('a pale wash');
  });

  it('returns null with no paints', () => {
    expect(closestPaintOrMix([50, 0, 0], [])).toBeNull();
  });
});
