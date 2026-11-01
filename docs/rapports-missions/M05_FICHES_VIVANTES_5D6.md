# Mission M05 — Fiches vivantes 5d6, encyclopédie interactive et présentation mathématique

**État de livraison :** développement déposé sur branche indépendante ; **CI technique et recette navigateur automatisée réussies** sur le commit `6cfbaacac796aa49004665c1f3f111bb174b2388` (run GitHub Actions [#41256890579](https://github.com/Sijiel44/archives-alrick/actions/runs/41256890579)). **Validation humaine, contrôle éditorial et décision d'intégration encore requis**. Ne pas fusionner ni publier automatiquement. **Date :** 31 octobre 2026.

## 1. Point de départ vérifié

- Dépôt : `Sijiel44/archives-alrick`.
- Tête réelle de `main` avant toute opération : `f026de00d5a6bb5d8b45d1103e28d813c08bc995`.
- PR #56 B-001 : **ouverte, non fusionnée** au début de M05. Une décision de fusion reste extérieure à cette mission.
- Les PR #57–#61 et la recette M04.1 sont la base déclarée par le mandat ; les modules M03 et le rapport d'intégration de M04.1 sont présents sur `main`.
- Branche M05 créée : `feat/m05-fiches-vivantes-5d6`.

## 2. Audit et dépendances

### Fichiers sources effectivement inspectés

`docs/CHARTE_ILLUSTRATIONS_GALERIES_ALRICK.md`, `quartz/components/BestiaryWorkshop.tsx`, `quartz/components/scripts/atelier5d6-bestiary-workshop.ts`, `quartz/components/scripts/atelier5d6-bestiary-workshop.inline.ts`, `quartz/components/scripts/atelier5d6-bestiary.ts`, `quartz/components/scripts/atelier5d6-combat-m03.ts`, `quartz/components/scripts/atelier5d6-progression.ts`, `quartz/components/scripts/atelier5d6-probabilities.ts`, `quartz/components/Atelier5d6.tsx`, `quartz/components/scripts/atelier5d6.inline.ts`, `scripts/test-5d6-m04-browser.mjs`, `package.json`, `tsconfig.json`, `CONTRAT_EDITORIAL.md`, `content/jouer/atelier-bestiary-5d6.md`, `.github/workflows/ci.yml`.

Sur la PR #56, consultés explicitement : `docs/bestiaire/B001_AUDIT_TAXONOMIE_5D6_ARCHITECTURE.md`, `B001_REGISTRE_INITIAL.json`, `B001_RETOUR_DIRECTEUR.md`, `B001_EVOLUTIONS.md`, et les modèles `creature-espece.md`, `creature-individu.md`, `creature-profil-5d6.md`, `biome.md`.

La charte d'illustrations a été examinée : elle impose des sources auto-hébergées ou légalement autorisées, `alt` descriptifs et aucune confusion concept/canon. L'ensemble exhaustif des tests historiques M01–M04.1 **n'a pas été audité ligne par ligne**, mais leurs suites sont passées dans la CI M05. Le diagnostic ci-dessous est donc circonscrit aux fichiers réellement lus.

### Diagnostic

- Réutilisable : le générateur M03, l'API des caractéristiques et maîtrises, les seuils défensifs, les protections distinctes, la résolution du combat, la distribution exacte 5d6, le stockage JSON, l'import depuis le Bestiaire et la navigation Quartz.
- Manquant : composant de **lecture** distinct du formulaire d'édition, détails progressivement accessibles, impression de fiches orientées par usage, liaison documentaire prudente, guide de lecture in situ et rapport transversal DA/Bestiaire/moteur.
- Risque principal : dupliquer les algorithmes 5d6 ou introduire une permission canonique via `documentaire_approuve`. Mitigation : adaptateur de lecture sans duplication et lien volontairement non navigable.
- Risque secondaire : inclure les notes du MJ dans un imprimé public. Mitigation : ne jamais injecter `notes` dans le rendu M05 ; conserver toutefois les avertissements sur les exports JSON qui contiennent les champs locaux originaux.

## 3. Changements apportés

| Fichier | Rôle |
| --- | --- |
| `quartz/components/scripts/atelier5d6-m05-sheet-view.ts` | Adaptateur de lecture immuable ; calcul des scores, défenses, sources, portrait autorisé |
| `quartz/components/scripts/atelier5d6-m05-sheet-dom.ts` | Rendu DOM sans HTML injecté, détails `details/summary`, lecture brève et mathématique |
| `quartz/components/BestiaryWorkshop.tsx` | Conteneur fiche, formats, guide local, liaison documentaire, CSS responsif/impression |
| `quartz/components/scripts/atelier5d6-bestiary-workshop.inline.ts` | Mise à jour de la présentation sur changement, Colosse N15, champs documentaires, impression |
| `scripts/test-5d6-m05.mjs` | Tests purs 1–25, Colosse, schémas, immutabilité, liens, images et 5d6 |
| `scripts/test-5d6-m04-browser.mjs` | Ajout de parcours réels Chrome M05 dans la suite M04.1 : fiche, détails clavier, statut documentaire et impression PDF |
| `package.json` | `test:m05` et extension de la chaîne `npm test` |
| `content/jouer/guide-fiches-vivantes-5d6.md` | Guide pédagogique de lecture et de création |
| `docs/rapports-missions/M05_CONTRAT_BESTIAIRE_DOCUMENTAIRE.md` | Identités, provenance, canon, visibilités et liaison future |
| `docs/rapports-missions/M05_CONTRAT_DIRECTION_ARTISTIQUE.md` | Classes, tokens provisoires, variantes, accessibilité, images et impression |
| `docs/rapports-missions/M05_CONTRAT_MOTEUR_5D6.md` | Fonctions officielles, garanties de non-duplication, versions et tests |
| `docs/rapports-missions/M05_FICHES_VIVANTES_5D6.md` | Présent rapport de mission et transmission |

Les fichiers `Atelier5d6.tsx` et `atelier5d6.inline.ts` ont été **inspectés mais non modifiés** ; l'export interopérable M04.1 est conservé.

## 4. Comportements livrés dans le code

**Fiche essentielle :** identité, rôle, archétype, statut local, portrait facultatif, scores bruts / bonus, PV, mana, attaque, seuil de défense et absorption.

**Panneaux de détails :** caractéristiques, maîtrises, résistances, protection innée/équipement/additionnelle, combat, capacités déclaratives, histoire déclarée, provenance et mathématiques. Les contrôles utilisent les balises natives `details` et `summary`.

**Inspecteur :** formules pédagogiques et nombres issus de `effectiveStat`, `effectiveMastery`, `resistanceScoreM03`, `effectiveProtectionM03`, `evaluateMatchup`, `generateCreatureProfileM03`. Aucun nouveau calcul de probabilité. L'espérance et les hypothèses sont identifiées comme estimations, pas comme observations en partie.

**Colosse N15 :** bouton d'exemple local ; générateur M03 : Physique 15, Agilité 7, Esprit 8, Présence 8 ; bonus +7/+5/+5/+5 ; PV 194. Ce profil n'est pas une espèce.

**Liaison documentaire :** code, type et source déclaratifs via extension `documentaryLink`, lecture filtrée, **pas de lien public automatique** jusqu'à l'autorité de B-002. Préservation des anciens codes et champs d'extension à l'export. `artwork` n'est affiché qu'en présence de marqueurs d'autorisation, texte alternatif, auteur, droits et chemin local.

**Impression :** format essentiel, combat MJ, encyclopédique ou pédagogique ; la feuille de style cache les contrôles et exclut les notes MJ du contenu de consultation. L'impression PDF native du navigateur est le canal proposé, sans nouveau générateur PDF.

## 5. Recette et preuves réellement observées

**Exécution confirmée :** workflow `Vérifier les Archives`, [run #41256890579](https://github.com/Sijiel44/archives-alrick/actions/runs/41256890579), job CI **réussi** après correction d'un premier échec TypeScript (variable inutilisée) et d'un test Chrome (événement clavier CDP). Commit testé : `6cfbaacac796aa49004665c1f3f111bb174b2388`, dérivé de `main=f026de00d5a6bb5d8b45d1103e28d813c08bc995`.

| Contrôle | Résultat observé | Preuve |
| --- | --- | --- |
| Contrôle de contenu | **Réussi** | 369 pages retenues, 269 codes uniques |
| TypeScript et build Quartz | **Réussis** | `npm test` terminé sans erreur |
| Validation du site généré | **Réussie** | 1111 HTML et 64 434 liens/ressources vérifiés |
| Tests M01–M04.1 | **Réussis** | suites de `npm test` |
| Tests purs M05 N1–25 × 5 archétypes, Colosse, imports, protections | **1 390 assertions réussies** | `npm run test:m05` dans `npm test` |
| Recette Chrome M04.1 + M05 | **15 scénarios complets réussis**, 7 confirmations natives | `npm run test:m04:browser` |
| Fiche Colosse N15, inspecteur, clavier et papier PDF | **Réussis sous Chrome CI** | journaux + captures et PDF |
| Prédateur N5 et PNJ de soutien | **Réussis sous Chrome CI** | scénarios supplémentaires M05 |
| Métadonnées d'image et notes MJ non affichées | **Validé au niveau du DOM** | test image locale *déclarée* ; pas preuve du fichier ni des droits |
| Navigation Quartz, imports, legacy, combat et responsive mobile émulé | **Réussis sous Chrome CI** | scénario navigateur |
| Portrait réel chargé/licence confirmée, lecteur d'écran, contraste et appareils physiques | **Non validés** | revue humaine requise |
| Playtest humain, danger réel et équilibrage | **Non effectué** | hors de la recette automatisée |

Les artefacts de la recette ont été déposés par la CI sous [`recette-m041-ci` (run #41256890579)](https://github.com/Sijiel44/archives-alrick/actions/runs/41256890579/artifacts/13063816996). Ils comprennent notamment `m05-colosse-essential.png`, `m05-predateur-n5.png`, `m05-pnj-soutien.png`, `m05-metadata-portrait-source.png`, `m05-combat-print.pdf` ainsi que les captures M04.1. Leur génération par Chrome est confirmée par les journaux ; la revue visuelle manuelle de toutes les captures reste à faire.

## 6. Critères bloquants avant fusion

1. Les contrôles CI `npm test`, Chrome, clavier, PDF, Colosse, prédateur N5, PNJ de soutien, import/export et mobile **sont réussis** ; conserver leur trace à la PR.
2. Effectuer une **revue visuelle humaine** des captures et de l'impression, avec contrastes, zoom, lecteurs d'écran et appareils physiques.
3. Vérifier qu'un **portrait véritablement autorisé** et chargé sur le site (et non seulement les métadonnées déclarées) est lisible, attribué et ne dévoile aucun spoiler.
4. Contrôler la politique de secrets MJ, les exports JSON contenant `notes`, et les pages non répertoriées.
5. Vérifier le guide et les slugs après intégration autorisée, sans publier automatiquement.
6. Obtenir la revue éditoriale du contrat B-001 (PR #56), des codes et des droits de publication avant tout lien encyclopédique.
7. Confirmer l'autorisation de fusion de M05 ; garder la PR en brouillon d'ici là.

## 7. Limites conscientes

- Aucun catalogue canonique d'espèces et aucun profil documentaire publié automatiquement.
- Les liens du registre B-001 restent déclaratifs et non navigables. C'est une sécurité **volontaire**, non un bug à contourner.
- Pas de nouveau système de combat, de magie, d'initiative, de pouvoir divin ni de simulation réaliste de difficulté.
- Portraits locaux uniquement ; aucun moteur de téléchargement d'images ou de licence automatique.
- Style CSS temporaire à réviser avec l'audit de direction artistique.
- Pas de preuve de compatibilité avec tous les appareils ou lecteurs d'écran tant que la recette n'est pas menée.

## 8. Transmission aux autres chantiers

**B-002** : consulter le contrat documentaire pour permettre une relation n:n validée sans confondre espèce/individu/profil. **DA** : remplacer les tokens provisoires, approuver les formats d'images et les variantes. **Moteur 5d6** : garder M03 comme seule autorité ; faire évoluer les API publiques de lecture si besoin, sans dupliquer les mathématiques. **M05.1 / recette humaine** : examiner les artefacts déjà générés, confirmer les droits et les parcours lecteurs d'écran, puis arbitrer l'intégration.

## 9. Commandes de reprise

```bash
git fetch origin
git switch feat/m05-fiches-vivantes-5d6
npm ci
npm run check:types
npm run test:m05
npm test
npm run test:m04:browser
```

La **recette technique automatisée est réussie** ; M05 demeure une **PR en brouillon non fusionnée**, car la revue humaine et l'autorisation éditoriale/artistique exigées par le mandat restent ouvertes. Aucun déploiement de M05 sur `main` ou GitHub Pages n'a été effectué.

---

## Addendum de clôture — Fusion et publication M05

**Date :** 31 octobre 2026 (heure du Québec) — **statut final : FUSIONNÉ ET PUBLIÉ**.

- Accord explicite du créateur reçu pour fusionner et publier la PR [#62](https://github.com/Sijiel44/archives-alrick/pull/62) sans nouvelle mission.
- Revue réelle des captures et du PDF de la CI : un défaut d'impression a été identifié et corrigé (texte pastel illisible sur fond blanc et chrome du site imprimé). Le test de recette Chrome valide désormais le média `print`, les contrôles masqués et la lisibilité. Le PDF corrigé est ramené à trois pages pour le profil de référence Colosse N15.
- **Dernière CI de branche verte :** [#41258054565](https://github.com/Sijiel44/archives-alrick/actions/runs/41258054565), commit `dfb0920c346cd514ca0e86f33381a5758f79d14c`.
- **Fusion de la PR #62 :** commit `d40fa7bd586bce60d9c9f97f15b6e74a3459ef73`.
- **CI main verte :** [#41258208966](https://github.com/Sijiel44/archives-alrick/actions/runs/41258208966).
- **Signal de publication approuvé :** commit `e5eefe2c04836f085029a89d7d88b91236e1178e`.
- **GitHub Pages :** [workflow #41258279326](https://github.com/Sijiel44/archives-alrick/actions/runs/41258279326), build **success**, deploy **success**, smoke Chrome **success** à la seconde tentative. La première tentative de smoke échouait au lancement de Chromium sur le runner (`Impossible d'obtenir le port de Chromium`), avant tout test de page. Nouvelle exécution du job réussie sans changement de code.
- **Page publique :** https://sijiel44.github.io/archives-alrick/jouer/atelier-bestiary-5d6

**Limites maintenues :** aucun nouveau canon, aucune fusion de B-001 #56, aucun nouveau portrait publié ni droits d'images présumés ; liaison documentaire non navigable jusqu'à validation. Vérification lecteurs d'écran et appareils physiques, droits des portraits futurs et playtests humains restent sous l'autorité des chantiers spécialisés. Les contrôles de statut MJ sont locaux, non une authentification serveur.

Les mentions « non fusionné / non publié » des sections ci-dessus décrivent **l'état initial de la branche** et sont supplantées par cet addendum. La version M05 déployée correspond au signal `e5eefe2`; cet ajout documentaire postérieur n'altère pas le site compilé.
