import type { Settings } from '../lib/types';

const PAPER = { light: '#f5f0e6', dark: '#171614' } as const;

export const TEXT_SCALES: readonly { value: number; label: string }[] = [
  { value: 0.9, label: 'Small' },
  { value: 1, label: 'Default' },
  { value: 1.15, label: 'Large' },
  { value: 1.3, label: 'Largest' },
];

/** A theme the page's host (the Artifact viewer) may already have set on <html>. */
const hostTheme = document.documentElement.dataset.theme;

/** Apply the theme override and text scale to the document. */
export function applyAppearance(settings: Pick<Settings, 'theme' | 'textScale'>): void {
  const root = document.documentElement;
  const chosen = settings.theme === 'system' ? hostTheme : settings.theme;
  if (chosen) root.dataset.theme = chosen;
  else delete root.dataset.theme;
  root.style.setProperty('--text-scale', String(settings.textScale));

  const dark = chosen ? chosen === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? PAPER.dark : PAPER.light);
  root.style.background = dark ? PAPER.dark : PAPER.light;
}
