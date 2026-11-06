# STUDIO — L004 P0 : inspectStudioRecovery asynchrone, source ATELIERS #100

**Mandat DG :** PR #100 `ceb316e00d667ba9d5155822fd57cabc931f3380` ; PR STUDIO parent `6bb0b1aecdc1e37b79d3a53dd192a653999d5072`. Seulement `experiments/dg-lot004/src/studio/` et `tests/studio/` modifiés. PR #95 intégrateur inchangée.

## Incompatibilité réelle (reproduite)

Le code STUDIO précédent lit `creator.getStudioRecovery()` sans attente et exige `status:'requires-confirmation'`. L’ATELIERS #100 actuel retourne volontairement `status:'durability-unverified'`, pour empêcher qu’un état en mémoire soit traité comme sauvegarde. En conséquence le helper STUDIO rejette avec « Journal ATELIERS discordant » même lorsque `await creator.inspectStudioRecovery()` retourne un seul candidat attesté et `durableVerified:true`.

**Sources examinées :** vrai blob GitHub `cycle-state.mjs` **`5554b3b12728f0e63388beccec2c58b29b214281`** et vrai blob GitHub `reconcile.mjs` précédent **`0915b48f023e72ad87692ee9437cf7c837311fe4`**. L'écart est confirmé par les commentaires #100 `6676228846` et #98 `6676189858`.

## Correctif propriétaire STUDIO

`confirmCreatorAttachmentWithEvidence` exige la méthode asynchrone `creator.inspectStudioRecovery`, attend la preuve, puis valide strictement :

- `durableVerified === true`, `pending === true`, `status === 'requires-confirmation'`, et `kind` égal au journal.
- `unverifiedCount === 0`, exactement un élément dans `candidates`, et son `id` identique à `instanceId`.
- Les lectures indépendantes **préalables** `creatorPersistence.load()` et `studioStorage.load()` et la comparaison `inspectCreatorAttachment()` sont conservées.
- Le commit est explicitement confirmé par MJ et délégué une seule fois à `creator.reconcileStudioLink(instanceId,{confirm:true})`. Le helper vérifie le même ID, le type et `reconciled:true`, puis relit encore `creatorPersistence.load()` et exige l'absence de `pendingStudioOp`.
- Aucun appel `copyCreature`, `createScene`, rollback destructif, calcul de ressource ou `postMessage` ; aucune modification de la campagne ni de la fenêtre joueur dans ce correctif.

## Tests exécutés et preuves

1. **PASS 68/68**, zéro fail/skip — `node --test experiments/dg-lot004/tests/studio/*.test.mjs` ; Node **v22.16.0**, vraie source STUDIO + doubles pour ports persistants, 8 nouveaux cas async et tests historiques.
2. **PASS 22/22**, zéro fail/skip — `node --test experiments/dg-lot003/tests/studio/*.test.mjs` ; Node 22.
3. **PASS 14/14**, zéro fail — **vrais blobs sources GitHub** #100 `5554b3...` + ancien STUDIO `0915b4...`, assemblés dans l’isolat V8 du connecteur ; source ATELIERS intégrale exécutée, export ESM retiré lexicalement et `TextEncoder`/`TextDecoder`/`structuredClone` polyfillés. Le correctif STUDIO appliqué en mémoire est strictement le même diff que le nouveau fichier. Cette preuve est une exécution JavaScript réelle de la logique des blobs, mais **ni un checkout Node24, ni le vrai ARCHIVES, ni une recette navigateur**. Fichier de cas/résultats : `L004_ASYNC_V8_ACTUAL_BLOBS_RESULTS.json`.
4. **NON EXÉCUTÉ :** `node --test experiments/dg-lot004/tests/studio/L004_PENDING_REAL_INTEROP.mjs` sur le checkout composite avec **vrais fichiers** `src/creators/cycle-state.mjs`, `dg-lot003/src/storage/storage.mjs` et `tools/adapters.mjs` ; tentative locale **EXIT 1 / ERR_MODULE_NOT_FOUND** (`experiments/dg-lot004/src/creators/cycle-state.mjs` absent localement), soit **NON EXÉCUTÉ quant à la logique interop native**, et non un PASS ou un échec applicatif ; DNS GitHub interdit. Trace : `L004_ASYNC_REAL_INTEROP_BLOCKED.tap`. Script amélioré, sans skip, pour 05.
5. **NON EXÉCUTÉ :** `npm ci`, `npm test` général, Chrome réel 127.0.0.1:4173/4174, CI/QA au nouveau SHA intégré et manipulation humaine. Aucun PASS hérité de L003/ATELIERS isolé.

## Régressions négatives

- Source/studio restauré sans journal : refus ; persistance STUDIO altérée : refus.
- Inspection async absente, rejetée, `durableVerified` absent/false, `status` non attesté, `kind` ou ID discordant, deux candidats : refus sans écriture.
- Échec avant ou après mutation STUDIO : même instance, pas de duplication.
- Échec de commit final du créateur ou faux acquittement final : contrôle du lien durable et refus.
- Scène : notes privées conservées chez MJ, non retournées par le DTO du helper.

## Passation 05 / DG

**À copier sans retouche :** `src/studio/reconcile.mjs`, `src/studio/CONTRACT.md`, `tests/studio/L004_PENDING_CONTRACT.test.mjs`, `tests/studio/L004_PENDING_REAL_INTEROP.mjs`, plus rapport et logs. Le manifeste liste blobs exacts.

**05 uniquement** assemble avec ATELIERS #100@ceb316e et le stockage ARCHIVES réel et confirme l'origine de `loadPersistedStudio:()=>validatedStudioStorage.load()` ; aucun adaptateur en mémoire en remplacement. Exécuter les tests Node intégration et le navigateur puis figer un SHA composite ; QA indépendante ensuite. Le contrôle du journal privé/clé étrangère et les cas d'anciennes restaurations demeurent des refus en l'absence de preuve.

**Limite conservée :** l’absence de corrélation `operationId` entre journal et instance STUDIO interdit d’attester certaines restaurations concurrentes ; aucune relaxation de la garde. Charte ardoise/cuivre/or inchangée, non activée.
