/** A small seeded random number generator (mulberry32). Same seed, same sequence. */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Random = () => number;

export function between(random: Random, low: number, high: number): number {
  return low + (high - low) * random();
}

export function pickOne<T>(random: Random, items: readonly T[]): T {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))]!;
}

/** Pick an index with probability proportional to its weight. Returns -1 when every weight is zero. */
export function pickWeighted(random: Random, weights: readonly number[]): number {
  const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0);
  if (total <= 0) return -1;
  let at = random() * total;
  for (let i = 0; i < weights.length; i++) {
    at -= Math.max(0, weights[i]!);
    if (at < 0) return i;
  }
  return weights.length - 1;
}

/** A fresh seed for "give me something new", small enough to read aloud. */
export function newSeed(random: Random = Math.random): number {
  return 1 + Math.floor(random() * 999_999);
}
