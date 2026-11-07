# FICHE DIRECTION — L004-REPAIR, 10 MATH

**Panne** : PR #95 HEAD intégré `b75e7f03af625fa1f09782cde4e480c2c6d21c84`, CI Chrome #42029632210, `DG004_P0B_XP_BLOCKED` : INDEX `JSON privé invalide: Valeur non JSON`, MATH `suggested`.

**Cause démontrée** : `pj:dg004-fake-pj` (ID natif ARCHIVES formé par préfixe + sheet.id) échoue au regex INDEX ancien sans `:`. La factory laisse `id:undefined`; le clone JSON strict refuse ce `undefined`. Résultat M01 sur l'événement navigateur de difficulté 3 / ordinaire : **60 XP suggérés**, aucun crédit. Ne pas toucher à M01/M02.

**Correctif propriétaire déjà prêt** : INDEX #97 HEAD `d071842639d0adc952dedf3e279c6a1b7004855c`, `src/catalog/index.mjs` blob `27ffd1dbb520eed8fff3efd293948c94ea57cf95`, reçoit ID natif, garde identité exacte, error codes et déduplication source/run. **05** est l'unique écrivain de la branche intégrée ; MATH n'écrase pas INDEX.

**Livrables MATH ajoutés à PR #99** : test `repair-math-browser-parity.test.mjs`, test composite `verify-index-browser-bridge.mjs`, rapport diagnostic et présente fiche. Exécution locale vraie MATH (source TypeScript) : **67/67 tests PASS**, dont quatre ciblés ; test composite INDEX **NON EXÉCUTÉ** faute de clone, précondition manquante explicitement refusée. Aucune branche intégrée touchée.

**Contrat à 05/INDEX/QA** : garder `campaignId`, `characterInstanceId` `pj:...`, `event`, scope, historique et source/run sans alias ; INDEX suggestion inerte → MATH/M01 60 identiques → décision MJ séparée → journal/idempotence/corrections sans mutation fiche ; PNJ pas de XP ; boss+quête même accomplissement pas de double crédit. Recetter sur source assemblée exacte ; la même CI signale **aussi** `CYCLE_scene_VALIDATION_REJECTED` côté ATELIERS/STUDIO, distinct de XP.

**Statuts** : diagnostic et tests MATH **validés** ; patch INDEX R2 **lu et propriétaire, pas réappliqué** ; validation du raccord Chrome/CI finale **bloquée en attente d'exécution** ; barèmes expérimentaux sans adoption.
