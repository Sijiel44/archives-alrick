# FICHE DIRECTION — 10 MATH — DG-LOT-004 XP renforcé / L004-B.R2

**Avis : prototype expérimental livré, tests natifs M01 locaux réussis, aucun barème nouveau homologué.**

Source : [directive 00 DG de #93](https://github.com/Sijiel44/archives-alrick/issues/93#issuecomment-6659005380) ; propriété MATH PR #99 (branche `prototype/dg004-xp-math`), base PR #85 @ `2ab809ef5351940e0fc272b859d10f21de894d00`. Aucun changement M01–M05, PR #85/#91, main, Pages ou canon.

**Deux modèles** : (A) **préféré pour essai**, propose un indice M01 1–12 transparent, étiquettes faciles/modérées/difficiles/héroïques → hypothèses 3/6/9/12, puis délégation `experienceAward` officielle avec historique propre à chaque PJ ; portée `ordinaire/majeur/legendaire` décidée/validée par MJ. Assistance décisive attestée baisse d'une étiquette en l'absence de choix MJ explicite (proposition seulement). (B) coefficients expérimentaux 0,75/1/1,25/1,5 sur base native ordinaire indice 6 ; pas d'ajout des portées M01 pour éviter double comptage. Aucun des deux n'est adopté automatiquement.

**Sécurité et autonomie MJ** : `selectedPjIds` est une sélection MJ obligatoire ; aucun PNJ n'est bénéficiaire ; montants communs sans division et exceptions individuelles possibles ; mode individuel possible ; acceptation explicite MJ nécessaire avant nouvelle décision append-only. Aucun mouvement de fiche, XP, stats, inventaire, niveau, statut divin, ni appel `M02.grantAward`.

**Tests démontrés** : TypeScript M01/probabilités exacts par blobs Git ; anciens 32 tests et nouveaux 31 tests de scénarios exécutés, **63/63 PASS, 0 FAIL**, compilation TypeScript stricte réussie. Génération de simulations JSON déterministe depuis fonctions M01 réelles. Clonage complet, npm test repo, Chrome et QA indépendante **non exécutés ici**.

**Arbitrages DG** : étiquette→indice M01 (3/6/9/12) ; assistance décisive (−1 cran) ; portée boss et garde de multiplication ×3/×8 ; provenance et identité source / instance / run / quest-boss ; statut des montants de départ one-shot et niveau 25+. À ce stade, modèle A reste un **outil d'aide MJ non contraignant**.

**À transmettre par orchestration** : 05 INTÉGRATION, 11 INDEX PR #97, 21 ATELIERS, 20 STUDIO, 02 QA et 03 REVUE. Identité native `pj:l004-hero-fiction` conservée dans MATH ; compatibilité avec INDEX à vérifier après correction propriétaire. Aucune passation déjà envoyée n'est présumée.