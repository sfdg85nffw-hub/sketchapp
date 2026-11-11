import { backupFileName, packBackup, unpackBackup } from '../lib/backup';
import { exportEverything, importEverything, saveSettings } from './db';
import { shareOrDownload } from './share';

/** Build the backup zip and hand it to the share sheet (or download it). */
export async function exportBackup(): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const now = new Date();
  const { records, images } = await exportEverything();
  const zip = packBackup(records, images, now.toISOString());
  const file = new File([zip as BlobPart], backupFileName(now), { type: 'application/zip' });
  const outcome = await shareOrDownload(file, 'Sketchbook Coach backup');
  if (outcome !== 'cancelled') await saveSettings({ lastBackupAt: now.toISOString(), backupSnoozedUntil: undefined });
  return outcome;
}

/** Read a backup zip and merge it in. Returns how many sketches it held. */
export async function importBackup(file: Blob): Promise<number> {
  const { records, images } = unpackBackup(new Uint8Array(await file.arrayBuffer()));
  await importEverything(records, images);
  return records.entries.length;
}
