# DG-LOT-003 / QA — recette v6 sur véritables pages

Source lue (PR #85, candidat **non gelé**) : `2ab809ef5351940e0fc272b859d10f21de894d00`.
Blobs relus : `src/studio/index.mjs`, `src/player/index.mjs`, `tools/runtime.mjs`, `tools/adapters.mjs`, `src/creators/index.mjs`, `index.html`.

## Exécution après livraison du HEAD final de 05 INTÉGRATION

Dans le clone complet, sur la branche QA dérivée du HEAD **final** d'intégration (et non du candidat 92f401a), copier uniquement ce sous-arbre `experiments/dg-lot003/tests/e2e/`.

Terminal 1 :

```sh
npm ci
node experiments/dg-lot003/tools/build.mjs
node experiments/dg-lot003/tools/serve.mjs
```

Terminal 2 :

```sh
export DG003_INTEGRATION_HEAD=<SHA_40_HEXA_HEAD_FINAL_INTEGRATION>
export DG003_TESTED_HEAD=$(git rev-parse HEAD)  # fourni explicitement par le workflow sur le checkout réel
export CHROMIUM_PATH=/usr/bin/chromium  # ou chemin réel, facultatif si détecté
export DG003_QA_EVIDENCE_PATH=/tmp/dg003-qa-evidence.json
node experiments/dg-lot003/tests/e2e/qa-http-preflight.mjs
node --test experiments/dg-lot003/tests/e2e/dg003-e2e.test.mjs
```

Pour la CI QA, fournir `DG003_INTEGRATION_HEAD` comme variable d'environnement. `DG003_TESTED_HEAD` doit correspondre exactement à `git rev-parse HEAD`. En événement `pull_request`, `GITHUB_SHA` peut être le commit de fusion virtuel : il est journalisé séparément, jamais imposé égal à `testedHead`. La preuve de sortie écrit `sourceIntegrationHead`, `testedHead` et `GITHUB_RUN_ID` (si présent) **à l'exécution**. Aucun `testedHead` ni lien de la propre CI n'est codé dans le JSON committé : pas d'auto-référence impossible. Historique Git local requis pour `merge-base --is-ancestor`.

## Origines, sécurité et contrôles

- `127.0.0.1:4173` MJ, `127.0.0.1:4174` joueur ; un précontrôle HTTP refuse les pages absentes.
- Le navigateur ouvre **réellement** la popup par le bouton Studio « Ouvrir la fenêtre joueur » (clic utilisateur CDP) ; elle doit posséder l'opener vérifié. Aucune création directe de cible joueur ni faux handshake.
- Le scénario L003-05 attend « Fenêtre joueur connectée », un titre et une description sélectionnés visibles sur `#player-root`, et un export public réel ; **seulement après** inspecte DOM, messages, stockage, logs, demandes réseau et export pour canaris.
- Les fixtures v2 et v3 ont une enveloppe `alrick.sheets.v2/v3`, `sheets[]`, score 14 et extensions inconnues. Le format ARCHIVES est examiné sous `project.characters[].source.base64`, `source.sha256`, `source.sheetIds`, `sourceId`, `sheet` et `id`. La même source brute peut légitimement correspondre à plusieurs caractères si un futur parcours accepte multi-sheet ; le candidat actuel **refuse explicitement** l'UI multi-sheet et le test contrôle non-perte/non-mutation.
- L003-08 lit `#native-preview-input` et `#native-preview-result`, compare `JSON.parse(input).combat` au **résolveur natif** `resolveCombatM03`, puis compare à `JSON.parse(output).result`. Le wrapper `status/engine/applied` est contrôlé à part. Aucun accès caché à `window` n'est demandé.
- Les familles non homologuées sont vérifiées par le texte de restriction **et** les contrôles effectivement `disabled` des créateurs, sans inventer de boutons d'activation.

## Portée et statuts

Les 10 scénarios sont des tests produits, non des tests isolés de composants. Ils échouent si leur précondition ou leur action réelle n'est pas satisfaite. Aucune substitution par `about:blank`, DOM simulé, appel du composant interne, ou modèle Python. L'absence de Chromium, d'une origine ou d'un HEAD Git fait échouer explicitement les essais. Les 161 tests composants communiqués par DG ne sont pas des tests QA. Appareil/tablette physique et parties humaines restent hors de cette suite.

Les données sont strictement fictives. L'exécution navigateur sur HEAD final et la CI restent **NON EXÉCUTÉES par QA à la date du présent paquet**.

## Contrat réel non autoréférent

`integration-contract.json` contient les sélecteurs, libellés, origines et interfaces lus au candidat source `2ab809ef5351940e0fc272b859d10f21de894d00`. Il ne contient ni SHA du futur commit QA, ni URL de sa propre CI. Le script refuse un fichier absent ou divergent. Le HEAD intégré figé (`DG003_INTEGRATION_HEAD`) et le HEAD effectivement testé (`DG003_TESTED_HEAD`) sont des variables obligatoires, vérifiées par `git merge-base --is-ancestor` et `git rev-parse HEAD`. `GITHUB_SHA`, `GITHUB_EVENT_NAME` et `GITHUB_RUN_ID` sont des métadonnées de l'événement, enregistrées dans les preuves de sortie.

**Entrée unique CI :** `experiments/dg-lot003/tests/e2e/dg003-e2e.test.mjs`. L'ancien `dg003-real-ui.test.mjs` et les anciens scripts v4 ne sont pas inclus dans ce paquet. Ne lancer aucune recette avant HEAD figé et serveurs prêts.

## Addendum QA v7 — régressions REVUE avant le HEAD gelé

**L003-02 :** création et persistance effective des scènes A et B ; affichage public de B par la vraie popup MJ ; sélection de A par le vrai `select[aria-label="Scène active"]` ; preuve de `PLAYER_CLEAR` reçu par le joueur, des cases de partage remises à zéro, du stockage local ARCHIVES actualisé vers l'ID A, du maintien de A après rechargement, et de l'absence de nouvelle publication automatique. Les messages sont observés par instrumentation CDP au démarrage du navigateur, sans injection de handshake.

**L003-06 :** le navigateur crée une campagne UI réelle et exporte une archive privée. Le test lit cet export, enrichit *à l'exécution* la campagne de l'extension inconnue `qaUnknownLargeExtension.payload` de **6 Mio** fictifs, puis demande au **vrai module ARCHIVES** `experiments/dg-lot003/src/storage/storage.mjs` de produire `exportPrivate(project)` : SHA256, octets et taille sont contrôlés avant un upload dans l'UI. Prévisualisation, confirmation, export privé, reload, rechargement, et deuxième export sont comparés **octet pour octet et par SHA256** à l'export ARCHIVES d'origine. Une restauration invalide suivante ne doit pas modifier le document restauré. En cas de refus UI >5 Mio, de quota navigateur ou d'échec de sauvegarde, le test vérifie que les anciens octets exportés et le stockage local restent inchangés puis **échoue P1** ; aucun faux PASS par seule apparition du bouton « accepté ». Ne jamais committer ce gros document temporaire ni les exports : ils sont créés dans le répertoire de téléchargement éphémère du navigateur, supprimé par le pilote en sortie.

Le paquet ne modifie ni les fichiers de 05 INTÉGRATION ni les sources STUDIO/ARCHIVES. Aucun résultat Chromium réel n'est revendiqué avant HEAD figé, variables `DG003_INTEGRATION_HEAD` et `DG003_TESTED_HEAD` et serveurs 4173/4174.