# ARCHIVES D'ALRICK — RAPPORT DE MISSION

**Identification :** B-003 — Faune et écosystèmes des Montagnes de l'Aube. **Référent :** Zoologie fantastique et écologie montagnarde. **Date :** 1er novembre 2026 (Québec). **Branche :** `bestiaire/b003-montagnes-aube`. **PR :** [#73, brouillon](https://github.com/Sijiel44/archives-alrick/pull/73). **Commit initial des fiches :** [`5ea2dbf`](https://github.com/Sijiel44/archives-alrick/commit/5ea2dbf9291ca477c77fa920cce37ab429a0857e) ; tête finale à consulter sur la PR.

**Statut : TERMINÉE AVEC RÉSERVES — pour validation de Direction.** B-002 (#67) a été fusionnée ; ses préfixes sont autorisés mais aucun nouveau code d'espèce n'a été individuellement approuvé. **Aucune fusion, canonisation ou publication de B-003.**

## Résultats

| Indicateur | Bilan |
|---|---|
| Espèces canoniques régionales déjà attestées dans B-002 | **0 identifiée** ; le registre B-001 contient des individus et des propositions, pas un inventaire d'espèces |
| Prototypes anciens réemployés sans duplication | **3** : Cerf des Brumes froides, Chasses-Faim, Lamproie de nacre ; toujours `proposition_non_jouee` |
| Nouvelles propositions | **12** fiches P01–P12, dont une majorité d'animaux ordinaires ou peu dangereux ; **0 nouveau code ESP** |
| Milieux analysés | **9** classes H1–H9 : vallées, éboulis, plateaux, crêtes, torrents/lacs, lac souterrain, galeries, plateau volcanique, cols et routes |
| Synthèse écologique | Réseau trophique, matrice 12 × 9, ressources, cycles saisonniers, interactions routes/agriculture/pêche/forges |
| Profils 5d6 | **0 profil chiffré** ; 11 pistes `faune`, 1 `predateur` ; aucun niveau canonique ni pouvoir nouveau |

**Créations remarquables à examiner :** salamandre des pierres tièdes (microrefuges humides sur le plateau volcanique, *non confirmés*) et poisson pâle des profondeurs (forme nouvelle proposée pour les poissons déjà mentionnés dans le lac de Nacrecombe). Aucun pouvoir magique attribué.

## Vérifications et limites

Les sources présentes dans Git ont été confrontées : GEO-001, GEO-009/010/012/013, Atlas dérivé, B-001/B-002, gabarits, contrat éditorial, bestiaire existant, échelle 1–25 et contrats M03–M05. La géographie établie a été séparée des extrapolations : **ne pas attribuer à la montagne les bovins du Relais des Hautes-Pâtures, dont la région n'est pas fixée** ; ne pas transformer dragons et compagnons particuliers en espèces sauvages. Les nouveaux documents sont dans `docs/bestiaire/B003_FICHES/` et `docs/bestiaire/B003_SYNTHESE_ECOLOGIQUE.md`, hors publication Quartz ; aucun `content/`, M03, M05, registre ou image modifié.

**Réserves :** les volumes originaux Bible/Atlas/Compendium/Codex et les bruts ne sont pas intégralement disponibles dans l'arbre Git ; leurs passages doivent être relus avant adoption. Aucun test de combat 5d6 numérique ni playtest humain n'a été exécuté, faute de rencontre/niveau définis. **CI confirmée VERTE** : [Actions #41328571151](https://github.com/Sijiel44/archives-alrick/actions/runs/41328571151) sur le commit [ff14df60](https://github.com/Sijiel44/archives-alrick/commit/ff14df60eec319b3d79cc281fd53762d52820315), job contenu/TypeScript/build/liens. Les contrôles automatiques ne constituent ni playtest ni approbation zoologique. Les rapports mis à jour ensuite ont leur propre commit, à contrôler distinctement.

## Arbitrages requis

**Direction/créateur :** valider, corriger ou refuser individuellement les douze espèces ; confirmer les niches et les microhabitats de Dornaël, Nacrecombe, Forgeciel et Keldrun ; décider de l'intégration éventuelle des trois prototypes antérieurs ; vérifier les sources originales ; n'attribuer de code `ESP-` qu'après validation et inscription formelle B-002 ; réserver toute publication, illustration et tout profil 5d6 à des décisions séparées.

**Livrables permanents :** `docs/rapports-missions/B003_ECOSYSTEME_MONTAGNES_AUBE.md`, `docs/rapports-missions/FICHE_DIRECTION_B003.md` et fiche Word `FICHE_DIRECTION_B003.docx` remise dans la conversation.

**Recommandation :** conserver la PR #73 en brouillon pour revue. **Ne pas lancer B-004 avant retour de Direction.**
