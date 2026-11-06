# L004-A / 20 STUDIO — Contrat de mode démonstration (proposition exécutable)

Base figée **PR #85 SHA `2ab809ef5351940e0fc272b859d10f21de894d00`**, propriété unique de `experiments/dg-lot004/src/studio/` et `tests/studio/`. Aucune modification de la composition DG003 ou du site Quartz.

## Exports sans effet à l'importation

- `demo.mjs`: `mountStudioDemo(root,{window?,storageFactory(area),createDemoAdapters({getCampaign,storage}),playerPath?,openWindow?,creatureCode?,injectCreatorStyles?})`.
- `demo-storage.mjs`: `createDemoStorageArea(area)`, `isolateDemoAdapter(nativeStorage,scopedArea,{cryptoAPI})`, `fictionalCharacterBytes()`, constantes `DEMO_NAMESPACE`, `DEMO_MARKER`.
- `scene-bridge.mjs`: `previewDescriptiveSceneLink({objectDraft,capabilityDraft,creature,scene})` et `SCENE_BRIDGE_SCHEMA`. Aucune mutation/persistance du raccord L004-C avant contrat INDEX / ATELIERS.
- `demo.css`: CSS séparé, auto-hébergé pour les interactions tactiles, petit écran et focus visible, sans style inline ni nouvelle dépendance.

## Obligations de câblage pour 05 INTÉGRATION

1. Ne PAS passer la fabrique L003 `mountIntegratedMJ` comme adaptateur d'import : ses callbacks sont liés à la campagne MJ active. Construire des services **nouveaux** à partir du getter fourni dans `createDemoAdapters`, afin d'utiliser le Studio fictif courant, pas le Studio réel.
2. Injecter `storageFactory(scopedArea) = createValidatedStorage(owners.storage, scopedArea, {indexedDB:null})`. Le mode fictif utilise la clé physique `cer.dg004.demo.only.v0.cer.dg003.private.campaign.v0`. Pour le démonstrateur limité aux petites fixtures, l'absence d'IndexedDB assure qu'aucun magasin historique privé n'est ouvert. Sauvegarde et export passent par le module ARCHIVES officiel, sans algorithme parallèle.
3. `createDemoAdapters({getCampaign,storage}) -> {characterImport:{preview({bytes,fileName}),accept(preview,{existingIds})},catalog:{resolveCreature(code)},bestiary:{copyCreature(source,{existingIds})},rules?:{nativeValidated,previewM03},creatorSave?:(record,snapshot,storage)=>Promise<{saved:true}>}`. Construire les adaptateurs sur le *getter* de la campagne fictive, d'après `tools/runtime.mjs` L003 (fonctions de `owners.storage` et ports), en préservant `archiveToStudio/studioToArchive` et les empreintes. Créateurs : valider avec INDEX, sauvegarder localement par `storage.appendCatalog`, ne jamais activer effet/debit numérique.
4. Dans l'entrée HTML/JS du lot L004 dont 05 est propriétaire, monter sous `#dg004-demo-root`, sur la **seule origine MJ** `http://127.0.0.1:4173/dg004-demo.html`. Ne jamais charger les modules STUDIO/MJ sur `http://127.0.0.1:4174` ; cette origine sert `player.html` et `mountPlayer` L003 exclusivement. Ajouter `demo.css` comme ressource locale `style-src 'self'`; servir le CSS via des outils/HTML INTÉGRATION, pas un style inline.
5. Les ports de demo doivent être distincts des ports MJ réels. La méthode `storageFactory` reçoit l'aire déjà scindée, et il est **interdit** d'y substituer `window.localStorage` directement. Le nom de clé fictive est une séparation logique, pas du chiffrement ou une frontière de sécurité contre le détenteur du navigateur.
6. `getDemoCampaign()` ne renvoie qu'une copie, `fixtureBytes` est une copie. Pas de session Internet, aucune formule M01–M05 nouvelle, aucune dépense de ressources, pas de publication automatique.

