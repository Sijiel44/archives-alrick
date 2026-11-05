# INDEX L004-B.R2 — trace des commandes et statuts

Environnement du spécialiste : Node `v22.16.0`, Git disponible mais réseau GitHub DNS refusé ; code antérieur et fixtures tirés de l'archive R1 fournie, fichier L003 conservé avec son blob Git exact, sources DG/MATH/ARCHIVES consultées via GitHub connecté au SHA référencé.

## Tests réellement exécutés

```bash
node --check experiments/dg-lot004/src/catalog/index.mjs
# code de sortie 0
node --test experiments/dg-lot004/tests/catalog/catalog.test.mjs experiments/dg-lot004/tests/catalog/catalog-r2.test.mjs
# 114 tests, 114 PASS, 0 FAIL, 0 SKIP : fichier L004_R2_TEST_RESULTS_NODE22.tap
```

## Essai natif impossible (pas un PASS)

```bash
node --test experiments/dg-lot004/tests/catalog/native-m01.test.mjs
# ERR_MODULE_NOT_FOUND: Cannot find package 'esbuild'
```

L'absence de clone du dépôt complet bloque la suite M01 TypeScript et les tests MATH #99. Résultat original préservé dans `L004_R2_NATIVE_M01_NON_EXECUTE.txt`. Aucun `npm ci`, `npm test`, `esbuild`, Chrome, CI intégrée post-correctif dans cet environnement. Le run 42028928740 **échoué avant correctif** est une preuve de régression à réparer, pas une recette réussie du nouveau code.

```bash
git ls-remote https://github.com/Sijiel44/archives-alrick.git HEAD
# fatal: Could not resolve host: github.com
```

**Attendu de 05/QA après copie par SHA** : tester sur le **nouveau HEAD composite** avec Node24/npm ci, suite MATH #99 et vraie recette Chrome/loopback. Ne pas déduire une CI verte des 114 PASS propriétaires.
