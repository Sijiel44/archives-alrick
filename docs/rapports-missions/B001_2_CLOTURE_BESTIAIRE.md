# ARCHIVES D'ALRICK — B-001.2 : CLÔTURE ET VALIDATION DES FONDATIONS DU BESTIAIRE

**Identification :** mission B-001.2 — Référent Architecture documentaire du Bestiaire — 31 octobre 2026 (Québec) — dépôt `Sijiel44/archives-alrick` — branche `bestiaire/b001-fondations` — [PR #56](https://github.com/Sijiel44/archives-alrick/pull/56).

**Statut : TERMINÉE AVEC RÉSERVES — PR prête à la décision du créateur, pas à la fusion sans arbitrage.** Aucun canon, aucune espèce ni capacité nouvellement approuvés. PR laissée ouverte en brouillon ; pas de publication ni B-002.

## 1. Périmètre et références vérifiés

- Autorité éditoriale : `CONTRAT_EDITORIAL.md` (source CB exacte, statuts indépendants, identité et publications non automatiques).
- PR #56 et ses **12 fichiers modifiés** avant B-001.2 : 4 gabarits, 5 documents B-001/B-001.1, registre JSON, test B-001.1 et `package.json` (liste confirmée par GitHub).
- PR #57 à #62 : toutes **fusionnées dans main** à la date du contrôle ; progression M01, capacités M02, combat M03, intégration M04.1, fiches M05 ; `docs/rapports-missions/M04_INTEGRATION_PUBLICATION_5D6.md`, `M05_CONTRAT_BESTIAIRE_DOCUMENTAIRE.md`, `M05_CONTRAT_MOTEUR_5D6.md`.
- `docs/bestiaire/B001_1_MATRICE_COMPATIBILITE_5D6.md`, `B001_1_RETOUR_DIRECTEUR.md`, `B001_REGISTRE_INITIAL.json` et les sources TypeScript `atelier5d6-bestiary.ts`, `atelier5d6-bestiary-workshop.ts`, `atelier5d6-combat-m03.ts`, `atelier5d6-progression.ts`, `atelier5d6-m05-sheet-view.ts`.

## 2. État Git / décision de fusion

- Base `main` : `6fe3c79cfdd36e69a6eaa356abc498d29b81f580`.
- Tête B-001.1 auditée : `e19649e097843ae80571c36c297e5de74e5a4dee`, historique réconcilié avec `main`.
- GitHub : **PR #56 ouverte**, **draft**, **merged:false**, **mergeable:true**, comparaison **13 commits ahead / 0 behind** sur la base ci-dessus. `mergeable:true` mesure l'état Git, **pas** une validation éditoriale ou une permission de fusion.
- La tête après le commit B-001.2 doit être consultée dans la PR ; son workflow doit être examiné séparément de l'ancien workflow vert.

## 3. Corrections B-001.2 — sans nouvelle fondation

1. `scripts/test-b0011-compat.mjs` : suppression de la référence fictive `DRG-01`, remplacée par `TEST-B0012-NONCOMBAT-01` pour le seul scénario de PNJ de soutien non combattant, sans enregistrement ni attribution de ce code. Trois contrôles supplémentaires : unicité des clés `cle_registre`, unicité des codes connus et absence du préfixe de test dans les codes historiques.
2. `docs/bestiaire/B001_1_MATRICE_COMPATIBILITE_5D6.md` et `docs/bestiaire/B001_1_RETOUR_DIRECTEUR.md` : remplacement du CI « à relever » par des preuves datées et liées, sans effacer les réserves.
3. Création du présent rapport et de `FICHE_DIRECTION_B001_2.md` sur **la même branche de la PR #56**. Aucun moteur M03, schéma, source canonique, contenu publié ni gabarit n'a été modifié.

## 4. Concordance technique constatée

| Contrat | Observation vérifiée | Limite |
| --- | --- | --- |
| M01 / caractéristiques | `effectiveStat` logarithmique sans plafond 12 et `effectiveMastery` dans `atelier5d6-progression.ts` | Les gabarits n'exécutent aucun calcul |
| Profils M03 | `createBestiaryCard` délègue à `generateCreatureProfileM03` ; 5 archétypes, N1–25 ; les gabarits y renvoient | Les projections ne sont pas des stats canoniques |
| Résistance / protection | `toDefense` transmet deux champs distincts ; `resistanceScoreM03` lit `resistanceBonus` pour le seuil ; `effectiveProtectionM03` lit `protection` pour l'absorption ; `equipmentGrades` conservés | Aucun rééquilibrage M03 |
| Schémas / export | Validation native `alrick.bestiary.v1`, `ruleset:m03` ; export `alrick.sheets.v3`, feuille `alrick.sheet.v3`, `ruleset:m03-bestiary`, instantané `bestiarySource` | Migration exhaustive des sauvegardes absente |
| Liaison documentaire | `readDocumentaryLink` lit un lien principal sans muter ; `canOfferDocumentaryLink` renvoie `false` ; n:n reste spécifié hors M05 | Pas de route publique ni de schéma inverse validé |
| Modèles espèce / individu / biome | Gabarits `publish:false`, statuts de chantier et aucune formule concurrente ; attributs individuels non généralisés à l'espèce | Ontologie et sources à compléter avant canon |

## 5. Preuves et exécution des contrôles

**Workflow historique effectivement examiné :** [Actions #41263562458](https://github.com/Sijiel44/archives-alrick/actions/runs/41263562458) — `pull_request`, `completed/success`, tentative 1, branche `bestiaire/b001-fondations`, SHA `e19649e097843ae80571c36c297e5de74e5a4dee`. [Job #124721559198](https://github.com/Sijiel44/archives-alrick/actions/runs/41263562458/job/124721559198), étapes toutes réussies :

- `npm ci` ; `npm test` enchaînant `check:content`, `check:types` (`tsc --noEmit`), `build` Quartz, `check:site`, suites 5d6, M01–M05, B-001.1.
- Logs : **369 pages choisies explicitement, 269 codes publiés uniques** ; build réussi ; **1 111 pages HTML / 64 434 liens et ressources internes** validés ; **1 390 assertions M05** et **1 318 assertions B-001.1** réussies.
- `npm run test:m04:browser` : **15 scénarios Chrome complets et 7 dialogues de confirmation** (dont prédateur N5, PNJ soutien, impression, clavier et protections MJ). [Artefact capturé `recette-m041-ci` #13066760528](https://github.com/Sijiel44/archives-alrick/actions/runs/41263562458/artifacts/13066760528), taille 1 671 342 octets, présent.

**Précision indispensable :** ces résultats concernent `e19649e`, **avant la correction B-001.2**. Le dépôt n'est pas clonable dans l'environnement local de cette mission (DNS GitHub indisponible), donc **aucun `npm ci` / `npm test` / Chrome local nouveau n'est revendiqué**. Le script modifié a été exécuté avec succès par la CI du commit B-001.2 `b868499` ; se reporter au contrôle post-correction ci-dessous. Le succès historique reste distingué.

## 6. Registre, unicité, audit de contenu

- `B001_REGISTRE_INITIAL.json` parsé et contrôlé : **21 entrées**, **21 `cle_registre` distinctes**, **10 codes non nuls distincts** (`DRG-01/02/03`, `IMP-13/48`, `REV-13/16`, `CRE-CB39-LIONS-EDRIC-MAELYA`, `MAG-088/098`), **11 `code:null`**.
- Le contrôle `check:content` ne dédoublonne que les **codes de pages publiées** (269 uniques). L'unicité exhaustive des brouillons, archives privées et références historiques non publiées **n'est pas attestée**.
- Arbre Git de `content/creatures/` : **17 fichiers Markdown**, contre **15 consultés initialement** dans B-001. Les fichiers `bestiaire-menaces-propositions.md` et `inspirations-mythologiques-propositions.md` restent hors du sous-ensemble de 15 : revue additionnelle requise, sans interprétation canonique.
- Préfixes `ESP-`, `FAMT-`, `INDC-`, `BIO-`, `P5C-`, `VARC-` : **propositions explicitement non approuvées**, sans émission d'identifiants nouveaux.

## 7. Arbitrages ouverts (aucune décision implicite)

**A — Éditorial (créateur + Directeur du Bestiaire).** Valider ou rejeter les préfixes ; attribuer les futurs codes et résoudre les homonymes ; décider la publication des **sept prototypes MJ** affichés comme `proposition_non_jouee` malgré la règle générale ; statuer sur les sources CB manquantes, la différence individu/espèce, les parcours et statuts des 11 codes nuls.

**B — Architecture documentaire (Bestiaire + M05).** Définir et approuver le registre inverse n:n `documentaryId` ↔ `profileId`, versionnement, unicité des relations, droit de lecture et résolution des références ; maintenir `documentaryLink` à titre déclaratif jusqu'à filtre de publication approuvé.

**C — Sécurité, droits et publication (éditorial + DA).** Revoir sources exactes, `publish`, `spoilers`, `unlisted`, visibilité, droits des portraits et absence de notes MJ dans le dépôt public ; couvrir les deux fichiers de créatures non examinés et les doublons non publiés.

**D — Gameplay (responsable 5d6 + MJ).** Évaluer le danger collectif, N5–N25, groupes, nombre de rounds, combat contre non-combattants, fuite/négociation/secours via playtests humains ; conserver les limites de `evaluateMatchup` ; valider échantillon réel de sauvegardes anciennes et import/export.

**E — Qualité technique.** La CI/TypeScript/Quartz/Chrome a été confirmée sur la tête de code B-001.2 `b868499` ; recontrôler si la base `main` évolue et sur tout futur commit modifiant l'exécutable. Aucun test UI manuel réel, essai de table humain ou migration exhaustive de données personnelles n'est attesté.

## 8. Verdict et consignes de clôture

**VERDICT : TERMINÉE AVEC RÉSERVES — PR #56 prête pour une décision de validation du créateur, non autorisée à être fusionnée maintenant.** La CI du commit B-001.2 est verte ; après revue documentaire, arbitrages listés et autorisation explicite du créateur, une fusion pourra être décidée ; `mergeable:true` est insuffisant. **Ni fusion, ni mise en ligne automatique, ni B-002.**

**Fichiers livrés B-001.2 :** `scripts/test-b0011-compat.mjs`, `docs/bestiaire/B001_1_MATRICE_COMPATIBILITE_5D6.md`, `docs/bestiaire/B001_1_RETOUR_DIRECTEUR.md`, `docs/rapports-missions/B001_2_CLOTURE_BESTIAIRE.md`, `docs/rapports-missions/FICHE_DIRECTION_B001_2.md`.


### CI post-correction B-001.2 — contrôle final du code

Le [workflow **#41266259571**](https://github.com/Sijiel44/archives-alrick/actions/runs/41266259571), déclenché par la PR #56 sur le commit **`b868499b5fad2dacc5127b797604873ce5a878ab`**, est **`completed/success`**. Le [job #124729578279](https://github.com/Sijiel44/archives-alrick/actions/runs/41266259571/job/124729578279) a réussi `npm ci`, `npm test` (contrôle contenu, `tsc --noEmit`, build Quartz, site et toutes les suites 5d6) et `npm run test:m04:browser`. Les journaux attestent **1 321 assertions B-001.1/B-001.2**, soit trois contrôles de registre en plus, **1 390 assertions M05**, **369 pages choisies / 269 codes publiés uniques**, **1 111 pages HTML / 64 434 liens et ressources**, **15 scénarios Chrome / 7 confirmations**. [Artefact Chrome #13067286489](https://github.com/Sijiel44/archives-alrick/actions/runs/41266259571/artifacts/13067286489) conservé. La présente actualisation finale des rapports ne change **aucun code exécutable** ; vérifier le statut de CI de la tête courante avant fusion.
