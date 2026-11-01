# MAG-003 — Pilotage de Direction générale

**Point de contrôle : 1er novembre 2026**  
**Mission en cours : MAG-003.A — Moteur de récupération et simulateur d'expédition**  
**Statut réel : MAG-003.A TERMINÉE TECHNIQUEMENT (code, tests, rapports) ; PR DRAFT #69 ; NON FUSIONNÉE ; NON PUBLIÉE ; REVUE DG À VENIR.**  
**Autorité :** Direction générale et créateur des Archives d'Alrick ; aucune validation canonique anticipée.

## Chaîne GitHub et périmètre

- **Dépôt :** [Sijiel44/archives-alrick](https://github.com/Sijiel44/archives-alrick).
- **Base initiale main :** 6967679b1dee5f6b9762bd6cc4378827d0ec975e.
- **Branche :** magie/mag003a-recuperation-mana.
- **PR :** [#69 — MAG-003.A](https://github.com/Sijiel44/archives-alrick/pull/69), brouillon vers main.
- **Premiers commits repères :** 63f325d (moteur), 121a494 (simulateur), a136e42 (arrondis), 294fdb9 (tests), 71ef68b (intégration npm test), 80cc40c (correction du scénario), db1eeae (intensité M03), 2f33f41 (tests de l'intensité), 6f879c0 (arithmétique BigInt), 9522eb2 (report fractionnaire exact). Les rapports se trouvent dans les commits suivants de cette même branche ; la tête effective est à vérifier sur la PR, sans supposer ces identifiants définitifs.
- **Branches dépendantes à préserver :** [#55 G-001](https://github.com/Sijiel44/archives-alrick/pull/55), [#66 T-001](https://github.com/Sijiel44/archives-alrick/pull/66), [#68 MAG-002](https://github.com/Sijiel44/archives-alrick/pull/68), toutes constatées ouvertes en brouillon au démarrage ; aucun commit MAG-003.A n'y a été poussé.

## Développement et livrables

| Domaine | État | Source |
| --- | --- | --- |
| Récupération plafonnée et anti-cumul | Implémenté en prototype | atelier5d6-mana-recovery.ts |
| Fractions, jours, maximum variable, idempotence | Implémenté en prototype | alrick.mana.recovery.v1 |
| Modèle C et coût par intensité | Implémenté en laboratoire | magicCost |
| Simulation expédition avec graine fixe | Implémenté | atelier5d6-mana-expedition.ts |
| M01 5d6 et M03 combat | Réemploi des résolveurs existants | resolveProgressionAction, resolveCombatM03 |
| Scripts de tests et npm test | Déposés et intégrés | scripts/test-mag003a.mjs, package.json |
| Rapport technique | Déposé | [MAG_003_A_MOTEUR_MATHEMATIQUE.md](./MAG_003_A_MOTEUR_MATHEMATIQUE.md) |
| Simulations | Déposées | [MAG_003_A_SIMULATIONS.md](./MAG_003_A_SIMULATIONS.md) |
| Fiche de Direction | Déposée | [FICHE_DIRECTION_MAG_003_A.md](./FICHE_DIRECTION_MAG_003_A.md) |

## CI et preuve à consulter

**Premier run examiné :** [GitHub Actions #41318331534](https://github.com/Sijiel44/archives-alrick/actions/runs/41318331534) sur 71ef68b. Tests TypeScript, build, contenu, site et M01–M05 exécutés jusqu'au test MAG-003.A ; **échec réel** du scénario comparatif des politiques, dont les étapes ne discriminaient pas la grille (plafond long identique). Code/test corrigés après ce run, ne pas présenter celui-ci comme vert.

**CI validée sur le code (commit 9522eb2aa12727a3e9299efe8d999d5f9dbc7572) :** [GitHub Actions #41318867816](https://github.com/Sijiel44/archives-alrick/actions/runs/41318867816), **SUCCÈS**. Commandes réellement réalisées par Actions : npm ci, npm test (TypeScript, build, liens, M01–M05 et MAG-003.A), puis npm run test:m04:browser. Sortie MAG-003.A : **181 assertions réussies**. Ce commit documentaire actualise le bilan après cette preuve ; [vérifier aussi sa CI](https://github.com/Sijiel44/archives-alrick/pull/69/checks). Aucun playtest humain n'a été exécuté.

## Décisions ouvertes et dépendances

1. **MAG-002 / C-01 :** confirmer ou rejeter la grille 20/40/40/60/50/100, et tester les variantes prudente/ample en partie.
2. **Arrondis :** exactCarry ou cycleAdjustment, cycle effectif, continuité après variation de réserve et règles de journée.
3. **Pratiques :** définition d'un lieu sûr, durée d'un repos, interruption, rituel exceptionnel et équivalence non religieuse.
4. **Intensité et magie :** définir la correspondance officielle entre intensité choisie, effectLevel, limitation du résultat M03 et coût ; pas d'avantage gratuit de haut niveau.
5. **G-001 / MAG-050 :** séparer énergie stockée et nombres d'usages ; ne pas réinterpréter les anciennes charges.
6. **Autorité et sauvegardes :** intégration serveur, révisions concurrentes et permission MJ réelle ; migration versionnée séparée ; aucune importation implicite.
7. **MAG-003.B / MAG-003.C :** dépendre de la politique versionnée après arbitrage et de l'API du noyau, sans dupliquer les formules.
8. **Recette :** faire des playtests humains distincts des simulations, de la CI et des tests navigateur.

## Porte de validation

**Pas de fusion automatique. Pas de publication sur Pages. Pas de modification canonique.**  
Les critères techniques (moteur, scénarios, tests, rapports) sont remplis sur le code contrôlé, sous réserve du contrôle de CI du commit documentaire final. La **validation éditoriale, la fusion et la publication** restent des décisions distinctes et non acquises. Le prototype peut être inspecté sans engager les autres branches.
