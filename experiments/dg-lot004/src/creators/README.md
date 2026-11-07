# L004-C — Atelier des chaînes descriptives (21 ATELIERS)

**Mandat:** DG-LOT-004, issue #94 ; **base figée** `PR85@2ab809ef5351940e0fc272b859d10f21de894d00`. Modules isolés sous `experiments/dg-lot004/src/creators/`; aucune modification L003 ni du site Quartz. Données fictives exclusivement. La PR #97 INDEX, SHA `62ff4332b9e9ecb9a5437719eaefa61fad01d57d`, fournit le contrat propriétaire à injecter par 05.

## Point d'entrée / dépendances injectées

```js
import {mountCreatorCycle,CYCLE_STYLES} from './src/creators/cycle-ui.mjs';
import {createBrowserCyclePersistence} from './src/creators/cycle-state.mjs';
// Ces imports ci-dessous appartiennent à 05 lors de son assemblage, ils ne sont PAS
// dupliqués par 21 et leur absence doit produire une indisponibilité explicite.
import {mountCreators,validateCreatorDraft,CREATOR_STYLES} from '../dg-lot003/src/creators/index.mjs';
import * as catalog from '../dg-lot003/src/catalog/index.mjs';
import {creatorToCatalog} from '../dg-lot003/tools/adapters.mjs';
import * as indexChain from './src/catalog/index.mjs'; // L004 INDEX #97
const persistence=createBrowserCyclePersistence({
  storage:window.localStorage, origin:window.location.origin,
});
const component=mountCreatorCycle(document.getElementById('creator-cycle'),{
  mountCreators,validateCreatorDraft,catalogBridge:creatorToCatalog,catalog,
  indexChain, studio:studioController, persistence,
  // Port distinct : le vrai adaptateur ARCHIVES L003 de campagne STUDIO,
  // jamais studioController.getCampaign() (mémoire) ni le stockage du cycle.
  loadPersistedStudio:()=>validatedStudioStorage.load(),
  // Exiger la variante STUDIO corrigée, inspection du maillon seule avant scène.
  inspectCreatorAttachment:studioReconcile.inspectCreatorAttachment,
  idFactory:()=>crypto.randomUUID(),
  onExport:async(bytes,name)=>saveConfidentialFile(bytes,name),
});
await component.ready;
// component.cycle.getState() retourne une copie privée
// component.destroy() retire les contrôles sans toucher au stockage
```

**STUDIO** est le contrôleur réel `mountStudio(...)` de DG003, avec `previewCreature`, `copyCreature`, `getCampaign`, `createScene` et `updateScene`, et une campagne possédant `id`. Les adaptateurs `STUDIO/INDEX` doivent déjà exister et fonctionner ; aucune instance fictive n'est simulée à l'intérieur du composant. Le bouton de copie appelle les méthodes STUDIO uniquement après validation MJ de la créature. Le bouton de scène appelle STUDIO uniquement après validation MJ de la scène et copie de la créature. Aucune sélection publique n'est modifiée, aucun `postMessage` ni lancer de sort/débit.

