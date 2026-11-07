# ARCH-STORAGE-001.R2 — exécution bornée, réemploi de #104

Le correctif R2 est un **patch isolé** appliqué à `#104@f84f8c54361b3701ebb0251700f2d0d09d4acf4d`, sans toucher au candidat P0 #95. On conserve `experiments/arch-storage-001/index.html`, le serveur **127.0.0.1:4181**, les données de fiction, `browser.spec.py` B01–B10 et les contrats CORE-COMPAT/UX précédents.

### Exports et décisions

- `src/idb-store.mjs` : `readConsistentSnapshot(id,{onTransactionOpen?}) -> Promise<{campaign,journal,dbVersion}>` ; `exportPrivate(id,{afterSnapshotRead?,onTransactionOpen?})`, transaction de lecture **unique**, donc photo cohérente même si un autre onglet écrit après. Hooks de synchronisation facultatifs destinés à la recette reproductible ; ne jamais faire de réseau ni `await` dans la transaction.
- `src/idb-store.mjs` : `DB_VERSION=1`, fermeture sur `versionchange`, refus `DB_CLOSED`; `applyEvent(...,{injectFailure:'quota'})` est une **panne simulée**, jamais une preuve de disque plein.
- `src/a-guard.mjs` : `createAReinforcedComparison({storage,key})` compare une enveloppe unique localStorage aux mêmes commandes du banc B. **Non homologué : A perd une écriture** si deux onglets lisent la même révision avant `setItem`.
- `docs/ARCH_STORAGE_001_R2_ADR_ADDENDUM.md` : avant/après, différence A/B, limites de version/quota/offline/migration. `docs/UX_STUDIO_001_R2_RECONCILIATION.md` : rapproche #101 STUDIO, #102 ATELIERS, #104 BUILDER, sans interface finale.

### Commandes réellement exécutables (depuis racine du clone au SHA R2)

```sh
node --version                   # Node 24 recommandé, >=22 accepté par scripts existants
npm ci
npm test
node --test experiments/arch-storage-001/tests/contracts.test.mjs experiments/arch-storage-001/tests/r2-contracts.test.mjs
node --check experiments/arch-storage-001/src/idb-store.mjs
node --check experiments/arch-storage-001/src/a-guard.mjs
# Le harnais ci-dessous lance son propre serveur 127.0.0.1:4181 ; ne pas en lancer un autre en parallèle :
CHROMIUM_PATH=/usr/bin/google-chrome-stable python experiments/arch-storage-001/tests/browser.spec.py
CHROMIUM_PATH=/usr/bin/google-chrome-stable python experiments/arch-storage-001/tests/browser-r2.spec.py
```

Le harnais Python exige Playwright **uniquement pour tester**. Le workflow GitHub isolé installe son propre environnement temporaire. Aucune dépendance npm ajoutée, aucun tunnel, serveur LAN, Pages, service worker ni lien privé publié.

### Verdicts à distinguer

- Le test `browser-r2.spec.py` prouve la transaction de lecture en faisant **modifier la campagne par un second véritable onglet pendant l'export**. L'archive à R7/7 est cohérente ; la campagne du navigateur peut déjà être R8/8. Ce n'est pas un conflit : l'instant du snapshot est stable.
- Le test quota fait **avorter volontairement** une transaction sans perdre les deux stores. La saturation réelle d'un profil avec média et limites physiques reste **NON EXÉCUTÉE**.
- Le test ancien onglet utilise une mise à jour volontaire d'une **base fictive distincte** : onglet coopératif ferme proprement ; onglet non coopératif bloque jusqu'à fermeture. Aucune donnée historique n'est touchée.
- Le test hors profil crée un vrai fichier temporaire de sauvegarde fictive, le lit depuis un autre contexte Chrome et contrôle le réexport privé octet-exact.
- L'option C et la migration d'archives v2/v3 ne font l'objet d'aucune manipulation.

### Revenir en arrière

Arrêter la recette (elle ferme ses processus). La branche R2 peut être abandonnée sans changer #104. Les bases de démonstration créées par le harnais sont des noms isolés dans le profil éphémère ; **ne pas nettoyer** un namespace L003/L004 réel ou utiliser `indexedDB.deleteDatabase` sur le profil de travail. Une migration future devra proposer double export/restore, SHA et confirmation DG.
