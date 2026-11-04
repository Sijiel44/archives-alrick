# FICHE DIRECTION — L003-RULES (10 MATH)

**Statut : composant technique livré ; qualification finale intégrée réservée à 05/QA.**

- **Base :** `88f774f3d0d6d520d8d11443b72202b9caf4f94b` ; PR documentaire DG-LOT-003 #84.
- **Branche propriétaire :** `prototype/dg003-rules-math` ; seul `experiments/dg-lot003/{src/rules,tests/rules}` a été touché.
- **Résultat :** point d'entrée importable `previewNativeRules(request)` et sortie discriminée `ok / unavailable / rejected`, totalement consultative (`applied:false`). M01/M03 appelés directement sans nouvel algorithme ; validation des effets uniquement via `validateM03AbilityEffect` officiel.
- **Preuves exécutées :** trois blobs Git officiels vérifiés ; TypeScript `tsc` sans erreur ; `node --test` : 25/25 succès, dont six niveaux, parité direct/port, refus absorption, non-cumul, interdictions MATH-002/objets/débits. Journal TAP joint.
- **Limites explicites :** checkout Git complet bloqué par DNS ; compilation isolée avec stubs de types M02/opposition, mais moteur runtime TS officiel 3/3 ; `esbuild`, `npm ci`, `npm test`, CI, Chrome et intégration non exécutés ici.
- **Dépendances :** 01 BUILDER (RulesGateway), 11 INDEX (preuve native), 20 STUDIO/21 ATELIERS (UI pure), 05 INTÉGRATION (câblage), 02 QA (recette au HEAD final), COMBAT (absorption bloquée).
- **Décisions :** ne pas activer `absorption`, effets d'objets ou débits ; ne pas importer MATH-002. La future politique de propriété/expiration des effets doit être revue avant exécution en combat persistant.

**Aucune modification des formules officielles, aucune publication, aucun merge, aucune canonisation.**
