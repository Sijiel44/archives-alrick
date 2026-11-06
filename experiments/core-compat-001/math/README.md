# CORE-COMPAT-001 / 10 MATH

Dossier de compatibilité P1-A du 6 novembre 2026 : **rapports et tests uniquement**. Les modules officiels M01/M03/probabilités ne sont pas copiés dans cette branche ; ce test importe directement les sources Quartz de la branche/clone qui l'exécute. Le dossier ne crée ni formule, ni moteur parallèle, ni UI, ni sauvegarde.

- `docs/CORE_COMPAT_001_RAPPORT_TECHNIQUE.md` — constat et limites.
- `docs/CORE_COMPAT_001_MATRICE.csv` — 21 modules par chemin/blobs/dépendances/adaptateurs/preuves.
- `docs/CORE_COMPAT_001_CONTRATS_ET_GATES.md` — ports importables actuels, frontières proposées et recette.
- `docs/FICHE_DIRECTION_CORE_COMPAT_001.md` — verdict DG.
- `tests/native-invariants.test.mjs` — test Node réel qui compile les TypeScript officiels via `tsc` (préexistant), sans formule de substitution ; aucune dépendance ajoutée.
- `tests/NATIVE_12_TESTS.tap` et `tests/MATH_XP_67_TESTS.tap` — sorties TAP de tests locaux exécutés sur les blobs vérifiés (le second appartient à la PR #99, non copié comme source dans ce répertoire).

Sur clone complet dont les dépendances initiales sont installées :

```sh
node --test experiments/core-compat-001/math/tests/native-invariants.test.mjs
```

Contrôle XP à exécuter sur un composite contenant les sources MATH #99 :

```sh
node --test experiments/dg-lot004/math-xp/tests/xp-decision.test.mjs experiments/dg-lot004/math-xp/tests/encounter-recommendations.test.mjs experiments/dg-lot004/math-xp/tests/repair-math-browser-parity.test.mjs
```

La CI, le navigateur, la récupération d'INDEX R2 et la parité des **adaptateurs applicatifs réels** ne sont pas attestés par ce dossier ; voir les gates de QA.
