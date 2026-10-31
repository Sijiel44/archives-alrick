---
publish: true
title: "Tables de JDR — pilote local en développement"
description: "Une première table multijoueur locale avec MJ, deux joueurs et cinq dés synchronisés par un serveur Node autonome."
categorie: "guide"
code: "SYS-TABLES-PILOT-01"
canon_statut: "proposition_non_jouee"
etat_editorial: "en_cours"
visibilite: "publique"
portee: "univers_partage"
public_cible: ["joueurs", "mj"]
usage_en_jeu: ["outil", "regles"]
ancre_documentaire: "Prototype multijoueur local et code du serveur pilote, 31 octobre 2026"
source_brute: "Développement original sur la branche codex/tables-multijoueur-pilote-01 ; aucun événement de campagne."
derniere_revision_documentaire: "2026-10-31"
tags: [jdr, tables, 5d6, prototype, multijoueur]
---

# Tables d'Alrick — première expérimentation réseau

> [!warning] Pas encore un service de table sur le site public
> Le pilote fonctionne **sur un serveur Node lancé sur votre propre ordinateur**, accessible par défaut à l'adresse `http://127.0.0.1:8787/`. Il n'est **pas** hébergé par GitHub Pages et ne permet pas actuellement de jouer à distance sur Internet.

Cette première version sert à valider une vraie partie entre **un MJ et deux joueurs, chacun dans un navigateur distinct**, avant le déploiement d'un service distant. Le MJ accepte les participants, chacun retrouve sa fiche et tous voient les jets 5d6 publics validés par le serveur. Notes secrètes, changement de PV/mana, événements, présence et reprise après fermeture sont inclus dans le test.

Pour les développeurs, consultez `docs/TABLES_PILOTE_LOCAL.md` dans le dépôt GitHub, puis lancez `npm ci`, `npm run tables:test` et `npm run tables:dev`. **Ne partagez jamais la clé de récupération ; transmettez seulement le code d'invitation.**

Le [[jouer/atelier-5d6|grand Atelier 5d6]] continue à fonctionner **sans compte, en local**, avec toutes ses sauvegardes antérieures. Ses données ne sont **pas envoyées automatiquement** au serveur pilote. Un import réduit de fiche JSON est volontaire et requiert validation MJ.

Les actions de tables indépendantes ne deviennent jamais des événements canoniques de l'[[univers/index|Odyssée d'Orin]]. Aucun secret issu de la campagne fondatrice n'est publié par cette expérimentation.

[[jouer/architecture-tables-multijoueur|Lire la feuille de route complète des tables]].
