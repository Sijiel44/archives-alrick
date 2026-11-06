# L004 — Passation opératoire 05 / 21 / 04 — pendingStudioOp

**Source STUDIO** : PR #98, branche `prototype/dg004-studio` (HEAD à relever après commit). **Source 21** : PR #100 @ `ecce2ada4d20e401a5fff111c8d1902f133559af`, fichier `src/creators/cycle-state.mjs` blob `7732418addcc62638dccd59eed0f2da25c0bcfe5`. **Base produit** : PR #85 @ `2ab809ef5351940e0fc272b859d10f21de894d00`.

## 05 INTÉGRATION — séquence exacte

1. Copier les seuls fichiers propriétaires STUDIO changés, sans toucher aux PR source.
2. Brancher les `load()` indépendants : `creatorPersistence.load()` retourne **le cycle durable** (journal privé) et `studioStorage.load()` retourne **la campagne restaurée et vérifiée par ARCHIVES**. Ne pas passer directement l'objet volatile `creator.getState()` aux deux paramètres.
3. **Avant tout appel** à `creator.reconcileStudioLink`, appeler `inspectCreatorAttachment({campaign:studio.getCampaign(),persistedCampaign:await studioStorage.load(),cycle:creator.getState(),persistedCycle:await creatorPersistence.load()})`.
4. L'interface peut proposer seulement un `reusable` dont l'ID est exactement celui affiché par `creator.getStudioRecovery()` ; pour écrire le lien, appeler `confirmCreatorAttachmentWithEvidence({...confirm:true,instanceId})` **après confirmation MJ explicite**. Cette fonction relit les deux magasins, délègue au code 21 et vérifie que le lien à l'ID exact est sauvegardé.
5. Pour `missing`, `unpersisted`, `ambiguous`, `stale`, `wrong-campaign`, `conflict`, `needs-participants`, `invalid-journal`, `unattestable` : **aucun second `copyCreature()` ou `createScene()`**, conserver le journal et ouvrir un incident ou une reprise MJ distincte. `abandonStudioRecovery` uniquement si 21 et 04 attestent l'absence d'effet, sur consentement MJ.
6. Relancer les scénarios sur vrai checkout : `node --test experiments/dg-lot004/tests/studio/*.test.mjs` ; `node --test experiments/dg-lot004/tests/studio/L004_PENDING_REAL_INTEROP.mjs` ; tests ARCHIVES et ATELIERS ; build, navigateur 4173/4174, QA, reprise/restore et canaris, **au même SHA exact**. Pas de serveur local concurrent sur les mêmes ports.

## 21 ATELIERS — invariant de journal

`pendingStudioOp` doit être persisté AVANT l'action avec `campaignId`, `beforeIds`, `kind` et, pour créature, `source:{documentId,profileId,ruleset}`. Le cycle refuse ensuite une seconde création avant réconciliation. Après action, le lien ID et la suppression du journal forment une seule écriture durable confirmée. Un ACK perdu ne donne aucun droit de réémission de copie. Le contrôle de mémoire `getStudioRecovery` de 21 ne suffit **pas seul** : il ignore le magasin ARCHIVES durable ; 05 doit imposer le garde STUDIO.

## 04 ARCHIVES — attestations et limites

Relecture de campagne authentique (source, empreintes et snapshot) avec l'ID/campagne attendus ; rejet non destructif d'une version ancienne ou d'un snapshot non attestable. En cas de sauvegarde volatile non persistée ou d'état antérieur sans journal, le résultat doit rester bloqué. Un `operationId` corrélé dans les deux magasins serait nécessaire pour démontrer une causalité forte en présence de restaurations concurrentes, mais le contrat 21 actuel n'en fournit pas ; **ce besoin reste à arbitrer, ne pas inventer un identifiant rétroactif**.

## QA et communication DG

Tests de panne *avant* le journal, *après* copie mais *avant* lien, rechargement, ID conservé, collision/ambiguïté, scène privée, sauvegarde ancienne sans journal, faux match nom/profil, tests de sélection joueur explicite et `PLAYER_CLEAR` sans `SHOW`. Afficher `PASS/FAIL/NON EXÉCUTÉ` pour la vraie recette. Toute trace d'origine MJ est confidentielle, ne pas l'inclure dans la projection 4174.

**UX ardoise/cuivre/or :** feuille proposition non montée ; aucune modification dans candidat P0.
