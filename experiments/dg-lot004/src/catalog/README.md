# L004-B/C — INDEX XP et chaîne descriptive (provisoire)

**Branche :** `prototype/dg004-index-xp-links`, base exactement `PR85@2ab809ef5351940e0fc272b859d10f21de894d00`. **Pas de canon, de règle, d'attribution d'XP ou de transaction.** L003 INDEX v0.2 est importé et laissé intact (Git blob `6c35e0da2c56a51dea9bce37b9cdc60cd2c75de5`).

## Import et exports pour 21 ATELIERS / 20 STUDIO / 05 INTÉGRATION

```js
import {
  createXpSuggestion, validateXpSuggestion, correctXpSuggestion, validateXpRegistry,
  previewXpSuggestion, previewLevelMatrix, LEVEL_REFERENCE,
  createDescriptiveChain, validateDescriptiveChain,createPrivateChainSnapshot,
  validatePrivateChainSnapshot,previewDescriptiveChain,
  validateDescriptiveCatalogReference,
} from './experiments/dg-lot004/src/catalog/index.mjs';
```

Toutes les factories/validateurs retournent `{ok,errors,...,executable:false}`. Une erreur est un **refus**, jamais une mutation de l'entrée. Aucun export ne donne une autorité MJ ou n'appelle `grantAward`, `approveMilestone`, le combat M03, le Grimoire ou l'inventaire.

### L004-B — XP

```js
const xp=createXpSuggestion({
  namespace:'local',
  target:{campaignId:'camp-demo',characterInstanceId:'pj-demo'},
  event:{id:'decouverte-1',pattern:'decouverte',domain:'savoir',difficulty:3,scope:'ordinaire'},
  context:{initialLevel:5,oneShot:{id:'fable-1',runId:'session-1'}},
  provenance:{originKind:'illustrative',sourceSchema:'dg004.fixtures',sourceId:'scene-demo',sourceVersion:'1'},
  rationale:'Suggestion fictive à discuter avec le MJ',
});
// xp.ok, xp.suggestion.id, xp.suggestion.idempotencyKey ; pas de xpGranted.
const preview=previewXpSuggestion(xp.suggestion,{experienceAward: portsMath.m01ExperienceAward, history: historyM01});
// candidateXp éventuel ; awardCommitted === false ; levelValidated === false.
const corrected=correctXpSuggestion(xp.suggestion,{reason:'Correction motivée',event:{...xp.suggestion.event,difficulty:4}});
// nouvelle version + correctionOf, même id et idempotencyKey. Garder les deux.
```

- La **suggestion** est une proposition versionnée et idempotente. Le champ `initialLevel` (1 à 25) est informatif. Le `oneShot.runId` distingue des sessions différentes ; la nouvelle session a une autre clé d'idempotence.
- `scope='majeur'|'legendaire'` : **preview bloquée**, sans forger `event.approved:true`. Le chemin de validation native par 10 MATH/MJ est distinct et reste à intégrer.
- `previewXpSuggestion` n'utilise aucun algorithme de montant. Il appelle le port M01 **injecté** (et ne peut pas attester lui-même que ce port est bien branché) avec `event.approved:false`, l'historique M01 complet et un résultat *candidat* ; sans port/historique, état `unavailable/invalid`.
- `previewLevelMatrix({progressionAtLevel})` délègue les niveaux 1/5/10/15/20/25 à M01 ; **n'appelle pas** `canReachLevel`, ne monte aucun niveau. Le mot « validé » d'un statut documentaire n'est jamais une permission MJ.
- `correctXpSuggestion` crée une révision immuable en avançant le SemVer stable, avec lien `correctionOf` et motif ; `validateXpRegistry` exige le parent lors du contrôle d'une archive complète, bloque collisions d'ID/version et réutilisation de clé d'idempotence entre événements.
- Une **attribution libre du MJ** est hors INDEX : M02 `grantAward` et `eligibleLevel` ou adaptation native séparée selon les arbitrages. Les montants proposés par INDEX ne sont jamais une écriture de campagne.

### Matrice M01 — éléments **lus au SHA de référence**

Les colonnes sont des **attentes de contrat à comparer au vrai TypeScript**, et NON un nouveau calcul INDEX.

