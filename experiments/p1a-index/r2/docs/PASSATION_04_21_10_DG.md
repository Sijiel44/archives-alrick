# Passation opératoire (À CENTRALISER PAR DG) — P1 DATA-MODEL-001.R2 / CORE-COMPAT-001.R2

**INDEX auteur** : nouvelle branche propre à la mission, basée sur #105@`4f3dffd51f16c0c1881f925a94a677a87feff17c`. Les dépendances #102@`85f473d2005903a6fc81d37a83fcc6b3c6d16466`, #104@`f84f8c54361b3701ebb0251700f2d0d09d4acf4d`, #97@`d071842639d0adc952dedf3e279c6a1b7004855c` sont des sources figées et non modifiées. La PR #95 demeure propriété de 05.

**À 21 ATELIERS** — Prendre les vrais 14 records `DATA_MODEL_001_FIXTURES.proposal.json` blob `577ffaf0fecefb553db3feecf218a8d5bd936382`, les faire passer à `adaptAteliers102`, comparer les originaux privés par `recoverAteliers102`, puis relever les divergences exactes de champs `variantChanges/state.current/mechanics/media`. Les 15 synthétiques locaux ne sont PAS une certification de ce lot. Vérifier le parcours création -> variante -> instance, état vide et erreurs. Ne pas inventer un bonus pour l'objet.

**À 04 ARCHIVES** — Avis écrit attendu : (a) enveloppe JSON privée #105 R2 utilisable comme *extension* `indexP1R2` ou non ; (b) conservation source/version/Git SHA vs SHA256 d'octets ; (c) transaction unique pour snapshot/journal dans #104 selon risque QA [#6701371690](https://github.com/Sijiel44/archives-alrick/pull/104#issuecomment-6701371690) ; (d) preview/commitImport non destructifs, collisions et quotas ; (e) autorité et retrait d'attestation éditoriale. L'absence d'avis ne vaut pas approbation.

**À 10 MATH** — Sur clone complet, exécuter `node --test experiments/p1a-index/r2/tests/native-core-on-assembled-clone.test.mjs` ; brancher exclusivement M01 `progressionAtLevel`, faire vérifier M03 `previewM03` par COMBAT, conserver `absorption`/objets chiffrés bloqués, aucun gain XP auto ni formule additionnelle. Confirmer le SHA native. Pas de calcul des caractéristiques dans l'enveloppe INDEX.

**À 01 BUILDER et 20 STUDIO** — Assembler la suite `native-storage-on-assembled-clone.test.mjs` et appeler `#104 assertCampaign`, `makePrivateArchive`, `inspectPrivateArchive`; ne jamais transmettre `extensions.indexP1R2` au joueur. Garder la whitelist officielle STUDIO distincte, aucune construction de DTO public depuis l'archive privée.

**À 02 QA / 03 REVUE** — Sur SHA composite exact, exécuter 58 R1 + 54 R2, 15/9 JSON Schema, 2 suites natives, Chrome inter-origines et corruptions archive / collisions / sessions. Attendre le feu vert sécurité avant toute interface publique.

**À 00 DG (décisions)** — (1) maintenir #105 unique enveloppe expérimentale, (2) autorité éditoriale et journal de preuve externe, (3) contrat de stockage P1 et transcodages explicites, (4) statuts médias/droits, (5) ports natives et limites versions. Ces passations sont rédigées ; aucune lecture de chaque référent n'est présumée.
