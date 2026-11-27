# MATH-ACTOR-006 — Passation Studio et recette
**Statut : candidat d'intégration, PAS publié dans le Studio.** Mission [#180](https://github.com/Sijiel44/archives-alrick/issues/180).

Le lot B issu de la version 49 du Studio, sans modifier M01–M03, met à disposition :
- `encounter-draft.mjs` : brouillon versionné, participants uniques, camps, rôles, comparatif descriptif sans barème inventé ;
- `encounter-studio-bridge.mjs` : lecture de fiches existantes, vérification des références et de l'appartenance à la campagne, sauvegarde CAS via un port transactionnel, rechargement et prévisualisation M03 sans débit ;
- `encounter-planner-ui.mjs` : composant DOM « Préparer une rencontre », sélection du PNJ/créature, camp, rôle, cinq dés physiques et prévisualisation.
- 24 tests Node : **24/24 passent** en environnement isolé, Node 22.

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
