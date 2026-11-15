# Sketchbook Coach

A personal drawing-practice notebook for one pen-and-ink sketcher. It runs on an iPhone as an installed web app, fully offline, with no account and no server.

It does four jobs:

1. **Journal.** Photograph each sketchbook page. It is dated, tagged in a few taps, and filed by month.
2. **See.** Value tools built for a red-green colorblind artist: true grayscale, 2/3/5-value maps, squint, a passerby view, mirror flip, sketch-versus-scene comparison, and a color identifier that answers "warm or cool? light or dark?" instead of naming a hue and leaving it there. They work on a saved photo and on the live camera.
3. **Reflect.** After each sketch, three or four questions drawn from ten recurring weaknesses, answered "not yet / partly / yes". The answers become honest trend charts.
4. **Practice.** A drill library on a spaced, interleaved schedule, a gesture timer, a 30-second pre-drawing plan, and multi-page projects built around a feeling word.

| Journal | Value map | Color identifier | Reflection |
| --- | --- | --- | --- |
| ![Journal timeline](docs/screenshots/journal-light.jpg) | ![Three-value map of a sketch](docs/screenshots/value-map-light.jpg) | ![Color identifier reading](docs/screenshots/identify-color-light.jpg) | ![Reflection prompts](docs/screenshots/reflection-light.jpg) |

