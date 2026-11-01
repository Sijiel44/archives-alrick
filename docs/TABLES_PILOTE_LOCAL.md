# Tables multijoueurs — pilote réseau local T-001 (0.2)
**31 octobre 2026 — PR complémentaire #66 (basée sur main M01–M05), coordonnée avec #54 et Grimoire #55.**

## Démarrage sans service extérieur
Conditions : Node.js 22 ou plus récent, npm 10+, dépendances installées (`npm ci`).

```bash
npm ci
npm run tables:test
npm run tables:dev
```

Ouvrir **http://127.0.0.1:8787/** dans **trois navigateurs ou trois profils indépendants**.
Le site public Quartz reste distinct et n'est pas déployé. Les clients rejoignent le serveur Node local ; il n'y a pas de connexion entre appareils via GitHub Pages.

Le MJ crée une identité par pseudonyme, **exporte sa clé de récupération**, puis crée une table (2 à 5 joueurs en plus du MJ). Il transmet le **code d'invitation**, sans jamais partager sa clé de récupération. Les deux joueurs créent chacun une identité, exportent leur clé, demandent à rejoindre la table. Le MJ accepte les deux demandes. Chacun crée une fiche pilote ou importe une fiche JSON de l'Atelier. Le MJ valide les fiches importées. Les jets officiels, messages, PV, mana et états se reflètent entre les trois navigateurs. Pour simuler une perte de connexion, fermer un navigateur puis le rouvrir ; pour tester la persistance, interrompre et relancer le serveur.

L'identité et la campagne sont conservées dans `.tables-local/tables.json` (hors Git). Ce fichier est **local à la machine où tourne le serveur**, pas dans le navigateur. Le navigateur conserve la **clé de compte** dans `localStorage`. Sans la clé d'export, un compte perdu ne peut pas être récupéré par le seul pseudonyme. Une sauvegarde du fichier JSON serveur + des clés de récupération est essentielle.

## Audit du dépôt (base du 31 octobre 2026)
- `quartz.ts` référence le composant `Atelier5d6` dans le cadre Quartz.
- `quartz/components/Atelier5d6.tsx` est l'interface locale PJ/MJ/IA (apparence, origine, fiche, oppositions, inventaire, mission, tables en préparation).
- `quartz/components/scripts/atelier5d6.inline.ts` gère `archives-alrick-atelier-5d6-v1`, `alrick.sheets.v2`, `alrick.campaign.v1`, dés et événements locaux.
- `atelier5d6-origins.ts`, `atelier5d6-opposition.ts`, `atelier5d6-bestiary.ts` isolent une partie des règles et profils.
- `scripts/test-5d6-*.mjs` assure des tests de règles ; le workflow CI exécute `npm test`.
- `content/jouer/architecture-tables-multijoueur.md` signalait correctement que la synchronisation distante n'existait pas.
- Publication Pages uniquement via workflow dédié : **ne pas modifier sa politique d'approbation**.

### Frontières
Ce pilote est une **application Node + WebSocket autonome dans le même dépôt**, non une transformation du mode local en réseau. Aucun import automatique de l'univers privé. Les données d'un joueur sont limitées à son tableur/sa fiche réduite. Pas de diffusion automatique des résultats au canon. Pas de clés LLM.

