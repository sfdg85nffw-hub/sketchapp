import { describe, expect, it } from 'vitest';
import { ciede2000 } from '../../src/lib/color/ciede2000';
import { chromaticDifference, CONFUSION_THRESHOLD, findConfusablePairs } from '../../src/lib/color/confusable';
import { rgbToLab, type RGB } from '../../src/lib/color/convert';
import { MACHADO_MATRICES, simulateCvd, simulateCvdLinear, type CvdType } from '../../src/lib/color/cvd';
import { DEFAULT_PAINTS } from '../../src/data/paints';

const TYPES: CvdType[] = ['protanopia', 'deuteranopia'];
const dE = (a: RGB, b: RGB) => ciede2000(rgbToLab(a), rgbToLab(b));

describe('Machado et al. (2009) simulation', () => {
  it('uses matrices whose rows sum to one, so greys are untouched', () => {
    for (const type of TYPES) {
      for (const row of MACHADO_MATRICES[type]) {
        expect(row[0] + row[1] + row[2]).toBeCloseTo(1, 4);
      }
      for (const g of [0, 60, 128, 200, 255]) {
        expect(simulateCvd([g, g, g], type)).toEqual([g, g, g]);
      }
    }
  });

  it('reproduces the published severity-1.0 coefficients', () => {
    expect(simulateCvdLinear([1, 0, 0], 'protanopia')).toEqual([0.152286, 0.114503, 0]);
    expect(simulateCvdLinear([0, 1, 0], 'deuteranopia')[0]).toBeCloseTo(0.860646, 6);
    expect(simulateCvdLinear([0, 1, 0], 'deuteranopia')[1]).toBeCloseTo(0.672501, 6);
  });

  it('darkens pure red for a protanope much more than for a deuteranope', () => {
    const protan = rgbToLab(simulateCvd([255, 0, 0], 'protanopia'))[0];
    const deutan = rgbToLab(simulateCvd([255, 0, 0], 'deuteranopia'))[0];
    const normal = rgbToLab([255, 0, 0])[0];
    expect(protan).toBeLessThan(normal - 10);
    expect(protan).toBeLessThan(deutan);
  });

  it('collapses red-green differences and keeps blue-yellow ones', () => {
    const red: RGB = [200, 60, 50];
    const green: RGB = [110, 140, 50];
    const blue: RGB = [40, 70, 180];
    const yellow: RGB = [240, 210, 60];
    for (const type of TYPES) {
      const redGreen = chromaticDifference(rgbToLab(simulateCvd(red, type)), rgbToLab(simulateCvd(green, type)));
      expect(redGreen).toBeLessThan(chromaticDifference(rgbToLab(red), rgbToLab(green)) * 0.5);
      expect(dE(simulateCvd(blue, type), simulateCvd(yellow, type))).toBeGreaterThan(0.7 * dE(blue, yellow));
    }
  });

  it('removes the red-green axis: simulated colours have almost no a* spread compared with b*', () => {
    const colours: RGB[] = [[200, 40, 40], [40, 160, 60], [220, 130, 30], [140, 80, 40], [30, 130, 100]];
    for (const type of TYPES) {
      const labs = colours.map((c) => rgbToLab(simulateCvd(c, type)));
      const spread = (i: 1 | 2) => Math.max(...labs.map((l) => l[i])) - Math.min(...labs.map((l) => l[i]));
      expect(spread(1)).toBeLessThan(spread(2) * 0.5);
    }
  });
});

describe('confusable paint pairs', () => {
  const pairs = findConfusablePairs(DEFAULT_PAINTS);
  const has = (x: string, y: string) =>
    pairs.some((p) => {
      const names = [p.a, p.b].map((id) => DEFAULT_PAINTS.find((q) => q.id === id)!.name);
      return names.includes(x) && names.includes(y);
    });

  it('flags the classic red-green confusions in the starter set', () => {
    expect(has('Leaf Green', 'Orange') || has('Leaf Green', 'Yellow Ochre') || has('Leaf Green', 'Burnt Sienna')).toBe(
      true,
    );
    expect(pairs.length).toBeGreaterThan(0);
  });

  it('never flags blue against yellow', () => {
    expect(has('Ultramarine', 'Yellow')).toBe(false);
    expect(has('Light Blue', 'Yellow Ochre')).toBe(false);
  });

  it('only reports pairs under the confusion threshold, most misleading first', () => {
    for (const p of pairs) expect(p.simulatedDifference).toBeLessThanOrEqual(CONFUSION_THRESHOLD);
    for (let i = 1; i < pairs.length; i++) {
      const gap = (p: (typeof pairs)[number]) => p.normalDifference - p.simulatedDifference;
      expect(gap(pairs[i - 1]!)).toBeGreaterThanOrEqual(gap(pairs[i]!));
    }
  });

  it('marks near-identical paints as similar for everyone', () => {
    const twins = findConfusablePairs([
      { id: 'a', name: 'Grey A', rgb: [120, 120, 124] },
      { id: 'b', name: 'Grey B', rgb: [124, 120, 120] },
    ]);
    expect(twins).toHaveLength(1);
    expect(twins[0]!.similarForEveryone).toBe(true);
  });
});
