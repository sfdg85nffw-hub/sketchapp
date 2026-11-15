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

### Poses (0)


### Hands and feet (0)


### Urban scenes (0)

<!-- photo-packs:end -->

## Software

three.js (MIT), Preact (MIT), idb (ISC), fflate (MIT). The paper textures and app icon are generated by `scripts/generate-assets.mjs`.
