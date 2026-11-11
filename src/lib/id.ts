/** Sortable-enough unique id: time prefix plus random suffix. */
export function newId(prefix: string): string {
  const random = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(36).padStart(2, '0')).join('');
  return `${prefix}_${Date.now().toString(36)}${random}`;
}

/** Small deterministic string hash (FNV-1a), 0 to 1. */
export function hashUnit(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 100_000) / 100_000;
}
