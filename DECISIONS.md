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

- The live view is a **WebGL fragment shader** that does the same maths as the photo path (sRGB → linear → luminance → L\* → equal bands), and it processes each camera frame once, when it arrives (`requestVideoFrameCallback`, with `requestAnimationFrame` where that is missing), rather than on every display refresh; the camera is asked for 30 fps. A Canvas-2D path at 480 px is the fallback when WebGL is missing. In the e2e suite the Chromium run feeds a 30 fps fake camera and asserts at least 24 processed frames per second and at most N grey levels. The CI runners have no GPU, so that check runs on its own after the other tests; at full display rate it had been redrawing each camera frame three times and fell to 14 fps on a slow runner. I could not measure on a physical iPhone 14 from this environment; the shader is a single texture lookup and a few `pow` calls per pixel, far inside that phone's budget.
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

- **WebKit runs in CI, not locally.** The build environment only had Chromium, so the suite was developed against Chromium at 390 × 844 and then run in WebKit by the GitHub Actions workflow, which installs both engines.
- **The offline test shuts its own server down** instead of using the browser's offline emulation. Playwright's WebKit refuses every navigation while emulating offline, service worker or not; a server that has really gone away is also the more honest test. It runs in both engines.
- **The share sheet is stubbed out in e2e** so exports take the download path; no test browser has a share sheet to drive.
- **Lighthouse.** Lighthouse removed its PWA category in version 12, so there is no "PWA audit" to pass any more. The installability criteria it used to check (manifest with name, icons at 192 and 512, standalone display, a service worker that serves the start URL offline, viewport and apple-touch-icon) are asserted directly in `e2e/offline.spec.ts`.

## The claude.ai preview

- `npm run build:artifact` builds the same app into `dist-artifact/` for a claude.ai Artifact preview (`--mode artifact`, see `src/env.ts`). That frame refuses service workers, the camera and plain downloads, and only passes `#name` hashes, so in that build: no service worker, the route is kept in memory and in-app links are intercepted, the live camera shows the photo tools instead, and exports go through the viewer's own save prompt. Everything else is the same code.

## Cut or reduced

- **PDF output for the swatch chart**: PNG only (see above).
- **Crop is rectangular with corner handles only**: no free rotation or perspective correction. Ninety-degree rotation covers the "photo is sideways" case.
- **No per-drill custom timers beyond the built-in countdown**, and no editing of drill text in the app. Drills live in `src/data/drills.ts`.
- **Project templates are editable for title, feeling and brief**; targets and stage names are fixed.

## Timed Reference (added later)

### Where the references come from

- **The build sandbox could not reach most image hosts.** Wikimedia, the Met's image server, the Library of Congress, the National Gallery and the Smithsonian were all blocked from the development environment; GitHub was not. So every download happens either through git from GitHub, or in a `workflow_dispatch` GitHub Actions workflow (`.github/workflows/reference-assets.yml`). Nothing is downloaded at run time.
- **Photo packs were curated by eye.** `scripts/harvest-reference-candidates.mjs` (run in Actions) turned a shortlist into numbered contact sheets, with file URL, author and licence for each image. Met candidates came from the Met's own Open Access CSV (its "Is Public Domain" flag); Wikimedia Commons candidates came from search phrases, keeping only files whose licence metadata is public domain, CC0 or plain CC BY (no ShareAlike, NonCommercial or NoDerivs). I looked at every sheet and kept 444 images, recorded with tags in `reference-packs/curation/*.txt`; `scripts/make-reference-manifest.mjs` turns those into `reference-packs/manifest.json`.
- **Counts:** faces 162, poses 141, hands and feet 75, urban 66. Faces and poses mix photographs with portrait paintings and classical sculpture, which the brief invited and which give strong, simple light. Hands and feet lean on casts, sculpture and old master drawings, because public-domain close-up photographs of hands are scarce.
- **SFW.** Anything tagged or titled as a nude was filtered out before review, and anything that slipped through was left out by eye. The Met's 1890s Bertillon identification portraits are included, cropped to the face: they are the best-lit straight front and profile faces in the public domain.
- **The pack build** (`scripts/build-reference-packs.mjs`) downloads each file, checks it is an image, applies any crop from the curation notes, resizes to a 1400 px long edge, strips metadata, and writes WebP (quality 62) plus a 480 px JPEG thumbnail that doubles as the fallback. It also writes the pack index and the photo section of CREDITS.md, and reports any file that failed. Files that fail are simply absent from the pack. It runs as a GitHub Actions workflow (this sandbox cannot reach the image hosts), one category at a time with a commit after each. Wikimedia rate limits bursts with HTTP 429, so its files are fetched one at a time four seconds apart, a 429 pauses every worker, and rate-limited files are retried after a cool-down; already-built files are kept, so a second run only fetches what is missing. The first run lost 119 files to rate limiting; the second recovered all of them, so all 444 manifest entries are in the packs (47 MB).
- **Packs are opt-in offline.** The service worker precaches the app shell, the 3D models, the motion data and the pack index, but not the pack images. "Make available offline" copies one pack into a separate cache (`sbc-packs-v1`), which the service worker searches and which survives app updates. Online and not saved, a pack streams from the app's own origin, which is the same site, not a third party. Offline and not saved, the player says so in words.
- **3D heads without Blender.** Blender could not be downloaded here, so `scripts/build-heads.mjs` applies MakeHuman's CC0 targets directly: the same macro weighting MakeHuman uses for sex, age, muscle, weight and ancestry, plus seeded face-shape targets at half strength (above that they turn into caricatures). Twelve heads, cut to busts, about 36 KB each with meshopt compression. Meshopt rather than Draco because three.js ships the meshopt decoder as one small module and Draco needs extra decoder files to host. The Lee Perry-Smith fallback was not needed.
- **The planes overlay** is the same head simplified to about 400 flat facets and drawn flat-shaded. It is a generated cousin of an Asaro head, not a hand-modelled one. Landmark labels are points found on each mesh (front-most or outer-most vertex near a target) and are placed on whichever side faces the camera.
- **Skull.** The Smithsonian's 3D collection was unreachable, so the skull is the Khronos glTF sample "Skull" by Vladimir Petkovic, CC0, fetched from GitHub. Materials and textures are dropped and the mesh simplified to 113,000 triangles: 370 KB.
- **Motion capture.** 82 CMU clips from the Bruce Hahne BVH conversion, chosen across walking, running, jumping, dance, sport, martial arts, everyday tasks, sitting, getting up and stretching. `scripts/build-mocap.mjs` parses them with three.js's `BVHLoader`, drops the calibration T-pose at the start, resamples to 10 frames a second, keeps 25 joints, and stores 16-bit quaternions: 1.9 MB for 9,166 poses. At run time the mannequin is posed by forward kinematics (a tested pure function), not a skinned mesh, because it is rigid parts.
- **Skipped: a realistic body skin.** A CC0 MakeHuman body could be made the same way as the heads, but skinning and retargeting it to the CMU skeleton without Blender is a project of its own. The mannequin reads gesture more clearly anyway.
- **Skipped: mannequin hands and feet in close-up.** The mitten hands are too crude to draw hands from; Hands & Feet uses the photo pack only.

