---
publish: true
title: "Architecture des futures tables de JDR partagées — feuille de route"
description: "Pseudonymes, invitations, fiches, rôles, jets 5d6 synchronisés, sauvegardes et MJ assisté par IA : étapes nécessaires au multijoueur."
categorie: "guide"
code: "SYS-TABLES-01"
canon_statut: "proposition_non_jouee"
etat_editorial: "en_cours"
visibilite: "publique"
portee: "univers_partage"
public_cible: ["joueurs", "mj"]
usage_en_jeu: ["regles", "outil"]
ancre_documentaire: "Demande de conception de tables de jeu partagées, 31 octobre 2026 ; prototype Atelier 5d6 local"
source_brute: "Proposition du créateur du 31 octobre 2026 et fonctionnement du site GitHub Pages et de l'Atelier 5d6 ; aucune table multijoueur actuellement déployée."
derniere_revision_documentaire: "2026-10-31"
tags: [jdr, multijoueur, session, mj, pseudonymes, temps-reel, securite, intelligence-artificielle]
---

# Vers des tables de JDR en direct

> [!warning] Feuille de route, pas service déjà disponible
> Le site actuel est une **application statique Quartz sur GitHub Pages**. Les fiches, inventaires, dés et journaux de l'Atelier sont enregistrés **dans le navigateur local**. Les liens d'import/export JSON ne synchronisent pas une partie entre plusieurs personnes. Un sélecteur « MJ » sur la page ne suffit pas à sécuriser un rôle. Il n'existe pas encore de compte de table ni de salon réseau opérationnel.

## 1. L'expérience visée

Un visiteur choisit **un pseudonyme** et éventuellement une image de profil, sans donner son nom, adresse, âge, téléphone ou email. Il peut être **joueur**, proposer d'être **MJ**, ou jouer en **local avec un MJ humain ou assisté par IA**. Il crée ou rejoint une table via une invitation. Son personnage reste associé à cette table et à une identité technique pseudonyme. Au cours de la partie, les fiches, décisions partagées et jets apparaissent à tous les membres **selon leurs droits**.

Le **MJ de la table** doit pouvoir gérer les participants, voir les fiches autorisées, prendre connaissance des dés, déclencher une rencontre, faire évoluer les PV et ressources après validation, attribuer le butin et conserver un journal de séance. Un participant ne doit pas pouvoir se promouvoir lui-même MJ ou ouvrir les notes privées d'autrui.

## 2. Deux modes de jeu distincts

| Fonction | Mode local actuel | Table partagée envisagée |
| --- | --- | --- |
| Créer/éditer une fiche | Oui, stockage du navigateur | Oui, fiche associée à la table et à un propriétaire |
| Dés et journal | Oui, sur un seul appareil | Dés horodatés, reçus par les membres autorisés |
| MJ et gestion de la table | Contrôle d'interface, **non sécurisé** | Autorisation **vérifiée côté serveur/base** |
| Inventaires et ressources | Locaux, échanges entre fiches locales | Transactions validées, protection contre conflits de mises à jour |
| Invitations | Non | Lien de table à durée contrôlable, rôle affecté séparément |
| Sauvegarde | JSON téléchargé par l'utilisateur | Version serveur + export personnel + journal d'audit |
| IA | Texte de contexte copiable | Option distincte, volontaire, avec contrôle des données transmises |

**Ne pas mélanger** les deux jeux : une campagne privée en local doit rester utilisable sans réseau ni inscription. Le multijoueur sera un choix explicite de table.

## 3. Architecture technique recommandée

**Façade :** conserver Quartz et le site GitHub Pages pour l'encyclopédie et les guides ; isoler la future **application de table** (client web) dans une route ou un sous-domaine dédié, avec une interface sobre et adaptée au mobile.

**État partagé :** backend ou plateforme externe avec base de données, sessions, stockage de profil et événements temps réel. Une option à évaluer est **Supabase Auth (comptes anonymes)**, **PostgreSQL/RLS**, puis **Realtime Presence/Broadcast**, sans décision d'achat ou déploiement à ce stade. Le concept reste compatible avec d'autres prestataires ou un serveur auto-hébergé.

**Identité :** chaque joueur reçoit un identifiant technique aléatoire indépendant du pseudonyme public. Un compte anonyme permet un démarrage sans email ; **il n'est pas récupérable automatiquement** après perte de session, changement de navigateur ou réinstallation. Prévoir une récupération volontaire (clé de restauration, conversion de compte ou autre dispositif vérifié) avant des campagnes longues. Le pseudonyme seul ne peut jamais servir de preuve d'identité.

