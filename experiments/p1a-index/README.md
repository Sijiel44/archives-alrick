# 11 INDEX — DATA-MODEL-001 P1-A / CORE-COMPAT-001

**Prototype de conception indépendant, non canonique, aucune modification de moteur ni de fiche historique.** Branché sur les contrats documentaires lus au 2026-11-06. Pour le rapport principal, consulter `docs/DATA_MODEL_001_RAPPORT_TECHNIQUE.md`.

## Fichiers

- `src/data-model.mjs` : enveloppe P1, contrôles de contenu, collisions, acteurs, import/export privé, candidat joueur **sans transmission**.
- `src/adapters.mjs` : adaptations proposées d'une métadonnée Markdown explicite et d'une source JSON native épinglée ; original conservé dans zone MJ.
- `src/core-ports.mjs` : ports purs pour progression M01, suggestion XP MATH et aperçu combat COMBAT, sans formule alternative.
- `schema/DATA_MODEL_P1A.schema.json` : proposition JSON Schema Draft 2020-12, **pas** une autorité de canon ni un validateur mécanique suffisant.
- `fixtures/P1A_FICTION_11_RECORDS.json` : les onze fiches synthétiques demandées ; `fixtures/CORE_SOURCE_SHA.json` : manifeste d'ancrage source/commit/blob.
- `tests/data-model.test.mjs`, `tests/core-compat.test.mjs` : tests réellement exécutés en Node 22 ; `tests/native-core-on-clone.test.mjs` : test natif TS **préparé non exécuté localement**, nécessite clone complet + `npm ci`/esbuild.
- `tests/generate-fixtures.py` : reproductibilité des seules données fictives ; `logs/` : sorties/commandes.

## Exécution réelle ici

```bash
python tests/generate-fixtures.py
node --test tests/data-model.test.mjs tests/core-compat.test.mjs
```

## Exécution prévue sur clone complet (non revendiquée)

```bash
npm ci
node --test experiments/p1a-index/tests/native-core-on-clone.test.mjs
```

Aucun outil n'écrit la sauvegarde ARCHIVES ni le site ; les ports ne débloquent pas `grantAward`, `AuthorizedM03Effect`, le Grimoire, les médias, le canon ou le joueur.
