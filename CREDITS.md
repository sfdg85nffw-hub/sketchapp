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
### Faces (130)

- [Lange-MigrantMother02](https://commons.wikimedia.org/wiki/File:Lange-MigrantMother02.jpg), Dorothea Lange. Public domain, Wikimedia Commons. `face-commons-52734`
- [Boy with freckles detail, from- Dorothea Lange, Children of Oklahoma drought refugee in migratory camp in California, 1…](https://commons.wikimedia.org/wiki/File:Boy_with_freckles_detail,_from-_Dorothea_Lange,_Children_of_Oklahoma_drought_refugee_in_migratory_camp_in_California,_1936_(cropped).jpg), Dorothea Lange. Public domain, Wikimedia Commons. `face-commons-92109040`
- [Langston-delano1](https://commons.wikimedia.org/wiki/File:Langston-delano1.jpg), Jack Delano. Public domain, Wikimedia Commons. `face-commons-21284341`
- [Gordon Parks, 1984 (cropped)](https://commons.wikimedia.org/wiki/File:Gordon_Parks,_1984_(cropped).jpg), Iris Schneider, Los Angeles Times. CC BY 4.0, Wikimedia Commons. `face-commons-197308370`
- [Portrait of Dr. Charles Johnson, sociologist at Fisk University, Nashville, Tennessee](https://commons.wikimedia.org/wiki/File:Portrait_of_Dr._Charles_Johnson,_sociologist_at_Fisk_University,_Nashville,_Tennessee.tif), Gordon Parks. Public domain, Wikimedia Commons. `face-commons-165828566`
- [Edward Sheriff Curtis (1868-1952)](https://commons.wikimedia.org/wiki/File:Edward_Sheriff_Curtis_(1868-1952).jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-91955544`
- [A Jicarilla Man, 1904, Edward S. Curtis (sepia restored)](https://commons.wikimedia.org/wiki/File:A_Jicarilla_Man,_1904,_Edward_S._Curtis_(sepia_restored).jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-24787181`
- [Chief Joseph by Edward Sheriff Curtis](https://commons.wikimedia.org/wiki/File:Chief_Joseph_by_Edward_Sheriff_Curtis.jpg), Edward S. Curtis / Adam Cuerden. Public domain, Wikimedia Commons. `face-commons-145676694`
- [Edward S. Curtis, Navajo chief, 1904](https://commons.wikimedia.org/wiki/File:Edward_S._Curtis,_Navajo_chief,_1904.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-11158347`
- [Edward S. Curtis Collection People 100](https://commons.wikimedia.org/wiki/File:Edward_S._Curtis_Collection_People_100.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-95401`
- [Edward S. Curtis Collection People 087](https://commons.wikimedia.org/wiki/File:Edward_S._Curtis_Collection_People_087.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-95387`
- [Edward S. Curtis Collection People 042](https://commons.wikimedia.org/wiki/File:Edward_S._Curtis_Collection_People_042.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-29015`
- [Pakit, Maricopa, by Edward S. Curtis, 1907](https://commons.wikimedia.org/wiki/File:Pakit,_Maricopa,_by_Edward_S._Curtis,_1907.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-11159890`
- [Acoma woman by Edward S. Curtis, 1905](https://commons.wikimedia.org/wiki/File:Acoma_woman_by_Edward_S._Curtis,_1905.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-11160746`
- [Lewis Hine, Girl working in a cannery, 1911](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Girl_working_in_a_cannery,_1911.jpg), Lewis Hine. Public domain, Wikimedia Commons. `face-commons-11159139`
- [Lewis Hine, Young newsie, St. Louis, 1910](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Young_newsie,_St._Louis,_1910.jpg), Lewis Hine. Public domain, Wikimedia Commons. `face-commons-11158936`
- [Lewis Hine, Manager of the "Hotel de Bum", St. Louis, 1910](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Manager_of_the_%22Hotel_de_Bum%22,_St._Louis,_1910.jpg), Lewis Hine. Public domain, Wikimedia Commons. `face-commons-11158940`
- [Lucille Burroughs, daughter of a cotton sharecropper. Hale County, Alabama](https://commons.wikimedia.org/wiki/File:Lucille_Burroughs,_daughter_of_a_cotton_sharecropper._Hale_County,_Alabama.jpg), Walker Evans. Public domain, Wikimedia Commons. `face-commons-8311701`
- [August Anheuser Busch Sr. in 1925 - photo. by Bain News Service. LCCN91794596 (cropped)](https://commons.wikimedia.org/wiki/File:August_Anheuser_Busch_Sr._in_1925_-_photo._by_Bain_News_Service._LCCN91794596_(cropped).tiff), George Grantham Bain Collection. Public domain, Wikimedia Commons. `face-commons-105901567`
- [General Baden-Powell, Bain news service photo portrait (cropped)](https://commons.wikimedia.org/wiki/File:General_Baden-Powell,_Bain_news_service_photo_portrait_(cropped).jpg), James Russell & Sons [ 1 ]. Public domain, Wikimedia Commons. `face-commons-122066795`
- [Charles G. Darwin, Bain News Service photo portrait](https://commons.wikimedia.org/wiki/File:Charles_G._Darwin,_Bain_News_Service_photo_portrait.jpg), Bain News Service. Public domain, Wikimedia Commons. `face-commons-5734554`
- [John Howard Lawson Harris & Ewing Portrait](https://commons.wikimedia.org/wiki/File:John_Howard_Lawson_Harris_%26_Ewing_Portrait.jpg), Harris & Ewing. Public domain, Wikimedia Commons. `face-commons-174887081`
- [Thomas Woodrow Wilson, Harris & Ewing bw photo portrait, 1919 - black and white (cropped)](https://commons.wikimedia.org/wiki/File:Thomas_Woodrow_Wilson,_Harris_%26_Ewing_bw_photo_portrait,_1919_-_black_and_white_(cropped).jpg), Harris & Ewing. Public domain, Wikimedia Commons. `face-commons-103608229`
- [John Aspinwall Roosevelt Harris & Ewing Portrait 1954](https://commons.wikimedia.org/wiki/File:John_Aspinwall_Roosevelt_Harris_%26_Ewing_Portrait_1954.jpg), Harris & Ewing. Public domain, Wikimedia Commons. `face-commons-171075549`
- [Henry Stimson, Harris & Ewing bw photo portrait, 1929 (3x4 cropped)](https://commons.wikimedia.org/wiki/File:Henry_Stimson,_Harris_%26_Ewing_bw_photo_portrait,_1929_(3x4_cropped).jpg), Harris & Ewing. Public domain, Wikimedia Commons. `face-commons-160064332`
- [Robert M. La Follette Portrait by Harris & Ewing (3x4 cropped)](https://commons.wikimedia.org/wiki/File:Robert_M._La_Follette_Portrait_by_Harris_%26_Ewing_(3x4_cropped).jpg), Harris & Ewing Collection. Public domain, Wikimedia Commons. `face-commons-165310986`
- [Senator Vance official portrait. 118th Congress (cropped)](https://commons.wikimedia.org/wiki/File:Senator_Vance_official_portrait._118th_Congress_(cropped).jpg), United States Congress. Public domain, Wikimedia Commons. `face-commons-128112259`
- [Senator John McCain official portrait 2006 3x4 crop](https://commons.wikimedia.org/wiki/File:Senator_John_McCain_official_portrait_2006_3x4_crop.jpg), Office of Senator John McCain. Public domain, Wikimedia Commons. `face-commons-202191135`
- [Congresswoman Waters official photo](https://commons.wikimedia.org/wiki/File:Congresswoman_Waters_official_photo.jpg), House of Representatives photographic studio. Public domain, Wikimedia Commons. `face-commons-61221347`
- [Congresswoman Sheila Cherfilus-McCormick Official Portrait (cropped)](https://commons.wikimedia.org/wiki/File:Congresswoman_Sheila_Cherfilus-McCormick_Official_Portrait_(cropped).jpg), Brian Thorpe, U.S. House Photography Service. Public domain, Wikimedia Commons. `face-commons-159583416`
- [Congresswoman Michelle Steel](https://commons.wikimedia.org/wiki/File:Congresswoman_Michelle_Steel.jpg), Justcommunicate. CC BY 4.0, Wikimedia Commons. `face-commons-131574762`
- [Congresswoman Sara Jacobs](https://commons.wikimedia.org/wiki/File:Congresswoman_Sara_Jacobs.jpg), House Creative Committee. Public domain, Wikimedia Commons. `face-commons-106666439`
- [Zoe Lofgren Official Portrait 2024 (cropped)](https://commons.wikimedia.org/wiki/File:Zoe_Lofgren_Official_Portrait_2024_(cropped).jpeg), Brian Thorpe, House Creative Services. Public domain, Wikimedia Commons. `face-commons-146214195`
- [U.S. Air Force Airman 1st Class Alan Wright, a broadcaster with the 2nd Combat Camera Squadron, poses for a portrait at…](https://commons.wikimedia.org/wiki/File:U.S._Air_Force_Airman_1st_Class_Alan_Wright,_a_broadcaster_with_the_2nd_Combat_Camera_Squadron,_poses_for_a_portrait_at_Hill_Air_Force_Base,_Utah,_Oct._14,_2013,_during_combat_refresher_training,_which_was_131014-F-SP601-039.jpg), Amn Taylor Queen. Public domain, Wikimedia Commons. `face-commons-30795221`
- [Lieutenant Colonel (retired) James Harvey III, an original Tuskegee Airman at Nellis Air Force Base, Nevada on January…](https://commons.wikimedia.org/wiki/File:Lieutenant_Colonel_(retired)_James_Harvey_III,_an_original_Tuskegee_Airman_at_Nellis_Air_Force_Base,_Nevada_on_January_10,_2022_(cropped).jpg), Airman 1st Class Zachary Rufus. Public domain, Wikimedia Commons. `face-commons-179362639`
- [US Air Force JP wearing Pararescue beret](https://commons.wikimedia.org/wiki/File:US_Air_Force_JP_wearing_Pararescue_beret.png), U.S. Air Force. Public domain, Wikimedia Commons. `face-commons-93057379`
- [Little Norway Guide2](https://commons.wikimedia.org/wiki/File:Little_Norway_Guide2.jpg), Arthur Rothstein. Public domain, Wikimedia Commons. `face-commons-8136907`
- [George Washington Carver-crop](https://commons.wikimedia.org/wiki/File:George_Washington_Carver-crop.jpg), Arthur Rothstein. Public domain, Wikimedia Commons. `face-commons-9504959`
- [Face detail, Negro boy near Cincinnati, Ohio LCCN2017877922 (cropped)](https://commons.wikimedia.org/wiki/File:Face_detail,_Negro_boy_near_Cincinnati,_Ohio_LCCN2017877922_(cropped).tif), Vachon, John, 1914-1975, photographer. Public domain, Wikimedia Commons. `face-commons-81679923`
- [Howard P. Perry, the first African-American US Marine Corps recruit](https://commons.wikimedia.org/wiki/File:Howard_P._Perry,_the_first_African-American_US_Marine_Corps_recruit.jpg), Roger Smith Note: Erroneously credited to John Vachon by the Library of Congres…. Public domain, Wikimedia Commons. `face-commons-15362626`
- [Ripert. Thomas. 33 ans, né à Marseille. Cocher. Anarchiste. 5/3/94.](https://www.metmuseum.org/art/collection/search/306981), Alphonse Bertillon. CC0, The Metropolitan Museum of Art, Open Access. `face-met-306981`
- [Aumaréchal. Auguste. 44 ans, né à Chateaumeillant (Cher). Ébéniste. Association de malfaiteurs. 8/3/94.](https://www.metmuseum.org/art/collection/search/306633), Alphonse Bertillon. CC0, The Metropolitan Museum of Art, Open Access. `face-met-306633`
- [Renaud. Jules. 41 ans, né à Anteuil (Doubs). Cordonnier. Anarchiste. 27/2/94.](https://www.metmuseum.org/art/collection/search/306974), Alphonse Bertillon. CC0, The Metropolitan Museum of Art, Open Access. `face-met-306974`
- [Landschoot. Edouard. 27 ans, né le 6/8/67 à Paris. Bijoutier. Anarchiste. 2/7/94.](https://www.metmuseum.org/art/collection/search/306855), Alphonse Bertillon. CC0, The Metropolitan Museum of Art, Open Access. `face-met-306855`
- [Vuagniaux. Alfred. 41 ans, né à Vucheron (Suisse). Cordonnier. Anarchiste. 2/3/94.](https://www.metmuseum.org/art/collection/search/307047), Alphonse Bertillon. CC0, The Metropolitan Museum of Art, Open Access. `face-met-307047`
- [Bompeix. Eugène. 53 ans, né à St Martin d'Herbus (Haute-Vienne). Conducteur de machines. Anar. 3/7/94.](https://www.metmuseum.org/art/collection/search/306680), Alphonse Bertillon. CC0, The Metropolitan Museum of Art, Open Access. `face-met-306680`
- [Solier. Auguste. 18 ans, né le 3/3/75 à Cemery-la-Ville. Dessinateur. Anarchiste. 12/1/94.](https://www.metmuseum.org/art/collection/search/307014), Alphonse Bertillon. CC0, The Metropolitan Museum of Art, Open Access. `face-met-307014`
- [Henon. François. 52 ans, né le 5/5/42 à Lyon (Rhône). Caissier. Anarchiste. 2/7/94.](https://www.metmuseum.org/art/collection/search/306823), Alphonse Bertillon. CC0, The Metropolitan Museum of Art, Open Access. `face-met-306823`
- [Rigollet. Alexandre. 41 ans, né dans le Loir-et-Cher. Terrassier. Anarchiste.](https://www.metmuseum.org/art/collection/search/306980), Alphonse Bertillon. CC0, The Metropolitan Museum of Art, Open Access. `face-met-306980`
- [Peticolin. Henri. 23 ans, né le 8/6/71 à Goersdorf (Bas-Rhin). Vernisseur. Anarchiste. 2/7/94.](https://www.metmuseum.org/art/collection/search/306952), Alphonse Bertillon. CC0, The Metropolitan Museum of Art, Open Access. `face-met-306952`
- [Kahn. Rodolphe. 43 ans, né le 15/1/51 à Lyon (Rhône). Courtier de commerce. Anarchiste. 8/3/94.](https://www.metmuseum.org/art/collection/search/306844), Alphonse Bertillon. CC0, The Metropolitan Museum of Art, Open Access. `face-met-306844`
- [Auvin. Henri. 37 ans, né à St-Meme (Charente-Inférieure). Chaudronnier. Anarchiste. 1/3/94.](https://www.metmuseum.org/art/collection/search/306634), Alphonse Bertillon. CC0, The Metropolitan Museum of Art, Open Access. `face-met-306634`
- [Figure 20: Profound suffering, with resignation](https://www.metmuseum.org/art/collection/search/623038), Guillaume-Benjamin-Amand Duchenne de Boulogne. CC0, The Metropolitan Museum of Art, Open Access. `face-met-623038`
- [Figure 47: A suggestion of this same weeping](https://www.metmuseum.org/art/collection/search/623050), Guillaume-Benjamin-Amand Duchenne de Boulogne. CC0, The Metropolitan Museum of Art, Open Access. `face-met-623050`
- [Figure 21: Painful recollection and recollection or calling something to mind](https://www.metmuseum.org/art/collection/search/623039), Guillaume-Benjamin-Amand Duchenne de Boulogne. CC0, The Metropolitan Museum of Art, Open Access. `face-met-623039`
- [Figure 48: Mild weeping, pity and feeble false laughter](https://www.metmuseum.org/art/collection/search/623051), Guillaume-Benjamin-Amand Duchenne de Boulogne. CC0, The Metropolitan Museum of Art, Open Access. `face-met-623051`
- [Figure 49: Painful weeping and forward looking.](https://www.metmuseum.org/art/collection/search/623052), Guillaume-Benjamin-Amand Duchenne de Boulogne. CC0, The Metropolitan Museum of Art, Open Access. `face-met-623052`
- [Figure 62: Terror, semiprofile](https://www.metmuseum.org/art/collection/search/623061), Guillaume-Benjamin-Amand Duchenne de Boulogne. CC0, The Metropolitan Museum of Art, Open Access. `face-met-623061`
- [Figure 55: Astonishment badly rendered by the subject: a ridiculous and inane expression.](https://www.metmuseum.org/art/collection/search/623057), Guillaume-Benjamin-Amand Duchenne de Boulogne. CC0, The Metropolitan Museum of Art, Open Access. `face-met-623057`
- [\[William Calder Marshall\]](https://www.metmuseum.org/art/collection/search/685894), John and Charles Watkins. CC0, The Metropolitan Museum of Art, Open Access. `face-met-685894`
- [Fille de Shanghai](https://www.metmuseum.org/art/collection/search/288014), Raimund von Stillfried. CC0, The Metropolitan Museum of Art, Open Access. `face-met-288014`
- [\[Richard James Lane\]](https://www.metmuseum.org/art/collection/search/685835), John and Charles Watkins. CC0, The Metropolitan Museum of Art, Open Access. `face-met-685835`
- [Carl Becker](https://www.metmuseum.org/art/collection/search/686195), Loescher & Petsch. CC0, The Metropolitan Museum of Art, Open Access. `face-met-686195`
- [Beatrice](https://www.metmuseum.org/art/collection/search/266255), Julia Margaret Cameron. CC0, The Metropolitan Museum of Art, Open Access. `face-met-266255`
- [\[George Frederick Watts\]](https://www.metmuseum.org/art/collection/search/686147), John and Charles Watkins. CC0, The Metropolitan Museum of Art, Open Access. `face-met-686147`
- [\[Paul Falconer Poole\]](https://www.metmuseum.org/art/collection/search/685988), John and Charles Watkins. CC0, The Metropolitan Museum of Art, Open Access. `face-met-685988`
- [\[John Prescott Knight\]](https://www.metmuseum.org/art/collection/search/685817), John and Charles Watkins. CC0, The Metropolitan Museum of Art, Open Access. `face-met-685817`
- [Gioacchino Rossini](https://www.metmuseum.org/art/collection/search/266902), Nadar. CC0, The Metropolitan Museum of Art, Open Access. `face-met-266902`
- [Circe](https://www.metmuseum.org/art/collection/search/266257), Julia Margaret Cameron. CC0, The Metropolitan Museum of Art, Open Access. `face-met-266257`
- [\[Karl Heffeck\]](https://www.metmuseum.org/art/collection/search/686229), Loescher & Petsch. CC0, The Metropolitan Museum of Art, Open Access. `face-met-686229`
- [Miss Hodges of Salem](https://www.metmuseum.org/art/collection/search/268318), Southworth and Hawes. CC0, The Metropolitan Museum of Art, Open Access. `face-met-268318`
- [\[Member of the Paris Commune: Angeline \[Angelina Courcelles\], cantinière, à perpétuité, pillage et incendie\]](https://www.metmuseum.org/art/collection/search/772033), Ernest Eugène Appert. CC0, The Metropolitan Museum of Art, Open Access. `face-met-772033`
- [Regena](https://www.metmuseum.org/art/collection/search/261030), Morton Schamberg. CC0, The Metropolitan Museum of Art, Open Access. `face-met-261030`
- [Charles Hay Cameron](https://www.metmuseum.org/art/collection/search/268690), Julia Margaret Cameron. CC0, The Metropolitan Museum of Art, Open Access. `face-met-268690`
- [\[The Viscountess Canning, Barrackpore\]](https://www.metmuseum.org/art/collection/search/287681), John Constantine Stanley. CC0, The Metropolitan Museum of Art, Open Access. `face-met-287681`
- [Sir John Herschel](https://www.metmuseum.org/art/collection/search/263166), Julia Margaret Cameron. CC0, The Metropolitan Museum of Art, Open Access. `face-met-263166`
- [Marie Spartali](https://www.metmuseum.org/art/collection/search/271520), Julia Margaret Cameron. CC0, The Metropolitan Museum of Art, Open Access. `face-met-271520`
- [Julia Margaret Cameron](https://www.metmuseum.org/art/collection/search/268692), Henry Herschel Hay Cameron. CC0, The Metropolitan Museum of Art, Open Access. `face-met-268692`
- [Vieux mendiant](https://www.metmuseum.org/art/collection/search/288489), Raimund von Stillfried. CC0, The Metropolitan Museum of Art, Open Access. `face-met-288489`
- [\[Édouard Detaille\]](https://www.metmuseum.org/art/collection/search/685568), Walery Frères. CC0, The Metropolitan Museum of Art, Open Access. `face-met-685568`
- [James B. "Wild Bill" Hickock](https://www.metmuseum.org/art/collection/search/286062), Jeremiah Gurney. CC0, The Metropolitan Museum of Art, Open Access. `face-met-286062`
- [Denise Zola](https://www.metmuseum.org/art/collection/search/286039), Emile Zola. CC0, The Metropolitan Museum of Art, Open Access. `face-met-286039`
- [\[Unidentified Boy in Dark Suit\]](https://www.metmuseum.org/art/collection/search/268309), Southworth and Hawes. CC0, The Metropolitan Museum of Art, Open Access. `face-met-268309`
- [\[Patient, Surrey County Lunatic Asylum\]](https://www.metmuseum.org/art/collection/search/285964), Hugh Welch Diamond. CC0, The Metropolitan Museum of Art, Open Access. `face-met-285964`
- [Fille de Shanghai](https://www.metmuseum.org/art/collection/search/288495), Raimund von Stillfried. CC0, The Metropolitan Museum of Art, Open Access. `face-met-288495`
- [\[Elderly Man; Full Face\]](https://www.metmuseum.org/art/collection/search/268353), Southworth and Hawes. CC0, The Metropolitan Museum of Art, Open Access. `face-met-268353`
- [\[Mrs. Eakins or Her Sister Doll\]](https://www.metmuseum.org/art/collection/search/271856), Thomas Eakins. CC0, The Metropolitan Museum of Art, Open Access. `face-met-271856`
- [\[Album Containing Photographs, Engravings, Drawings, and Publications Pertaining to Alexandre Dumas\]](https://www.metmuseum.org/art/collection/search/283117), Nadar. CC0, The Metropolitan Museum of Art, Open Access. `face-met-283117`
- [William Hickling Prescott](https://www.metmuseum.org/art/collection/search/268322), Southworth and Hawes. CC0, The Metropolitan Museum of Art, Open Access. `face-met-268322`
- [Henry Clay](https://www.metmuseum.org/art/collection/search/268312), Southworth and Hawes. CC0, The Metropolitan Museum of Art, Open Access. `face-met-268312`
- [\[Studio Portrait: Woman with Straw Basket, Algeria\]](https://www.metmuseum.org/art/collection/search/764829), Maison Prod'hom. CC0, The Metropolitan Museum of Art, Open Access. `face-met-764829`
- [\[Unidentified Woman\]](https://www.metmuseum.org/art/collection/search/268350), Southworth and Hawes. CC0, The Metropolitan Museum of Art, Open Access. `face-met-268350`
- [\[Young Girl with Hand Raised to Shoulder\]](https://www.metmuseum.org/art/collection/search/268352), Southworth and Hawes. CC0, The Metropolitan Museum of Art, Open Access. `face-met-268352`
- [\[Unidentified Man Wearing Turban\]](https://www.metmuseum.org/art/collection/search/268327), Southworth and Hawes. CC0, The Metropolitan Museum of Art, Open Access. `face-met-268327`
- [\[Unknown Subject\]](https://www.metmuseum.org/art/collection/search/685982), Saint-Edmé. CC0, The Metropolitan Museum of Art, Open Access. `face-met-685982`
- [Professor Samuel F. B. Morse, LL.D.](https://www.metmuseum.org/art/collection/search/270334), Thomas Faris. CC0, The Metropolitan Museum of Art, Open Access. `face-met-270334`
- [Portrait of D.O. Hill](https://www.metmuseum.org/art/collection/search/269420), Thomas Annan. CC0, The Metropolitan Museum of Art, Open Access. `face-met-269420`
- [Mrs. Herbert Duckworth](https://www.metmuseum.org/art/collection/search/283098), Julia Margaret Cameron. CC0, The Metropolitan Museum of Art, Open Access. `face-met-283098`
- [Sir John Herschel](https://www.metmuseum.org/art/collection/search/282065), Julia Margaret Cameron. CC0, The Metropolitan Museum of Art, Open Access. `face-met-282065`
- [Alfred, Lord Tennyson](https://www.metmuseum.org/art/collection/search/271078), Julia Margaret Cameron. CC0, The Metropolitan Museum of Art, Open Access. `face-met-271078`
- [Frederick Douglass](https://www.metmuseum.org/art/collection/search/286586), George Kendall Warren. CC0, The Metropolitan Museum of Art, Open Access. `face-met-286586`
- [Portrait of a Young Man of the Van Steynoert Family](https://www.metmuseum.org/art/collection/search/437210), Netherlandish Painter. CC0, The Metropolitan Museum of Art, Open Access. `face-met-437210`
- [William Man Godschall (1720–1802)](https://www.metmuseum.org/art/collection/search/437579), John Russell. CC0, The Metropolitan Museum of Art, Open Access. `face-met-437579`
- [Man Holding a Jug](https://www.metmuseum.org/art/collection/search/438407), Michiel Sweerts. CC0, The Metropolitan Museum of Art, Open Access. `face-met-438407`
- [Man in a Red Cloak](https://www.metmuseum.org/art/collection/search/437413), Rembrandt. CC0, The Metropolitan Museum of Art, Open Access. `face-met-437413`
- [Portrait of a Surgeon](https://www.metmuseum.org/art/collection/search/437208), Netherlandish Painter. CC0, The Metropolitan Museum of Art, Open Access. `face-met-437208`
- [Old Woman in an Armchair](https://www.metmuseum.org/art/collection/search/435596), Jacob Backer. CC0, The Metropolitan Museum of Art, Open Access. `face-met-435596`
- [Portrait of a "Mamelouk"](https://www.metmuseum.org/art/collection/search/439337), Horace Vernet. CC0, The Metropolitan Museum of Art, Open Access. `face-met-439337`
- [Monsieur Suisse](https://www.metmuseum.org/art/collection/search/436017), Gustave Courbet. CC0, The Metropolitan Museum of Art, Open Access. `face-met-436017`
- [Head of Jean-Baptiste Faure (1830–1914)](https://www.metmuseum.org/art/collection/search/436955), Edouard Manet. CC0, The Metropolitan Museum of Art, Open Access. `face-met-436955`
- [Saint Philip Neri (1515–1595)](https://www.metmuseum.org/art/collection/search/712539), Carlo Dolci. CC0, The Metropolitan Museum of Art, Open Access. `face-met-712539`
- [Portrait of a Man](https://www.metmuseum.org/art/collection/search/436641), Bartholomeus van der Helst. CC0, The Metropolitan Museum of Art, Open Access. `face-met-436641`
- [Marble portrait of the emperor Antoninus Pius](https://www.metmuseum.org/art/collection/search/253386), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-253386`
- [Bronze portrait of a man](https://www.metmuseum.org/art/collection/search/248892), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-248892`
- [Marble portrait of the co-emperor Lucius Verus](https://www.metmuseum.org/art/collection/search/248783), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-248783`
- [Marble portrait of Matidia Minor](https://www.metmuseum.org/art/collection/search/251061), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-251061`
- [Marble portrait of a man from a funerary relief](https://www.metmuseum.org/art/collection/search/250657), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-250657`
- [Two marble portrait heads from a relief](https://www.metmuseum.org/art/collection/search/250680), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-250680`
- [Marble portrait of the Empress Faustina the Younger, wife of the emperor Marcus Aurelius](https://www.metmuseum.org/art/collection/search/255868), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-255868`
- [Bronze portrait bust of a man](https://www.metmuseum.org/art/collection/search/248751), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-248751`
- [Marble portrait head of Antinoos](https://www.metmuseum.org/art/collection/search/256530), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-256530`
- [Marble portrait of a man](https://www.metmuseum.org/art/collection/search/255693), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-255693`
- [Marble portrait of a man](https://www.metmuseum.org/art/collection/search/251040), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-251040`
- [Marble portrait of a man](https://www.metmuseum.org/art/collection/search/249051), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-249051`
- [Marble portrait bust of a man](https://www.metmuseum.org/art/collection/search/248118), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-248118`
- [Marble portrait head of the Emperor Constantine I](https://www.metmuseum.org/art/collection/search/252884), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-252884`
- [Statue portrait of Sappho?](https://www.metmuseum.org/art/collection/search/254497), Roman. CC0, The Metropolitan Museum of Art, Open Access. `face-met-254497`
- [Portrait of an elderly lady with a gold wreath](https://www.metmuseum.org/art/collection/search/547859), Unknown. CC0, The Metropolitan Museum of Art, Open Access. `face-met-547859`
- [Head of a male statue](https://www.metmuseum.org/art/collection/search/545107), Unknown. CC0, The Metropolitan Museum of Art, Open Access. `face-met-545107`
- [Head of a Man](https://www.metmuseum.org/art/collection/search/545902), Unknown. CC0, The Metropolitan Museum of Art, Open Access. `face-met-545902`

### Poses (88)

- [US Navy 060208-N-1577S-073 Information Systems Technician 2nd Class Triva Pino, left, assigned to the guided missile cr…](https://commons.wikimedia.org/wiki/File:US_Navy_060208-N-1577S-073_Information_Systems_Technician_2nd_Class_Triva_Pino,_left,_assigned_to_the_guided_missile_cruiser_USS_Port_Royal_(CG_73),_won_the_2006_U.S._Armed_Forces_Boxing_Championship.jpg), U.S. Navy photo. Public domain, Wikimedia Commons. `pose-commons-8230420`
- [US Air Force boxer Bobby DeLeon (Right) and US Army boxer Torrence Daniels square off in the ring at this year's Armed…](https://commons.wikimedia.org/wiki/File:US_Air_Force_boxer_Bobby_DeLeon_(Right)_and_US_Army_boxer_Torrence_Daniels_square_off_in_the_ring_at_this_year%27s_Armed_Forces_Boxing_Competition_in_Fort_Huachuca,_Arizona._DeLeon_an_-_DPLA_-_b81a1430a701a2654225d79bf3d5a66d.jpeg), Department of Defense. American Forces Information Service. Defense Visual Info…. Public domain, Wikimedia Commons. `pose-commons-96634807`
- [Athletics at the 2017 Warrior Games 35469521132 dc843e90e2 b](https://commons.wikimedia.org/wiki/File:Athletics_at_the_2017_Warrior_Games_35469521132_dc843e90e2_b.jpg), Department of Defense Warrior Games. Public domain, Wikimedia Commons. `pose-commons-61397717`
- [Athletics at the 2017 Warrior Games 35645849976 99f67c7359 b](https://commons.wikimedia.org/wiki/File:Athletics_at_the_2017_Warrior_Games_35645849976_99f67c7359_b.jpg), Department of Defense Warrior Games. Public domain, Wikimedia Commons. `pose-commons-61397712`
- [Archery at the 2017 Warrior Games 34896115063 2debd3340c b](https://commons.wikimedia.org/wiki/File:Archery_at_the_2017_Warrior_Games_34896115063_2debd3340c_b.jpg), Department of Defense Warrior Games. Public domain, Wikimedia Commons. `pose-commons-61418912`
- [Japanese Americans practicing judo, Portland Assembly Center cph.3c33813](https://commons.wikimedia.org/wiki/File:Japanese_Americans_practicing_judo,_Portland_Assembly_Center_cph.3c33813.jpg), U.S. Signal Corps. Public domain, Wikimedia Commons. `pose-commons-24742153`
- [Rangers in Action 10-African Land Forces Summit-US Army Africa-13 MAY 2010](https://commons.wikimedia.org/wiki/File:Rangers_in_Action_10-African_Land_Forces_Summit-US_Army_Africa-13_MAY_2010.jpg), US Army Africa. CC BY 2.0, Wikimedia Commons. `pose-commons-21283661`
- [Rangers in Action 11-African Land Forces Summit-US Army Africa-13 MAY 2010](https://commons.wikimedia.org/wiki/File:Rangers_in_Action_11-African_Land_Forces_Summit-US_Army_Africa-13_MAY_2010.jpg), US Army Africa. CC BY 2.0, Wikimedia Commons. `pose-commons-21284622`
- [Rangers in Action 05-African Land Forces Summit-US Army Africa-13 MAY 2010](https://commons.wikimedia.org/wiki/File:Rangers_in_Action_05-African_Land_Forces_Summit-US_Army_Africa-13_MAY_2010.jpg), US Army Africa. CC BY 2.0, Wikimedia Commons. `pose-commons-21281403`
- [Rangers in Action 21-African Land Forces Summit-US Army Africa-13 MAY 2010](https://commons.wikimedia.org/wiki/File:Rangers_in_Action_21-African_Land_Forces_Summit-US_Army_Africa-13_MAY_2010.jpg), US Army Africa. CC BY 2.0, Wikimedia Commons. `pose-commons-21285212`
- [Rangers in Action 06-African Land Forces Summit-US Army Africa-13 MAY 2010](https://commons.wikimedia.org/wiki/File:Rangers_in_Action_06-African_Land_Forces_Summit-US_Army_Africa-13_MAY_2010.jpg), US Army Africa. CC BY 2.0, Wikimedia Commons. `pose-commons-21281784`
- [Air Force Falcons men's gymnastics Feb. 8, 2025 home meet against California Golden Bears —4323795 o](https://commons.wikimedia.org/wiki/File:Air_Force_Falcons_men%27s_gymnastics_Feb._8,_2025_home_meet_against_California_Golden_Bears_%E2%80%944323795_o.jpg), Air Force photos by Ray Bahner & Adalyn Greene. Public domain, Wikimedia Commons. `pose-commons-164894635`
- [U.S. Navy Armed Forces Wrestling Championship held at Archbishop Rummel High School, New Orleans 2004](https://commons.wikimedia.org/wiki/File:U.S._Navy_Armed_Forces_Wrestling_Championship_held_at_Archbishop_Rummel_High_School,_New_Orleans_2004.jpg), U.S. Marine Corps photo by Lance Cpl. Lydia L. Collison.. Public domain, Wikimedia Commons. `pose-commons-8207805`
- [US Navy 030816-N-9176J-001 Steelworker Constructionman Joseph M. Axiotis, from Daytona Beach, Fla., trains for the All-…](https://commons.wikimedia.org/wiki/File:US_Navy_030816-N-9176J-001_Steelworker_Constructionman_Joseph_M._Axiotis,_from_Daytona_Beach,_Fla.,_trains_for_the_All-Navy_Wrestling_Team.jpg), U.S. Navy photo by Photographer’s Mate 2nd Class Mahaya R. Jordan.. Public domain, Wikimedia Commons. `pose-commons-8193573`
- [A Bukharan dance performed by members of the Rina Nikova ballet in the citadel of Jerusalem - Restoration](https://commons.wikimedia.org/wiki/File:A_Bukharan_dance_performed_by_members_of_the_Rina_Nikova_ballet_in_the_citadel_of_Jerusalem_-_Restoration.jpg), Zoltan Kluger / Adam Cuerden. Public domain, Wikimedia Commons. `pose-commons-118416407`
- [Ballet-dancer 01](https://commons.wikimedia.org/wiki/File:Ballet-dancer_01.jpg), Stano Novak. CC BY 2.5, Wikimedia Commons. `pose-commons-1085617`
- [Beatrice Collenette, ballet dancer, Los Angeles, 1930s](https://commons.wikimedia.org/wiki/File:Beatrice_Collenette,_ballet_dancer,_Los_Angeles,_1930s.jpg), Los Angeles Times. CC BY 4.0, Wikimedia Commons. `pose-commons-137360736`
- [George Washington Smith, ballet dancer 02](https://commons.wikimedia.org/wiki/File:George_Washington_Smith,_ballet_dancer_02.png), Unknown author Unknown author. Public domain, Wikimedia Commons. `pose-commons-116214820`
- [No Known Restrictions Picking Cotton by Lewis W. Hine, 1916 LOC 491307954](https://commons.wikimedia.org/wiki/File:No_Known_Restrictions_Picking_Cotton_by_Lewis_W._Hine,_1916_LOC_491307954.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-3493932`
- [Lewis Hine, Archie Love, mill worker, 14 years old, Chester, South Carolina, 1908](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Archie_Love,_mill_worker,_14_years_old,_Chester,_South_Carolina,_1908.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11163529`
- [Lewis Hine, Ruth Rous, age 11 or less, cotton mill worker, Randleman, North Carolina, 1913](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Ruth_Rous,_age_11_or_less,_cotton_mill_worker,_Randleman,_North_Carolina,_1913.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11160886`
- [Lewis Hine Tri nytovaci](https://commons.wikimedia.org/wiki/File:Lewis_Hine_Tri_nytovaci.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-16557460`
- [Lewis Hine, George Barbee, 13 years old topping, Nicholas County, Kentucky, 1916](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_George_Barbee,_13_years_old_topping,_Nicholas_County,_Kentucky,_1916.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11158397`
- [Lewis Hine, Rosie Passeralla, age 5, berry picker, Browns Mills, New Jersey, 1910](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Rosie_Passeralla,_age_5,_berry_picker,_Browns_Mills,_New_Jersey,_1910.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11160667`
- [Lewis Hine, Vera Hill, 5 years old, cotton picker, Comanche County, Oklahoma, 1916](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Vera_Hill,_5_years_old,_cotton_picker,_Comanche_County,_Oklahoma,_1916.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11160161`
- [Lewis Hine, Ferris, 7 year old newsie, Mobile, Alabama, 1914](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Ferris,_7_year_old_newsie,_Mobile,_Alabama,_1914.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11159172`
- [Hine, Lewis, Adolescent Girl, a Spinner, in a Carolina Cotton Mill, 1908](https://commons.wikimedia.org/wiki/File:Hine,_Lewis,_Adolescent_Girl,_a_Spinner,_in_a_Carolina_Cotton_Mill,_1908.jpg), Lewis W. Hine , American, 1874–1940. Public domain, Wikimedia Commons. `pose-commons-43302515`
- [Addie Laird, 12 years old. Spinner in a Cotton Mill. Girls in mill say she is 10 years old. She admitted to me that...…](https://commons.wikimedia.org/wiki/File:Addie_Laird,_12_years_old._Spinner_in_a_Cotton_Mill._Girls_in_mill_say_she_is_10_years_old._She_admitted_to_me_that..._-_NARA_-_523249.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-16897764`
- [Child of white migrant worker in front of trailer home, Weslaco, Texas, 8a24960](https://commons.wikimedia.org/wiki/File:Child_of_white_migrant_worker_in_front_of_trailer_home,_Weslaco,_Texas,_8a24960.tif), Russell Lee. Public domain, Wikimedia Commons. `pose-commons-147499187`
- [Worker winding cotton thread onto large spools. Laurel cotton mills, Laurel, Mississippi](https://commons.wikimedia.org/wiki/File:Worker_winding_cotton_thread_onto_large_spools._Laurel_cotton_mills,_Laurel,_Mississippi.jpg), Russell Lee. Public domain, Wikimedia Commons. `pose-commons-29987376`
- [Nyssa, Oregon. Japanese-American farm worker digital file from original neg](https://commons.wikimedia.org/wiki/File:Nyssa,_Oregon._Japanese-American_farm_worker_digital_file_from_original_neg.jpg), Russell Lee. Public domain, Wikimedia Commons. `pose-commons-119454950`
- [Horseshoes](https://commons.wikimedia.org/wiki/File:Horseshoes.jpg), Russell Lee. Public domain, Wikimedia Commons. `pose-commons-6332005`
- [Bain News Service,, publisher. (2163487642)](https://commons.wikimedia.org/wiki/File:Bain_News_Service,,_publisher._(2163487642).jpg), The Library of Congress. Public domain, Wikimedia Commons. `pose-commons-53633207`
- [Blind athletes at Overbrook, Pa. LOC 2162649923](https://commons.wikimedia.org/wiki/File:Blind_athletes_at_Overbrook,_Pa._LOC_2162649923.jpg), The Library of Congress. Public domain, Wikimedia Commons. `pose-commons-53630274`
- [Evelyn (Nesbit) Thaw by Bain News Service, 1913](https://commons.wikimedia.org/wiki/File:Evelyn_(Nesbit)_Thaw_by_Bain_News_Service,_1913.jpg), Bain News Service. Public domain, Wikimedia Commons. `pose-commons-11159060`
- [Adeline Genee, toe dancer with partner LCCN2014684425](https://commons.wikimedia.org/wiki/File:Adeline_Genee,_toe_dancer_with_partner_LCCN2014684425.jpg), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-66863398`
- [Denishawn dancers LCCN2014715255](https://commons.wikimedia.org/wiki/File:Denishawn_dancers_LCCN2014715255.jpg), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67764994`
- ["Titania" - Overbrook (dancing) LCCN2014699367](https://commons.wikimedia.org/wiki/File:%22Titania%22_-_Overbrook_(dancing)_LCCN2014699367.tif), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67327335`
- [Geo. C. Laney, Chaney (i.e. George Henry Chaney, boxer LCCN2014698008](https://commons.wikimedia.org/wiki/File:Geo._C._Laney,_Chaney_(i.e._George_Henry_Chaney,_boxer_LCCN2014698008.tif), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67281550`
- [Boxer, Adolph) Wolgast LCCN2014691337](https://commons.wikimedia.org/wiki/File:Boxer,_Adolph)_Wolgast_LCCN2014691337.tif), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67051803`
- [Bobby Coltren (baseball player) LCCN2014690154](https://commons.wikimedia.org/wiki/File:Bobby_Coltren_(baseball_player)_LCCN2014690154.tif), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67015213`
- [Fielder Jones, manager and player, St. Louis Federal League (baseball) LCCN2014697494](https://commons.wikimedia.org/wiki/File:Fielder_Jones,_manager_and_player,_St._Louis_Federal_League_(baseball)_LCCN2014697494.jpg), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67266526`
- [Edward Victor Cicotte, baseball player for Chicago White Sox, throwing baseball LCCN89714182](https://commons.wikimedia.org/wiki/File:Edward_Victor_Cicotte,_baseball_player_for_Chicago_White_Sox,_throwing_baseball_LCCN89714182.jpg), George Grantham Bain Collection. Public domain, Wikimedia Commons. `pose-commons-67865540`
- [Autochrome Dance Genthe](https://commons.wikimedia.org/wiki/File:Autochrome_Dance_Genthe.jpg), Arnold Genthe. Public domain, Wikimedia Commons. `pose-commons-47601057`
- [Andrea Zamora by Arnold Genthe](https://commons.wikimedia.org/wiki/File:Andrea_Zamora_by_Arnold_Genthe.jpg), Arnold Genthe. Public domain, Wikimedia Commons. `pose-commons-37262477`
- [Anna Duncan dancing LOC agc 7a09879](https://commons.wikimedia.org/wiki/File:Anna_Duncan_dancing_LOC_agc_7a09879.jpg), Genthe, Arnold. Public domain, Wikimedia Commons. `pose-commons-76948919`
- [Ruth St. Denis Sun Genthe](https://commons.wikimedia.org/wiki/File:Ruth_St._Denis_Sun_Genthe.jpg), Arnold Genthe. Public domain, Wikimedia Commons. `pose-commons-37261959`
- [The Sword Dancer Genthe](https://commons.wikimedia.org/wiki/File:The_Sword_Dancer_Genthe.jpg), Arnold Genthe. Public domain, Wikimedia Commons. `pose-commons-47597497`
- [Elizabeth Duncan dancers LOC agc.7a09997](https://commons.wikimedia.org/wiki/File:Elizabeth_Duncan_dancers_LOC_agc.7a09997.jpg), Genthe, Arnold. Public domain, Wikimedia Commons. `pose-commons-68214754`
- [BLACK CONSTRUCTION WORKER IN SOUTH SIDE CHICAGO. SOME BLACKS CHARGE THAT AREAS OF THE NEW "LOOP" AND ON THE SOUTH... -…](https://commons.wikimedia.org/wiki/File:BLACK_CONSTRUCTION_WORKER_IN_SOUTH_SIDE_CHICAGO._SOME_BLACKS_CHARGE_THAT_AREAS_OF_THE_NEW_%22LOOP%22_AND_ON_THE_SOUTH..._-_NARA_-_556186.jpg), John H. White. Public domain, Wikimedia Commons. `pose-commons-16913970`
- [WORKER CARRIES SOUVENIR WASTE ROCK AT THE ANACONDA CO.'S TWIN BUTTES MINE - NARA - 544094](https://commons.wikimedia.org/wiki/File:WORKER_CARRIES_SOUVENIR_WASTE_ROCK_AT_THE_ANACONDA_CO.%27S_TWIN_BUTTES_MINE_-_NARA_-_544094.jpg), Cornelius M. Keyes. Public domain, Wikimedia Commons. `pose-commons-16931775`
- [WORKER IRRIGATES LAND WITH WATER FROM SAN MIGUEL RIVER - NARA - 543833](https://commons.wikimedia.org/wiki/File:WORKER_IRRIGATES_LAND_WITH_WATER_FROM_SAN_MIGUEL_RIVER_-_NARA_-_543833.jpg), Bill Gillette. Public domain, Wikimedia Commons. `pose-commons-16929431`
- [1912 Georg Åberg](https://commons.wikimedia.org/wiki/File:1912_Georg_%C3%85berg.JPG), photographer of IOC. Public domain, Wikimedia Commons. `pose-commons-5746461`
- [1912 Athletics men's 110 metre hurdles - Frederick Kelly](https://commons.wikimedia.org/wiki/File:1912_Athletics_men%27s_110_metre_hurdles_-_Frederick_Kelly.JPG), photographer of IOC. Public domain, Wikimedia Commons. `pose-commons-5065036`
- [1912 Athletics men's 1500 metre final2-2](https://commons.wikimedia.org/wiki/File:1912_Athletics_men%27s_1500_metre_final2-2.JPG), 1912_Athletics_men's_1500_metre_final2.JPG : unknown derivative work: MachoCari…. Public domain, Wikimedia Commons. `pose-commons-10577925`
- [Air Force’s Jalan Rivers competes in the high jump at the Air Force Twilight Open held at the Cadet Outdoor Track and F…](https://commons.wikimedia.org/wiki/File:Air_Force%E2%80%99s_Jalan_Rivers_competes_in_the_high_jump_at_the_Air_Force_Twilight_Open_held_at_the_Cadet_Outdoor_Track_and_Field_Complex_in_Colorado_Springs,_Colorado,_May_9,_2025.jpg), Adalyn Greene. Public domain, Wikimedia Commons. `pose-commons-165993723`
- [Air Force Track and Field Holiday Open (15962350969)](https://commons.wikimedia.org/wiki/File:Air_Force_Track_and_Field_Holiday_Open_(15962350969).jpg), US Air Force from USA. Public domain, Wikimedia Commons. `pose-commons-50893349`
- [Air Force Academy high jump](https://commons.wikimedia.org/wiki/File:Air_Force_Academy_high_jump.jpg), (U.S. Air Force photo/Staff Sgt. Larry E. Reid Jr.. Public domain, Wikimedia Commons. `pose-commons-26309062`
- [Warrior Games USMC Track and Field 130513-M-SO412-230](https://commons.wikimedia.org/wiki/File:Warrior_Games_USMC_Track_and_Field_130513-M-SO412-230.jpg), Lance Cpl. Sharon D. Kyle. Public domain, Wikimedia Commons. `pose-commons-38825155`
- ["Silver Flint" Frank Sylvester Flint, Catcher, Chicago, from the series Old Judge Cigarettes](https://www.metmuseum.org/art/collection/search/400161), Goodwin & Company. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-400161`
- [Light Artillery, Sergeant Major](https://www.metmuseum.org/art/collection/search/291653), Oliver H. Willard. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-291653`
- [Feeding Poor Puss](https://www.metmuseum.org/art/collection/search/287893), John Dillwyn Llewelyn. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-287893`
- [Javanese Women Preparing Rice](https://www.metmuseum.org/art/collection/search/264578), Unknown. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-264578`
- [\[Bugler\]](https://www.metmuseum.org/art/collection/search/269542), Unknown. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-269542`
- [Dancers, Pink and Green](https://www.metmuseum.org/art/collection/search/436140), Edgar Degas. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-436140`
- [Richard Humphreys, the Boxer](https://www.metmuseum.org/art/collection/search/436691), John Hoppner. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-436691`
- [Woman with a Rake](https://www.metmuseum.org/art/collection/search/437099), Jean-François Millet. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-437099`
- [The Spanish Singer](https://www.metmuseum.org/art/collection/search/436944), Edouard Manet. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-436944`
- [Lute Player](https://www.metmuseum.org/art/collection/search/439933), Valentin de Boulogne. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-439933`
- [Air](https://www.metmuseum.org/art/collection/search/203015), Jean-Pierre Defrance. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-203015`
- [Saint John the Baptist](https://www.metmuseum.org/art/collection/search/202718), Juan Martínez Montañés. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-202718`
- [The Blessed Catherine](https://www.metmuseum.org/art/collection/search/205122), Giacomo Serpotta. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-205122`
- [Artemisia in Mourning](https://www.metmuseum.org/art/collection/search/237794), Philipp Jakob Scheffauer. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-237794`
- [Dwarf as Mars (one of a pair)](https://www.metmuseum.org/art/collection/search/205649), Walter Pompe. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-205649`
- [Admiral de Tourville (1642–1701)](https://www.metmuseum.org/art/collection/search/207687), Joseph-Charles Marin. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-207687`
- [The Little Fourteen-Year-Old Dancer](https://www.metmuseum.org/art/collection/search/196439), Edgar Degas. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-196439`
- [A prophet](https://www.metmuseum.org/art/collection/search/194538), Tiziano Minio. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-194538`
- [Marquis de Lafayette](https://www.metmuseum.org/art/collection/search/207762), Aimé-Jules Dalou. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-207762`
- [Cavalier](https://www.metmuseum.org/art/collection/search/203985), Barthélemy Prieur. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-203985`
- [Minerva](https://www.metmuseum.org/art/collection/search/206339), Clodion (Claude Michel). CC0, The Metropolitan Museum of Art, Open Access. `pose-met-206339`
- [Saint Bernardino of Siena](https://www.metmuseum.org/art/collection/search/197461), Fulvio Signorini. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-197461`
- [Statuette of a man ?](https://www.metmuseum.org/art/collection/search/246307), Etruscan. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-246307`
- [Terracotta statuette of a woman](https://www.metmuseum.org/art/collection/search/248598), Greek, South Italian, Tarentine. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-248598`
- [Terracotta statuette of a girl dancing](https://www.metmuseum.org/art/collection/search/248609), Greek, South Italian, Tarentine. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-248609`
- [Terracotta statuette of a woman](https://www.metmuseum.org/art/collection/search/248608), Greek, South Italian, Tarentine. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-248608`
- [Terracotta statuette of a woman leaning on a pillar](https://www.metmuseum.org/art/collection/search/248613), Greek, South Italian, Tarentine. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-248613`
- [Terracotta statuette of a draped, standing woman](https://www.metmuseum.org/art/collection/search/247532), Greek, Boeotian. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-247532`
- [Terracotta statuette of a standing girl](https://www.metmuseum.org/art/collection/search/250741), Greek, probably Boeotian. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-250741`

### Hands and feet (0)


### Urban scenes (0)

<!-- photo-packs:end -->

## Software

three.js (MIT), Preact (MIT), idb (ISC), fflate (MIT). The paper textures and app icon are generated by `scripts/generate-assets.mjs`.
