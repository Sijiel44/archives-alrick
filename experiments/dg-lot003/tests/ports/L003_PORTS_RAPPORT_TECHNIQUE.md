# L003-PORTS — Rapport technique de réalisation (BUILDER)

**Mission :** DG-LOT-003 / L003-PORTS. **Dépôt :** `Sijiel44/archives-alrick`. **Référence :** PR #84, commit `b5c59854b802dc25617d9bcd7c576495199a41dd`. **Base applicative imposée :** `88f774f3d0d6d520d8d11443b72202b9caf4f94b`.

## Ce qui est livré

- `src/ports/types.ts` : identités documentaire/source/profil/instance, `PortResult`, cinq interfaces de façade et options injectables.
- `src/ports/ports.ts` : fabrique et cinq façades exécutables, lecture/copie sans mutation, absence de moteurs de calcul, erreurs explicites et comparaison stricte des versions.
- `src/ports/index.ts` : unique point d'entrée stable pour STUDIO/ATELIERS/INTÉGRATION.
- `src/ports/README.md` : signatures précises, responsabilités de chaque fournisseur et protocole de raccordement.
- `tests/ports/ports.test.mjs` : vrais tests Node important les fichiers TS réels avec `--experimental-strip-types`, corpus fictif.
- `tests/ports/TEST_RESULTS.tap` : capture TAP de l'exécution locale.

**Aucun autre sous-arbre modifié ; aucun algorithme M01–M05 copié ; aucune transaction, écriture documentaire, HTTP, navigateur ni dépendance ajoutée.** Les DTO sont `PortResult<T>`, pas les modèles définitifs de campagne/capacités.

## Commandes et preuves (réellement exécutées localement)

- `git ls-remote https://github.com/Sijiel44/archives-alrick.git refs/heads/main` (borné 12 s) : **échec DNS** `Could not resolve host: github.com`, sortie 128. Aucun clone Git accessible ici. Accès GitHub connecté pour les lectures et écritures documentaires/code autorisées.
- `node --experimental-strip-types --test experiments/dg-lot003/tests/ports/ports.test.mjs` : **23 tests, 23 réussis, 0 échec** sur les sources TS produites ; runtime local Node **22.16.0**, et non Node 24 de la session d'orchestration.
- `tsc --noEmit --target ES2022 --lib ES2022,DOM --module ESNext --moduleResolution bundler --allowImportingTsExtensions --strict ...` : **succès, sortie 0** sur `index.ts`, `ports.ts`, `types.ts`.
- **Non exécuté ici :** `npm ci`, `npm test` du dépôt complet, esbuild du projet, tests de navigation Chromium, tests d'intégration MATH/INDEX/ARCHIVES/STUDIO et CI au SHA intégré. Un rapport vert du banc isolé ne certifie aucun de ces contrôles.

## Contrats d'intégration et risques

1. MATH fournit `rules.previewNative`; il décide de l'éligibilité native et de la validation M03, jamais BUILDER. Sans raccordement, tous les appels sont `unavailable` ou `blocked`.
2. INDEX fournit `catalog.resolve`, valide la version et les statuts; ne transforme jamais une narration en pouvoir numérique. DOCUMENTATION/BEST fournissent des snapshots sûrs.
3. ARCHIVES fournit `characters.preview`, calcule SHA256 réel, garde octets, valide taille/schéma/versions et ajoute une opération distincte et approuvée pour toute mutation de campagne. L'aperçu n'effectue pas de stockage.
4. STUDIO donne `InstanceIdentity`, utilise uniquement les copies et construit la whitelist joueur **hors de ces ports** ; les enregistrements retournés ici sont **privés**, non des DTO publics.
5. INTÉGRATION importe `src/ports/index.ts`, raccorde les dépendances par injection et vérifie l'absence de références circulaires / imports non livrés; n'écrit qu'à sa branche intégrée.

## Risques non clos

- `RulesGateway` ne sait pas prouver cryptographiquement qu'une injection MATH utilise bien le moteur natif : vérification par import source et test de parité chez MATH/QA.
- La conservation d'un SHA256 ou d'originaux **n'est pas implémentée** ici : contrat et responsabilités seulement, chez ARCHIVES.
- Les références documentaires sont lues en **mode privé** ; droits, origine distincte, `postMessage` et secrets de la projection sont contrôlés exclusivement par STUDIO/QA.
- Les validations détaillées de catalogage et les schémas provisoires de campagne appartiennent à INDEX/ARCHIVES, et doivent être raccordés par INTÉGRATION.

**Verdict de périmètre :** ports de prototype et tests isolés **VALIDÉS LOCALEMENT** ; intégration navigateur/CI de lot et qualification Alpha **NON EXÉCUTÉES** ici.