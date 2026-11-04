# DG-LOT-003 — intégration locale réversible

Base code : `88f774f3d0d6d520d8d11443b72202b9caf4f94b`. Ordre DG : `b5c59854b802dc25617d9bcd7c576495199a41dd`. PR brouillon #85, sans modification Quartz/Pages.

## Depuis la racine d'un clone complet, Node 24

```sh
npm ci
npm test
node experiments/dg-lot003/tools/build.mjs
node experiments/dg-lot003/tools/serve.mjs
# Autres terminaux, une fois build et serve lancés :
node experiments/dg-lot003/tools/test-unit.mjs
node experiments/dg-lot003/tools/test-browser.mjs
```

MJ : `http://127.0.0.1:4173/`, joueur : `http://127.0.0.1:4174/`. Aucun accès `file://` requis ou autorisé. `CHROMIUM_PATH` peut désigner Chromium déjà installé ; le script marque l'absence du navigateur **NON EXÉCUTÉ** et échoue. Le navigateur est lancé sur la page servie, pas `about:blank`. Aucun résultat vert ne peut qualifier une suite QA manquante.

## Composition de services (05 INTÉGRATION)

`tools/compose.mjs` génère les entrées du bundle en distinguant **services** et **vues** :

- `ports`, `rules`, `catalog`, `storage` sont des services. Aucun `mount` exigé, ni tentative de les afficher comme composants UI.
- `studio`, `creators` et `player` sont des interfaces. Les futures vues doivent exporter `mount`, ou INTÉGRATION adaptera explicitement les signatures véritables dans **ses propres fichiers**.
- La compilation joueur n'importe **aucun module privé MJ ni STORAGE**. L'écran joueur reste inutilisable tant qu'un module spécialisé ne lui fournit pas une projection whitelist et que QA n'en a pas prouvé l'isolation.
- La page MJ crée `createPorts()` lorsque BUILDER est disponible, avec ses délégataires absents donc statuts `unavailable` authentiques, sans simuler de réponse `ready`.
- Il n'existe **aucun branchement natif MATH, ARCHIVES ou INDEX** tant que leurs interfaces effectives et versions qualifiées ne sont pas copiées. L'injection à venir doit fournir un adaptateur réel à `createPorts({documents,rules,catalog,characters,bestiary})` et les services STORAGE au Studio. Pas de données de secours fictivement « validées ».

Le BUILDER reçu est `prototype/dg003-ports-builder` à `5375014a30dc026a8cc58208cd0c9cabf02c86c2`. Ses sources et tests ont été copiés **inchangés** et leur provenance blob détaillée dans `manifest.json`. Exports : `createPorts`, `createDocumentReader`, `createRulesGateway`, `createCatalogResolver`, `createCharacterImport`, `createBestiaryAdapter`. Les méthodes `read`, `preview`, `resolve`, `preview(bytes)`, `readProfile` et `makeInstance` renvoient des `PortResult`. Un statut `ready` n'autorise jamais une transaction.

STORAGE : le ZIP local communiqué a été vérifié et testé **par la session d'orchestration**, mais aucun commit source ARCHIVES n'était encore accessible au moment du contrôle de cette livraison ; son code **n'est pas intégré**. Son `sheet` historique doit rester snapshot brut immuable ; état de séance séparé. MATH : SHA provisoire **rejeté pour l'intégration** (cas de validation invalides), en attente de correctif. STUDIO, CREATORS, CATALOG : pas reçus.

## Règle de provenance et de recette

Toute copie propriétaire nécessite branche + commit source + blob SHA vérifié + chemins. `manifest.components` recense les modules dont l'entrée a été effectivement intégrée ; `sourceFiles` conserve la provenance de chaque fichier copié. Pas de merge de PR. `build.mjs` peut réussir sur une ossature incomplète, mais affiche `INCOMPLET`; `test-unit.mjs` doit échouer si un domaine manque. Les tests unitaires et Chromium de la livraison finale doivent être exécutés sur **le HEAD final** et non sur le SHA de la base, et QA doit fournir un avis indépendant.

**Interdits :** aucune formule parallèle M01–M05, aucun objet numérique ni Autorité 25+, aucun débit mana/charge, aucune projection MJ complète envoyée au joueur, aucune migration utilisateur ou publication Pages.
