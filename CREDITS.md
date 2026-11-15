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
### Faces (162)

- [Lange-MigrantMother02](https://commons.wikimedia.org/wiki/File:Lange-MigrantMother02.jpg), Dorothea Lange. Public domain, Wikimedia Commons. `face-commons-52734`
- [Staring child detail, from- Dorothea Lange, Children of Oklahoma drought refugee in migratory camp in California, 1936…](https://commons.wikimedia.org/wiki/File:Staring_child_detail,_from-_Dorothea_Lange,_Children_of_Oklahoma_drought_refugee_in_migratory_camp_in_California,_1936_(cropped).jpg), Dorothea Lange. Public domain, Wikimedia Commons. `face-commons-92108982`
- [Boy with freckles detail, from- Dorothea Lange, Children of Oklahoma drought refugee in migratory camp in California, 1…](https://commons.wikimedia.org/wiki/File:Boy_with_freckles_detail,_from-_Dorothea_Lange,_Children_of_Oklahoma_drought_refugee_in_migratory_camp_in_California,_1936_(cropped).jpg), Dorothea Lange. Public domain, Wikimedia Commons. `face-commons-92109040`
- [Strike leader in Kern County, California, 8b32699](https://commons.wikimedia.org/wiki/File:Strike_leader_in_Kern_County,_California,_8b32699.jpg), Dorothea Lange. Public domain, Wikimedia Commons. `face-commons-6293109`
- [Jack Delano by John Collier 1942](https://commons.wikimedia.org/wiki/File:Jack_Delano_by_John_Collier_1942_.jpg), John Collier for the Farm Security Administration ; Uploaded and retouched by J…. Public domain, Wikimedia Commons. `face-commons-33761718`
- [Jack Delano, FSA borrower, vicinity of Frederiksted, St. Croix, Virgin Islands, 1941](https://commons.wikimedia.org/wiki/File:Jack_Delano,_FSA_borrower,_vicinity_of_Frederiksted,_St._Croix,_Virgin_Islands,_1941.jpg), Jack Delano. Public domain, Wikimedia Commons. `face-commons-11158898`
- [Langston-delano1](https://commons.wikimedia.org/wiki/File:Langston-delano1.jpg), Jack Delano. Public domain, Wikimedia Commons. `face-commons-21284341`
- [Langston Hughes cph.3a43849](https://commons.wikimedia.org/wiki/File:Langston_Hughes_cph.3a43849.jpg), Jack Delano. Public domain, Wikimedia Commons. `face-commons-45049921`
- [PullmanPorter](https://commons.wikimedia.org/wiki/File:PullmanPorter.jpg), Jack Delano. Public domain, Wikimedia Commons. `face-commons-268174`
- [Gordon Parks, 1984 (cropped)](https://commons.wikimedia.org/wiki/File:Gordon_Parks,_1984_(cropped).jpg), Iris Schneider, Los Angeles Times. CC BY 4.0, Wikimedia Commons. `face-commons-197308370`
- [Portrait of Special Agent George G. Liddy (now known as G. Gordon Liddy). - NARA - 518189](https://commons.wikimedia.org/wiki/File:Portrait_of_Special_Agent_George_G._Liddy_(now_known_as_G._Gordon_Liddy)._-_NARA_-_518189.jpg), Unknown author Unknown author or not provided. Public domain, Wikimedia Commons. `face-commons-17033762`
- [Portrait of Dr. Charles Johnson, sociologist at Fisk University, Nashville, Tennessee](https://commons.wikimedia.org/wiki/File:Portrait_of_Dr._Charles_Johnson,_sociologist_at_Fisk_University,_Nashville,_Tennessee.tif), Gordon Parks. Public domain, Wikimedia Commons. `face-commons-165828566`
- [Edward Sheriff Curtis (1868-1952)](https://commons.wikimedia.org/wiki/File:Edward_Sheriff_Curtis_(1868-1952).jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-91955544`
- [A Jicarilla Man, 1904, Edward S. Curtis (sepia restored)](https://commons.wikimedia.org/wiki/File:A_Jicarilla_Man,_1904,_Edward_S._Curtis_(sepia_restored).jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-24787181`
- [Chief Joseph by Edward Sheriff Curtis](https://commons.wikimedia.org/wiki/File:Chief_Joseph_by_Edward_Sheriff_Curtis.jpg), Edward S. Curtis / Adam Cuerden. Public domain, Wikimedia Commons. `face-commons-145676694`
- [Edward S. Curtis, Navajo chief, 1904](https://commons.wikimedia.org/wiki/File:Edward_S._Curtis,_Navajo_chief,_1904.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-11158347`
- [Edward S. Curtis Collection People 100](https://commons.wikimedia.org/wiki/File:Edward_S._Curtis_Collection_People_100.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-95401`
- [Edward S. Curtis Collection People 062](https://commons.wikimedia.org/wiki/File:Edward_S._Curtis_Collection_People_062.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-33151`
- [Edward S. Curtis, Navajo child, 1904](https://commons.wikimedia.org/wiki/File:Edward_S._Curtis,_Navajo_child,_1904.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-11160157`
- [Edward S. Curtis Collection People 063](https://commons.wikimedia.org/wiki/File:Edward_S._Curtis_Collection_People_063.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-33152`
- [Edward S. Curtis Collection People 087](https://commons.wikimedia.org/wiki/File:Edward_S._Curtis_Collection_People_087.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-95387`
- [Edward S. Curtis Collection People 042](https://commons.wikimedia.org/wiki/File:Edward_S._Curtis_Collection_People_042.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-29015`
- [Pakit, Maricopa, by Edward S. Curtis, 1907](https://commons.wikimedia.org/wiki/File:Pakit,_Maricopa,_by_Edward_S._Curtis,_1907.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-11159890`
- [Acoma woman by Edward S. Curtis, 1905](https://commons.wikimedia.org/wiki/File:Acoma_woman_by_Edward_S._Curtis,_1905.jpg), Edward S. Curtis. Public domain, Wikimedia Commons. `face-commons-11160746`
- [Lewis Hine, Girl working in a cannery, 1911](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Girl_working_in_a_cannery,_1911.jpg), Lewis Hine. Public domain, Wikimedia Commons. `face-commons-11159139`
- [Lewis Hine, Young newsie, St. Louis, 1910](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Young_newsie,_St._Louis,_1910.jpg), Lewis Hine. Public domain, Wikimedia Commons. `face-commons-11158936`
- [Lewis Hine, Manager of the "Hotel de Bum", St. Louis, 1910](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Manager_of_the_%22Hotel_de_Bum%22,_St._Louis,_1910.jpg), Lewis Hine. Public domain, Wikimedia Commons. `face-commons-11158940`
- [Lucille Burroughs, daughter of a cotton sharecropper. Hale County, Alabama](https://commons.wikimedia.org/wiki/File:Lucille_Burroughs,_daughter_of_a_cotton_sharecropper._Hale_County,_Alabama.jpg), Walker Evans. Public domain, Wikimedia Commons. `face-commons-8311701`
- [Floyd Burroughs, cotton sharecropper. Hale County, Alabama LOC 3549662506](https://commons.wikimedia.org/wiki/File:Floyd_Burroughs,_cotton_sharecropper._Hale_County,_Alabama_LOC_3549662506.jpg), Walker Evans. Public domain, Wikimedia Commons. `face-commons-53649204`
- [Laura Minnie Lee Tengle](https://commons.wikimedia.org/wiki/File:Laura_Minnie_Lee_Tengle.jpg), Walker Evans. Public domain, Wikimedia Commons. `face-commons-8308169`
- [Allie Mae Burroughs](https://commons.wikimedia.org/wiki/File:Allie_Mae_Burroughs.jpg), Walker Evans. Public domain, Wikimedia Commons. `face-commons-2722054`
- [Prince John, Bain News Service (cropped)](https://commons.wikimedia.org/wiki/File:Prince_John,_Bain_News_Service_(cropped).jpg), Lafayette Ltd. Public domain, Wikimedia Commons. `face-commons-157474025`
- [August Anheuser Busch Sr. in 1925 - photo. by Bain News Service. LCCN91794596 (cropped)](https://commons.wikimedia.org/wiki/File:August_Anheuser_Busch_Sr._in_1925_-_photo._by_Bain_News_Service._LCCN91794596_(cropped).tiff), George Grantham Bain Collection. Public domain, Wikimedia Commons. `face-commons-105901567`
- [General Baden-Powell, Bain news service photo portrait (cropped)](https://commons.wikimedia.org/wiki/File:General_Baden-Powell,_Bain_news_service_photo_portrait_(cropped).jpg), James Russell & Sons [ 1 ]. Public domain, Wikimedia Commons. `face-commons-122066795`
- [Reed Smoot, bw photo portrait, Bain News Service](https://commons.wikimedia.org/wiki/File:Reed_Smoot,_bw_photo_portrait,_Bain_News_Service.jpg), Bain News Service. Public domain, Wikimedia Commons. `face-commons-6207173`
- [Tomáš Garrigue Masaryk, Bain News Service (Library of Congress, Bain Collection) crop](https://commons.wikimedia.org/wiki/File:Tom%C3%A1%C5%A1_Garrigue_Masaryk,_Bain_News_Service_(Library_of_Congress,_Bain_Collection)_crop.jpg), Unknown (publisher Bain News Service). Public domain, Wikimedia Commons. `face-commons-38052586`
- [Charles G. Darwin, Bain News Service photo portrait](https://commons.wikimedia.org/wiki/File:Charles_G._Darwin,_Bain_News_Service_photo_portrait.jpg), Bain News Service. Public domain, Wikimedia Commons. `face-commons-5734554`
- [Harris & Ewing - Helena Hill Weed](https://commons.wikimedia.org/wiki/File:Harris_%26_Ewing_-_Helena_Hill_Weed.jpg), Harris & Ewing / Adam Cuerden. Public domain, Wikimedia Commons. `face-commons-37875330`
- [John Howard Lawson Harris & Ewing Portrait](https://commons.wikimedia.org/wiki/File:John_Howard_Lawson_Harris_%26_Ewing_Portrait.jpg), Harris & Ewing. Public domain, Wikimedia Commons. `face-commons-174887081`
- [Thomas Woodrow Wilson, Harris & Ewing bw photo portrait, 1919 - black and white (cropped)](https://commons.wikimedia.org/wiki/File:Thomas_Woodrow_Wilson,_Harris_%26_Ewing_bw_photo_portrait,_1919_-_black_and_white_(cropped).jpg), Harris & Ewing. Public domain, Wikimedia Commons. `face-commons-103608229`
- [John Aspinwall Roosevelt Harris & Ewing Portrait 1954](https://commons.wikimedia.org/wiki/File:John_Aspinwall_Roosevelt_Harris_%26_Ewing_Portrait_1954.jpg), Harris & Ewing. Public domain, Wikimedia Commons. `face-commons-171075549`
- [Henry Stimson, Harris & Ewing bw photo portrait, 1929 (3x4 cropped)](https://commons.wikimedia.org/wiki/File:Henry_Stimson,_Harris_%26_Ewing_bw_photo_portrait,_1929_(3x4_cropped).jpg), Harris & Ewing. Public domain, Wikimedia Commons. `face-commons-160064332`
- [Robert M. La Follette Portrait by Harris & Ewing (3x4 cropped)](https://commons.wikimedia.org/wiki/File:Robert_M._La_Follette_Portrait_by_Harris_%26_Ewing_(3x4_cropped).jpg), Harris & Ewing Collection. Public domain, Wikimedia Commons. `face-commons-165310986`
- [Ishbel MacDonald 1927 by Harris & Ewing](https://commons.wikimedia.org/wiki/File:Ishbel_MacDonald_1927_by_Harris_%26_Ewing.jpg), Harris & Ewing. Public domain, Wikimedia Commons. `face-commons-178691356`
- [Senator Jim Justice Official Portrait (cropped)](https://commons.wikimedia.org/wiki/File:Senator_Jim_Justice_Official_Portrait_(cropped).jpg), U.S. Senate Photography Service. Public domain, Wikimedia Commons. `face-commons-160211349`
- [Senator Blunt Rochester Official Portrait (cropped)](https://commons.wikimedia.org/wiki/File:Senator_Blunt_Rochester_Official_Portrait_(cropped).jpg), United States Senate Photographic Studio. Public domain, Wikimedia Commons. `face-commons-162039124`
- [Senator Vance official portrait. 118th Congress (cropped)](https://commons.wikimedia.org/wiki/File:Senator_Vance_official_portrait._118th_Congress_(cropped).jpg), United States Congress. Public domain, Wikimedia Commons. `face-commons-128112259`
- [Senator John McCain official portrait 2006 3x4 crop](https://commons.wikimedia.org/wiki/File:Senator_John_McCain_official_portrait_2006_3x4_crop.jpg), Office of Senator John McCain. Public domain, Wikimedia Commons. `face-commons-202191135`
- [Congresswoman Waters official photo](https://commons.wikimedia.org/wiki/File:Congresswoman_Waters_official_photo.jpg), House of Representatives photographic studio. Public domain, Wikimedia Commons. `face-commons-61221347`
- [Congresswoman Sheila Cherfilus-McCormick Official Portrait (cropped)](https://commons.wikimedia.org/wiki/File:Congresswoman_Sheila_Cherfilus-McCormick_Official_Portrait_(cropped).jpg), Brian Thorpe, U.S. House Photography Service. Public domain, Wikimedia Commons. `face-commons-159583416`
- [Congresswoman Michelle Steel](https://commons.wikimedia.org/wiki/File:Congresswoman_Michelle_Steel.jpg), Justcommunicate. CC BY 4.0, Wikimedia Commons. `face-commons-131574762`
- [Congresswoman Sara Jacobs](https://commons.wikimedia.org/wiki/File:Congresswoman_Sara_Jacobs.jpg), House Creative Committee. Public domain, Wikimedia Commons. `face-commons-106666439`
- [Zoe Lofgren Official Portrait 2024 (cropped)](https://commons.wikimedia.org/wiki/File:Zoe_Lofgren_Official_Portrait_2024_(cropped).jpeg), Brian Thorpe, House Creative Services. Public domain, Wikimedia Commons. `face-commons-146214195`
- [Kalpana Chawla, NASA photo portrait in orange suit](https://commons.wikimedia.org/wiki/File:Kalpana_Chawla,_NASA_photo_portrait_in_orange_suit.jpg), NASA. Public domain, Wikimedia Commons. `face-commons-881913`
- [Chris Cassidy - Official NASA Astronaut Portrait in EMU (cropped)](https://commons.wikimedia.org/wiki/File:Chris_Cassidy_-_Official_NASA_Astronaut_Portrait_in_EMU_(cropped).jpg), Josh Valcarcel. Public domain, Wikimedia Commons. `face-commons-135864523`
- [Portrait of NASA astronaut Raja Chari in EMU](https://commons.wikimedia.org/wiki/File:Portrait_of_NASA_astronaut_Raja_Chari_in_EMU.jpg), James Blair. Public domain, Wikimedia Commons. `face-commons-120428990`
- [NASA Astronaut Christopher Williams (jsc2024e013691 alt)](https://commons.wikimedia.org/wiki/File:NASA_Astronaut_Christopher_Williams_(jsc2024e013691_alt).jpg), NASA Johnson Space Center / Josh Valcarcel – NASA – John. Public domain, Wikimedia Commons. `face-commons-163786748`
- [U.S. Air Force Airman 1st Class Alan Wright, a broadcaster with the 2nd Combat Camera Squadron, poses for a portrait at…](https://commons.wikimedia.org/wiki/File:U.S._Air_Force_Airman_1st_Class_Alan_Wright,_a_broadcaster_with_the_2nd_Combat_Camera_Squadron,_poses_for_a_portrait_at_Hill_Air_Force_Base,_Utah,_Oct._14,_2013,_during_combat_refresher_training,_which_was_131014-F-SP601-039.jpg), Amn Taylor Queen. Public domain, Wikimedia Commons. `face-commons-30795221`
- [Lieutenant Colonel (retired) James Harvey III, an original Tuskegee Airman at Nellis Air Force Base, Nevada on January…](https://commons.wikimedia.org/wiki/File:Lieutenant_Colonel_(retired)_James_Harvey_III,_an_original_Tuskegee_Airman_at_Nellis_Air_Force_Base,_Nevada_on_January_10,_2022_(cropped).jpg), Airman 1st Class Zachary Rufus. Public domain, Wikimedia Commons. `face-commons-179362639`
- [Air Force portrait of Major General Norris B. Harbold](https://commons.wikimedia.org/wiki/File:Air_Force_portrait_of_Major_General_Norris_B._Harbold.jpeg), United States Air Force. Public domain, Wikimedia Commons. `face-commons-176972326`
- [US Air Force JP wearing Pararescue beret](https://commons.wikimedia.org/wiki/File:US_Air_Force_JP_wearing_Pararescue_beret.png), U.S. Air Force. Public domain, Wikimedia Commons. `face-commons-93057379`
- [Senior Airman Ronisha Carter (2000497423)](https://commons.wikimedia.org/wiki/File:Senior_Airman_Ronisha_Carter_(2000497423).jpg), Unknown. Public domain, Wikimedia Commons. `face-commons-139759068`
- [Photographer Arthur Rothstein on L Street in Washington, D.C](https://commons.wikimedia.org/wiki/File:Photographer_Arthur_Rothstein_on_L_Street_in_Washington,_D.C.jpg), Russell Lee. Public domain, Wikimedia Commons. `face-commons-107021338`
- [George Washington Carver2](https://commons.wikimedia.org/wiki/File:George_Washington_Carver2.jpg), Arthur Rothstein. Public domain, Wikimedia Commons. `face-commons-5641446`
- [Little Norway Guide2](https://commons.wikimedia.org/wiki/File:Little_Norway_Guide2.jpg), Arthur Rothstein. Public domain, Wikimedia Commons. `face-commons-8136907`
- [George Washington Carver-crop](https://commons.wikimedia.org/wiki/File:George_Washington_Carver-crop.jpg), Arthur Rothstein. Public domain, Wikimedia Commons. `face-commons-9504959`
- [John Vachon 8c51722r](https://commons.wikimedia.org/wiki/File:John_Vachon_8c51722r.jpg), Unknown Unknown , Farm Security Administration. Public domain, Wikimedia Commons. `face-commons-2741196`
- [Face detail, Negro boy near Cincinnati, Ohio LCCN2017877922 (cropped)](https://commons.wikimedia.org/wiki/File:Face_detail,_Negro_boy_near_Cincinnati,_Ohio_LCCN2017877922_(cropped).tif), Vachon, John, 1914-1975, photographer. Public domain, Wikimedia Commons. `face-commons-81679923`
- [Howard P. Perry, the first African-American US Marine Corps recruit](https://commons.wikimedia.org/wiki/File:Howard_P._Perry,_the_first_African-American_US_Marine_Corps_recruit.jpg), Roger Smith Note: Erroneously credited to John Vachon by the Library of Congres…. Public domain, Wikimedia Commons. `face-commons-15362626`
- [Coal miner (Polish). Capels, West Virginia (detail of miner's cap)](https://commons.wikimedia.org/wiki/File:Coal_miner_(Polish)._Capels,_West_Virginia_(detail_of_miner%27s_cap).jpg), Marion Post Wolcott. Public domain, Wikimedia Commons. `face-commons-95584395`
- [Fiddlin Bill Henseley, Mountain Fiddler, Asheville, North Carolina by Ben Shahn, 1937 LOC 290626613](https://commons.wikimedia.org/wiki/File:Fiddlin_Bill_Henseley,_Mountain_Fiddler,_Asheville,_North_Carolina_by_Ben_Shahn,_1937_LOC_290626613.jpg), Shahn, Ben, 1898-1969, photographer. Farm Security Administration. Public domain, Wikimedia Commons. `face-commons-3325376`
- [Esther Bubley, A student at Woodrow Wilson High School, Washington DC, 1943](https://commons.wikimedia.org/wiki/File:Esther_Bubley,_A_student_at_Woodrow_Wilson_High_School,_Washington_DC,_1943.jpg), Esther Bubley. Public domain, Wikimedia Commons. `face-commons-11159480`
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

### Poses (141)

- [US Navy 060208-N-1577S-073 Information Systems Technician 2nd Class Triva Pino, left, assigned to the guided missile cr…](https://commons.wikimedia.org/wiki/File:US_Navy_060208-N-1577S-073_Information_Systems_Technician_2nd_Class_Triva_Pino,_left,_assigned_to_the_guided_missile_cruiser_USS_Port_Royal_(CG_73),_won_the_2006_U.S._Armed_Forces_Boxing_Championship.jpg), U.S. Navy photo. Public domain, Wikimedia Commons. `pose-commons-8230420`
- [US Air Force boxer Eleizar Rodriguez (Left) and US Army boxer Marshall Christmas square off in the ring during this yea…](https://commons.wikimedia.org/wiki/File:US_Air_Force_boxer_Eleizar_Rodriguez_(Left)_and_US_Army_boxer_Marshall_Christmas_square_off_in_the_ring_during_this_year%27s_Armed_Forces_Boxing_Competition_at_Fort_Huachuca,_Arizona,_-_DPLA_-_4fbc86c1ff180dc1bf8520cf27c3a700.jpeg), Department of Defense. American Forces Information Service. Defense Visual Info…. Public domain, Wikimedia Commons. `pose-commons-96603927`
- [US Air Force boxer Bobby DeLeon (Right) and US Army boxer Torrence Daniels square off in the ring at this year's Armed…](https://commons.wikimedia.org/wiki/File:US_Air_Force_boxer_Bobby_DeLeon_(Right)_and_US_Army_boxer_Torrence_Daniels_square_off_in_the_ring_at_this_year%27s_Armed_Forces_Boxing_Competition_in_Fort_Huachuca,_Arizona._DeLeon_an_-_DPLA_-_b81a1430a701a2654225d79bf3d5a66d.jpeg), Department of Defense. American Forces Information Service. Defense Visual Info…. Public domain, Wikimedia Commons. `pose-commons-96634807`
- [U.S. Army Spc. Zacchaeus Hardrick waits in the hall at the Chaparral Fitness Center for his elimination match during th…](https://commons.wikimedia.org/wiki/File:U.S._Army_Spc._Zacchaeus_Hardrick_waits_in_the_hall_at_the_Chaparral_Fitness_Center_for_his_elimination_match_during_the_2011_Armed_Forces_Boxing_Championship_held_at_Joint_Base_San_Antonio,_Texas,_Feb_110215-F-GW194-003.jpg), SRA Patrick Kilgore. Public domain, Wikimedia Commons. `pose-commons-25395529`
- [Athletics at the 2017 Warrior Games 34831042023 d4a5c9beab b](https://commons.wikimedia.org/wiki/File:Athletics_at_the_2017_Warrior_Games_34831042023_d4a5c9beab_b.jpg), Department of Defense Warrior Games. Public domain, Wikimedia Commons. `pose-commons-61397740`
- [Athletics at the 2017 Warrior Games 35298049990 8088f07a58 b](https://commons.wikimedia.org/wiki/File:Athletics_at_the_2017_Warrior_Games_35298049990_8088f07a58_b.jpg), Department of Defense Warrior Games. Public domain, Wikimedia Commons. `pose-commons-61397729`
- [Athletics at the 2017 Warrior Games 35469521132 dc843e90e2 b](https://commons.wikimedia.org/wiki/File:Athletics_at_the_2017_Warrior_Games_35469521132_dc843e90e2_b.jpg), Department of Defense Warrior Games. Public domain, Wikimedia Commons. `pose-commons-61397717`
- [Athletics at the 2017 Warrior Games 35645849976 99f67c7359 b](https://commons.wikimedia.org/wiki/File:Athletics_at_the_2017_Warrior_Games_35645849976_99f67c7359_b.jpg), Department of Defense Warrior Games. Public domain, Wikimedia Commons. `pose-commons-61397712`
- [Athletics at the 2017 Warrior Games 35250853410 a03c46b9da b](https://commons.wikimedia.org/wiki/File:Athletics_at_the_2017_Warrior_Games_35250853410_a03c46b9da_b.jpg), Department of Defense Warrior Games. Public domain, Wikimedia Commons. `pose-commons-61397738`
- [Athletics at the 2017 Warrior Games 35298053790 76feff3724 b](https://commons.wikimedia.org/wiki/File:Athletics_at_the_2017_Warrior_Games_35298053790_76feff3724_b.jpg), Department of Defense Warrior Games. Public domain, Wikimedia Commons. `pose-commons-61397719`
- [Women’s archery category in Warrior Games, 2015](https://commons.wikimedia.org/wiki/File:Women%E2%80%99s_archery_category_in_Warrior_Games,_2015.jpg), DoD News. Public domain, Wikimedia Commons. `pose-commons-130957652`
- [Archery at the 2017 Warrior Games 34896115063 2debd3340c b](https://commons.wikimedia.org/wiki/File:Archery_at_the_2017_Warrior_Games_34896115063_2debd3340c_b.jpg), Department of Defense Warrior Games. Public domain, Wikimedia Commons. `pose-commons-61418912`
- [Japanese Americans practicing judo, Portland Assembly Center cph.3c33813](https://commons.wikimedia.org/wiki/File:Japanese_Americans_practicing_judo,_Portland_Assembly_Center_cph.3c33813.jpg), U.S. Signal Corps. Public domain, Wikimedia Commons. `pose-commons-24742153`
- [Rangers in Action 10-African Land Forces Summit-US Army Africa-13 MAY 2010](https://commons.wikimedia.org/wiki/File:Rangers_in_Action_10-African_Land_Forces_Summit-US_Army_Africa-13_MAY_2010.jpg), US Army Africa. CC BY 2.0, Wikimedia Commons. `pose-commons-21283661`
- [Rangers in Action 11-African Land Forces Summit-US Army Africa-13 MAY 2010](https://commons.wikimedia.org/wiki/File:Rangers_in_Action_11-African_Land_Forces_Summit-US_Army_Africa-13_MAY_2010.jpg), US Army Africa. CC BY 2.0, Wikimedia Commons. `pose-commons-21284622`
- [Rangers in Action 05-African Land Forces Summit-US Army Africa-13 MAY 2010](https://commons.wikimedia.org/wiki/File:Rangers_in_Action_05-African_Land_Forces_Summit-US_Army_Africa-13_MAY_2010.jpg), US Army Africa. CC BY 2.0, Wikimedia Commons. `pose-commons-21281403`
- [Rangers in Action 21-African Land Forces Summit-US Army Africa-13 MAY 2010](https://commons.wikimedia.org/wiki/File:Rangers_in_Action_21-African_Land_Forces_Summit-US_Army_Africa-13_MAY_2010.jpg), US Army Africa. CC BY 2.0, Wikimedia Commons. `pose-commons-21285212`
- [Rangers in Action 06-African Land Forces Summit-US Army Africa-13 MAY 2010](https://commons.wikimedia.org/wiki/File:Rangers_in_Action_06-African_Land_Forces_Summit-US_Army_Africa-13_MAY_2010.jpg), US Army Africa. CC BY 2.0, Wikimedia Commons. `pose-commons-21281784`
- [Rangers in Action 20-African Land Forces Summit-US Army Africa-13 MAY 2010](https://commons.wikimedia.org/wiki/File:Rangers_in_Action_20-African_Land_Forces_Summit-US_Army_Africa-13_MAY_2010.jpg), US Army Africa. CC BY 2.0, Wikimedia Commons. `pose-commons-21285158`
- [Charlie Miles competing still rings for Air Force Falcons men's gymnastics during home meet on February 8, 2025 at Cade…](https://commons.wikimedia.org/wiki/File:Charlie_Miles_competing_still_rings_for_Air_Force_Falcons_men%27s_gymnastics_during_home_meet_on_February_8,_2025_at_Cadet_Arena_in_Colorado_Springs_(54324323970).jpg), Air Force photos by Ray Bahner & Adalyn Greene. Public domain, Wikimedia Commons. `pose-commons-164895058`
- [Charlie Miles after competing on still rings for Air Force Falcons men's gymnastics during home meet on Feb. 8, 2025 (5…](https://commons.wikimedia.org/wiki/File:Charlie_Miles_after_competing_on_still_rings_for_Air_Force_Falcons_men%27s_gymnastics_during_home_meet_on_Feb._8,_2025_(54323912796).jpg), Air Force photos by Ray Bahner & Adalyn Greene. Public domain, Wikimedia Commons. `pose-commons-164895040`
- [Air Force Falcons men's gymnastics Feb. 8, 2025 home meet against California Golden Bears —4143799 o](https://commons.wikimedia.org/wiki/File:Air_Force_Falcons_men%27s_gymnastics_Feb._8,_2025_home_meet_against_California_Golden_Bears_%E2%80%944143799_o.jpg), Air Force photos by Ray Bahner & Adalyn Greene. Public domain, Wikimedia Commons. `pose-commons-164894597`
- [Air Force Falcons men's gymnastics Feb. 8, 2025 home meet against California Golden Bears —4323795 o](https://commons.wikimedia.org/wiki/File:Air_Force_Falcons_men%27s_gymnastics_Feb._8,_2025_home_meet_against_California_Golden_Bears_%E2%80%944323795_o.jpg), Air Force photos by Ray Bahner & Adalyn Greene. Public domain, Wikimedia Commons. `pose-commons-164894635`
- [U.S. Navy Armed Forces Wrestling Championship held at Archbishop Rummel High School, New Orleans 2004](https://commons.wikimedia.org/wiki/File:U.S._Navy_Armed_Forces_Wrestling_Championship_held_at_Archbishop_Rummel_High_School,_New_Orleans_2004.jpg), U.S. Marine Corps photo by Lance Cpl. Lydia L. Collison.. Public domain, Wikimedia Commons. `pose-commons-8207805`
- [Soldiers compete in 2016 U.S. Olympic Wrestling Trials (160410-N-DD899-009) (cropped)](https://commons.wikimedia.org/wiki/File:Soldiers_compete_in_2016_U.S._Olympic_Wrestling_Trials_(160410-N-DD899-009)_(cropped).jpg), Mass Communication Specialist 1st Class Sharay Bennett. Public domain, Wikimedia Commons. `pose-commons-184582635`
- [US Navy 030816-N-9176J-001 Steelworker Constructionman Joseph M. Axiotis, from Daytona Beach, Fla., trains for the All-…](https://commons.wikimedia.org/wiki/File:US_Navy_030816-N-9176J-001_Steelworker_Constructionman_Joseph_M._Axiotis,_from_Daytona_Beach,_Fla.,_trains_for_the_All-Navy_Wrestling_Team.jpg), U.S. Navy photo by Photographer’s Mate 2nd Class Mahaya R. Jordan.. Public domain, Wikimedia Commons. `pose-commons-8193573`
- [US Navy 030816-N-9176J-010 Steelworker Constructionman Joseph M. Axiotis, from Daytona Beach, Fla., trains for the All-…](https://commons.wikimedia.org/wiki/File:US_Navy_030816-N-9176J-010_Steelworker_Constructionman_Joseph_M._Axiotis,_from_Daytona_Beach,_Fla.,_trains_for_the_All-Navy_Wrestling_Team.jpg), U.S. Navy photo by Photographer’s Mate 2nd Class Mahaya R. Jordan.. Public domain, Wikimedia Commons. `pose-commons-8193595`
- [Flickr - Official U.S. Navy Imagery - Ultimate Fighting Championship (UFC) fighter Keith Jardine demonstrates grappling…](https://commons.wikimedia.org/wiki/File:Flickr_-_Official_U.S._Navy_Imagery_-_Ultimate_Fighting_Championship_(UFC)_fighter_Keith_Jardine_demonstrates_grappling_moves_during_an_exhibition_in_the_hangar_bay._(1).jpg), Official Navy Page from United States of America Mass Communication Specialist…. Public domain, Wikimedia Commons. `pose-commons-22668027`
- [Don Quijote de la Mancha en el Teatro Teresa Carreño, Caracas, Venezuela 3](https://commons.wikimedia.org/wiki/File:Don_Quijote_de_la_Mancha_en_el_Teatro_Teresa_Carre%C3%B1o,_Caracas,_Venezuela_3.jpg), Theatrical Artwork by Laura Fiorucci . Picture by Wilfredor. CC0, Wikimedia Commons. `pose-commons-29424506`
- [A Bukharan dance performed by members of the Rina Nikova ballet in the citadel of Jerusalem - Restoration](https://commons.wikimedia.org/wiki/File:A_Bukharan_dance_performed_by_members_of_the_Rina_Nikova_ballet_in_the_citadel_of_Jerusalem_-_Restoration.jpg), Zoltan Kluger / Adam Cuerden. Public domain, Wikimedia Commons. `pose-commons-118416407`
- [Ballet-dancer 01](https://commons.wikimedia.org/wiki/File:Ballet-dancer_01.jpg), Stano Novak. CC BY 2.5, Wikimedia Commons. `pose-commons-1085617`
- [Ballet dancers by Gustav Borgen NFB-33178](https://commons.wikimedia.org/wiki/File:Ballet_dancers_by_Gustav_Borgen_NFB-33178.jpg), Gustav Borgen. Public domain, Wikimedia Commons. `pose-commons-19085501`
- [Beatrice Collenette, ballet dancer, Los Angeles, 1930s](https://commons.wikimedia.org/wiki/File:Beatrice_Collenette,_ballet_dancer,_Los_Angeles,_1930s.jpg), Los Angeles Times. CC BY 4.0, Wikimedia Commons. `pose-commons-137360736`
- [George Washington Smith, ballet dancer 02](https://commons.wikimedia.org/wiki/File:George_Washington_Smith,_ballet_dancer_02.png), Unknown author Unknown author. Public domain, Wikimedia Commons. `pose-commons-116214820`
- [George Washington Smith, ballet dancer 03](https://commons.wikimedia.org/wiki/File:George_Washington_Smith,_ballet_dancer_03.png), Unknown author Unknown author. Public domain, Wikimedia Commons. `pose-commons-116214821`
- [Poschitzkaia, ballet dancer (SAYRE 8424)](https://commons.wikimedia.org/wiki/File:Poschitzkaia,_ballet_dancer_(SAYRE_8424).jpg), Unknown author Unknown author. Public domain, Wikimedia Commons. `pose-commons-80630417`
- [Public Domain Old-Timer Structural-Worker By Lewis Hine, 1930 (WPA NARA) (275003395)](https://commons.wikimedia.org/wiki/File:Public_Domain_Old-Timer_Structural-Worker_By_Lewis_Hine,_1930_(WPA_NARA)_(275003395).jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-97465039`
- [No Known Restrictions Picking Cotton by Lewis W. Hine, 1916 LOC 491307954](https://commons.wikimedia.org/wiki/File:No_Known_Restrictions_Picking_Cotton_by_Lewis_W._Hine,_1916_LOC_491307954.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-3493932`
- [Lewis Hine, Archie Love, mill worker, 14 years old, Chester, South Carolina, 1908](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Archie_Love,_mill_worker,_14_years_old,_Chester,_South_Carolina,_1908.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11163529`
- [Lewis Hine, Ruth Rous, age 11 or less, cotton mill worker, Randleman, North Carolina, 1913](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Ruth_Rous,_age_11_or_less,_cotton_mill_worker,_Randleman,_North_Carolina,_1913.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11160886`
- [Lewis Hine Tri nytovaci](https://commons.wikimedia.org/wiki/File:Lewis_Hine_Tri_nytovaci.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-16557460`
- [Lewis Hine, George Barbee, 13 years old topping, Nicholas County, Kentucky, 1916](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_George_Barbee,_13_years_old_topping,_Nicholas_County,_Kentucky,_1916.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11158397`
- [Lewis Hine, Rosie Passeralla, age 5, berry picker, Browns Mills, New Jersey, 1910](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Rosie_Passeralla,_age_5,_berry_picker,_Browns_Mills,_New_Jersey,_1910.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11160667`
- [Lewis Hine, Vera Hill, 5 years old, cotton picker, Comanche County, Oklahoma, 1916](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Vera_Hill,_5_years_old,_cotton_picker,_Comanche_County,_Oklahoma,_1916.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11160161`
- [Lewis Hine, Simon Mellitto, age 10, newsboy, Philadelphia, 1910](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Simon_Mellitto,_age_10,_newsboy,_Philadelphia,_1910.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11161236`
- [Lewis W. Hine (American - Self-Portrait with Newsboy - Google Art Project](https://commons.wikimedia.org/wiki/File:Lewis_W._Hine_(American_-_Self-Portrait_with_Newsboy_-_Google_Art_Project.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-22178764`
- [Lewis Hine, Luigi, 6 years old, newsboy-beggar, Sacramento, California, 1915](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Luigi,_6_years_old,_newsboy-beggar,_Sacramento,_California,_1915.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11159267`
- [Lewis Hine, Willie Cohen and Max Rafalovizht, 8 years of age, newsboys, Philadelphia, 1910 (cropped)](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Willie_Cohen_and_Max_Rafalovizht,_8_years_of_age,_newsboys,_Philadelphia,_1910_(cropped).jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-44700451`
- [Lewis Hine, Ferris, 7 year old newsie, Mobile, Alabama, 1914](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Ferris,_7_year_old_newsie,_Mobile,_Alabama,_1914.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-11159172`
- [Hine, Lewis, Adolescent Girl, a Spinner, in a Carolina Cotton Mill, 1908](https://commons.wikimedia.org/wiki/File:Hine,_Lewis,_Adolescent_Girl,_a_Spinner,_in_a_Carolina_Cotton_Mill,_1908.jpg), Lewis W. Hine , American, 1874–1940. Public domain, Wikimedia Commons. `pose-commons-43302515`
- [Lewis Hine - Addie Card, 12 years. Spinner in North Pownal Cotton Mill MET DP262027](https://commons.wikimedia.org/wiki/File:Lewis_Hine_-_Addie_Card,_12_years._Spinner_in_North_Pownal_Cotton_Mill_MET_DP262027.jpg), Lewis Hine. CC0, Wikimedia Commons. `pose-commons-60504304`
- [Addie Laird, 12 years old. Spinner in a Cotton Mill. Girls in mill say she is 10 years old. She admitted to me that...…](https://commons.wikimedia.org/wiki/File:Addie_Laird,_12_years_old._Spinner_in_a_Cotton_Mill._Girls_in_mill_say_she_is_10_years_old._She_admitted_to_me_that..._-_NARA_-_523249.jpg), Lewis Hine. Public domain, Wikimedia Commons. `pose-commons-16897764`
- [A worker in the roundhouse at the C & NW RR1a34598v](https://commons.wikimedia.org/wiki/File:A_worker_in_the_roundhouse_at_the_C_%26_NW_RR1a34598v.jpg), Jack Delano. Public domain, Wikimedia Commons. `pose-commons-31104592`
- [Sugarcane Worker in Puerto Rico](https://commons.wikimedia.org/wiki/File:Sugarcane_Worker_in_Puerto_Rico.jpg), Jack Delano. Public domain, Wikimedia Commons. `pose-commons-46894922`
- [Son of white migrant worker putting on overalls 8b37248v](https://commons.wikimedia.org/wiki/File:Son_of_white_migrant_worker_putting_on_overalls_8b37248v.jpg), Russell Lee. Public domain, Wikimedia Commons. `pose-commons-39749201`
- [Child of white migrant worker in front of trailer home, Weslaco, Texas, 8a24960](https://commons.wikimedia.org/wiki/File:Child_of_white_migrant_worker_in_front_of_trailer_home,_Weslaco,_Texas,_8a24960.tif), Russell Lee. Public domain, Wikimedia Commons. `pose-commons-147499187`
- [Worker winding cotton thread onto large spools. Laurel cotton mills, Laurel, Mississippi](https://commons.wikimedia.org/wiki/File:Worker_winding_cotton_thread_onto_large_spools._Laurel_cotton_mills,_Laurel,_Mississippi.jpg), Russell Lee. Public domain, Wikimedia Commons. `pose-commons-29987376`
- [Child of white migrant worker ironing in camp near Harlingen, Texas LCCN2017739038](https://commons.wikimedia.org/wiki/File:Child_of_white_migrant_worker_ironing_in_camp_near_Harlingen,_Texas_LCCN2017739038.tif), Russell Lee. Public domain, Wikimedia Commons. `pose-commons-93231722`
- [Nyssa, Oregon. Japanese-American farm worker digital file from original neg](https://commons.wikimedia.org/wiki/File:Nyssa,_Oregon._Japanese-American_farm_worker_digital_file_from_original_neg.jpg), Russell Lee. Public domain, Wikimedia Commons. `pose-commons-119454950`
- [Horseshoes](https://commons.wikimedia.org/wiki/File:Horseshoes.jpg), Russell Lee. Public domain, Wikimedia Commons. `pose-commons-6332005`
- [Migrant white mother washing clothes in front of tent home. Weslaco, Texas. See general caption LCCN2017782068](https://commons.wikimedia.org/wiki/File:Migrant_white_mother_washing_clothes_in_front_of_tent_home._Weslaco,_Texas._See_general_caption_LCCN2017782068.tif), Russell Lee. Public domain, Wikimedia Commons. `pose-commons-93232520`
- [White woman, migratory berry picker, doing the laundry near Ponchatoula, Louisiana LCCN2017782830](https://commons.wikimedia.org/wiki/File:White_woman,_migratory_berry_picker,_doing_the_laundry_near_Ponchatoula,_Louisiana_LCCN2017782830.tif), Russell Lee. Public domain, Wikimedia Commons. `pose-commons-93232592`
- [A.B. Shaw, athlete, Dartmouth LCCN2014680907](https://commons.wikimedia.org/wiki/File:A.B._Shaw,_athlete,_Dartmouth_LCCN2014680907.tif), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-66745938`
- [Bain News Service,, publisher. (2163487642)](https://commons.wikimedia.org/wiki/File:Bain_News_Service,,_publisher._(2163487642).jpg), The Library of Congress. Public domain, Wikimedia Commons. `pose-commons-53633207`
- [Blind athletes at Overbrook, Pa. LOC 2162649923](https://commons.wikimedia.org/wiki/File:Blind_athletes_at_Overbrook,_Pa._LOC_2162649923.jpg), The Library of Congress. Public domain, Wikimedia Commons. `pose-commons-53630274`
- [Evelyn (Nesbit) Thaw by Bain News Service, 1913](https://commons.wikimedia.org/wiki/File:Evelyn_(Nesbit)_Thaw_by_Bain_News_Service,_1913.jpg), Bain News Service. Public domain, Wikimedia Commons. `pose-commons-11159060`
- [Adeline Genee, toe dancer with partner LCCN2014684425](https://commons.wikimedia.org/wiki/File:Adeline_Genee,_toe_dancer_with_partner_LCCN2014684425.jpg), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-66863398`
- [Denishawn dancers LCCN2014715255](https://commons.wikimedia.org/wiki/File:Denishawn_dancers_LCCN2014715255.jpg), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67764994`
- ["Titania" - Overbrook (dancing) LCCN2014699367](https://commons.wikimedia.org/wiki/File:%22Titania%22_-_Overbrook_(dancing)_LCCN2014699367.tif), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67327335`
- [Albertina Rasch, gypsy dance, 1915](https://commons.wikimedia.org/wiki/File:Albertina_Rasch,_gypsy_dance,_1915.png), Bain Collection. Public domain, Wikimedia Commons. `pose-commons-4408147`
- [Olive Craddock (1894 - July 15, 1926) was a dancer under the name Roshanara. Image circa 1915](https://commons.wikimedia.org/wiki/File:Olive_Craddock_(1894_-_July_15,_1926)_was_a_dancer_under_the_name_Roshanara._Image_circa_1915.jpg), Bain. Public domain, Wikimedia Commons. `pose-commons-40774807`
- [Boxer George Robinson LCCN2014691254](https://commons.wikimedia.org/wiki/File:Boxer_George_Robinson_LCCN2014691254.jpg), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67048087`
- [Harry Tracy (boxer) LCCN2014703517](https://commons.wikimedia.org/wiki/File:Harry_Tracy_(boxer)_LCCN2014703517.jpg), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67431041`
- [Geo. C. Laney, Chaney (i.e. George Henry Chaney, boxer LCCN2014698008](https://commons.wikimedia.org/wiki/File:Geo._C._Laney,_Chaney_(i.e._George_Henry_Chaney,_boxer_LCCN2014698008.tif), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67281550`
- [Boxer, Adolph) Wolgast LCCN2014691337](https://commons.wikimedia.org/wiki/File:Boxer,_Adolph)_Wolgast_LCCN2014691337.tif), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67051803`
- [Al Palzer, boxer LCCN2014690639](https://commons.wikimedia.org/wiki/File:Al_Palzer,_boxer_LCCN2014690639.jpg), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67031288`
- [Boxer, Adolph) Wolgast LCCN2014691337](https://commons.wikimedia.org/wiki/File:Boxer,_Adolph)_Wolgast_LCCN2014691337.jpg), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67051761`
- [Bobby Coltren (baseball player) LCCN2014690154](https://commons.wikimedia.org/wiki/File:Bobby_Coltren_(baseball_player)_LCCN2014690154.jpg), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67015123`
- [William Lawrence James, Boston NL baseball player, throwing ball on baseball field LCCN95505742](https://commons.wikimedia.org/wiki/File:William_Lawrence_James,_Boston_NL_baseball_player,_throwing_ball_on_baseball_field_LCCN95505742.jpg), George Grantham Bain Collection. Public domain, Wikimedia Commons. `pose-commons-67876251`
- [Bobby Coltren (baseball player) LCCN2014690154](https://commons.wikimedia.org/wiki/File:Bobby_Coltren_(baseball_player)_LCCN2014690154.tif), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67015213`
- [Fielder Jones, manager and player, St. Louis Federal League (baseball) LCCN2014697494](https://commons.wikimedia.org/wiki/File:Fielder_Jones,_manager_and_player,_St._Louis_Federal_League_(baseball)_LCCN2014697494.jpg), Bain News Service, publisher. Public domain, Wikimedia Commons. `pose-commons-67266526`
- [Dode Paskert, baseball player for the Philadelphia Phillies, throwing baseball LCCN89714180](https://commons.wikimedia.org/wiki/File:Dode_Paskert,_baseball_player_for_the_Philadelphia_Phillies,_throwing_baseball_LCCN89714180.jpg), George Grantham Bain Collection. Public domain, Wikimedia Commons. `pose-commons-67865463`
- [Edward Victor Cicotte, baseball player for Chicago White Sox, throwing baseball LCCN89714182](https://commons.wikimedia.org/wiki/File:Edward_Victor_Cicotte,_baseball_player_for_Chicago_White_Sox,_throwing_baseball_LCCN89714182.jpg), George Grantham Bain Collection. Public domain, Wikimedia Commons. `pose-commons-67865540`
- [Autochrome Dance Genthe](https://commons.wikimedia.org/wiki/File:Autochrome_Dance_Genthe.jpg), Arnold Genthe. Public domain, Wikimedia Commons. `pose-commons-47601057`
- [BooAutochrome Book of Dance Genthe](https://commons.wikimedia.org/wiki/File:BooAutochrome_Book_of_Dance_Genthe.jpg), Arnold Genthe. Public domain, Wikimedia Commons. `pose-commons-47601146`
- [Ruth St. Denis Spear dance Genthe](https://commons.wikimedia.org/wiki/File:Ruth_St._Denis_Spear_dance_Genthe.jpg), Arnold Genthe. Public domain, Wikimedia Commons. `pose-commons-37261609`
- [Ruth St Denis Oriental Dance Genthe](https://commons.wikimedia.org/wiki/File:Ruth_St_Denis_Oriental_Dance_Genthe.jpg), Arnold Genthe. Public domain, Wikimedia Commons. `pose-commons-37233035`
- [Andrea Zamora by Arnold Genthe](https://commons.wikimedia.org/wiki/File:Andrea_Zamora_by_Arnold_Genthe.jpg), Arnold Genthe. Public domain, Wikimedia Commons. `pose-commons-37262477`
- [Anna Duncan dancing LOC agc 7a09879](https://commons.wikimedia.org/wiki/File:Anna_Duncan_dancing_LOC_agc_7a09879.jpg), Genthe, Arnold. Public domain, Wikimedia Commons. `pose-commons-76948919`
- [Ruth St. Denis Sun Genthe](https://commons.wikimedia.org/wiki/File:Ruth_St._Denis_Sun_Genthe.jpg), Arnold Genthe. Public domain, Wikimedia Commons. `pose-commons-37261959`
- [The Sword Dancer Genthe](https://commons.wikimedia.org/wiki/File:The_Sword_Dancer_Genthe.jpg), Arnold Genthe. Public domain, Wikimedia Commons. `pose-commons-47597497`
- [Elizabeth Duncan dancers LOC agc.7a09997](https://commons.wikimedia.org/wiki/File:Elizabeth_Duncan_dancers_LOC_agc.7a09997.jpg), Genthe, Arnold. Public domain, Wikimedia Commons. `pose-commons-68214754`
- [BLACK CONSTRUCTION WORKER IN SOUTH SIDE CHICAGO. SOME BLACKS CHARGE THAT AREAS OF THE NEW "LOOP" AND ON THE SOUTH... -…](https://commons.wikimedia.org/wiki/File:BLACK_CONSTRUCTION_WORKER_IN_SOUTH_SIDE_CHICAGO._SOME_BLACKS_CHARGE_THAT_AREAS_OF_THE_NEW_%22LOOP%22_AND_ON_THE_SOUTH..._-_NARA_-_556186.jpg), John H. White. Public domain, Wikimedia Commons. `pose-commons-16913970`
- [WORKER CARRIES SOUVENIR WASTE ROCK AT THE ANACONDA CO.'S TWIN BUTTES MINE - NARA - 544094](https://commons.wikimedia.org/wiki/File:WORKER_CARRIES_SOUVENIR_WASTE_ROCK_AT_THE_ANACONDA_CO.%27S_TWIN_BUTTES_MINE_-_NARA_-_544094.jpg), Cornelius M. Keyes. Public domain, Wikimedia Commons. `pose-commons-16931775`
- [FEMALE ROAD WORKER DIRECTS TRAFFIC DURING REPAIRS ON THE OVERSEAS HIGHWAY LEADING TO KEY WEST - NARA - 548693](https://commons.wikimedia.org/wiki/File:FEMALE_ROAD_WORKER_DIRECTS_TRAFFIC_DURING_REPAIRS_ON_THE_OVERSEAS_HIGHWAY_LEADING_TO_KEY_WEST_-_NARA_-_548693.jpg), Flip Schulke. Public domain, Wikimedia Commons. `pose-commons-17087061`
- [IN LETTUCE FIELDS ALONG THE COLORADO RIVER, MEXICAN FARM WORKER CARRIES BOXES TO FIELD PICKERS - NARA - 549084](https://commons.wikimedia.org/wiki/File:IN_LETTUCE_FIELDS_ALONG_THE_COLORADO_RIVER,_MEXICAN_FARM_WORKER_CARRIES_BOXES_TO_FIELD_PICKERS_-_NARA_-_549084.jpg), Charles O'Rear. Public domain, Wikimedia Commons. `pose-commons-17089465`
- [WORKER FROM MEXICO AT A CEDAR MILL NEAR LEAKEY, TEXAS, NEAR SAN ANTONIO - NARA - 554855](https://commons.wikimedia.org/wiki/File:WORKER_FROM_MEXICO_AT_A_CEDAR_MILL_NEAR_LEAKEY,_TEXAS,_NEAR_SAN_ANTONIO_-_NARA_-_554855.jpg), Marc St. Gil. Public domain, Wikimedia Commons. `pose-commons-17120953`
- [WORKER IRRIGATES FIELD WITH WATER FROM THE SAN MIGUEL RIVER - NARA - 543781](https://commons.wikimedia.org/wiki/File:WORKER_IRRIGATES_FIELD_WITH_WATER_FROM_THE_SAN_MIGUEL_RIVER_-_NARA_-_543781.jpg), Bill Gillette. Public domain, Wikimedia Commons. `pose-commons-16929086`
- [WORKER IRRIGATES LAND WITH WATER FROM SAN MIGUEL RIVER - NARA - 543833](https://commons.wikimedia.org/wiki/File:WORKER_IRRIGATES_LAND_WITH_WATER_FROM_SAN_MIGUEL_RIVER_-_NARA_-_543833.jpg), Bill Gillette. Public domain, Wikimedia Commons. `pose-commons-16929431`
- [1912 Georg Åberg](https://commons.wikimedia.org/wiki/File:1912_Georg_%C3%85berg.JPG), photographer of IOC. Public domain, Wikimedia Commons. `pose-commons-5746461`
- [1912 Gustaf Lindblom2](https://commons.wikimedia.org/wiki/File:1912_Gustaf_Lindblom2.JPG), photographer of IOC. Public domain, Wikimedia Commons. `pose-commons-5746561`
- [1912 Frank Nelson](https://commons.wikimedia.org/wiki/File:1912_Frank_Nelson.JPG), photographer of IOC. Public domain, Wikimedia Commons. `pose-commons-5746670`
- [1912 Benjamin Adams](https://commons.wikimedia.org/wiki/File:1912_Benjamin_Adams.JPG), photographer of IOC. Public domain, Wikimedia Commons. `pose-commons-5746506`
- [1912 Athletics men's 110 metre hurdles - Frederick Kelly](https://commons.wikimedia.org/wiki/File:1912_Athletics_men%27s_110_metre_hurdles_-_Frederick_Kelly.JPG), photographer of IOC. Public domain, Wikimedia Commons. `pose-commons-5065036`
- [1912 Athletics men's 1500 metre final2-2](https://commons.wikimedia.org/wiki/File:1912_Athletics_men%27s_1500_metre_final2-2.JPG), 1912_Athletics_men's_1500_metre_final2.JPG : unknown derivative work: MachoCari…. Public domain, Wikimedia Commons. `pose-commons-10577925`
- [Air Force’s Jalan Rivers competes in the high jump at the Air Force Twilight Open held at the Cadet Outdoor Track and F…](https://commons.wikimedia.org/wiki/File:Air_Force%E2%80%99s_Jalan_Rivers_competes_in_the_high_jump_at_the_Air_Force_Twilight_Open_held_at_the_Cadet_Outdoor_Track_and_Field_Complex_in_Colorado_Springs,_Colorado,_May_9,_2025.jpg), Adalyn Greene. Public domain, Wikimedia Commons. `pose-commons-165993723`
- [Air Force Track and Field Holiday Open (15962350969)](https://commons.wikimedia.org/wiki/File:Air_Force_Track_and_Field_Holiday_Open_(15962350969).jpg), US Air Force from USA. Public domain, Wikimedia Commons. `pose-commons-50893349`
- [Air Force Academy high jump](https://commons.wikimedia.org/wiki/File:Air_Force_Academy_high_jump.jpg), (U.S. Air Force photo/Staff Sgt. Larry E. Reid Jr.. Public domain, Wikimedia Commons. `pose-commons-26309062`
- [Warrior Games USMC Track and Field 130513-M-SO412-230](https://commons.wikimedia.org/wiki/File:Warrior_Games_USMC_Track_and_Field_130513-M-SO412-230.jpg), Lance Cpl. Sharon D. Kyle. Public domain, Wikimedia Commons. `pose-commons-38825155`
- [Warrior Games track and field (933490)](https://commons.wikimedia.org/wiki/File:Warrior_Games_track_and_field_(933490).jpeg), U.S. Air Force photo by Christopher Boitz. Public domain, Wikimedia Commons. `pose-commons-90601950`
- ["Silver Flint" Frank Sylvester Flint, Catcher, Chicago, from the series Old Judge Cigarettes](https://www.metmuseum.org/art/collection/search/400161), Goodwin & Company. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-400161`
- [Light Artillery, Sergeant Major](https://www.metmuseum.org/art/collection/search/291653), Oliver H. Willard. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-291653`
- [Feeding Poor Puss](https://www.metmuseum.org/art/collection/search/287893), John Dillwyn Llewelyn. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-287893`
- [Javanese Women Preparing Rice](https://www.metmuseum.org/art/collection/search/264578), Unknown. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-264578`
- [\[Bugler\]](https://www.metmuseum.org/art/collection/search/269542), Unknown. CC0, The Metropolitan Museum of Art, Open Access. `pose-met-269542`
- [Edgar Degas - Ballet (L'Étoile)](https://commons.wikimedia.org/wiki/File:Edgar_Degas_-_Ballet_(L%27%C3%89toile).jpg), Edgar Degas. Public domain, Wikimedia Commons. `pose-commons-93729955`
- [Edgar Degas, 1867c - Ballerinas in Pink](https://commons.wikimedia.org/wiki/File:Edgar_Degas,_1867c_-_Ballerinas_in_Pink.jpg), Edgar Degas. Public domain, Wikimedia Commons. `pose-commons-53236417`
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

### Hands and feet (72)

- [Hands of Mr. Henry Brooks, 8c05678a](https://commons.wikimedia.org/wiki/File:Hands_of_Mr._Henry_Brooks,_8c05678a.tif), Jack Delano. Public domain, Wikimedia Commons. `hands-feet-commons-145384274`
- [Hands of Mrs. Andrew Ostermeyer, wife of a homesteader, Woodbury County, Iowa, 8a21551](https://commons.wikimedia.org/wiki/File:Hands_of_Mrs._Andrew_Ostermeyer,_wife_of_a_homesteader,_Woodbury_County,_Iowa,_8a21551.tif), Russell Lee. Public domain, Wikimedia Commons. `hands-feet-commons-147826000`
- [Hands of Mrs. Julian Bachman, a gauge inspector 31909v](https://commons.wikimedia.org/wiki/File:Hands_of_Mrs._Julian_Bachman,_a_gauge_inspector_31909v.jpg), Marjory Collins. Public domain, Wikimedia Commons. `hands-feet-commons-32474954`
- [US Navy 090418-N-1057H-084 A Seabee assigned to Naval Mobile Construction Battalion (NMCB) 11 Detachment Horn of Africa…](https://commons.wikimedia.org/wiki/File:US_Navy_090418-N-1057H-084_A_Seabee_assigned_to_Naval_Mobile_Construction_Battalion_(NMCB)_11_Detachment_Horn_of_Africa_picks_up_rocks_used_for_the_construction_of_a_the_Walela_low-water_crossing_bridge.jpg), U.S. Navy photo by Mass Communication Specialist 2nd Class Erick S. Holmes. Public domain, Wikimedia Commons. `hands-feet-commons-8357372`
- [Elderly man shows hands with dirt stains after working outdoors on a sunny day](https://commons.wikimedia.org/wiki/File:Elderly_man_shows_hands_with_dirt_stains_after_working_outdoors_on_a_sunny_day.jpg), Shixart1985. CC BY 2.0, Wikimedia Commons. `hands-feet-commons-200922650`
- [Standing male feet](https://commons.wikimedia.org/wiki/File:Standing_male_feet.jpg), Pure male feet. CC0, Wikimedia Commons. `hands-feet-commons-110680825`
- [Soles of Bare Feet](https://commons.wikimedia.org/wiki/File:Soles_of_Bare_Feet.jpg), Pure male feet. CC0, Wikimedia Commons. `hands-feet-commons-110875911`
- [Male bare feet resting on a log](https://commons.wikimedia.org/wiki/File:Male_bare_feet_resting_on_a_log.jpg), Barefootboy2005. CC0, Wikimedia Commons. `hands-feet-commons-182020633`
- [Barefoot,Soles](https://commons.wikimedia.org/wiki/File:Barefoot,Soles.jpg), Pure male feet. CC0, Wikimedia Commons. `hands-feet-commons-122081738`
- [Barefoot in nature](https://commons.wikimedia.org/wiki/File:Barefoot_in_nature.jpg), Earthpwz. CC0, Wikimedia Commons. `hands-feet-commons-138180226`
- [Barefoot on a tree trunk](https://commons.wikimedia.org/wiki/File:Barefoot_on_a_tree_trunk.jpg), Galus24. CC0, Wikimedia Commons. `hands-feet-commons-148787731`
- [Barefoot walking on tree trunk](https://commons.wikimedia.org/wiki/File:Barefoot_walking_on_tree_trunk.jpg), Galus24. CC BY 4.0, Wikimedia Commons. `hands-feet-commons-149136377`
- [Barefoot on gravel on a barefoot path](https://commons.wikimedia.org/wiki/File:Barefoot_on_gravel_on_a_barefoot_path.jpg), Affi-kun. CC0, Wikimedia Commons. `hands-feet-commons-169650697`
- [Toes ,Foot ,Barefoot](https://commons.wikimedia.org/wiki/File:Toes_,Foot_,Barefoot.jpg), Pure male feet. CC0, Wikimedia Commons. `hands-feet-commons-122081614`
- [Hands playing piano keys](https://commons.wikimedia.org/wiki/File:Hands_playing_piano_keys.jpg), Candeadly. CC BY 4.0, Wikimedia Commons. `hands-feet-commons-202943133`
- [Hupfeld piano played (2018-10-04 @pxhere 1546039)](https://commons.wikimedia.org/wiki/File:Hupfeld_piano_played_(2018-10-04_@pxhere_1546039).jpg), Unknown author Unknown author. CC0, Wikimedia Commons. `hands-feet-commons-117473046`
- [PikiWiki Israel 87609 hands on keyboards](https://commons.wikimedia.org/wiki/File:PikiWiki_Israel_87609_hands_on_keyboards.jpg), דוידי ורדי. CC BY 2.5, Wikimedia Commons. `hands-feet-commons-118631558`
- [A woman sits quietly indoors with her hands clasped together](https://commons.wikimedia.org/wiki/File:A_woman_sits_quietly_indoors_with_her_hands_clasped_together.jpg), Shixart1985. CC BY 2.0, Wikimedia Commons. `hands-feet-commons-191635654`
- [Old man hand holding tool keys in garage](https://commons.wikimedia.org/wiki/File:Old_man_hand_holding_tool_keys_in_garage.jpg), Shixart1985. CC BY 2.0, Wikimedia Commons. `hands-feet-commons-187608985`
- [M. Klein's hands, writing. Wellcome L0018664](https://commons.wikimedia.org/wiki/File:M._Klein%27s_hands,_writing._Wellcome_L0018664.jpg), Unknown. CC BY 4.0, Wikimedia Commons. `hands-feet-commons-35986013`
- [Railroadfistorca00casw 0022](https://commons.wikimedia.org/wiki/File:Railroadfistorca00casw_0022.jpg), Guy Rich Caswell. Public domain, Wikimedia Commons. `hands-feet-commons-75859701`
- [DIG13785-031 (21705789729)](https://commons.wikimedia.org/wiki/File:DIG13785-031_(21705789729).jpg), LBJ Library. Public domain, Wikimedia Commons. `hands-feet-commons-51499352`
- [Description- A woman potter from Senegal hand shapes a pot in the Roots of Virginia Culture program at the 2007 Smithso…](https://commons.wikimedia.org/wiki/File:Description-_A_woman_potter_from_Senegal_hand_shapes_a_pot_in_the_Roots_of_Virginia_Culture_program_at_the_2007_Smithsonian_Folklife_Festival_on_the_National_Mall,_Washington,_D.C._(2553825128).jpg), Smithsonian Institution. Public domain, Wikimedia Commons. `hands-feet-commons-53630447`
- [The Wheel (135616779)](https://commons.wikimedia.org/wiki/File:The_Wheel_(135616779).jpeg), Stephanie Pakrul. CC BY 3.0, Wikimedia Commons. `hands-feet-commons-74048864`
- [Kulol charxida idish shakllantirish](https://commons.wikimedia.org/wiki/File:Kulol_charxida_idish_shakllantirish.png), AIDEPCUL. CC BY 4.0, Wikimedia Commons. `hands-feet-commons-197449559`
- [Feet covered in beach sand (Unsplash)](https://commons.wikimedia.org/wiki/File:Feet_covered_in_beach_sand_(Unsplash).jpg), Matthew Wheeler matthewwheeler. CC0, Wikimedia Commons. `hands-feet-commons-61903502`
- [\[Button\]](https://www.metmuseum.org/art/collection/search/283177), Unknown. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-283177`
- [Harriet Goodhue Hosmer, Clasped Hands of Robert Browning and Elizabeth Barrett Browning, model 1853, NGA 132405](https://commons.wikimedia.org/wiki/File:Harriet_Goodhue_Hosmer,_Clasped_Hands_of_Robert_Browning_and_Elizabeth_Barrett_Browning,_model_1853,_NGA_132405.jpg), Harriet Goodhue Hosmer. CC0, Wikimedia Commons. `hands-feet-commons-80612552`
- [The complete works of Mrs. E. B. Browning - p75](https://commons.wikimedia.org/wiki/File:The_complete_works_of_Mrs._E._B._Browning_-_p75.png), Author Elizabeth Barrett Browning Publisher G. Sproul Sculptured from the life…. Public domain, Wikimedia Commons. `hands-feet-commons-126154361`
- [Limestone hand holding a dove](https://www.metmuseum.org/art/collection/search/242270), Cypriot. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-242270`
- [Hand with base](https://www.metmuseum.org/art/collection/search/204711), Auguste Rodin. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-204711`
- [Limestone hand holding a pomegranate](https://www.metmuseum.org/art/collection/search/242265), Cypriot. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-242265`
- [A hand from a coffin?](https://www.metmuseum.org/art/collection/search/571619), Unknown. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-571619`
- [Bronze right foot and lower leg from a colossal statue](https://www.metmuseum.org/art/collection/search/251366), Roman. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-251366`
- [Hand of a Buddha](https://www.metmuseum.org/art/collection/search/62375), Japan. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-62375`
- [The Hand of God](https://www.metmuseum.org/art/collection/search/191046), Auguste Rodin. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-191046`
- [Fragment of a Statue](https://www.metmuseum.org/art/collection/search/39991), Central Asia. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-39991`
- [Terracotta fragment of a hand](https://www.metmuseum.org/art/collection/search/241016), Cypriot. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-241016`
- [Limestone arm with pieces of fruit (?) held in the hand](https://www.metmuseum.org/art/collection/search/242269), Cypriot. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-242269`
- [Limestone hand holding a bird](https://www.metmuseum.org/art/collection/search/242272), Cypriot. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-242272`
- [Limestone hand holding a disk and pieces of fruit](https://www.metmuseum.org/art/collection/search/242267), Cypriot. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-242267`
- [Left Hand](https://www.metmuseum.org/art/collection/search/39948), Central Asia. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-39948`
- [Limestone statue fragment of a right hand holding a phiale (libation bowl)](https://www.metmuseum.org/art/collection/search/242250), Cypriot. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-242250`
- [Pilgrim's Badge](https://www.metmuseum.org/art/collection/search/472022), French. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-472022`
- [Limestone right foot](https://www.metmuseum.org/art/collection/search/244804), Cypriot. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-244804`
- [Reliquary, Hand from](https://www.metmuseum.org/art/collection/search/466659), French. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-466659`
- [Lady's Hand and Flowers](https://www.metmuseum.org/art/collection/search/11793), American. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-11793`
- [Hand with base](https://www.metmuseum.org/art/collection/search/204710), Auguste Rodin. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-204710`
- [Terracotta guttus (flask with handle and spout)](https://www.metmuseum.org/art/collection/search/247428), Greek, South Italian, Campanian. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-247428`
- [Limestone hand holding a sword (?)](https://www.metmuseum.org/art/collection/search/242256), Cypriot. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-242256`
- [The Clenched Left Hand (Study for Hand of Pierre de Wiessant)](https://www.metmuseum.org/art/collection/search/207496), Auguste Rodin. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-207496`
- [Right Hand](https://www.metmuseum.org/art/collection/search/39307), Thailand. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-39307`
- [Limestone plinth with the feet of a male statuette](https://www.metmuseum.org/art/collection/search/241890), Cypriot. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-241890`
- [Marble right foot wearing a sandal](https://www.metmuseum.org/art/collection/search/252959), Roman. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-252959`
- [Marble left hand holding a scroll](https://www.metmuseum.org/art/collection/search/251036), Roman. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-251036`
- [Right Hand of Abraham Lincoln](https://www.metmuseum.org/art/collection/search/19446), Leonard Wells Volk. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-19446`
- [Limestone votive (?) foot with a sandal](https://www.metmuseum.org/art/collection/search/244058), Greek or Roman, Cypriot. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-244058`
- [Hand of a Seated Deity](https://www.metmuseum.org/art/collection/search/329847), Unknown. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-329847`
- [Foot fragment](https://www.metmuseum.org/art/collection/search/251536), Unknown. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-251536`
- [Sculptor's model/votive of a fist](https://www.metmuseum.org/art/collection/search/549701), Unknown. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-549701`
- [Bronze toes and instep of an over-lifesized right foot](https://www.metmuseum.org/art/collection/search/248729), Roman. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-248729`
- [Marble right hand and forearm](https://www.metmuseum.org/art/collection/search/254989), Greek. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-254989`
- [Terracotta aryballos (perfume vase) in the form of a sandaled right foot](https://www.metmuseum.org/art/collection/search/251466), Rhodian. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-251466`
- [Limestone statue fragment of a hand holding a pyxis or bobbin](https://www.metmuseum.org/art/collection/search/244803), Cypriot. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-244803`
- [Bronze hand of a boxer](https://www.metmuseum.org/art/collection/search/257574), Roman. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-257574`
- [Giacomo Cavedone, Clasped Hands (verso), c. 1612, NGA 79418](https://commons.wikimedia.org/wiki/File:Giacomo_Cavedone,_Clasped_Hands_(verso),_c._1612,_NGA_79418.jpg), Giacomo Cavedone. CC0, Wikimedia Commons. `hands-feet-commons-81442821`
- [Studies of the Hands of Erasmus, by Hans Holbein the Younger](https://commons.wikimedia.org/wiki/File:Studies_of_the_Hands_of_Erasmus,_by_Hans_Holbein_the_Younger.jpg), Hans Holbein the Younger. Public domain, Wikimedia Commons. `hands-feet-commons-6227771`
- [Portait of the astronomer Nicholas Kratzer (detail, hands and astronomic tools) - Hans Holbein d. J. (Louvre Museum)](https://commons.wikimedia.org/wiki/File:Portait_of_the_astronomer_Nicholas_Kratzer_(detail,_hands_and_astronomic_tools)_-_Hans_Holbein_d._J._(Louvre_Museum).jpg), Hans Holbein the Younger. Public domain, Wikimedia Commons. `hands-feet-commons-152953`
- [Studies of Hands](https://www.metmuseum.org/art/collection/search/338103), Andrea del Sarto (Andrea d'Agnolo). CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-338103`
- [Study of Hands for "Christ Among the Doctors"](https://www.metmuseum.org/art/collection/search/854147), Jean Auguste Dominique Ingres. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-854147`
- [Studies for a Figure of Saint Francis Kneeling in a Three-Quarter View and for His Hands (recto); Studies for a Figure…](https://www.metmuseum.org/art/collection/search/338419), Annibale Carracci. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-338419`
- [Study of Legs](https://www.metmuseum.org/art/collection/search/355535), Romain Cazes. CC0, The Metropolitan Museum of Art, Open Access. `hands-feet-met-355535`

### Urban scenes (35)

- [HARDWARE STORE 316-318 Bowery at Bleeker Street in New York City by Berenice Abbott in 1938](https://commons.wikimedia.org/wiki/File:HARDWARE_STORE_316-318_Bowery_at_Bleeker_Street_in_New_York_City_by_Berenice_Abbott_in_1938.jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-11874710`
- [Blossom Restaurant; 103 Bowery by Berenice Abbott in 1935](https://commons.wikimedia.org/wiki/File:Blossom_Restaurant;_103_Bowery_by_Berenice_Abbott_in_1935.jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-11607217`
- [Pike and Henry Street by Berenice Abbott in 1936](https://commons.wikimedia.org/wiki/File:Pike_and_Henry_Street_by_Berenice_Abbott_in_1936.jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-11848673`
- [Seventh Avenue looking south from 35th Street, Manhattan (NYPL b13668355-482802)](https://commons.wikimedia.org/wiki/File:Seventh_Avenue_looking_south_from_35th_Street,_Manhattan_(NYPL_b13668355-482802).jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-52629497`
- [Construction old and new from 37 Washington Street, New York City (cropped)](https://commons.wikimedia.org/wiki/File:Construction_old_and_new_from_37_Washington_Street,_New_York_City_(cropped).jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-123224948`
- [21 Fifth Avenue NYC Berenice Abbott](https://commons.wikimedia.org/wiki/File:21_Fifth_Avenue_NYC_Berenice_Abbott.jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-139908981`
- [Doorway- Tredwell House, 29 East 4th Street, Manhattan (NYPL b13668355-1219143)](https://commons.wikimedia.org/wiki/File:Doorway-_Tredwell_House,_29_East_4th_Street,_Manhattan_(NYPL_b13668355-1219143).jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-52633376`
- [Automat, 977 Eighth Avenue, Manhattan (NYPL b13668355-482752)](https://commons.wikimedia.org/wiki/File:Automat,_977_Eighth_Avenue,_Manhattan_(NYPL_b13668355-482752).jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-52629920`
- [Court of first model tenement house in New York, 72nd Street and First Avenue, Manhattan (NYPL b13668355-482804)](https://commons.wikimedia.org/wiki/File:Court_of_first_model_tenement_house_in_New_York,_72nd_Street_and_First_Avenue,_Manhattan_(NYPL_b13668355-482804).jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-52630543`
- [Manhattan Skyline I South Street and Jones Lane Manhattan by Berenice Abbott March 26 1936](https://commons.wikimedia.org/wiki/File:Manhattan_Skyline_I_South_Street_and_Jones_Lane_Manhattan_by_Berenice_Abbott_March_26_1936.jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-11864423`
- [Oldest apartment house in New York City, 142 East 18th Street, Manhattan (NYPL b13668355-482703)](https://commons.wikimedia.org/wiki/File:Oldest_apartment_house_in_New_York_City,_142_East_18th_Street,_Manhattan_(NYPL_b13668355-482703).jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-52629705`
- [Hot Dog Stand, West St. and North Moore, Manhattan (NYPL b13668355-1219152)](https://commons.wikimedia.org/wiki/File:Hot_Dog_Stand,_West_St._and_North_Moore,_Manhattan_(NYPL_b13668355-1219152).jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-52631976`
- [Huts and unemployed, West Houston and Mercer St., Manhattan (NYPL b13668355-482853)](https://commons.wikimedia.org/wiki/File:Huts_and_unemployed,_West_Houston_and_Mercer_St.,_Manhattan_(NYPL_b13668355-482853).jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-52628855`
- [Radio Row, Cortlandt Street, Manhattan (NYPL b13668355-482561)](https://commons.wikimedia.org/wiki/File:Radio_Row,_Cortlandt_Street,_Manhattan_(NYPL_b13668355-482561).jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-52631949`
- [Ferry, Central Railroad of New Jersey, Foot of Liberty Street, Manhattan (NYPL b13668355-482838)](https://commons.wikimedia.org/wiki/File:Ferry,_Central_Railroad_of_New_Jersey,_Foot_of_Liberty_Street,_Manhattan_(NYPL_b13668355-482838).jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-52634481`
- [Consolidated Edison powerhouse, 666 1st Avenue, Manhattan (NYPL b13668355-482598)](https://commons.wikimedia.org/wiki/File:Consolidated_Edison_powerhouse,_666_1st_Avenue,_Manhattan_(NYPL_b13668355-482598).jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-52641516`
- [Salmagundi Club, 47 Fifth Avenue, Manhattan (NYPL b13668355-482716)](https://commons.wikimedia.org/wiki/File:Salmagundi_Club,_47_Fifth_Avenue,_Manhattan_(NYPL_b13668355-482716).jpg), Berenice Abbott. Public domain, Wikimedia Commons. `urban-commons-52639511`
- [Dewey Arch, New York](https://commons.wikimedia.org/wiki/File:Dewey_Arch,_New_York.jpg), Detroit Publishing Co. no. 011507. Public domain, Wikimedia Commons. `urban-commons-27307589`
- [Night in Luna Park, Coney Island (1905)](https://commons.wikimedia.org/wiki/File:Night_in_Luna_Park,_Coney_Island_(1905).jpg), Detroit Publishing Co.. Public domain, Wikimedia Commons. `urban-commons-4377384`
- [State Street - Ithaca, New York](https://commons.wikimedia.org/wiki/File:State_Street_-_Ithaca,_New_York.jpg), Detroit Publishing Co.. Public domain, Wikimedia Commons. `urban-commons-5947712`
- [Fifth Avenue at Fifty-First Street, New York City, 1900](https://commons.wikimedia.org/wiki/File:Fifth_Avenue_at_Fifty-First_Street,_New_York_City,_1900.jpg), Detroit Publishing Co.. Public domain, Wikimedia Commons. `urban-commons-11164208`
- [Looking up Broadway from Dey Street, New York City, 1900](https://commons.wikimedia.org/wiki/File:Looking_up_Broadway_from_Dey_Street,_New_York_City,_1900.jpg), Detroit Publishing Co.. Public domain, Wikimedia Commons. `urban-commons-11163553`
- [5th Avenue looking north from 33rd Street, New York City 1908](https://commons.wikimedia.org/wiki/File:5th_Avenue_looking_north_from_33rd_Street,_New_York_City_1908.jpg), Unknown 1908 American photographer. Public domain, Wikimedia Commons. `urban-commons-97179729`
- [Mulberry Street, New York City (LOC det.4a08193)](https://commons.wikimedia.org/wiki/File:Mulberry_Street,_New_York_City_(LOC_det.4a08193).jpg), Detroit Publishing Co. , copyright claimant. Public domain, Wikimedia Commons. `urban-commons-11307703`
- [Bowery, New York City, ca. 1898](https://commons.wikimedia.org/wiki/File:Bowery,_New_York_City,_ca._1898.jpg), Detroit Publishing Co.. Public domain, Wikimedia Commons. `urban-commons-11161227`
- [High Bridge, New York City, 1900](https://commons.wikimedia.org/wiki/File:High_Bridge,_New_York_City,_1900.jpg), Detroit Publishing Co.. Public domain, Wikimedia Commons. `urban-commons-11159057`
- [New Amsterdam Theater - 42nd St. - New York City 1905](https://commons.wikimedia.org/wiki/File:New_Amsterdam_Theater_-_42nd_St._-_New_York_City_1905.jpg), Detroit Publishing Company. Public domain, Wikimedia Commons. `urban-commons-25635037`
- [Chinese, Thai, and Vietnamese restaurants side by side in the Flushing neighborhood of New York City's Queens borough,…](https://commons.wikimedia.org/wiki/File:Chinese,_Thai,_and_Vietnamese_restaurants_side_by_side_in_the_Flushing_neighborhood_of_New_York_City%27s_Queens_borough,_by_Carol_M._Highsmith,_2018_-_master-pnp-highsm-53000-53088a.tif), Carol M. Highsmith. CC0, Wikimedia Commons. `urban-commons-129644839`
- [No Known Restrictions Flatiron Building, New York City (Highsmith LOC) (6718401639)](https://commons.wikimedia.org/wiki/File:No_Known_Restrictions_Flatiron_Building,_New_York_City_(Highsmith_LOC)_(6718401639).jpg), Carol M. Highsmith. Public domain, Wikimedia Commons. `urban-commons-97464359`
- [F4F Wildcat on exhibit in New York for War bond selling 1942](https://commons.wikimedia.org/wiki/File:F4F_Wildcat_on_exhibit_in_New_York_for_War_bond_selling_1942.jpg), Marjory Collins (1912-1985), photographer. Public domain, Wikimedia Commons. `urban-commons-29494271`
- [New York, New York. Statue of General Sherman at 59th Street 8d22254v](https://commons.wikimedia.org/wiki/File:New_York,_New_York._Statue_of_General_Sherman_at_59th_Street_8d22254v.jpg), Marjory Collins. Public domain, Wikimedia Commons. `urban-commons-31474661`
- [New York City street peddler; Rivington Street scene LCCN2016648987](https://commons.wikimedia.org/wiki/File:New_York_City_street_peddler;_Rivington_Street_scene_LCCN2016648987.tif), George Grantham Bain Collection. Public domain, Wikimedia Commons. `urban-commons-67863061`
- [German sailors parade on street, New York LCCN2014684284](https://commons.wikimedia.org/wiki/File:German_sailors_parade_on_street,_New_York_LCCN2014684284.jpg), Bain News Service, publisher. Public domain, Wikimedia Commons. `urban-commons-66860430`
- [175th. Street subway station, The Bronx, New York, 12 Feb. 2008 (2262046705)](https://commons.wikimedia.org/wiki/File:175th._Street_subway_station,_The_Bronx,_New_York,_12_Feb._2008_(2262046705).jpg), Phillip Capper from Wellington, New Zealand. CC BY 2.0, Wikimedia Commons. `urban-commons-133182190`
- [86th Street Second Av. Subway Station Unveiled (31863534822)](https://commons.wikimedia.org/wiki/File:86th_Street_Second_Av._Subway_Station_Unveiled_(31863534822).jpg), Metropolitan Transportation Authority of the State of New York. CC BY 2.0, Wikimedia Commons. `urban-commons-54660704`
<!-- photo-packs:end -->

## Software

three.js (MIT), Preact (MIT), idb (ISC), fflate (MIT). The paper textures and app icon are generated by `scripts/generate-assets.mjs`.
