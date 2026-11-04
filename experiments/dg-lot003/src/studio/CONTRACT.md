# L003-COCKPIT — contrat exécutable temporaire

**Propriétaire :** STUDIO uniquement. **Base officielle :** `88f774f3d0d6d520d8d11443b72202b9caf4f94b`. **Autorité :** PR #84 (`b5c59854b802dc25617d9bcd7c576495199a41dd`). **Non canonique, non publié.**

## Entrées et exports

- `src/studio/index.mjs` : `mountStudio(root, options)` sans effet à l'importation. Retourne `{getCampaign, getPublicProjection, createCampaign, previewCharacter, acceptCharacter, previewCreature, copyCreature, createScene, setActiveScene, updateScene, exportPrivate, previewRestoration, acceptRestoration, openPlayer, sendProjection, exportPublic, previewNative, selectPublic, render, dispose, canProject, isPlayerReady}`.
- `src/studio/projection.mjs` : `makePlayerProjection`, `validatePlayerDTO`, `checkedPlayerOrigins` et constantes de protocole. Construction par liste blanche dans un objet neuf et validation strictement symétrique côté joueur.
- `src/player/index.mjs` : `mountPlayer(root,options)` sans effet à l'importation, retour `{dispose,getProjection,isAuthorized}`. Aucun stockage du côté joueur.
- Imports ES `.mjs` natifs : intégrateur libre de regrouper avec son esbuild, sans réécrire le contrat ni ajouter de dépendance. Page HTML, serveur et build sont **propriété INTÉGRATION**, pas STUDIO.

## Options du Studio

| Port / option | Signature attendue | État de l'absence |
|---|---|---|
| `window` | objet Window du navigateur, injecté facultativement | `root.ownerDocument.defaultView` |
| `storage.load()` | `Promise<Campaign|null>` ; seul ARCHIVES tranche les formats et vérifie l'enveloppe | Bouton recharger absent |
| `storage.save(campaign)` | `Promise<void>` ; écriture atomique/validation par ARCHIVES | Avertissement stockage indisponible |
| `storage.previewRestore({bytes:Uint8Array})` | `Promise<{display:{title:string}, opaque...}>` sans mutation | Refus explicite |
| `storage.restore(preview,{previous})` | `Promise<Campaign>` ; refuse collisions | Refus explicite |
| `storage.exportPrivate(campaign)` | `Promise<Uint8Array|Blob|string>` ; classer `CONFIDENTIEL` | Bouton export privé désactivé |
| `characterImport.preview({bytes,fileName})` | `Promise<{schemaVersion:'v2'|'v3',display:{name,level}, opaque...}>` sans écriture ; octets + SHA privés dans adaptateur | Refus explicite |
| `characterImport.accept(preview,{existingIds})` | `Promise<{id,...snapshot}>` ; non destructif | Refus explicite |
| `catalog.resolveCreature(code)` | `Promise<{documentId,profileId,ruleset,name,level?,...}>` ; identités distinctes | Refus explicite |
| `bestiary.copyCreature(source,{existingIds})` | `Promise<{id,...snapshot}>`; nouvel ID unique ; source inchangée | Refus explicite |
| `rules.previewM03({campaignId,sceneId,commit:false})` | `Promise<{label?}>` ; `rules.nativeValidated===true` obligatoire | Bouton désactivé ; aucun calcul de secours |
| `playerOrigin` / `studioOrigin` | uniquement `http://127.0.0.1:4174` et `http://127.0.0.1:4173` | Projection **désactivée** |
| `playerPath` | par défaut `/player.html` ; URL finale forcée sur origine 4174 | Refus si hors origine |
| `openWindow(url)` | injection optionnelle du geste ouvrant la fenêtre | `window.open` par clic utilisateur |

`mountPlayer` accepte `window`, `studioOrigin`, `playerOrigin`. Son propre origin doit être 4174, son opener doit exister, et un canal aléatoire est lu dans l'URL. `message.source === window.opener` et `message.origin === 4173` sont exigés. Le Studio n'accepte READY que depuis `message.source === playerWindow`, `message.origin === 4174` et un canal concordant. Toutes les réponses publiques utilisent `postMessage(..., 'http://127.0.0.1:4174')`, jamais `'*'`.

## Frontière de données

Campaign provisoire : `{schema:'cer.studio.dg003.provisional.v0', id, title, revision, characters, creatures, scenes, activeSceneId, extensions}`. Chaque personnage/créature contient `id`, `publicLabel` et `privateSnapshot` ; le profil de créature conserve séparément `source.documentId`, `source.profileId`, `source.ruleset`. Une scène contient `id`, `title`, `publicDescription`, `privateNotes`, `participantIds`. Aucune écriture dans la bibliothèque ou les fiches historiques.

DTO joueur : `{schema:'cer.studio.player.whitelist.dg003.v0', revision, scene:{title,description,visibleActors:[{label}]}}` ; aucune carte complète, aucun identifiant documentaire/profil/instance, aucun champ libre hérité, aucun secret MJ, aucun historique. Champs titre, description et acteurs non inclus sans sélection explicite. Toute nouvelle sélection commence vide au changement de scène et déclenche un CLEAR du joueur déjà connecté.

**IMPORTANT :** l'isolation d'origine évite l'accès direct à la campagne MJ depuis la page joueur, mais la possession du profil/navigateur ou de l'ordinateur MJ reste un risque hors périmètre. L'origine 4173 ne doit jamais exposer publiquement les exports CONFIDENTIELS. Le texte déclaré public est sous la responsabilité du MJ ; une liste blanche ne détecte pas à elle seule un secret que le MJ aurait saisi volontairement dans un champ public.

## Invariants et intégration

- Aucun calcul de règle 5d6 dans STUDIO. Les opérations numériques non homologuées et tout débit de ressource sont désactivés.
- Pas d'effet automatique, aucune projection prévisualisée ne consomme de ressources.
- `previewCharacter` et `previewRestoration` ne changent pas l'état ; l'acceptation passe par le port propriétaire.
- L'intégrateur doit câbler les vrais ports BUILDER/ARCHIVES/INDEX/BEST et les routes de serveur avec les **mêmes signatures documentées**, ou fournir un adaptateur dans son sous-arbre.
- Les faux ports de `tests/studio/harness-studio.mjs` ne doivent pas être utilisés comme implémentation ARCHIVES de production.

## Commandes du périmètre STUDIO

`node --test experiments/dg-lot003/tests/studio/*.test.mjs`

`python experiments/dg-lot003/tests/studio/browser-runner.py` (facultatif, si Python Playwright et Chromium sont autorisés ; sert deux vraies pages locales, ne garantit pas l'intégration). Les tests UI de ce sous-arbre ne remplacent jamais la recette QA sur le HEAD intégration.
