# STUDIO — DG-LOT-004 / L004-REPAIR2 — contrat de reprise ATELIERS/ARCHIVES

## Références exactes et statut

- Mandat DG : PR #95, commentaire `6675770853` (05/11/2026).
- Base propre STUDIO : PR #98 `9729d1085a8714cc01d769908adfd5aa87e7ef9b`.
- ATELIERS étudié : PR #100 `ecce2ada4d20e401a5fff111c8d1902f133559af` ; `src/creators/cycle-state.mjs` blob `7732418addcc62638dccd59eed0f2da25c0bcfe5`.
- Source ARCHIVES native de référence L003 : PR #85 `2ab809ef5351940e0fc272b859d10f21de894d00`, module `dg-lot003/src/storage/storage.mjs` blob `be6a881018ae1709ecef71c3c5a155acfb94a658`.
- L004 intégré #95 : toujours un candidat distinct de la branche STUDIO ; aucun P0/QA revendiqué.

## Incompatibilité démontrée par code

L'ancien `inspectCreatorAttachment` du blob STUDIO `f2b3a0254aa8f6ca8fcd4c6299281eee7467581e` parcourait les créatures/scènes sur la similarité de référence, de titre, de description et de notes. Il **n'exigeait pas** `cycle.extensions.pendingStudioOp`, les `beforeIds` ni la preuve du journal dans le magasin créateur. Sur les données synthétiques reproduites :

- même créature et même scène présentes dans l'état mémoire et sa sauvegarde ; cycle ancien **sans journal** : **ancien inspecteur :** `link-existing-after-MJ-confirmation`, créature `old-creature`, scène `old-scene` ;
- mêmes données/cycle : **nouvel inspecteur :** `block-automatic-retry`, deux statuts `unattestable` ;
- journal durci `{kind:'creature',campaignId,beforeIds:[],source:{documentId,profileId,ruleset}}` enregistré : un seul acteur candidat reconnu, `reusable` et **confirmation MJ nécessaire**. La scène reste `not-targeted`.

La trace JSON originale est `tests/studio/L004_PENDING_MISMATCH_REPRO.json`. Cette différence est une **preuve de reproduction unitaire**, pas une preuve d'incident réel chez le MJ.

## Correctif livré exclusivement STUDIO

1. `src/studio/reconcile.mjs` : `inspectCreatorAttachment({campaign,persistedCampaign,cycle,persistedCycle})` conforme à la nouvelle forme `pendingStudioOp` de #100. Refuse journal manquant/altéré, ancienne restauration, campagne autre, baseline disparue, ID dupliqué, source discordante, acteur non sauvegardé, scène sans participant et toute candidature multiple.
2. Nouveau port `confirmCreatorAttachmentWithEvidence({creator,studio,creatorPersistence,studioStorage,instanceId,confirm:true})` : relecture **réelle** des deux magasins, contrôle croisé avec `getStudioRecovery()` d'ATELIERS #100, consentement explicite et appel **unique** à `reconcileStudioLink(id,{confirm:true})`, suivi d'une relecture durable du lien. Pas de nouvelle copie ni scène ; pas de rollback destructif.
3. Tests `L004_PENDING_CONTRACT.test.mjs` : 25 scénarios synthétiques sur le véritable module STUDIO, y compris pannes avant/après, deux instances, source divergente, absence de journal, ancienne restauration et nouvelle confirmation.
4. Test `L004_PENDING_REAL_INTEROP.mjs` : **livré mais NON EXÉCUTÉ**, dépend explicitement du module ATELIERS #100 et des modules ARCHIVES/adaptateurs L003 dans un même checkout. À exécuter par 05 sans stubs, mais il ne remplace pas Chrome/QA.

## Tests exécutés ici

```text
node --test experiments/dg-lot004/tests/studio/*.test.mjs
60 PASS / 0 FAIL / 0 SKIP  (dont 25 nouveaux)
node --test experiments/dg-lot003/tests/studio/*.test.mjs
22 PASS / 0 FAIL / 0 SKIP
node --check experiments/dg-lot004/src/studio/reconcile.mjs
PASS
node --check experiments/dg-lot004/tests/studio/L004_PENDING_REAL_INTEROP.mjs
PASS (syntaxe uniquement)
```

