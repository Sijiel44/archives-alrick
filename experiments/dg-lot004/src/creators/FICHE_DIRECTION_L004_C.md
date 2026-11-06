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

## Addendum DG — L004-REPAIR transactionnel (05/11/2026)

Défaut observé sur #100@`093d2504` : `attachCreature()` copie dans STUDIO puis `persistence.save` échoue ; tentative suivante reproduit une deuxième copie, prouvé par injection : `inst-1` puis `inst-2`. Même vulnérabilité structurelle pour la scène.

**Décision correctrice :** journal privé de pré-intention durable avant effet STUDIO, reprise manuelle obligatoire après échec, candidate vérifiée par identifiants/provenance, aucune création répétée. UI MJ explicite. Restaurations pendant journal bloquées. Aucun changement aux règles, aux ports STUDIO ou INDEX, au site ni aux données réelles.

**Contrat de livraison :** module `cycle-state.mjs`, UI `cycle-ui.mjs`, tests correspondants et README du seul sous-arbre ATELIERS. Le nouvel HEAD et les blobs sont indiqués dans la PR #100 et la passation à PR #95. Les tests Node natifs/Chromium sur le HEAD intégré appartiennent à 05/QA ; aucune homologation automatique.

**Limites à arbitrer par 05/STUDIO/ARCHIVES :** identifiants uniques/provenance d'une copie, durabilité du port, scène partiellement mise à jour, intervention humaine en cas de données discordantes, restauration d'un backup obsolète sans journal. Une clé d'idempotence native et une transaction inter-moteurs ne sont pas introduites par ATELIERS.

### Complément preuve interop STUDIO/ARCHIVES — DG L004-REPAIR


Sources exactes : ATELIERS #100, STUDIO #98@`9729d1085a8714cc01d769908adfd5aa87e7ef9b` / blob `reconcile.mjs=f2b3a0254aa8f6ca8fcd4c6299281eee7467581e`, ARCHIVES L003 `tools/runtime.mjs` blob `444066ca6dbeaf59a9f8097e550bfff6105e47c7`. **Incompatibilités prouvées :** l'inspection STUDIO exige une scène avant la copie de créature ; `unpersisted` en STUDIO peut encore correspondre à `requires-confirmation` dans l'ATELIERS antérieur sans lecture durable ; les anciens backups sans journal et doubles candidats pouvaient recréer ou relier arbitrairement des copies. Dernières gardes propriétaires : refus d'ambiguïté et refus de la nouvelle création devant source/titre préexistants, avec tests ciblés. Le port de preuve de persistance `loadPersistedStudio()`, la politique de sauvegarde atomique et le raccord d'inspection par maillon appartiennent à 05/20/04, **non prétendus résolus** par le correctif propriétaire. Aucun merge ni QA Alpha.

