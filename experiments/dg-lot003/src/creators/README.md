# L003-CREATORS — contrat d’intégration (prototype non canonique)

**Propriété :** 21 ATELIERS. **Base fixe :** `88f774f3d0d6d520d8d11443b72202b9caf4f94b`.
**Point d’entrée :** `experiments/dg-lot003/src/creators/index.mjs` (ESM pur, aucun package ajouté).
**Utilisation :** importer `mountCreators` depuis ce fichier et monter dans un élément DOM existant.

```js
import { mountCreators } from './src/creators/index.mjs'
const controller = mountCreators(document.getElementById('creators'), {
  initialKind: 'capacity', // 'spell' | 'item'
  initialMode: 'guided',  // 'expert'
  onSave: async (descriptiveRecord) => {
    // Le Studio / STORAGE décide si et où enregistrer en LOCAL.
    // Ne retourner {saved:true} qu'après confirmation effective.
    await localCreatorStore.save(descriptiveRecord)
    return { saved: true }
  },
  // Facultatif. Absent par défaut -> contrôle prévisualisation numérique désactivé.
  numericPreview: {
    authorize: async (record) => catalogAndRules.authorizeExistingNativeReference(record),
    evaluate: async (record, authorization) => rulesGateway.previewNative(record, authorization),
  },
})
// controller.getDraft('capacity' | 'spell' | 'item') -> brouillon non validé
// controller.setKind('spell')
// controller.setMode('expert')
// controller.destroy()
```

## Exports

- `mountCreators(root, options)` : trois formulaires DOM (capacité, sort, objet), guides/experts, aperçu descriptif, validations, focus d’erreur, callback `onSave` injecté.
- `validateCreatorDraft(input)` : validation stricte **pure**, `{valid, errors, record}`. Ne retourne un `record` normalisé que si valide.
- `CREATOR_KINDS`, `CREATOR_SCHEMA`, `NUMERIC_UNAVAILABLE`, `CREATOR_STYLES`.

## Contrat des données

`record.schema = 'cer.creator.dg003.descriptive.v0'` (temporaire), `kind = capacity | spell | item`.
Champs communs obligatoires : `name`, `provenance`, `version`, `description`, `limitations`.
Suppléments facultatifs : capacité `trigger/tags` ; sort `tradition/manifestation` ; objet `category/appearance`.
Aucun objet JSON provenant d’INDEX ou du Bestiaire n’est accepté tel quel ; effectuer explicitement l’adaptation vers ce record descriptif. Les champs inconnus et les champs mécaniques (`damage`, `manaCost`, `charges`, `absorption`, `approved`, `authority25` etc.) sont refusés.

## Frontières de confiance

- Aucun `localStorage`, `IndexedDB`, `postMessage`, réseau, publication, lancement de sort ou mutation n’est exécuté par ce composant.
- Sauvegarde **uniquement via** `onSave(record)`. `{saved:true}` doit provenir du service de sauvegarde ; sans callback, bouton désactivé. Un retour non confirmé n’affiche pas « enregistré ».
- Les champs saisis sont affichés via `textContent` et `value`, jamais `innerHTML`.
- Prévisualisation numérique autorisée **seulement** si les deux fonctions externes `numericPreview.authorize` et `numericPreview.evaluate` sont injectées. `authorize` doit produire `{status:'authorized', nativeReference:'...'}` pour une **référence native préexistante réellement homologuée** ; la validation doit être réalisée dans le port INDEX/MATH, jamais sur le booléen d’un formulaire. `evaluate` délègue au moteur natif, ne fait aucune dépense et retourne `{summary:string}`. Refus = `NUMERIC_UNAVAILABLE`. **Objet numérique : toujours interdit**, même avec service injecté.
- Absorption M03, Autorités 25+, coûts/charges/débits et nouvelles règles : champs inactifs. Le module n’invente aucune formule M01–M05.
- Ne pas passer de données secrètes MJ dans une fenêtre joueur ; cet atelier ne crée pas de DTO joueur. Ce contrôle appartient à STUDIO.

## Test propriétaire

```sh
node --test experiments/dg-lot003/tests/creators/*.test.mjs
```

Tests sans dépendances additionnelles ; ils importent le vrai module ESM et utilisent un double DOM minimal. Cette recette ne remplace pas les essais Chromium de QA sur la page intégrée ni `npm test`.

## Risques / passations

05 INTÉGRATION : brancher l’ESM dans son `index.html`/build, un callback local réel et un conteneur DOM. Ne pas écrire dans `content/`.
11 INDEX / 10 MATH : fournir, à terme, l’autorisation native et le port d’aperçu ou laisser l’action indisponible.
04 ARCHIVES / 20 STUDIO : gérer la persistance et l’export privé ; ne pas interpréter ces fiches comme canon.
02 QA : tester en Chromium aux origines 4173/4174, clavier, lecteur d’écran de base, refus des fonctions avancées et XSS.
13 MAG / 14 OBJETS : confirmer qu’aucune transaction n’est possible depuis les fiches descriptives.

**Aucun merge/publication/canonisation autorisé.**