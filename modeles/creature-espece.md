---
publish: false
title: "[Nom de l'espèce — gabarit]"
code: "CODE_ESPECE_A_VERIFIER"
categorie: "creature"
canon_statut: "a_verifier"
etat_editorial: "en_chantier"
source_brute: "SOURCE EXACTE A RENSEIGNER AVANT VALIDATION"
ancre_documentaire: "A RENSEIGNER"
visibilite: "brouillon"
spoilers: false
unlisted: true
portee: "univers_partage"
public_cible: ["lecteurs", "joueurs", "mj"]
usage_en_jeu: ["reference"]
description: "Gabarit de travail non canonique"
tags: [bestiaire, modele]
---

# [Nom de l'espèce]

> [!warning] Gabarit documentaire, pas une espèce nouvelle
> Remplacer les champs uniquement à partir de sources vérifiées. Une case vide signifie **inconnu**, jamais « absent ». Les propositions de rencontre restent distinctes.

## Identité et preuves
- **Nom / alias** : [à sourcer] ; **code stable** : [réutiliser code existant ; sinon proposer, validation nécessaire].
- **Famille et parent** : [documentaire seulement, degré de preuve].
- **Nature ontologique (multi-valeurs)** : [classification proposée].
- **Origine / provenance / transformations / allégeance / hostilité** : [quatre axes indépendants].
- **État canonique dominant** : [un des statuts du contrat éditorial]. Date fictive : [inconnue tant que non sourcée].

## Présentation naturaliste
- **Description établie** : [ne pas inférer depuis un individu].
- **Morphologie, taille, apparence et variations** : [mesures observées / estimation / inconnues].
- **Biomes** : [biome contrôlé, niveau de preuve, région de l'Atlas si vérifiée].
- **Conditions environnementales, contraintes et ressources** : [observées / inconnues].
- **Alimentation et rôle trophique** : [inconnu autorisé].
- **Cycle de vie, croissance, reproduction, longévité** : [inconnu autorisé].
- **Intelligence, sociabilité, territorialité, communication** : [éviter « monstre » comme jugement biologique].
- **Migrations, symbioses, parasites, proies, prédateurs** : [sources ou inconnus].
- **Relations avec les peuples, soins, coopération, domestication** : [possibilités documentées seulement].

## Capacités, limites et variantes
- **Capacités naturelles attestées** : [observation + source].
- **Capacités magiques attestées à l'échelle de l'espèce** : [aucune entrée par défaut ; ne jamais extrapoler un individu].
- **Limites, vulnérabilités, risques voyageurs** : [faits / hypothèses séparés].
- **Variantes, stades ou évolution** : [liens ; ne pas créer d'espèce à partir d'un stade].
- **Individus et autres fiches** : [références existantes, sans recopier leurs pouvoirs].

## En jeu — couche distincte
- **Approches non violentes** : [observation, évitement, négociation, secours, cohabitation].
- **Scènes MJ proposées** : [étiqueter explicitement « non jouées »].
- **Profils 5d6 (0..n)** : [liens documentaires et IDs locaux, version M03, validation mécanique, source de chaque correspondance]. Plusieurs profils peuvent servir à une même espèce ; aucune valeur n'est automatiquement canonique. Voir `B001_1_MATRICE_COMPATIBILITE_5D6.md`.

## Traçabilité et illustration
| Affirmation | État de preuve | Source (CB/section/version) | Limite / accès |
| --- | --- | --- | --- |
| [à documenter] | inconnu | [à vérifier] | [public / spoiler] |

- **Illustrations** : fichier/URL, auteur, droit/licence, date, alt, illustration conceptuelle ou visuel canonique approuvé.
- **Liens** : [Atlas, Bible, Codex, Compendium].
- **Arbitrages du créateur** : [liste].


## Validation individuelle du code B-002 (obligatoire avant fusion de la fiche)

- **Préfixe approuvé** : `ESP-` pour la nature documentaire `espece`. Pour une identité déjà dotée d'un code historique (`DRG`, `REV`, `IMP`, `CRE`…), conserver ce code sans le remplacer.
- **Code proposé** : [uniquement si l'entité est réellement définie et justifiée ; ne jamais reprendre un code déjà attribué].
- **Fichier de référence** : [chemin réel dans `content/` ; identique au registre].
- **Source exacte** : [document, version et passage, ou décision explicite de création].
- **Preuve de validation du créateur** : [référence traçable de l'approbation individuelle].
- **Statuts** : `canon_statut` et `etat_editorial` indépendants ; un code unique n'attribue ni canon, ni `publish:true`.
- **Inscription de contrôle** : renseigner l'entrée correspondante dans `docs/bestiaire/B002_CODES_VALIDES.json` et faire réussir `npm run test:b002`. Le contrôle recherche directement la fiche dans `content/` ; aucun identifiant attribué seulement par son préfixe n'est autorisé.
