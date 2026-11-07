# Correspondance contrôlée #102 ↔ #105 — contrat commun R2

**Comparaison des sources :** #102 ATELIERS HEAD `85f473d2005903a6fc81d37a83fcc6b3c6d16466` :
- JSON Schema `DATA_MODEL_001_SCHEMA.proposal.json` blob `c1226bc88f89a2749979bc31e8168f5bcf68b857` ;
- validateur `DATA_MODEL_001_VALIDATE.proposal.mjs` blob `3d26ff4924aac841400d299e31bc2781997bd078` ;
- 14 fixtures originales blob `577ffaf0fecefb553db3feecf218a8d5bd936382`.

#105 INDEX HEAD `4f3dffd51f16c0c1881f925a94a677a87feff17c`, `experiments/p1a-index/src/data-model.mjs` blob `042e603a19a6c809b782e87c207eb8eecf8cbfdd`, schéma blob `157ab2462c605bbccb7ed3c1832bdad0faaa1434`. La révision R2 **ne remplace PAS ces fichiers**.

| Notion | ATELIERS #102 | INDEX #105 / profil R2 | Décision et limite |
| --- | --- | --- | --- |
| Version du contrat | `schema=cer.p1.data-model.record.proposal.v0` | **conserve** `schema=cer.index.data-model.p1a.proposal.v0`; `extensions.profile=...r2.experimental` | Une seule enveloppe cible ; schéma #102 est un format d'entrée spécifique |
| Version d'entité | `recordVersion` | `version`; `revision` d'instance séparée | SemVer conservée, aucune promotion |
| Catégorie nœud | `nodeType=definition/variant/instance` | **ajout additif** `nodeType`; `identity.definitionId/instanceId/variantId/campaignId` | Variantes indépendantes ; pas un niveau ou une règle |
| Famille | `entityType=capability/spell/ritual` | `recordKind=ability/spell-ref/ritual-ref` ; autres identiques | Adaptation explicite, labels source intacts dans zone MJ privée |
| Source historique/native | `provenance.originKind/sourceId/sourceSchema/sourceVersion/sourceSha256?/sourceCommit?/fidelity` | `provenance.origin/sourceId/sourceSchema/sourceVersion/sourceCommit/sourceBlob/sourceFidelity` | **Bloquer** les natifs sans `sourceBlob` connu ; SHA256 bytes source ≠ Git blob SHA |
| Vérité de l'univers | `continuity.referenceStatus` | **ajout** `continuity.referenceStatus` | Pas de canon inféré depuis Markdown ou état d'édition ; preuve externe requise |
| Faits joués | `continuity.playedStatus` | **ajout** `continuity.playedStatus` | Indépendant du canon et de la publication |
| Publication | `continuity.publicationStatus` | **ajout** `continuity.publicationStatus` | Published ≠ canon, et aucune commande de publication |
| Compat R1 | aucune `state.layer` unique | `state.layer=proposal/played/canon-reference` | Dérivation **en lecture hérité**; le nouvel état indépendant est conservé distinctement |
| Vie de la fiche | `state.status/revision/current/historyRefs` sur instance | `state.lifecycle`, `revision`, `data` et **original #102 privé** | Les champs inconnus du snapshot original ne sont jamais détruits |
| Mécanique | `mechanics.mode=none/native-reference/pending`, `engine`, `authority=native-only` | `mechanics.status=not-applicable/blocked/...`, `validationStatus` | **Native-reference #102 n'est pas une preuve d'exécution autorisée** ; par défaut `blocked` jusqu'à contrôle moteur |
| Narration | `narrative.title/publicDescription` | `narrative.name/summary` | Texte copié, jamais parsé en nombre |
| Secrets | `privacy.gmOnly`, `playerProjection`, `publicFields` | `privacy.ateliersOriginal` **MJ seulement**, même whitelist remappée | Export complet exclusivement privé, pas de copie vers joueur |
| Média | `mediaId`, `rights=cleared/restricted/unknown`, `audience` | `assetId`, `rights=confirmed/pending`, `visibility` | `cleared` seul peut être candidat public, et uniquement après sélection MJ+STUDIO ; autres bloqués |
| Obsolètes pour R2 | `legacy.fieldDecisions` comme moteur de migration | conservé dans `privacy.ateliersOriginal` | Pas de migration massive / ni publication automatique |
| Extensions inconnues | `legacy.unknownFields`, `extensions` | préservées **dans original #102 privé** | Round-trip exact des valeurs JSON, non des octets de fichiers source |

## Jeu de comparaison retenu

Les **14 fixtures sources** #102 sont l'ancrage de comparaison (PJ N1/N10/N25, créature, variante, scène, etc.). **Pour l'exécution locale de R2**, 15 enregistrements *synthétiques de même forme* ont été générés : trois PJ N1/10/25, définition/instance/variante créature, définition/instance PNJ, objet/flûte descriptif, capacité, sort, rite, définition/instance de scène, 5 participants. Les fixtures #102 originales n'étaient **pas présentes en octets** dans le conteneur Node ; leur schéma, détails et sha ont été lus via GitHub au commit épinglé. **Ne pas qualifier ce test synthétique comme la suite originale #102.**

## Arbitrage de version

- **Recommandé :** conserver `DATA_MODEL_SCHEMA` #105 et `recordKind/identity` comme enveloppe d'agrégation P1, ajouter le *profil R2* et la correspondance `nodeType/continuity` pour les cas ATELIERS ; ne pas renommer le schéma de données existant.
- `#102` demeure une source récupérable depuis `privacy.ateliersOriginal` et un format d'entrée versionné, jamais une seconde base de données officielle.
- **À trancher par DG + ATELIERS + ARCHIVES :** durée de compatibilité du `state.layer` héritage, schéma de référence documentaire et sémantique des statuts d'édition, normalisation des preuves externes / provenance, statut des liens média, identité definition/instance/variant en session, taille maximale et chiffrement éventuel.
