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

`createCreatorCycle({persistence,creatorValidator,catalogBridge,catalog,studio,indexChain,idFactory})` retourne :

- `getState`, `getDraft(kind)`, `saveDraft(kind,partialData)`, `setMode('guided'|'expert')`, `go(kind)` ; `kind` = item, capacity, creature, scene, spell (sort facultatif, expert).
- `validateMJ(kind)` : validation descriptive et INDEX v0.2 pour objet/capacité/sort ; **pas d'approbation native d'effet**.
- `attachCreature()`, `attachScene()` : gestes MJ explicites et séparés, avec détection des copies réellement créées ; aucune copie automatique lors de `validateMJ`.
- `bindIndexChain()` : enveloppe de liaison INDEX #97 **après** les quatre validations et les deux copies STUDIO ; sortie `{chain,snapshot,executable:false}`.
- `addOriginalSource(obj)`, `addOriginalSourceBytes(Uint8Array,metadata)` : originaux privés sans conversion de versions, SHA-256 natif pour octets et original en base64.
- `load()`, `exportPrivate()` en `Uint8Array`, `previewRestore(bytes)` (non mutante), `acceptRestore(token)` (confirmation persistée), reprise après rechargement.

Les brouillons sont conservés et les champs **facultatifs/inconnus** restent dans `drafts`, `extensions` et `sourceSnapshots` lors du JSON round-trip. Aucune conversion silencieuse des versions Grimoire numériques, rites textuelles, INDEX SemVer. Les objets sources passés par le consommateur ne sont jamais modifiés. Tout changement de brouillon avant copie invalide les validations en aval. **Après `attachCreature()` et avant `attachScene()`**, les brouillons objet, capacité, créature et sort sont figés, mais **le brouillon scène reste saisissable et corrigeable** : son éventuelle validation est invalidée puis doit être refaite. La copie de créature, ses sources, les IDs INDEX et les validations amont restent inchangés. Dès que `sceneId` existe (ou `extensions.indexL004`), tous les brouillons sont figés et une nouvelle version/chaîne est nécessaire, sans réécriture destructive des copies existantes.

Le dépôt L004-C est privé par contrat applicatif, et `createBrowserCyclePersistence` refuse par défaut toute origine autre que `http://127.0.0.1:4173`. L'intégrateur peut remplacer `persistence` par le port ARCHIVES/IndexedDB de campagne sans changer la logique métier. Seule cette frontière est chargée d'assurer l'écriture atomique et la confidentialité d'accès. Les brouillons/exports contiennent des secrets MJ fictifs et **ne doivent jamais** être montés dans l'origine joueur `4174`.

## L004-REPAIR — Journal STUDIO privé et réconciliation anti-doublons

**Cause reproduite sur #100@`093d2504` :** avant correction, `attachCreature()` et `attachScene()` appelaient les méthodes STUDIO **avant** de sauvegarder le lien du cycle. Un échec de `persistence.save` laissait l'instance dans STUDIO sans référence dans le cycle ; réessayer créait une seconde instance.

**Protocole correctif sous responsabilité ATELIERS :**

1. Sauvegarder et faire confirmer **avant** l'appel STUDIO un `extensions.pendingStudioOp` privé : `kind`, `campaignId`, identifiants d'instances préexistantes `beforeIds` et, pour la créature, identité source `documentId/profileId/ruleset`. Le journal **ne contient pas** les notes privées de scène ni les copies de fichiers sources.
2. Exécuter `copyCreature` ou `createScene` STUDIO une seule fois, sur geste MJ. Pour la scène, tenter aussi `updateScene` pour les participants.
3. Sauvegarder le lien du cycle et retirer le journal **dans la même écriture locale confirmée**. Si l'étape 3 échoue, le journal reste durable et le bouton de création est bloqué, y compris après `load()`.
4. Afficher le panneau de reprise privé. `getStudioRecovery()` inspecte **en lecture seule** la campagne STUDIO : les nouveaux identifiants absents de `beforeIds` sont candidats uniquement si les données correspondent (référence source pour créature, titre/description/notes/participants pour scène). Le résultat à l'interface ne contient **que** les identifiants, jamais les notes ou le snapshot MJ.
5. `reconcileStudioLink(instanceId,{confirm:true})` exige une confirmation explicite du MJ, vérifie à nouveau la campagne/la provenance et crée **uniquement** le lien manquant. Il n'appelle ni `copyCreature`, ni `createScene`, ni une fonction de règles.
6. `abandonStudioRecovery({confirm:true})` permet de recommencer **uniquement si aucune nouvelle instance n'existe** dans la collection STUDIO inspectée, campagne identique. Si une instance non reconnue existe, ou si la campagne est différente, c'est une intervention manuelle bloquante, **pas** une duplication automatique.

Le contrôleur vérifie également l'identité de campagne **avant la sauvegarde du journal, immédiatement avant chaque création STUDIO et après son résultat** ; une bascule ne déclenche ni copie dans la mauvaise campagne ni liaison trompeuse. Les modifications concurrentes de brouillon pendant la prévisualisation sont refusées. Le journal empêche `saveDraft` modifiant les brouillons, `validateMJ`, restauration destructive et répétition de création tant qu'il subsiste. Les opérations de réconciliation/annulation/rechargement sont aussi interdites pendant une action STUDIO en vol. L'UI emploie uniquement le DOM texte (`textContent`), aucun HTML non fiable ou `style` inline.

**API ajoutée** sur `createCreatorCycle` : `getStudioRecovery() -> {pending,status,kind?,candidates:[{id}],canAbandon,message?}` ; `reconcileStudioLink(instanceId,{confirm:true})` ; `abandonStudioRecovery({confirm:true})`. Le composant `mountCreatorCycle` affiche les candidats et un choix MJ, jamais une reprise automatique.

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