## Contrat et sécurité du pilote
- Identité : UUID serveur + clé aléatoire 256 bits ; seule l'empreinte SHA-256 de la clé est persistée côté serveur. Le pseudo n'est pas un identifiant d'authentification.
- Salon : identifiant UUID, code d'invitation 12 caractères aléatoires, rôle MJ fixé à la création. Les candidatures entrent en attente ; le serveur vérifie le plafond de 2–5 joueurs approuvés.
- Permissions : rôles et adhésions lus depuis la base du serveur à chaque commande, jamais depuis un rôle envoyé par le navigateur. Le MJ peut approuver membres et fiches, modifier ressources, notes privées, statut et lancer secrètement. Le joueur approuvé peut créer sa fiche, envoyer messages et lancer les dés ; il n'a ni droit d'écriture MJ, ni accès aux notes MJ.
- Dés : `crypto.randomInt(1,7)` pour chacun des cinq dés ; les valeurs envoyées par le client sont ignorées. Résolution M01 **par les fonctions communes** : dés naturels + bonus effectif de caractéristique brute + bonus effectif de maîtrise brute + situation ; échecs naturels 5–7 forcés. Combat via M03, sans retrait automatique de PV.
- Événements : séquence croissante, horodatage serveur, historique persistant (1000 événements max par table dans cette version), diffusion d'instantanés filtrés selon le rôle ; les jets secrets ne sortent pas de l'instantané MJ.
- Ressources : file d'écriture globale et contrôle `expectedRevision`. Une modification obsolète reçoit `CONFLICT`, l'opération doit être recommencée avec la dernière version.
- Données de fiche : exemples pilotes non canoniques ; les imports 5d6 transmettent nom, niveau, caractéristiques **brutes sans plafond à 12**, maîtrises et modificateurs défensifs bruts, compétence legacy, PV et mana. L'import reste **PARTIEL** : notes, portrait, inventaire, historique, capacités et secrets restent dans l'Atelier local. Voir [contrat T-001](TABLES_IMPORT_VERSION_T001.md).
- Résilience : sauvegarde JSON atomique sur disque (fichier temporaire puis renommage), rechargement au redémarrage, présence active calculée par connexion WebSocket. Les actions avec `actionId` ont un reçu dédupliqué durable ; le client reprend ses commandes non acquittées à la reconnexion, sans persister les notes MJ.
- Limites : limitation 60 messages/10 secondes par connexion, 64 Kio maximum par message ; diffusion de l'historique bornée.

**Attention** : l'HTTP/WebSocket clair et le stockage des clés en `localStorage` sont des compromis de prototype **uniquement pour boucle locale**. Par défaut, le serveur écoute sur `127.0.0.1`. **Ne pas le publier sur Internet, ne pas ouvrir le port sur son routeur et ne pas passer `TABLES_HOST=0.0.0.0` sans étude TLS, CSRF/Origin, confidentialité, quotas, sauvegardes et audit.** La clé d'export est un secret qui donne accès au compte.

## Tests / contrôle avant fusion
`npm run tables:test` ouvre trois connexions WebSocket simultanées et vérifie :
1. création d'identité + de table ; demandes d'adhésion ;
2. refus des demandes de jet et d'administration avant approbation ;
3. approbation MJ ; trois rôles et nombre de joueurs ;
4. création et import de fiches, approbation des statistiques importées ;
5. refus des notes MJ, des jets secrets et des changements de ressources côté joueur ;
6. jet 5d6 servi par l'aléatoire cryptographique côté serveur, indépendamment des dés soumis par le client ;
7. visibilité filtrée des jets secrets, notes MJ absentes des réponses joueur ;
8. modification atomique des PV, refus de la révision obsolète et des bornes invalides ;
9. redémarrage du serveur et authentification à partir de la clé, reprise des événements et ressources.

`npm test` inclut aussi ce nouveau test, en plus du jeu de tests préexistant Quartz et Atelier 5d6. Un test navigateur manuel et une revue du code restent nécessaires **avant toute fusion**.

## Architecture cible après validation du pilote
```text
Quartz / GitHub Pages : guides + Atelier local inchangé
          |
          +-- Application Table responsive
                      |
           Session d'identité (Auth)
                      |
          API transactionnelle / RPC sécurisée
              |                   |
       PostgreSQL / RLS       Realtime privé
       tables + fiches        présence / notification
       événements / dés
```

