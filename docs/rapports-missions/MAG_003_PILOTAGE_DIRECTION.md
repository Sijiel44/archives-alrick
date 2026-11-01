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


## MAG-003.B — Rites et cérémonies, chantier distinct (1er novembre 2026)

**Branche :** `magie/mag003b-rites-collectifs` construite depuis la PR #69 MAG-003.A ; **[PR #70](https://github.com/Sijiel44/archives-alrick/pull/70) en brouillon séparée**, base MAG-003.A. MAG-003.A demeure techniquement terminée mais sa validation par la Direction n'est pas acquise. Le lancement du prototype B n'autorise ni fusion de A, ni publication, ni canonisation.

- **Moteur proposé :** `atelier5d6-rituals-mag003b.ts`, schéma `alrick.ritual.v1`, journal, états, transitions et prévisualisations. Rites personnels ordinaires sans jet, rites incertains M01/M03 à probabilité exacte, rôles collectifs et assistance non magique.
- **Verrous :** +1 de soutien maximum, échecs naturels et faisabilité M01/M03, Cercle IX interdit, connaissances distinctes selon opération, matrices autorisées seulement, effets numériques explicitement approuvés, non-cumulables et filtrés par durée et contexte.
- **Mana collectif :** plans de dépenses individuellement attribués en lecture seule sur MAG-003.A, **aucun débit réel ni autorité serveur** ; aucune promesse d'atomicité multijoueur.
- **Tests :** `scripts/test-mag003b.mjs` raccordé à `npm test` : 14 scénarios automatisés ; [CI #41323080067](https://github.com/Sijiel44/archives-alrick/actions/runs/41323080067) **réussie** sur le code `424b902` : 44 assertions MAG-003.B / 14 scénarios, 181 assertions MAG-003.A, TypeScript, build et 15 scénarios Chrome hérités. Aucun playtest humain.
- **Rapports :** [Technique B](./MAG_003_B_RITES_COOPERATION.md) · [Scénarios B](./MAG_003_B_TESTS_SCENARIOS.md) · [Fiche Direction B](./FICHE_DIRECTION_MAG_003_B.md).
- **Décisions DG ouvertes :** validation de MAG-003.A avant intégration, politique de récupération et d'énergie, plafond de soutien, temps et expiration, droits MAG-050, serveur autoritaire, recette de jeu. Aucune modification des PR G-001 ou T-001.

---

## MAG-003.C — Intégration des interfaces de jeu (1er novembre 2026)

**Branche :** `magie/mag003c-integration-rites` · **[PR #71 — DRAFT](https://github.com/Sijiel44/archives-alrick/pull/71)** vers `magie/mag003b-rites-collectifs` (#70). Le travail est empilé sur B (#70), dépendant de A (#69), sans fusionner ni publier. **A/B demeurent soumis à revue DG ; aucune approbation n'est présumée.**

| Intégration | Livraison effective | Restrictions |
| --- | --- | --- |
| Grimoire #55 | Sources G-001 préservées dans C, mêmes sorts, Cercles, prérequis, matrices | Charges historiques et énergie `caster` non arbitrées, aucune promotion canonique |
| Mana MAG-003.A | Panneau de repos, budget, prévisualisation, crédit local confirmé, idempotence, historique | Attestation du MJ local non sécurisée ; discordances bloquées |
| Rites MAG-003.B | Catalogue démo, participants, rôles, sûreté, M01, probabilité, résolution MJ locale | Aucun effet ni débit de réserve collective, aucun commit multijoueurs |
| Tables T-001 #66 | Contrat d'export/import partiel audité, identifiants et limites documentés | Pas de commande rituelle transactionnelle ; **aucune synchronisation annoncée** |
| Foi, prières, traditions | Méditation, artisanat et prière sans miracle, recherches et variantes proposées | Pas de barème de foi ni d'Autorité, bénédiction ou Cercle automatique |
| Objets | Dossiers de matrice, stabilisation, consécration, fabrication, entretien et recherche | Objets existants seulement ; aucune recharge, aucun artefact créé |
| Persistance | Extension optionnelle `alrick.mag003c.local.v1` sur les fiches sauvegardées | Identité des registres validée, migration inter-ID non automatique |

**Tests** : `npm test` inclut G-001, MAG-003.A/B et MAG-003.C ; Chrome M04.1 étendu à la récupération et aux cérémonies, avec capture mobile émulée. [CI source contrôlée #41324634457 — SUCCESS](https://github.com/Sijiel44/archives-alrick/actions/runs/41324634457) sur un commit **précédant** l'extension Chrome MAG-003.C et cette documentation. Consulter obligatoirement [la dernière CI de #71](https://github.com/Sijiel44/archives-alrick/pull/71/checks) avant jugement ; une CI non terminée ne vaut pas succès.

**Rapports** : [MAG_003_C_INTEGRATION_JEU.md](./MAG_003_C_INTEGRATION_JEU.md) · [MAG_003_C_RECETTE.md](./MAG_003_C_RECETTE.md) · [FICHE_DIRECTION_MAG_003_C.md](./FICHE_DIRECTION_MAG_003_C.md).

**Arbitrages DG** : approbation des phases A/B ; grille et conditions de repos ; rôles et soutien collectif ; économie charges/énergie des matrices ; contrats de foi et d'intervention divine ; protocole serveur transactionnel avec autorisation, idempotence, `expectedRevision`, reçus et sauvegardes ; recette humaine sur plusieurs appareils et migrations historiques. **Décision de publication distincte.**

**Verrou permanent : NE PAS fusionner `main`, NE PAS déployer Pages, NE PAS modifier le canon.**
