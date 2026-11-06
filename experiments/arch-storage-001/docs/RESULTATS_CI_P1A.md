# ARCH-STORAGE-001 — Preuves directes Node24 / Chrome sur le banc isolé

**Date :** 6 novembre 2026. **Branche :** `prototype/p1a-arch-storage-builder-20261106`. **Source code P1-A testé :** `e0ade1264a8fba0dc67dd0aab5dc668bb103fa08` ; base code L003 `2ab809ef5351940e0fc272b859d10f21de894d00` ; PR #95 P0 `b75e7f03af625fa1f09782cde4e480c2c6d21c84` **non modifiée**.

**Workflow exécuté :** https://github.com/Sijiel44/archives-alrick/actions/runs/42301287493 ; **job `128179440610`** : `completed / success`, checkout `P1A_TESTED_HEAD=e0ade1264a8fba0dc67dd0aab5dc668bb103fa08`. GitHub runner Node 24, Chrome officiel `156.0.8078.79`.

| Gate | Résultat |
|---|---|
| GitHub checkout sur SHA exact, ascendance PR85 | **PASS** |
| `npm ci`, `npm test` du dépôt | **PASS** |
| `node --test experiments/arch-storage-001/tests/contracts.test.mjs` | **PASS 13/13, fail 0** |
| Syntaxe des `.mjs` du banc | **PASS** |
| Chrome réel sur HTTP `127.0.0.1:4181` | **PASS** |
| B01 données campagne, 2 PJ, 1 créature, 2 scènes, note, rev7 | **PASS** |
| B02 deux onglets partageant IndexedDB réel | **PASS** |
| B03 panne injectée avant commit, rollback snapshot + journal | **PASS** |
| B04 accusé perdu après commit, retry **duplicate**, aucune nouvelle note | **PASS** |
| B05 deux onglets/transactions en concurrence, un commit, un `STALE_REVISION` | **PASS** |
| B06 reload même profil conservant snapshot et journal | **PASS** |
| B07 export SHA, tamper et collision de projet refusés | **PASS** |
| B08 import dans profil vierge et réexport **octet pour octet** | **PASS** |
| B09 aucun appel de ressource externe / origine locale | **PASS** |
| B10 largeur 1280, 768, 390 et boutons 44px | **PASS** |

**Historique des échecs de harnais conservé :** premier workflow sur `16ba0694…` a échoué à la validation YAML ; second sur `a965ebc…` a échoué avant les tests de stockage car `wait_for_function` évaluait du JS incompatible avec la CSP. La correction **n'a pas désactivé la CSP** ; elle attend une propriété DOM `data-p1a-ready` et des locators. L'erreur de navigateur propre au conteneur BUILDER `ERR_BLOCKED_BY_ADMINISTRATOR` reste **NON EXÉCUTÉ local**, sans contournement.

**Réserves non couvertes malgré ces PASS :** coupure électrique / fermeture brutale du processus Chrome, quota saturé, appel concurrent pendant lecture export, durabilité OPFS et réparation cross-store, véritable import patrimonial v2/v3 byte-exact, confidentialité inter-origines de la future projection STUDIO, tablette physique, navigateur Safari/Firefox, lecteur d'écran, usage réel de données MJ, sécurité d'un profil compromis. Aucune architecture A/B/C n'est arbitrée. **Ce document décrit le commit testé e0ad : après son ajout documentaire, exiger une CI verte sur le nouveau HEAD avant transmission de statut final.**
