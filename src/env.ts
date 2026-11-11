/**
 * True in the build published as a claude.ai Artifact preview (`vite build --mode artifact`).
 * That frame has no service worker, no camera and no plain downloads, and only passes
 * plain `#name` hashes, so a few things behave differently there.
 */
export const EMBEDDED = import.meta.env.MODE === 'artifact';

interface DownloadsCapability {
  save(request: { filename: string; data: Blob }): Promise<{ status: 'saved' | 'delivered' }>;
}

interface ArtifactHost {
  use(name: 'downloads'): Promise<DownloadsCapability | null>;
}

/** The Artifact viewer's save prompt, or null outside it. */
export async function artifactDownloads(): Promise<DownloadsCapability | null> {
  const host = (window as unknown as { claude?: ArtifactHost }).claude;
  if (!host?.use) return null;
  try {
    return await host.use('downloads');
  } catch {
    return null;
  }
}
