# DG-LOT-004 / L004-A — BUILDER : prévisualisation locale réversible

**Statut :** prototype isolé ; aucun déploiement, aucune donnée réelle. **Produit source** PR [#85](https://github.com/Sijiel44/archives-alrick/pull/85) commit **`2ab809ef5351940e0fc272b859d10f21de894d00`** ; QA source PR [#91](https://github.com/Sijiel44/archives-alrick/pull/91) commit **`20679f7bf5c744f29dd041413cc63801ce5daea1`**. Ce dossier conserve le Studio DG-LOT-003 comme base. Il n'altère ni son code, ni Quartz, Pages, M01–M05, le canon ou les sauvegardes.

## Mini-contrat importable — STUDIO / INTÉGRATION

```js
import {
  getPreviewPlan, classifyPreviewUrl, NAVIGATION, securityDisclosure
} from './experiments/dg-lot004/builder/src/contract.mjs';
import {mountPreviewNavigation} from './experiments/dg-lot004/builder/src/navigation.mjs';
import {probeLocalPreview} from './experiments/dg-lot004/builder/src/probe.mjs';

const plan=getPreviewPlan(); // immuable ; origines exactes : MJ 4173 / joueur 4174
const nav=mountPreviewNavigation(document.querySelector('body > main')); // côté MJ uniquement
const outcome=await probeLocalPreview(); // huit contrôles HTTP réels en lecture seule
// nav.dispose() pour revenir à l'interface DG-LOT-003 inchangée
```

**Exports exacts** : `SOURCE_PRODUCT_SHA`, `SOURCE_QA_SHA`, `MJ_ORIGIN`, `PLAYER_ORIGIN`, `PREVIEW_SCHEMA`, `NAVIGATION` (7 étapes), `getPreviewPlan(options={})`, `classifyPreviewUrl(raw,{plan}={})`, `securityDisclosure()` ; `mountPreviewNavigation(root,{view,select}={})`; `probeLocalPreview({fetchImpl,plan,timeoutMs}={})`. Ne crée, ni ne copie, ni ne modifie une campagne ; ne projette aucun DTO, ne lit ni le stockage privé ni les textes de notes. **STUDIO garde la propriété de la vue et de la liste blanche** ; **INTÉGRATION seule peut monter ce guide dans son entrée produit**. Pas de changements dans leurs sous-arbres.

Le guide ne crée **pas** de nouvelles routes HTTP et ne suppose pas un routage SPA. Il déplace le focus vers des champs réellement présents, signale les étapes indisponibles et peut être retiré. Il n'active pas une règle numérique. Il ne doit jamais être monté sur l'origine joueur.

## Prévisualisation et navigation locales (clone COMPLET au SHA descendant)

Depuis la racine du clone Git complet, Node >=22 et `npm ci` déjà exécuté :

```sh
npm ci
npm test
node --test experiments/dg-lot004/builder/tests/ports.test.mjs
node experiments/dg-lot004/builder/src/launch-local.mjs --once
node experiments/dg-lot004/builder/src/launch-local.mjs
# MJ:     http://127.0.0.1:4173/
# joueur: http://127.0.0.1:4174/
# Ctrl-C ferme les deux écouteurs ; éviter de lancer plusieurs serveurs sur ces ports.
```

`--once` construit le produit existant avec son `tools/build.mjs`, démarre les **vrais** serveurs loopback du produit, sonde les huit routes en HTTP, puis arrête le serveur. `--no-build` utilise seulement un `dist/` déjà construit, après contrôle des fichiers. Un clone sans antécédent Git `2ab809ef…` est refusé. Toute variable `HOST`, `PORT`, `PREVIEW_HOST`, `PREVIEW_ORIGIN` est refusée ; **aucun tunnel, aucune adresse LAN, aucune URL publique**. Le lanceur ne relance jamais Quartz Pages et n'écrit pas dans la source ; le build temporaire `experiments/dg-lot003/dist` est régénéré par le script existant, donc sauvegarder tout `dist` local personnalisé avant de l'exécuter.

### Vérifier la navigation réelle et les supports

Après `node experiments/dg-lot003/tools/build.mjs` :

```sh
node experiments/dg-lot004/builder/src/browser-smoke.mjs
node experiments/dg-lot003/tools/test-browser.mjs
```

Le smoke de BUILDER démarre les deux origines locales, ouvre **Chrome officiel installé** avec profil temporaire, vérifie le cockpit sur **1280×800 ordinateur**, **768×1024 tablette** et **390×844 téléphone témoin**, puis crée une campagne fictive par les vrais champs et contrôle la présence des sept étapes (fiches, créature, scène, projection, créateurs, restauration). Il ouvre aussi la vraie page joueur isolée ; aucune donnée de campagne MJ ni stockage privé ne doit y apparaître. Aucune installation Chrome, `--no-sandbox`, `about:blank` de remplacement, ni ouverture vers un réseau public. Chrome absent ou impossible à lancer = **NON EXÉCUTÉ**, pas PASS. Les vérifications clavier, lecteur d'écran physique, partage Discord, vrais appareils et multi-navigateurs restent des travaux QA.

**Important :** `tools/test-browser.mjs` du produit démarre son **propre** serveur. Ne pas laisser `launch-local.mjs` en mode interactif ni `serve.mjs` actif pendant cette commande. Le smoke BUILDER ferme son serveur à la fin.

## Contrat de confidentialité

- Origines exactes : `http://127.0.0.1:4173` (MJ), `http://127.0.0.1:4174` (joueur). Aucune autre identité de domaine, port, protocole ou interface n'est autorisée.
- Les routes `player.html`, `player.js` ne sont pas des accès MJ ; `index.html`, `mj.js` et `manifest.json` sont refusés sur la fenêtre joueur. En-têtes de sécurité vérifiés : CSP, `no-store`, `nosniff`, `no-referrer` ; pas de redirection arbitraire.
- Le joueur reçoit exclusivement la DTO `cer.studio.player.whitelist.dg003.v0` créée par STUDIO via liste blanche et validée dans l'origine 4174. Le guide ne relaie pas le stockage, les objets campagne ni les messages `postMessage`.
- Un port lié à `127.0.0.1` n'est **pas** un contrôle de permission utilisateur : toute personne ayant accès au navigateur/profil de la machine MJ peut potentiellement lire le stockage. **Données synthétiques exclusivement**.
- Les modes absorption M03, autorités 25+, objets numériques et débits mana/charges restent indisponibles. Aucun XP ni récompense automatique du Lab n'est mis en œuvre.

## Retour arrière

1. Fermer le serveur par SIGINT/SIGTERM ; le profil Chrome temporaire du smoke est détruit en fin de recette.
2. Désinstaller un éventuel guide monté par `nav.dispose()`. La vue Studio antérieure est conservée.
3. Pour la campagne locale, n'importer que des **données fictives**. Restaurer depuis l'archive `CONFIDENTIELLE` par `previewRestore` puis confirmation contrôlée ; **ne pas effacer** IndexedDB/localStorage comme pseudo-rollback.
4. La branche prototype se supprime sans réécriture de PR #85/#91, `main`, Pages ou des sources existantes. Aucun merge/deploy dans L004-A.

## Propriétés / passations

**BUILDER** : seul propriétaire de `experiments/dg-lot004/builder/**` et du workflow isolé `.github/workflows/dg-lot004-builder-preview.yml`. **20 STUDIO** : vérifie sélecteurs, points de montage et transitions campagne/scènes, ne prend aucun port réseau supplémentaire. **05 INTÉGRATION** : raccorde de façon facultative `mountPreviewNavigation` à `index.html`/runtime sur sa branche distincte, conserve le service L003 existant sans l'élargir ; fournit SHA final + navigateur. **02 QA** : recette sur source finale, desktop/tablette et canaris. Passations préparées dans `docs/PASSATIONS_STUDIO_INTEGRATION.md`, pas envoyées automatiquement dans d'autres conversations.

Il n'existe **aucun hébergement Internet autorisé**. Une démonstration publique, même fictive, exige un mandat séparé de 00 DG/créateur et une nouvelle revue de confidentialité.
