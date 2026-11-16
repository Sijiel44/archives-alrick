# Catalogue de sons du Studio MJ — sources et vérification

État consulté le **15 novembre 2026**. Catalogue : [catalogue-sons.json](catalogue-sons.json), version 1.

**50 enregistrements distincts**, répartis en sept catégories : **18 sous CC0 1.0 et 32 explicitement placés dans le domaine public par leur auteur**. La sélection privilégie les ambiances et les bruitages utiles à une séance ; aucune variante d’un même enregistrement n’a été comptée séparément. Une collection de bruits dans une même piste compte pour une seule entrée.

| Catégorie | Identifiant | Nombre |
| --- | --- | ---: |
| Eau et rivages | `eau` | 8 |
| Forêts et nature | `foret` | 4 |
| Météo | `meteo` | 4 |
| Feu | `feu` | 3 |
| Faune | `faune` | 8 |
| Lieux et ambiances | `lieux` | 8 |
| Gestes et accessoires | `gestes` | 15 |

## Provenance et droits

Chaque entrée conserve son titre original, l’auteur donné par la fiche, le lien source, la licence, une note de preuve et la durée fournie par Wikimedia Commons. Les liens permanents du registre ci-dessous désignent les révisions effectivement consultées. Les titres et descriptions en français sont des indications d’usage ; ces ambiances ne constituent aucun ajout au canon de l’univers.

