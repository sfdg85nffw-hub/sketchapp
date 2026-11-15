import { useEffect, useMemo, useState } from 'preact/hooks';
import { EMBEDDED } from '../env';

export interface Route {
  /** First path segment, e.g. "entry" for #/entry/abc. */
  name: string;
  /** Remaining path segments. */
  params: string[];
  query: URLSearchParams;
}

export function parseHash(hash: string): Route {
  const [path = '', search = ''] = hash.replace(/^#\/?/, '').split('?');
  const [name = '', ...params] = path.split('/').filter(Boolean).map(decodeURIComponent);
  return { name: name || 'journal', params, query: new URLSearchParams(search) };
}

/*
 * Two modes. Normally the route lives in location.hash (#/entry/abc), so the Back
 * gesture and reloads work. In the Artifact preview only plain #name hashes pass
 * through the frame, so the route is kept in memory and in-app links are intercepted.
 */
const ROUTE_EVENT = 'app-route';
let memoryHash = '#/journal';

function currentHash(): string {
  return EMBEDDED ? memoryHash : location.hash;
}

export function currentRoute(): Route {
  return parseHash(currentHash());
}

/** Screens visited in this session, so Back knows whether there is anywhere to go back to. */
const visited: string[] = [currentHash()];

function announce(): void {
  window.dispatchEvent(new Event(ROUTE_EVENT));
}

if (EMBEDDED) {
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('a[href^="#/"]');
    if (!link || event.defaultPrevented) return;
    event.preventDefault();
    navigate(link.getAttribute('href')!.slice(1));
  });
} else {
  window.addEventListener('hashchange', () => {
    const hash = location.hash;
    if (visited.length > 1 && visited[visited.length - 2] === hash) visited.pop();
    else if (visited[visited.length - 1] !== hash) visited.push(hash);
    announce();
  });
}

export function useRoute(): Route {
  const [hash, setHash] = useState(currentHash);
  useEffect(() => {
    const onChange = () => setHash(currentHash());
    window.addEventListener(ROUTE_EVENT, onChange);
    // The hash may have changed between the first render and this listener (a link
    // tapped while the app was still starting); catch up rather than miss it.
    onChange();
    return () => window.removeEventListener(ROUTE_EVENT, onChange);
  }, []);
  return useMemo(() => parseHash(hash), [hash]);
}

export function navigate(path: string, options: { replace?: boolean } = {}): void {
  const target = `#${path}`;
  if (EMBEDDED) {
    if (options.replace) visited[visited.length - 1] = target;
    else visited.push(target);
    memoryHash = target;
    announce();
  } else if (options.replace) {
    visited[visited.length - 1] = target;
    history.replaceState(null, '', target);
    announce();
  } else {
    location.hash = target;
  }
}

/** Go back one screen, or to `fallback` when this screen was the first one opened. */
export function goBack(fallback: string): void {
  if (visited.length <= 1) {
    navigate(fallback, { replace: true });
  } else if (EMBEDDED) {
    visited.pop();
    memoryHash = visited[visited.length - 1]!;
    announce();
  } else {
    history.back();
  }
}
