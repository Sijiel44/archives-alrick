# Enchaînement P1-R2 → ARCH-STORAGE-001 (#104), risques et avis

**Source épinglée** : PR #104@`f84f8c54361b3701ebb0251700f2d0d09d4acf4d`, module `src/contracts.mjs` blob `5e59f024efb4cc578af71fbe6bacdec984075148`, module `src/private-archive.mjs` blob `07f842ebcb6e2d0a5e2b7264d5a6c284d187c3d8`, `src/idb-store.mjs` blob `967ebc052a448ff54c3806379160e73117afaf11`.

**Ce que fait le pont R2 exécuté localement :** 
1. `validateR2Dataset` vérifie chaque définition, instance, variante, famille, participants et vérité des trois couches.
2. `makeArchStorageCandidate` produit un **objet de campagne candidat** `cer.arch-storage001.campaign.proposal.v0`, avec `characters`, `catalogReferences`, `instances`, `scenes`, `privateNotes` et **tous les originaux** dans `extensions.indexP1R2.records` ; sans accès IndexedDB, sans numéro de révision changé, sans journaux fabriqués.
3. `recoverArchStorageCandidate` restitue l'extension **privée** et relance les validateurs R1/R2 ; `exportR2Private/importR2Private` contrôlent en parallèle le round-trip JSON #105.
4. L'outil **réel** #104 devra ensuite appeler `assertCampaign`, `makePrivateArchive`, `inspectPrivateArchive`, `openStore.previewImport` puis `commitImport` *avec consentement explicite et instance isolée*. Ces appels ne sont pas faits par INDEX ; `native-storage-on-assembled-clone.test.mjs` les teste lorsque les trois branches sont assemblées au SHA épinglé.

**Tests locaux réalisés :** 15/15 fiches, conservation de 15 identités/versions/provenances et inconnus, paquet JSON privé et restitution sémantique équivalente, candidat P1 structuré 3 PJ/1 créature/1 scène/1 note privée, aucune mutation. **Non réalisés :** vrais appels `#104 assertCampaign/makePrivateArchive/inspectPrivateArchive`, transactions IndexedDB, exactitude octet des archives P1, multi-onglet, moteur Chrome joueur/MJ.

### Avis et réserve ARCHIVES

**Aucun avis formel de 04 ARCHIVES sur ce contrat R2 n'est reçu ni inventé.** La PR #104 est une proposition BUILDER/ARCH-STORAGE à revoir par 04. Ses essais initiaux Chrome sont rapportés dans `docs/RESULTATS_CI_P1A.md`, run `42301287493` à un autre HEAD source `e0ade126...` ; ne pas confondre source de test et HEAD documentaire f84.

Contre-audit indépendant **QA sur #104**, commentaire [6701371690](https://github.com/Sijiel44/archives-alrick/pull/104#issuecomment-6701371690) : 10/10 B01–B10 PASS et simulations de courses réussies, **mais risque statique réel** : `idb-store.mjs` lit campagne et journal via **deux transactions readonly distinctes** dans `exportPrivate()`. 14 exports concurrentiels sans corruption observée ne prouvent pas l'atomicité. QA demande à BUILDER une transaction readonly unique et un test d'intercalation avant validation de l'architecture. INDEX ne répare pas ce code propriétaire.

**Questions explicites à 04 ARCHIVES :**
- Quelle enveloppe finale authentifie l'octet source, l'empreinte SHA256 et le Git blob (SHA1), sans les confondre ?
- Le pont `extensions.indexP1R2.records` est-il une extension acceptable **en laboratoire seulement** ? Son coût mémoire et sa limite de taille doivent-ils exclure médias bruts ?
- Le format public restera-t-il une projection whitelist de STUDIO (et jamais le paquet privé, même sous clé `visibility`) ?
- Après réparation du problème de lecture non atomique, quelle preuve assure snapshot+journal+rev monotones pour le lot complet ?
- Quelle procédure de restauration/révision conserve les inconnus et anciens formats v2/v3, sans réécriture ni perte de byte original ?

**Décision proposée à DG** : autoriser **l'étude de l'interface**, pas la promotion de l'option B comme stockage officiel ; demander avis explicite 04 ARCHIVES + 01 BUILDER + 02 QA sur données de sauvegarde réelles seulement après contrat validé.
