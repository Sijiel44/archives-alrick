# FICHE DIRECTION — 10 MATH / DG-LOT-004 / L004-B P0

**Statut : prototype de recommandations et journal MJ livré sur branche propre ; tests TypeScript locaux VALIDÉS, intégration et QA RÉSERVÉES.**

**Base :** PR #85 @ `2ab809ef5351940e0fc272b859d10f21de894d00`. **Branche :** `prototype/dg004-xp-math`, créée exactement depuis ce SHA. **Propriété exclusive :** `experiments/dg-lot004/math-xp/`. Aucune écriture main, Pages, canon, PR #85/#91 ou moteur M01–M05.

**Contrat versionné candidat :** `cer.math.xp-decision.provisional.v1`.
- **Suggestion** : `experienceAward` natif, lecture pure, montant informatif.
- **Décision MJ** : montant `decidedXp` entier naturel libre (0 permis), accord MJ local explicite, identifiants, source, date/motif, révision optimiste. La réponse `appliedToSheet:false` n'écrit jamais les XP de la fiche.
- **Progression** : `experienceRequired` + `canReachLevel` M01 et jalons 21–25 ; nouvelle décision explicite de promotion, aucun niveau ou stat automatique.
- **Corrections** : événements append-only avec delta signé, cible de correction, refus de négatif/overflow ; rejoue événement identique de façon idempotente, collision refusée.
- **Départs** : niveau 1–25 et XP initial explicitement choisis, prétirés, one-shots et rythmes purement descriptifs, zéro multiplicateur.

**Table XP moderne N1/5/10/15/20/25 :** 0 / 400 / 2 025 / 4 900 / 9 025 / 14 400 ; XP legacy 0 / 320 / 3 645 / 13 720 / 34 295 / 69 120. `statCost(3,14)=17` (brut >12), `masteryCost(0,8)=10`.

**Preuves réelles :** M01 Git blob `d2040829ea0da7c0f6eae08dc8c701226bfc53c5`, probabilités `bfee984fad47902623f7117e9f024a5b6e042d2d`, copiés/verifiés byte-à-byte pour la recette isolée. Node22.16.0 / tsc5.8.3 : compilation sans erreur et **32/32 tests Node PASS**, zéro fail/skip. Copie source/test GitHub identique à fichiers testés. Clone complet bloqué DNS ; npm ci/test complet, esbuild, CI de cette branche et navigateur non exécutés ici.

**Risque P0 majeur :** `grantAward` M02 crédite le montant recommandé automatiquement. Ne pas relier directement cette fonction à une UX où le MJ choisit librement le montant ; interposer une décision explicite. Le journal n'est ni une identité MJ cryptographique ni un validateur d'import externe ; pas d'application aux fiches.

**À examiner par :** 11 INDEX (identifiants/provenance/version), 21 ATELIERS (UI suggestion → montant décidé → validation), 02 QA (non-mutation et retour legacy). Ces passations sont préparées, pas automatiquement envoyées.

**Arbitrages DG restants :** raccord futur à l'Atelier / sauvegarde, valeurs initiales proposées en UI (0, seuil M01, personnalisées), correction d'une récompense après promotion, permissions MJ authentifiées ; aucune nouvelle formule ni MATH-002.
