# L003-CATALOG — interface provisoire exécutable

Périmètre exclusif INDEX. Le module `index.mjs` utilise JavaScript ESM natif, compatible navigateur moderne et Node ; **aucune dépendance externe, aucun calcul M01/M03 et aucune mutation de source**. Il lit le contrat original `entre-rives.catalog.entry.v0.2-proposal` de l'INDEX-001, sans modifier le JSON Schema d'origine.

## Imports / signatures stables pour la phase d'intégration

```js
import {
  CATALOG_SCHEMA, CATALOG_RUNTIME, CATALOG_UNAVAILABLE,
  validateCatalogEntry, createDescriptiveEntry,
  createDescriptiveCapability, createDescriptiveSpell, createDescriptiveItem,
  draftCatalogId, createNativeReference, createPrivateSnapshot,
  previewCatalogEntry, validateCatalogRegistry,
} from './src/catalog/index.mjs';
```

- `createDescriptiveCapability(input)` ; idem `createDescriptiveSpell(input)` et `createDescriptiveItem(input)` : **factory sans effet numérique**, retourne `{ok, errors, entry?, executable:false}`. `input` : `name`, `description?`, `effectText?`, `id?`, `namespace?`, `version?`, `provenance` requis, `restrictions?`, `conditions?`, `cost?`, `duration?`, `effects?` seulement descriptifs. Capacité : `entryType` aptitude/technique/signature/creature-ability si désiré ; défaut technique. ID absent : `cap:local:<type>-<nom-normalise>` déterministe, à **figer après la première sauvegarde** ; ne jamais recalculer lors du changement de nom. Les doublons sont vérifiés par le registre, non par le générateur.
- `createDescriptiveEntry(input)` : même contrat avec `entryType` explicite. N'accepte jamais action mécanique, `approved:true`, `approvedByGM:true` ou `effects.numeric`.
- `validateCatalogEntry(json, {inertNumericMetadata?:false})` : clone/validation sans mutation ; par défaut refuse tout effet numérique. `inertNumericMetadata:true` permet de **lire** les anciennes fixtures M03/Spell/Rite sous contraintes natives strictes (ex. magnitude 1..2), avec `executable:false` **quoi qu'il arrive**. `absorption` et item numérique refusés même en mode lecture. Un `definitionState:validated` ne vaut pas un accord du MJ.
- `createNativeReference(entry)` : seulement provenance `originKind:native` avec SHA Git exact de 40 caractères ; retourne `{ok, reference:{kind:'native-reference-only',catalogId,catalogVersion,sourceSchema,sourceId,sourceVersion,sourceCommit,executable:false}}` ; **jamais d'objet `AuthorizedM03Effect`**. L'intégrateur doit utiliser le port MATH/Grimoire pour toute autorisation et résolution.
- `createPrivateSnapshot(entry,nativeOriginal)` : uniquement pour entrée descriptive valide. Retourne `{ok,snapshot}` dont `schema='cer.catalog.dg003.private-snapshot.v0'` et `visibility='mj-private'`. Conserve les champs inconnus, `originalVersion`, `originalStatus`, et `originalNativeSource` **exactement en données JSON sans passer par `normalizeSpell`**. Ne jamais donner cet objet à `postMessage`, à la fenêtre joueur, ni à un export public. Le stockage/empreinte SHA des octets est de la responsabilité ARCHIVES.
- `previewCatalogEntry(entry)` : affiche un **aperçu MJ** sans sources brutes, aliases, extensions, approbations et secrets. Ce **n'est pas** une whitelist de transmission joueur (port STUDIO seul compétent). Effets numériques inertes affichés comme `Indisponible — règle/validateur non homologué`.
- `validateCatalogRegistry(entries)` : détecte `id@version` dupliqué, changement d'`entryType` d'un ID et collision d'alias même `(scope,sourceSchema,sourceId)` entre deux IDs. Permet versions différentes du même ID sans changer la catégorie.
- `clonePrivateJson(value)` : copie profonde de données JSON seulement ; refuse clés spéciales, accesseurs, cycles, prototypes inattendus, contenus excessifs. N'exécute pas le texte importé.

## Exemple immédiat (ATELIERS / STUDIO)

```js
const r = createDescriptiveSpell({
  name: 'Lueur fictive',
  description: 'Une petite lumière décrite par la table.',
  effectText: 'Éclaire narrativement, sans bonus ni calcul.',
  provenance: {
    sourceSchema: 'cer.studio.dg003.provisional.v0',
    sourceId: 'campagne-fictive:sort-local-1',
    originKind: 'campaign',
    sourceVersion: 'v3',
  },
  restrictions: ['Aucune activation ou dépense automatique'],
});
if (!r.ok) throw new Error(r.errors.join('; '));
const card = previewCatalogEntry(r.entry); // usage local MJ, pas DTO joueur
```

## Frontières impératives

- `schema` INDEX vs `version` de définition vs `sourceVersion` natif vs SHA moteur vs code documentaire : identités indépendantes.
- `GameItem` n'a pas de validateur natif d'effet chiffré ; **bague à bonus bloquée**.
- `M03Effect.absorption` est déclaré mais non consommé par le résolveur natif ; **bloqué**.
- Aucune conversion `PreparedMatrix.charges` en énergie disponible / nombre d'usages ; aucune application de mana/charges.
- Les coûts `mode:not-applicable/unknown/native` avec `amounts` sont refusés ; `specified` exige des montants finis. Bornes M03 `magnitude=1..2`, `duration=1..3` uniquement pour metadata non exécutable.
- Aucune autorisation, canonisation, transaction, moteur bis ou norme définitive du Studio n'est créée par ces exports.

## Tests et origine

```bash
node --test experiments/dg-lot003/tests/catalog/catalog.test.mjs
```

La copie `tests/catalog/fixtures-v02-original.json` est **octet pour octet** la pièce INDEX-001 v0.2, SHA256 `7396a5eaade764dd048c243ee1765d12ab22a473e88a4ebad15b6c08a1480a89` ; elle contient les cinq cas non canoniques. Tests sur Node 22 du conteneur isolé; Node 24/CI et moteurs TypeScript seront validés par INTÉGRATION sur clone complet. Aucun port n'est importé ni supposé reçu.