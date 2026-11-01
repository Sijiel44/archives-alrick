# ARCHIVES D'ALRICK — RAPPORT DE MISSION

**Mission :** MAG-003.C — Intégration locale Grimoire, repos, rites et compatibilité préparatoire avec les Tables  
**Référent :** Intégration des interfaces de magie et rites · **Date :** 1er novembre 2026  
**Dépôt :** `Sijiel44/archives-alrick`  
**Branche :** `magie/mag003c-integration-rites`  
**PR :** [#71 — brouillon](https://github.com/Sijiel44/archives-alrick/pull/71), empilée sur MAG-003.B [#70](https://github.com/Sijiel44/archives-alrick/pull/70)  
**Statut :** **terminée avec réserves techniques et éditoriales** — prototype local expérimental ; **non prêt à fusionner ou publier**.

## Livré

Le Grimoire G-001 (#55) est raccordé aux moteurs expérimentaux MAG-003.A et MAG-003.B, sans modifier les branches d'origine. Un onglet « Rites et repos » offre : mana actuel/maximal, journée et budget récupéré, choix et conditions de repos, aperçu du gain, confirmation, idempotence contre le double clic et historique par fiche. Le même panneau propose rites connus, pratiques non religieuses/religieuses sans miracle, préparation de cérémonies, participants/rôles, probabilité M01, validation MJ **locale** et dossiers de recherche ou d'objets **à soumettre au MJ**.

Les anciens `charges` de matrices et les Cercles ne sont pas requalifiés ; aucune recharge ni création automatique. Extension de sauvegarde optionnelle `alrick.mag003c.local.v1` sur la fiche et export de campagne existant conservé. Discordance du mana/du registre ou schéma étranger = refus conservateur, non une correction silencieuse.

## Résultat de vérification

- [CI #41325092101 — SUCCÈS](https://github.com/Sijiel44/archives-alrick/actions/runs/41325092101) : exécution complète réussie sur `dce1fb61c5891af1b39e48d17a2a13e71397e5b1`, après intégration de la recette et des rapports. Les suites rapportées comprennent **181 assertions A, 44 B, 44 C et 17 scénarios Chrome automatisés**.
- Toute modification documentaire ou logicielle ultérieure nécessite de vérifier la CI correspondante avant une affirmation de validation du nouveau head.
- **Tests automatisés ≠ essais humains.** Aucune vraie partie multijoueurs ni recette sur téléphone physique.

## Réserves bloquantes

Les Tables #66 possèdent un serveur local et des conventions d'idempotence, mais **aucune API transactionnelle rituelle** et un import ne contenant ni Grimoire ni matrices : C est donc **simulation/préparation locale** ; aucun paiement ou bonus collectif. Le mode MJ de l'Atelier n'est pas un rôle authentifié réseau. Les politiques de récupération MAG-003.A, soutien MAG-003.B, énergie/usages G-001, délais et sûreté des pratiques, modèle de foi et autorité serveur nécessitent des arbitrages.

Aucune création de points de foi, intervention divine, bénédiction, Autorité ou Cercle à la suite d'une prière. Aucune modification du canon.

## Décision de Direction générale du 1er novembre 2026

- **MAG-003.A #69 :** validation technique maintenue.
- **MAG-003.B #70 :** prototype accepté, consolidation des soutiens, compétences et prérequis exigée avant utilisation effective des bonus.
- **MAG-003.C #71 :** terminée avec réserves ; validation expérimentale recevable, **aucune fusion autorisée**.
- **Parcours PJ :** autoriser une pratique ordinaire connue et maîtrisée sans jet ni confirmation MJ inutile ; rites exceptionnels ou incertains demeurent contrôlés.
- **Récupération :** grille centrale comme référence expérimentale, variantes prudente et ample conservées ; prière et méditation d'accès équivalent pour l'ordinaire, exceptionnels conditionnels.
- **Foi/objets :** aucun gain ni conversion de foi automatique ; énergie stockée et nombre d'utilisations séparés, sans migration automatique des `charges`.
- **Coopération :** soutien **+1 maximum** après qualification vérifiée ; aucun débit collectif sans serveur transactionnel.
- **Interopérabilité :** seulement **compatibilité préparatoire avec les Tables** ; le serveur T-001 n'est pas connecté aux cérémonies MAG-003.C.
- **Avant fusion :** revue des sources G-001 reprises dans C, réconciliation de la pile A→B→C, tests CI sur l'arbre réellement ciblé, recette humaine PC/téléphone et sauvegardes historiques.

La page [MAG_003_PILOTAGE_DIRECTION.md](./MAG_003_PILOTAGE_DIRECTION.md) présente le détail des réserves et de la suite à donner.

**Interdiction maintenue : aucune fusion dans main ; aucune publication du site ; aucune canonisation.**

**Rapports permanents :** [intégration](./MAG_003_C_INTEGRATION_JEU.md) · [recette](./MAG_003_C_RECETTE.md) · [pilotage DG](./MAG_003_PILOTAGE_DIRECTION.md).