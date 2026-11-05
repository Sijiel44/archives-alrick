# L004-B.R2 — Contrat importable et passations vers 05 / INDEX / QA

**Sources obligatoires** : directive [#93 DG 6659005380](https://github.com/Sijiel44/archives-alrick/issues/93#issuecomment-6659005380) et contrat INDEX PR #97, `experiments/dg-lot004/src/catalog/CONTRACT.md` (blob lu `42ab07ba3eea9852f76a3684e83e8b5c9713b414`). Module MATH indépendant, version provisoire `cer.math.encounter-xp.provisional.v0`.

## Exports exacts

`experiments/dg-lot004/math-xp/src/encounter-recommendations.ts` :
- `previewEncounterXp(scene: unknown): XpEncounterResult` : accepte une scène fictive structurée ; retourne soit `status:'preview'` avec indice expérimental, montants natifs M01 par PJ, comparaison B, signalement du risque, soit `status:'rejected'|'unavailable'` avec code/motif. **Toujours** `canAutoApply:false`, `appliedToSheet:false`.
- `recordEncounterXpChoice(scene: unknown, allocation: unknown): DistributionResult` : autorise la décision **déclarée** du MJ, par PJ sélectionné, utilise `recordXpMjDecision` existant pour append-only/idempotence, retourne de **nouveaux journaux** et reçus ou rejette intégralement, **jamais les fiches**.
- `XP_ENCOUNTER_SCHEMA`, types `XpEncounterInput`, `SceneActor`, `ThreatFact`, `AssistanceFact`, `AllocationInput`, `XpEncounterPreview`, `XpEncounterResult`, `DistributionResult`, `ParticipantProposal`.

### Entrée scène minimale

```ts
const scene={
 campaignId:'demo',runId:'run-1',accomplishmentId:'boss-et-quete-1',kind:'encounter',
 eventPattern:'negociation',eventDomain:'diplomatie',scope:'ordinaire',
 eventApprovedByMJ:false,
 difficultyBeforeAssistance:'difficile', // proposition expérimentale : indice 9
 // realizedDifficulty:'moderee', // choisi par MJ OU proposé pour aide PNJ décisive attestée
 // explicitM01Index:4, // MJ choisit 1..12 : prime sur étiquette
 actors:[{instanceId:'pj:hero',role:'pj',level:5},{instanceId:'pnj:mentor',role:'pnj',level:20}],
 selectedPjIds:['pj:hero'], // obligatoire, jamais choisi automatiquement par MATH
 threats:[{instanceId:'boss-1',level:15,count:1,boss:true}],
 assistance:{level:'decisive',npcIds:['pnj:mentor'],reason:'Aide décisive attestée'},
 ledgersByPj:{'pj:hero':existingLedgerFromCreateXpDecisionLedger}
}
const preview=previewEncounterXp(scene) // M01 natif : 120 XP candidat, aucune attribution
const receipt=recordEncounterXpChoice(scene,{
 mode:'common',commonXp:42,
 decision:{id:'decision-mj-1',at:'2026-11-05T15:00:00.000Z',decidedBy:'MJ fictif',
           reason:'Effort réel de PJ',approvedByMJ:true}
}) // NOUVEL journal XP = 42 ; fiche originale intacte
```

`mode:'individual'` prend un objet `individualXp:{'pj:hero':17,...}` pour **chaque PJ choisi**. `mode:'common'` peut fournir `overrides` par PJ sélectionné. Une sélection de PNJ est toujours rejetée, y compris si le PNJ a contribué. La prévisualisation ne crédite rien. Les temps, IDs, niveaux, `kind`, `scope`, descriptions, assistance sont contrôlés ; N26 et indices 13 sont refusés.

## Dépendances et blocages

| Référent | Passation précise | Statut |
|---|---|---|
| **05 INTÉGRATION** | Copier par blobs le nouveau `src/encounter-recommendations.ts`, `tests/encounter-recommendations.test.mjs`, le générateur et les rapports ; exécuter les **63 tests** de MATH sur le clone complet, câbler un bouton « Calculer » vers `previewEncounterXp` sans journal/applications automatiques ; afficher deux modèles avec l’étiquette « expérimental ». Une décision MJ explicite peut appeler `recordEncounterXpChoice`, **jamais** `grantAward`. | Préparé, non présumé intégré |
| **11 INDEX PR #97** | Reconnaître IDs natifs d'instance tels que `pj:l004-hero-fiction` distincts du slug de suggestion `xp:<namespace>:<slug>` ; ne pas convertir les `:` en alias silencieux. Conserver `campaignId/runId/accomplishmentId` et identité source événement, boss/quête partageant `accomplishmentId` pour empêcher doublon. Éviter `approved:true` forgé et préserver SemVer/provenance des suggestions. | Réponse/correctif INDEX à vérifier par 05/QA |
| **21 ATELIERS / 20 STUDIO** | UI mode simple/expert : menace, nombre, boss, danger attesté, réalisation pacifique/combat, aide réelle PNJ, liste MJ de PJ sélectionnés, indice 1..12 modifiable, portée validée, comparaison A/B, XP commun ou individuels, confirmation avant journal. Aucun XP PNJ. Étiquettes « recommandation expérimentale » et garde P0. | Prototype UI non fait ici |
| **02 QA / 03 REVUE** | Tests TS réels M01 ; menace N2/15/20/25 ; aide PNJ N20 ; boss et portée ; 3+ ennemis ; pacifique ; niveaux 1/5/10/15/20/25 et 25+ ; identifiants ARCHIVES avec `:` ; idempotence et double boss/quête ; rechargement réel ; absence de débit/XP PNJ ; authentification MJ non prouvée. | Tests unitaires MATH faits ; QA navigateur/assemblage réservé |

## Tests et preuves

```sh
node --test experiments/dg-lot004/math-xp/tests/xp-decision.test.mjs experiments/dg-lot004/math-xp/tests/encounter-recommendations.test.mjs
# => 63 tests, zéro fail, zéro skip en isolation locale avec TypeScript M01/probabilités exacts.
node experiments/dg-lot004/math-xp/tests/generate-xp-simulations.mjs
# => JSON déterministe (docs/L004_B_SIMULATIONS.json), M01 réel.
```

**Source M01 originale** (sans copie modifiée dans PR) : `quartz/components/scripts/atelier5d6-progression.ts`, Git blob `d2040829ea0da7c0f6eae08dc8c701226bfc53c5`. Probabilités blob `bfee984fad47902623f7117e9f024a5b6e042d2d`. Aucun test Python. **Clonage complet et CI spécifique au nouveau HEAD non attestés depuis le conteneur MATH** ; la reprise par 05 et 02 doit être vérifiée au HEAD assemblé.
