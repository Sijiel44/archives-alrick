# 21 🎨 ATELIERS — P0-OWNER-SUPPORT-001 / S07 et S09 (2026-11-06)

**Portée :** strictement `experiments/dg-lot004/src/creators/cycle-state.mjs`, tests et présente fiche. Réparation du **port natif navigateur** `createBrowserCyclePersistence`, non du pont intégrateur `tools/creator-persistence.mjs` de 05, non du stockage ARCHIVES L003. Aucun changement #95, M01–M05, Quartz, canon ou Pages.

## Source exacte du défaut
- **Candidat soumis aux tests :** #95@`3b3cdd457365c3267f0faa0683ebcc846d602013`.
- **Run :** https://github.com/Sijiel44/archives-alrick/actions/runs/42340615624 ; job `128307256514` ; `testedHead=checkoutHead=3b3cdd457365c3267f0faa0683ebcc846d602013`.
- **Banc d'origine intact** : `experiments/dg-lot004/tests/storage/P0_STORAGE_SUPPORT_REAL.test.mjs`, Git blob **`791d6420355acdbc3294b87fe876707ce9760163`**, SHA256 de contrôle **`d89dea819a387dc9fdc5b61dfdaf62bc7e17aed3d930576f57cd2da4db3259b5`** (étape GitHub `sha256sum --check` OK).
- Résultat du banc : **9 exécutés / 5 PASS / 4 FAIL**, S03, S07, S08, S09. Les étapes Node propriétaires et Chrome avaient réussi ; cela ne qualifie pas la suite stockage.
- **Avant correctif ATELIERS** : #100@`ceb316e00d667ba9d5155822fd57cabc931f3380` et blob `cycle-state.mjs` `5554b3b12728f0e63388beccec2c58b29b214281`.

### S07 — clé créateurs étrangère
Test original : `P0-S07 foreign creator key MUST remain untouched`. `createBrowserCyclePersistence.save()` validait le cycle à écrire, **mais ne relisait jamais l'ancienne valeur**. Avec `FOREIGN_CREATOR_BACKUP` sous `cer.dg004.creators.private.demo.v0`, l'appel écrasait la clé et rendait `{saved:true}`. **Cause native avérée**, indépendamment de tout montage UI.

**Correctif** : lecture préalable ; si valeur opaque/invalidable → refus sans `setItem` ; si cycle valide de **différent ID**, refus de propriété ; si même ID mais instance n'ayant **jamais relu** cette clé, refus de remplacement faute de preuve locale. Aucun rollback, effacement, création STUDIO ou lecture joueur.

### S09 — deux instances, même révision obsolète
Test original : `P0-S09 two tabs creator stale revision MUST be rejected`. Deux adaptateurs A/B lisent révision 0 ; A écrit révision 1, B tente révision 1 avec contenu différent. Le code ancien écrivait B sans contrôle.

**Correctif** : chaque instance mémorise les **octets texte exacts précédemment observés** sur un `load/save` confirmé. Avant un `save`, elle relit la valeur actuelle : si elle a changé depuis l'observation, refuse `stale revision` ; si la révision saute, régresse ou si le même numéro désigne un autre contenu, refuse. `setItem` est suivi d'une relecture exacte : en cas de divergence, aucun accusé `{saved:true}`. Une disparition après observation reste un conflit. Une sauvegarde identique de même révision est idempotente, sans créer de deuxième identité.

**Point de sécurité primordial :** il s'agit d'une **détection de révision obsolète pour des écritures séquentielles**, **PAS** d'un compare-and-swap atomique entre onglets. `localStorage.getItem` suivi de `setItem` **n'est pas transactionnel** ; deux onglets/processus non coopératifs peuvent encore concourir entre lecture et écriture. Ni verrou localStorage, ni transaction distribuée, ni exclusion garantie ne sont revendiqués. Pour une vraie exclusion inter-onglets, 05/04 doivent conserver ou qualifier un adaptateur sous Web Locks coopératifs ou transaction IndexedDB avec `expectedRevision` et garanties prouvées. Ne jamais utiliser ce port brut comme certification de concurrence.

## Port natif vs pont de démonstration #95
Sur #95@`3b3cdd…`, `tools/demo-runtime.mjs` Git blob `d53cbe20adae2f6ad21843855465d1b4c409b8ab` injecte **`createGuardedCreatorPersistence`** depuis `tools/creator-persistence.mjs` blob `5ff365d6233765d6bf4b34a0dbc77e1b154a20f3`. Le pont 05 utilise un autre format **`cer.dg004.creators.demo-owned.v1`**, clé propre, empreinte SHA-256, revision CAS et `navigator.locks` **obligatoires**. Il bloque d'ores et déjà un backup étranger avant montage et n'est **pas** la fonction native testée directement par S07/S09.

Ne pas remplacer ce pont par le fallback `createBrowserCyclePersistence` sous prétexte qu'il passe les deux cas séquentiels. Les protections et la propriété du pont intégrateur relèvent de 05 ; ses garanties doivent être prouvées séparément par Chrome et les tests de concurrence.

## Tests avant/après et limites
1. Exécution isolée V8 des **deux fonctions de test S07/S09 textuellement extraites du banc ORIGINAL du #95**, injectant la vraie fonction native de chaque blob :
   - **AVANT** `5554b3…` : S07 FAIL (écrasement) / S09 FAIL (dernier écrivain B).
   - **APRÈS** `c55558…` : S07 PASS (ancienne clé intacte) / S09 PASS (A conservé, refus B).
2. Tests propriétaires ajoutés dans `tests/creators/cycle-state.test.mjs` : **7 nouveaux cas** (clé opaque, cycle valide autre ID, absence de relecture, deux adaptateurs, même révision/saute révision, disparition/readback, journal privé + clé ARCHIVES étrangère préservés).
3. Exécution isolée des **fichiers source et tests GitHub exacts** en V8 : **58 tests enregistrés, 57 PASS, 1 non exécutable** (SHA-256 `crypto.subtle` natif indisponible dans cet isolat). **Ce résultat n'est pas un run Node / CI / Chrome.**
4. Le banc neuf de 9 tests sur HEAD composite modifié n'a **pas été exécuté** ; seuls les deux cas originaux S07/S09 l'ont été en ciblage natif via V8. Ne pas annoncer **9/9**.
5. Les défauts **S03/S08** relèvent de **04 ARCHIVES** et sont laissés visibles / non corrigés par 21.

## Passation 05 / 04 / DG
- 05 : recopier **uniquement les nouveaux blobs** `src/creators/cycle-state.mjs` et `tests/creators/cycle-state.test.mjs` de #100 HEAD actualisé ; garder les adaptateurs/demo et workflow de 05 propriétaires, actualiser le manifeste de SHA et rejouer les **9 tests d'origine inchangés**, `node --import tsx --test experiments/dg-lot004/tests/storage/P0_STORAGE_SUPPORT_REAL.test.mjs`, puis Node propriétaire et Chrome sur le **même HEAD**.
- 04 : corriger et tester indépendamment S03 et S08 sur son port sans changer les tests/assumptions S07/S09. Exclusion inter-onglets réelle à décider/prouver avec 05/DG ; pas de garantie atomique par `localStorage` seul.
- DG/QA : attente d'un nouveau composite et de preuves exactes. **Aucune homologation**, merge, canonisation, Pages ou publication.