### Modèle cible (les noms sont un contrat, pas des migrations déployées)
- `identities` : `user_id`, `pseudo`, `avatar_url`, `created_at`. Pseudo jamais authentifiant.
- `rooms` : `id`, `name`, `description`, `campaign_id`, `max_players`, `gm_id`, `status`, `created_at`, `updated_at`.
- `room_invites` : code haché, chambre, expiration, plafond d'utilisations, révocation.
- `room_members` : `room_id`, `user_id`, `role`, `state`, `joined_at`, `approved_at`.
- `characters` : `id`, `room_id`, `owner_id`, `public_sheet`, `private_sheet`, `revision`, `rules_version`, `approval_state`.
- `roll_events` : `id`, `room_id`, `author_id`, `character_id`, `natural_dice`, `modifier_snapshot`, `result`, `visibility`, `at`, `sequence`.
- `session_events` : `id`, `room_id`, `actor_id`, `kind`, `payload`, `visibility`, `at`, `sequence`.
- `gm_notes` : `room_id`, `author_id`, `ciphertext_or_private_body`, `updated_at`. Pas dans la table des événements publics.
- `inventory_entries`, `resource_transactions` : données versionnées, opérations transactionnelles avec idempotence.
- `canon_refs` : URI publique/version source, `canon_status` et `adaptation_status`. Aucune écriture de session dans le canon.

### Stratégie Supabase, non décidée et non déployée
Un projet Supabase Free réunirait Auth anonyme, PostgreSQL, RLS, fonctions RPC transactionnelles et Realtime. Le jet ne doit **pas** être calculé dans le navigateur ni accepté d'une simple insertion JSON ; une fonction privilégiée doit vérifier appartenance, validation de fiche, produire les dés avec source robuste, puis écrire événements et ressources dans la même transaction. Les politiques RLS sur PostgreSQL et les canaux privés Realtime sont **deux contrôles complémentaires**, dont les changements de droits doivent pouvoir invalider rapidement les accès existants.

Pour une campagne longue : option de rattachement volontaire à une identité vérifiée (OAuth ou email facultatif), ou protocole de récupération robuste avec clé à usage unique et réassignation contrôlée. Un simple compte anonyme Supabase n'est **pas** récupérable sur un appareil neuf sans liaison préalable. Confidentialité : uniquement fiches accessibles à leur propriétaire et au MJ, aucune donnée privée de l'Odyssée d'Orin.

## Échéancier proposé
**P0 (cette branche)** : prototype local MJ+2 joueurs, messages, présence, dés autoritaires, stockage, droits, fiches réduites, tests.
**P1 (partiellement couvert T-001)** : math M01/M03 réutilisée, import versionné mais explicitement partiel, reçus d'idempotence durables. **À faire** : import/export complet des campagnes, inventaire transactionnel, sécurité Internet et recette de trois vrais navigateurs.
**P2 (après autorisation explicite)** : service distant de test + base relationnelle, authentification et RLS, tests avec navigateurs réels sur réseaux distincts, RGPD/confidentialité et coûts.
**P3** : 3–5 joueurs, PNJ/rencontres/permissions fines, journal complet, outils de MJ, contrôle mobile.
**P4** : IA facultative avec consentement et clé côté serveur exclusivement.

Aucune dépense ni configuration SaaS n'est nécessaire pour P0. Cette branche ne modifie pas les archives fondatrices, l'Atelier 5d6 local ni les règles de publication Pages.


> **Mise à jour T-001 :** stockage `alrick.tables.local.v2`, fiche `alrick.tables.character.v2`, moteur `m01-m03-2026-10-31`. Le calcul d'origine 0.1 (caractéristique brute + skill) ne doit plus être utilisé. La régression **brut 9 → bonus +6**, les profils N5/10/15/20/25 et l'opposition M03 sont contrôlés par les fixtures. Documentation détaillée et exclusions : [TABLES_IMPORT_VERSION_T001.md](TABLES_IMPORT_VERSION_T001.md).