**INDEX L004-C** est injecté via `indexChain` avec ses **vrais exports** `createDescriptiveChain`, `validateDescriptiveChain`, `createPrivateChainSnapshot`, `validatePrivateChainSnapshot` (PR #97). L'atelier construit exactement quatre liens ordonnés `item → capability → creature → scene` avec références de catalogue, provenance, versions, identités sources et instances indépendantes, et relation strictement descriptive. En cas d'absence ou de rejet du port, `bindIndexChain()` échoue **sans mutation de la sauvegarde**. Les copies réelles STUDIO sont exigées avant l'enregistrement de chaîne. Son snapshot `extensions.indexL004.privateSnapshot` est strictement MJ privé et n'est jamais un DTO joueur.

## État et API

`createCreatorCycle({persistence,creatorValidator,catalogBridge,catalog,studio,indexChain,loadPersistedStudio,inspectCreatorAttachment?,idFactory})` retourne :

- `getState`, `getDraft(kind)`, `saveDraft(kind,partialData)`, `setMode('guided'|'expert')`, `go(kind)` ; `kind` = item, capacity, creature, scene, spell (sort facultatif, expert).
- `validateMJ(kind)` : validation descriptive et INDEX v0.2 pour objet/capacité/sort ; **pas d'approbation native d'effet**.
- `attachCreature()`, `attachScene()` : gestes MJ explicites et séparés, avec détection des copies réellement créées ; aucune copie automatique lors de `validateMJ`.
- `bindIndexChain()` : enveloppe de liaison INDEX #97 **après** les quatre validations et les deux copies STUDIO ; sortie `{chain,snapshot,executable:false}`.
- `addOriginalSource(obj)`, `addOriginalSourceBytes(Uint8Array,metadata)` : originaux privés sans conversion de versions, SHA-256 natif pour octets et original en base64.
- `load()`, `exportPrivate()` en `Uint8Array`, `previewRestore(bytes)` (non mutante), `acceptRestore(token)` (confirmation persistée), reprise après rechargement.

Les brouillons sont conservés et les champs **facultatifs/inconnus** restent dans `drafts`, `extensions` et `sourceSnapshots` lors du JSON round-trip. Aucune conversion silencieuse des versions Grimoire numériques, rites textuelles, INDEX SemVer. Les objets sources passés par le consommateur ne sont jamais modifiés. Tout changement de brouillon avant copie invalide les validations en aval. **Après `attachCreature()` et avant `attachScene()`**, les brouillons objet, capacité, créature et sort sont figés, mais **le brouillon scène reste saisissable et corrigeable** : son éventuelle validation est invalidée puis doit être refaite. La copie de créature, ses sources, les IDs INDEX et les validations amont restent inchangés. Dès que `sceneId` existe (ou `extensions.indexL004`), tous les brouillons sont figés et une nouvelle version/chaîne est nécessaire, sans réécriture destructive des copies existantes.

Le dépôt L004-C est privé par contrat applicatif, et `createBrowserCyclePersistence` refuse par défaut toute origine autre que `http://127.0.0.1:4173`. L'intégrateur peut remplacer `persistence` par le port ARCHIVES/IndexedDB de campagne sans changer la logique métier. Seule cette frontière est chargée d'assurer l'écriture atomique et la confidentialité d'accès. Les brouillons/exports contiennent des secrets MJ fictifs et **ne doivent jamais** être montés dans l'origine joueur `4174`.

## P0 ARCHIVES + STUDIO — Port de preuve durable obligatoire (05/11/2026)

**Contrat d'intégration précis :** `loadPersistedStudio: async () => validatedStudioStorage.load()` — lecture indépendante de la campagne **réellement enregistrée par ARCHIVES L003** (file d'écriture, archive privée validée), distincte de `studio.getCampaign()` et de `persistence.load()` du journal CREATORS. `createValidatedStorage.save(studio)` renvoie une Promise sans `{saved:true}` ; ne pas la brancher telle quelle sur le stockage du cycle. `persistence.save(cycle)` doit, quant à lui, acquitter explicitement `{saved:true}` seulement après l'écriture du brouillon/journal ; `attachCreature/attachScene` rechargent maintenant le journal pour s'assurer de son existence avant l'effet STUDIO.

**Vérification MJ :** `inspectStudioRecovery()` refuse un port manquant, une lecture/validation échouée, un journal non retrouvé, une campagne divergente, une copie seulement en mémoire, un ID différent, un snapshot/notes/participants discordants, ou plusieurs copies ambiguës. Un **même ID** doit être observé à la fois en mémoire et dans ARCHIVES avec une représentation privée identique. `reconcileStudioLink` réexécute cette preuve, même si le panneau avait précédemment affiché une correspondance. Une lecture persistée ne doit jamais être remplacée par `getCampaign()` ou par une valeur locale prédéfinie dans le candidat réel.