| Niveau | XP requise M01 | Budget M01 |
|---:|---:|---:|
|1|0|0|
|5|400|24|
|10|2025|54|
|15|4900|84|
|20|9025|114|
|25|14400|144|

La suite `native-m01.test.mjs` importe **le TypeScript du dépôt via esbuild** et compare ces six points ainsi que `experienceAward`, la non-attribution et le verrou 21–25. Elle **échoue** si la source TypeScript ou `esbuild` manque : pas de faux test vert.

### L004-C — chaîne fictive OBJET → CAPACITÉ → CRÉATURE → SCÈNE

```js
const chain=createDescriptiveChain({
  id:'chain:local:flute-scene-1', version:'0.1.0', campaignId:'camp-demo',
  provenance:{originKind:'illustrative',sourceSchema:'dg004-fixture',sourceId:'flute-demo'},
  links:[
    {kind:'item',source:{id:'cap:local:item-flute',version:'0.1.0',schema:'entre-rives.catalog.entry.v0.2-proposal',status:'experimental',provenance:{originKind:'illustrative',sourceSchema:'dg004-fixture',sourceId:'flute-demo'}},instance:{id:'item-1',campaignId:'camp-demo'},status:'proposed'},
    {kind:'capability',source:{id:'cap:local:melodie',version:'0.1.0',schema:'entre-rives.catalog.entry.v0.2-proposal',status:'experimental',provenance:{originKind:'illustrative',sourceSchema:'dg004-fixture',sourceId:'cap-demo'}},status:'proposed'},
    {kind:'creature',source:{id:'creature-demo',version:'v1',schema:'alrick.bestiary.v1',status:'brouillon',profileId:'n5',ruleset:'m03',provenance:{originKind:'illustrative',sourceSchema:'dg004-fixture',sourceId:'cr-demo'}},instance:{id:'cr-1',campaignId:'camp-demo'},status:'proposed'},
    {kind:'scene',source:{id:'scene-source-1',version:'v1',schema:'cer.studio.dg003.provisional.v0',status:'brouillon',provenance:{originKind:'illustrative',sourceSchema:'dg004-fixture',sourceId:'scene-demo'}},instance:{id:'scene-1',campaignId:'camp-demo'},status:'proposed'},
  ]
});
const snapshot=createPrivateChainSnapshot(chain.chain,{
  item:{id:'flute-original',unknownField:'conservé',version:7},
  capability:{id:'melodie-original',narrative:'Aucun malus chiffré'},
  creature:{id:'c-original',stats:{physique:14}},
  scene:{id:'s-original',privateNotes:'SECRET MJ'},
});
// snapshot est MJ PRIVÉ. Ne jamais envoyer dans la fenêtre joueur.
```

- Les relations sont **strictement descriptives** (`described-by`, `referenced-by`, `staged-in`), la chaîne ne modifie ni objet, ni capacité, ni fiche Bestiaire, ni scène.
- `source.id/version/schema/status/provenance` n'est jamais égal à `instance.id/campaignId` ; l'identité du profil de créature (`profileId`,`ruleset`) est indépendante du code documentaire (`documentCode`).
- Les originaux et leurs champs inconnus sont conservés uniquement dans `createPrivateChainSnapshot`, contrôlés par `validatePrivateChainSnapshot` après round-trip JSON. Ne jamais exposer cette enveloppe à l'origine joueur.
- `previewDescriptiveChain` crée **un aperçu MJ**, pas un DTO public. Aucun effet narratif de la flûte ne devient un malus numérique. L'approbation MJ, l'association mécanique et la publication demeurent des opérations externes.

## Commandes et environnement

```bash
node --test experiments/dg-lot004/tests/catalog/catalog.test.mjs
# Dans le clone complet (npm ci, esbuild présent):
node --test experiments/dg-lot004/tests/catalog/native-m01.test.mjs
```

Sur cette exécution locale : Node 22.16.0, clone GitHub non disponible (`Could not resolve host: github.com`), sources PR85 lues via GitHub connecté, fichier L003 issu du ZIP conservé avec son blob exact. La suite Node isolée a réellement tourné. Le test M01 natif est livré pour exécution sur le clone de l'intégrateur, **pas présumé exécuté** ici. Aucune intégration navigateur ou CI globale revendiquée.

## Dépendances / décisions ouvertes

