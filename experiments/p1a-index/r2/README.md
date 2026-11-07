# INDEX P1 — DATA-MODEL-001.R2 / CORE-COMPAT-001.R2

**Contrat pilote : schéma existant `cer.index.data-model.p1a.proposal.v0` (#105), profil de conformité ADDITIF `cer.index.data-model.p1a.profile.r2.experimental`.** Pas de second schéma d'enveloppe, pas de statut canon, aucun appel applicatif, transaction de stockage ou règle 5d6 nouvelle.

Base propriétaire #105 `4f3dffd51f16c0c1881f925a94a677a87feff17c`, source ATELIERS #102 `85f473d2005903a6fc81d37a83fcc6b3c6d16466`, prototype de stockage BUILDER/ARCHIVES à revoir #104 `f84f8c54361b3701ebb0251700f2d0d09d4acf4d`. Tous les jeux de données *créés* ici sont fictifs. Les sources originales #102 ne sont PAS les 15 reproductions synthétiques ; elles ne sont pas réécrites.

## Modules et signatures

`src/model-r2.mjs` importe les sources P1-A #105 (`src/data-model.mjs`, `src/core-ports.mjs`) sans les modifier :

| Export | Sens exact |
| --- | --- |
| `validateR2Record(record)` / `validateR2Dataset(records)` | Contrôle additif nodeType, graphes, trois vérités indépendantes, versions, média, privilèges ; `{ok,value?,code?,issues?}` |
| `adaptAteliers102(source)` | Conversion explicite du vocabulaire **#102** vers enveloppe **#105** ; original JSON conservé dans `privacy.ateliersOriginal`; aucune interprétation mécanique |
| `recoverAteliers102(record)` | Retrouve l'original #102 depuis la zone privée, sans déduire une transformation inverse approximative |
| `makeArchStorageCandidate(records,{campaignId})` | Projection de structure vers `cer.arch-storage001.campaign.proposal.v0` (#104) ; `persisted:false`, `requiresExplicitCommit:true` |
| `recoverArchStorageCandidate(campaign)` | Relit l'extension **privée** `extensions.indexP1R2`, puis revalide le dataset ; aucune restauration persistante |
| `exportR2Private(records)` / `importR2Private(json)` | Aller-retour JSON **sémantique** #105, pas archive ARCHIVES octet-exact, pas preuve d'authenticité |
| `previewCandidateViaNative(record, ports)` | Délègue M01 pour PJ, M03 pour créature *uniquement* quand `mechanics.status='native-reference'`, blob épinglé et port injecté ; aucune règle calculée dans INDEX |
| `selectedPublicCandidate(record,{selected:true})` | Aperçu **candidat uniquement** ; **STUDIO** devra fabriquer l'unique DTO joueur sous sa whitelist d'origine |

## Commandes réellement exécutées en environnement isolé

```bash
node r2/tests/generate-r2-fixtures.mjs
python r2/tests/build-profile-schema.py
python r2/tests/check-r2-schema.py
node --test tests/data-model.test.mjs tests/core-compat.test.mjs r2/tests/model-r2.test.mjs
```

Commandes conditionnelles (tests écrits mais **NON EXÉCUTÉS** sans clone composite des propriétaires, `npm ci`, esbuild, #104) :

```bash
node --test r2/tests/native-core-on-assembled-clone.test.mjs
node --test r2/tests/native-storage-on-assembled-clone.test.mjs
```

La source `#102` emploie le vocabulaire `recordVersion/nodeType/entityType`, tandis que la source `#105` emploie `version/recordKind/identity`. Une entrée source non épinglée est **refusée** en mode `native`/`legacy`; on n'invente jamais de blob ou une attestation. Les données de démonstration `#102-shaped` sont synthétiques et ne remplacent pas l'original #102.

**Limites :** schéma R2 = profil d'essai en plus du schéma P1 v0. Les valeurs historiques `state.layer` restent une projection héritée (pas une autorité), l'adaptateur exige une décision explicite sur l'identité `recordId`, l'export JSON P1 ne remplace pas les sauvegardes natives, `#104` IndexedDB/sha256 n'a pas été exécuté sur cet isolat, le profil médiatique ne valide aucun droit, aucun moteur M01/M03 réel n'a été exécuté ici. Ne pas répercuter ce dossier sur #95, Pages ou canon.