### How the sessions behave

- **One player for everything.** The old gesture timer is now the "From life" mode of the same player: no picture, just the large countdown, the chime and the gesture reminders. The drill that used to open it still does.
- **3D references are rendered as stills.** Each image is rendered once when it comes up (about a frame on an iPhone 14) and then shown like a photo, so nothing animates while he draws and the battery is spared. There is no interactive orbit, so the 30 fps target applies to nothing that runs continuously. "Same scene, new light" re-renders the arrangement.
- **Named lighting** is placed relative to the face for heads and the skull (Rembrandt means Rembrandt whichever way the head turns) and relative to the viewer for shapes and the mannequin (split light comes from the side of the picture).
- **The value toggle** cycles off, 2, 3, 5 values using the See tab's posterize code on the rendered or loaded image. Grayscale, flip and squint are separate toggles.
- **The terminator overlay** is a shader that draws where the surface normal turns away from the key light, as a light line in a dark casing so it reads on any value, with a depth pass first so hidden edges stay hidden.
- **Guess the light** is asked when an image's time is up, not before: he draws first, then taps the dial. The lighting name is hidden until then. The error is measured against the true angle in the picture, so even the best of the dial's eight positions can be up to 22.5° off; within 22.5° counts as right, within 67.5° as close. Guesses are kept and summarised on the Timed Reference screen. While it is on, overcast light is left out of the draw, because it has no one direction to point at and would only waste an image.
- **The value map in the player splits each reference's own range** (the See tab's "Stretch to the photo's own range"), not the absolute L\* scale. A photograph's exposure and a render's lighting are arbitrary, and a notan or value plan is relative to the picture: an evenly lit plaster still life or a bright street scene would otherwise come out entirely white in two values. Grayscale stays true. In See, where he judges his own sketch, true values stay the default.
- **A pool smaller than the session** (two of your own photos, or a 50-image session from a 66-photo pack after a week of use) shortens the session rather than repeating a picture: the count reads "1 of 2" from the start and the last picture keeps its full time.
- **Line of action** runs from the crown through the neck, mid-spine and hips to the knee and foot of the supporting leg: the foot on the ground, or, with both down, the one nearer the centre of mass. It shows for six seconds after each pose when turned on.
- **Dynamic poses** are preferred by scoring each frame: mean limb angular speed (saturating) for 50%, how far the centre of mass sits from the middle of the supporting feet for 40%, and a floor of 10%. Frames are picked with probability proportional to the score cubed.
- **Draw from memory** shows the reference for the chosen look time, hides it for the block's drawing time, then shows it for ten seconds to compare.
- **No repeats** within a session; across sessions, images shown in the last seven days are avoided while the pool has fresher ones. Generated images are unique by construction (a repeated key is re-rolled).
- **The end-of-session rating** feeds a drill's schedule: two new drills, "Timed faces under named light" and "Lit shapes, cast shadow first", cover faces, skull and shapes; poses, hands, mirror and My References feed the gesture drill; urban feeds the notan drill.
- **"Photograph your page"** opens the normal capture flow with the subject, minutes, drill and a "Faces · 10 × 1m" tag filled in.
- **Mirror mode** shows a pose prompt over the live front camera, counts five seconds and freezes a frame (mirrored, as a mirror shows it) to draw from. Frames are kept only if he taps Save to My References on the contact sheet. The Artifact preview cannot use the camera.
- **A session is not resumed** after the app is closed. It is short, and resuming a half-finished timer is more confusing than starting again.
- **Sound:** the chime uses Web Audio, unlocked by the Start tap. It can be muted in the player or the setup. The screen flashes at the same moment, since iOS has no vibration API for web apps.
- **Backups** now carry My References, saved sequences, light guesses and the seven-day history.
