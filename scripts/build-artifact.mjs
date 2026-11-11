// Builds the claude.ai Artifact preview of the app into dist-artifact/.
// Run with: npm run build:artifact
// The Artifact host wraps the page in its own <html>/<head>/<body>, so index.html is
// reduced to the title, the stylesheet, the mount point and the module script.
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';

const OUT = 'dist-artifact';
rmSync(OUT, { recursive: true, force: true });
execFileSync('npx', ['vite', 'build', '--mode', 'artifact', '--outDir', OUT], { stdio: 'inherit' });

const built = readFileSync(`${OUT}/index.html`, 'utf8');
const pick = (pattern, what) => {
  const match = built.match(pattern);
  if (!match) throw new Error(`build-artifact: no ${what} in the built index.html`);
  return match[0];
};
const title = pick(/<title>[^<]*<\/title>/, 'title');
const script = pick(/<script type="module"[^>]*><\/script>/, 'module script');
const stylesheet = pick(/<link rel="stylesheet"[^>]*>/, 'stylesheet');

const page = `${title}
<meta name="theme-color" content="#f5f0e6">
${stylesheet}
<style>
  /* The host already pads the page by the phone's safe areas. */
  :root { --safe-top: 0px; --safe-bottom: 0px; }
</style>
<div id="app"></div>
<noscript>Sketchbook Coach needs JavaScript to run.</noscript>
${script}
`;
writeFileSync(`${OUT}/index.html`, page);
console.log(`wrote ${OUT}/index.html`);
