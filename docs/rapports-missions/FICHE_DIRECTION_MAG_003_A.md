# ARCHIVES D'ALRICK — RAPPORT DE MISSION

**Mission :** MAG-003.A — Moteur mathématique de récupération et simulateur d'expédition  
**Référent :** Mathématiques et ressources du moteur 5d6  
**Date :** 1er novembre 2026  
**Dépôt :** Sijiel44/archives-alrick  
**Branche :** magie/mag003a-recuperation-mana  
**PR :** [#69 — Brouillon](https://github.com/Sijiel44/archives-alrick/pull/69)  
**Statut :** Prototype implémenté ; vérifications CI et revue de la Direction générale à considérer avant clôture. **Aucune fusion ni publication.**

## Livré

- Moteur pur, réutilisable, paramétrable et versionné : plafonds de récupération journaliers, anti-cumul, limitation des deux repos courts, pratiques et repos exceptionnels conditionnels, traditions religieuses/non religieuses.
- Registre par personnage avec transactions idempotentes, validations et provenances, suivi des dépenses, crédits réels et fractions ; deux stratégies d'arrondi permettant de récupérer une réserve impaire sur deux journées à 50 %.
- Gestion d'un changement de réserve sans crédit rétroactif ; changement de journée explicite, interruption, export/import sans migration automatique.
- Coûts C de MAG-002 (2 / 12 % / 25 %) et alternative à intensité choisie ; les manifestations M03 réduites sont alignées à un niveau d'effet réellement réduit.
- Simulateur de scènes et d'expéditions avec graines fixes, calcul du mana, refus motivés, actions accessibles et appels aux fonctions mathématiques existantes M01/M03.
- Script de tests MAG-003.A intégré à npm test, sans modification du Grimoire, des contrats historiques ou des branches #55/#66/#68.

## Vérifications et restrictions

Les scripts couvrent les niveaux 1/5/10/15/20/25, les réserves de référence 0/36/66/114/174/306, le mana impair, les repos, les transactions répétées, les interruptions, les changements de maximum, les coûts et l'import/export.

Le contrôle TypeScript, le build, npm test et les régressions M01–M05 sont vérifiés par GitHub Actions. Le **résultat de la dernière CI** est enregistré dans la [page de pilotage](./MAG_003_PILOTAGE_DIRECTION.md) et sur la [PR #69](https://github.com/Sijiel44/archives-alrick/pull/69/checks). Les simulations automatisées ne sont pas des playtests humains.

La validation MJ est une **attestation locale**. Un futur serveur multijoueur devra fournir authenticité, contrôle des droits, transactions atomiques et gestion des révisions ; le prototype ne les garantit pas.

## Arbitrages demandés à la Direction

Confirmer la grille de récupération (référence, prudente ou ample), le mode d'arrondi, les durées et conditions de sûreté, l'accès aux pratiques exceptionnelles, le lien entre intensité d'effet et résultat magique, ainsi que l'articulation future avec les objets et les sauvegardes du Grimoire. L'autorité de validation reste exclusivement celle du créateur et de la Direction générale.

**Liens :** [Rapport mathématique](./MAG_003_A_MOTEUR_MATHEMATIQUE.md) · [Simulations](./MAG_003_A_SIMULATIONS.md) · [Pilotage](./MAG_003_PILOTAGE_DIRECTION.md).

**Décision requise :** revue technique et éditoriale, puis seulement éventuelle autorisation de fusion et de publication par la Direction. **Ne pas fusionner maintenant.**
