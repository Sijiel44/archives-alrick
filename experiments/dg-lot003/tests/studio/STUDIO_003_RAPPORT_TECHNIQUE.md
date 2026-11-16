# L003-COCKPIT — Rapport d'exécution STUDIO

**Mandat :** DG-LOT-003, PR #84 `b5c59854b802dc25617d9bcd7c576495199a41dd` ; contrat source lu `DG_LOT_003_ORDRE_EXECUTION.md` blob `80f4980d6b26e172bf312d446956417ee2a157a4` et `DG_LOT_003_PASSATIONS_OPERATOIRES.md` blob `7743f5f012e4f198662685e0c3e604169c14203f`.

**Base code :** `88f774f3d0d6d520d8d11443b72202b9caf4f94b`, arbre `9338febb6b7ec15be9a43dcd23f96aaeee5a751e`.

**Branche :** `prototype/dg003-studio`. **HEAD :** `2335974698df6844ec804a67eb0ac0172fd3580f` ; arbre `0cc467393acfb54e44dd60a892c8a8207a3d5734`. **PR brouillon :** https://github.com/Sijiel44/archives-alrick/pull/88 . Pas de merge ni publication.

## Fichiers réellement committés

- `experiments/dg-lot003/src/studio/index.mjs`: `mountStudio`, parcours campagne/import PJ/copie de créature/scène+notes privées/sélection/export/restauration. Ports injectés.
- `experiments/dg-lot003/src/studio/projection.mjs`: DTO joueur neuf, liste blanche, validateur strict et contrôle origines.
- `experiments/dg-lot003/src/studio/CONTRACT.md`: exports/options/interfaces provisoires.
- `experiments/dg-lot003/src/player/index.mjs`: `mountPlayer`, READY et SHOW/CLEAR sur `message.source`, `message.origin`, canal exact. Aucune lecture/écriture localStorage.
- `experiments/dg-lot003/tests/studio/projection.test.mjs`: 11 tests unitaires Node.
- `experiments/dg-lot003/tests/studio/harness-studio.html`, `harness-player.html`, `harness-studio.mjs`, `browser-runner.py`: banc navigateur sur vraies pages HTTP 4173/4174 et faux ports documentés comme tests uniquement.
- `experiments/dg-lot003/tests/studio/browser-results.json`: preuve de blocage d'environnement.
- `experiments/dg-lot003/tests/studio/STUDIO_003_FICHE_DIRECTION.md`: fiche DG pour intégrateur.

**Diff vérifié :** 1 commit devant, 0 derrière base, uniquement ces 11 fichiers sous arborescences propriétaires. SHA de blobs GitHub confirmés égaux aux `git hash-object` calculés sur les fichiers locaux d'origine.

## Tests et commandes réellement effectués

Environnement de ce référent : Node **v22.16.0**, Chromium `/usr/bin/chromium`, Python Playwright présent ; clone complet absent.

- `git clone --depth 1 --branch main https://github.com/Sijiel44/archives-alrick.git repo` : **ÉCHEC** `Could not resolve host: github.com`.
- Lecture de la PR #84, sources du dépôt, création de branche, de blobs Git, d'arbre, de commit et de PR via connecteur GitHub : **RÉUSSI**.
- `node --test tests/studio/*.test.mjs` dans le sous-dossier `experiments/dg-lot003` : **11/11 PASS**, 0 fail, 0 skipped. Sortie originale `STUDIO_L003_LOG_NODE.txt`.
- `node --check src/studio/index.mjs`, `src/studio/projection.mjs`, `src/player/index.mjs`, `tests/studio/projection.test.mjs`, `tests/studio/harness-studio.mjs` : **RÉUSSI**.
- `python -m py_compile tests/studio/browser-runner.py` : **RÉUSSI** (syntaxe Python seulement).
- `python tests/studio/browser-runner.py` : **BLOQUÉ** avant première page ; navigate to `http://127.0.0.1:4173/tests/studio/harness-studio.html` -> `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Serveurs HTTP locaux 4173/4174 atteignables au socket ; aucun contournement effectué.
- `npm ci`, `npm test` du dépôt, esbuild de l'intégrateur, CI GitHub sur la PR, tests QA sur HEAD final intégré : **NON EXÉCUTÉS** ici. Les résultats de base fournis par DG ne constituent pas une preuve produite par STUDIO.

## Contrats de sécurité réellement implémentés

- Origines strictement `http://127.0.0.1:4173` pour MJ et `http://127.0.0.1:4174` pour joueur ; si MJ sert ailleurs, projection désactivée.
- DTO `cer.studio.player.whitelist.dg003.v0` fabriqué champ par champ avant `postMessage`, contenant uniquement `schema`, `revision`, `scene.title`, `scene.description`, `scene.visibleActors[].label` opt-in. Aucun `gmNotes`, `privateSnapshot`, `source` ou enveloppe complète envoyé au joueur.
- `mountPlayer` n'écrit aucune donnée au stockage du navigateur joueur ; vérifie canal, source et origine. Le DOM joueur est construit exclusivement avec `textContent` ; aucune insertion HTML de données importées.
- Import v2/v3 et restauration restent prévisualisés sans mutation jusqu'à acceptation ; validation complète des octets/SHA et collisions demeure la responsabilité des ports ARCHIVES, non simulée comme homologuée.
- Mode expert ne calcule pas les 5d6 ; appelle `rules.previewM03({commit:false})` uniquement si `nativeValidated===true`. Familles non homologuées affichées indisponibles.

## Réserves, risques et avis

**VALIDÉ dans le périmètre exécuté :** sources importables sans side effects, 11 tests Node, limite de chemins, SHA source=GitHub, PR brouillon.

**RÉSERVÉ :** wiring réel des ports ARCHIVES/BUILDER/INDEX/BEST, preuve DOM et postMessage sur vrais navigateurs, isolation cross-origin au HEAD intégré, tests stockage navigateur, focus/tablette réelle et CI ; couverts par le script E2E préparé mais non exécuté ici.

**BLOQUÉ ici :** recette Chromium (politique administrateur), clone Git (DNS). Non contournés.

**NON EXÉCUTÉ :** npm ci/test du dépôt, tests intégration et QA, application finale, CI. Aucun statut Alpha validée.

**À revoir par 05 INTÉGRATION, 01 BUILDER, 04 ARCHIVES, 11 INDEX, 02 QA. À valider par DG/créateur :** câblage des vrais ports et acceptation P0/P1 sur HEAD final de la PR intégration.
