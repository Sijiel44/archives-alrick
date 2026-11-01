# ARCHIVES D'ALRICK — RAPPORT TECHNIQUE T-001

**Mission :** T-001 — Synchronisation des Tables multijoueurs avec M01–M05  
**Référent :** Tables multijoueurs  
**Date :** 31 octobre 2026 (Québec)  
**Dépôt :** `Sijiel44/archives-alrick`  
**PR propriétaire :** [#54](https://github.com/Sijiel44/archives-alrick/pull/54) — `codex/tables-multijoueur-pilote-01` (conservée en brouillon)  
**Complément :** [#66](https://github.com/Sijiel44/archives-alrick/pull/66) — `fix/t-001-tables-parite-m01-m03-20261031`, base `main`  
**Audit de départ :** [DG-04, PR #65](https://github.com/Sijiel44/archives-alrick/pull/65) ; cohérence Grimoire [#55](https://github.com/Sijiel44/archives-alrick/pull/55).  
**Statut :** **terminée avec réserves : CI et recette Chrome automatisée vertes ; recette humaine, sauvegardes personnelles et revue de sécurité non effectuées.** Ne pas fusionner ni déployer.

## 1. Constats vérifiés avant modification

- #54 (15 commits historiques) était basée sur l'ancien `main`, séparée des 122 commits de M01–M05. La PR pouvait être syntaxiquement fusionnable sans être mathématiquement compatible. L'import refusait les statistiques >12, `resolve5d6` additionnait la stat brute et le skill directement et les commandes n'avaient aucune clé d'idempotence.
- Régression DG04-01 : naturel 20 + score brut 9 au seuil 27 donnait **29/réussite** dans l'ancienne Table, mais M01 calcule **bonus effectif 6, total 26/échec**.
- La PR #55 demeure propriétaire des sorts, matrices, charges et de ses migrations. **Aucun fichier Grimoire n'a été modifié.**

## 2. Réconciliation effectuée sans écrasement du moteur

Création d'une branche complémentaire **sur `main`** ; reprise des fichiers pilote de #54 (`tables-pilot/server.mjs`, `tables-pilot/client/*`, test WebSocket et documentation). Les composants actuels du moteur et du hub M01–M05 **ne sont pas remplacés**. `package.json` ajoute `tables:test` et `tables:dev` via `node --import tsx` et inscrit la suite dans `npm test`. `.gitignore` exclut les sauvegardes locales.

| Sujet | Correction livrée |
| --- | --- |
| M01 — score brut et maîtrise | `resolve5d6` délègue à `resolveProgressionAction` et `effectiveStat/effectiveMastery`. Aucun plafond brut à 12 ; naturels 5–7 et `feasible` traités par la source. |
| M03 — défense / absorbants / critiques | `resolveTableCombat` délègue à `resolveCombatM03` ; `combat_roll` crée un événement de journal, expose contact/réussite/défense/protection/pénétration/dégâts proposés. **Pas de modification automatique des PV**, aucun texte de capacité appliqué. |
| Import non destructif partiel | `alrick.tables.character.v2` ; caractéristiques, maîtrises et bonus défensifs conservés bruts ; `origin.sourceId` distinct de `campaignInstanceId`. Sources inconnues/schémas anciens soumis à revalidation MJ. |
| Compatibilité et versions | Base `alrick.tables.local.v2` ; import v1 sans réécriture des jets anciens ; versions `m01-m03-2026-10-31` dans données et résultats. |
| Permissions / sécurité | Rôles lus du serveur, secrets MJ filtrés, cinq dés issus de `crypto.randomInt`. HTTP/WS uniquement en boucle locale ; aucun compte SaaS ni mutation du canon. |
| Idempotence | `actionId` facultatif pour anciens clients ; reçu durable `(userId, actionId, hash)`, rejeu identique sans effet, rejeu altéré refusé, ACK après sauvegarde ; file d'attente `sessionStorage` hors notes MJ. |
| Concurrence / sauvegarde | Révision obligatoire pour PV/mana ; file globale d'un seul serveur, sauvegarde atomique temporaire→renommage, arrêt/copie/restauration d'un JSON sain. |

## 3. Contrat et coordination

- Contrat d'import **PARTIEL** détaillé : [`docs/TABLES_IMPORT_VERSION_T001.md`](../TABLES_IMPORT_VERSION_T001.md). Non transférés : inventaire, capacités, sorts/matrices, historiques, XP, portrait, secrets, `legacyOriginal`, liens éditoriaux enrichis et extensions inconnues. **Aucune promesse de synchronisation intégrale.**
- Fixtures neutres : `scripts/fixtures/5d6-parity-v1.json`, proposées comme corpus commun au référent Grimoire #55. Aucune adaptation Grimoire ni fusion coordonnée avec #55 n'est revendiquée.

## 4. Protocole de test automatisé

`scripts/test-tables-pilot.mjs` couvre les paires de fonctions M01/M03, un même jet de dés injecté, cinq niveaux 5/10/15/20/25 (scores bruts >12), naturel 5–7, critique potentiel, `feasible=false`, régression brute 9, import Colosse N15 (>12), session MJ+2 utilisateurs WebSocket, restrictions MJ, jet secret, dés serveur sans confiance client, combat M03 serveur vs moteur, ACK rejoué, idempotency-key divergente, concurrence de révisions, reconnexion et restauration depuis une copie de sauvegarde ; JSON corrompu refusé.

| Exécution | Constat |
| --- | --- |
| Ancienne CI #54 | [Run 41206146216](https://github.com/Sijiel44/archives-alrick/actions/runs/41206146216) : suite historique passée **sur ancien moteur** uniquement. |
| Première CI T-001 #66 | [Run 41265387635](https://github.com/Sijiel44/archives-alrick/actions/runs/41265387635) : échec à la ligne 207 du test de rejeu, qui confondait le premier ACK et l'ACK de répétition. Le test a été corrigé dans le commit `9eaa26a`. |
| CI #66 au commit `572b6fc` | [Run 41265911468](https://github.com/Sijiel44/archives-alrick/actions/runs/41265911468) : `npm ci`, `npm test` (incluant `npm run tables:test`), `npm run test:m04:browser` et **`npm run tables:browser` réussis**. |
| `npm run tables:test`, `npm test`, `npm run test:m04:browser` exécutés localement | **Non exécutés localement** : clone Git inaccessible par résolution DNS. Vérification uniquement via GitHub Actions après réussite. |
| 3 profils Chrome headless indépendants MJ + J1 + J2 | **Exécutés dans la CI** (`scripts/test-tables-browser.mjs`) : création identité, invitations, approbations, jet partagé, note secrète MJ, reconnexion. |
| Trois navigateurs physiques pilotés humainement, sauvegardes historiques personnelles, vrai LAN, coupure disque | **Non exécutés** ; recette terrain distincte des trois profils Chromium automatisés. |

### Recette navigateur réelle automatisée — périmètre attesté
`scripts/test-tables-browser.mjs` démarre un serveur Tables en boucle locale et trois profils Chrome indépendants, réalise des inscriptions, invitations, approbations, jets partagés, vérifie l'absence de la note MJ dans les profils joueurs et la reconnexion d'un joueur. Cette preuve est distincte des scénarios `test:m04:browser` centrés sur l'Atelier. Elle **n'est pas une session humaine sur trois appareils**.

## 5. Réserves et risques résiduels

1. Import réduit, sans inventaire/capacités/campagne complète ; aucune écriture inverse vers le canon ou l'Atelier.
2. Notes MJ exclues de la file de reprise ; création de compte si ACK clé perdu sans méthode de récupération.
3. Reçus persistants sans purge/quotas ni `fsync` ; pas de transaction multi-processus, pas de sauvegarde exportable guidée par UI.
4. Test serveur Node/WebSocket ≠ vraie recette multi-navigateur ; tester explicitement CORS/Origin, reconnexion, filtrage des secrets et expérience mobile.
5. Prototype HTTP/WS clair en `127.0.0.1` ; toute exposition Internet nécessiterait refonte sécurité TLS, tokens, quotas et stockage transactionnel.
6. Arbitrage humain de la sémantique des ressources M03, de l'équilibrage et de la compatibilité future #55.

## 6. Verdict de mission et état de la PR #54

**#54 demeure ouverte, ancienne et non prête pour revue de fusion en l'état.** La PR **#66** est le complément technique proposé, **en brouillon et non fusionné**. La CI et les tests Chrome automatisés sont désormais verts : **#66 est apte à une revue de code et de sécurité**, mais **pas à une fusion** avant recette humaine MJ + 2 joueurs, import/export de sauvegardes réelles, revue de sécurité et validation explicite du créateur. La CI positive ne vaut pas autorisation de fusion.

**Restrictions respectées :** pas de déploiement Internet, de modification canonique, de fusion automatique ou de nouvelle formule mathématique.

