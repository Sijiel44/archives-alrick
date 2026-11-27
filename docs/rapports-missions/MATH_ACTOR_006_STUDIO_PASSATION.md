# MATH-ACTOR-006 — Passation Studio et recette
**Statut : candidat d'intégration, PAS publié dans le Studio.** Mission [#180](https://github.com/Sijiel44/archives-alrick/issues/180).

Le lot B issu de la version 49 du Studio, sans modifier M01–M03, met à disposition :
- `encounter-draft.mjs` : brouillon versionné, participants uniques, camps, rôles, comparatif descriptif sans barème inventé ;
- `encounter-studio-bridge.mjs` : lecture de fiches existantes, vérification des références et de l'appartenance à la campagne, sauvegarde CAS via un port transactionnel, rechargement et prévisualisation M03 sans débit ;
- `encounter-planner-ui.mjs` : composant DOM « Préparer une rencontre », sélection du PNJ/créature, camp, rôle, cinq dés physiques et prévisualisation.
- 24 tests Node annoncés dans le bundle local : **24/24 passent** en environnement isolé, Node 22 ; ce décompte ne correspond pas aux seuls tests intégrés au dépôt.

Les fichiers livrés à l'utilisateur figurent dans l'archive de travail **MATH_ACTOR_006_STUDIO_BRIDGE_R2.zip** (contenant source, 24 tests et SHA256) et dans `INTEGRATION_STUDIO.md`. Le code reste à recopier/intégrer au dépôt **distinct** du site Chroniques, non hébergé dans ce dépôt Quartz (Archives d'Alrick).

## Interfaces à raccorder dans le vrai Studio
`createEncounterStudioBridge({campaignId, encounterId, catalog, repository, resolveM03})`

- `catalog.list({campaignId})`, `catalog.read({campaignId,actorId})` : identité d'instance, appartenance et profils M03 approuvés, sans exposer les notes privées ;
- `repository.read({campaignId,encounterId})`, `repository.compareAndSwap({campaignId,encounterId,expectedRevision,nextDraft})` : **atomicité IndexedDB obligatoire** ;
- `resolveM03({attacker,defender,action:{dice:[d1,d2,d3,d4,d5]}})` : moteur officiel uniquement, sans débit ni écriture.

`mountEncounterPlanner(root,bridge)` expose la présentation. Son bouton de prévisualisation **n'enregistre pas** les PV ou coûts.

## Verrous non validés
- Vérifier M03 natif et permissions INDEX sur le site réel ;
- Recette IndexedDB, conflits 2 onglets, export/réimport de campagne et secrets MJ/joueur ;
- Recette navigateur ordinateur/tablette/mobile, accessibilité et simulations de combat multi-acteurs ;
- Homologation du barème de danger (aucun barème nouveau dans ce lot).

Ne pas publier avant ces vérifications. **La branche intégrée du nouveau Studio n'a pas été modifiée à cette étape.**

## Reprise de revue — lot B.1 (26 novembre 2026)
- PR #181 (base de revue : `3d574b58cc60fd95e901f3fb93f54b2bd9558db7`) : CI « Vérifier les Archives », exécution #45922895720, réussie ; l'étape `npm test` est verte.
- Le dépôt à cette base contient **12 tests** dans `encounter-studio-bridge.test.mjs`, contre 24 annoncés pour un bundle local non versé intégralement dans GitHub. Les deux périmètres doivent rester distincts dans les rapports.
- Le lot B.1 ajoute **4 tests de non-régression** (16 tests définis dans le dépôt) : réduction du catalogue aux champs de sélection, refus d'identité retournée incompatible, invalidation du profil M03/libellé modifié et isolation de l'état après accusé CAS incohérent. Réussite de la nouvelle CI : à vérifier sur le commit B.1.
- Aucun calcul 5d6, barème de danger ni moteur M01/M03 n'est modifié. Aucun droit d'accès n'est déduit de l'interface : les ports réels du catalogue devront prouver l'autorisation MJ avant chaque lecture.
- Le nouveau dépôt applicatif du Studio Chroniques n'est pas accessible avec la connexion GitHub disponible lors de cette revue. **Aucune intégration native, recette IndexedDB réelle ni publication du site Chroniques n'est revendiquée.**

### Conditions de passage au lot C
1. Obtenir le vrai dépôt/contrat du Studio Chroniques et connecter `catalog.read/list` aux contrôles d'accès INDEX.
2. Mapper les références validées vers le résolveur M03 natif, en prouvant l'absence de mutations de PV/mana/charges/XP lors de la prévisualisation.
3. Implémenter `repository.compareAndSwap` en transaction IndexedDB, et tester conflit 2 onglets, panne, export et restauration.
4. Tester le parcours complet bibliothèque → préparation → opposition → sauvegarde → rechargement sur ordinateur et tablette, y compris la protection des secrets MJ.
5. Soumettre à QA, STUDIO et DG avant toute fusion ou publication.
