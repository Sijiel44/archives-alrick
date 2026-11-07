# Journal de commandes et limites — INDEX P1-R2

**Base exacte** #105 `4f3dffd51f16c0c1881f925a94a677a87feff17c` ; #102 `85f473d2005903a6fc81d37a83fcc6b3c6d16466`; #104 `f84f8c54361b3701ebb0251700f2d0d09d4acf4d`. Environnement local Node 22.16.0, Python 3.13.5, `jsonschema` 4.26.0. Ne pas attribuer une exécution dans les autres outils.

Exécuté réellement (répertoire racine de `experiments/p1a-index/`, modules R1 d'origine sans changement) :

```bash
node r2/tests/generate-r2-fixtures.mjs
python r2/tests/build-profile-schema.py
python r2/tests/check-r2-schema.py
node --test tests/data-model.test.mjs tests/core-compat.test.mjs r2/tests/model-r2.test.mjs
node --check r2/tests/native-core-on-assembled-clone.test.mjs
node --check r2/tests/native-storage-on-assembled-clone.test.mjs
node --check r2/tests/original-ateliers102-on-assembled-clone.test.mjs
```

**Résultats** : 112/112 tests Node PASS, 0 échec ; `Draft202012Validator.check_schema` PASS ; 15/15 fixtures R2 validées ; 9/9 contre-tests JSON Schema invalides comme prévu ; 11 fixtures antérieures R1 restent valides sous leur schéma R1 et non promues silencieusement vers R2. `node --check` ne prouve pas la réussite des suites natives. Logs inclus.

Non exécuté : test des 14 fixtures #102 *originales* dans notre conteneur, charge TypeScript M01/M03 via esbuild, tests nativement importés de #104/IndexedDB, navigateur Chrome réel, journaux/révisions en concurrence, migration historiques v2/v3, tests média/licences, profil de sécurité client réel, validation signée de 04 ARCHIVES/21 ATELIERS/10 MATH/02 QA. Les 15 fixtures locales sont explicitement nouvelles et 100% fictives. Les vrais sources #102/#104 ont été lues par le connecteur GitHub, sans copie exécutable locale.

**Intégration à exiger** : checkout composite propriétaire avec commits / blobs vérifiés, exécution des trois `*-assembled-clone.test.mjs`, tests de sécurité/CI/Chrome sur SHA final et journal de résultat. Aucune donnée MJ réelle n'a été utilisée. Le paquet JSON P1 conserve des valeurs JSON de manière sémantique mais **n'est pas** une archive brute octet-exacte.
