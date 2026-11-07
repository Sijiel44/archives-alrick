# L004-REPAIR — Rapport technique STUDIO (05/11/2026)

**Mandat :** ordre direct DG L004-REPAIR du créateur à 20 STUDIO, assistance ciblée 05, 21, 04, 01. **Base documentaire / produit :** PR #85 `2ab809ef5351940e0fc272b859d10f21de894d00`. **Branche propriétaire existante :** `prototype/dg004-studio`, PR #98, parent exact avant correctifs `18602be2d0b281478ebd9693b6ff0be63ef862ee`. **Candidat P0 #95 :** inchangé. **PR 21 #100 :** source inspectée au SHA `093d2504c7633baff6124ad7986224124946f6ce`.

## Reproduction P1 — deux écritures séparées

L004-C `src/creators/cycle-state.mjs` (PR #100) effectue :

1. `attachCreature()` : `studio.previewCreature(ref)` → `studio.copyCreature()` (effet dans STUDIO) → `commit(next.links.creatureInstanceId=instanceId)` (écriture de l'état CREATORS). Si cette dernière écriture échoue après copie, le lien reste absent, et un nouveau clic peut appeler **une seconde copie** avec nouvel identifiant.
2. `attachScene()` : `studio.createScene(title,...)` + `studio.updateScene(participants...)` → `commit(next.links.sceneId=sceneId)`. Si le commit échoue après création, reprise peut **créer une deuxième scène**, éventuellement avec les mêmes notes privées.
3. STUDIO L003 `createScene()` et `updateScene()` déclenchent `void save()` dans une queue asynchrone. Une lecture immédiate peut voir une révision ancienne ; il faut attendre/valider, sans réappliquer l'opération. L003 `setActiveScene()` efface la sélection et transmet `PLAYER_CLEAR` sans `PLAYER_SHOW`.

Ces lignes ont été consultées dans la PR #100 et L003 ; **ce n'est pas un test d'exécution du véritable cycle L004-C**. Les tests locaux reproduisent séparément le défaut d'ACK/partage avec des ports de faute contrôlés et les vraies méthodes STUDIO L003.

## Correctifs uniquement sous propriété 20 STUDIO

- `src/studio/reconcile.mjs` **nouveau** : inspection pure (aucune mutation) de l'état courant et persisté. Vérification source/profile/instance, titre/description/notes/participants, détection `reusable`, `missing`, `unpersisted`, `stale`, `ambiguous`, `conflict`, `needs-participants`. Résultat strictement limité aux statuts/ID, jamais notes ou snapshots. Port générique `inspectCreatorAttachment` destiné à 21, sans écriture sur son cycle.
- `src/studio/demo.mjs` : réemploi de la créature/scène fictive si et seulement si correspondance unique ; refus explicite des ambiguïtés ; aucune nouvelle copie d'instance lors d'un retry ; réconciliation après rechargement ; verification de persistance par le vrai port injecté avec retries bornés du **même snapshot**, sans écraser une révision plus récente. Les prévisualisations et exports RESTORE natifs demeurent inchangés. État occupé signalé immédiatement aux boutons et `aria-live` ; après changement/confirmation de créature, CLEAR joueur sans SHOW automatique.
- Sauvegarde créateur `saveCreatorWithReconciliation` : lecture avant/après `creatorSave`; si accusé perdu mais original descriptif exactement présent dans `extensions.creatorDrafts`, renvoie succès réconcilié sans nouvelle insertion. Si écriture absente/incohérente, refuse et conserve le brouillon. L004-C créateur indépendant possède son propre stockage : **cette correction ne change pas son attachCreature/attachScene** ; 21 doit adopter la réconciliation dans son propre code.
- `src/studio/ux-ardoise-cuivre-or.proposal.css` nouveau **non monté** : proposition couleurs et accessibilité pour 01/21. `CONTRACT.md` clarifie imports et options `creatureProfileId` + `mountCreatorsPort` (port d'injection de test ; production utilise vrai L003).
- `tests/studio/L004_REPAIR_reconciliation.test.mjs` (20 cas), `L004_REPAIR_BROWSER_SCENARIO.py` (QA à exécuter sur vrai HTTP), passations et pièces justificatives.

## Régressions locales réellement exécutées

Depuis `/mnt/data/l004-repair-work`, Node v22.16.0 :

```sh
node --test experiments/dg-lot004/tests/studio/*.test.mjs
# 35 PASS / 0 FAIL / 0 SKIP (15 L004 précédents + 20 nouveaux)
node --test experiments/dg-lot003/tests/studio/*.test.mjs
# 22 PASS / 0 FAIL / 0 SKIP (L003 sources exactes reconstituées depuis ZIP)
node --check experiments/dg-lot004/src/studio/demo.mjs
node --check experiments/dg-lot004/src/studio/reconcile.mjs
python -m py_compile experiments/dg-lot004/tests/studio/L004_REPAIR_BROWSER_SCENARIO.py
```

Les tests L004 montent **les vrais modules STUDIO L003 et L004**, mais les ports `storageFactory`, Bestiaire et `creatorSave` sont injectés en doubles de test ; un stub temporaire des créateurs L003 était nécessaire **uniquement pour résoudre l'import** du module dans ce conteneur isolé. Le stub n'est ni publié dans la PR ni utilisé comme logique métier par les 20 nouvelles régressions (le montage créateurs est explicitement injecté par `mountCreatorsPort`). Les tests 15/15 précédents ne prouvent pas le montage du vrai formulaire ATELIERS dans la démo. L003 22/22 vérifie les modules STUDIO originaux provenant du paquet antérieur, pas un nouveau checkout Git complet.

Cas clé : faux `creatorSave` écrit l'original dans la sauvegarde puis **lance une erreur d'acquittement** ; la vue re-lit ARCHIVES, retrouve une seule fiche, garde **une créature et une scène** aux mêmes IDs, puis un clic répété et un rechargement ne créent pas de second objet. Un `storage.save` en échec avant commit et un état trop ancien provoquent un refus/réparation bornée de la même scène. Acteur/scène divergents sont bloqués et ne sont pas effacés ; les sentinelles privées n'apparaissent pas dans la projection whitelist ni les messages observés du banc, avec `PLAYER_CLEAR` vérifié.

**NON EXÉCUTÉ :** `npm ci`, `npm test` du dépôt complet, build intégré L004, parcours Chromium sur vrai `127.0.0.1:4173/4174`, couplage réel avec ATELIERS PR #100 / ARCHIVES/IndexedDB, QA CI au HEAD intégré, tests physiques/tablette/lecteur écran. `git ls-remote` depuis ce conteneur : DNS vers github.com impossible. Aucun contournement. Ancienne QA L003 PR #91 réussie n'est **pas** une preuve L004 corrigée.

## Statuts de validation

| Exigence | Verdict |
|---|---|
| Code propriétaire STUDIO et tests ciblés sous Node | **PASS local** |
| Comportement fail-closed sur collisions, notes divergentes, ACK perdu | **PASS sur ports de test** |
| Parité STUDIO L003 (22 tests) | **PASS local** |
| Effet numérique, débit mana/charges, règle M01–M05 | **NON MODIFIÉ / NON EXÉCUTÉ** |
| Réparation ATELIERS de l'attachement en deux phases | **BLOQUÉ — propriétaire 21 requis** |
| Persistance et récupération réelle avec ARCHIVES | **NON EXÉCUTÉ** |
| DOM/navigateur et sécurité joueur sur HEAD final de 05 | **NON EXÉCUTÉ** |
| UX ardoise/cuivre/or et accessibilité réelle | **PROPOSITION / NON EXÉCUTÉ** |
| Merge, publication, canonisation | **NON EXÉCUTÉS — interdits** |

## Risques et décision DG

1. Il n'existe **pas de transaction atomique** entre campagne STUDIO et état indépendant CREATORS ; aucune suppression compensatoire automatique n'est sûre. La récupération doit être read-only d'abord et nécessiter confirmation MJ sur un candidat unique.
2. Même source/profil copiée volontairement deux fois ou deux scènes de même titre : **réconciliation ambiguë**, blocage plutôt que correspondance arbitraire.
3. Si la sauvegarde STUDIO asynchrone ne se stabilise pas dans les cinq lectures/écritures bornées, la vue bloque la progression. Le port 04 devrait fournir un vrai `flush`/`saveAndVerifyRevision` versionné si cette limite se manifeste en recette produit.
4. La fiche créateur L003 est conservée dans `extensions.creatorDrafts[].original` ; l'identité descriptive a besoin d'un ID transactionnel durable pour une garantie globale future. Le cycle L004-C possède son propre schéma et ne doit pas être adapté sans 21.
5. La fenêtre joueur ne reçoit que le DTO public par whitelist L003 ; la confidentialité réelle exige encore la recette indépendante sur les deux origines au HEAD assemblé.

**À revoir :** 05 INTÉGRATION, 21 ATELIERS, 04 ARCHIVES, 01 BUILDER, 02 QA, 03 REVUE. **À valider DG/créateur :** montage par 05 et clôture de ce risque après re-tests sur le SHA intégré, sans modifier le candidat P0 initial ni publier.
