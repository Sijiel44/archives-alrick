# PNJ-001 — Rapport technique, catalogue illustré v0.1

## Périmètre et contrats

**Mission :** développer les fiches des 30 noms sélectionnés par le créateur et proposer une belle consultation pour la nouvelle version du site, sans réécrire l'Odyssée ni attribuer du canon nouveau.

**Sources de référence :** `content/personnages/`, `content/personnages/index.md`, `AGENTS.md`, `CONTRAT_EDITORIAL.md`, `CONTRIBUTING.md`, `modeles/personnage.md`. Les sources historiques citées par chaque fiche restent leurs propres ancres documentaires ; ce lot n'est pas une nouvelle certification exhaustive des bruts.

**Dépendances :** INDEX/MATH (profils), STUDIO/ATELIERS (intégration), LORE (contrôles), QUÊTES/AVE (scènes).

## Changement préparé

- Prototype isolé sous `experiments/pnj-v01/` : `selection.mjs`, `build.mjs`, `index.template.html`, `preview.html`, `test.mjs`, guide.
- Catalogue de lecture `content/personnages/cabinet-des-rencontres-v01.md` en brouillon non publié.
- Enrichissements sur les fiches sources existantes ; aucun nouveau code de personnage.
- Fresque et 2 portraits de travail sous `content/images/personnages/` ; chacun est explicitement conceptuel.

Le générateur extrait directement les métadonnées des sources Markdown, vérifie 30 codes uniques et n'injecte que des propositions nouvelles dans le volet de scène. Les données de jeu ne sont pas une source de vérité autonome. La version HTML est régénérable.

## Prévention des régressions

- Liens de sources : même code stable, fichier source existant, chaque identité unique.
- Portraits : format WebP, taille inférieure à 3 Mio, indication validée/conceptuelle.
- Sécurité : pas de secret MJ privé, avertissement pour les fiches à spoilers, aucune mutation de campagne.
- Mécaniques : aucune valeur 5d6 inventée ; possibilité future de plusieurs adaptations sans copier la fiche de référence.
- Continuité : distinction Revenant/Rappelé, Dorrik décédé, Eren/Sören, engagements CB44 limités.
- Publication : `publish:false` du nouveau catalogue ; pas de changement Pages, de fusion ni de mise en ligne.

## Recette / CI

Exécution locale :

```bash
node experiments/pnj-v01/build.mjs
node --test experiments/pnj-v01/test.mjs
npm test
```

**Résultats locaux (16 novembre 2026) :**

- `node experiments/pnj-v01/build.mjs` : **PASS**, 30 cartes, 9 portraits et 21 emblèmes.
- `node --test experiments/pnj-v01/test.mjs` : **PASS 3/3**.
- `npm test` : **PASS** ; vérification des contenus (387 pages choisies, 285 codes uniques), construction Quartz (1284 fichiers), vérification du site (1178 pages HTML, 68 829 liens et ressources internes), puis suites 5d6, Bestiaire, organisations, antagonistes et Magie.
- `git -c core.whitespace=cr-at-eol diff --check` : **PASS** (une fiche historique utilise des fins de lignes CRLF préservées).
- **Recette graphique Chrome : non exécutée**. Le Chromium présent dans l'environnement échoue à initialiser sa socket avec « Operation not permitted ». Les tests de structure et de syntaxe du JavaScript embarqué sont passés ; la vérification visuelle PC/mobile reste demandée à QA/STUDIO.

**Livraison initiale :** [PR brouillon #132](https://github.com/Sijiel44/archives-alrick/pull/132), SHA GitHub initial `065059dadfbe5f91164e011ff0af081808c3cb99`, CI « Vérifier les Archives » n° `43811155999` **réussie**. Une extension de 12 personnages est décrite séparément dans `PNJ-002_RAPPORT_TECHNIQUE.md` ; les décomptes ci-dessus restent le bilan historique du **premier lot**.

## Impacts pour les autres modules

- **INDEX/MATH :** `characterCode` historique stable, `profileId`/`profileVersion` facultatifs, acquisitions soumises au MJ ; ne pas relier automatiquement un exemple 5d6 à une identité canonique.
- **STUDIO :** référence de bibliothèque + instance de campagne séparées, indication `spoilers` hors projection joueur, lien de provenance, portrait avec statut, sauvegarde locale sans fuite.
- **ATELIERS :** choisir une source avant l'illustration, signaler les visuels conceptuels et exiger la validation avant l'usage officiel.
- **QUÊTES/AVE :** décliner les amorces comme variantes de table, jamais comme actes joués.
- **LORE/QA/ARCHIVES :** vérification des sources, des liens, du codage stable et du comportement de sauvegarde avant intégration.

## Questions ouvertes DG

1. Les nouveaux portraits conceptuels peuvent-ils être montrés dans le catalogue public ?
2. Faut-il prioriser les personnages ordinaires (Sivra, Mara, Brakka, Lysandra) avant les proches d'Orin ?
3. À quel emplacement exact le nouveau catalogue sera-t-il raccordé (Univers, Jouer, Studio) ?
4. Qui arbitrera les mentions de personnages et révélations lors du passage du brouillon à une page publique ?

**À revoir par LORE, INDEX, MATH, STUDIO, ATELIERS, QUÊTES, AVE et QA. À valider par DG/créateur.**
