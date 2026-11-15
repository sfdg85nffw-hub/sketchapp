import { useEffect } from 'preact/hooks';

/*
 * Sound and screen-awake helpers for timed sessions. iOS only lets a page make
 * sound after a tap, so the audio context is created in the Start button's handler.
 * There is no vibration on iOS: the visual flash carries the cue as well.
 */

let audio: AudioContext | null = null;

export function unlockAudio(): void {
  try {
    audio ??= new AudioContext();
    void audio.resume();
  } catch {
    audio = null;
  }
}

/** A soft two-note chime. Quiet on purpose: this gets used on the subway. */
export function chime(): void {
  navigator.vibrate?.(120);
  if (!audio) return;
  const now = audio.currentTime;
  for (const [i, frequency] of [660, 880].entries()) {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    const start = now + i * 0.16;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.5);
  }
}

/** Keep the screen on while `active`. Re-acquired when the page comes back; silent where unsupported. */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let alive = true;
    const acquire = () => {
      if (document.visibilityState !== 'visible') return;
      navigator.wakeLock
        .request('screen')
        .then((l) => {
          if (alive) lock = l;
          else void l.release().catch(() => undefined);
        })
        .catch(() => undefined);
    };
    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', acquire);
      void lock?.release().catch(() => undefined);
    };
  }, [active]);
}
