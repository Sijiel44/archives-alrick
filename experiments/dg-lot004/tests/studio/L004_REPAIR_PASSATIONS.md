# L004-REPAIR — Passations opératoires préparées (à transmettre explicitement)

**Source de travail :** branche `prototype/dg004-studio`, descendante de PR85 `2ab809ef5351940e0fc272b859d10f21de894d00`. Aucun changement des fichiers 05/21/04/01, du candidat P0 PR #95, des règles ou de Quartz. SHA HEAD et blobs : voir le rapport et la PR STUDIO après publication.

## 05 INTÉGRATION — test et câblage P0 sans retouche des sources propriétaires

1. Copier les blobs STUDIO du HEAD indiqué dans la PR #98, notamment `demo.mjs`, `reconcile.mjs` et `CONTRACT.md`. Ne pas modifier #95 automatiquement ; assembler sur la seule branche 05 après revue.
2. Continuer à fournir `storageFactory` avec **le véritable** `createValidatedStorage(owners.storage,scopedArea,{indexedDB:null})` de L003 et `createDemoAdapters` liés à `getCampaign()` de la démo, jamais à la session MJ réelle. Le wrapper a besoin de `load/save` stricts et de la file d'écriture du port ARCHIVES.
3. Rejouer créature → scène → notes privées → publication whitelist → CLEAR après changement de scène ou reconfirmation créature ; ouvrir uniquement 127.0.0.1:4173/4174. Contrôler canari absent du DTO, postMessage, DOM/stockage joueur, export public et présent dans backup CONFIDENTIEL.
4. Rejouer « création STUDIO réussie → échec d'acquittement créateurs » : état créature/scène récupéré à **même ID**, sans deux copies ni deux scènes après rechargement. Si le lien externe CREATORS n'est pas encore corrigé par 21, signaler **P0/P1 ouvert**, ne pas déclarer le parcours L004-C qualifié.
5. Commandes ciblées : `node --test experiments/dg-lot004/tests/studio/*.test.mjs` et `node --test experiments/dg-lot003/tests/studio/*.test.mjs`. Puis recette réelle `python experiments/dg-lot004/tests/studio/L004_REPAIR_BROWSER_SCENARIO.py` après build/serve de 05. Journaliser SHA du HEAD intégré et navigateur/ports. **Aucun résultat de navigateur sur ce HEAD n'est revendiqué par STUDIO.**

## 21 ATELIERS — anomalie à corriger DANS son propre cycle-state.mjs

Code actuellement lu dans la PR #100 @ `093d2504c7633baff6124ad7986224124946f6ce` : `attachCreature()` fait `studio.copyCreature()` puis `commit(next.links.creatureInstanceId=...)`, `attachScene()` fait `studio.createScene()`/`updateScene()` puis `commit(next.links.sceneId=...)`. Une exception du commit créateur après succès STUDIO laisse le lien nul ; le retry peut recréer une copie ou une scène.

**Contrat conseillé :** avant toute nouvelle copie, lire cycle + STUDIO + persistance STUDIO depuis le vrai port 04 ; appeler `inspectCreatorAttachment({campaign,persistedCampaign,cycle})`. Pour chaque maillon `creature` et `scene` séparément, si candidat unique `reusable` à identité/provenance/participant vérifiés, obtenir confirmation MJ et persister seulement le lien créateur existant, **sans** appeler à nouveau `copyCreature`/`createScene`. Si `unpersisted`, `ambiguous`, `stale`, `conflict` ou `needs-participants`, bloquer copie automatique et expliciter la reprise/association à traiter. Ne pas passer un simple résultat `reusable` pour une autorisation d'effet numérique. Après écriture, relire et vérifier le lien confirmé ; conserver le brouillon en cas de conflit. Tester les deux défaillances artificielles à la frontière `persistence.save`, plus rechargement/restore/répétition du clic. Tout changement de `cycle-state.mjs` appartient exclusivement à 21.

## 04 ARCHIVES — frontière d'écriture/réconciliation/rollback

Confirmer sur le vrai adaptateur L003 que `save/load` et `appendCatalog` sont sérialisés et que `mergePersistentCatalog` conserve les brouillons existants, même si un snapshot Studio ancien est sauvegardé. Évaluer si un port `flush()` ou `saveAndVerifyRevision(expectedRevision)` doit être prévu pour éviter la boucle bornée de la vue, sous contrat du propriétaire. Tester exception avant commit, après commit mais avant ACK, et restaurations depuis backup. **Pas de rollback destructif** de copie ou scène STUDIO après échec du commit CREATORS : les sauvegardes sont deux transactions séparées sans journal commun ; la récupération doit préserver IDs/notes/permissions et exiger validation MJ.

## 01 BUILDER / 21 UX — ardoise/cuivre/or, pas de changement P0

Proposition facultative `src/studio/ux-ardoise-cuivre-or.proposal.css` sous racine MJ uniquement : ardoise `#14212D`/`#233347`, cuivre `#E4B179`, or `#E9C56E`, texte `#F4EFE5`, focus `#FFE299`. Aucun chargement automatique. Vérifier contrastes, zoom 200 %, flux clavier et focus après `render()` (cette dernière partie n'est **pas** qualifiée). Garder boutons ≥44 px, texte de statut clair, version mobile et réduction d'animation. Faire valider toute insertion CSS par 01 + 21 et QA dans l'assemblage de 05.

## 02 QA / 03 REVUE / DG

Exiger tests au HEAD exact de 05 après reprise des propriétaires. Vérifier la double écriture sous injecteur de fautes, les copies/scènes sans doublons après reload, contrôles origin/source sur `PLAYER_SHOW/CLEAR`, confidentialité des notes/export public, et les cas où l'outil choisit **BLOQUÉ** faute de correspondance unique. Verdict autonome de QA, pas de transfert automatique de la preuve Node STUDIO à l'Alpha.

**Statut de ces messages :** préparés et documentés. Ils ne prouvent pas qu'un autre chat les a lus.
