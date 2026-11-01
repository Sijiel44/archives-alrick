# MAG-003.B — Matrice de tests et scénarios

**1er novembre 2026 · Branche `magie/mag003b-rites-collectifs` · PR en brouillon, non fusionnée.**

## Protocole

`npm run test:mag003b` lance `scripts/test-mag003b.mjs`, lequel assemble les sources TypeScript réelles avec esbuild et utilise les assertions de `node:assert/strict`. `npm test` incorpore ce contrôle après MAG-003.A. Les comparaisons probabilistes consultent les fonctions M01/M03 existantes et les **7 776** résultats exacts 5d6 ; pas de Monte Carlo ni de jet artificiellement favorable. La CI GitHub valide aussi le typecheck et les régressions selon le workflow du dépôt.

## Scénarios attendus, définis dans le script

| Code | Scénario | Contrôle déterminant |
| --- | --- | --- |
| S01 | Rite personnel simple | pratique acquise sans jet ; aucun mana accordé |
| S02 | Méditation approfondie | clarté narrative, durée déclarée, pas de bonus automatique |
| S03 | Rite incertain | M01, probabilité exacte, jet indispensable |
| S04 | Rite interrompu | état terminal, reprise bloquée, répétition d'événement idempotente |
| S05 | Cérémonie à trois | rôles officiant, chantre et gardien |
| S06 | Non-mage participant | artisan apporte composant et sécurité |
| S07 | Dix assistants | un seul soutien +1 ; borne de situation +2 |
| S08 | Composant absent | préparation refusée |
| S09 | Préparation d'une matrice | activation existante avec droit ; conception refusée si non maîtrisée |
| S10 | Rite non autorisé | Cercle IX interdit, matrice non validée, impossibilité respectée même sur 30 |
| S11 | Énergie collective | plan de débit par propriétaire, aucune mutation, insuffisance / plafond / usurpation bloqués |
| S12 | Effet temporaire | +2 et bonus non validés refusés |
| S13 | Résolution M03 | calcul sans dommages appliqués ; probabilité bornée |
| S14 | Sauvegarde et annulation | export/import, refus de relance |

## Résultats et preuves

**GitHub Actions [#41322728636](https://github.com/Sijiel44/archives-alrick/actions/runs/41322728636) : SUCCÈS.** Le journal exécute `npm ci`, `npm test`, les contrôles TypeScript et build, les tests de régression M01–M05, MAG-003.A (**181 assertions**) et **MAG-003.B (41 assertions, 14 scénarios)** ; la recette navigateur existante M04.1/M05 valide **15 scénarios**. La preuve concerne le commit `075dea296e5c993408528296df7899ca87438952` et précède la seule mise à jour documentaire du bilan. Les tests automatisés ne sont pas une recette multijoueur réelle, une session de jeu humaine ni une preuve d'absence de concurrence.

## Compléments recommandés avant approbation

- Attaques concurrentes sur la même réserve avec serveur réel, deux onglets et deux clients ;
- corruption d'une sauvegarde, empreinte/signature, ancien événement de journal et restauration partielle ;
- vingt rites successifs, expiration effectivement appliquée par autorité externe, mode MJ versus joueur ;
- scénarios narratifs du Codex et vérification formelle MAG-050 ;
- risques de coût des rituels et compatibilité de la politique MAG-003.A après validation.
