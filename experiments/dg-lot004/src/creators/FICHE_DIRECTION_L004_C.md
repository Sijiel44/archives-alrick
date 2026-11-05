# FICHE_DIRECTION_L004-C — 21 ATELIERS

**Mission:** DG-LOT-004 / L004-C P0, autorisée le 05/11/2026. **Source:** issue GitHub #94. **Base propriétaire:** PR85 `2ab809ef5351940e0fc272b859d10f21de894d00`. **Statut:** prototype exécutable isolé, intégration/QA à réaliser.

## Livraison

- `src/creators/cycle-state.mjs` — machine à états descriptive objet → capacité → créature → scène, option sort ; brouillons, version/provenance/statut et validation MJ ; séquencement guidé/expert, erreurs de port, refus mécanique.
- `src/creators/cycle-ui.mjs` — parcours DOM navigable réutilisant les trois formulaires L003 (sans styles inline), questions flûte narratives, aperçu MJ, copie STUDIO explicite, chaîne INDEX privée, sauvegarde/export/restauration.
- `tests/creators/cycle-state.test.mjs` et `tests/creators/cycle-ui.test.mjs` — tests Node propriétaires.
- README d'API et d'intégration sous la propriété ATELIERS.

## Contrat INDEX/MAG

PR #97 au SHA `62ff4332b9e9ecb9a5437719eaefa61fad01d57d` examinée. Dépendance **injectée**, non dupliquée : `createDescriptiveChain`, `validateDescriptiveChain`, `createPrivateChainSnapshot`, `validatePrivateChainSnapshot`. Chaîne descriptive `executable:false`, snapshot **mj-private-only**. Sans port, statut indisponible. Les versions Grimoire (nombre), rites (texte) et INDEX (SemVer) demeurent distinctes dans la source privée. Aucune récompense XP, aucun −2, absorption, lancer, mana/charges, capacité acquise ou message joueur.

## Tests et limites

Exécution locale : `node --test /mnt/data/dg004/tests/creators/*.test.mjs` sur fichiers `.mjs` actuels — **24 tests réussis, 0 échec, 0 skip** ; Node 22.16.0. Les tests INDEX se font sur doubles stricts conformes à la signature de #97 et ne prouvent pas encore l'intégration du module INDEX réel. `npm test` complet sur la base PR85, tests M01 TypeScript, navigateur Chromium, e2e et CI de HEAD intégré : **NON EXÉCUTÉS ici**. La session 05 doit les exécuter, sans extrapoler les résultats.

**Risques restants:** liaison avec les vraies interfaces INDEX/STUDIO, persistance IndexedDB et isolation joueur en Chromium, recette clavier/lecteur écran ; une erreur après un appel externe STUDIO et avant l'enregistrement local impose réconciliation manuelle, jamais duplication silencieuse. Les P0/P1 ne sont pas homologués sans QA intégrée.

**À revoir par:** 05 INTÉGRATION, 20 STUDIO, 11 INDEX, 10 MATH, 14 OBJETS, 13 MAG, 35 BESTIAIRE, 04 ARCHIVES et 02 QA. **À valider par DG/créateur:** adoption du parcours dans la branche intégrée, QA au SHA final, activation éventuelle de suggestions XP après contrats ; aucun merge/Pages/canonisation.