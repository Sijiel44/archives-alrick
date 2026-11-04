# L003-INTEGRATED — Rapport de livraison candidat QA (2026-11-04)

**État : candidat d'assemblage complet du prototype, non qualifié tant que la recette finale n'est pas passée.**  
**PR :** [#85 brouillon](https://github.com/Sijiel44/archives-alrick/pull/85).  
**Base officielle :** `88f774f3d0d6d520d8d11443b72202b9caf4f94b`.  
**Ordre DG :** `b5c59854b802dc25617d9bcd7c576495199a41dd`.

## Provenance et périmètre
Sept modules (dont player/STUDIO comme un seul propriétaire) présents sur la branche d'intégration et épinglés dans `manifest.json` avec Git blobs :
- BUILDER ports : `5375014a30dc026a8cc58208cd0c9cabf02c86c2`.
- MATH corrigé : `ae11f209e43c2414b588692a7ad7a022c31656d5`.
- INDEX : `ec5c8eccd8116209a88f32a9bc3d2cd1b2e44161`.
- STUDIO et player : `1cdbb6640a3d9f0d4473d66e1ca3d030ceef3c4a`.
- ATELIERS `injectStyles:false` : `48e0a6fa3c7650af424db3565a0582850f213b93`.
- ARCHIVES auteur du ZIP SHA256 `167e556a62c9992b228fbe760bdafba368f0ceda312176f717e1801075a1d81f` ; transport attesté `transfer/dg003-storage-source` à `2459876b9f8bd0cf7f7a588e09b709bca3c221c3`; **commit source original ARCHIVES inconnu (null), pas attribué frauduleusement**. Module SHA256 `11411d3489c2a1969d268889b513a60d9de13e82648d5e928da77408097a3733`.

Copies sous les sous-arbres exclusifs, aucun merge propriétaire ni écriture Quartz ou Pages. Quatre blobs critiques BUILDER, puis les sept blobs points d'entrée, ont été revérifiés sur GitHub et concordent avec le manifeste.

## Fonctionnalités câblées
- Compose et runtime intégrateur, ports DI, `mountStudio` / `mountPlayer` / `mountCreators` réels, deux bundles distincts et deux origines HTTP 127.0.0.1:4173/4174.
- ARCHIVES : prévisualisation v2/v3, rejet explicite multi-sheet, commit non destructif, octets/sheet bruts/SHA, sauvegarde privée, restauration pure et remplacement explicitement validé. `localStorage` MJ seulement, enveloppe privée non chiffrée de prototype : jamais employer avec des secrets réels.
- BEST : génération de la créature fictive N5 par le code M04 officiel; identités source/profil/instance séparées, sans dépendre de PR #76.
- INDEX + ATELIERS : trois fiches descriptives locales, provenance INDEX structurée, restrictions, exclusion des effets numériques, styles CSS externes (CSP restrictive). Brouillon original entier préservé dans `extensions.creatorDrafts[].original`, jamais projeté vers le joueur.
- MATH : aperçu M03 délégué au vrai moteur corrigé, sans application. Absorption, Autorités 25+, débit mana/charge, objets numériques bloqués.
- Projection joueur via whitelist STUDIO, origine distincte, bundle joueur sans imports privés MJ.
- Cohérence catalogue : création et export immédiat lisent le stockage persistant même si l'état STUDIO est périmé ; restauration exacte depuis ancien export n'hérite jamais des entrées postérieures. La correction la plus récente laisse **absentes** les clés `catalog`/`creatorDrafts` absentes du backup.

## Tests et faits vérifiés
- Session d'orchestration sur SHA `dea4961…` : `npm test` du dépôt rapporté PASS (uniquement cet ancien SHA).
- Session d'orchestration sur SHA `e81cc0244c0e1fc47f8d74fe869eb7651f927dbb` : build 7 modules et 157/157 tests unitaires PASS (ancien SHA).
- Session d'orchestration sur SHA `947bb445347a918e5a5aaecdbb8bfeb88a2f6ee7` : build 7 modules PASS ; test-unit 160/161, unique échec sur ajout des deux clés vides au backup. **Cette erreur est corrigée ultérieurement**, sans suppression d'assertion.
- À la présente livraison, **tests Node/npm/Chromium sur le HEAD final : NON EXÉCUTÉS dans cette conversation**. CI du HEAD final et avis QA : pas de résultats reçus. Aucun succès inventé.
- Tests disponibles : six groupes propriétaires réels (player vérifié sous STUDIO), `tools/adapters.test.mjs`, `tools/runtime.test.mjs` (inclut création/export immédiat/restauration ancienne et conservation originale), `tools/test-browser.mjs` avec Chrome CDP sur vraies pages servies. Aucune suite Python parallèle ni harness substitué aux modules réels.

## Commandes obligatoires au HEAD final
```sh
npm ci
npm test
node experiments/dg-lot003/tools/build.mjs
node experiments/dg-lot003/tools/test-unit.mjs
node experiments/dg-lot003/tools/test-browser.mjs
```
Le test navigateur démarre ses deux serveurs ; ne pas démarrer `serve.mjs` concurremment. Pour inspection manuelle, `node experiments/dg-lot003/tools/serve.mjs` séparément après build.

## Risques et décisions
P0 surveillés par QA : absence de fuite de canaris MJ dans DOM/postMessage/localStorage/export public ; rejet des données source invalides ; aucune application de règle non homologuée. P1 : comportement Chromium du parcours complet, claviers/focus, exactitude des restaurations et recettes sur le dernier commit. Ces points restent ouverts jusqu'au résultat QA.

**À revoir par :** QA, REVUE, BUILDER, MATH, INDEX, ARCHIVES, STUDIO, ATELIERS.  
**À valider par DG/créateur :** clôture de qualification, éventuelle fusion ou publication (non autorisées à ce stade).

## Addendum L003-08 et CI — candidat final pour QA

- Panneau MJ de lecture seule `#native-preview-details` ajouté à `index.html` ; la réponse `result.value.output` du véritable moteur M03, les entrées fictives et `applied:false` sont affichées par `textContent`. Aucun calcul alternatif et rien dans le bundle joueur.
- Recette `test-browser.mjs` : assertion explicite de ce panneau en DOM réel sur l'origine 4173. Détection navigateur avec priorité à Chrome officiel, `CHROMIUM_PATH` explicite, versions et diagnostic stderr/stdout bornés, code/signal du processus si `DevToolsActivePort` n'arrive pas. Aucune option `--no-sandbox`.
- Workflow : checkout du SHA source de PR, jamais du merge virtuel ; journal `sourceIntegrationHead` / `testedHead`, exécution QA indépendante après build lorsque la PR QA fournit un `integration-contract.json` non placeholder et `dg003-e2e.test.mjs`. Le verdict QA est **NON EXÉCUTÉ sur la branche intégrée** ; aucun test navigateur produit final n'est revendiqué comme PASS.
- **Preuves antérieures, pas preuve du HEAD final :** session orchestratrice build 7 modules / 161 sur 161 Node24 PASS sur `771c78d…`; CI run 41884724758 (job 126766002951) build/unitaires PASS et navigateur FAIL avant application, sur merge virtuel `8a536b998af84abb313d929d96cbb79183e7b652`. Cause du démarrage Chrome non établie avant la prochaine exécution.
