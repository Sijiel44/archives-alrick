# B-001 — Fondation documentaire et technique du Bestiaire

**État :** audit partiel vérifié, architecture et modèles proposés pour revue. **Date :** 31 octobre 2026. **Base :** \`main\` à \`3443be26b15a90f078e7fdcb94ae5fbb5cfd9191\`. **Portée :** uniquement des outils de méthode ; **aucune création d'espèce, de biotope local ou de statistiques canoniques**.

**Références publiques :** \`CONTRAT_EDITORIAL.md\`, \`PLAN_DEVELOPPEMENT_UNIVERS.md\`, \`content/creatures/index.md\`, \`content/jouer/{systeme-5d6-base12,atelier-5d6,bestiaire-evolutif-25,bestiaire-plan-25,echelle-existences-niveaux-affinites}.md\`, \`content/monde/{passages-entre-couronnes,decheance-canon}.md\`, \`content/lieux/atlas-schema-regional.md\`, \`docs/{EQUILIBRAGE_ATELIER_5D6_24_NIVEAUX,PIPELINE_MISE_A_JOUR_ARCHIVES_5D6,CHARTE_ILLUSTRATIONS_GALERIES_ALRICK}.md\`, \`package.json\`, sources TypeScript et tests 5d6. Consultation privée séparée : Bible V01 v1.7, Atlas V02 v1.8, Compendium V03 v1.7, Codex V04 v1.7, Maison V05 v1.8, Continuité V06 v1.7, index/registre v2.4, CB1–CB34 regroupés, CB41–CB43 et bilan CB43. **Aucun contenu de ces documents privés n'est répliqué dans ce dépôt.** Le volume regroupé CB35–CB39 n'était pas fourni sous forme de document séparé dans le lot local ; ses références indirectes ne remplacent pas la relecture du brut original.

## B001-A — Audit : ce qui a été réellement vérifié

**Limite de couverture :** le connecteur a permis de lire directement les chemins ci-dessous, mais n'expose pas ici d'API de listage récursif du répertoire et la recherche de code n'a pas fourni de résultats. Ce relevé est donc un **inventaire de 15 fichiers identifiés et lus**, pas une affirmation d'exhaustivité de \`content/creatures/\`. Un futur audit d'arbre Git devra compléter et certifier le total.

| Chemin dans \`content/creatures/\` | Nature | Statut dominant | Code | Rencontre jouée | Décision |
| --- | --- | --- | --- | --- | --- |
| \`index.md\` | index | index non codé | aucun | s.o. | conserver |
| \`CRE-CB39-LIONS-EDRIC-MAELYA.md\` | dossier de 2 individus invoqués | faits_joues | CRE-CB39-LIONS-EDRIC-MAELYA | oui, apparition CB39 | conserver, résoudre futur rattachement sans renommer |
| \`dragons/thessoryn.md\` | individu | lore_valide | DRG-01 | aucune attestée dans l'Odyssée | conserver |
| \`dragons/velmora.md\` | individu | lore_valide | DRG-02 | aucune attestée dans l'Odyssée | conserver |
| \`dragons/orzeyl.md\` | individu | lore_valide | DRG-03 | aucune attestée dans l'Odyssée | conserver |
| \`dragons/irindra.md\` | individu | lore_valide (parties jouées séparées) | IMP-13 | oui | conserver, protéger spoilers |
| \`dragons-et-souverainetes.md\` | dossier de sociétés | principes du monde | aucun | non applicable | conserver |
| \`bestiaire-villages-sept-cites.md\` | index de scénarios | proposition_non_jouee | aucun | non | conserver, vérifier politique de publication |
| \`bestiaire-mache-rune.md\` | prototype MJ | proposition_non_jouee | aucun | non | ne pas migrer comme espèce |
| \`bestiaire-chasses-faim.md\` | prototype MJ | proposition_non_jouee | aucun | non | idem |
| \`bestiaire-harpiste-creuse.md\` | prototype MJ | proposition_non_jouee | aucun | non | nature indécise |
| \`bestiaire-garde-cendre.md\` | prototype MJ | proposition_non_jouee | aucun | non | nature construite proposée |
| \`bestiaire-ver-des-frontieres.md\` | prototype MJ | proposition_non_jouee | aucun | non | lien Faille non automatique |
| \`bestiaire-lamproie-de-nacre.md\` | prototype MJ | proposition_non_jouee | aucun | non | habitat seulement imaginé |
| \`bestiaire-cerf-des-brumes-froides.md\` | prototype MJ | proposition_non_jouee | aucun | non | animal non magique dans la proposition |

**Rapprochements vérifiés ailleurs :** \`content/personnages/REV-16.md\` (Aldren le loup, distinct de l'Aldren humain), \`REV-13.md\` (Harald le lion, distinct de Harald Forgecœur et des lions invoqués), \`IMP-48.md\` (Phénix, sujet autonome), \`REV-06.md\` (Heimdall, compagnon d'Aldren). L'index privé répertorie \`IMP-08\` Drakon, \`IMP-07\` Vaerdrak, \`REN-27\` créature secourue du Nord, \`MAG-088\` dragon animé, \`MAG-098\` naissance de Phénix ; leurs chemins web précis ne sont **pas vérifiés**, et ils ne sont pas dupliqués en fiches d'espèce. Le contenu public sur la Déchéance distingue également des antagonistes individuels et les mécanismes de transformation. La mention des Dros dans l'Atlas ne tranche pas leur taxonomie et mérite un retour aux scènes brutes.

**Risques de fusion et de faux canon :** Édril/Maërys ne sont pas des propriétés de tous les lions ; Irindra n'est ni une espèce, ni un Archétype draconique ; Drakon, Aurélion et Níðor ne sont pas de simples dragons ordinaires ; le dragon animé d'un toit, l'illusion et la création draconique artificielle ne prouvent ni vie biologique ni reproduction. Une Faille traversée ne démontre ni altération, ni corruption, ni hostilité. Les idées non réalisées (dont une chèvre à courts bonds spatiaux évoquée au Codex) n'entrent pas au registre des espèces existantes.

**Contradictions et arbitrages à étudier :** les sept pages de propositions sont \`publish: true\` / \`canon_statut: proposition_non_jouee\` / \`etat_editorial: valide\` ; l'index les présente clairement comme jouables mais non canoniques, tandis que la règle générale du contrat demande de garder les propositions non jouées hors publication. **Ne pas dépublier par automatisme ; arbitrer le périmètre des aides de jeu publiables.** L'intitulé du code collectif des lions utilise les noms de leurs invocateurs, pas les noms des lions : conserver le code historique, ajouter ultérieurement des liens individuels après contrôle. Les trois dragons \`DRG-01–03\` sont documentés comme lore validé, non comme des rencontres déjà jouées. Le potentiel d'Irindra au niveau 25 n'est pas son niveau actuel.

**Couverture typologique :**

| Domaine | Couverture vérifiée | Lacunes |
| --- | --- | --- |
| Faune ordinaire / domestique | Aldren et exemples ponctuels | pas de série de fiches d'espèces sourcées |
| Compagnons singuliers | REV-16, REV-13, IMP-48 | rattachements à des espèces souvent indéterminés |
| Invocations | dossier Édril/Maërys | pas de taxonomie générique validée |
| Dragons | 4 individus et dossier de souverainetés | lignées biologiques et habitats précis non exhaustifs |
| Menaces et monsters | 7 prototypes de village | espèces non canoniques, pas de rencontres jouées |
| Êtres construits | dragon animé et conceptions artificielles évoqués | distinction construction/vivant à établir cas par cas |
| Failles / Couronnes / Déchéance | cadres cosmologiques existants | provenances par créature non systématiquement documentées |
| Biomes / réseaux trophiques | données fragmentaires Atlas | aucun catalogue relationnel validé |

**Doublons avérés de fiches d'espèces :** aucun démontré dans le sous-ensemble. **Rapprochements obligatoires** : Aldren loup ≠ Aldren de Valbrume ; Harald le lion ≠ Harald Forgecœur ; Phénix individu ≠ espèce prouvée ; Édril ≠ Maërys, même dossier ; les DRG désignent des individus. Les illustrations et les liens transversaux de toutes les pages non ouvertes ne sont pas vérifiés exhaustivement.

## B001-B — Taxonomie documentaire et dictionnaire des champs

Les catégories ci-dessous sont un **vocabulaire de catalogage proposé**, pas des espèces, biomes ou lois cosmologiques ajoutés au monde. \`null\` ou \`[]\` signifie **non renseigné**, jamais « non existant ». Une hypothèse demande une note sourcée et ne remplace pas \`canon_statut\`.

| Champ | Type / valeurs | Cardinalité et règles |
| --- | --- | --- |
| \`code\` | identifiant historique / code réservé | unique pour la fiche canonique, conserver l'ancien ; nul dans l'inventaire si absent |
| \`nature_documentaire\` | \`espece\`, \`famille\`, \`individu\`, \`biome\`, \`profil_jeu\`, \`dossier\`, \`construction\`, \`proposition_mj\`, \`concept\` | une valeur principale ; ne pas induire la biologie |
| \`nature_ontologique\` | \`animal_ordinaire\`, \`organisme_magique\`, \`personne_intelligente\`, \`esprit\`, \`artificiel\`, \`invoque\`, \`transforme\`, \`inconnu\`, \`dispute\` | liste de 0–n qualités compatibles, sourcées séparément |
| \`origine_couronne\` | code de Couronne attesté ; \`inconnue\` ; \`hypothese_contestee\` | une ou origine disputée ; pas de Couronne « Autre Monde » |
| \`provenance\` | \`native_pierre\`, \`autre_couronne\`, \`traversee_sans_alteration\`, \`creation_artificielle\`, \`inconnue\` | distinction provenance ≠ résultat d'une transformation |
| \`alterations\` | \`magique_demontree\`, \`faille_demontree\`, \`decheance_etablie\`, ou liste vide | chaque effet exige preuve directe ; passage ≠ mutation |
| \`allegeances\` | identifiants de groupes et nature du lien | 0–n ; n'implique pas hostilité |
| \`hostilite\` | \`non_documentee\`, \`conditionnelle\`, \`observee\` et contexte | ne découle ni du régime alimentaire ni du niveau |
| \`biomes\` | liste de \`{type, region_code?, preuve, source}\` | relation plusieurs-à-plusieurs ; \`preuve\`: \`atteste\`, \`evoque\`, \`propose\` ; catégorie proposée ≠ biome local établi |
| \`regime_alimentaire\` | \`herbivore\`, \`carnivore\`, \`omnivore\`, \`detritivore\`, \`photosynthetique\`, \`autre\`, \`inconnu\` | alimentation documentée seulement |
| \`role_trophique\` | producteur, consommateur, décomposeur, variable, inconnu | indépendant du comportement |
| \`ecologie\` | prédateurs, proies, ressources, symbiose, parasitisme, saisonnalité, migration | chaque relation référencée, possibilité d'absence d'info |
| \`cycle\` | naissance, développement, reproduction, longévité, stades | tous facultatifs ; ne pas supposer reproduction pour constructions |
| \`comportement\` | intelligence, communication, territoire, sociabilité, coopération, apprivoisement, risque | valeurs libres *avec preuve et conditions*, non stéréotypées |
| \`capacites\` | liste \`{effet, portee, sujet, demonstration, source, limites}\` | \`sujet\`: \`espece\` ou \`individu\` ; propagation interdite |
| \`rencontres\` | \`{source_CB, plage, jouee, resultat}\` | \`jouee\` jamais déduite d'une amorce MJ |
| \`profil_5d6\` | chemin/provenance de l'adaptation | optionnel ; aucun lien = aucune statistique officielle |
| \`evolutions\` | références de transitions séparées | possibilité de zéro transition même au niveau 25 |
| \`canon_statut\` | **valeurs du \`CONTRAT_EDITORIAL.md\` uniquement** | statut dominant, provenance détaillée pour chaque affirmation |
| \`etat_editorial\` | \`valide\`, \`en_cours\`, \`en_chantier\` | ne pas créer d'état concurrent |
| \`publish\`, \`spoilers\`, \`unlisted\`, \`visibilite\` | règles du contrat | secrets hors GitHub ; spoilers publiés => unlisted et avertissement |
| \`source_brute\`, \`portee\`, \`public_cible\`, \`usage_en_jeu\` | métadonnées existantes | préserver leur signification et les valeurs admises |
| \`illustration\` | chemin, auteur, URL, licence, alt, statut visuel, autorisation | aucune image sans droits et approbation |

**Vocabulaire contrôlé des biomes (purement classificatoire) :** \`foret_temperee\`, \`foret_ancienne\`, \`foret_enchantee\`, \`jungle_tropicale\`, \`marecage\`, \`montagnes_falaises\`, \`hauts_plateaux\`, \`glaciers_toundra\`, \`grottes_souterrain\`, \`prairies_steppes\`, \`terres_agricoles\`, \`desert_aride\`, \`ruines_anthropisees\`, \`fleuves_rivieres\`, \`lacs_eaux_souterraines\`, \`cotes_estuaires\`, \`mers_oceans\`, \`volcanique\`, \`instabilite_magique\`, \`couronne_autre\`, \`passage_faille\`. Ce catalogue **n'affirme pas que ces 21 milieux existent dans une région précise**. Les deux derniers peuvent servir de qualificateur transversal plutôt que de relief principal ; priorité à l'Atlas pour chaque lien local.

**Validation documentaire** : (1) \`code\` n'entre en circulation qu'après vérification d'absence de collision ; (2) \`nature_documentaire=individu\` ne peut avoir de descendance taxonomique implicite ; (3) \`espece\` ne peut hériter des pouvoirs d'un individu ; (4) toute implantation régionale exige \`preuve=atteste\` et une référence ; (5) une proposition MJ a \`canon_statut: proposition_non_jouee\` sans lien de rencontre jouée ; (6) \`alterations\` nécessite observation, non proximité d'une Faille ; (7) tout champ inconnu demeure vide ; (8) vérification d'accès avant publication.

## B001-C — Quatre modèles prêts pour l'atelier

Utiliser les gabarits **hors publication** :
- \`modeles/creature-espece.md\` — naturalisme, preuve, biodiversité et relation aux individus.
- \`modeles/creature-individu.md\` — histoire, autonomie, capacités personnelles, continuité.
- \`modeles/creature-profil-5d6.md\` — couche de jeu, provenance, fuite et résolutions pacifiques.
- \`modeles/biome.md\` — milieu, climat, réseau écologique et source cartographique.

Les champs éditoriaux y existent, avec \`publish: false\`, \`canon_statut: a_verifier\` et \`etat_editorial: en_chantier\`. Les identifiants sont des **placeholders**, non des réservations officielles.

## B001-D — Registre initial et convention

Le fichier lisible par script \`docs/bestiaire/B001_REGISTRE_INITIAL.json\` contient **21 lignes de travail** couvrant individus, dossier mixte, prototypes et concepts transversaux. Le code \`null\` marque **l'absence de code unique vérifié**, pas un nouvel identifiant à publier. Le registre est un **index d'audit** : il ne vaut pas validation supplémentaire du lore et ne doit pas être utilisé directement comme index Quartz.

**Codes historiques à préserver absolument :** \`DRG-01\`, \`DRG-02\`, \`DRG-03\`, \`IMP-13\`, \`REV-16\`, \`REV-13\`, \`IMP-48\`, \`CRE-CB39-LIONS-EDRIC-MAELYA\`, \`MAG-088\`, \`MAG-098\`. Certains sont des codes de documents, d'événements ou d'œuvres, **pas des identifiants d'espèces**.

**Convention proposée à faire approuver, jamais appliquée automatiquement :** préfixes réservés \`ESP-\` (espèce), \`FAMT-\` (famille taxonomique, distinct de \`FAM-\` déjà familial), \`INDC-\` (individu sans code historique), \`BIO-\` (biome), \`P5C-\` (profil de jeu), \`VARC-\` (variante / stade). Suffixe séquentiel sur largeur fixe et attribution atomique via registre. **Ne pas renommer les \`IMP\`, \`DRG\` ou \`REV\` existants.** Une variante renvoie à son parent, sans statut d'espèce indépendante, sauf justification biologique explicite et approbation.

## B001-E — Matrice de compatibilité 5d6

| Aspect | Moteur réel (source de code) | Écart / décision |
| --- | --- | --- |
| Archétypes | \`faune,predateur,gardien,mystique,colosse\` dans \`atelier5d6-bestiary.ts\` | réutiliser tels quels ; aucun sixième archétype |
| Générateur | \`generateCreatureProfile(level, archetype)\` niveau borné 1–25 | ne renvoie pas un objet encyclopédique ni une identité d'espèce |
| Résultat du générateur | \`level, stats{physique,agilite,esprit,presence},pvMax,manaMax,mastery,equipmentPhysical,equipmentMagic,resistancePhysical,resistanceMagic\` | niveaux de menace, compétences fines, mobilité, attaque conditionnelle, provenance, évolution **absents** |
| Défenses | \`atelier5d6-opposition.ts\` distingue résistances physique/magique/mentale, protection innée, équipement et bonus MJ | archétype et description biologique ne valent pas résistance officielle |
| Précision / impact | 5d6 ; maîtrise de l'attaque, niveau et affinité magique conditionnelle affectent les impacts selon règles actuelles | aucun bonus de précision par maîtrise ou affinité inventé |
| Niveaux narratifs | \`echelle-existences...\` : habitants ordinaires 1–4, premiers aventuriers vers 5 | \`docs/EQUILIBRAGE_...24...\` conserve la lecture ancienne « niveau 1 aventurier » ; **migration à décider** |
| Progression | PV/base, protection, points de maîtrise et XP existants ; niveau 25 traité | aucune métamorphose déclenchée par le niveau seul |
| Risque collectif | générateur fondé sur une fiche individuelle | nombre d'ennemis, terrain, objectifs, fatigue, secours et fuite restent à modéliser hors niveau individuel |
| Import/export | \`alrick.sheet.v2\` (exemple profil unitaire), \`alrick.sheets.v2\` (lots), \`alrick.campaign.v1\` (campagne complète) | **ne pas importer directement le \`CreatureProfile\` interne** : convertisseur explicite et tests futurs nécessaires |
| Propriété \`kind\` | \`pj\`, \`pnj\`, \`creature\` selon \`atelier5d6.inline.ts\` | pas de clé automatique pour espèce/famille/biome |
| Affinités | structures d'affinités dans \`atelier5d6-origins.ts\` | rang propre à chaque individu ; ne pas le déduire de l'espèce |
| Évolutions | absentes du générateur actuel | schéma documentaire séparé, sans changement de code |

**Contrat d'interface futur, distinct de l'import existant** : utiliser une structure de revue avec \`fiche_ref\`, \`type_cible\`, \`moteur_version\`, \`archetype\`, \`niveau_individuel\`, \`menace_collective\`, \`valeurs_generees\`, \`valeurs_mj\`, \`preuves\`, \`validation_mj\`. **Ne pas présenter ces clés comme supportées par l'import actuel.** Pour adapter en \`alrick.sheet.v2\`, vérifier \`name\`, \`kind\`, \`profession\`, \`skill\`, \`stats\`, \`pv/pvMax\`, \`mana/manaMax\`, \`emprise\`, \`notes\` puis tester l'import réel. Aucun niveau ni score n'a été attribué aux personnages de l'Odyssée.

**Points de déséquilibre** : progression d'absorption très élevée aux niveaux 21–25, différentiel entre attaque individuelle et protection, affinités conditionnelles, cumul éventuel de maîtrises, attrition de groupes, opposition sociale non létale, adversaires multiples, sortie de combat. Vérifier à la table ; ne pas corriger la formule sans chantier de règles distinct.

## B001-F — Évolutions

Voir \`docs/bestiaire/B001_EVOLUTIONS.md\`. Les transitions sont **des relations documentaires** entre états ; ni une lignée nouvelle ni une règle d'XP. Familles de 3 à 6 formes seulement si les sources le justifient, jamais pour remplir mécaniquement une série.

## B001-G — Architecture et migration progressive

**Adopté pour cette PR :** \`docs/bestiaire/\` (dossier de fondation hors catalogue Quartz) ; \`modeles/\` (quatre gabarits non publiés). **Aucun déplacement** de \`content/creatures/\`, \`content/personnages/\`, \`content/jouer/\` ni des images.

**Proposition future conditionnelle :** \`content/creatures/especes/\`, \`familles/\`, \`biomes/\` et \`content/jouer/profils-creatures/\` après validation de l'arborescence, des URL et des statuts. Favoriser les liens Quartz explicites et les redirections éventuelles avant migration. Garder les fiches historiques à leur chemin tant que leur déplacement n'est pas testé. Prévoir registre des images avec auteur, licence, alt et statut conceptuel/canonique ; formats WebP/AVIF/PNG/JPG autorisés, 3 Mio max par fichier selon contrat. **Aucune illustration créée ici.**

**Pipeline :** source brute privée → correspondance avec registre → revue de statut et spoilers → validation du créateur → création d'une fiche publiable → tests de liens, index et métadonnées → PR spécifique → fusion manuelle. Les sources intégrales ne doivent jamais être transférées au dépôt public.

## B001-H — Rapport de contrôles

| Contrôle | État | Justification |
| --- | --- | --- |
| Branche isolée et absence de modification des fiches existantes | réussi | nouveaux fichiers seulement sur branche B-001 |
| Unicité des codes non nuls dans le registre B-001 | réussi | test JS lors de sa génération |
| Préservation des codes historiques | réussi sur périmètre | aucune réattribution |
| Distinction individu/espèce/prototype/profil | réussi | taxonomie et registre |
| Aucune création de pouvoir ou d'espèce | réussi sur les nouveaux fichiers | uniquement méthode et inventaire |
| Respect des champs éditoriaux dans quatre modèles | réussi par inspection du texte produit | aucun modèle n'est publié |
| Cohérence JSON du registre | réussi | \`JSON.parse\` exécuté à la création |
| Examen du code 5d6 et des trois scripts de tests | réussi | sources lues directement, pas d'exécution |
| \`npm test\` intégral | non exécuté | environnement local sans clone ni dépendances du dépôt ; ne pas prétendre à une réussite CI |
| Liens Quartz et ancien catalogue après build | non exécuté | pas de build local |
| Scannage exhaustif des fichiers du dépôt / tous les codes | non exécuté | listing récursif non accessible par le connecteur utilisé |
| Aucun spoiler ajouté au site | réussi sur cette PR | fichiers hors \`content/\`, aucune fiche narrative révélatrice nouvelle |
| Images / droits / galerie | non applicable | aucune nouvelle image |
| Protection des secrets MJ hors dépôt | réussi sur cette PR | sources privées non copiées |
| Compatibilité réelle d'un import générateur → fiche | non exécuté | adaptateur non développé |
| Aucune régression de publication | non démontrée | vérifier par CI et aperçu PR |

## B001-I — Décisions et missions suivantes

1. **Créateur :** confirmer si les sept fiches MJ \`proposition_non_jouee\` sont des *aides de jeu publiables explicitement dérogatoires* ou doivent changer de zone d'hébergement ; ne pas confondre \`etat_editorial: valide\` avec validation de leur existence.
2. **Créateur / directeur :** approuver, modifier ou refuser les préfixes futurs \`ESP/FAMT/INDC/BIO/P5C/VARC\` ; conserver tous les codes historiques.
3. **Créateur :** arbitrer les identités d'espèces et la création éventuelle de fiches propres à Édril et Maërys, sans attribuer leurs facultés aux lions ordinaires.
4. **Équipe 5d6 :** statuer sur migration de l'échelle narrative et sur l'adaptateur JSON après test réel d'import/export.
5. **Mission B-002 recommandée :** inventaire récursif signé de \`content/creatures\`, \`personnages\`, \`groupes\`, \`lieux\`, \`monde\` ; repérage d'illustrations, codes et doublons puis recoupement des CB35–CB39 source par source.
6. **Mission B-003 proposée :** premier biome **à choisir parmi les habitats déjà attestés de l'Atlas**, sans placer arbitrairement faune ou monstres.
7. **Mission B-004 proposée :** étudier une famille d'évolution seulement après identification d'une transformation réellement documentée ; à ce stade, pas de « lignée modèle » canonisée.

**Condition de sortie :** cette PR est une fondation technique **à relire**, pas une validation de nouveaux faits du monde. La complétude de l'inventaire, la CI et les arbitrages restent ouverts.
