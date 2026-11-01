# B-001.1 — Matrice de compatibilité documentaire × moteur 5d6 M03 / M04.1 / M05

**État B-001.2 :** contrats relus et CI B-001.1 du commit `e19649e` **réussie** (workflow #41263562458) ; la CI du nouveau commit de clôture B-001.2 doit encore être relevée séparément. **Référence main examinée :** `6fe3c79cfdd36e69a6eaa356abc498d29b81f580` (après fusion des PR #57–#62). **Portée :** documents, gabarits et tests seulement ; aucune formule, fiche de personnage ou espèce modifiée.

## Réconciliation des sources obligatoires

| PR / référence | Fait vérifié | Effet sur B-001 |
| --- | --- | --- |
| [#57](https://github.com/Sijiel44/archives-alrick/pull/57) | Distribution exacte 5d6, 7 776 issues, naturels 5–7 forcés | Aucun recalcul manuel dans un gabarit |
| [#58](https://github.com/Sijiel44/archives-alrick/pull/58) | M01, progression et bonus effectifs ; scores bruts >12 possibles | Éviter l'ancien plafond et les budgets historiques |
| [#59](https://github.com/Sijiel44/archives-alrick/pull/59) | M02, capacités `slot` vs `defined`, import ancien préservé, `alrick.sheets.v3` | Un texte narratif n'autorise aucune capacité mécanique |
| [#60](https://github.com/Sijiel44/archives-alrick/pull/60) | M03, générateur `generateCreatureProfileM03`, combat, défense et absorption | Source unique du calcul statistique |
| [#61](https://github.com/Sijiel44/archives-alrick/pull/61) | M04.1, Atelier Bestiaire, recette publique et transfert M03 corrigé | `alrick.bestiary.v1` et `m03-bestiary` au lieu du schéma historique |
| [#62](https://github.com/Sijiel44/archives-alrick/pull/62) | M05, fiche vivante, inspecteur, `documentaryLink` déclaratif | Séparer affichage 5d6 de l'autorité documentaire |
| [#56](https://github.com/Sijiel44/archives-alrick/pull/56) | B-001 documentaire encore en revue | Réconcilier sans fusion ni canonisation |

Sources de précision : `docs/rapports-missions/M04_INTEGRATION_PUBLICATION_5D6.md`, `M05_CONTRAT_BESTIAIRE_DOCUMENTAIRE.md`, `M05_CONTRAT_MOTEUR_5D6.md`, `M05_FICHES_VIVANTES_5D6.md`, `M03_COMBAT_BESTIAIRE_5D6.md`.

## Matrice de compatibilité détaillée

| Critère | Contrat implémenté | État B-001.1 | Preuve / limite |
| --- | --- | --- | --- |
| Espèce / individu | Lore et identité sous contrat éditorial | **Compatible** | `modeles/creature-espece.md`, `creature-individu.md` ; aucune donnée de jeu propagée |
| Profil statistique | `BestiaryCard` autonome, `kind:creature|pnj` | **Corrigé** | `modeles/creature-profil-5d6.md` |
| Menace de rencontre | Groupe, situation, terrain, objectifs indépendants du niveau | **Compatible sous hypothèses** | `evaluateMatchup` ne modélise ni tactique, ni morale, ni économie complète des actions |
| Relations n:n | `documentaryLink` M05 lit un seul objet ; pas de registre inverse automatique | **Spécifié, non implémenté** | Protocole documentaire ci-dessous ; aucune mutation M05 |
| Générateur M03 | `generateCreatureProfileM03` / `createBestiaryCard` | **Corrigé** | Générateur historique conservé mais impropre à la fiche M03 |
| Probabilités | `sumOccurrences`, `TOTAL_OUTCOMES` et `resolveCombatM03` | **Compatible** | Fonctions réutilisées dans les tests ; zéro formule divergente |
| Niveau 5–25 | Niveaux 1–25 autorisés | **Couvert par tests automatisés B-001.1 exécutés en CI** | N5/10/15/20/25 × 5 archétypes ; CI #41263562458 : 1 318 assertions B-001.1 |
| Résistance | `resistanceBonus` → seuil de résistance | **Corrigé / testé** | `resistanceScoreM03` ; ne pas l'ajouter à l'absorption |
| Protection | `protection` → absorption amortie | **Corrigé / testé** | `effectiveProtectionM03`; `equipmentGrades` séparés |
| Sauvegarde native | `schema:alrick.bestiary.v1`, `ruleset:m03` | **Corrigé / testé** | `validateBestiaryCard`, `BESTIARY_STORAGE` |
| Export Atelier principal | `schema:alrick.sheets.v3`, `ruleset:m03-bestiary` | **Corrigé / testé** | `exportBestiaryForAtelier`, `bestiarySource` |
| `documentaryLink` | Conservé en extension, type `espece|individu|autre` | **Compatible en lecture déclarative** | `readDocumentaryLink` ; `canOfferDocumentaryLink` retourne false |
| Publication / spoilers | Autorité du contrat éditorial, indépendante de `BestiaryCard.status` | **Compatible** | `documentaire_approuve` ≠ `publish:true` ; secrets MJ hors dépôt public |
| Import historique | `legacyOriginal` / schémas v1, v2 | **Non migré / non testé exhaustivement** | Parcours M04.1 testé ; aucune migration en masse B-001.1 |
| Non-combattants | `role:soutien` / `kind:pnj` possibles | **Modèle documentaire corrigé** | Aucun moteur de négociation automatique ; test de non-effet narratif |
| Playtest humain | Nécessite des tables réelles | **Non exécuté** | Tests algorithmiques ≠ essais de scénario en jeu |
| Browser et impression M05 | 15 scénarios attestés dans la CI M05 | **Réutilisés, non revendiqués comme tests B-001.1** | `M05_CONTRAT_MOTEUR_5D6.md` |

## Relation n:n documentaire — spécification, pas nouveau schéma exécutable

Un registre documentaire futur portera une table de **liens** (exemple structurel non canonique, *ne pas* copier comme extension `BestiaryCard` obligatoire) :

```json
{
  "documentaryId": "<code déjà attribué>",
  "profileId": "<id local de BestiaryCard>",
  "profileRuleset": "m03",
  "linkType": "modele_de_jeu",
  "source": "<source vérifiée>",
  "review": "a_verifier"
}
```

Chaque couple (`documentaryId`, `profileId`) est unique pour une même version du lien. Autoriser de multiples `documentaryId` par profil et de multiples `profileId` par fiche. Les formes, variantes et stades restent des relations documentaires ; aucune appartenance à une espèce n'est déduite de l'archétype. Les codes historiques conservent leur rôle. Le champ M05 `documentaryLink` peut contenir **un lien principal déclaratif**, sans être la table n:n. Ne jamais publier une route issue de `publicPath` sans contrôle éditorial complet.

## Confrontations et alternatives

La suite `scripts/test-b0011-compat.mjs` exerce N5/10/15/20/25, cinq archétypes, rôles de groupe 1/2/4, opposants offensif/défensif/polyvalent et protections variées, avec `evaluateMatchup` — **projections limitées et déterministes**, pas simulations de sessions jouées. Un PNJ de soutien non combattant et une faune non hostile sont vérifiés comme données conservées, sans effet automatique des préférences pacifiques sur les jets de combat. Les issues de fuite, négociation et secours sont des options de récit sous contrôle MJ : leur test humain reste nécessaire. Les ordres de grandeur de M03 ne sont pas des valeurs garanties pour chaque espèce.

## Blocages et validation avant fusion

1. **CI de réconciliation déjà passée** sur `e19649e` : workflow #41263562458. **À refaire sur le commit B-001.2**, qui corrige l'identifiant fictif du test et ajoute le contrôle d'unicité du registre ; ne pas assimiler l'ancien vert à la nouvelle tête de branche.
2. Revue du niveau de danger collectif et des attentes de rounds N5/N10/N15/N20/N25 par le MJ.
3. Spécification et validation des identifiants de profils de jeu et du registre n:n (B-002), sans collision avec les codes historiques.
4. Décision éditoriale sur les propositions non jouées déjà publiées, et sur la politique des secrets/portraits.
5. Compatibilité des sauvegardes personnelles historiques sur un échantillon réel ; aucune importation forcée.
6. Revue humaine des scénarios non violents, de l'accessibilité et des adaptations de rencontre.

**Décision technique :** B-001.1 ne modifie pas les algorithmes M01/M03, l'Atelier, les personnages ni leurs capacités. Le test B-001.1 n'est qu'un consommateur des fonctions publiques existantes.


## Addendum B-001.2 — preuves contrôlées le 31 octobre 2026

- [Workflow Actions #41263562458](https://github.com/Sijiel44/archives-alrick/actions/runs/41263562458) : événement `pull_request`, branche `bestiaire/b001-fondations`, commit exact `e19649e097843ae80571c36c297e5de74e5a4dee`, statut `completed/success`, tentative 1. [Job #124721559198](https://github.com/Sijiel44/archives-alrick/actions/runs/41263562458/job/124721559198) : `npm ci`, `npm test` et `npm run test:m04:browser` réussis.
- Sorties de `npm test` : `check:content` **369 pages choisies / 269 codes uniques publiés** ; TypeScript `tsc --noEmit` sans erreur ; build Quartz réussi ; `check:site` **1 111 pages HTML et 64 434 liens/ressources internes** ; **1 390 assertions M05** et **1 318 assertions B-001.1**.
- Recette Chrome : **15 scénarios complets, 7 dialogues de confirmation** ; preuve conservée dans l'[artefact `recette-m041-ci` #13066760528](https://github.com/Sijiel44/archives-alrick/actions/runs/41263562458/artifacts/13066760528). Il s'agit de tests automatisés, pas de séances de jeu humaines.
- Contrôle direct du JSON `B001_REGISTRE_INITIAL.json` : **21 entrées**, **21 clés `cle_registre` distinctes**, **10 codes non nuls distincts**, **11 codes `null`**. Les préfixes `ESP-`, `FAMT-`, `INDC-`, `BIO-`, `P5C-` et `VARC-` restent **proposés et non approuvés**.
- Arbre Git de `content/creatures/` à la tête B-001.1 : **17 fichiers Markdown**, contre **15 fichiers étudiés** dans l'audit initial ; ces deux unités supplémentaires ne sont pas validées par contagion. Le contrôle du script `check-content` garantit l'unicité des **codes publiés**, pas celle de toutes les sources privées ou non publiées.
- La suite B-001.2 remplace le code documentaire canonique `DRG-01` employé comme référence fictive de PNJ non combattant par `TEST-B0012-NONCOMBAT-01`, identifiant réservé exclusivement au test ; elle ajoute trois assertions de contrôle du registre. La nouvelle CI post-commit est à relever avant décision finale.

**Arbitrages préservés :** registre inverse n:n / règle d'attribution des ID de profil, politique de publication des sept prototypes MJ, cas à spoilers et droits visuels, niveau de danger collectif et résolutions pacifiques, migration de sauvegardes réelles. Aucun de ces sujets n'est validé par le vert CI.


### CI post-correction B-001.2 — contrôle final du code

Le [workflow **#41266259571**](https://github.com/Sijiel44/archives-alrick/actions/runs/41266259571), déclenché par la PR #56 sur le commit **`b868499b5fad2dacc5127b797604873ce5a878ab`**, est **`completed/success`**. Le [job #124729578279](https://github.com/Sijiel44/archives-alrick/actions/runs/41266259571/job/124729578279) a réussi `npm ci`, `npm test` (contrôle contenu, `tsc --noEmit`, build Quartz, site et toutes les suites 5d6) et `npm run test:m04:browser`. Les journaux attestent **1 321 assertions B-001.1/B-001.2**, soit trois contrôles de registre en plus, **1 390 assertions M05**, **369 pages choisies / 269 codes publiés uniques**, **1 111 pages HTML / 64 434 liens et ressources**, **15 scénarios Chrome / 7 confirmations**. [Artefact Chrome #13067286489](https://github.com/Sijiel44/archives-alrick/actions/runs/41266259571/artifacts/13067286489) conservé. La présente actualisation finale des rapports ne change **aucun code exécutable** ; vérifier le statut de CI de la tête courante avant fusion.
