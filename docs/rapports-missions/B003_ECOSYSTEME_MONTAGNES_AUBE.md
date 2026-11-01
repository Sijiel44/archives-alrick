# ARCHIVES D'ALRICK — RAPPORT TECHNIQUE DE MISSION B-003

**Mission :** B-003 — Faune et écosystèmes des Montagnes de l'Aube  
**Date :** 1er novembre 2026 (Québec)  
**Référent :** Zoologie fantastique et écologie montagnarde  
**Dépôt :** `Sijiel44/archives-alrick`  
**Branche :** `bestiaire/b003-montagnes-aube`  
**PR :** [#73, brouillon](https://github.com/Sijiel44/archives-alrick/pull/73) — **non fusionnée**, aucune canonisation, aucune publication  
**Premier commit documentaire :** [`5ea2dbf9291ca477c77fa920cce37ab429a0857e`](https://github.com/Sijiel44/archives-alrick/commit/5ea2dbf9291ca477c77fa920cce37ab429a0857e). La tête finale de PR après ajout des rapports est à relever dans GitHub.  
**Statut :** **TERMINÉE AVEC RÉSERVES — PROPOSITIONS SOUMISES À LA DIRECTION** ; étude documentaire seulement, aucune validation biologique/éditoriale ou playtest humain.

## 1. Dépendance, méthode et gouvernance

La PR B-002 **#67 est fusionnée** dans `main` au commit `6967679b1dee5f6b9762bd6cc4378827d0ec975e` (vérifié par l'API GitHub). L'addendum de B-002 approuve les préfixes `ESP-`, `FAMT-`, `INDC-`, `BIO-`, `P5C-`, `VARC-`, **pas** les codes individuels. Le fichier `docs/bestiaire/B002_CODES_VALIDES.json` conserve `attributions: []`.

Les 12 fiches B-003 sont donc stockées dans `docs/bestiaire/B003_FICHES/`, **hors du répertoire `content/` parcouru par Quartz**, avec identifiants de travail P01–P12 (non canoniques) sans code ESP permanent, sans photographie ni illustration. Les pages de bestiaire déjà publiques ne sont pas modifiées. Aucun nouveau `documentaryLink` ou lien n:n M05 activé. La réutilisation de données M01/M03/M04.1/M05 ne signifie ni attribution de valeurs ni nouveau pouvoir.

### Sources directement inspectées dans le dépôt

| Source vérifiée | Apport | Limite |
|---|---|---|
| `CONTRAT_EDITORIAL.md` ; `modeles/creature-espece.md` ; `modeles/biome.md` | Preuves, statuts, publication, sources et codes | Un gabarit ne certifie aucun taxon |
| `docs/bestiaire/B001_REGISTRE_INITIAL.json`, `B002_REGISTRE_RELATIONS.json`, `B002_CODES_VALIDES.json` | Historique, identité espèce/individu, validations | 21 entrées B-001 ≠ 21 espèces |
| `docs/rapports-missions/B002_REGISTRE_INTEROPERABILITE.md`, `FICHE_DIRECTION_B002.md`, spécification B-002 | Conventions, homonymes, accès et interopérabilité | Absence d'attestation automatique |
| `content/lieux/GEO-001.md`, `GEO-007.md`, `GEO-009.md`, `GEO-010.md`, `GEO-012.md`, `GEO-013.md` | Relief, bassins, plateau volcanique, lac souterrain, cols, eaux et pêche | Pas de carte zoologique |
| `content/lieux/atlas-schema-regional.md`, `GEO-ROCHEBRUME.md`, `GEO-HAUTES-PATURES.md`, `villages-sept-cites-cahier-creation.md` | Contrôles contre la localisation abusivement précise | Hautes-Pâtures sans région déterminée ; villages candidats |
| `content/creatures/index.md`, `bestiaire-villages-sept-cites.md`, `bestiaire-cerf-des-brumes-froides.md`, `bestiaire-chasses-faim.md`, `bestiaire-lamproie-de-nacre.md`, `dragons/velmora.md`, `CRE-CB39-LIONS-EDRIC-MAELYA.md` | Comparaison avec espèces/prototypes, individus, créatures invoquées | Les trois premières sont des prototypes non joués |
| `content/jouer/echelle-existences-niveaux-affinites.md`, `atelier-bestiary-5d6.md`, `modeles/creature-profil-5d6.md`, contrats M03–M05 | Archétypes, 1–25, autonomie du moteur et du documentaire | Aucun niveau ni capacité canonique inféré |
| `docs/CHARTE_ILLUSTRATIONS_GALERIES_ALRICK.md` | Conditions de droits, représentation et validation | Aucun dessin livré ou validé |

**Accès et sources primaires :** les volumes originaux privés Bible V01, Atlas V02, Compendium V03 et Codex V04, l'ensemble des six volumes ainsi que les campagnes brutes intégrales ne figurent pas en sources textuelles originales de l'arbre Git audité. Les pages Git dérivées renvoient à ces volumes ; cette mission **ne prétend pas les avoir relus intégralement**, ni avoir extrait des observations inédites des bruts CB35–CB44. La recherche documentaire externe à Git n'a pas établi de nouvelle observation fiable. Une relecture des originaux est bloquante **avant toute canonisation**, non avant le dépôt de propositions.

## 2. Étape A — habitats réellement établis versus propositions

**Socle confirmé dans l'Atlas dérivé :** vallées boisées, lacs glaciaires, plateaux exposés, réseaux souterrains (GEO-001) ; Dornaël et glaciers/torrents/lacs/résurgences/terrasses cultivées/pêche d'altitude (GEO-013) ; lac souterrain, champignons et poissons des profondeurs à Nacrecombe (GEO-010) ; plateau volcanique et dragons libres à Forgeciel (GEO-009) ; cols, pâturages d'élevage, caravanes à Keldrun (GEO-012).

**Extrapolations explicitement notées :** pierriers précis, microrefuges humides du plateau volcanique, corniches de nidification, champs floraux et lisières, frayères, réseaux de galeries réellement occupés, saisons et corridors migratoires. Aucune coordonnée, distance, altitude, plage climatique ou emplacement des nouvelles espèces n'est validé. La « ferme des Hautes-Pâtures » de Kelm est **hors géolocalisation régionale attestée** : ses gros bovins ne deviennent pas une espèce des Montagnes.

La synthèse `docs/bestiaire/B003_SYNTHESE_ECOLOGIQUE.md` décrit **9 habitats de travail H1–H9**, chacun assorti d'un niveau de preuve, et une matrice des espèces. H1–H9 ne sont pas des codes `BIO-`.

## 3. Étape B — fonctionnement écologique

Les producteurs primaires potentiels sont herbes, graines, bourgeons, plantes de bordure, plantes aquatiques et biofilms ; les champignons déjà mentionnés à Nacrecombe jouent un rôle de décomposition. Onze espèces proposées sont des faunes ordinaires ou peu dangereuses pour les humains ; une seule est modélisable comme mésoprédateur de type `predateur`. Aucune nouvelle créature magicienne ou superprédateur n'a été créée. La salamandre des pierres tièdes et le poisson pâle des profondeurs sont les deux adaptations remarquables de l'échantillon, **naturelles, sans pouvoir surnaturel**.

**Réseau trophique de conception :** herbes/graines → campagnol, marmotte, lagopède, lièvre ; fleurs → bourdon → insectivores ; petits rongeurs/insectes/baies → renard ; débris aquatiques → écrevisse → truite ; microinvertébrés → poissons cavernicoles ; carcasses → corneilles, invertébrés, champignons et microorganismes. La Lamproie de nacre et les Chasses-Faim peuvent occuper des niches de prédation **seulement si** un MJ ou le créateur les adopte ; ils restent externes aux douze espèces et aucun lien de co-présence n'est considéré comme observé.

**Effets potentiels :** pollinisation et dommages aux semences dans les terrasses ; dérangement des terriers et passages sous les routes ; gestion des déchets près des caravanes ; sédiments, barrages, pêche et pollution dans les eaux de Dornaël ; conservation de refuges cavernicoles ; gestion de rejets autour des forges. Saisons, migrations, reproduction, population et interactions restent des hypothèses écologiques analogiques, pas des observations de campagne.

## 4. Étape C — catalogue non canonique (12 nouvelles fiches)

| ID local | Nouvelle proposition | Rôle trophique | Habitats candidats | Archétype M03 optionnel |
|---|---|---|---|---|
| P01 | Bourdon des terrasses | pollinisateur | H1 | faune |
| P02 | Campagnol des murets | herbivore | H1, H9 | faune |
| P03 | Marmotte des pierriers | herbivore fouisseur | H2, H3 conditionnel | faune |
| P04 | Lagopède des crêtes | granivore | H3, H4 | faune |
| P05 | Lièvre des pentes froides | herbivore | H1, H3 | faune |
| P06 | Truite des torrents d'Aube | poisson insectivore | H5 | faune |
| P07 | Écrevisse des résurgences | détritivore | H5 | faune |
| P08 | Chauve-souris des galeries | insectivore | H7 | faune |
| P09 | Renard des cols | mésoprédateur/omnivore | H1, H3, H9 | predateur |
| P10 | Corneille des charrois | charognard/omnivore | H1, H9 | faune |
| P11 | Salamandre des pierres tièdes | insectivore remarquable | H8 conditionnel | faune |
| P12 | Poisson pâle des profondeurs | consommateur cavernicole | H6 | faune |

Les 12 fiches distinctes documentent identité et classification, morphologie, habitat et ressources, régime, comportements, reproduction avec réserve, capacités et limites, relations aux peuples, relations trophiques, sources vs création, statut, scène JDR non violente et archétype éventuel M03. Leur statut est toujours **`proposition_non_jouee`**. Aucun `ESP-` n'est créé : les préfixes approuvés ne sont pas une validation individuelle.

**Réutilisations sans doublon (3 prototypes, 0 taxon régional adopté) :** Cerf des Brumes froides, Chasses-Faim, Lamproie de nacre. On ne copie ni leur nom ni leur morphologie dans P01–P12. Les individus Velmora, Orzeyl, Aldren le loup, Harald le lion, Édril/Maërys, Phénix et Irindra restent des individus hors du décompte des taxons.

## 5. Étape D — contrôles et compatibilité 5d6

| Contrôle | Résultat de la revue | Réserve |
|---|---|---|
| Nombre de créations | 12 fiches P01–P12 ; 9 habitats H1–H9 | Quantités à vérifier en tête de PR |
| Source et invention séparées | Chaque fiche cite les pages du dépôt et décrit sa nouveauté | Originaux V01–V06 à relire avant approbation |
| Doublons | Noms P01–P12 distincts des 3 prototypes ; aucune nouvelle identité d'individu | Contrôle transversal humain futur nécessaire |
| Autorité documentaire | Aucun code `ESP-`, `BIO-`, `P5C-` ; registre B-002 inchangé | Attribution uniquement après décision créateur |
| Aggressivité et magie | Aucun pouvoir inventé, pas de nouveaux prédateurs dominants | Vie et reproduction conjecturales |
| Matrice/réseau | 9 habitats ; 12 lignes et arêtes explicitement conditionnelles | Présence des espèces non vérifiée |
| Compatibilité jeu | 11 archétypes `faune`, 1 `predateur` à titre de suggestion ; 0 niveau et 0 profil numérique | Pas de génération native ni benchmark M03 exécuté |
| Publication et images | Dossiers sous `docs/` ; aucun changement `content/`, Pages, image, M03/M05 | La PR est publique sur GitHub, non secrète |
| Vérifications techniques | Comparaison statique des chemins, contenu et règles documentaires du dépôt ; pas de `npm test` local (DNS GitHub inaccessible depuis l'exécution locale) | Vérifier CI réelle du head et revue humaine séparément |

**Motif du report des profils chiffrés 5d6 :** aucune situation de rencontre, partie, niveaux de PJ ou rôles n'est fixée ; générer des dégâts/PV risquerait de créer une autorité mécanique illusoire. Le moteur reste inchangé. Si un playtest est autorisé ultérieurement, appeler `createBestiaryCard` (M03) avec un niveau et archétype choisis en séance, valider avec `validateBestiaryCard`, examiner `evaluateMatchup` et la possibilité de résolution non violente. Les capacités descriptives ne deviennent jamais des effets automatisés.

## 6. Arbitrages à demander au créateur

1. Choisir quelles 12 propositions conserver, fusionner avec un taxon déjà présent après audit, ou rejeter, et vérifier leurs noms.
2. Confirmer quels habitats et répartitions correspondent aux véritables montagnes, distinguer Nacrecombe/Forgeciel/Dornaël/Keldrun et demander données brutes pertinentes.
3. Valider séparément la place éventuelle des trois prototypes antérieurs dans ce réseau sans les dupliquer ni les déclarer joués.
4. Approuver espèces et codes **un par un**, avec source et inscription dans `B002_CODES_VALIDES.json` ; puis, indépendamment, décider de toute publication.
5. Fixer les besoins réels de profils 5d6 (niveau, rencontre, objectif, équipe et terrain) avant de calculer quoi que ce soit. Décider des droits et illustrations éventuelles.

**Décision attendue :** examen éditorial de la PR #73, maintien en brouillon, **pas de fusion/publication/canonisation automatique**. **B-004 ne démarre pas avant un retour explicite de la Direction.**