## Garantie de restauration

L004 ne réimplémente ni `previewRestore`, ni le parseur, ni la vérification SHA : les octets d'export et l'intégrité sont gérés par l'adaptateur natif ARCHIVES injecté. Le wrapper mémorise uniquement le SHA256 des **exports générés en mode démonstration** dans une clé préfixée (max 24) : une archive étrangère est refusée avant preview native ; après succès, la campagne restaurée doit porter la marque fictive. Aucune archive non fictive n'est autorisée en entrée de ce mode. Une sauvegarde de plus de 4 Mio ne dispose pas ici d'IndexedDB : faute de support approprié elle échouera en sécurité, sans fallback caché ; 05 doit tester ce cas.

## UX, confidentialité et L004-C

- La vue propose des boutons ordonnés à actions **explicites** (campagne, aperçu PJ, acceptation, référence puis copie créature, création de scène avec sentinelle MJ privée), puis les trois créateurs descriptifs natifs. Partage et export utilisent les actions existantes du Studio L003, et l'opérateur coche les seuls champs autorisés.
- L004-C : après avoir enregistré au moins **un objet** et **une capacité** descriptifs, le MJ peut préparer un lien privé `{visibility:'mj-private',status:'preview-only'}` rattaché à une instance de créature et une scène. Aucun lien n'est ajouté à la campagne/au DTO ni inclus dans l'archive : **prévisualisation uniquement**, décision INDEX/ATELIERS attendue.
- Une création avec champ numérique/action/cout est rejetée par le gabarit L004-C. Les créateurs L003 conservent eux-mêmes les restrictions natives des effets chiffrés, sans pouvoir nouveau de L004.
- La projection joueur utilise uniquement le DTO whitelist et l'échange READY/SHOW/CLEAR de `src/studio`/`src/player` L003. Aucune fenêtre même origine acceptée, aucun service MJ importé côté joueur. La création/changement de scène révoque toute sélection et efface le contenu déjà projeté.
- Champs accessibles avec étiquettes, statuts `aria-live`, listes ordonnées, boutons tactiles 44px et CSS responsive ; pas d'inline style, script ou stockage côté joueur.

## Recette à 05 et 02 QA (SHA final intégré)

Lancer `node --test experiments/dg-lot004/tests/studio/*.test.mjs`. Puis `python experiments/dg-lot004/tests/studio/browser-scenario.py` après `build/serve` de 05 et présence de `dg004-demo.html` à 4173 et de `player.html` à 4174. Le script exige les vraies pages et les vrais adaptateurs ; il vérifie l'import, le flux, la popup, les canaris, CLEAR, stockage joueur et export/reimport. **Ne pas attribuer PASS** si Chromium est bloqué ou absent : noter `NON EXÉCUTÉ` et joindre la trace.

`mountStudioDemo()` reste distinct de `mountStudio()` L003 : il ne déploie pas de nouveau site et n'ouvre pas de réseau en dehors des deux origines local-only autorisées par DG.

## Addendum L004-REPAIR — réconciliation après écriture partielle (05/11/2026)

- Nouveau module **sans effet à l'import** : `src/studio/reconcile.mjs` :
  - `inspectDemoFootprints(campaign,{persistedCampaign,sourceId?,profileId?,sceneTitle?,sceneDescription?,privateNote?})` : identifiants seulement, aucun snapshot ni note retourné ; statuts `missing`, `unpersisted`, `reusable`, `stale`, `ambiguous`, `conflict`, `needs-participants`.
  - `inspectCreatorAttachment({campaign,persistedCampaign,cycle})` : **lecture seule** de deux états distincts STUDIO/CREATORS. Les liens `creatureInstanceId` et `sceneId` ne doivent être écrits que par le propriétaire 21 après confirmation du MJ et validation de persistance par 04. Aucun `copyCreature()` / `createScene()` dans cette fonction.
  - `inspectCreatorRecord(campaign,record)`, `persistentCreatorRecords(campaign)` : provenance depuis `extensions.creatorDrafts[].original` de L003, rejet des identités descriptives ambiguës.
  - `saveCreatorWithReconciliation({record,storage,creatorSave,studioSnapshot})` : lit avant et après l'écriture, considère un accusé perdu comme réussite **uniquement si la version exacte existe durablement**. Ne retente aucune création et n'efface aucun objet STUDIO.
