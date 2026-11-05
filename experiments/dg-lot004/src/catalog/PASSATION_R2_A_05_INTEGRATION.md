# PASSATION PRÉCISE À 05 INTÉGRATION — INDEX L004-B.R2

**Émetteur** : 11 INDEX. **Mandat** : DG-LOT-004, commentaire DG [6659005380](https://github.com/Sijiel44/archives-alrick/issues/93#issuecomment-6659005380), anomalie Chrome [6658247764](https://github.com/Sijiel44/archives-alrick/issues/93#issuecomment-6658247764).

## Source propriétaire à copier VERBATIM

- **Branche** : `prototype/dg004-index-xp-links`, PR [#97](https://github.com/Sijiel44/archives-alrick/pull/97) ; **HEAD / blob SHA exacts** : voir la fiche Direction et le manifeste de livraison R2 au même SHA.
- **Base inchangée** : PR #85 `2ab809ef5351940e0fc272b859d10f21de894d00`.
- **Code** : `experiments/dg-lot004/src/catalog/index.mjs` — même chemin existant à remplacer en copie contrôlée, **jamais** modifier la branche INDEX depuis 05.
- **Tests** : `experiments/dg-lot004/tests/catalog/catalog.test.mjs` (64 originaux inchangés) + `catalog-r2.test.mjs` (46 nouveaux) ; sources natives M01 et MATH #99 conservées indépendantes.
- **Documentation** : `src/catalog/README.md`, `src/catalog/PASSATION_R2_A_05_INTEGRATION.md`, `tests/catalog/FICHE_DIRECTION_L004_INDEX.md`, `tests/catalog/L004_R2_TEST_RESULTS_NODE22.tap`, `tests/catalog/L004_R2_NATIVE_M01_NON_EXECUTE.txt`, manifeste SHA JSON.

## Quoi brancher, dans quel ordre

1. **Reproduire la panne #95** : dans un profil Chrome vierge, créer la campagne/fiche fictive via ARCHIVES ; relever l'**instanceId exact** (`pj:l004-hero-fiction` rapporté), puis appeler `createXpSuggestion` sans le trafiquer. Attendu : `{ok:true,suggestion.target.characterInstanceId:'pj:l004-hero-fiction',executable:false}`. Tester aussi `pj:dg004-fake-pj` du `createFakePJBytes` intégré. Aucune substitution `:`↔`-`, aucune minuscule forcée.
2. **Contrôler la parité du flux existant** : `suggestXpFromM01(ledger,event)` de MATH #99 et `previewXpSuggestion(suggestion,{experienceAward: M01,history:[]})` retournent le même candidat pour l'événement ordinaire fictif. Après clic « Calculer », aucune mutation de fiche ni du journal.
3. **Pour la nouvelle UI XP de rencontre/quête** : `createXpSuggestion({sourceContext:{kind,accomplishmentId,runId,eventStatus,participants,selectedPjIds,threats,assistance,difficultyBeforeAssistance,realizedDifficulty,explicitM01Index?},...})`. Puis `previewMathEncounterFragment(suggestion)` fournit exactement les champs descriptifs du `XpEncounterInput` de MATH `encounter-recommendations.ts`. Ajouter **uniquement par autorité MATH/STUDIO** les champs obligatoires absents : `eventApprovedByMJ` et `ledgersByPj`. MATH calcule expérimentalement (`previewEncounterXp`) et gère la décision explicite (`recordEncounterXpChoice`). INDEX n'est **pas** l'écrivain du journal.
4. **Si `explicitM01Index` est absent** : la prévisualisation directe INDEX refuse `MATH_INDEX_NOT_ATTESTED`; MATH peut proposer son modèle A expérimental (étiquettes facile/modérée/difficile/héroïque) **sans barème adopté**. Si présent, il doit être entre 1 et 12 **et égal à `event.difficulty`** ; le niveau d'ennemi reste indépendant 1–25.
5. **Un même boss + quête** avec **le même** `accomplishmentId`/run/campagne/PJ produit la même clé d'idempotence même si `kind` et l'ID éditorial d'événement changent. `validateXpRegistry` refuse le double enregistrement. Deux récompenses distinctes nécessitent deux `accomplishmentId` et une raison MJ distincte. Plusieurs PJ sélectionnés possèdent leurs suggestions distinctes : **pas de division des XP par défaut**, PNJ exclus.
6. **Décision/journal** : seul MATH produit `{status:'recorded'|'duplicate', receipts, nextLedgers, appliedToSheet:false}` après décision MJ explicite. `createXpMathJournalReference` ne fait que référencer un reçu déjà existant, statut `unverified-external-math-journal`, et ne doit **jamais** être traité comme une approbation ou un gain.
7. **Confidentialité** : ne transmettre ni `sourceContext` complet (notes de menace/assistance), ni source brute, ni `nextLedgers` à l'origine joueur ; construire une whitelist STUDIO indépendante. Refuser les IDs natifs hors limite sans alias ou troncature ; code d'erreur structuré utilisable par l'UI.
8. **Recette post-copie** : les 114 tests INDEX en Node et les suites MATH #99 63 tests sur clone complet Node24/npm ci ; tests CI navigateur réel à **HEAD composite exact**, contrôle d'absence de mutation, double crédit boss/quête, PNJ N20, versions/corrections, doublons, chargement/rechargement, sources/instances ; QA signe indépendamment.

## Références de sources exactes

- ARCHIVES DG003 `experiments/dg-lot003/src/storage/storage.mjs` : blob `be6a881018ae1709ecef71c3c5a155acfb94a658`, `previewCharacterImport` produit `prefix:sheet.id`.
- MATH PR #99 HEAD `e3fcbce49074bfcbe8814842a5ad57d0ba76160d` ; `math-xp/src/encounter-recommendations.ts` blob `58ee80a8345113aff89bfc58a3f276f3c401d7c2`, et `src/xp-decision.ts` blob `76daeb8ec21702e9ebcb27845ccd3d6b709ff574`.
- Ancien INDEX PR #97 HEAD `62ff4332b9e9ecb9a5437719eaefa61fad01d57d` ; correctif propriétaire sur nouvelle révision de cette même PR.
- La CI Chrome 42028928740 a échoué **avant** le correctif ; n'est pas une preuve positive du nouveau code.

**Aucune passation entre chats ni approbation de 05 n'est présumée tant que 05 n'a pas copié et testé.** Le dépôt du présent document sur #97 est une passation écrite consultable. Aucun merge/publication/canonisation.
