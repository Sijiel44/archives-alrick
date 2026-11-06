# L004-B — Matrice de dépendances et passations à préparer (non envoyées)

**Base :** [PR #85](https://github.com/Sijiel44/archives-alrick/pull/85) @ `2ab809ef5351940e0fc272b859d10f21de894d00`.
**Contrat local :** `cer.math.xp-decision.provisional.v1` dans `experiments/dg-lot004/math-xp/src/xp-decision.ts`.
Ne pas considérer ces passations comme reçues par les rôles destinataires.

| Référent | Interface fournie par MATH | Demande / contrôle attendu | Décision encore ouverte |
|---|---|---|---|
| **11 INDEX** | `ExperienceEvent` natif (ID, motif/pattern, domaine, difficulté 1–12, portée, approbation), journal `campaignId/characterId/sourceRef`, `DecisionEntry` | Convention d'ID stable et provenance/version, collisions entre campagnes, distinction événement source / décision MJ / correction ; pas de transformation du récit en XP automatique | Qui fournit ID et provenance pour import v2/v3 et monde partagé ? |
| **21 ATELIERS** | `suggestXpFromM01` -> recommandation informative ; `recordXpMjDecision` -> montant MJ ; `previewXpProgression` -> éligibilité et jalons | Trois écrans distincts ou étapes visibles ; montant libre (0 inclus), raison et accord MJ ; capacité de correction ; champ initialLevel et initialXp distincts ; prétiré/one-shot/rythme **sans coefficient** | Quelle présentation des valeurs de départ : 0, seuil M01 ou valeur personnalisée ? |
| **02 QA** | Test Node réel `tests/xp-decision.test.mjs` et fixtures fictives | Sur SHA assemblé : vérification 32 scénarios, `grantAward` non branché au nouveau port, aucun gain/niveau/stat automatique, 2/2 blocs M01 exacts, importer sans convertir XP legacy, duplications/révisions/corrections, niveau 21+ | Gates UI et politique de sécurité pour journal chargé depuis une sauvegarde non fiable |
| **00 DG** | Rapport technique, fiche Direction, matrice et logs | Validation des exigences de séparation et décision d'une éventuelle tranche d'intégration, pas des barèmes | Historique de progression après correction et preuve d'autorité MJ |

## Exemples de recette

1. **Suggestion 120 / choix 42** : difficulté 6, portée ordinaire -> `experienceAward` M01 suggère 120, le MJ choisit `decidedXp:42`. Le journal indique 42, la fiche initiale conserve son XP. Dupliquer même commande : pas de second crédit.
2. **Correction** : `targetId` de la décision +42 ; `deltaXp:-10` -> 32, journal contient les deux décisions, aucun écrasement.
3. **Départ prétiré N10/XP0** : mode one-shot, rythme rapide : aucun ajout implicite de 2 025 XP ni recul au niveau 1 ; l'éligibilité au niveau 11 suit le M01 officiel.
4. **N20 vers 21** : XP suffisant mais jalon manquant -> refus ; le MJ consigne une approbation `milestone`, puis une décision `promotion`, aucune hausse automatique de fiche.
5. **Coût caractéristique 3→14** : 17 via `statCost` officiel, score brut >12 accepté, aucune division ; la fiche legacy n'est pas convertie.
6. **Concurrence** : un ID strictement identique -> `duplicate` ; même ID/autre contenu -> `ID_COLLISION`; révision attendue dépassée -> `STALE_REVISION`; correction hors solde -> `INVALID_CORRECTION`.

**Limites :** tests locaux du module TypeScript, pas de preuve d'UI intégrée, de véritable permission MJ ni de sauvegarde v2/v3. Les corrections après promotion n'annulent jamais automatiquement une décision antérieure : `advancementNeedsReview` demande un examen humain. MATH-002 et absorption M03 hors périmètre.