**Interop STUDIO #98 :** l'ancien inspecteur du blob `f2b3a0254aa8f6ca8fcd4c6299281eee7467581e` exigeait la scène dès la vérification de créature et était bloqué. **Nouveau STUDIO #98@`6bb0b1aecdc1e37b79d3a53dd192a653999d5072`** / `reconcile.mjs` blob `0915b48f023e72ad87692ee9437cf7c837311fe4` résout l'inspection par maillon depuis `extensions.pendingStudioOp` et exige aussi `persistedCycle`. ATELIERS transmet désormais `persistedCycle:savedCycle` depuis `persistence.load()` validé : test direct sur les deux vrais blobs **PASS** (`requires-confirmation`, `durableVerified:true`, même ID et une seule copie). **Incompatibilité restante chez le helper STUDIO `confirmCreatorAttachmentWithEvidence` :** il exige `creator.getStudioRecovery().status==='requires-confirmation'`, mais cette API synchrone retourne intentionnellement `durability-unverified` pour ne jamais présenter la mémoire comme preuve ; le helper doit utiliser `await creator.inspectStudioRecovery()` et exiger `durableVerified===true`. La réparation de ce helper appartient exclusivement à 20 STUDIO, passation publiée dans la PR #98. Le contrôle interne d'égalité exacte reste obligatoire même avec l'inspecteur.

**Limites à 05 et 04 :** il n'existe pas de transaction ACID entre les deux magasins. Une écriture STUDIO encore différée renvoie correctement `unpersisted` tant que le drain ARCHIVES n'est pas achevé ; elle ne doit **jamais** être confirmée provisoirement. La validation des originaux et de la propriété des clés préexistantes, les conflits multi-onglets, les restaurations anciennes sans journal fiable et le drain du vrai stockage relèvent de l'intégration/ARCHIVES. Ne jamais convertir un refus en permission de recréer ou supprimer. Qualification seulement après tests Node24 + Chrome au **même HEAD composite**.

## L004-REPAIR — Journal STUDIO privé et réconciliation anti-doublons

**Cause reproduite sur #100@`093d2504` :** avant correction, `attachCreature()` et `attachScene()` appelaient les méthodes STUDIO **avant** de sauvegarder le lien du cycle. Un échec de `persistence.save` laissait l'instance dans STUDIO sans référence dans le cycle ; réessayer créait une seconde instance.

**Protocole correctif sous responsabilité ATELIERS :**

1. Sauvegarder et faire confirmer **avant** l'appel STUDIO un `extensions.pendingStudioOp` privé : `kind`, `campaignId`, identifiants d'instances préexistantes `beforeIds` et, pour la créature, identité source `documentId/profileId/ruleset`. Le journal **ne contient pas** les notes privées de scène ni les copies de fichiers sources.
2. Exécuter `copyCreature` ou `createScene` STUDIO une seule fois, sur geste MJ. Pour la scène, tenter aussi `updateScene` pour les participants.
3. Sauvegarder le lien du cycle et retirer le journal **dans la même écriture locale confirmée**. Si l'étape 3 échoue, le journal reste durable et le bouton de création est bloqué, y compris après `load()`.
4. Afficher le panneau de reprise privé. `getStudioRecovery()` est **provisoire et sans candidat réconciliable** ; `inspectStudioRecovery()` lit le journal créateur confirmé et la sauvegarde STUDIO via `loadPersistedStudio()` (ARCHIVES indépendant), vérifie campagne, même ID, provenance et contenu privé exact, puis propose **uniquement** un candidat durable. Le résultat d'interface ne contient que des IDs, jamais notes ou snapshots MJ. L'UI exige le clic « Vérifier sauvegarde STUDIO dans ARCHIVES » avant toute confirmation.
5. `reconcileStudioLink(instanceId,{confirm:true})` exige une confirmation explicite du MJ **et** réexécute la lecture persistée indépendante, y compris avant l'écriture du lien ; sans port, journal confirmé, ID identique ou instance durable, refus ferme. Si un `inspectCreatorAttachment` STUDIO est injecté, son statut doit être `reusable` et `persisted:true` pour le même ID. La méthode ne crée aucun objet STUDIO et n'exécute aucune règle.
6. `abandonStudioRecovery({confirm:true})` permet de recommencer **uniquement si aucune nouvelle instance n'existe ni en mémoire STUDIO ni dans ARCHIVES rechargé**, campagne identique, journal créateur durable relu et confirmation MJ explicite. Les sauvegardes sans attestation restent bloquées. Si une instance non reconnue existe, ou si la campagne est différente, c'est une intervention manuelle bloquante, **pas** une duplication automatique.

