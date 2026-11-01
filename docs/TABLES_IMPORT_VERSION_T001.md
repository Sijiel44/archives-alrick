# T-001 — Contrat d'import partiel, versions et sauvegardes des Tables

**Date :** 31 octobre 2026 (Québec). **Responsable :** Tables multijoueurs. **PR complémentaire :** #66, coordonnée avec #54 et #55. **Référence :** audit DG-04 (#65).

## Limite contractuelle

**L'import est PARTIEL ; il ne synchronise pas intégralement une fiche de l'Atelier M02/M03 ou du Grimoire.** Aucune écriture du serveur de table ne modifie le canon, le document encyclopédique, l'Atelier local, le Bestiaire ou les archives Orin. Une fiche importée acquiert un `id` et un `campaignInstanceId` neufs ; `origin.sourceId` reste une référence non contraignante à l'origine.

| Transféré vers l'instance de table | Non transféré (reste dans le JSON original) |
| --- | --- |
| Nom, niveau 1–25, caractéristiques **brutes**, PV/mana courants et maximaux | Inventaire, équipement détaillé, objets et matrices, sorts, capacités, signatures, xp |
| Maîtrises brutes par domaine (`masteries`), `skill` legacy 0–2 | Historique, développement M02, journaux, affinités avancées, effets persistants |
| `resistanceBonus` (seuil défensif), `protection` (absorption), `equipmentGrades` (grade 0–5) | Portrait, notes, secrets MJ, extensions inconnues, `legacyOriginal`, documents canoniques |
| Source `schema`, source `id` et horodatage d'import (provenance) | Validation divine, Autorités et liens encyclopédiques enrichis |

Le navigateur extrait la première fiche de `sheets[0]`, `state.sheets[0]`, `sheet`, ou du JSON individuel. Il envoie une liste blanche uniquement. Pour les exports M02/M03, privilégier le conteneur `schema: "alrick.sheets.v3"`. Une fiche legacy ou à schéma inconnu nécessite validation MJ avant tout jet M01/M03. La validation n'est jamais une adoption canonique.

## Versions

- Base persistante : `alrick.tables.local.v2` ; réception conservatrice de `alrick.tables.local.v1` avec signalement `migratedFrom`.
- Fiche d'instance : `alrick.tables.character.v2`.
- Moteur de jet : `m01-m03-2026-10-31`, sur la base, les snapshots, les événements et les fiches approuvées.
- Origine importée : `origin: {schema,sourceId,importedAt,transfer:"partiel"}`, jamais l'identité de la fiche de jeu.
- Les anciennes fiches serveur v1 sont préservées mais marquées `legacy-tables-v1` et suspendues jusqu'à revalidation MJ ; les jets historiques ne sont pas réécrits.

## Source des calculs — à partager avec #55

Le serveur charge **les fonctions originales** `resolveProgressionAction`, `effectiveStat`, `effectiveMastery` de `atelier5d6-progression.ts` (M01), et `resolveCombatM03` de `atelier5d6-combat-m03.ts` (M03), par `tsx`. Aucun duplicata de formule.

Le score **brut 9** donne le bonus **effectif +6** ; avec cinq dés totalisant 20 et seuil 27, total 26 = échec. Caractéristiques >12 admises. Les naturels 5–7 échouent obligatoirement ; un jet numériquement réussi mais narrativement infaisable demeure un échec. Les maîtrises conservées comme rangs bruts sont converties seulement lors du jet.

La commande `combat_roll` appelle M03 pour le seuil de défense, la résistance, la protection absorbante, la pénétration, les critiques, le contact et les dégâts proposés. Elle **ne retire pas de PV** ; aucun effet narratif ou cosmologique n'est exécuté et la confirmation des conséquences reste au MJ. Les jeux de test communs au référent Grimoire #55 se trouvent dans `scripts/fixtures/5d6-parity-v1.json`.

## Idempotence, concurrence, reconnexion

La commande mutante peut porter un `actionId` UUID client. Le serveur enregistre durablement un reçu sous la clé `(userId,actionId)` avec une empreinte de la commande, puis accuse réception après sauvegarde. Une répétition **identique** renvoie `action_ack.replay=true` sans refaire le jet ou les dégâts ; un même ID avec un corps différent renvoie `IDEMPOTENCY`. Les opérations sans ID de l'ancien pilote restent tolérées **sans** cette garantie. Le client reprend après authentification les actions en attente sauvegardées dans `sessionStorage` ; les notes MJ ne sont **jamais** placées dans cette file persistée.

La file globale séquence les commandes **d'un serveur unique**. `expectedRevision` refuse une seconde modification de ressources après concurrence ; l'idempotence ne désactive pas ce contrôle pour les autres IDs. L'instance conserve les secrets MJ dans des snapshots filtrés par rôle. Une sauvegarde JSON atomique utilise un fichier temporaire et renommage ; elle ne représente pas une transaction de base de données multi-processus.

## Sauvegarder et restaurer

1. Arrêter le serveur ; copier `.tables-local/tables.json` en lieu protégé (y compris `operations`), sauvegarder séparément les clés de récupération.
2. Vérifier que le JSON est valide et porte le schéma `alrick.tables.local.v2`, ou une version v1 destinée à migration ; ne pas modifier les fichiers pendant que le serveur est actif.
3. Copier la sauvegarde sur le même chemin serveur éteint, puis redémarrer localement ; réauthentifier le MJ et les joueurs avec leurs clés ; contrôler fiches, événements, versions, permissions et reçus après restauration.

Les changements postérieurs à la sauvegarde sont évidemment annulés. Un JSON corrompu est rejeté, pas effacé. La récupération d'un **nouveau compte** dont le navigateur n'a jamais reçu la clé après l'inscription reste impossible dans ce prototype. La liste des reçus persiste sans quota ni purge documentée : stockage/archivage, coupures électriques avec `fsync`, enchaînement de plusieurs serveurs et procédure de secours sont à durcir avant utilisation de longue durée.

## Tests et frontières

`npm run tables:test` : cinq niveaux 5, 10, 15, 20 et 25, rangs/caractéristiques >12, régression +6, effets des naturels, parité M01/M03, session MJ+2 WebSocket, permissions interdites, jet secret, déduplication/rejeu, conflit de révision, reconnexion et restauration. `npm test` inclut cette suite ; `npm run test:m04:browser` vérifie le navigateur **de l'Atelier M04**, pas la table sur trois navigateurs.

**Non couverts** : trois vrais navigateurs en parallèle (manuel), fichiers d'utilisateurs historiques, import complet, service Internet, sauvegarde fsync et audit sécurité de production. Pilote strictement sur `127.0.0.1` HTTP/WS clair, sans déploiement, canon ni fusion automatique.
