# REVUE-L003-01 / REVUE-L003-02 — Corrections STUDIO ciblées

**Propriétaire :** 20 STUDIO. **Mandat :** créateur / DG-LOT-003, PR #84. **Branche exclusive :** `prototype/dg003-studio`. **HEAD initial vérifié :** `1cdbb6640a3d9f0d4473d66e1ca3d030ceef3c4a`. **Base applicative :** `88f774f3d0d6d520d8d11443b72202b9caf4f94b`.

## Sources directes et frontières

- `experiments/dg-lot003/src/studio/index.mjs` au HEAD initial, blob `9b47c4fd8ee31deff774e12dd7a1daadea2072c9` : limite commune `MAX_IMPORT_BYTES = 5 Mio` utilisée par `readFile` (UI restauration) et `previewRestoration`, et `setActiveScene` sans `touch/save`.
- ARCHIVES `experiments/dg-lot003/src/storage/storage.mjs` lu via GitHub au commit `2459876b9f8bd0cf7f7a588e09b709bca3c221c3`, blob `f9d2f2194606b2d0ac3d2f3418ebcaedfc495837` : `MAX_EXPORT_BYTES=16*1024*1024` et `previewPrivateRestore` contrôle les octets à cette limite. Aucune écriture ni modification de l'adaptateur ARCHIVES.
- L'enveloppe provisoire `cer.studio.dg003.provisional.v0` et la projection whitelist restent inchangées.

## Correctifs

### REVUE-L003-01 — restauration 16 Mio, PJ 5 Mio

`readFile(file,maxBytes=MAX_PJ_IMPORT_BYTES)` distingue désormais la taille PJ 5 Mio et le plafond de sauvegarde confidentielle 16 Mio. La sélection de fichier « Fichier de restauration confidentiel » utilise explicitement `MAX_BACKUP_BYTES`. Les deux préconditions sont vérifiées : `File.size` avant lecture, puis `Uint8Array.byteLength` réel après lecture. Le point d'entrée `previewRestoration(bytes)` accepte jusqu'à 16 Mio inclus et rejette toute taille supérieure **avant** `storage.previewRestore`. L'interface n'essaie pas de valider le contenu ou les SHA : ces responsabilités restent à ARCHIVES.

### REVUE-L003-02 — scène active persistée

`setActiveScene(id)` devient **asynchrone** (`Promise<void>`), refuse d'abord l'ID inexistant, change `activeSceneId`, appelle `touch()` uniquement si le choix change, révoque toute sélection publique puis attend `save()`. Le chemin UI existant gère déjà les Promises via `onError`. Sans changement de scène, la sélection publique est toujours effacée, mais pas de révision ni écriture supplémentaire. La file de sauvegarde `pendingSave` ordonne les écritures asynchrones déjà déclenchées par la création de scènes pour empêcher qu'une sauvegarde plus lente de B écrase celle de A. `PLAYER_CLEAR` reste le seul message envoyé par cette action ; **aucun** `PLAYER_SHOW` automatique.

## Tests réellement exécutés ici (Node v22.16.0)

Commande : `node --test experiments/dg-lot003/tests/studio/*.test.mjs`

**Résultat : 22 PASS, 0 FAIL, 0 SKIP**, comprenant 11 tests STUDIO existants et 11 nouveaux tests réels contre `mountStudio` et `projection` importés. Ces tests utilisent un DOM minimal de test et des ports d'injection espion pour vérifier l'appel à ARCHIVES, **pas** une restauration alternative ni un validateur de contenu simulé à présenter comme réel.

Scénarios : fichier 5 Mio+1 accepté ; 16 Mio pile accepté ; >16 Mio rejeté avant lecture et avant appel au port ; taille mensongère rejetée après lecture ; limite PJ inchangée 5 Mio ; absence de mutation du projet en erreur ; scène A/B→A, révision incrémentée et rechargement ; refus ID invalide ; absence de republication et `PLAYER_CLEAR` ; sélection identique ; ordre des écritures en présence de sauvegarde B retardée.

Contrôles de syntaxe : `node --check` pour le module Studio et les régressions ; `python -m py_compile` pour le script navigateur : PASS.

**Essai Chromium réellement tenté :** `python experiments/dg-lot003/tests/studio/browser-runner.py` → **BLOQUÉ** avant l'ouverture de la page, `net::ERR_BLOCKED_BY_ADMINISTRATOR` sur `127.0.0.1:4173`. Le script de recette navigateur possède le test A/B→A→reload ajouté, mais **il n'a pas été exécuté jusqu'au test**. Pas de contournement de la restriction.

`npm ci`, `npm test` de tout le dépôt, les tests avec le **vrai ARCHIVES** et la CI sur HEAD intégré : **NON EXÉCUTÉS dans cette session**, faute de clone réseau GitHub (DNS indisponible). Les 161 tests intégrés réussis annoncés par la session DG sont des résultats rapportés sur une autre révision, non revendiqués comme nouvelle preuve.

## Portabilité et limites

- Aucun changement de schéma, de M01–M05, Bestiaire, INDEX, ARCHIVES, Quartz, site, branche intégrée ou personnage réel.
- Fichiers propriétaires seulement sous `experiments/dg-lot003/src/studio/` et `experiments/dg-lot003/tests/studio/`.
- Une erreur de `storage.save` est signalée dans le statut existant ; l'appel ne garantit pas la persistance après échec. Les vrais contrats ARCHIVES (hash et collision) doivent être testés par l'intégrateur, **sans substituer** les ports d'essai.
- Les tests DOM Node ne remplacent pas les tests Chromium sur les deux origines. La qualification finale P0/P1 dépend de la recette intégrée QA au SHA final.

## Passations préparées (non envoyées ici)

**À 05 INTÉGRATION :** copier les blobs corrigés à l'identique, câbler les vrais ports et refaire `npm test`, le navigateur réel et le cas sauvegarde 5–16 Mio ; relever le HEAD final intégré. **À 04 ARCHIVES / 02 QA :** vérifier 16 Mio exacts, rejet >16 Mio sans mutation, intégrité SHA, collisions, A/B→A→rechargement et `PLAYER_CLEAR` sans `PLAYER_SHOW` ; confirmer contrat `setActiveScene` asynchrone. **À valider par DG :** clôture de REVUE-L003-01/02 après preuves intégrées, et non avant.
