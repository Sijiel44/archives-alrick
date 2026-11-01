# ARCHIVES D'ALRICK — RAPPORT DE MISSION

**Identification :** MAG-003.B — Moteur des rites personnels et cérémonies collectives  
**Référent :** Systèmes magiques, moteur mathématique 5d6, coopération  
**Date :** 1er novembre 2026  
**Dépôt :** `Sijiel44/archives-alrick`  
**Branche :** `magie/mag003b-rites-collectifs`  
**PR :** [#70 — Brouillon](https://github.com/Sijiel44/archives-alrick/pull/70), base MAG-003.A #69  
**Statut :** développement expérimental ; validation DG en attente.

## Livrables

Moteur TypeScript `alrick.ritual.v1` : rites individuels et collectifs, sept rôles, modèle typé des effets et contributions, six états et transitions auditables. Réemploi des calculs M01/M03, probabilité exacte 5d6 ; rites maîtrisés sans jet. Le soutien approuvé est plafonné à +1 contextuel, les non-mages contribuent utilement et les Cercles ne sont pas débloqués par le nombre.

Prévisualisation énergétique fondée sur les états MAG-003.A et leurs identifiants ; **aucun débit réel ni faux commit multijoueur**. Effets narratifs ou +1 validé, proposés mais jamais appliqués automatiquement. Quatorze scénarios automatisés documentés et branchés à `npm test`. Rapports permanents créés et pilotage mis à jour.

## Vérification et réserves

**Résultat confirmé :** [CI #41322728636](https://github.com/Sijiel44/archives-alrick/actions/runs/41322728636), succès sur le code `075dea2` : 41 assertions MAG-003.B / 14 scénarios, 181 assertions MAG-003.A, contrôle TypeScript, build, M01–M05 et 15 scénarios navigateur. Le test ne remplace ni la recette humaine ni l'essai réseau. Les conversions Grimoire / objets / Tables sont hors périmètre.

**Dépendance non satisfaite au démarrage :** MAG-003.A PR #69 n'est pas encore officiellement approuvée par la Direction. MAG-003.B se base donc sur sa branche, en PR séparée et non canonique.

## Décisions requises

1. Valider ou réviser la récupération MAG-003.A et l'accès à la politique d'énergie.
2. Accepter ou revoir la règle expérimentale de soutien maximal +1.
3. Préciser les conditions de lieux, préparations, durées, expirations et permissions MAG-050.
4. Prévoir le serveur autoritaire pour tout débit multijoueur, jamais une simulation de commit.
5. Autoriser, éventuellement, une recette humaine et ensuite une fusion séparée. **Ne pas publier ni fusionner à ce stade.**

**Rapports :** [Technique](./MAG_003_B_RITES_COOPERATION.md) · [Tests](./MAG_003_B_TESTS_SCENARIOS.md) · [Pilotage](./MAG_003_PILOTAGE_DIRECTION.md).
