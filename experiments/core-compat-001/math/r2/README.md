# CORE-COMPAT-001.R2 / 10 MATH — port DATA vers règles natives

Le livrable **ne recrée aucun moteur** et ne change aucun module Quartz, INDEX, XP ou Studio. Il constitue un petit adaptateur d'injection et deux tests distincts.

**Contrat importable** : `src/data-native-ports.mjs`, version `cer.math.core-compat.data-native-ports.provisional.v0`.

```js
import {
  previewDataProgression,previewDataCombat,previewDataXp
} from './src/data-native-ports.mjs';

// Le validateur provient impérativement de INDEX #105, pas de l'UI :
const ports = {
  validateModelRecord,    // INDEX PR105
  previewNativeLevel,     // INDEX PR105
  previewNativeCombat,    // INDEX PR105
  inspectNativeXpSuggestion, // INDEX PR105
  progressionAtLevel,     // M01 OFFICIEL
  resolveCombatM03,       // M03 OFFICIEL
  suggestXpFromM01       // MATH #99 -> M01 OFFICIEL
};
const view = previewDataCombat(candidatePj, {
 natural:24,rawStat:16,masteryRank:4,situation:0,level:10,
 difficulty:21,kind:'physique',mode:'melee',feasible:true,baseDamage:6
},ports);
// view.status === 'preview'; view.result vient de M03 natif ;
// view.appliedToSheet === false ; view.playerReady === false.
```

**Aucun effet numérique dans les entrées DATA** : les objets/capacités/rites/sorts sont des références descriptives ; les DATA `reported-validated` ne confèrent pas d'approbation. Pas de malus d'objet, `absorption`, MATH-002, débit, crédit, publication ou progression automatique.

## Exécution

```sh
# Banc isolé : 19 tests, utilise vrais TS M01/M03/MATH XP et port INDEX #105
# figé octet-identique dans tests/reference-index105/core-ports.mjs.
node --test experiments/core-compat-001/math/r2/tests/data-native-bridge.test.mjs

# Gate de réconciliation sur une base P1 contenant VRAIMENT INDEX #105
# (son DATA validator, 11 fixtures, port réel) et les moteurs natifs.
node --test experiments/core-compat-001/math/r2/tests/index-105-on-clone.test.mjs
```

Le premier banc utilise un **bouchon de validation DATA** explicitement limité aux fixtures ; ce bouchon n'est jamais un module produit. Le second est fail-closed `INDEX_105_SOURCE_ABSENT` si le véritable module manque. Le composer et l'exécuter est une opération P1 séparée de PR #95, propriété de 05 uniquement pour P0.

Lire `docs/CORE_COMPAT_001_R2_RAPPORT_TECHNIQUE.md` et `docs/FICHE_DIRECTION_CORE_COMPAT_001_R2.md` pour SHA, validations et arbitrages. Les commandes et sorties TAP originales sont dans `tests/`.