Le contrôleur vérifie également l'identité de campagne **avant la sauvegarde du journal, immédiatement avant chaque création STUDIO et après son résultat** ; une bascule ne déclenche ni copie dans la mauvaise campagne ni liaison trompeuse. Les modifications concurrentes de brouillon pendant la prévisualisation sont refusées. Le journal empêche `saveDraft` modifiant les brouillons, `validateMJ`, restauration destructive et répétition de création tant qu'il subsiste. Les opérations de réconciliation/annulation/rechargement sont aussi interdites pendant une action STUDIO en vol. L'UI emploie uniquement le DOM texte (`textContent`), aucun HTML non fiable ou `style` inline.

**API actuelle :** `getStudioRecovery()` fournit un statut **non attesté** (`durability-unverified`, `candidates:[]`) ; `await inspectStudioRecovery()` fournit `{pending,status,kind?,candidates:[{id}],canAbandon,durableVerified,message?}`. `reconcileStudioLink(instanceId,{confirm:true})` et `abandonStudioRecovery({confirm:true})` relisent les preuves dans leur propre transaction. `loadPersistedStudio` est optionnel au montage pour les brouillons, **mais indispensable à toute reprise**. Le panneau MJ vérifie la durabilité avant d'activer un choix ; aucune copie/reprise automatique.

**Limites bloquantes :** aucune atomicité distribuée entre STUDIO et ARCHIVES ; la fiabilité dépend de la confirmation réelle de `persistence.save` et de la persistance STUDIO. En cas de changement du profil source, de copie sans provenance STUDIO, de scène partiellement mise à jour ou d'autres créations concurrentes, la réconciliation peut être refusée : corriger/vérifier dans STUDIO avant de lier, sans relancer « Créer ». Un **ancien export restauré depuis une autre session**, sans le journal d'intention mais avec des instances STUDIO déjà créées, n'offre pas de preuve d'idempotence globale ; une vraie transaction multi-moteurs ou clé d'idempotence STUDIO/ARCHIVES devra être contractée séparément par 05/20/04. Aucune récupération silencieuse des données inconnues ni transformation de provenance n'est pratiquée.

