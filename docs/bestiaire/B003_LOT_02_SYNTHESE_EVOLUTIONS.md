# B-003 — Lot II : douze autres espèces et progression individuelle (NON PUBLIÉ)

**Date :** 1er novembre 2026. **Branche de mission :** `bestiaire/b003-montagnes-aube`, PR #73 en brouillon. **Portée :** second lot P13–P24, **12 nouvelles propositions**, dont **4 formes évolutives conditionnelles** ; premier lot P01–P12 conservé. **Total B-003 : 24 créations proposées, 0 espèce canonisée, 0 code ESP/BIO/VARC/P5C attribué.**

## A. Cadre : progression ≠ âge ≠ évolution biologique

Le système 5d6 permet des profils M03 de **niveau 1 à 25**. `content/jouer/echelle-existences-niveaux-affinites.md` précise qu'un niveau d'accomplissement n'est ni l'âge, ni le sang, ni une Autorité. Le gabarit `modeles/creature-espece.md` exige de distinguer stades, individus, biomes et variantes. **Aucune règle d'évolution automatique au franchissement d'un seuil n'existe ici** ; les paliers ci-dessous servent de **repères narratifs facultatifs**, sans programmation d'effets, et peuvent être refusés par le créateur.

- N1–4 : existence ordinaire ou début d'expérience, pas « jeune = N1 ».
- N5–9 : apprentissages et adaptation aux usages du milieu, sans pouvoirs automatiques.
- N10–14 : **réalisation exceptionnelle** possible (forme de croissance ou spécialiste), sous conditions d'écologie, temps et histoire.
- N15–19 : individu exceptionnel rare, **forme conditionnelle** pour seulement quatre propositions, non représentative de toute l'espèce.
- N20–25 : aucun individu de ce lot n'est réputé atteindre ces niveaux ; décision créateur et justification séparées obligatoires.

**Quatre lignées de formes potentielles non canoniques :** Ardoiselle P21 : *Porte-ardoise* puis *Vieille-strate* ; Araignée P22 : *Voileuse* puis *Fileuse des brumes* ; Luciolume P23 : *Lanternière* puis *Couronne pâle* ; Rochebrouteur P24 : *Dos-de-cendre* puis *Dos-de-scorie*. Toutes sont des **formes intra-espèce**, non de nouvelles espèces. Aucun `VARC-` attribué. Pour les huit autres, apprentissage ou métamorphose liée à l'âge seulement.

## B. Tableau des propositions et niches

| ID | Espèce | Niche principale | Milieux possibles | Archétype M03 |
|---|---|---|---|---|
| P13 | Grive des haies froides | faune ordinaire | H1 | `faune` |
| P14 | Escargot des roches suintantes | décomposeur ou recyclage | H1 H7 | `faune` |
| P15 | Phrygane des torrents clairs | décomposeur ou recyclage | H5 | `faune` |
| P16 | Crapaud des résurgences | faune ordinaire | H5 | `faune` |
| P17 | Sauterelle des pâtures ventées | herbivore | H3 | `faune` |
| P18 | Hirondelle des arches | faune ordinaire | H5 H9 | `faune` |
| P19 | Fouine des relais | petit prédateur | H1 H9 | `predateur` |
| P20 | Faucon des pierriers | petit prédateur | H2 H4 | `predateur` |
| P21 | Ardoiselle des moraines | herbivore | H2 | `faune` |
| P22 | Araignée tisse-gouttes | faune ordinaire | H1 H7 | `faune` |
| P23 | Luciolume de Nacrecombe | décomposeur ou recyclage | H6 | `faune` |
| P24 | Rochebrouteur des scories | herbivore | H8 | `faune` |

**Profil écologique** : 10 espèces proposées en archétype `faune`, 2 en `predateur` (fouine et faucon), **aucun nouveau prédateur dominant, dragon, Déchu ou mage**. Les fonctions naturelles dépassent la confrontation : décomposition, insectivorie, dissémination, régulation des populations et effets possibles sur berges et routes.

## C. Matrice habitats × espèces — Lot II

**◇ = habitat écologique proposé et non attesté pour cette espèce ; — = non proposé, jamais preuve d'absence.** H1–H9 sont les milieux de travail du dossier B-003 de base, non des codes `BIO-`.

| Espèce | H1 | H2 | H3 | H4 | H5 | H6 | H7 | H8 | H9 |
|---|---|---|---|---|---|---|---|---|---|
| P13 Grive des haies froides | ◇ | — | — | — | — | — | — | — | — |
| P14 Escargot des roches suintantes | ◇ | — | — | — | — | — | ◇ | — | — |
| P15 Phrygane des torrents clairs | — | — | — | — | ◇ | — | — | — | — |
| P16 Crapaud des résurgences | — | — | — | — | ◇ | — | — | — | — |
| P17 Sauterelle des pâtures ventées | — | — | ◇ | — | — | — | — | — | — |
| P18 Hirondelle des arches | — | — | — | — | ◇ | — | — | — | ◇ |
| P19 Fouine des relais | ◇ | — | — | — | — | — | — | — | ◇ |
| P20 Faucon des pierriers | — | ◇ | — | ◇ | — | — | — | — | — |
| P21 Ardoiselle des moraines | — | ◇ | — | — | — | — | — | — | — |
| P22 Araignée tisse-gouttes | ◇ | — | — | — | — | — | ◇ | — | — |
| P23 Luciolume de Nacrecombe | — | — | — | — | — | ◇ | — | — | — |
| P24 Rochebrouteur des scories | — | — | — | — | — | — | — | ◇ | — |

