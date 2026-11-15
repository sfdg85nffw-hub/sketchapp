# Credits

Everything the app shows is generated on the phone or bundled with the app. Nothing is fetched from anyone else at run time. Every bundled asset below is public domain, CC0 or CC BY.

## 3D heads

`public/models/heads/*.glb`, built by `scripts/build-heads.mjs`.

Generated from the **MakeHuman** base mesh and morph targets (`3dobjs/base.obj` and `targets/**` in [makehumancommunity/mpfb2](https://github.com/makehumancommunity/mpfb2)), which the MakeHuman project releases under **CC0 1.0** (see that repository's `LICENSE.ASSETS.md`). The script mixes MakeHuman's own age, sex, build and ancestry targets, plus seeded face-shape detail, and cuts each figure to a bust. The planes mesh in each file is the same surface simplified.

- head-01: Woman, mid twenties
- head-02: Man, about thirty
- head-03: Man, about fifty
- head-04: Woman, about eighty
- head-05: Man, about seventy-five
- head-06: Woman, about thirty
- head-07: Man, mid thirties, slight smile
- head-08: Woman, mid forties, brows raised
- head-09: Boy, about ten
- head-10: Young woman, late teens
- head-11: Heavy-set man, about fifty-five
- head-12: Woman, about seventy, eyes narrowed

## Skull

`public/models/skull.glb`, built by `scripts/build-skull.mjs`.

**Skull** by **Vladimir Petkovic**, 2025, **CC0 1.0**, from the Khronos Group's [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ScatteringSkull) (`Models/ScatteringSkull`). Textures and materials removed and the mesh simplified to about 113,000 triangles.

## Motion capture

`public/mocap/`, built by `scripts/build-mocap.mjs` from the clip list in `reference-packs/mocap-clips.json`.

The data used in this project was obtained from **mocap.cs.cmu.edu** (Carnegie Mellon University Graphics Lab Motion Capture Database). The database was created with funding from NSF EIA-0196217. CMU states the data may be used freely for any purpose. BVH conversion by **Bruce Hahne** (2010 release, cgspeed.com), as mirrored at [una-dinosauria/cmu-mocap](https://github.com/una-dinosauria/cmu-mocap). Clips were trimmed, resampled to 10 frames a second and reduced to 25 joints.

| CMU clip | Description |
| --- | --- |
| 07_01 | walk |
| 16_15 | walk |
| 35_17 | run/jog |
| 09_01 | run |
| 16_57 | run/jog, sudden stop |
| 49_04 | run, leap |
| 13_11 | forward jump |
| 16_03 | high jump |
| 13_10 | jump up to grab, reach for, tiptoe |
| 49_02 | jump up and down, hop on one foot |
| 75_08 | 360 jumps |
| 75_13 | hopscotch |
| 05_02 | dance - expressive arms, pirouette |
| 05_05 | dance - quasi-cou-de-pied, raised leg above hip-height, jete en tourant |
| 05_07 | dance - small jetes, attitude/arabesque, shifted-axis pirouette, turn |
| 05_12 | dance - arms held high, pointe tendue a terre, upper body rotation |
| 05_17 | dance - coupe dessous, grand jete en tourant |
| 05_20 | dance - attitude/arabesque, jete en tourant, bending back |
| 49_09 | dance - arms held high, side arabesque |
| 49_15 | static dance pose - folded in, head lowered, leg bent |
| 49_18 | balance on one leg, outstretched arms |
| 49_22 | dance - lean back on bent leg, balance, bend elbow by ear |
| 60_01 | salsa dance |
| 60_08 | salsa dance |
| 61_05 | salsa dance |
| 93_03 | charleston_01 |
| 93_06 | lindyHop2 |
| 93_08 | xtra fancY charleston |
| 94_03 | Unknown |
| 06_14 | basketball - crossover dribble, shoot |
| 06_15 | basketball - dribble, shoot |
| 124_05 | Basketball Jump Shot |
| 124_01 | Baseball Pitch |
| 124_07 | Baseball Swing |
| 124_09 | Frisbee |
| 10_01 | soccer - kick ball |
| 10_05 | soccer - kick ball |
| 63_01 | Swing |
| 64_16 | Placing Tee |
| 13_17 | boxing |
| 14_01 | boxing |
| 02_05 | punch/strike |
| 02_07 | swordplay |
| 135_04 | Front Kick |
| 135_07 | Mawashigeri |
| 135_01 | Bassai |
| 144_05 | Front_Kicking |
| 90_05 | jump kick |
| 49_06 | cartwheel |
| 85_05 | HandStandKicks |
| 85_08 | Helicopter |
| 88_01 | backflip |
| 88_05 | cartwheel into backflip |
| 90_11 | hand spring |
| 13_01 | sit on high stool, stand up |
| 13_04 | sit on stepstool, chin in hand |
| 14_30 | sit on stepstool, ankle on other knee, hand on chin |
| 13_07 | unscrew bottlecap, drink soda |
| 13_20 | wash windows |
| 13_23 | sweep floor |
| 14_13 | mop floor |
| 13_26 | direct traffic, wave |
| 13_29 | jumping jacks, side twists, bend over, squats |
| 13_33 | climb ladder |
| 15_06 | lean forward, reach for |
| 02_06 | bend over, scoop up, rise, lift arm |
| 62_03 | sawing, hand saw |
| 62_07 | hammering a nail |
| 62_21 | coiling a rope |
| 79_01 | chopping wood |
| 79_04 | digging |
| 115_06 | Picking box up, bending knees |
| 115_01 | Pick up box, bend from waist |
| 140_01 | Get Up Face Down |
| 140_08 | Get Up From Ground Laying on Back |
| 42_01 | stretch - rotate head, shoulders, arms, legs |
| 12_04 | tai chi |
| 01_02 | playground - climb |
| 81_06 | push heavy box |
| 81_08 | drag heavy object |
| 139_09 | Ducking |
| 139_14 | Sneak Sideways |

The wooden mannequin the motion drives is built from code (spheres, ellipsoids, tapered cylinders and wedges) and has no model file.

## Photographs, paintings and sculpture

`public/packs/`, built by `scripts/build-reference-packs.mjs` from the hand-curated `reference-packs/manifest.json`. Sources: [The Metropolitan Museum of Art Open Access](https://www.metmuseum.org/about-the-met/policies-and-documents/open-access) (CC0) and [Wikimedia Commons](https://commons.wikimedia.org/) (public domain and CC BY, licence per file below). Each line links to the page the file came from.

<!-- photo-packs:start -->
<!-- photo-packs:end -->

## Software

three.js (MIT), Preact (MIT), idb (ISC), fflate (MIT). The paper textures and app icon are generated by `scripts/generate-assets.mjs`.
