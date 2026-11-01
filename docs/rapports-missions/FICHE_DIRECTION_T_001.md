# ARCHIVES D'ALRICK — RAPPORT DE MISSION

**Identification**  
Mission **T-001 — Synchronisation des Tables multijoueurs avec le moteur 5d6 M01–M05**  
Référent : **Tables multijoueurs** · Date : **31 octobre 2026** · Dépôt : `Sijiel44/archives-alrick`  
Branche : `fix/t-001-tables-parite-m01-m03-20261031` · **[PR #66](https://github.com/Sijiel44/archives-alrick/pull/66)** (complément à la [PR #54](https://github.com/Sijiel44/archives-alrick/pull/54), audit [DG-04/#65](https://github.com/Sijiel44/archives-alrick/pull/65)). Coordination prévue avec [Grimoire #55](https://github.com/Sijiel44/archives-alrick/pull/55).

**Statut : PARTIELLEMENT RÉALISÉE — CI finale et recette navigateur à confirmer.**

## Résultats essentiels
- Le pilote Tables de #54 est repris sur `main` **sans écraser M01–M05** ni modifier le Grimoire. Les jets appellent les fonctions communes `effectiveStat`, `effectiveMastery`, `resolveProgressionAction` (M01) et `resolveCombatM03` (M03), sans seconde formule.
- **Anomalie DG04-01 corrigée en code :** une caractéristique brute de **9 apporte +6**, non +9. Les caractéristiques au-delà de 12 sont importables ; rangs de maîtrise, modificateurs défensifs et valeurs brutes sont conservés. Les combats séparent défense, absorption, critiques et dégâts **proposés**, sans retrait de PV automatique.
- Les imports sont **partiels et versionnés** (instance distincte du canon). Les reçus d'action empêchent un double jet/débit lors d'un rejeu à clé identique ; reprise après reconnexion, refus des modifications concurrentes et restauration JSON intégrés aux tests.
- Les protections MJ, les cinq dés cryptographiques et la séparation entre campagne et encyclopédie sont préservées. Aucun déploiement, fusion ou changement canonique.

## Vérifications et preuves
- Suite automatisée T-001 : niveaux **5, 10, 15, 20, 25**, régression brut 9, parité M01/M03, MJ + deux joueurs WebSocket, accès interdits, concurrence, rejeu après réponse perdue, restauration et JSON corrompu.
- Première CI [#41265387635](https://github.com/Sijiel44/archives-alrick/actions/runs/41265387635) : **échec du test d'ACK** ; test corrigé. **CI actualisée en cours à la rédaction.**
- **Non exécutés localement** : commandes npm (clone distant indisponible), trois navigateurs réels, import de sauvegardes historiques personnelles. La CI GitHub peut fournir une preuve supplémentaire, pas une recette humaine.

## Limites à lever
**Import toujours partiel** : inventaire, sorts/matrices, capacités, XP, historique, portraits, notes MJ et extensions inconnues non transférés. Sécurité strictement **LAN local / 127.0.0.1**, sans TLS ni base de données multi-processus ; reçus sans purge/quotas ou durabilité `fsync`. Récupération d'un compte dont la clé d'inscription est perdue : non résolue. Recette à trois navigateurs et revue sécurité nécessaires.

## Décision proposée à la Direction générale
**PR #54 : non apte à revue de fusion en l'état.**  
**PR #66 : complément en brouillon, conditionnellement apte à une revue technique après CI verte**, mais **non autorisé à fusionner** avant recette MJ + deux joueurs, contrôles de sécurité/import et validation du créateur.

**Rapport permanent :** [`T_001_SYNCHRONISATION_TABLES_5D6.md`](T_001_SYNCHRONISATION_TABLES_5D6.md) · **Contrat d'import :** [`docs/TABLES_IMPORT_VERSION_T001.md`](../TABLES_IMPORT_VERSION_T001.md).
