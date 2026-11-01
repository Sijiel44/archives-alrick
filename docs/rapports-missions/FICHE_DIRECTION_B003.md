# ARCHIVES D'ALRICK — RAPPORT DE MISSION

**Identification :** B-003 — Faune et écosystèmes des Montagnes de l'Aube, **lots I et II**. **Référent :** Zoologie fantastique et écologie montagnarde. **Date :** 1er novembre 2026 (Québec). **Dépôt :** `Sijiel44/archives-alrick`. **Branche :** `bestiaire/b003-montagnes-aube`. **PR :** [#73, brouillon](https://github.com/Sijiel44/archives-alrick/pull/73). **Commit d'extension Lot II :** [`3ec6e0e`](https://github.com/Sijiel44/archives-alrick/commit/3ec6e0e04b9bb568986c456cd66a508b1885626c). Commit final du rapport et CI sur la tête à contrôler séparément.

**Statut : TERMINÉE AVEC RÉSERVES — lots documentaires soumis à la Direction.** Le socle B-002 est fusionné. Aucun nouveau code, niveau, pouvoir ni espèce de l'Odyssée n'a été adopté ; **aucune publication ou fusion de B-003**.

## Indicateurs mis à jour

| Indicateur | Résultat |
|---|---|
| Espèces régionales nouvellement confirmées | **0** (aucune population propre aux montagnes prouvée par le registre B-002) |
| Créatures de propositions préexistantes réutilisées | **3**, sans duplication ni attribution de canon : Cerf des Brumes froides, Chasses-Faim, Lamproie de nacre |
| Propositions originales | **24** : P01–P12 (lot I) et P13–P24 (lot II), toutes `proposition_non_jouee` |
| Habitats modélisés | **9** milieux H1–H9, sans géolocalisation précise ni code `BIO-` |
| Réseau trophique et matrices | 2 matrices **12 × 9**, liens trophiques inter-lots et impacts humains étudiés |
| Branches évolutives nouvelles | **4 espèces** à formes conditionnelles, 8 autres sans transformation par niveau |
| 5d6 M03 | **21** archétypes indicatifs `faune`, **3** `predateur` ; **0 profil chiffré** ou niveau canonique ; moteur inchangé |
| Codes, publication, images | **0** code ESP/BIO/VARC/P5C, **0** publication et **0** image approuvée |

## Évolution : principes et exemples

La progression 5d6 **n'est ni l'âge ni une transformation biologique automatique**. Des repères narratifs N10–14 et N15–19 peuvent décrire, **pour un individu exceptionnel et sous conditions du milieu**, l'Ardoiselle « Porte-ardoise / Vieille-strate », l'Araignée « Voileuse / Fileuse des brumes », le Luciolume « Lanternière / Couronne pâle » et le Rochebrouteur « Dos-de-cendre / Dos-de-scorie ». Aucun nom de forme n'est un taxon, aucun bonus M03 n'est débloqué. Les huit autres espèces progressent par apprentissage ou cycles biologiques indépendants de l'XP.

## Livrables, contrôles et réserves

**Dossier :** `docs/bestiaire/B003_FICHES/` (**24 fiches**), `B003_SYNTHESE_ECOLOGIQUE.md` (lot I), `B003_LOT_02_SYNTHESE_EVOLUTIONS.md` (lot II), rapport complet `docs/rapports-missions/B003_ECOSYSTEME_MONTAGNES_AUBE.md` et cette fiche. Leurs identifiants P01–P24 sont **locaux**. Le second lot reste dans `docs/`, sans fichier sous `content/`, sans alteration du registre B-002, des modèles ni du moteur M03.

**Vérifications :** comparaison des 24 noms avec les prototypes et individus historiques ; 9 classes de milieu ; relations alimentaires conditionnelles ; limites explicites des formes ; aucune résistance magique inventée, même pour les créatures du plateau volcanique. **La CI de la nouvelle tête doit être vérifiée** ; succès antérieur des 12 premières fiches : [Actions #41328714534](https://github.com/Sijiel44/archives-alrick/actions/runs/41328714534), sur `ff9d16dd` uniquement.

**Réserves :** Atlas, Bible, Compendium, Codex et bruts privés originaux non relus intégralement ; faune et microhabitats supplémentaires non observés en campagne. Aucun profil M03 numérique ni playtest humain : nécessitent un niveau, objectif de rencontre, PJ et terrain concrets.

## Décisions de Direction

**Examiner individuellement les 24 propositions**, confirmer/refuser les 4 lignées évolutives et leurs conditions, vérifier les données des sources primaires et les niches, puis autoriser seulement au cas par cas l'attribution de codes `ESP-` ou `VARC-`. La création de profils 5d6 chiffrés et la publication requièrent une décision distincte.

**Recommandation :** conserver [la PR #73](https://github.com/Sijiel44/archives-alrick/pull/73) en brouillon ; **ne pas fusionner, ne pas publier, ne pas lancer B-004 sans retour explicite de la Direction.**


**Vérification du lot II :** [CI GitHub Actions #41331462555 réussie](https://github.com/Sijiel44/archives-alrick/actions/runs/41331462555) sur le commit `dabd4db4bca7118da4118c2491183629edf4551e` ; contrôle direct **12/12 fiches** avec sections et statuts, **29 nouveaux fichiers sous `docs/`**, aucun sous `content/`. Le commit des rapports de clôture est postérieur et sera vérifié séparément. Ces preuves techniques ne valident pas le contenu canonique.
