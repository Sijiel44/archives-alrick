# B-003.1 — Rapport technique de consolidation, validation encyclopédique et canonisation du premier Bestiaire des Montagnes de l'Aube

**Date :** 1er novembre 2026 — **Référent :** Zoologie fantastique, continuité encyclopédique et écologie — **Dépôt :** `Sijiel44/archives-alrick` — **Branche :** `bestiaire/b003-montagnes-aube` — **PR propriétaire :** [#73](https://github.com/Sijiel44/archives-alrick/pull/73) (brouillon, non fusionnée).

## 1. Périmètre et état initial constaté sur GitHub

La PR #73 présentait 48 fichiers : 41 propositions P01–P41 en quatre lots, leur README, synthèses et rapports B-003. Le commit de référence était `e41e02648361766a7ae3ae136d9b16c34dbdcd1a`. La [CI antérieure #41339213656](https://github.com/Sijiel44/archives-alrick/actions/runs/41339213656) s'est terminée avec succès sur **ce commit antérieur**, et **ne prouve pas encore les modifications B-003.1**. État constaté : PR ouverte et brouillon ; `main` et branche **divergés**, 11 commits de la branche en avance et **91 commits en retard** lors du premier contrôle. Pas de fusion réalisée, pas de publication automatique.

## 2. Sources réellement contrôlées

- `CONTRAT_EDITORIAL.md`, `docs/bestiaire/B001_REGISTRE_INITIAL.json`, `B002_REGISTRE_RELATIONS.json`, `B002_CODES_VALIDES.json`, `B002_SPEC_INTEROPERABILITE.md`.
- Les **41 fiches** `docs/bestiaire/B003_FICHES/P01_*.md` à `P41_*.md`, les synthèses écologiques et évolutives des lots II–IV et le rapport B-003.
- `modeles/creature-espece.md`, les règles et contrats M03/M05, le script B-002 et la configuration `package.json`.
- Les fiches `content/lieux/GEO-001.md`, `GEO-009.md`, `GEO-010.md`, `GEO-012.md`, `GEO-013.md`, et les références documentaires des prototypes.

**Limite des sources :** les volumes primaires complets V01–V06 et tous les bruts de campagne ne sont pas attestés comme relus intégralement dans cette mission. Les GEO sont des résumés/documentations secondaires faisant autorité sur les décors indiqués ; ils ne prouvent pas la faune nouvelle. Le monde autonome peut être enrichi par décision explicite du créateur sans scène jouée.

## 3. Audit P01–P41 et décisions individuelles

**41/41 fiches vérifiées et rangées en cinq classes provisoires.** Le détail, les milieux, les rôles, les réserves, les sources et les lignes de décision figurent dans `docs/bestiaire/B003_1_MATRICE_VALIDATION_ESPECES.md`.

| Classe | Total | Portée |
| --- | ---: | --- |
| A — espèce originale distinctive | **9** | P21, P22, P23, P24, P35, P36, P37, P39, P40 : étude d'adoption possible |
| B — faune ordinaire locale | **27** | Présence locale et dénomination à décider ; un taxon nouveau n'est pas imposé |
| C — variante régionale justifiée | **0** | Aucune parenté régionale prouvée |
| D — approfondissement | **4** | P11, P34, P38, P41 : problèmes de microhabitat ou de ressources |
| E — rapprochement à arbitrer | **1** | P12 face à P38 et aux poissons génériques de Nacrecombe |
| **Total** | **41** | Tous `proposition_non_jouee`, tous hors publication |

**36/41** (classes A+B) sont des candidates à un examen favorable **de principe**, **0/41** approuvée par le créateur dans le dossier consulté, **0 nouveau code** attribué et **0 profil chiffré**. Le classement d'expertise **n'est pas l'approbation**. Il n'existe aucune scène jouée nouvellement attestée.

### Recouvrements et incohérences

- **P12/P38 :** deux propositions de poissons souterrains à confronter. Leur niche, taille et besoin énergétique peuvent différer ; aucun doublon supprimé automatiquement.
- **H8 Forgeciel :** P11, P24, P32, P33 et P41 demandent des zones refroidies et une chaîne de ressources ; un plateau volcanique attesté n'implique pas une niche particulière canonique.
- **H6 Nacrecombe :** flux de matière/oxygène nécessaire à P23/P34/P38 et aux populations ; les poissons génériques sont attestés par GEO-010, pas les espèces détaillées.
- **P21/P35/P37 :** herbivores montagnards distincts à surveiller pour la compétition et la productivité.
- **H5 Dornaël :** débit, barrages, frayères et qualité d'eau conditionnent les liens hypothétiques P06/P07/P15/P30/P31.
- **Prototypes historiques :** Cerf des Brumes froides, Chasses-Faim et Lamproie de nacre restent distincts, sans propagation automatique de pouvoirs.

## 4. Canon et identifiants B-002

La directive « Autonomie du monde et canonisation du vivant indépendamment de l'Odyssée d'Orin » a été ajoutée au `CONTRAT_EDITORIAL.md`. Une espèce peut être `lore_valide` sans `faits_joues` ; une migration ou une rencontre reste hypothétique/non jouée si elle n'est pas validée. Approbation explicite individuelle ou de lot délimité, toujours traçable par fiche. L'approbation **du principe** ne vaut pas celle des 41 propositions. `B002_CODES_VALIDES.json` conserve `attributions: []` ; aucun `ESP-`, `BIO-`, `VARC-`, `INDC-` ou `P5C-` n'a été émis.

## 5. Réconciliation des neuf trajectoires

P21, P22, P23, P24, P28, P30, P34, P35, P36 : examen individuel dans `B003_1_RECONCILIATION_EVOLUTIONS.md`. Dominantes : croissance naturelle des plaques/coquilles/cornes/antennes, apprentissage de toiles et passages, statuts de chef/veilleur, et réserve pour P24. Aucun palier N10–14/N15–19 ne force une évolution ; niveau 5d6 ≠ âge biologique. **0 variante validée**, pas de refonte mécanique.

## 6. Écologie et cinq illustrations

La synthèse `B003_1_ECOSYSTEME_CONSOLIDE.md` rapproche H1–H9, ressources et réseaux alimentaires et conserve les arêtes trophiques au statut d'hypothèses. Les habitats ne sont pas des `BIO-` ; cartographie fine non attestée.

`B003_1_ILLUSTRATIONS.md` inventorie P37–P41. **0/5 fichiers JPEG réellement présents** dans la branche. Le Word historique **B003_LOT_IV_BESTIAIRE_ILLUSTRE.docx** a finalement été retrouvé dans la Bibliothèque de l'utilisateur ; **5/5 JPEG extraits**, tailles 1055 × 1491, cinq SHA-256 distincts et correspondance visuelle générale vérifiée (voir B003_1_ILLUSTRATIONS.md). **0/5 dans la PR publique** : l'auteur, la licence et l'autorisation de dépôt public sont toujours à établir. Ne jamais déclarer une illustration intégrée à GitHub tant que les octets n'y sont pas.

## 7. Livrables et contrôles

- `CONTRAT_EDITORIAL.md` enrichi ; matrice de validation, protocole de canonisation, réconciliation d'évolutions, écologie consolidée et audit graphique créés sous `docs/bestiaire/`.
- `scripts/test-b0031-catalogue.mjs` ajouté et `npm run test:b0031` inséré à la fin de `npm test` dans `package.json`. Il contrôle les 41 identifiants, la présence des statuts de brouillon, H1–H9, les neuf évolutions, l'inventaire des cinq images, l'existence des liens image locaux et l'absence d'attribution permanente sans preuve.
- Aucun fichier du moteur M01–M05 ni des droits d'accès M05 modifié intentionnellement. Tests M03/M05 et recette navigateur du workflow à confirmer sur le **nouveau commit** B-003.1 ; une ancienne CI réussie n'est pas une preuve de cette livraison.

## 8. Anomalies ouvertes et arbitrages Direction

1. **Synchronisation Git** : branche retardée de 91 commits sur `main` au premier constat ; résolution d'une éventuelle divergence nécessaire avant fusion. Ne pas masquer le problème par un faux merge.
2. **Autorité éditoriale** : 0 décision individuelle ou collective reçue ; 41 décisions en attente ; quatre approfondissements et un rapprochement prioritaire.
3. **Illustrations** : les cinq octets ont été récupérés depuis le Word antérieur (hors GitHub) ; confirmer leur provenance juridique et l'autorisation de diffusion publique avant tout dépôt, puis soumettre le statut graphique et la publication séparément.
4. **Écologie** : vérifier les habitats H6/H8 et les corridors avant assignation `BIO-`.
5. **Mécanique 5d6** : aucun profil de combat chiffré ni évolution automatique ; tester uniquement si une future décision définit les individus et les niveaux pertinents.
6. **Sources primaires** : croiser les volumes complets et les campagnes brutes accessibles avant d'attribuer un caractère « attesté » ; l'absence de scène jouée n'est **pas** un blocage canonique.

## 9. Recommandation

**Soumettre B-003.1 à revue avec réserves ; ne pas fusionner ni publier PR #73 à ce stade.** Attendre (a) CI réussie du commit B-003.1, (b) réconciliation propre avec `main`, (c) décisions éditoriales enregistrées et (d) arbitrages d'illustrations et de biomes selon leur portée. La mission **ne démarre pas B-004** et fournit seulement les prérequis documentaires : classification validée, atlas des niches, grille des formes, règles de preuve et tests.
