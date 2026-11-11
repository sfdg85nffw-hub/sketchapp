import { render } from 'preact';
import { App } from './App';
import { loadSettings, subscribe, currentSettings } from './db/db';
import { applyAppearance } from './ui/appearance';
import './styles/tokens.css';
import './styles/app.css';

async function start(): Promise<void> {
  applyAppearance(await loadSettings());
  subscribe(() => applyAppearance(currentSettings()));
  render(<App />, document.getElementById('app')!);

  // Ask the browser not to evict our data under storage pressure. Safari grants this to installed apps.
  void navigator.storage?.persist?.();

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    const hadController = Boolean(navigator.serviceWorker.controller);
    void navigator.serviceWorker.register('./sw.js');
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // A newer version took over while the app was open: let the shell offer a reload.
      if (hadController) window.dispatchEvent(new Event('app-updated'));
    });
  }
}

void start();
