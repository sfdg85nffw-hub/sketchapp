import { EMBEDDED } from "../env";

/*
 * The claude.ai preview can only serve standard web file types, so its build bundles
 * the 3D models and motion data into their own lazily loaded script chunks. Everywhere
 * else they are plain files next to the app, fetched (and cached offline) as usual.
 */
// Tested on import.meta.env directly so the bundler drops this from every other build.
const bundled: Record<string, () => Promise<unknown>> =
  import.meta.env.MODE === 'artifact'
    ? import.meta.glob(
      ["../../public/models/**/*.glb", "../../public/mocap/*.bin"],
      { query: "?inline", import: "default" },
    )
  : {};

function decodeDataUrl(url: string): ArrayBuffer {
  const binary = atob(url.slice(url.indexOf(",") + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/** The bytes of a bundled binary asset, by its path under public/ (e.g. "models/skull.glb"). */
export async function loadBinary(
  path: string,
  missing: string,
): Promise<ArrayBuffer> {
  if (EMBEDDED) {
    const load = bundled[`../../public/${path}`];
    if (!load) throw new Error(missing);
    return decodeDataUrl((await load()) as string);
  }
  const response = await fetch(`./${path}`);
  if (!response.ok) throw new Error(missing);
  return response.arrayBuffer();
}