**Tests de panne** : nouvelle suite de onze cas `REPAIR:` dans `tests/creators/cycle-state.test.mjs` (échec du journal avant création ; échecs après copie/création ; recharge et lien explicite ; absence d'instance ; provenance contradictoire ; export de journal et corruption ; concurrence ; opérations en vol ; restauration obsolète ; changement de campagne avant/après journal) et un test UI de confirmation sans canari. **Node/Chromium/CI sur HEAD intégré : à relancer par 05/02.** La vérification propriétaire JS en isolat V8 sur blobs GitHub ne remplace pas `node --test`, le vrai SHA-256 natif ni le navigateur.

## UX et sécurité

`mountCreatorCycle(root,options)` réemploie `mountCreators` L003 avec `injectStyles:false` : **aucun `<style>` inline**. 05 copie `CYCLE_STYLES` et `CREATOR_STYLES` dans son fichier CSS externe sous CSP `style-src 'self'`, sans `unsafe-inline`. Navigation boutons DOM, champs étiquetés, messages `role=status` et focus-visible CSS ; mode guidé limite les étapes, expert autorise l'inspection et un sort narratif facultatif. Prévisualisation MJ seulement, sans iframe ni écran joueur.

La flûte du LAB n'est qu'un exemple de questionnement : cible, audition, durée, interruption, prérequis. Aucun « −2 », bonus, coût, débit, effet numérique, XP attribuée ni `resolveSpellCast` autorisé. La zone XP est volontairement **indisponible** : même avec la factory suggestion INDEX #97, l'affichage et le choix MJ ne seront activés qu'après contrat MATH/INDEX + intégration vérifiée. Ne jamais afficher une récompense comme créditée sans confirmation native.

## Tests

Depuis la racine du clone complet :

```sh
node --test experiments/dg-lot004/tests/creators/*.test.mjs
```

La régression ciblée P0-C reproduit l'ordre Chrome de la PR #95 : **valider objet → capacité → créature → copier créature STUDIO → saisir/valider scène → lier scène**. Elle vérifie aussi le refus des modifications en amont après copie et le verrouillage total après liaison de scène. La prévisualisation et les secrets MJ restent privés ; aucune formule ou débit n'est activé.

La suite exerce les modules `.mjs` **réels** sans formule Python de substitution : ordre guidé/expert, refus INDEX, copie STUDIO, sauvegarde/rechargement/round-trip, champs inconnus, versions, octets et SHA, contrôle d'origine, sécurité descriptive et simulation du contrat INDEX L004-C injecté. Le test indépendant des fonctions INDEX natives de #97, des sources M01 TypeScript et de Chromium sur la page intégrée **appartient à 05/QA** et n'est pas réputé exécuté par ATELIERS. Les tests DOM propriétaires utilisent un double DOM ; ils ne prouvent pas la recette browser réelle.

## Passation et arbitrages

**À 05 INTÉGRATION / 20 STUDIO :** copier les quatre fichiers source+tests et ce README depuis le HEAD propriétaire, enregistrer blobs, câbler `indexChain` #97, le contrôleur STUDIO et un stockage local. Ajouter le CSS au build **sans injection inline**. Tester le parcours entier sur PR intégrée, notamment les instances de scène réelles et les refus de collision.

**À INDEX #97 :** vérifier références source/instance et snapshot strictement privé. **À MATH / MAG / OBJETS / BESTIAIRE :** aucun calcul, malus, charge, mana ou capacité acquise ; vérifier l'absence de débit et ne pas activer XP sans délégation native. **À QA :** round-trip, champs inconnus, sauvegarde refusée, canari MJ, absence de DTO et de mutation ressources, clavier/lecteur écran. **À DG/créateur :** seule validation d'intégration/QA peut qualifier le lot ; aucun merge, Pages, canonisation ou publication.

## INTEROP confirmée / bloquée — STUDIO #98 et ARCHIVES L003 (05/11/2026)


Le contrôle croisé a exécuté les **blobs sources réels** `src/studio/reconcile.mjs` STUDIO #98@`9729d1085a8714cc01d769908adfd5aa87e7ef9b` (blob `f2b3a0254aa8f6ca8fcd4c6299281eee7467581e`) et `cycle-state.mjs` de la PR #100. Tests avec données synthétiques exclusivement, JavaScript V8 ; ce n'est PAS un navigateur ni le vrai magasin 04.

- **Incompatibilité de séquence :** `inspectCreatorAttachment({campaign,persistedCampaign,cycle})` exige `drafts.scene.title/privateNotes` même lorsque seul le lien `creature` doit être contrôlé. Pendant le parcours autorisé `attachCreature → renseigner scène`, le port STUDIO rejette `Référence créature ou brouillon scène incomplet`. 20 STUDIO doit fournir une inspection par maillon, ou 05 un adaptateur documenté **sans inventer de scène ni de secret**.
- **Écart de durabilité démontré :** une nouvelle créature en mémoire absente du `persistedCampaign` donne côté STUDIO `creature.status='unpersisted'`, `action='block-automatic-retry'` ; le contrôleur ATELIERS antérieur peut retourner `requires-confirmation` et accepter `reconcileStudioLink(id,{confirm:true})` **sans preuve persistée**. Il ne faut pas qualifier ce lien tant que 05/04 n'ont pas fourni un port indépendant de lecture durable avec égalité campagne + ID + provenance (+ participants et notes conservés côté MJ pour la scène).
- **Archives :** `createValidatedStorage(owner,area).save(studio)` du module L003 retourne `Promise<void>` après une écriture validée/ordonnée ; `createCreatorCycle` attend `persistence.save(cycle) → {saved:true}`. L'intégration doit fournir un adaptateur d'ACK explicite **après** relecture vérifiée, sans attribuer `{saved:true}` au simple succès de `copyCreature` / `createScene`. Le cycle démonstration de #95 utilise actuellement une **autre** clé `cer.dg004.creators.private.demo.v0` dans `window.localStorage` : elle ne prouve pas la persistance STUDIO par elle-même. Protéger sa propriété et les données préexistantes, notamment lors du rollback.
- **Nouvelles régressions de sécurité propriétaires :** une réconciliation avec deux nouvelles copies de provenance identique est `ambiguous` et refuse toute confirmation d'ID ; une restauration sans journal qui rencontre une créature de même provenance ou une scène de même titre dans STUDIO refuse une seconde création. Cette vérification prudente peut aussi bloquer volontairement une nouvelle instance légitime de même espèce/titre : requiert arbitrage MJ/version distincte, jamais un doublon silencieux.
- **Limite persistante :** aucun protocole de commit distribué ni preuve d'absence de doublon à travers deux onglets/une sauvegarde étrangère ; **ne pas relier** si STUDIO répond `unpersisted/ambiguous/stale/conflict/needs-participants`, si campagne divergente, ou si archive antérieure non attestable. Une confirmation MJ ne remplace pas le port durable.

**Contrat attendu de 05/20/04 avant recette P0 :** vérifier la durabilité du journal créateur avant création ; exposer à 05 `loadPersistedStudio()` (ou équivalent 04, séparé du getter mémoire) ; faire accepter au port de réconciliation STUDIO une inspection du maillon `creature` avant brouillon de scène ; contrôler ID et provenance dans **la campagne persistée**, refuser ambiguïté et restaurations anciennes sans journal ; seulement ensuite confirmer le lien du même ID. Scénarios réels à rejouer : panne avant/après action, reload/retour, ancienne archive, plusieurs candidats, changement de campagne, canari privé et éventuelle scène partiellement mise à jour. Aucun `unsafe-inline`, publication ni partage joueur.

## P0-OWNER-SUPPORT-001 — Cas natifs S07/S09

Référence : `P0_OWNER_SUPPORT_S07_S09.md`. Le port de secours `createBrowserCyclePersistence()` refuse désormais les **clés créateurs étrangères**, un cycle d'un autre ID et une **révision obsolète** déjà modifiée depuis le dernier `load/save` observé. Pour modifier une clé préexistante, le contrôleur doit d'abord effectuer une relecture valide ; `save` refuse toute mutation silencieuse du même numéro de révision. Après `setItem`, une relecture égale est exigée avant `{saved:true}`.

**Limite explicite :** la comparaison `getItem` → `setItem` de localStorage **n'est pas atomique entre onglets**. Ne pas prendre le succès des tests séquentiels S07/S09 pour une exclusion concurrente vraie. Le démonstrateur #95 utilise un **autre port intégrateur**, `createGuardedCreatorPersistence` (Web Locks + enveloppe SHA et révision), qui ne doit pas être remplacé par ce fallback. Faire valider la concurrence réelle par 05/04/QA. Les cas S03 et S08 du banc original restent sous responsabilité ARCHIVES. Aucun assouplissement de `pendingStudioOp`, de l'inspection durable ou de la protection des notes privées.
