# Decisions

Judgment calls made while building this, with the reasoning. Grouped by area.

## Stack

- **Preact 11, Vite 8, TypeScript 5.9 (strict), hand-written CSS.** Preact because the whole app is 74 kB gzipped including the framework, and it loads from cache in well under a second. No UI kit, no router library (a 50-line hash router), no state library (a `useLive` hook that re-runs IndexedDB queries when data changes).
- **TypeScript is pinned to 5.9**, not the current 7.x, because `typescript-eslint` does not yet support 7.
- **`idb`** for IndexedDB and **`fflate`** for zip. Those are the only runtime dependencies besides Preact.
- **Hand-rolled service worker** (`src/sw.template.js`, filled in by a small plugin in `vite.config.ts`) instead of a PWA plugin. It precaches every built file, serves cache-first, and is 50 lines I can read. It ignores `Vary` when matching, because static hosts add `Vary` headers that otherwise make module scripts miss the cache offline.
- **Hash routing and a relative `base`**, so the same build works at `/sketchapp/` on GitHub Pages and at `/` locally, with no 404 fallback page needed.
- **Images are stored as `ArrayBuffer`s, not `Blob`s**, in IndexedDB. Slightly more code, but it avoids every historical WebKit bug with blobs in IndexedDB.
- **Playwright is pinned to an exact version** so local and CI browsers match.

## Things the brief left open

- **Pushing to `main`.** The brief asks for a push to `main`. Development happened on a feature branch first; see the final summary for what was pushed where.
- **Faber-Castell pan names are guesses.** I do not know which twelve colors are in his box, so the Palette Lab starts with twelve plausible placeholders (Yellow, Yellow Ochre, Orange, Vermilion, Carmine, Violet, Ultramarine, Light Blue, Emerald Green, Leaf Green, Burnt Sienna, Black). Each is marked "name is a guess" until he types the printed name, and "color not sampled yet" until he samples the real swatch. If his set has no ochre or sienna, he can rename, remove or add pans.
- **Value 1–10** is ten equal bands of L\*: 1 is L\* 90–100, 10 is L\* 0–10.
- **Posterization** splits L\* into equal bands and draws them evenly spaced from black to paper white (2 values: black/white; 3: black/mid/white; 5: quarters). True values by default. A "stretch to the photo's own range" option (2nd–98th percentile) is under More for dim photos.
- **Warm or cool** uses the CIELAB hue angle. Warm runs from 320° through red, orange and yellow to 125°; cool from 125° through green, blue and violet to 320°. "Neutral" is the explicit band: chroma under 7, or within 8° of either boundary (yellow-green and violet-magenta genuinely sit on the fence).
- **Color names** are a hand-picked list of 43, each with a hue family. Names in the red, green, brown and orange families trigger the "in your confusable zone" note when colorblind mode is on.
- **White-paper calibration** is a per-channel gain in linear RGB that maps the tapped paper to reference white. It corrects color cast and exposure together, so calibrated paper reads as value 1. It is stored per journal entry, and per session in the See tab. A tap too dark to be paper is refused.
- **Sampling** averages a square patch about 2.4% of the long edge across, in linear light.
- **Closest paint or mix** compares against each labeled paint, and each pair from the three-paint palette, at three dilutions, using a rough wash model (Beer–Lambert thinning over paper, geometric-mean mixing). It is a starting suggestion, and the UI says so.
- **Confusable pairs** compare paints after Machado simulation with the lightness difference halved, because in watercolor value depends mostly on how much water is in the brush. A pair is flagged when the simulated difference is ≤ 10 (CIEDE2000) and listed separately as "close for anyone" when the unsimulated difference is under 20.
- **CVD simulation** uses the Machado, Oliveira & Fernandes (2009) severity-1.0 matrices for protanopia and deuteranopia, applied in linear RGB.
- **"Red-green colorblind mode" (on by default)** controls two things: the confusable-zone note in the color identifier and the confusable-pairs section in the Palette Lab. The interface itself is colorblind-safe whether the switch is on or off.
- **Scheduler.** SM-2 reduced to three answers. Harder: back tomorrow, ease −0.2, difficulty down. Right: 2 days, then 5, then interval × ease; every third consecutive "right" raises difficulty. Easier: ease +0.15, interval × ease × 1.3 (at least 3 days), difficulty up now. Ease is kept between 1.3 and 3.0; intervals are capped at 60 days because a physical skill left for two months has gone stale.
- **Today's practice** scores each drill by how due it is × how weak the area is by his own recent ratings × 1.5 if it is a chosen focus, with a small per-day shuffle so the list is stable within a day and varies across days. It then picks greedily: at most three drills, at most 20 minutes, never two on one weakness.
- **Reflection prompts** are chosen by: what he said he was working on (highest), then need from recent self-ratings, then how long since that weakness was last asked. Prompts that make no sense for the subject are left out (no foliage question for a gesture page). Four prompts when four are relevant.
- **Nineteen drills, not seventeen.** The seventeen in the brief left "background over-detailed" with only the notan drill and "no emotional intent" with none, so I added *Three distances, three volumes* and *One word, three thumbnails*. Watercolor-handling drills that do not map to one of the ten weaknesses (graded wash, wet-in-wet, value strip) are grouped as "Watercolor handling".
- **A drill photo becomes a journal entry** (subject Study, Watercolor or Gesture, linked to the drill), so drill results appear in the timeline and can use the value tools. The drill history links back to it.
- **The gesture timer logs against the gesture drill** when he rates the session, so it takes part in the schedule.
- **Monthly review** appears from the 1st until it is done or skipped, for the previous month, only if that month has sketches. Choosing a focus there replaces the focus areas in Settings with that single weakness, as the brief asks for a single focus.
- **Backup reminder** appears on the Journal when the last backup (or first use, if there has never been one) is 14 or more days old and there is at least one real sketch. It can be postponed a week.
- **Import merges** rather than replaces: safer on a phone, and enough for restore after eviction.
- **Then/Now** uses the earliest flagged baseline of a subject as "then" (or the earliest sketch if none is flagged) and the latest sketch as "now". Either can be changed by tapping.
- **Swatch chart template** is a PNG at US Letter, 200 dpi, shared through the share sheet. PNG rather than PDF: it prints from Photos, and needs no PDF library. Boxes are marked "1st" and "2nd" so alternate squares are painted in separate passes.
- **Export for critique** is a JPEG 1200 px wide: the photo, then date, subject, medium, feeling word, and each reflection answer with its shape mark.
- **Plan a sketch** saves a pending plan that is attached to the next capture and then cleared. The watercolor checklist is a reminder list, not four more things to tick.
- **Light direction** is one of eight directions on the dial; finer than that is false precision for a 30-second plan.

