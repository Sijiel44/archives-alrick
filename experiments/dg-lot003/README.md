# DG-LOT-003 — Studio local d'intégration

**Base figée :** `88f774f3d0d6d520d8d11443b72202b9caf4f94b`. **Document DG :** `b5c59854b802dc25617d9bcd7c576495199a41dd`. Prototype non canonique, aucun changement au site Quartz / Pages, données fictives uniquement.

## Commandes, à la racine du dépôt avec Node 24

```sh
npm ci
npm test
node experiments/dg-lot003/tools/build.mjs
node experiments/dg-lot003/tools/serve.mjs
# dans d'autres terminaux :
node experiments/dg-lot003/tools/test-unit.mjs
node experiments/dg-lot003/tools/test-browser.mjs
```

Le serveur sert la page MJ sur `http://127.0.0.1:4173/` et la page joueur sur `http://127.0.0.1:4174/`. Pour la recette Chromium, définir `CHROMIUM_PATH` si nécessaire. Jamais de `file://` ni de contournement de politique navigateur.

## Contrat provisoire d'intégration

Chaque propriétaire transmet à 05 : branche, commit SHA complet, blob SHA de chaque fichier, liste de chemins, commande et résultat des tests, export JS/TS et options. Seul 05 recopie les fichiers sur la branche intégrée. Le manifeste `manifest.json` reste vide avant réception effective. Après copie et vérification des blobs, enregistrer une entrée par module :
```json
{"role":"studio","entry":"experiments/dg-lot003/src/studio/entry.ts","slot":"studio-root","branch":"prototype/dg003-studio","commit":"<SHA40>","blobSha":"<SHA40>","paths":["experiments/dg-lot003/src/studio/entry.ts"]}
```
Exemple de **forme**, non un fichier ou un SHA reçu. L'export de vue proposé est `mount({root,origin})`, fonction asynchrone ou synchrone ; adapter dans le **wiring INTÉGRATION** après réception des signatures véritables. Aucun import privé dans le paquet joueur. Les modules port/rules/catalog/storage ne doivent pas être montés automatiquement comme écrans : ajouter un adaptateur de composition dans le wiring une fois les exports exacts connus.

Les tests unitaires exigent les sept domaines, et échouent s'ils manquent. Le test navigateur ouvre réellement Chromium sur la page MJ servie, mais échoue pour la qualification tant qu'une suite QA complète n'est pas intégrée. Le BUILD_OK ne signifie pas conformité fonctionnelle. Aucun calcul 5d6, mana ou charge dans cette couche.

## Limites actuelles

Ce socle fournit des pages sécurisées et un serveur statique, pas le parcours vertical sans les six livraisons. Une projection entre origines n'est **pas activée** par l'intégrateur. L'absence de Chromium est `NON EXÉCUTÉ`, jamais `PASS`. La CI séparée ne publie rien. Ne pas fusionner avant validation DG/créateur.