- **CC0-1.0** : la section de licence de la fiche et les métadonnées de l’enregistrement désignent [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Le pied de page général de Commons, qui concerne les métadonnées, n’a pas été utilisé comme preuve de licence du son.
- **Public-Domain** : les 32 fiches retenues conservent les modèles [PD-pdsounds.org](https://commons.wikimedia.org/wiki/Template:PD-pdsounds.org) et [PD-author](https://commons.wikimedia.org/wiki/Template:PD-author). Ils décrivent l’abandon du son au domaine public par son auteur. Le champ `licenseUrl` renvoie à cette déclaration dans la révision consultée, et non à une licence CC0 attribuée par déduction. La note de chaque entrée conserve aussi le numéro de notice PDSounds.

Les noms d’auteurs et les sources sont conservés pour la traçabilité, même lorsque la dédicace n’exige pas de crédit. Ces sons restent réutilisables par d’autres ; ils ne deviennent pas des créations exclusives des Chroniques d’Entre-Rives.

Les résultats de prononciation, les lectures d’articles, les podcasts, les pistes musicales sans intérêt d’ambiance et les fichiers présentant un doute de licence ont été écartés. Les sources sous CC BY, CC BY-SA ou licences propres à une banque commerciale ne font pas partie de ce lot.

## Contrôle technique et limites

Les URL sont les **dérivés MP3 directs HTTPS fournis par l’API Commons**, sans compte, lecteur tiers, page intermédiaire ni paramètres de suivi. Ce choix évite de diffuser les volumineux originaux WAV/FLAC et conserve un format courant dans les navigateurs. Aucun fichier audio binaire n’est ajouté au dépôt.

Les 50 URL ont répondu **HTTP 200** avec le type **audio/mpeg** lors d’un contrôle HEAD. Le registre précise le résultat et l’heure UTC de chaque contrôle. Des réponses temporaires 429 ont imposé un ralentissement ; les demandes ont été espacées et le délai Retry-After respecté avant reprise.

La sélection repose sur les descriptions, auteurs et licences des fiches, avec contrôle de leurs métadonnées et révisions. **Les 50 pistes n’ont pas fait l’objet d’une écoute intégrale ni d’une homologation en séance.** Une réponse HEAD vérifie l’accès au fichier et son type annoncé ; elle ne valide pas la qualité acoustique, le décodage complet ou le confort du volume. Des prises de son comportent des voix, du vent sur le microphone, une réverbération ou des bruits de fond : les descriptions signalent les particularités connues, sans promettre des boucles parfaites ou des niveaux uniformes.

Pour l’intégration : charger le catalogue JSON à l’ouverture, puis ne charger le média externe qu’à la demande explicite d’aperçu ou d’ajout. Garder lecture, pause et retrait accessibles, sans lecture automatique du catalogue. Les liens dépendent de la disponibilité de Commons et d’une connexion ; les déclarations de licence et les liens devront être revérifiés en cas de remplacement ou de retrait d’un fichier.

## Registre des 50 fichiers

Les preuves CC0 sont dans la section Licence de la révision liée ; les preuves du domaine public sont dans les sections Permission et Licence. La durée, l’URL de lecture et la note précise figurent dans le JSON pour chaque identifiant.

| Identifiant | Nom dans le Studio | Auteur déclaré | Licence | Preuve consultée | Contrôle HTTP UTC |
| --- | --- | --- | --- | --- | --- |
| `son-ruissellement-rigole` | Rigole vers le ruisseau | Ksd5 | CC0-1.0 | [Fiche et preuve, révision 1228133884](https://commons.wikimedia.org/w/index.php?title=File%3ASwale.ogg&oldid=1228133884) | 200 · audio/mpeg · 2026-11-15T22:38:07Z |
| `son-eau-fonte` | Eau de fonte vers le lac | Extemporalist | CC0-1.0 | [Fiche et preuve, révision 949220931](https://commons.wikimedia.org/w/index.php?title=File%3ASnowmelt_flowing_into_lake_at_Okanagan_Mountain_Provincial_Park.flac&oldid=949220931) | 200 · audio/mpeg · 2026-11-15T22:38:08Z |
| `son-rive-lac` | Rive du lac au matin | thoschi | CC0-1.0 | [Fiche et preuve, révision 877538992](https://commons.wikimedia.org/w/index.php?title=File%3A17650_thoschi_issyk-kul.ogg&oldid=877538992) | 200 · audio/mpeg · 2026-11-15T22:39:04Z |
| `son-ruisselet-bois` | Ruisselet sous les arbres | FractalStudios | CC0-1.0 | [Fiche et preuve, révision 767627203](https://commons.wikimedia.org/w/index.php?title=File%3A363120_fractalstudios_water-trickle.wav&oldid=767627203) | 200 · audio/mpeg · 2026-11-15T22:39:09Z |
| `son-source-bouillonnante` | Source bouillonnante | A.-K. D. | CC0-1.0 | [Fiche et preuve, révision 926921404](https://commons.wikimedia.org/w/index.php?title=File%3AToberbreedia_water_bubbling.opus&oldid=926921404) | 200 · audio/mpeg · 2026-11-15T22:39:14Z |
| `son-fontaine-place` | Fontaine sur la place | aldor | Public-Domain | [Fiche et preuve, révision 912830815](https://commons.wikimedia.org/w/index.php?title=File%3AFountain_in_toulouse.ogg&oldid=912830815) | 200 · audio/mpeg · 2026-11-15T22:39:19Z |
| `son-maree-rochers` | Marée entre les rochers | earthcalling | Public-Domain | [Fiche et preuve, révision 1272522305](https://commons.wikimedia.org/w/index.php?title=File%3AWater_over_rocks_as_tide_recedes.ogg&oldid=1272522305) | 200 · audio/mpeg · 2026-11-15T22:40:25Z |
| `son-clapotis-bain` | Éclaboussures dans un bassin | gradha | Public-Domain | [Fiche et preuve, révision 818569845](https://commons.wikimedia.org/w/index.php?title=File%3ABathtub_water_splashes.ogg&oldid=818569845) | 200 · audio/mpeg · 2026-11-15T22:40:37Z |
| `son-feuilles-automne` | Feuilles d’automne | Wilfredor | CC0-1.0 | [Fiche et preuve, révision 1223069989](https://commons.wikimedia.org/w/index.php?title=File%3ALeaves_falling_from_the_trees_during_autumn_in_the_forest.wav&oldid=1223069989) | 200 · audio/mpeg · 2026-11-15T22:40:49Z |
| `son-foret-grunewald` | Sous-bois de Grunewald | dbspin | CC0-1.0 | [Fiche et preuve, révision 766330222](https://commons.wikimedia.org/w/index.php?title=File%3A245286_dbspin_grunewald.wav&oldid=766330222) | 200 · audio/mpeg · 2026-11-15T22:41:01Z |
| `son-foret-tropicale` | Promenade en forêt tropicale | ezwa | Public-Domain | [Fiche et preuve, révision 755133680](https://commons.wikimedia.org/w/index.php?title=File%3AWalk_in_the_rainforest.ogg&oldid=755133680) | 200 · audio/mpeg · 2026-11-15T22:41:13Z |
| `son-brise-oiseaux` | Brise et oiseaux du jardin | ezwa | Public-Domain | [Fiche et preuve, révision 1103333314](https://commons.wikimedia.org/w/index.php?title=File%3AGentle_breeze_and_birds_singing.ogg&oldid=1103333314) | 200 · audio/mpeg · 2026-11-15T22:41:26Z |
| `son-pluie-tonnerre-lointain` | Pluie et tonnerre lointain | kvgarlic | CC0-1.0 | [Fiche et preuve, révision 597175619](https://commons.wikimedia.org/w/index.php?title=File%3ALight_Rain_Distant_Thunder_July_5th_2016.wav&oldid=597175619) | 200 · audio/mpeg · 2026-11-15T22:38:12Z |
| `son-orage-quebec` | Orage à Québec | Wilfredor | CC0-1.0 | [Fiche et preuve, révision 1145021659](https://commons.wikimedia.org/w/index.php?title=File%3AStorm_in_Quebec_on_August_10%2C_2023.flac&oldid=1145021659) | 200 · audio/mpeg · 2026-11-15T22:41:38Z |
| `son-vent-hurlant` | Vent dans le bâtiment | Tvabutzku1234 | CC0-1.0 | [Fiche et preuve, révision 508965737](https://commons.wikimedia.org/w/index.php?title=File%3AHowling_wind.ogg&oldid=508965737) | 200 · audio/mpeg · 2026-11-15T22:41:50Z |
| `son-pluie-vitre` | Pluie contre la vitre | cori | Public-Domain | [Fiche et preuve, révision 897888791](https://commons.wikimedia.org/w/index.php?title=File%3ARain_against_the_window.ogg&oldid=897888791) | 200 · audio/mpeg · 2026-11-15T22:42:02Z |
| `son-feu-cheminee` | Feu dans la cheminée | ezwa | Public-Domain | [Fiche et preuve, révision 1213718930](https://commons.wikimedia.org/w/index.php?title=File%3ADry_grass_burning_in_open_fireplace.ogg&oldid=1213718930) | 200 · audio/mpeg · 2026-11-15T22:38:14Z |
| `son-braises-barbecue` | Braises du barbecue | aldor | Public-Domain | [Fiche et preuve, révision 920555983](https://commons.wikimedia.org/w/index.php?title=File%3ABarbecue.ogg&oldid=920555983) | 200 · audio/mpeg · 2026-11-15T22:42:15Z |
| `son-souffle-dragon` | Souffle de feu simulé | gregoryweir | Public-Domain | [Fiche et preuve, révision 1112728929](https://commons.wikimedia.org/w/index.php?title=File%3APressurized_fire.ogg&oldid=1112728929) | 200 · audio/mpeg · 2026-11-15T22:42:27Z |
| `son-grues-vol` | Appels de grues en vol | Волков Владислав Петрович (с разрешения серого журавля) | CC0-1.0 | [Fiche et preuve, révision 1005400007](https://commons.wikimedia.org/w/index.php?title=File%3AGrus_grus.ogg&oldid=1005400007) | 200 · audio/mpeg · 2026-11-15T22:42:39Z |
| `son-oiseau-aube` | Oiseau à l’aube | Jidanni | CC0-1.0 | [Fiche et preuve, révision 945157473](https://commons.wikimedia.org/w/index.php?title=File%3ABird_call_with_so-called_separated_chirps.ogg&oldid=945157473) | 200 · audio/mpeg · 2026-11-15T22:42:51Z |
| `son-bernache-appel` | Appels de bernache | Grégoire Chauvot | CC0-1.0 | [Fiche et preuve, révision 1182973906](https://commons.wikimedia.org/w/index.php?title=File%3ARed-breasted_Goose_call_(Branta_ruficollis).ogg&oldid=1182973906) | 200 · audio/mpeg · 2026-11-15T22:43:04Z |
| `son-rainettes-nuit` | Rainettes dans la nuit | JohnDziak | CC0-1.0 | [Fiche et preuve, révision 480945359](https://commons.wikimedia.org/w/index.php?title=File%3ASpring_Peeper_Frogs_(Pseudacris_crucifer)_singing_on_night_of_April_21_of_2019_in_North_Pittston_PA.ogg&oldid=480945359) | 200 · audio/mpeg · 2026-11-15T22:43:16Z |
| `son-poules-ferme` | Poules de la ferme | alys | Public-Domain | [Fiche et preuve, révision 978593945](https://commons.wikimedia.org/w/index.php?title=File%3AChickens_demanding_food.ogg&oldid=978593945) | 200 · audio/mpeg · 2026-11-15T22:43:28Z |
| `son-chevres-troupeau` | Troupeau de chèvres | stephan | Public-Domain | [Fiche et preuve, révision 1178607991](https://commons.wikimedia.org/w/index.php?title=File%3AHerd_of_goats_bleating.ogg&oldid=1178607991) | 200 · audio/mpeg · 2026-11-15T22:43:40Z |
| `son-tourterelle` | Roucoulement de tourterelle | mary905 | Public-Domain | [Fiche et preuve, révision 1211894320](https://commons.wikimedia.org/w/index.php?title=File%3ADove_cooing.ogg&oldid=1211894320) | 200 · audio/mpeg · 2026-11-15T22:43:52Z |
| `son-chat-ronronnement` | Ronronnement du chat | jim_mowatt | Public-Domain | [Fiche et preuve, révision 722702909](https://commons.wikimedia.org/w/index.php?title=File%3APurring_cat_bertie.ogg&oldid=722702909) | 200 · audio/mpeg · 2026-11-15T22:44:05Z |
| `son-village-nuit` | Nuit au village | hc | Public-Domain | [Fiche et preuve, révision 870121378](https://commons.wikimedia.org/w/index.php?title=File%3ACountry_night_noise.ogg&oldid=870121378) | 200 · audio/mpeg · 2026-11-15T22:44:17Z |
| `son-marche-aligre` | Marché animé | aldor | Public-Domain | [Fiche et preuve, révision 1129949705](https://commons.wikimedia.org/w/index.php?title=File%3ALe_marche_daligre.ogg&oldid=1129949705) | 200 · audio/mpeg · 2026-11-15T22:44:29Z |
| `son-salle-repas` | Salle de repas animée | stephan | Public-Domain | [Fiche et preuve, révision 1003321006](https://commons.wikimedia.org/w/index.php?title=File%3ARestaurant_ambience.ogg&oldid=1003321006) | 200 · audio/mpeg · 2026-11-15T22:44:41Z |
| `son-moulin-romain` | Moulin à l’ancienne | hokuspokus | Public-Domain | [Fiche et preuve, révision 726580262](https://commons.wikimedia.org/w/index.php?title=File%3ARoman_mill.ogg&oldid=726580262) | 200 · audio/mpeg · 2026-11-15T22:44:54Z |
| `son-cloches-cathedrale` | Cloches de la cathédrale | Claude TRUONG-NGOC | CC0-1.0 | [Fiche et preuve, révision 776394540](https://commons.wikimedia.org/w/index.php?title=File%3APl%C3%A9num_de_la_Cath%C3%A9drale_Notre_Dame_de_Strasbourg_-_9_juillet_2000.ogg&oldid=776394540) | 200 · audio/mpeg · 2026-11-15T22:45:06Z |
| `son-gong-doux` | Gong de méditation | Marble Toast | CC0-1.0 | [Fiche et preuve, révision 1155057737](https://commons.wikimedia.org/w/index.php?title=File%3AMeditation_Gong.ogg&oldid=1155057737) | 200 · audio/mpeg · 2026-11-15T22:45:18Z |
| `son-carillon-huit-tons` | Carillon à huit tons | Membeth | CC0-1.0 | [Fiche et preuve, révision 524448266](https://commons.wikimedia.org/w/index.php?title=File%3AWindglockenspiel.Koshi.ogg&oldid=524448266) | 200 · audio/mpeg · 2026-11-15T22:45:30Z |
| `son-pierres-vapeur` | Vapeur sur les pierres chaudes | natalie | Public-Domain | [Fiche et preuve, révision 1107883245](https://commons.wikimedia.org/w/index.php?title=File%3AWater_vaporizing_on_hot_stones.ogg&oldid=1107883245) | 200 · audio/mpeg · 2026-11-15T22:45:43Z |
| `son-pas-sentier` | Pas sur un sentier humide | tball74 | Public-Domain | [Fiche et preuve, révision 1257375562](https://commons.wikimedia.org/w/index.php?title=File%3AForest_track.ogg&oldid=1257375562) | 200 · audio/mpeg · 2026-11-15T22:45:55Z |
| `son-pas-grande-salle` | Pas dans une grande salle | stephan | Public-Domain | [Fiche et preuve, révision 1271166575](https://commons.wikimedia.org/w/index.php?title=File%3AChurch_people_walking_steps_with_reverb.ogg&oldid=1271166575) | 200 · audio/mpeg · 2026-11-15T22:46:07Z |
| `son-bourse-pieces` | Bourse de pièces | cori | Public-Domain | [Fiche et preuve, révision 815121037](https://commons.wikimedia.org/w/index.php?title=File%3ABag_of_coins.ogg&oldid=815121037) | 200 · audio/mpeg · 2026-11-15T22:46:19Z |
| `son-vieille-porte` | Fermeture d’une vieille porte | ezwa | Public-Domain | [Fiche et preuve, révision 862406358](https://commons.wikimedia.org/w/index.php?title=File%3AClosing_an_old_door.ogg&oldid=862406358) | 200 · audio/mpeg · 2026-11-15T22:46:31Z |
| `son-heurtoir` | Trois coups au heurtoir | Mx. Granger | CC0-1.0 | [Fiche et preuve, révision 1209553636](https://commons.wikimedia.org/w/index.php?title=File%3ADoor_knocker_audio.ogg&oldid=1209553636) | 200 · audio/mpeg · 2026-11-15T22:46:44Z |
| `son-coffret-grincant` | Coffret de bois grinçant | stephan | Public-Domain | [Fiche et preuve, révision 1301207880](https://commons.wikimedia.org/w/index.php?title=File%3ACreaky_wooden_casket.ogg&oldid=1301207880) | 200 · audio/mpeg · 2026-11-15T22:46:56Z |
| `son-corde-arc` | Vibration d’une corde d’arc | stephan | Public-Domain | [Fiche et preuve, révision 935602066](https://commons.wikimedia.org/w/index.php?title=File%3ADeep_twang_of_loose_bow_string.ogg&oldid=935602066) | 200 · audio/mpeg · 2026-11-15T22:47:08Z |
| `son-livre-pages` | Livres et pages de papier | stephan | Public-Domain | [Fiche et preuve, révision 828585416](https://commons.wikimedia.org/w/index.php?title=File%3ABook_paper_pages_assorted.ogg&oldid=828585416) | 200 · audio/mpeg · 2026-11-15T22:47:20Z |
| `son-couverts-table` | Couverts sur la table | thore | Public-Domain | [Fiche et preuve, révision 872238703](https://commons.wikimedia.org/w/index.php?title=File%3ACutlery_on_table.ogg&oldid=872238703) | 200 · audio/mpeg · 2026-11-15T22:47:43Z |
| `son-decoupe-cuisine` | Découpe en cuisine | hugh | Public-Domain | [Fiche et preuve, révision 857615961](https://commons.wikimedia.org/w/index.php?title=File%3AChopping_leeks.ogg&oldid=857615961) | 200 · audio/mpeg · 2026-11-15T22:47:55Z |
| `son-pierres-gravier` | Pierres et gravier déplacés | stephan | Public-Domain | [Fiche et preuve, révision 805585993](https://commons.wikimedia.org/w/index.php?title=File%3AAssorted_gravel_rock_and_stones.ogg&oldid=805585993) | 200 · audio/mpeg · 2026-11-15T22:48:07Z |
| `son-branche-cassee` | Brindille cassée | stephan | Public-Domain | [Fiche et preuve, révision 722697197](https://commons.wikimedia.org/w/index.php?title=File%3ASnapping_twig.ogg&oldid=722697197) | 200 · audio/mpeg · 2026-11-15T22:48:19Z |
| `son-ecriture-encre` | Écriture à l’encre | stephan | Public-Domain | [Fiche et preuve, révision 1167909615](https://commons.wikimedia.org/w/index.php?title=File%3AWriting_with_inkpen.ogg&oldid=1167909615) | 200 · audio/mpeg · 2026-11-15T22:48:32Z |
| `son-loquet-rouille` | Loquet métallique rouillé | stephan | Public-Domain | [Fiche et preuve, révision 722700178](https://commons.wikimedia.org/w/index.php?title=File%3ARusty_metal_door_clasp.ogg&oldid=722700178) | 200 · audio/mpeg · 2026-11-15T22:48:44Z |
| `son-cordons-cuir` | Cordons et équipement | stephan | Public-Domain | [Fiche et preuve, révision 722716994](https://commons.wikimedia.org/w/index.php?title=File%3ALace_cord_rope.ogg&oldid=722716994) | 200 · audio/mpeg · 2026-11-15T22:48:56Z |