**MATH :** signature réelle du port M01, statut des accomplissements majeurs/légendaires, libre attribution MJ et historique pertinent pour idempotence ; revoir matrice et one-shots.
**ATELIERS :** boutons « suggérer » et « corriger », aucun « accorder XP » relié à INDEX ; réutilisation de sources/instances.
**STUDIO / ARCHIVES :** enveloppe privée, sauvegarde des révisions, politique de liens manquants et de suppression d'instance, whitelist joueur.
**QA :** consentement, permissions fail-closed, collisions inter-campagnes, canaris privés, import round-trip.
**INTÉGRATION :** importer uniquement ce module/ces tests ; ne pas fusionner PR propriétaire ; relancer test TypeScript natif au HEAD final.

---

## R2 du 05/11/2026 — compatibilité ARCHIVES, contrat MATH #99 et XP de rencontre/quête

**Origine de la correction :** [DG commentaire #6658247764](https://github.com/Sijiel44/archives-alrick/issues/93#issuecomment-6658247764) reproduit sur le vrai Chrome CI [run 42028928740](https://github.com/Sijiel44/archives-alrick/actions/runs/42028928740) l'échec `createXpSuggestion` sur l'ID ARCHIVES littéral `pj:l004-hero-fiction`. [DG enrichissement #6659005380](https://github.com/Sijiel44/archives-alrick/issues/93#issuecomment-6659005380) et [MATH #99@e3fcbce49074bfcbe8814842a5ad57d0ba76160d](https://github.com/Sijiel44/archives-alrick/pull/99), passation [#6662346332](https://github.com/Sijiel44/archives-alrick/issues/93#issuecomment-6662346332).

Le module **accepte l'ID natif tel quel**, sans convertir `:` en `-`, sans modifier la casse et sans inventer d'alias. Il accepte un unique segment typé `prefix:source-id`, format ASCII et **longueur totale ≤ 40** pour rester compatible avec la borne actuelle de `previewEncounterXp` MATH #99. Les identifiants plus longs d'ARCHIVES restent **refusés avec `code:'INVALID_NATIVE_INSTANCE_ID'`** jusqu'à accord MATH/ARCHIVES (ne jamais les tronquer). Un `pnj:` ne peut être ciblé comme PJ ; le rôle explicite est revérifié dans `sourceContext`.

### Génération et idempotence

- L'identifiant de suggestion reste **distinct** de l'ID d'instance : `xp:<namespace>:v2-<base32-url-safe>` est dérivé d'un tuple canonique (eventId, instanceId, run, accomplishmentId optionnel), encodé en base32 injectif, sans hachage tronqué. Si le résultat dépasse la limite du schéma, la factory renvoie **`ID_DERIVATION_TOO_LONG`** : donner un **`id` explicite**, jamais un alias silencieux.
- La clé d'idempotence v2 est un tuple JSON exact `[campaignId,characterInstanceId,runId,accomplishmentId|eventId]`, avec préfixe `xpkey:v2:` ; deux-quatre champs ne se recollent plus ambiguës via des séparateurs. Les **anciens** documents de suggestion sans `sourceContext` portant une clé v1 originale peuvent encore être validés *sans mutation* ; `validateXpRegistry` compare aussi les **sources canoniques** pour refuser le double crédit v1 + v2 et le doublon boss/quête.
- `code`, `issues:[{code,path,message}]` sont ajoutés sur les erreurs XP tout en conservant `errors:string[]` des consommateurs existants. La correction est immuable et chaque tentative de détourner `accomplishmentId` ou `runId` est refusée.

### Entrée fictive enrichie — jamais un montant accordé

```js
import {
  createXpSuggestion, previewXpSuggestion, validateXpRegistry,
  previewMathEncounterFragment, createXpMathJournalReference,
} from './experiments/dg-lot004/src/catalog/index.mjs';

const result=createXpSuggestion({
  id:'xp:demo:boss-et-quete-pj1',namespace:'demo',
  target:{campaignId:'camp-a',characterInstanceId:'pj:l004-hero-fiction'},
  event:{id:'evt-a',pattern:'paix-negociee',domain:'diplomatie',difficulty:6,scope:'ordinaire'},
  context:{initialLevel:5,oneShot:{id:'session-fictive',runId:'run-01'}},
  provenance:{originKind:'illustrative',sourceSchema:'dg004.fictive',sourceId:'scene-1'},
  rationale:'Résolution pacifique grâce aux PJ et au secours PNJ N20.',
  sourceContext:{
    kind:'encounter',accomplishmentId:'boss-et-quete-1',runId:'run-01',
    eventStatus:'observed',participants:[
      {instanceId:'pj:l004-hero-fiction',role:'pj',level:5},
      {instanceId:'pnj:mentor',role:'pnj',level:20}],
    selectedPjIds:['pj:l004-hero-fiction'],
    threats:[{instanceId:'boss-1',level:15,count:1,boss:true}],
    assistance:{level:'decisive',npcIds:['pnj:mentor'],reason:'Aide décisive'},
    difficultyBeforeAssistance:'difficile',realizedDifficulty:'moderee',
    explicitM01Index:6, // explicitement proposé ; jamais N15→indice 6 automatiquement
  },
});
if(!result.ok)throw Error(result.code+' '+JSON.stringify(result.issues));
const m=previewMathEncounterFragment(result.suggestion);
// m.mathInputFragment contient la correspondance des champs MATH #99.
// m.missingExternalFields : ['eventApprovedByMJ','ledgersByPj'].
// Seul MATH/STUDIO fournit l'autorisation MJ réelle et les ledgers privés.
// MATH.previewEncounterXp({...m.mathInputFragment,eventApprovedByMJ:FROM_MJ,ledgersByPj:FROM_MATH});
```

**Contrat MATH exact :** `cer.math.encounter-xp.provisional.v0` expose `previewEncounterXp(scene)` et `recordEncounterXpChoice(scene,allocation)`. INDEX ne dépend pas de ces fonctions à l'exécution et ne fabrique **ni `eventApprovedByMJ`, ni `ledgersByPj`**, ni `decision.approvedByMJ:true`. Les suggestions INDEX ne contiennent aucun `decidedXp`, `commonXp`, `individualXp` ou `grantAward`. Un événement enrichi utilise comme **ID M01 natif de source** `JSON.stringify([campaignId,runId,accomplishmentId])`, exactement comme MATH #99 ; un historique M01 contenant ces ID JSON canoniques est accepté. `previewXpSuggestion` délègue à un port `experienceAward` injecté, **n'adopte aucun barème** et ne calcule pas d'indice depuis un niveau hostile. Sans `explicitM01Index`, cette prévisualisation directe est indisponible : passer par la proposition expérimentale `previewEncounterXp` MATH.

`createXpMathJournalReference(suggestion,receipt)` produit uniquement une **référence inerte** à un reçu `recordEncounterXpChoice` existant (`{status:'recorded'|'duplicate',pjId,decisionId}`), avec `authority:'unverified-external-math-journal'`, jamais un reçu authentifié ou une entrée de journal créée par INDEX. **MATH** reste propriétaire du journal append-only, des choix MJ globaux/individuels (y compris zéro) et de la détection de doublons. Une simple référence INDEX ne confirme jamais une décision.

La chaîne fictive L004-C (flûte descriptive → capacité → créature → scène) et ses snapshots MJ privés demeurent inchangés ; aucun malus numérique et aucune publication automatique.

### Tests et limites de R2

```bash
node --test experiments/dg-lot004/tests/catalog/catalog.test.mjs experiments/dg-lot004/tests/catalog/catalog-r2.test.mjs
# dans un clone complet avec npm ci/esbuild :
node --test experiments/dg-lot004/tests/catalog/native-m01.test.mjs
```

La première commande exécute les **64 tests L004 d'origine + 50 nouveaux tests R2** (régression Chrome, limites d'identifiant et namespace, absence d'alias, collisions, source boss/quête, sélection PJ/PNJ, PNJ N20, aides, indice 1–12 distinct du niveau de menace, corrections, journal de référence, no-apply, source MATH canonique et round-trip). La seconde **n'a PAS pu s'exécuter ici** faute de clone complet / esbuild (le refus `ERR_MODULE_NOT_FOUND` est conservé en preuve), et la recette Chrome intégrée doit être relancée par 05/QA **sur le nouveau HEAD intégré**, sans prétendre corriger rétroactivement le run #42028928740.
