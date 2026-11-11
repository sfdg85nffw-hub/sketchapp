import { artifactDownloads, EMBEDDED } from '../env';

/** In the Artifact preview, files go through the viewer's own save prompt. */
async function saveThroughViewer(file: File): Promise<'downloaded' | 'cancelled'> {
  const downloads = await artifactDownloads();
  if (!downloads) throw new Error('Saving files is not available in this preview. The installed app can export.');
  try {
    await downloads.save({ filename: file.name, data: file });
    return 'downloaded';
  } catch (error) {
    const code = (error as { code?: string } | null)?.code;
    if (code === 'declined') return 'cancelled';
    if (code === 'rate_limited') throw new Error('A save is already waiting for an answer. Try again in a moment.', { cause: error });
    throw new Error('Saving files is not available in this preview. The installed app can export.', { cause: error });
  }
}

/**
 * Hand a file to the iOS share sheet when it can take files; otherwise download it.
 * Returns how it went so the caller can word its confirmation honestly.
 */
export async function shareOrDownload(file: File, title: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  if (EMBEDDED) return saveThroughViewer(file);
  const data: ShareData = { files: [file], title };
  if (typeof navigator.share === 'function' && navigator.canShare?.(data)) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      // Fall through to a plain download when sharing fails for another reason.
    }
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return 'downloaded';
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}