## Live camera

- The live view is a **WebGL fragment shader** that does the same maths as the photo path (sRGB → linear → luminance → L\* → equal bands), so it runs at the display's frame rate. A Canvas-2D path at 480 px is the fallback when WebGL is missing. In the e2e suite the Chromium run feeds a fake camera and asserts at least 24 frames per second and at most N grey levels. I could not measure on a physical iPhone 14 from this environment; the shader is a single texture lookup and a few `pow` calls per pixel, far inside that phone's budget.
- **Squint is a CSS blur** on the canvas (Safari has no `CanvasRenderingContext2D.filter`). **Mirror flip is a CSS transform.** Both therefore cost nothing per frame.
- **Compare is photo-only.** Comparing needs two still images; the live view offers value map, grayscale, squint, passerby, flip, and "freeze and identify".
- The camera starts from a button, not on opening the tab, so iOS's permission prompt is never a surprise. If access is denied or the camera is unavailable, the same tools are offered on a photo.

## Interface

- **Focused flows hide the tab bar.** Capture, reflection, plan, a drill, the gesture timer, the monthly review and swatch sampling show only their own bottom action bar with a Back button in it. Two stacked bars would eat a fifth of the screen and offer five ways out of a task.
- **Spelling follows the brief.** "Color", "watercolor" and "Grayscale" (the tool) are American, because he lives in New York; "grey" as a color word is kept as the brief writes it ("muted blue-grey", "blue + brown = grey"). Code comments use British spelling in places; nothing user-facing does.
- **No emoji, no exclamation marks** in copy. Text marks used as shapes (● ○) appear only next to words.
- **Demo sketches are drawn by code** (`src/db/demo.ts`): hatched boxes, cups, a bench, stick gestures. Later ones gain cast shadows and real darks so Then/Now and the trend charts have something to show. Clearing demo data removes only items flagged as demo, including demo drill history.
- **Text scale** is a multiplier on top of Dynamic Type rather than a replacement for it.

## Tests

- **WebKit could not be run in the build environment** (only Chromium was installed, and installing browsers was not permitted there). The e2e suite is configured for both; CI installs and runs WebKit at 390 × 844. Locally the whole suite passed in Chromium at the same viewport.
- **The share sheet is stubbed out in e2e** so exports take the download path; no test browser has a share sheet to drive.
- **Lighthouse.** Lighthouse removed its PWA category in version 12, so there is no "PWA audit" to pass any more. The installability criteria it used to check (manifest with name, icons at 192 and 512, standalone display, a service worker that serves the start URL offline, viewport and apple-touch-icon) are asserted directly in `e2e/offline.spec.ts`.

## Cut or reduced

- **PDF output for the swatch chart**: PNG only (see above).
- **Crop is rectangular with corner handles only**: no free rotation or perspective correction. Ninety-degree rotation covers the "photo is sideways" case.
- **No per-drill custom timers beyond the built-in countdown**, and no editing of drill text in the app. Drills live in `src/data/drills.ts`.
- **Project templates are editable for title, feeling and brief**; targets and stage names are fixed.