| Practice | Drill | Plan a sketch | Palette Lab |
| --- | --- | --- | --- |
| ![Today's practice](docs/screenshots/practice-light.jpg) | ![A drill with steps and a success criterion](docs/screenshots/drill-light.jpg) | ![Pre-drawing plan](docs/screenshots/plan-light.jpg) | ![Palette Lab](docs/screenshots/palette-lab-light.jpg) |

| Progress | Then / Now | Journal (dark) | Value map (dark) |
| --- | --- | --- | --- |
| ![Skill trends](docs/screenshots/progress-light.jpg) | ![Baseline against latest](docs/screenshots/then-now-light.jpg) | ![Journal, dark theme](docs/screenshots/journal-dark.jpg) | ![Value map, dark theme](docs/screenshots/value-map-dark.jpg) |

| Progress (dark) | Palette Lab (dark) | Practice (dark) | Reflection (dark) |
| --- | --- | --- | --- |
| ![Skill trends, dark](docs/screenshots/progress-dark.jpg) | ![Palette Lab, dark](docs/screenshots/palette-lab-dark.jpg) | ![Practice, dark](docs/screenshots/practice-dark.jpg) | ![Reflection, dark](docs/screenshots/reflection-dark.jpg) |

### Timed reference

Under **Practice › Timed reference**: something to draw on a timer, all of it offline. Real photographs, paintings and sculpture (public domain, CC0 or CC BY, bundled), 3D heads under named lighting, a wooden mannequin moved by real motion capture, lit geometric still lifes from a seed, a human skull, your own photos, the front camera for self-portraits, and a bare timer for drawing from life. Class-mode sequences, draw from memory, guess the light, the line of action, and the See tab's value map on every image.

| Modes | Setup | Faces, photos | Faces, 3D |
| --- | --- | --- | --- |
| ![Mode picker](docs/screenshots/ref-home-light.jpg) | ![Timer and count](docs/screenshots/ref-setup-light.jpg) | ![A photographed face](docs/screenshots/ref-faces-photos-light.jpg) | ![A 3D head under Rembrandt light](docs/screenshots/ref-faces-3d-light.jpg) |

| Poses, photos | Mannequin | Shapes | Skull |
| --- | --- | --- | --- |
| ![A photographed pose](docs/screenshots/ref-poses-photos-light.jpg) | ![The mocap mannequin](docs/screenshots/ref-poses-mannequin-light.jpg) | ![Lit shapes](docs/screenshots/ref-shapes-light.jpg) | ![The skull](docs/screenshots/ref-skull-light.jpg) |

| Hands & Feet | Urban, notan | My References | From life |
| --- | --- | --- | --- |
| ![Hands](docs/screenshots/ref-hands-light.jpg) | ![Urban scene in two values](docs/screenshots/ref-urban-light.jpg) | ![Your own photo](docs/screenshots/ref-mine-light.jpg) | ![The bare timer](docs/screenshots/ref-life-light.jpg) |

| Contact sheet | Shapes (dark) | Mannequin (dark) | Mode picker (dark) |
| --- | --- | --- | --- |
| ![End of session](docs/screenshots/ref-contact-sheet-light.jpg) | ![Shapes, dark](docs/screenshots/ref-shapes-dark.jpg) | ![Mannequin, dark](docs/screenshots/ref-poses-mannequin-dark.jpg) | ![Mode picker, dark](docs/screenshots/ref-home-dark.jpg) |

Photo packs are not downloaded with the app shell: open **Timed reference** with a connection and tap **Make available offline** on each pack you want on the train. Every source is listed in [CREDITS.md](CREDITS.md).

#### Rebuilding the reference assets (dev time only)

The app never fetches anything from a third party. The assets are prepared once and committed:

| Asset | Command | Source |
| --- | --- | --- |
| Photo packs | **Actions › Reference assets › Run workflow**, task `build-packs` (or locally: `npm install && node scripts/build-reference-packs.mjs`) | `reference-packs/manifest.json` |
| New photo candidates | the same workflow, task `harvest-candidates`, then review the sheets on the `reference-candidates` branch and record picks in `reference-packs/curation/*.txt`, then `node scripts/make-reference-manifest.mjs` | Met Open Access, Wikimedia Commons |
| 3D heads | `MAKEHUMAN_DATA=…/mpfb2/src/mpfb/data node scripts/build-heads.mjs` | MakeHuman (CC0) |
| Skull | `node scripts/build-skull.mjs …/ScatteringSkull.glb` | Khronos glTF Sample Assets (CC0) |
| Motion capture | `CMU_MOCAP=…/cmu-mocap node scripts/build-mocap.mjs` | CMU mocap, BVH by Bruce Hahne |

Each script's header says exactly what to download.

Every screenshot is generated by `npm run screenshots` at iPhone 14 size (390 × 844 pt) from the built app with demo data loaded. The sketches in them are drawn by code, not by a person.

## The live app

Once GitHub Pages is switched on (next section), every push to `main` deploys to:

```
https://<github-user>.github.io/<repository>/
```

For this repository that is **https://sfdg85nffw-hub.github.io/sketchapp/**

## Turn on GitHub Pages (once)

1. On GitHub, open the repository, then **Settings › Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` (or open **Actions › CI and deploy › Run workflow**).
4. The workflow typechecks, lints, runs the unit tests, runs the end-to-end tests in WebKit and Chromium, builds, and deploys. The URL appears on the workflow run and under **Settings › Pages**.

Pages on a private repository needs a paid GitHub plan. On a free plan, make the repository public.

## Install it on the iPhone

1. On the iPhone, open the live URL in **Safari**. Safari is the dependable route for installing a web app on iOS.
2. Tap the **Share** button (the square with an arrow), scroll down, and tap **Add to Home Screen**.
3. Tap **Add**. An ink-nib icon called "Sketchbook" appears on the home screen.
4. Open it from the home screen. It runs full-screen. After this first launch it works with no signal, including underground.
5. The first time you open **See** and start the live view, iOS asks for camera access. Allow it.

Updates arrive on their own: when a new version has been deployed, the app picks it up the next time it is opened with a connection.

## Back up every two weeks

All data lives in Safari's storage on the phone. Nothing is uploaded anywhere. iOS can clear a web app's storage when space is short or the app has not been opened for a while, so a backup is the only safety net.

- **Progress › Settings and backup › Export everything (.zip)** opens the share sheet with one file: `data.json` plus every photo. Save it to Files or iCloud Drive.
- **Import from a backup file** on the same screen restores it. Importing merges: items in the file replace matching ones, and nothing else is removed.
- The Journal shows a quiet reminder once the last backup is two weeks old. "Remind me next week" postpones it.

## Develop

Requires Node 22.

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck
npm run lint
npm test             # unit tests (Vitest)
npm run build        # production build into dist/, including the service worker
npm run build:artifact  # the claude.ai Artifact preview build, into dist-artifact/
npm run e2e          # Playwright, WebKit and Chromium at 390x844; needs: npx playwright install webkit chromium
npm run screenshots  # regenerate docs/screenshots (run npm run build first)
npm run simulate     # regenerate docs/palette-simulation-*.png and check contrast
npm run icons        # regenerate app icons and paper textures
```

The service worker is only registered in production builds, so `npm run dev` never serves stale files.

### Layout of the code

| Path | What is there |
| --- | --- |
| `src/lib/color/` | Pure colour maths: sRGB ↔ linear ↔ XYZ ↔ Lab, CIEDE2000, colour names, warm/cool, value 1–10, posterization, white balance, Machado CVD simulation, confusable pairs, paint matching |
| `src/lib/image/` | Pixel filters over plain arrays |
| `src/lib/` | Drill scheduler, practice proposal, reflection prompt choice, stats, backup zip, dates |
| `src/data/` | The ten weaknesses, drills, project templates, paints and recipes, materials notes |
| `src/db/` | IndexedDB stores, image storage, backup, demo data |
| `src/ui/` | Shared components: value tools, live camera, crop editor, kit |
| `src/screens/` | One file per screen |
| `src/workers/` | Web Worker for pixel work on photos |
| `tests/unit/` | Vitest |
| `e2e/` | Playwright |
| `scripts/` | Icon, fixture, screenshot and palette-simulation generators |

## Colorblind-safe by construction

The interface is ink on paper with one blue accent, and no state is ever carried by color alone. `npm run simulate` renders the palette through simulated deuteranopia and protanopia and fails if any text or control pair drops below its WCAG contrast ratio.

![Light palette under typical vision, deuteranopia and protanopia](docs/palette-simulation-light.png)

![Dark palette under typical vision, deuteranopia and protanopia](docs/palette-simulation-dark.png)

The same simulation applied to real screens:

| Reflection, deuteranopia | Reflection, protanopia | Progress, deuteranopia | Progress, protanopia |
| --- | --- | --- | --- |
| ![](docs/screenshots/reflection-deuteranopia.jpg) | ![](docs/screenshots/reflection-protanopia.jpg) | ![](docs/screenshots/progress-deuteranopia.jpg) | ![](docs/screenshots/progress-protanopia.jpg) |

More in [DESIGN.md](DESIGN.md) (why the interface is the way it is) and [DECISIONS.md](DECISIONS.md) (every judgment call).
