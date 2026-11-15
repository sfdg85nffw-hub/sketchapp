import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import preact from '@preact/preset-vite';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/**
 * Emits dist/sw.js with a precache list of every built file, so the whole app
 * works offline after the first load. Hand-rolled to keep the dependency list
 * short and the caching behaviour easy to read.
 */
function offlineServiceWorker(): Plugin {
  let outDir = 'dist';
  let enabled = true;
  return {
    name: 'sketchbook-offline-sw',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
      // The Artifact preview frame does not allow service workers.
      enabled = config.mode !== 'artifact';
    },
    closeBundle() {
      if (!enabled) return;
      const files = walk(outDir)
        .map((f) => relative(outDir, f).split(sep).join('/'))
        .filter((f) => f !== 'sw.js')
        // Photo packs are saved offline only when he asks for them; their index ships with the shell.
        .filter((f) => !f.startsWith('packs/') || f === 'packs/index.json')
        .sort();
      const hash = createHash('sha256');
      for (const f of files) {
        hash.update(f);
        hash.update(readFileSync(join(outDir, f)));
      }
      const version = hash.digest('hex').slice(0, 12);
      const template = readFileSync('src/sw.template.js', 'utf8');
      const sw = template
        .replace("'__VERSION__'", JSON.stringify(version))
        .replace("'__PRECACHE__'", JSON.stringify(['./', ...files.map((f) => `./${f}`)]));
      writeFileSync(join(outDir, 'sw.js'), sw);
    },
  };
}

export default defineConfig({
  // Relative base so the same build works at /<repo>/ on GitHub Pages and at / locally.
  base: './',
  plugins: [preact(), offlineServiceWorker()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  worker: { format: 'es' },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
