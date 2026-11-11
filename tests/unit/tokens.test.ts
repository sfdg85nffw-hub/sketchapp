import { describe, expect, it } from 'vitest';
import { CONTRAST_PAIRS, readMediaDarkTokens, readThemeTokens, type ThemeName } from '../../scripts/lib/tokens';
import { ciede2000 } from '../../src/lib/color/ciede2000';
import { chromaHue, contrastRatio, rgbToLab } from '../../src/lib/color/convert';
import { simulateCvd, type CvdType } from '../../src/lib/color/cvd';

const themes = readThemeTokens();
const THEMES: ThemeName[] = ['light', 'dark'];
const CVD: CvdType[] = ['deuteranopia', 'protanopia'];

describe('UI palette', () => {
  it('defines the same tokens in both themes', () => {
    expect(Object.keys(themes.light).sort()).toEqual(Object.keys(themes.dark).sort());
    expect(Object.keys(themes.light)).toContain('accent');
  });

  it('keeps the system-dark block identical to the explicit dark theme', () => {
    expect(readMediaDarkTokens()).toEqual(themes.dark);
  });

  for (const theme of THEMES) {
    describe(theme, () => {
      it.each(CONTRAST_PAIRS)('$use: $fg on $bg meets its WCAG ratio', ({ fg, bg, min }) => {
        expect(contrastRatio(themes[theme][fg]!, themes[theme][bg]!)).toBeGreaterThanOrEqual(min);
      });

      it.each(CVD)('keeps every contrast pair with simulated %s', (type) => {
        for (const { fg, bg, min } of CONTRAST_PAIRS) {
          const ratio = contrastRatio(simulateCvd(themes[theme][fg]!, type), simulateCvd(themes[theme][bg]!, type));
          expect(ratio, `${fg} on ${bg}`).toBeGreaterThanOrEqual(min);
        }
      });

      it('is monochrome apart from one accent hue on the blue-yellow axis', () => {
        for (const [name, rgb] of Object.entries(themes[theme])) {
          const { chroma, hue } = chromaHue(rgbToLab(rgb));
          if (name.startsWith('accent') && name !== 'accent-ink') {
            // Blue: CIELAB hue between 240 and 300 degrees.
            expect(hue, name).toBeGreaterThan(240);
            expect(hue, name).toBeLessThan(300);
          } else if (name !== 'accent-ink' || chroma > 14) {
            // Paper and ink: warm neutrals, low chroma, on the yellow side.
            expect(chroma, name).toBeLessThan(name === 'accent-ink' ? 30 : 14);
          }
        }
      });

      it.each(CVD)('the accent looks nearly the same with %s', (type) => {
        const accent = themes[theme].accent!;
        expect(ciede2000(rgbToLab(accent), rgbToLab(simulateCvd(accent, type)))).toBeLessThan(8);
      });
    });
  }
});