- `mountStudioDemo(root,options)` conserve toutes ses options et ajoute `mountCreatorsPort?(root,{onSave,...})` (**injection de banc uniquement** ; la production garde `mountCreators` L003 réel) et `creatureProfileId?` (défaut `fixture-profile-001`, utilisé avec `creatureCode?` pour la réconciliation). Le handle expose désormais `reconcileDrafts():Promise<records>` et `inspectFootprints():Promise<status>` ; `getDrafts()` reste lecture de la dernière copie réconciliée.
- Les boutons fictifs « Accepter copie créature » et « Créer scène... » réutilisent une instance/scène unique et identique, sans générer de nouvel identifiant. Ambiguïté, titre identique mais contenu privé modifié, ou divergence persistée : **refus fermé** et arbitrage MJ ; aucune suppression ni rollback automatique. Une scène incomplète de ses participants réemploie son ID et complète l'association explicitement dans l'étape guidée.
- **Critère de persistance :** `storageFactory` doit fournir les méthodes L003/ARCHIVES existantes et sérialiser les écritures. La vue tente jusqu'à cinq réconciliations bornées du même snapshot ; elle refuse un état plus récent ou un état non vérifié, sans prétendre fournir de transaction entre deux magasins. `createScene()`/`updateScene()` L003 ont des sauvegardes différées ; 05/04 doivent tester leur drain réel et le dernier SHA. Une erreur de `storage.save` n'autorise jamais un nouveau `copyCreature`.
- Sélection joueur : la reprise/sélection de scène utilise `setActiveScene` pour `PLAYER_CLEAR` et interdit une publication `PLAYER_SHOW` automatique. La reprise d'une créature avec scène active révoque également la sélection, même si l'instance est déjà présente. `makePlayerProjection` de L003 reste seul générateur de DTO whitelist.
- UX ardoise/cuivre/or : **fichier seulement proposé**, `src/studio/ux-ardoise-cuivre-or.proposal.css`. Ne pas charger ni appliquer dans le candidat P0 sans revue 01 BUILDER + 21 ATELIERS + QA. Aucun changement de style ou source du candidat intégré PR #95.

**Gates propriétaires :** `node --test experiments/dg-lot004/tests/studio/*.test.mjs` (L004), `node --test experiments/dg-lot003/tests/studio/*.test.mjs` (régression). Le scénario `tests/studio/L004_REPAIR_BROWSER_SCENARIO.py` exige la vraie page intégrée servie sur 4173 et joueur sur 4174 ; il n'est pas une preuve navigateur tant qu'il n'est pas réellement exécuté. Les tests sur `createCreatorCycle.attachCreature/attachScene` réels appartiennent au 21 ; seul ce propriétaire peut effectuer le commit/rollback de son état. 

## L004-REPAIR — raccord `pendingStudioOp` (PR #100 @ ecce2ada)

**Changement de contrat STUDIO** : `inspectCreatorAttachment` (module `reconcile.mjs`)
exige désormais le journal **durablement présent** dans `persistedCycle`, lu depuis le
stockage privé ATELIERS/ARCHIVES, ainsi qu'une `persistedCampaign` validée et relue
**indépendamment** de la campagne volatile STUDIO. Une ancienne restauration dont
le journal manque n'est **pas attestable** : `action:'block-automatic-retry'` et
`status:'unattestable'`, même si le titre/source de l'instance ressemble à la fixture.

