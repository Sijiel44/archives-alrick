---
publish: false
title: "[Profil de jeu 5d6 — gabarit]"
code: "CODE_PROFIL_A_VERIFIER"
categorie: "guide"
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

# [Profil de créature — adaptation 5d6]

> [!warning] Règles de playtest, aucune statistique canonique
> Ne pas déclarer cette fiche jouée ni approuvée avant test MJ. Ne pas générer de capacité depuis le seul nom ou l'espèce.

## Provenance
- **Code du profil** : [réservé à valider].
- **Fiche d'espèce ou d'individu liée** : [lien stable].
- **Version de moteur** : [commit / module / date], **archétype** : [faune, predateur, gardien, mystique, colosse].
- **Source de chaque nombre** : [générateur 5d6 identifié / MJ / playtest ; jamais encyclopédie seule].
- **Niveau individuel 1–25** : [test] ; **danger de rencontre (indépendant)** : [effectif, terrain, objectif, groupe].
- **Validation mécanique** : [non testé / essai consigné / approuvé MJ — états de playtest, non `canon_statut`].

## Caractéristiques et réserves
- **Physique / Agilité / Esprit / Présence** : [quatre nombres].
- **Maîtrises / spécialisations** : [noms moteur, valeurs et effets réellement activés].
- **PV / PV max** : [source] ; **mana / mana max** : [0 sauf justification].
- **Résistance physique / magique / mentale** : [source] ; **protection innée / équipement / ajustement MJ** : [séparés].
- **Affinités** : [domaine, rang, témoin et limite] — aucun Cercle offert automatiquement.

## Actions et comportements
- **Capacités utilisables** : [déclencheur, coût, portée, durée, opposition, limites, recharge].
- **Actions offensives et défensives** : [avec provenance].
- **Mobilité, visibilité, terrain** : [mesures ou inconnues].
- **Économie des actions** : [règle effectivement appliquée, sinon à tester].
- **Fuite, pacification, dialogue, sauvetage, défaite sans tuer** : [options].
- **Dangers collectifs** : [nombre d'êtres, formation, terrain, logistique].
- **Hypothèses de playtest** : [cas, résultat, écart].

## Export
Le générateur `generateCreatureProfile(level, archetype)` retourne un **objet interne** distinct de l'import `alrick.sheet.v2`. Ne pas ajouter arbitrairement ses champs à un JSON d'import. Transformer via un adaptateur spécifié, testé et validé à part.
