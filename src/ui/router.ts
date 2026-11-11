import { useEffect, useState } from 'preact/hooks';

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

/** Screens visited in this session, so Back knows whether there is anywhere to go back to. */
const visited: string[] = [location.hash];

window.addEventListener('hashchange', () => {
  const hash = location.hash;
  if (visited.length > 1 && visited[visited.length - 2] === hash) visited.pop();
  else if (visited[visited.length - 1] !== hash) visited.push(hash);
});

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function navigate(path: string, options: { replace?: boolean } = {}): void {
  const target = `#${path}`;
  if (options.replace) {
    visited[visited.length - 1] = target;
    history.replaceState(null, '', target);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    location.hash = target;
  }
}

/** Go back one screen, or to `fallback` when this screen was the first one opened. */
export function goBack(fallback: string): void {
  if (visited.length > 1) history.back();
  else navigate(fallback, { replace: true });
}
