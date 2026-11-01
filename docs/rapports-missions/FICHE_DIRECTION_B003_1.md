# ARCHIVES D'ALRICK — RAPPORT DE MISSION

**Mission :** B-003.1 — Consolidation, validation encyclopédique et canonisation du premier Bestiaire des Montagnes de l'Aube  
**Référent :** Zoologie fantastique, continuité encyclopédique et écologie  
**Date :** 1er novembre 2026  
**Branche :** `bestiaire/b003-montagnes-aube` — **PR :** [#73](https://github.com/Sijiel44/archives-alrick/pull/73), brouillon, non fusionnée  
**Commit final et nouvelle CI :** à renseigner après les dernières écritures et le contrôle GitHub  
**Statut :** partiellement réalisée — revue technique et arbitrages éditoriaux en attente

## Chiffres clés

| Indicateur | Bilan |
| --- | ---: |
| Fiches examinées et classées | **41/41** |
| Candidatures A+B à un examen favorable de principe (non adoptées) | **36** |
| Classes D à approfondir ; E à arbitrer | **4 ; 1** |
| Espèces explicitement approuvées | **0** |
| Codes permanents attribués et validés B-002 | **0** |
| Trajectoires évolutives réconciliées, non canonisées | **9** |
| Variantes `VARC-` formellement approuvées | **0** |
| Illustrations listées / binaires retrouvés dans la PR | **5 récupérées localement / 0 dans la PR** |
| Fiches publiées à l'issue de B-003.1 | **0** |

## Réalisations et preuves

Règle d'autonomie du monde ajoutée au contrat éditorial : canoniser une espèce **sans** apparition dans l'Odyssée est légitime après **décision explicite** ; `lore_valide`, `faits_joues`, `proposition_non_jouee` et `publish` sont distincts. Matrice P01–P41, protocole de validation, synthèse des habitats H1–H9, réconciliation des neuf formes, inventaire des cinq images et test du catalogue créés. Aucun moteur M01–M05 modifié. La [CI initiale #41339213656](https://github.com/Sijiel44/archives-alrick/actions/runs/41339213656) était verte sur **B-003 avant B-003.1**, pas sur ces nouveaux fichiers.

## Réserves, décisions requises

- Décider de l'existence/du statut de chacune des 41 propositions (éventuellement par lot explicitement défini) ; confirmer la portée de chaque accord, sans aucun événement joué inventé.
- Arbitrer **P12 ↔ P38** (poissons de Nacrecombe), les niches de lac H6 et les microrefuges H8 de Forgeciel ; ne pas coder les habitats H1–H9 comme `BIO-` sans décision.
- Les cinq images P37–P41 ont été **récupérées dans un Word historique** et rapprochées des fiches ; vérifier encore auteur, licence et droit de diffusion publique avant intégration : **0/5 dans GitHub à ce stade**.
- La branche a été trouvée **91 commits derrière `main`** au début de la mission : réconciliation et nouvelle CI nécessaires avant fusion.

## Décision recommandée

**Recevoir le dossier pour revue, garder la PR #73 en brouillon.** Ne pas fusionner ni publier et ne pas commencer B-004. Autoriser B-004 seulement après retour du Directeur du Bestiaire et clarification des validations, des données et des contrôles. Rapport permanent : `docs/rapports-missions/B003_1_VALIDATION_CANONISATION_BESTIAIRE.md`.