Environnement Node `v22.16.0`. Les 20 tests historiques réutilisent les **vrais modules STUDIO L003** avec un substitut local de résolution d'import pour la seule interface `mountCreators` L003 (sans prétention d'avoir exercé son DOM). Les 25 tests nouveaux sollicitent le vrai code de réconciliation, avec campagnes et magasins fictifs. Les 15 tests `demo.test.mjs` utilisent leurs ports doublés. **Aucun test sur la véritable implémentation ATELIERS #100 ou le véritable magasin ARCHIVES n'est déclaré exécuté ici**. Le clone Git complet est absent (DNS GitHub indisponible), malgré lecture des sources par connecteur. La tentative explicite du test d’interop (`node --test .../L004_PENDING_REAL_INTEROP.mjs`) échoue à la résolution du module manquant `experiments/dg-lot004/src/creators/cycle-state.mjs`, avec `ERR_MODULE_NOT_FOUND` (exit 1) ; c’est un **BLOCAGE D’ENVIRONNEMENT**, non un PASS ni une panne prouvée du module 21. Journal enregistré sous `L004_PENDING_REAL_INTEROP_BLOCKED.tap`. `npm ci`, `npm test` dépôt, HTTP 4173/4174, navigateur et QA L004 : **NON EXÉCUTÉS**.

## Limites et risques P0 ouverts

- **P0-CR1 :** journal et instance STUDIO ne partagent pas d'`operationId` durable. Un scénario de restauration concurrente dont les IDs/attributs coïncident peut être impossible à attribuer au bon cycle ; un journal et une source correspondants ne sont pas une preuve cryptographique de la cause. Le statut `reusable` signifie uniquement *candidat unique à confirmer*, pas action sûre sans arbitrage MJ.
- **P0-CR2 :** le contrôleur #100 `getStudioRecovery()` inspecte **l'état mémoire STUDIO**, non la sauvegarde ARCHIVES indépendante. 05 **ne doit pas** relier les IDs en appelant seulement `creator.reconcileStudioLink` depuis ce statut ; faire passer le garde `inspectCreatorAttachment` et les deux lectures durables en amont.
- **P0-CR3 :** les pannes de persistance peuvent laisser `unpersisted` ; ne pas supprimer ni recréer l'instance pour compenser. L'ordre des écritures et les erreurs doivent être vérifiés par 04/05 avec la vraie file ARCHIVES et le stockage créateur.
- Ancienne restauration sans journal : `unattestable` et blocage, jamais déduction par similarité de nom.
- Aucune modification du public joueur, des notes privées, des formules, des branches d'autrui, ni de l'UX P0. CSS ardoise/cuivre/or demeure **proposition**.

## Passation demandée

**05 :** reprendre les blobs STUDIO indiqués, brancher `creatorPersistence.load()` et `studioStorage.load()` indépendants, utiliser le garde avant la confirmation MJ, puis lancer le test interop réel et Chrome E2E complet sur HEAD gelé (pas de doubles). Vérifier `PLAYER_CLEAR`, absence de secret et export/restauration.

**21 :** maintenir écriture du journal **avant** `copyCreature/createScene`, ne jamais réessayer une création avec `pendingStudioOp` présent et utiliser le nouveau garde double-magasin par 05. Toute évolution cross-store doit rester dans son sous-arbre.

**04 :** attester l'enveloppe/source/SHA et la persistance réelle de l'instance à l'ID candidat, signaler les restaurations anciennes ou concurrentes sans preuve. Prévoir marqueur durable d'opération si l'arbitrage DG l'autorise.

**02 QA / 03 REVUE :** test négatif des restaurations anciennes sans journal et attaque par clone au même titre/profil, contrôle du DTO joueur et du rollback sur deux origines. Seul leur verdict au SHA intégré final peut qualifier le P0.
