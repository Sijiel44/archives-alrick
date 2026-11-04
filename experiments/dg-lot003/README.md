# DG-LOT-003 — Studio intégré local, candidat QA

**PR brouillon :** https://github.com/Sijiel44/archives-alrick/pull/85  
**Base :** `88f774f3d0d6d520d8d11443b72202b9caf4f94b`  
**Ordre DG :** `b5c59854b802dc25617d9bcd7c576495199a41dd`  
**Périmètre :** `experiments/dg-lot003/`, sans modification du site Quartz, Pages, canon ni formules M01–M05. Données fictives seulement.

## Exécution depuis la racine du dépôt (Node 24)

```sh
npm ci
npm test
node experiments/dg-lot003/tools/build.mjs
node experiments/dg-lot003/tools/test-unit.mjs
node experiments/dg-lot003/tools/serve.mjs
# dans un autre terminal, pendant que serve.mjs tourne :
node experiments/dg-lot003/tools/test-browser.mjs
```

Le test navigateur démarre son **propre** serveur HTTP : ne pas garder `serve.mjs` actif sur les ports 4173/4174 pendant `test-browser.mjs`. Lancer les deux commandes séparément : `serve.mjs` pour inspection manuelle, puis l'arrêter, et `test-browser.mjs` pour la recette automatisée. Si Chromium n'est pas dans le PATH, préciser `CHROMIUM_PATH`. Absence ou refus du navigateur = **NON EXÉCUTÉ**, jamais succès.

Origines : MJ `http://127.0.0.1:4173/` et joueur `http://127.0.0.1:4174/`. Ne jamais tester avec `file://` ni remplacer la recette HTTP par `about:blank`.

## Assemblage réel

- `tools/compose.mjs` / `tools/runtime.mjs` : injection de services typés BUILDER, MATH corrigé, INDEX, ARCHIVES et génération de profil fictif par le Bestiaire M04 natif ; `mountStudio` et `mountCreators` montés comme **vues**, jamais `mount` sur les ports.
- `tools/runtime-player.mjs` : entrée joueur séparée, sans imports du stockage, du catalogue, ni de l'état MJ ; DTO à liste blanche et double contrôle d'origine par les modules STUDIO.
- `tools/adapters.mjs` : conversion bidirectionnelle STUDIO (`title`, `privateSnapshot`) ↔ ARCHIVES (`name`, `source`, `sheet`), préservation des sources et octets SHA256 par le module ARCHIVES officiel du lot ; propriété inconnue et métadonnées conservées dans l'enveloppe privée.
- `createValidatedStorage` : `exportPrivate` → `previewRestore` → `commitRestore` avant écriture ; et `previewRestore` / `commitRestore` avant lecture. `localStorage` côté MJ uniquement, clé `cer.dg003.private.campaign.v0`. Ce stockage n'est **pas chiffré** ; données fictives exclusivement. Ne jamais utiliser dans une machine partagée pour des secrets véritables.
- CREATORS `injectStyles:false` et `CREATOR_STYLES` extrait en `assets/creators.css`, servi avec `style-src 'self'`. Aucun `unsafe-inline` global.
- Les créations sont descriptives ; le catalogue INDEX accepte provenance structurée et restrictions, tandis que `extensions.creatorDrafts[].original` conserve la totalité du brouillon (champs facultatifs inclus) dans la **sauvegarde MJ privée**. Versions créateur hors semver refusées explicitement, pas de conversion silencieuse.
- Les fonctionnalités non homologuées (absorption, objet numérique, charges, mana, Autorités 25+) restent indisponibles. Aucune autorisation `approved:true` n'est forgée, aucun débit.
- Une enveloppe PJ contenant plusieurs `sheets` est **refusée avant commit** tant qu'une sélection explicite n'existe pas. Ne jamais en ignorer silencieusement une.
- Après sauvegarde d'une création, le catalogue persistant est réconcilié avec un état STUDIO éventuellement ancien ; l'export confidentiel lit cette persistance **immédiatement**. Une restauration depuis une ancienne archive doit remplacer exactement l'état, sans réintroduire les créations ultérieures ; l'absence des clés `catalog` et `creatorDrafts` reste une absence, pas des listes vides ajoutées.

## Sources et provenance

`manifest.json` contient les références par rôle et 45 chemins de provenance (Git blob, branche, commit source ou transport). BUILDER `5375014a…`, MATH corrigé `ae11f209…`, INDEX `ec5c8ecc…`, STUDIO `1cdbb664…`, ATELIERS corrigé `48e0a6fa…`, ARCHIVES transport `2459876b…`. Pour ARCHIVES, l'auteur reste ARCHIVES, le commit est **un transport depuis le ZIP original**, et `originalSourceCommit:null` ; la provenance ZIP SHA256 est conservée. Aucune PR propriétaire fusionnée.

## Tests et qualification

`tools/test-unit.mjs` exécute les six familles de tests propriétaires (les tests joueur appartiennent à STUDIO), puis `tools/adapters.test.mjs` et `tools/runtime.test.mjs`. Ces tests utilisent les **vrais** modules ARCHIVES et INDEX ; les tests runtime chargent `runtime.mjs` par esbuild. Toute erreur fait échouer le script.

**Dernier résultat externe communiqué sur un SHA antérieur :** build 7 modules réussi ; test-unit 160/161, un échec lié à l'ajout de clés absentes lors de l'export d'une ancienne sauvegarde. Correction apportée ensuite dans `mergePersistentCatalog`, **non encore retestée sur le HEAD candidat**. Le `npm test` du dépôt ne vaut que pour le SHA où il a été exécuté.

`tools/test-browser.mjs` lance Chromium et vérifie de vraies pages servies et leurs deux origines ; le test doit lui-même être contrôlé et exécuté dans l'environnement autorisé. **Aucune preuve navigateur finale ni avis QA indépendant n'est revendiqué ici.**

La CI `.github/workflows/dg-lot003-integrated.yml` est indépendante et ne contient aucun déploiement Pages. La sortie doit être attestée sur **le HEAD final** de la PR. Si les tests ou la recette sont non exécutés/échouent, la livraison reste **prototype partiel — non qualifié**. Aucun merge/publication sans décision séparée DG/créateur.
