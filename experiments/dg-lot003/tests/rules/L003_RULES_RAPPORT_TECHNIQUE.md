# L003-RULES — Rapport technique, DG-LOT-003

**Propriétaire :** 10 MATH. **Mandat :** DG-LOT-003/L003-RULES. **Base officielle :** `main@88f774f3d0d6d520d8d11443b72202b9caf4f94b`.
**Branche unique :** `prototype/dg003-rules-math`. **Portée Git :** `experiments/dg-lot003/src/rules/` et `experiments/dg-lot003/tests/rules/`. Aucun autre chemin, aucun merge.

## Livrable

Une passerelle `previewNativeRules` qui ne résout rien elle-même : imports directs de `resolveProgressionAction`, `progressionAtLevel`, `resolveCombatM03`, `validateM03AbilityEffect` depuis Quartz. Deux rôles (`pj`,`creature`) avec même résolution native. Résultats purement consultatifs (`applied:false`). Refus strict des effets non autorisés, de `absorption`, des objets numériques, de MATH-002, des transactions de ressources et des extensions de schéma injectées. Bornes et non-cumul exclusivement natifs M03.

## Commandes réellement exécutées dans le conteneur MATH

```sh
# tentative de checkout à délai borné : échec DNS (résolution github.com impossible)
timeout 20s git clone --filter=blob:none --no-checkout --single-branch https://github.com/Sijiel44/archives-alrick.git repo
# moteur récupéré par connecteur GitHub au SHA de base, comparaison avec 'git hash-object'
git hash-object quartz/components/scripts/atelier5d6-progression.ts
# d2040829ea0da7c0f6eae08dc8c701226bfc53c5
git hash-object quartz/components/scripts/atelier5d6-combat-m03.ts
# 09929f1b852a971d73d40474847bae036bf11ffb
git hash-object quartz/components/scripts/atelier5d6-probabilities.ts
# bfee984fad47902623f7117e9f024a5b6e042d2d
tsc --target ES2022 --module commonjs --moduleResolution node --skipLibCheck --strict --noEmit experiments/dg-lot003/src/rules/native-preview.ts
node --test experiments/dg-lot003/tests/rules/native-preview.test.mjs
```

**Résultat réel :** TypeScript `tsc` code 0 ; tests Node v22.16.0 : **25 tests réussis, zéro échec, zéro ignoré** (TAP original annexé). Aucun test Python substitut. `esbuild` non présent dans ce conteneur ; le script choisit `tsc` préexistant. Les trois modules TS runtime officiels ont été recopiés byte-à-byte et vérifiés par empreinte Git ; `m02.ts` et `opposition.ts` sont des stubs **type-only** provenant du banc MATH-001.R1 afin de rendre possible la compilation isolée. Aucune logique de M02/opposition n'est exécutée par le test. Le dépôt complet et ses `node_modules` n'étaient pas disponibles ici.

## Cas exécutés

Parité résultat complet M03 PJ/créature/direct et progression M01 aux niveaux 1/5/10/15/20/25 ; blocage `absorption` après validation M03 réussie aux six niveaux ; contrôle positif `impact+2` ; non-cumul de deux impacts ; refus de magnitude 3, durée 4, déclencheur faux, capacité non approuvée, source numérique objet, injection `approved`, champ `effects` injecté ; refus MATH-002/Autorités/débits ; naturel 5 en échec malgré caractéristique brute 80 ; sommes exactes 5d6 (7 776 issues, 21 échecs naturels forcés) ; non-mutation d'une requête représentative.

## Frontières / risques / non exécutés

- **Validé localement :** contrat et parité à données synthétiques avec les trois sources exactes ; aucune modification des formules.
- **Réservé :** effets défensifs et leur propriétaire (`defense` autorisé par M03 mais l'association ciblée et les permissions MJ relèvent de STUDIO/INDEX), consommation de durées, preuve de la vraie identité du MJ.
- **Bloqué volontairement :** `absorption`, objets numériques, Autorités, mana/charges, tout schéma interprétant un texte comme calcul.
- **Non exécuté ici :** clone complet, `npm ci`, `npm test`, CI GitHub propre à la branche, navigateur, intégration UI, transactions, playtests. Ces vérifications appartiennent à INTÉGRATION / QA sur le HEAD assemblé.

**À intégrer par 05 :** copier `src/rules/native-preview.ts`, `src/rules/README.md`, `tests/rules/native-direct-entry.ts`, `tests/rules/native-preview.test.mjs` et, à discrétion, ces preuves documentaires ; tester au HEAD assemblé. Aucun `approved:true` ni débit ne doit être ajouté par le câblage. La présente passation est préparée, sa réception doit être attestée par la session orchestratrice.
