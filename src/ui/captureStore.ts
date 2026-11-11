/**
 * The photo handed from a file input to the Capture screen, plus what it is for.
 * Kept in memory only: a File cannot go through the URL.
 */
export interface CaptureIntent {
  projectId?: string;
  subject?: string;
}

let pendingFile: File | null = null;
let pendingIntent: CaptureIntent = {};

export function setPendingCapture(file: File, intent: CaptureIntent = {}): void {
  pendingFile = file;
  pendingIntent = intent;
}

export function takePendingCapture(): { file: File | null; intent: CaptureIntent } {
  const taken = { file: pendingFile, intent: pendingIntent };
  pendingFile = null;
  pendingIntent = {};
  return taken;
}
