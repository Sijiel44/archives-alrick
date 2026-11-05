# L004-B P0 — Rapport technique MATH / DG-LOT-004

**Mandat :** 00 DG, 2026-11-05. **Base exigée :** [PR #85](https://github.com/Sijiel44/archives-alrick/pull/85) commit `2ab809ef5351940e0fc272b859d10f21de894d00`. **Branche propriétaire :** `prototype/dg004-xp-math`, initialisée **exactement** sur cette base. **Propriété exclusive :** `experiments/dg-lot004/math-xp/`. Aucun changement M01–M05, aucune division/limitation brute des caractéristiques, aucune adoption MATH-002, aucune publication ou fusion.

## 1. Sources réellement lues sur le SHA exact

| Source réelle | Rôle, chemin numérique | Frontière du prototype |
|---|---|---|
| `quartz/components/scripts/atelier5d6-progression.ts` | `experienceRequired(n)=25*(n-1)^2`, `legacyExperienceRequired(n)=5*(n-1)^3` ; niveaux 1–25 | M01 seul calcule les seuils, aucun barème bis |
| même fichier | `experienceAward(event,history)` : suggestion par difficulté 1–12, portée, répétition, accord et ID | Lecture informative uniquement ; le MJ ne doit pas être forcé de créditer le montant suggéré |
| même fichier | `canReachLevel(level,xp,approvedMilestones)` : seuil et jalons 21–25 | Éligibilité lue, progression décidée séparément |
| même fichier | `progressionAtLevel`, `developmentBudget`, `statCost`, `masteryCost` : budget partagé/coûts croissants, brut >12 | Aperçu sans achat ni division des caractéristiques |
| `atelier5d6-m02.ts` | `grantAward` clone et **crédite directement** `experienceAward` ; `approveMilestone`, `eligibleLevel` | **Ne pas appeler `grantAward`** dans la passerelle MJ |
| même M02 | `draftFromLifePath` N5/XP400 ; `migrateLegacy` et `restoreLegacy` | Antécédent documentaire, pas convention automatique pour prétirés |
| `atelier5d6.inline.ts` | chemins legacy `xpRequired(n)=5*(n-1)^3`, `maxStatCredits(n)=12+6*(n-1)` ; appels `grantAward` sur événements/missions ; parcours d'origine N5 et XP400 | Préserver le dispatch legacy/M02, aucune conversion XP ou mutation UI |

Blobs Git vérifiés sur la base :
- M01 `d2040829ea0da7c0f6eae08dc8c701226bfc53c5`.
- M01-probabilités `bfee984fad47902623f7117e9f024a5b6e042d2d`.
- M02 `39a91de6c21d42c7bf66b2c575024cd8164fa521`.
- Atelier UI `c5d233692c41ef14cb7d06fcccba66905a710ba6`.

## 2. Valeurs de référence (fonctions existantes, non propositions)

| Niveau | XP moderne M01 | XP historique | Budget M01 | Crédits legacy | XP jusqu'au suivant M01 |
|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 12 | 25 |
| 5 | 400 | 320 | 24 | 36 | 225 |
| 10 | 2 025 | 3 645 | 54 | 66 | 475 |
| 15 | 4 900 | 13 720 | 84 | 96 | 725 |
| 20 | 9 025 | 34 295 | 114 | 126 | 975 |
| 25 | 14 400 | 69 120 | 144 | 156 | — |

Contrôles des coûts natifs : `statCost(3,14)=17` et `masteryCost(0,8)=10`. Les scores bruts >12 sont admis sans gain automatique ni division. Pas d'équivalence inventée entre XP historiques et modernes.

## 3. Contrat versionné, non contraignant

Schéma local `cer.math.xp-decision.provisional.v1`, API dans `src/xp-decision.ts`.

1. `suggestXpFromM01(ledger,event)` : lecture **directe** de `experienceAward`, `informationalOnly:true`. Différencier événement source, motif de répétition et proposition. Exemple difficulté 6/ordinaire = **120 XP suggérés**, sans paiement.
2. `recordXpMjDecision(ledger,command)` : décision MJ *explicitement* approuvée, montant `decidedXp` libre et non négatif (0 autorisé), source et provenance conservées, auteur, raison, horodatage ISO, ID stable et `expectedRevision`. Exemple MJ choisit 42 malgré recommandation 120 : **42 seulement dans le journal local**, aucune écriture dans la fiche.
3. Correction append-only `deltaXp` (ex. `-10` sur attribution de 42 : solde journal 32), identifiant de la décision corrigée, sans effacement. ID/contenu identiques -> `duplicate` idempotent, ID collision -> `ID_COLLISION`, revision obsolète -> `STALE_REVISION`; négatifs/overflow refusés.
4. `previewXpProgression` : `experienceRequired` et `canReachLevel` officiels + vérification du *niveau suivant uniquement*. Enregistrement `promotion` uniquement avec validation MJ et critères natifs ; ne modifie pas la fiche.
5. Option initiale explicite `initialLevel` **1–25** et `initialXp` indépendants. `characterOrigin=pretire|creation|import`, `sessionMode=campagne|one-shot`, `paceNote=libre|rapide|etale` sont des contextes, **pas** des coefficients XP. N10 pretiré / XP0 est légal comme départ narratif ; l'avancement suivant continue à suivre le seuil officiel M01. Paliers 21–25 exigent attestations explicites et séquentielles.

Une correction qui rend le total inférieur au seuil d'une promotion antérieure laisse le niveau décidé intact et signale `advancementNeedsReview:true`. Aucune rétrogradation, hausse de caractéristique, distribution de points ni migration automatique.

## 4. Tests réellement exécutés — et non exécutés

**Exécution locale** Node v22.16.0, TypeScript 5.8.3 ; copie des sources officielles M01/probabilités extraite depuis le connecteur GitHub ; correspondance **2/2 blobs Git** vérifiée par `git hash-object`. Aucun calcul natif réimplémenté en Python.

```sh
tsc --target ES2022 --module commonjs --moduleResolution node --skipLibCheck --strict --noEmit experiments/dg-lot004/math-xp/src/xp-decision.ts
node --test experiments/dg-lot004/math-xp/tests/xp-decision.test.mjs
```

Résultats **tsc exit 0, Node TAP 32/32 PASS**, zéro fail/skip. Le script compile l'original M01 via `esbuild` du dépôt si présent, sinon `tsc` déjà installé. Contrôles : N1/5/10/15/20/25 et legacy, coûts 3→14, recommandations ordinaires/majeures/légendaires et répétitions, 120 vs choix MJ42 et 0 XP, corrections signées/référencées, idempotence/collision/révision, niveau initial N10/0 prétiré, rythmes non mécaniques, N21–25, progression N5→6, erreurs de type/overflow, données inchangées, roundtrip JSON synthétique, alerte après correction post-promotion.

**Limites clairement séparées :** clone complet GitHub bloqué par DNS local ; `npm ci`, `npm test`, CI nouvelle branche, esbuild du clone complet, navigateur et recette indépendante QA **NON EXÉCUTÉS dans le conteneur MATH**. Le succès CI du prototype L003 sur PR #85 n'est pas une preuve L004. M02 et Atelier UI ont été examinés par lecture, pas exécutés dans ce banc.

## 5. Risques et décisions à DG

**Bloquant P0 si future intégration :** `grantAward` M02 crédite automatiquement le nombre recommandé. Il ne doit **pas** être branché tel quel à la fonction MJ de décision libre. Le journal ne prouve pas la véritable identité du MJ : `approvedByMJ:true` est un drapeau local ; les imports de journal de sources non fiables nécessiteraient un validateur de persistance distinct. **Pas de mutation silencieuse** des XP, scores bruts, niveaux ou schémas hérités.

**P1 :** correction après promotion demande une décision humaine, aucune annulation automatique. Contrat d'identité/provenance des sources et contrôle de collision inter-campagnes à définir ; option UI d'XP de départ (`0`, seuil M01, montant libre) nécessite un choix *visible*, jamais une valeur par défaut imposée.

**Dépendances :** 11 INDEX pour identifiants/versions/provenance ; 21 ATELIERS pour séparation suggestion/montant MJ/validation UI ; 02 QA pour contrôle de non-mutation, sauvegarde, reprises, legacy et navigateur. Passations préparées dans la matrice, **non envoyées automatiquement**.

**Avis :** prototype MATH L004-B reproductible et limité à ses fonctions pures ; arbitrage DG nécessaire uniquement avant toute future intégration aux fiches/UX, pas pour homologuer les diagnostics et tests locaux ci-dessus.
