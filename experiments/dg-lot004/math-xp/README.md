# L004-B — Passerelle XP / décisions MJ (MATH, non canonique)

**Source figée :** PR #85 / `prototype/dg003-integrated@2ab809ef5351940e0fc272b859d10f21de894d00`.
**Branche propriétaire :** `prototype/dg004-xp-math`.
**Périmètre exclusif :** `experiments/dg-lot004/math-xp/`.
**Moteurs inchangés :** M01–M05 ; aucun gain ni division automatique de statistiques, aucune adoption MATH-002.

## Entrée importable

`experiments/dg-lot004/math-xp/src/xp-decision.ts`

Exports :
- `XP_DECISION_SCHEMA = "cer.math.xp-decision.provisional.v1"` — contrat temporaire non canonique.
- `createXpDecisionLedger(seed)` : `campaignId`, `characterId`, `initialLevel` 1–25, `initialXp` choisi librement, `sessionMode:campagne|one-shot`, `characterOrigin:creation|pretire|import`, `paceNote:libre|rapide|etale`, `sourceRef` facultative. **Niveau et XP indépendants**, aucun gain automatique.
- `suggestXpFromM01(ledger,event)` : **suggestion seule** via `experienceAward` officiel. Renvoie `informationalOnly:true`.
- `recordXpMjDecision(ledger,command)` : enregistre dans un **nouveau journal** une décision avec ID, révision attendue, auteur MJ, date, motif et `approvedByMJ:true`. Familles `award` (montant `decidedXp` libre), `correction` (delta signé et référence initiale), `milestone` (palier 21–25), `promotion` (contrôle du niveau suivant). `appliedToSheet:false` dans tous les résultats.
- `inspectXpLedger(ledger)` : vue déterministe XP/niveau/paliers/alerte après correction, sans mutation.
- `previewXpProgression(ledger,target)` : `experienceRequired` + `canReachLevel` natifs, plus décision MJ distincte. Aucune promotion automatique.
- `nativeXpAndCosts(level,statFrom,statTo,masteryFrom,masteryTo)` : appels à `progressionAtLevel`, `experienceRequired`, `legacyExperienceRequired`, `developmentBudget`, `statCost`, `masteryCost`. Jamais de nouveau barème.
- Types `LedgerSeed`, `ExperienceCommand`, `ExperienceLedger`, `DecisionResponse`, `XpSuggestion`, `SessionMode`, `CharacterOrigin`, `PaceNote`.

## Exemple synthétique (non exécutoire)

```ts
import {createXpDecisionLedger,suggestXpFromM01,recordXpMjDecision,previewXpProgression} from "./src/xp-decision"
const initial=createXpDecisionLedger({
 campaignId:"fiction",characterId:"pj-fiction",initialLevel:5,initialXp:400,
 sessionMode:"one-shot",characterOrigin:"pretire",paceNote:"libre"
})
const event={id:"source-1",pattern:"exploration",domain:"exploration" as const,
 difficulty:6,scope:"ordinaire" as const,approved:true}
const suggested=suggestXpFromM01(initial,event) // 120 XP informatifs
const choice=recordXpMjDecision(initial,{
 kind:"award",id:"decision-1",expectedRevision:0,
 decidedBy:"MJ fictif",reason:"Arbitrage de table",approvedByMJ:true,
 at:"2026-11-05T10:00:00.000Z",event,decidedXp:42
})
// Journal = 442 XP ; niveau toujours 5 ; aucune écriture dans la fiche.
// Une correction ultérieure `deltaXp:-10` conserve l'attribution +42.
```

**Idempotence :** même ID et même commande => `duplicate` sans réécriture ; même ID/contenu différent => `ID_COLLISION`. Révision concurrente => `STALE_REVISION`. Corrections append-only et bornées par la récompense d'origine ; pas de solde négatif. Les niveaux 21–25 demandent les jalons MJ explicites du M01 ; les choix prétirés/one-shot/rythme ne modifient aucune formule.

## Tests reproductibles (clone ayant les dépendances existantes)

```sh
node --test experiments/dg-lot004/math-xp/tests/xp-decision.test.mjs
```

Le test charge les sources officielles M01/probabilités du même checkout et les appelle réellement (avec `esbuild` déjà installé ; sinon `tsc` présent). Aucun simulateur Python. Résultat local isolé Node 22/tsc 5.8.3 : **32/32 réussis**, aucune erreur ; `npm test` complet, navigateur et CI intégration non exécutés dans le conteneur MATH (DNS GitHub bloqué).

**Sécurité/portée :** `approvedByMJ:true` est déclaratif et local, pas une signature ; le journal ne propose pas d'importeur pour contenu non fiable. Ne jamais raccorder directement ce port à `grantAward` M02, qui applique automatiquement la valeur suggérée. Un changement de stats/niveau réel reste une décision et un adaptateur distinct à examiner par DG et QA.
