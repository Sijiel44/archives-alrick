# FICHE DIRECTION — DATA-MODEL-001.R2 + CORE-COMPAT-001.R2 (11 INDEX)

**Statut : PROPOSITION EXPÉRIMENTALE TESTÉE EN ISOLAT ; PAS D'HOMOLOGATION INTER-RÉFÉRENTS.** Références : INDEX #105@`4f3dffd51f16c0c1881f925a94a677a87feff17c` (enveloppe commune), ATELIERS #102@`85f473d2005903a6fc81d37a83fcc6b3c6d16466` (familles/nœuds), ARCH-STORAGE #104@`f84f8c54361b3701ebb0251700f2d0d09d4acf4d` (prototype de stockage), MATH #99 `e3fcbce49074bfcbe8814842a5ad57d0ba76160d` pour le code métier des suggestions XP.

## Validé localement (preuve directe)

1. **Un seul contrat de données cible** : l'enveloppe v0 de #105 demeure identique ; R2 ajoute uniquement un profil de conformité et un adaptateur de lecture #102, sans migrer l'ensemble des 11 fixtures P1-A.
2. **Définitions/instances/variantes séparées** et `continuity.referenceStatus`, `playedStatus`, `publicationStatus` indépendants. `state.layer` n'est qu'une projection historique compatible, jamais autorité canon/jeu/publication.
3. **Conservation** : 15 sources fictives #102-shaped -> 15 records #105 -> camp P1 candidate -> paquet JSON privé -> retour -> mêmes identités, versions, inconnus, médias restreints et originaux JSON internes ; séparation public/privé par whitelist *candidate*, sans message joueur.
4. **Contrôles** : 112/112 tests Node (58 anciens + 54 R2), jsonschema Draft2020-12 réel 15 cas positifs/9 contre-tests négatifs, les 11 records originaux R1 toujours valides sous leur ancien schéma et **non auto-promus** vers R2.
5. **CORE** : port M01/M03 injecté, no-effect et non-mutation sur entrées; aucune formule M01–M05 recopiée dans INDEX.

## Réservé / non exécuté

- Source #102 réelle : source inspectée en GitHub SHA + blob 14 fixtures, tests locaux effectués sur **15 nouvelles reproductions synthétiques**, non sur les 14 octets d'origine. Adaptateur à recetter aussi sur le lot original avec 21 ATELIERS.
- Stockage P1 #104 : candidat conforme en structure aux interfaces observées, **pas** de test natif IndexedDB/export SHA/transactions de #104 dans ce conteneur ; suite native prête pour clone composite. Les statuts/proofs complets de la PR #104 ne sont **pas** des validations d'INDEX.
- **Avis 04 ARCHIVES absent**, aucune signature ATELIERS, MATH, QA sur le profil R2. PR #104 comporte une réserve QA sur le risque de lecture non atomique snapshot/journal dans deux transactions readonly.
- Contrôle M01 natif via esbuild/CI composite, Chrome MJ/joueur, vrais médias, import patrimonial v2/v3, preuve d'attestation éditoriale, migration, publication : **NON EXÉCUTÉS**.

## Arbitrages à DG

1. Confirmer #105 comme enveloppe **provisoire unique** ; #102 restera un **format source**/UX adaptateur et un profil test, pas un second standard.
2. Valider avec 04 ARCHIVES l'extension privée R2 dans le contrat #104, la preuve octet SHA256/restore, l'autorité de commit, et la réparation demandée par QA avant choix d'architecture B.
3. Demander à 21 ATELIERS l'essai du jeu *source exact* de 14 fixtures #102 et la sémantique précise `nodeType/variantChanges` ; ne jamais transposer de variation narrative en bonus M03.
4. Définir qui peut **attester** canon, publication et faits joués (trois preuves indépendantes), et comment les informations éditoriales historiques restent lisibles sans les réécrire.
5. Demander à 10 MATH l'homologation des ports natifs M01/M03 et à 02 QA les tests de fuite/roundtrip sur l'assemblage. Maintenir séparée et prioritaire la réparation P0 #95.

**Livrables** : `src/model-r2.mjs`, profil JSON Schema réel, fixtures 15, tests 50 + suites natives préparées, comparaison #102/#105, stockage #104, note CORE, passation, logs et manifeste SHA256. Pas de merge, de migration, de changement de formule ou de canonisation.
