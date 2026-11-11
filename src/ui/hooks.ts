import { useEffect, useRef, useState } from 'preact/hooks';
import { currentSettings, getImage, subscribe } from '../db/db';
import type { Settings } from '../lib/types';

/**
 * Run an async query against the database and re-run it whenever data changes.
 * Returns undefined until the first result arrives.
 */
export function useLive<T>(query: () => Promise<T>, deps: readonly unknown[] = []): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);
  const latest = useRef(query);
  latest.current = query;
  useEffect(() => {
    let alive = true;
    const run = () => {
      latest.current().then(
        (result) => alive && setValue(result),
        (error) => console.error(error),
      );
    };
    run();
    const unsubscribe = subscribe(run);
    return () => {
      alive = false;
      unsubscribe();
    };
  }, deps);
  return value;
}

export function useSettings(): Settings {
  const [settings, setSettings] = useState(currentSettings);
  useEffect(() => subscribe(() => setSettings(currentSettings())), []);
  return settings;
}

/** An object URL for a stored image, revoked when the component goes away. */
export function useImageUrl(id: string | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!id) {
      setUrl(undefined);
      return;
    }
    let alive = true;
    let created: string | undefined;
    void getImage(id).then((image) => {
      if (!alive || !image) return;
      created = URL.createObjectURL(new Blob([image.data], { type: image.type }));
      setUrl(created);
    });
    return () => {
      alive = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [id]);
  return url;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
