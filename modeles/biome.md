---
publish: false
title: "[Biome — gabarit]"
code: "CODE_BIOME_A_VERIFIER"
categorie: "lieu"
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

# [Biome — type de milieu]

> [!warning] Classification documentaire proposée
> Le modèle ne crée aucun biome local canonique. Une catégorie de milieu n'autorise ni localisation précise ni peuplement fictif.

## Définition et conditions
- **Code stable / nom / alias** : [après contrôle du registre et validation].
- **Définition physique ou magique** : [classification proposée].
- **Climat / température / hydrologie / saisonnalité** : [mesurés, source, inconnus].
- **Géographie réellement attestée** : [Atlas, section, statut, limitations cartographiques].
- **Ressources, sols, abris, énergie et producteurs primaires** : [lorsque pertinents].
- **Sous-milieux et écotones** : [sans inventer de lieux].

## Écologie
- **Espèces communes** : [uniquement attestées].
- **Espèces rares** : [même niveau d'exigence].
- **Prédateurs, proies, symbioses, parasites, recyclage** : [relations sourcées].
- **Cycles biologiques, migrations et perturbations** : [inconnu autorisé].
- **Civilisations, exploitations, constructions et dommages** : [Atlas et scènes].
- **Dangers naturels / magiques** : [distingués, pas universels].
- **Passages et Failles** : [présence prouvée seulement, sans attribuer une corruption automatique].

## Usage en jeu et références
- **Rencontres possibles** : [propositions MJ, clairement non jouées].
- **Relations aux régions de l'Atlas** : [plusieurs régions ↔ plusieurs biomes ; statut par lien].
- **Sources / contradictions / zones inconnues** : [table de preuves].
- **Illustrations** : auteur, licence, alt, conceptuelle ou approuvée, spoilers.


## Validation individuelle du code B-002 (obligatoire avant fusion de la fiche)

- **Préfixe approuvé** : `BIO-` pour la nature documentaire `biome`. Pour une identité déjà dotée d'un code historique (`DRG`, `REV`, `IMP`, `CRE`…), conserver ce code sans le remplacer.
- **Code proposé** : [uniquement si l'entité est réellement définie et justifiée ; ne jamais reprendre un code déjà attribué].
- **Fichier de référence** : [chemin réel dans `content/` ; identique au registre].
- **Source exacte** : [document, version et passage, ou décision explicite de création].
- **Preuve de validation du créateur** : [référence traçable de l'approbation individuelle].
- **Statuts** : `canon_statut` et `etat_editorial` indépendants ; un code unique n'attribue ni canon, ni `publish:true`.
- **Inscription de contrôle** : renseigner l'entrée correspondante dans `docs/bestiaire/B002_CODES_VALIDES.json` et faire réussir `npm run test:b002`. Le contrôle recherche directement la fiche dans `content/` ; aucun identifiant attribué seulement par son préfixe n'est autorisé.