H1 vallées/forêts ; H2 pierriers/éboulis ; H3 pâturages/plateaux ; H4 crêtes ; H5 torrents/résurgences ; H6 lac souterrain ; H7 entrées de galeries ; H8 plateau volcanique ; H9 routes/cols/bâtiments. **H2 moraines et H8 végétation du plateau demeurent des microhabitats hypothétiques.**

## D. Réseau trophique (flèche nourriture → consommateur)

```text
Baies/graines/vers → grive P13 → faucon P20 (si cohabitation)
Litière, champignons → escargot P14 → grive P13 / crapaud P16
Débris organiques des torrents → larve de phrygane P15 → truite P06
Adultes phryganes P15 → hirondelle P18 → faucon P20
Graminées → sauterelle P17 → lagopède P04 / grive P13 / faucon P20
Campagnol P02 / insectes → fouine P19 (rival possible du renard P09)
Moucherons → araignée P22 → grive P13 (site compatible)
Lichens/pousses → ardoiselle P21 ; résidus → décomposeurs / corneille P10
Débris et biofilms dans le lac souterrain → luciolume P23 → poisson P12
Lichens/herbes d'un plateau refroidi → rochebrouteur P24 → charognards après décès
```

**Prudence :** les liens trophiques et co-présences sont tous **hypothétiques** ; on ne conclut pas que la Lamproie de nacre P existante vit avec tous les poissons, ni qu'un dragon chasse ces animaux. Champignons et micro-organismes décomposent ; ils ne sont pas confondus avec des producteurs photosynthétiques.

## E. Saisons, peuples et contraintes

- **Basses vallées** : maintien des haies, équilibre des insectes, pollinisation P01 et dissémination des graines P13 ; éviter suppression massive des abris et intoxication des insectivores.
- **Dornaël / H5** : phryganes, crapauds et hirondelles dans des sites *possibles* ; sédiments, canaux, seuils et qualité de l'eau influencent frayères, insectes et poissons. Interactions avec pêche et ouvrages, à valider.
- **Keldrun / routes** : fouines et hirondelles à proximité d'ouvrages possibles ; entretien, stockage des récoltes, ponts et circulation doivent permettre évitement et réparation, non mise à mort réflexe.
- **Nacrecombe / H6** : les poissons des profondeurs sont attestés comme groupe, **le Luciolume P23 est entièrement inventé**. Éviter toute affirmation de faune lumineuse déjà observée.
- **Forgeciel / H8** : plateau volcanique connu, **bande de végétation refroidie et Rochebrouteur P24 purement proposés** ; chaleur et fumée restent dangereuses.
- **Glaciers / H2** : présence de glaciers attestée à Dornaël, **moraines à Ardoiselles P21 et migrations restent des extrapolations**.

## F. Test et arbitrage avant adoption

La cohérence documentaire exige comparaison B-002, 24 fichiers de propositions, 3 prototypes historiques, géographie V02 dérivée, charte des illustrations et contrat M05. Aucune de ces 12 fiches n'est transférée sous `content/` ; ni code permanent, ni `documentaryLink` public, ni effectif de population, ni nouvelle règle M03.

**Validation future :** (1) accepter/écarter chaque proposition ; (2) confirmer les niches et les microhabitats ; (3) approuver ou refuser **chaque forme évolutive**, ses conditions et le fait qu'elle soit biologique ou acquise ; (4) si nécessaire tester individuellement `createBestiaryCard(level, archetype)`, `validateBestiaryCard` et `evaluateMatchup` avec un niveau et un groupe PJ effectivement choisis ; (5) approuver séparément codes ESP/VARC/P5C et publication. Aucune évaluation chiffrée M03 produite ici, car les objectifs, le contexte et le niveau de PJ ne sont pas fixés.

**Sources consultées directement :** `content/lieux/GEO-001.md`, `GEO-009.md`, `GEO-010.md`, `GEO-012.md`, `GEO-013.md`, `content/jouer/echelle-existences-niveaux-affinites.md`, `bestiaire-evolutif-25.md`, `bestiaire-plan-25.md`, `modeles/creature-espece.md`, `docs/bestiaire/B002_CODES_VALIDES.json`, `docs/bestiaire/B003_SYNTHESE_ECOLOGIQUE.md`. Les six volumes originaux et bruts complets n'ont pas été relus intégralement ici.

**Garde-fou :** travail complémentaire **B-003**, pas B-004 ; PR brouillon et aucune fusion ni publication avant Direction.
