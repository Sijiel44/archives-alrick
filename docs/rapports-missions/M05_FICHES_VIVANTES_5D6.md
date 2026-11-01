# Mission M05 — Fiches vivantes 5d6, encyclopédie interactive et présentation mathématique

**État de livraison :** développement déposé sur branche indépendante ; validation technique finale **en attente de CI et de recette navigateur réelle**. Ne pas fusionner ni publier avant résultats probants et accord d'intégration. **Date :** 31 octobre 2026.

## 1. Point de départ vérifié

- Dépôt : `Sijiel44/archives-alrick`.
- Tête réelle de `main` avant toute opération : `f026de00d5a6bb5d8b45d1103e28d813c08bc995`.
- PR #56 B-001 : **ouverte, non fusionnée** au début de M05. Une décision de fusion reste extérieure à cette mission.
- Les PR #57–#61 et la recette M04.1 sont la base déclarée par le mandat ; les modules M03 et le rapport d'intégration de M04.1 sont présents sur `main`.
- Branche M05 créée : `feat/m05-fiches-vivantes-5d6`.

## 2. Audit et dépendances

### Fichiers sources effectivement inspectés

`quartz/components/BestiaryWorkshop.tsx`, `quartz/components/scripts/atelier5d6-bestiary-workshop.ts`, `quartz/components/scripts/atelier5d6-bestiary-workshop.inline.ts`, `quartz/components/scripts/atelier5d6-bestiary.ts`, `quartz/components/scripts/atelier5d6-combat-m03.ts`, `quartz/components/scripts/atelier5d6-progression.ts`, `quartz/components/scripts/atelier5d6-probabilities.ts`, `quartz/components/Atelier5d6.tsx`, `quartz/components/scripts/atelier5d6.inline.ts`, `scripts/test-5d6-m04-browser.mjs`, `package.json`, `tsconfig.json`, `CONTRAT_EDITORIAL.md`, `content/jouer/atelier-bestiary-5d6.md`, `.github/workflows/ci.yml`.

Sur la PR #56, consultés explicitement : `docs/bestiaire/B001_AUDIT_TAXONOMIE_5D6_ARCHITECTURE.md`, `B001_REGISTRE_INITIAL.json`, `B001_RETOUR_DIRECTEUR.md`, `B001_EVOLUTIONS.md`, et les modèles `creature-espece.md`, `creature-individu.md`, `creature-profil-5d6.md`, `biome.md`.

La charte d'illustrations et l'ensemble exhaustif des tests historiques M01–M04.1 **n'ont pas été audités ligne par ligne** à cette étape ; leur analyse complète reste une exigence de la recette finale. Le diagnostic ci-dessous est donc circonscrit aux fichiers réellement lus.

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

## 5. Recette et preuves — à actualiser avec résultats observés

| Contrôle | Suite présente ? | Résultat d'exécution vérifié dans cette conversation |
| --- | --- | --- |
| Tests purs N1–25 × 5 archétypes, protections et bonus | Oui, `test-5d6-m05.mjs` | **Non exécuté localement ici** |
| Colosse N15, JSON, provenance, portraits | Oui, même script | **Non exécuté localement ici** |
| Compilation TypeScript, build Quartz, suite historique M01–M04 | CI `npm test` configurée | **En attente de la CI de PR** |
| Chrome fiche essentielle / ouverture clavier / lien / impression PDF | Ajouté au banc `test-5d6-m04-browser.mjs` | **En attente de la CI de PR** |
| Chrome mobile / export/import / M03 / legacy / navigation Quartz | Banc M04.1 existant conservé | **En attente de la CI de PR** |
| Portrait réellement autorisé chargé, contraste, lecteurs d'écran | À compléter | **Non testé** |
| Jeu de rôle humain, danger réel et équilibrage | Hors tests automatisés | **Non testé** |

Le script Chrome doit déposer une capture `artifacts/m041/m05-colosse-essential.png` et un PDF `artifacts/m041/m05-combat-print.pdf` **seulement après exécution réussie**. Ne pas prétendre que ces artefacts existent avant leur génération par la CI.

## 6. Critères bloquants avant fusion

1. `npm test`, `npm run check:types`, `npm run build` réussis et vérifiés dans la CI.
2. Recette Chrome avec traces concrètes des parcours M05 et M04.1, y compris impression et mobile.
3. Tester réellement la régénération, les sauvegardes étendues, l'import/export, le retour Quartz, les fiches sans portrait et avec portrait sous droits vérifiés.
4. Contrôler au navigateur les éléments non couverts : PNJ non combattant, prédateur N5, contrastes, clavier et impression sans fuite de notes.
5. Vérifier que le guide et l'Atelier se publient sous leurs slugs attendus après autorisation de fusion.
6. Revue éditoriale du contrat B-001 (PR #56) et de la politique de liens avant activation de l'encyclopédie.
7. Confirmer qu'aucun secret MJ n'est versionné, même `unlisted`.

## 7. Limites conscientes

- Aucun catalogue canonique d'espèces et aucun profil documentaire publié automatiquement.
- Les liens du registre B-001 restent déclaratifs et non navigables. C'est une sécurité **volontaire**, non un bug à contourner.
- Pas de nouveau système de combat, de magie, d'initiative, de pouvoir divin ni de simulation réaliste de difficulté.
- Portraits locaux uniquement ; aucun moteur de téléchargement d'images ou de licence automatique.
- Style CSS temporaire à réviser avec l'audit de direction artistique.
- Pas de preuve de compatibilité avec tous les appareils ou lecteurs d'écran tant que la recette n'est pas menée.

## 8. Transmission aux autres chantiers

**B-002** : consulter le contrat documentaire pour permettre une relation n:n validée sans confondre espèce/individu/profil. **DA** : remplacer les tokens provisoires, approuver les formats d'images et les variantes. **Moteur 5d6** : garder M03 comme seule autorité ; faire évoluer les API publiques de lecture si besoin, sans dupliquer les mathématiques. **M05.1 / recette** : exécuter les commandes et compléter les captures, corriger tout échec de build ou de navigateur avant de demander la fusion.

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

La mission M05 n'est **pas déclarée finie** au simple dépôt du code : c'est la vérification effective des critères qui permet de la promouvoir de **branche en revue** à **version intégrable**.