**Contrôles de rôles :** la base doit appliquer des politiques de sécurité ligne par ligne : propriétaire de personnage, membre de table, MJ assigné, co-MJ explicitement ajouté, lecteur éventuel. Les autorisations de chat, de journal, d'inventaire et d'accès à des secrets sont distinctes ; l'invitation seule ne donne jamais des privilèges MJ. Les données publiques des Archives restent séparées de la partie privée.

**Dés équitables :** envoyer une **demande** de lancer au service de table ; le serveur produit l'aléa (source cryptographiquement sûre), enregistre dés naturels, bonus, contexte, formule et résultat dans un journal immuable. Le client affiche l'animation mais ne choisit pas le résultat officiel. Permettre aussi des jets secrets visibles seulement par le MJ lorsqu'il le décide.

**Mises à jour :** toute application de dégâts, dépense de mana, progression de niveau et transfert d'objet doit être atomique et horodatée. Des numéros de révision permettront de gérer deux personnes qui essaient d'éditer le même objet simultanément. Les clients déconnectés resynchronisent à partir de l'historique.

## 4. Modèle initial des données (proposition)

| Table / ressource | Champs principaux |
| --- | --- |
| `identities` | identifiant technique, pseudo affiché, avatar facultatif |
| `rooms` | identifiant, nom, visibilité, MJ propriétaire, état de séance |
| `room_members` | room_id, identity_id, rôle véritable, invitation acceptée, statut |
| `characters` | propriétaire, table, version JSON de fiche validée, visibilité |
| `roll_events` | auteur, fiche, 5 dés, modificateurs, cible, timestamp, visibilité |
| `session_events` | actions, changement de PV/mana, décisions MJ, version |
| `npc_instances` | adaptations des fiches publiques, statistiques locales, accès MJ |
| `assets` | références externes et métadonnées de droits, jamais une image piratée |
| `ai_sessions` | session consentie, historique de contexte partagé, coût/limite et consentement |

Les fiches encyclopédiques peuvent être **liées par un identifiant stable ou leur URL**, puis adaptées localement. La référence publique est consultable sans recopier les secrets de la campagne fondatrice. Les PNJ secrets restent visibles uniquement dans l'espace MJ.

## 5. Le MJ assisté par IA

- **Option A — Export de contexte :** le système actuel produit un texte de contexte à copier dans une conversation ChatGPT ou un GPT personnalisé ; aucune API ni identité externe nécessaire.
- **Option B — Session IA intégrée :** une application de table autorisée communique avec un **service serveur** qui appelle un modèle configuré ; clés API **jamais** dans le code du navigateur. Choix du modèle, budgets, quotas, mémoire de séance, contrôle des secrets et consentement des participants sont nécessaires.
- **Option C — Partie solo :** le joueur choisit d'utiliser un compagnon IA local ou externe de son côté ; aucune diffusion automatique vers les autres membres.

L'IA peut suggérer une narration, mais les permissions, les jets officiels et les changements de ressources doivent rester gérés par le **moteur de jeu et les règles d'accès**, non par une affirmation textuelle du modèle.

## 6. Déploiement par étapes

**Étape A — Actuelle :** améliorer les fiches et leur parcours de création, regroupés dans un hub local. Import/export JSON, affinités, capacité et dés restent compatibles.

**Étape B — Prototype technique privé :** deux navigateurs, deux pseudonymes et un seul salon, présence en ligne et un lancer 5d6 partagé. Tester les droits MJ, la reconnexion, l'accès aux notes secrètes et le refus de requêtes non autorisées.

**Étape C — Campagne partagée :** fiches persistantes propriétaires, permissions, journal, règles d'inventaire atomique, préparation MJ, export et suppression de compte.

**Étape D — IA et enrichissement :** scénarios, bestiaire lié à l'Atlas, sorts et tactique, voix éventuelle, carte, contexte IA limité et opt-in.

**Non-objectifs immédiats :** réseau social public, messagerie privée permanente, publication automatique des images et des notes MJ, collecte de données personnelles, paiement.

## 7. Sécurité, coûts, confidentialité

Le « zéro donnée privée » ne signifie pas **zéro donnée technique** : le prestataire voit nécessairement certaines informations de connexion (par exemple IP), et les journaux de table peuvent contenir des éléments choisis par les utilisateurs. Le projet doit prévoir une politique de conservation/suppression, une limite de session, la possibilité de quitter une table, une modération élémentaire des pseudonymes et l'export de ses données.

**Références de conception :** documentation officielle [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), [Supabase : authentification anonyme](https://supabase.com/docs/guides/auth/auth-anonymous), [Supabase : RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) et [Supabase : autorisation Realtime](https://supabase.com/docs/guides/realtime/authorization). Les services, leurs tarifs et leurs limites doivent être revérifiés au moment de la décision technique.
