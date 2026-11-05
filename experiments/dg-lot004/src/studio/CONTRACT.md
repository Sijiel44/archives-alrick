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
