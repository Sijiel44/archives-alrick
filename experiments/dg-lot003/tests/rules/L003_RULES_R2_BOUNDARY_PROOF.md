# L003-RULES — Correctif R2, preuve de régression des frontières

**Mandat :** DG-LOT-003, revue contradictoire du port MATH. **Périmètre :** passerelle `src/rules/native-preview.ts` et tests `tests/rules/native-preview.test.mjs` exclusivement ; moteurs M01–M05 inchangés.

## Correctifs appliqués

- Refus avant appel M03 de tout `combat.mode` sauf `melee|tir|magie|mental` et de tout `combat.kind` sauf `physique|magie|mental`.
- Niveau du combattant et, si fourni, du défenseur : entier sûr **1..25**, avant appel natif, y compris en cas d'échec naturel et d'action mentale.
- `feasible` booléen strict dans les requêtes M01 et M03.
- Contrôles runtime des champs consommés par `validateM03AbilityEffect` : `id/status/effect/limitations/description` chaînes ; `approvedByGM` booléen ; `rank` entier sûr ; proposition structurée. Exception de validation capturée et retournée `status:"rejected"`, code `INVALID_ABILITY_SHAPE`.
- Toujours aucune formule nouvelle, aucune conversion d'effet numérique, aucun débit ni mutation.

## Commandes et preuves locales exécutées

Environnement local : **Node v22.16.0**, **TypeScript 5.8.3** ; sources M01, M03 et probabilités copiées à l'identique depuis `main@88f774f3d0d6d520d8d11443b72202b9caf4f94b`, blobs Git vérifiés. M02/opposition seulement stubs de types pour la compilation isolée. `esbuild` non présent dans ce conteneur.

```sh
tsc --target ES2022 --module commonjs --moduleResolution node --skipLibCheck --strict --noEmit experiments/dg-lot003/src/rules/native-preview.ts
node --test experiments/dg-lot003/tests/rules/native-preview.test.mjs
```

Résultat `tsc` : **code 0**. Résultat TAP final :

```text
ok 26 - modes M03 inconnus refusés avant résolution, sans exception
ok 27 - types de résistance inconnus refusés avant résolution, sans exception
ok 28 - toutes les enums natives M03 connues sont acceptées
ok 29 - niveau attaquant 1..25 validé avant échec naturel ou mode mental
ok 30 - niveau défenseur invalide refusé indépendamment de la résolution
ok 31 - feasible exige un booléen, pour M03 et M01
ok 32 - ability malformed: effect numérique et autres champs mal typés refusés sans exception
ok 33 - exception au contrôle d'une capacité est capturée et convertie en refus
1..33
# tests 33
# suites 0
# pass 33
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 885.422203
```

Les 25 contrôles antérieurs restent réussis. Les cas spécifiques de la revue (mode/kind `inconnu`, `ability.effect=7`) sont refusés sans exception. Les validations s'appuient sur le moteur TypeScript officiel, non un modèle Python.

## Empreintes vérifiées au moment du test

| Fichier | Blob Git |
|---|---|
| `src/rules/native-preview.ts` | `3e2a0260bd49e9447fae06ad4c14f76a5a9766c9` |
| `tests/rules/native-preview.test.mjs` | `ae82dda3d6c34afe2c3c5f44c7d3464e0d5afa77` |

**Limites :** ni checkout complet, ni `npm test`, ni validation `esbuild` du clone de la session, ni tests navigateur ou CI dans le conteneur MATH. La revue contradictoire sur clone complet (25 rules + 23 ports, avant correctif) est un résultat **rapporté par la session**, pas une exécution MATH. Les nouvelles modifications doivent être réintégrées et retestées par 05/QA.

**Statut :** anomalies de frontière signalées corrigées et couvertes par des tests réellement exécutés ; qualification du prototype intégré réservée à INTÉGRATION/QA.