```js
import {inspectCreatorAttachment,confirmCreatorAttachmentWithEvidence} from './reconcile.mjs';
const creatorState=creator.getState();
const [persistedCycle,persistedCampaign]=await Promise.all([
  creatorPersistence.load(), studioStorage.load(),
]);
const candidate=inspectCreatorAttachment({
  cycle:creatorState,persistedCycle,
  campaign:studio.getCampaign(),persistedCampaign,
});
// Le port 05 affiche uniquement IDs/statuts ; les notes privées ne sont jamais retournées.
// Le MJ doit sélectionner le seul ID attesté ET confirmer explicitement.
if(candidate.action==='link-existing-after-MJ-confirmation' && userConfirmed === true){
  const kind=creatorState.extensions.pendingStudioOp.kind;
  const id=(kind==='creature'?candidate.creature:candidate.scene).id;
  await confirmCreatorAttachmentWithEvidence({creator,studio,creatorPersistence,
    studioStorage,instanceId:id,confirm:true});
}
```

`pendingStudioOp` : `{kind:'creature'|'scene',campaignId,beforeIds,
source?:{documentId,profileId,ruleset}}`. `beforeIds` désigne les IDs présents AVANT
la tentative. Il est créé par ATELIERS **avant** l'appel STUDIO ; STUDIO ne le
crée pas et ne le supprime pas. Il est supprimé par ATELIERS dans la même écriture
confirmée que son lien. La campagne STUDIO doit déjà avoir été sauvegardée par le
vrai adaptateur ARCHIVES (sa vérification de SHA et d'enveloppe reste son autorité).

Signification des résultats :

- `reusable` : **un seul nouvel ID**, absent de `beforeIds`, correspondant à la
  provenance/description du journal, trouvé dans les deux états STUDIO et dont
  la session créateur possède le **même journal durable** ; autorise uniquement
  une **proposition de rattachement manuel**, jamais un appel `copyCreature` ou
  `createScene` automatique.
- `missing` : journal présent, mais aucune nouvelle instance visible. Le protocole
  ATELIERS `abandonStudioRecovery({confirm:true})` demeure distinct et ne doit
  être proposé qu'après inspection de l'absence d'effet et nouvelle confirmation.
- `unpersisted` : une instance volatile existe, mais le stockage ARCHIVES ne la
  retrouve pas. **Aucune confirmation du lien**, aucune nouvelle copie, vérifier
  l'état et la file d'écritures.
- `ambiguous`, `conflict`, `stale`, `wrong-campaign`, `invalid-journal`,
  `unattestable`, `needs-participants` : blocage, revue humaine et conservation
  des sauvegardes originales. `not-targeted` qualifie l'autre famille non en cours.

`confirmCreatorAttachmentWithEvidence({...}) -> Promise<{kind,instanceId,
status:'linked',reconciled:true,executable:false}>` vérifie encore les deux
magasins, le résultat de `creator.getStudioRecovery()`, une seule candidature,
le consentement MJ explicite, puis délègue UNIQUEMENT à
`creator.reconcileStudioLink(id,{confirm:true})`. Une relecture du cycle
persisté confirme le **même ID**, sans journal restant. Aucune compensation,
suppression, transaction de ressources, publication ou `postMessage`.

**Limite structurelle non levée :** le journal ATELIERS actuel n'inscrit pas de
`operationId` unique dans l'instance STUDIO ; `beforeIds`+provenance ne permettent
pas de certifier une opération au travers de restaurations concurrentes ou de
lignes temporelles divergentes avec le même `campaignId`. En cas de doute, ne
pas valider le P0 et conserver les originaux ; 04/21/05 doivent convenir d'un
marqueur transactionnel durable ou bloquer ces restaurations. Le navigateur réel,
la couche ARCHIVES et la CI au HEAD composite restent à recetter par 05/QA.

Ce contrat est indépendant de l'UX ardoise/cuivre/or (toujours proposition non montée).
