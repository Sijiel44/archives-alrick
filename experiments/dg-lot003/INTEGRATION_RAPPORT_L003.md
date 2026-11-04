# L003-INTEGRATED — rapport technique intermédiaire 05 (2026-11-04)

**État :** prototype PARTIEL, NON QUALIFIÉ. **PR brouillon :** #85. **Base exacte :** `88f774f3d0d6d520d8d11443b72202b9caf4f94b`.

## Copies et traçabilité réellement exécutées
BUILDER : branche `prototype/dg003-ports-builder`, commit `5375014a30dc026a8cc58208cd0c9cabf02c86c2`. Neuf chemins source, tests et rapports copiés sur la branche intégrée via connecteur GitHub, sans merge. Le manifeste `manifest.json` enregistre les neuf noms et blobs SHA. Contrôle post-copie GitHub des SHA blobs `index.ts`, `ports.ts`, `types.ts`, `ports.test.mjs` : **identiques**.

BUILDER fournit `createPorts({documents,rules,catalog,characters,bestiary})` et les cinq façades typées. Résultats `{status:"ready",value}` ou `{status:"invalid"|"unavailable"|"blocked",reason}`. Les services n'ont pas d'export `mount`.

## Wiring INTÉGRATION effectué
`tools/compose.mjs` fait la séparation services/vues ; `tools/build.mjs` produit deux bundles distincts avec esbuild. Le bundle joueur ne référence aucun module privé MJ. `createPorts()` est créé sans délégataire factice et indique des indisponibilités réelles tant que MATH / ARCHIVES / INDEX ne sont pas qualifiés. Vues STUDIO / CREATORS / player attendues. `tools/test-unit.mjs` lance les *.test.mjs réellement présents par domaine et échoue pour domaine absent. Le build peut réussir en déclarant INCOMPLET.

## Sources connues mais non intégrées
- MATH `4a30d4b…` : contre-tests de la session orchestratrice montrent kinds invalides acceptés et exception sur `ability.effect:number` ; **NON QUALIFIÉ**, correction attendue. Aucune copie.
- ARCHIVES : ZIP local SHA256 `167e556a62c9992b228fbe760bdafba368f0ceda312176f717e1801075a1d81f` ; `storage.mjs` SHA256 `11411d3489c2a1969d268889b513a60d9de13e82648d5e928da77408097a3733`, 16/16 tests Node24 **rapportés par la session orchestratrice**. Au moment de cette passe, source GitHub absente de la branche propriétaire ; pas de copie ni d'exécution locale.
- Fixture BEST N5 fictive `fixture-source-001` / `fixture-profile-001` / `fixture-instance-001` : **validée par la session orchestratrice**, pas encore injectée à l'UI.
- INDEX / STUDIO / ATELIERS : SHA et exports non reçus, pas de copie.

## Statut des tests
- Session orchestratrice sur ancien HEAD `3952932e…` : `build.mjs BUILD_OK modules0 INCOMPLET`, `test-unit.mjs exit1`, sept domaines non livrés. Résultats externes, valables **uniquement pour cet ancien HEAD**.
- Cette passe GitHub : copies et identité de blobs **vérifiées**.
- Nouveau HEAD et scripts wiring : `npm ci`, `npm test`, esbuild, unitaires et navigateur **NON EXÉCUTÉS localement** (pas de clone complet et Node24 disponible dans ce conteneur). CI finale et avis QA : **en attente**.
- Les résultats 23 tests BUILDER et 16 tests STORAGE sont fournis par la session orchestratrice, **non une recette locale de notre HEAD intégré**.

## Blocages et transmission
P1 : UI absente, liens natifs absents, recette navigateur finale absente. P0 potentiel : projection joueur avant homologation, maintenue inactive. Attendre les SHA/interfaces INDEX, MATH corrigé, ARCHIVES, STUDIO, ATELIERS ; vérifier chaque blob avant copie, assembler via DI sans calcul/transaction bis. Tester toutes commandes README puis QA sur HEAD final.

**À revoir par :** BUILDER, MATH, ARCHIVES, INDEX, STUDIO, ATELIERS, QA.
**À valider par DG/créateur :** sortie finale du lot après preuves ; tout merge et publication restent interdits.
