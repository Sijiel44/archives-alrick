---
title: "ANT-DECH-012 — Déchus extrêmes et nécromancien historique à authentifier"
date: 2026-11-17
statut: "creation_originale_et_identification_historique_ouverte"
---

# ANT-DECH-012 — Trois ennemis qui choisissent la cruauté

## Éditorial et publication

Trois nouveaux personnages de l'univers partagé, aux oppositions pleinement assumées et sans rédemption promise : **PER-DECH-44 Védran Ossal (niveau 9, Rupture)**, **PER-DECH-45 Mavrine Selcor (niveau 15, Déchéance)** et **PER-DECH-46 Istel Rémor (niveau 20, Abîme)**. Leurs biographies sont publiques, avec trois nouveaux portraits WebP originaux et trois SVG alternatifs sans dépendance réseau. Leurs niveaux ne sont **pas** des profils de combat M01/M03.

L'horreur repose sur les décisions des personnages, les actes commis, les rites délimités et la pyramide de Déchéance. L'obsession surnaturelle ne vaut pas diagnostic de maladie mentale et ne transforme pas tous les pratiquants d'une magie en ennemis.

## Pyramide effectivement constituée

```text
Istel Rémor — N20, Abîme, nécromancien inédit
├─ Mavrine Selcor — N15, Déchéance
│  ├─ Védran Ossal — N9, Rupture, Lieur
│  │  └─ Léda Perne — N4, Fêlure, Chute liée véritable
│  └─ Isen Vartel — N11, Rupture, Lieur
│     └─ Tevan Irsel — Fêlure, Chute liée véritable
└─ Edrive Caln — N16, Déchéance
   ├─ Narem Valet — N11, Rupture, Lieur
   │  └─ Une Chute liée adulte transformée (nom à documenter)
   └─ Fera Niel — N12, Rupture, Lieuse
      └─ Une Chute liée adulte transformée (nom à documenter)
```

Les Chutes liées sont **effectivement transformées par pacte puis liées par tribut** dans le passé nouveau de ces personnages. Les personnes retenues, les gardes et les défunts ne sont pas du tribut par défaut. Les deux derniers noms de victimes de la branche d'Edrive restent **des détails ouverts**, sans obligation d'inventer des fiches avant leur apparition.

## Comment les utiliser en campagne

| Niveau conseillé | Front | Voies de victoire autres qu'un duel |
| --- | --- | --- |
| 2–5 | Péage chassé par Védran | Détour, ferrures remplacées, protection de Léda et témoins |
| 6–10 | Védran sans sa Chute liée | Rite délacé, taxe dénoncée, jugement, fuite surveillée |
| 8–13 | Portes de Mavrine et deux Lieurs | Nouveaux accès, anciens plans de sas, tribut rompu branche par branche |
| 14–20 | Pyramide d'Istel et cérémonies volées | Registres restitués, corps rendus, sel neutralisé, deux branches libérées |

La destruction des corps animés ne fait pas cesser toute la Déchéance ; l'annulation d'un tribut ne réanime ni n'endommage physiquement une porte. La sécurité des vivants, la restitution des dépouilles et la liberté des liés restent prioritaires.

## Dossier distinct : nécromancien rencontré par Alrick/Orin

**Statut : identifié par le témoignage du créateur, détails non vérifiés dans les sources disponibles.** Le créateur se souvient d'un praticien nécromancien rencontré au début de la campagne et d'un être ou objet ramené à la vie, sans en retenir la nature. Il serait trompeur d'inventer son nom, sa cible, ses intentions ou une Déchéance surnaturelle.

Vérifications entreprises :

1. Recherche `nécroman`, `nécromanc`, `ressuscit`, `réanim`, `mort-vivant`, `squelette`, `relevé` parmi les Markdown publics et les chroniques de début de campagne : aucun passage permettant de l'identifier avec certitude.
2. Source `sources/campagnes/README.md` : les quinze documents de campagne **sont recensés** mais leurs originaux et transcriptions ne sont **pas intégrés** dans `main`.
3. Vérification de la tête historique de la PR #77 LORE : aucun original CB01 n'est présent sous `sources/campagnes` dans l'arbre consulté.

**À rechercher en priorité :** CB01, premières scènes de rencontre ; nom ou description de l'homme, lieu de la confrontation, nature de l'être animé, différence entre apparence de résurrection et vie effectivement restituée, issue attestée de la rencontre. Si un passage est retrouvé, créer une fiche distincte avec statut de source, ancrage de paragraphes exact, continuité de l'Odyssée et un avertissement adapté. **Ne pas fusionner rétroactivement Istel avec ce personnage.** Un nécromancien n'est pas automatiquement Déchu : une Chute surnaturelle doit être établie séparément.

## Contrôles d'intégration

- Fiches publiques avec codes 44–46, portraits WebP et compagnons SVG ; catégories et liens correspondants.
- Catalogue antagonistes Studio à **46** entrées, empreintes Git de chaque fiche exactes et position narrative ajustable dans les copies MJ.
- Aucun nouveau profil 5d6 chiffré ni exposition de notes privées de campagne.
- `npm test` et CI GitHub Actions sur la tête de PR ; recette Studio Chrome, contrôle des médias et publication Pages après fusion.

**À revoir par :** LORE pour l'identification de l'ancien nécromancien ; INDEX/MATH pour tout profil de combat futur. **À valider par DG/créateur :** toute assimilation ultérieure du nécromancien historique à la Déchéance.
