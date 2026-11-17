---
title: "ANT-DECH-012 — Déchus extrêmes et raccord éditorial d'Istel avec l'Odyssée"
date: 2026-11-17
statut: "creation_originale_et_raccord_identitaire_approuve_scene_source_ouverte"
---

# ANT-DECH-012 — Trois ennemis qui choisissent la cruauté

## Éditorial et publication

Trois nouveaux personnages de l'univers partagé, aux oppositions pleinement assumées et sans rédemption promise : **PER-DECH-44 Védran Ossal (niveau 9, Rupture)**, **PER-DECH-45 Mavrine Selcor (niveau 15, Déchéance)** et **PER-DECH-46 Istel Rémor (niveau 20, Abîme)**. Leurs biographies sont publiques, avec trois nouveaux portraits WebP originaux et trois SVG alternatifs sans dépendance réseau. Leurs niveaux ne sont **pas** des profils de combat M01/M03.

L'horreur repose sur les décisions des personnages, les actes commis, les rites délimités et la pyramide de Déchéance. L'obsession surnaturelle ne vaut pas diagnostic de maladie mentale et ne transforme pas tous les pratiquants d'une magie en ennemis.

## Pyramide effectivement constituée

```text
Istel Rémor — N20, Abîme, identifié par choix du créateur au nécromancien de la première Odyssée
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

## Décision de continuité : Istel et le nécromancien rencontré par Alrick/Orin

**Nouvelle décision explicite du créateur — 17 novembre 2026 : Istel Rémor sera le nécromancien qu'Alrick a rencontré au début de l'Odyssée.** Le créateur souhaite pouvoir le faire revenir dans son récit. Il s'agit d'une **attribution d'identité éditoriale rétrospective**, légitime comme nouvelle création, et non d'une preuve documentaire sur ce que disait la scène d'origine. Le souvenir du créateur porte sur un praticien qui aurait ramené quelque chose ou quelqu'un à la vie, sans objet ou être identifié. Il serait trompeur d'en déduire une résurrection véritable, un lieu, un nom prononcé ou des rapports précis avec Alrick.

Vérifications entreprises :

1. Recherche `nécroman`, `nécromanc`, `ressuscit`, `réanim`, `mort-vivant`, `squelette`, `relevé` parmi les Markdown publics et les chroniques de début de campagne : aucun passage permettant de l'identifier avec certitude.
2. Source `sources/campagnes/README.md` : les quinze documents de campagne **sont recensés** mais leurs originaux et transcriptions ne sont **pas intégrés** dans `main`.
3. Vérification de la tête historique de la PR #77 LORE : aucun original CB01 n'est présent sous `sources/campagnes` dans l'arbre consulté.

**À rechercher en priorité :** CB01 et les premières scènes de rencontre ; description du praticien, lieu, nature de ce qui fut animé ou rappelé, différence entre apparence de résurrection et vie effectivement restituée, issue attestée de la rencontre. Lors de la récupération du texte, conserver dans un dossier de réconciliation les faits réellement joués et les détails originaux éventuellement incompatibles avec Istel ; ne pas réécrire le brut pour justifier la nouvelle identité. Les pouvoirs et la pyramide actuels d'Istel sont des **développements postérieurs**, non des événements historiquement joués. Le nécromancien de la scène ancienne n'est pas considéré automatiquement Déchu au moment de cette scène.

## Contrôles d'intégration

- Fiches publiques avec codes 44–46, portraits WebP et compagnons SVG ; catégories et liens correspondants.
- Catalogue antagonistes Studio à **46** entrées, empreintes Git de chaque fiche exactes et position narrative ajustable dans les copies MJ.
- Aucun nouveau profil 5d6 chiffré ni exposition de notes privées de campagne.
- `npm test` et CI GitHub Actions sur la tête de PR ; recette Studio Chrome, contrôle des médias et publication Pages après fusion.

**À revoir par :** LORE pour l'ancrage exact dans la campagne originelle et l'éventuelle réconciliation de contradictions ; INDEX/MATH pour tout profil de combat futur. **Décision créateur déjà donnée :** réemploi de l'identité d'Istel comme nécromancien rencontré par Alrick ; les actes, pouvoirs et rang de Déchéance de l'époque ancienne ne sont pas déterminés.
