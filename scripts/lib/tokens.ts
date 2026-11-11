import { readFileSync } from 'node:fs';
import { hexToRgb, type RGB } from '../../src/lib/color/convert';

export type ThemeName = 'light' | 'dark';
export type ThemeTokens = Record<string, RGB>;

const TOKENS_FILE = new URL('../../src/styles/tokens.css', import.meta.url);

/** The hex colour tokens of each `@theme` block in tokens.css. */
export function readThemeTokens(css: string = readFileSync(TOKENS_FILE, 'utf8')): Record<ThemeName, ThemeTokens> {
  const themes = {} as Record<ThemeName, ThemeTokens>;
  for (const match of css.matchAll(/\/\* @theme (light|dark) \*\/[^{]*\{([^}]*)\}/g)) {
    const tokens: ThemeTokens = {};
    for (const line of match[2]!.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) tokens[line[1]!] = hexToRgb(line[2]!);
    themes[match[1] as ThemeName] = tokens;
  }
  return themes;
}

/** The dark tokens as repeated inside the prefers-color-scheme media query. */
export function readMediaDarkTokens(css: string = readFileSync(TOKENS_FILE, 'utf8')): ThemeTokens {
  const block = /@media \(prefers-color-scheme: dark\)\s*\{[^{]*\{([^}]*)\}/.exec(css);
  const tokens: ThemeTokens = {};
  for (const line of (block?.[1] ?? '').matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) tokens[line[1]!] = hexToRgb(line[2]!);
  return tokens;
}

/** Foreground / background pairs the UI actually uses, with the WCAG ratio each must reach. */
export const CONTRAST_PAIRS: readonly { fg: string; bg: string; min: number; use: string }[] = [
  { fg: 'ink', bg: 'paper', min: 7, use: 'Body text' },
  { fg: 'ink', bg: 'paper-raised', min: 7, use: 'Text on cards' },
  { fg: 'ink-2', bg: 'paper', min: 4.5, use: 'Secondary text' },
  { fg: 'ink-2', bg: 'paper-raised', min: 4.5, use: 'Secondary text on cards' },
  { fg: 'ink-3', bg: 'paper', min: 4.5, use: 'Labels and kickers' },
  { fg: 'ink-3', bg: 'paper-raised', min: 4.5, use: 'Unselected tab labels' },
  { fg: 'accent-ink', bg: 'accent', min: 4.5, use: 'Primary button text' },
  { fg: 'accent', bg: 'paper', min: 4.5, use: 'Links and focus ring' },
  { fg: 'ink', bg: 'accent-soft', min: 7, use: 'Selected rating' },
  { fg: 'paper', bg: 'ink', min: 7, use: 'Selected chip, toast' },
  { fg: 'line', bg: 'paper', min: 3, use: 'Control outlines' },
  { fg: 'line', bg: 'paper-raised', min: 3, use: 'Chip outlines' },
];
