# FICHE_DIRECTION_L003_CREATORS — 21 ATELIERS

**Date :** 2026-11-04. **Statut :** PROTOTYPE PROPRIÉTAIRE DÉPOSÉ — QUALIFICATION INTÉGRÉE EN ATTENTE.
**Mandat :** [DG-LOT-003 PR #84](https://github.com/Sijiel44/archives-alrick/pull/84), base `88f774f3d0d6d520d8d11443b72202b9caf4f94b`.
**Branche propriétaire :** `prototype/dg003-creators`. Aucun merge, publication, migration ou changement M01–M05.

## Produit livré

- Un vrai module JavaScript ESM DOM, importable via `mountCreators`.
- Trois formulaires distincts : capacité, sort, objet, fiches descriptives uniquement ; nom, provenance, version, description, limites obligatoires, champs experts facultatifs.
- Deux modes guidé/expert ; prévisualisation textuelle sûre en direct ; erreurs par champ, `aria-invalid`, focus sur le premier champ invalide, navigation clavier standard et style sombre/cuivré adaptatif.
- Persistance **par callback local injecté uniquement** ; aucun stockage ni effet de bord embarqué, sauvegarde non réputée réussie sans `{saved:true}`.
- Aperçu mécanique éteint par défaut : autorisation INDEX puis délégation MATH natives requises pour capacité/sort ; jamais de moteur maison. Objets numériques, absorption, charges/débits et Autorités25+ désactivés.

## Fichiers, blobs et exécution

1. `experiments/dg-lot003/src/creators/index.mjs` — blob GitHub `7415d753582c29e0a365bb782bd0e7798a5787eb`.
2. `experiments/dg-lot003/tests/creators/creators.test.mjs` — blob GitHub `d1d8a741496cb1fe47111681376c6b51502171d3`.
3. `experiments/dg-lot003/src/creators/README.md` — blob GitHub `40545ec0f8d05108dd9eaf8023d4f5defa9348f7`.

**Tests locaux du développement initial :** `node --test experiments/dg-lot003/tests/creators/*.test.mjs` : 10/10 réussis sur une version de travail locale distincte avant dépôt. **Ces résultats ne certifient pas le HEAD GitHub.** Le test propriétaire maintenant déposé utilise le vrai module GitHub, mais **n’a pas pu être exécuté sur ce HEAD** dans cette session : le clone est bloqué (DNS). Environnement disponible : Node v22.16.0, et non le Node 24.22.1 annoncé par la session centrale.

**Recette navigateur :** tentative Chromium via Playwright vers `http://127.0.0.1:8765/local-preview.html` ; refus `net::ERR_BLOCKED_BY_ADMINISTRATOR`. **NON EXÉCUTÉE**, aucun contournement. `npm test` du dépôt et CI finale : **NON EXÉCUTÉS** ici.

## P0/P1, écarts et dépendances

- Aucun P0 relevé à l’inspection du sous-module, mais pas de recette de sécurité intégrée suffisante pour déclarer la fermeture P0.
- **P1 :** démonstration browser et validation sur HEAD intégration à réaliser par 05 INTÉGRATION et 02 QA.
- **P1 :** brancher un véritable callback de sauvegarde locale et le scénario stockage/export sous responsabilité STUDIO/ARCHIVES.
- L’aperçu numérique demeure indisponible tant que INDEX/MATH ne fournissent pas les contrats effectivement homologués ; aucun calcul bis autorisé.
- Un mode guide/ecran lecteur de base reste à tester avec technologies d’assistance.

**À revoir par :** 05 INTÉGRATION (import ESM), 11 INDEX (autorisation), 10 MATH (délégation), 20 STUDIO + 04 ARCHIVES (sauvegarde), 13 MAG + 14 OBJETS (aucun débit), 02 QA (tests navigateur).

**À valider par DG/créateur :** éligibilité du module à la branche intégrée après tests sur SHA final ; aucune activation numérique, fusion, publication ou canonisation dans ce lot.