---
publish: false
title: "[Nom de l'individu — gabarit]"
code: "CODE_INDIVIDU_A_VERIFIER"
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

# [Nom de l'individu]

> [!warning] Modèle d'individu, non transposable à l'espèce
> Une capacité, une expérience, une allégeance ou une forme montrée ici ne devient jamais une propriété des congénères.

## Identité
- **Code stable historique** : [conserver, même s'il commence par IMP-/REV-/DRG-].
- **Nom et alias, homonymes distincts** : [à vérifier].
- **Espèce de rattachement** : [lien si espèce réellement identifiée ; sinon inconnu].
- **Nature ontologique** : [attestée, disputée ou inconnue].
- **Création/invocation/transformation** : [faits documentés sans généralisations].

## Parcours et relations
- **Biographie effectivement jouée** : [référence CB et paragraphes].
- **Éléments de lore validés non joués** : [sources distinctes].
- **Personnalité, choix et volonté** : [témoignages ou actions, sans figer l'avenir].
- **Liens et allégeances** : [amitié, famille, Maison, compagnie, emploi et tutelle séparés].
- **Lieux réellement fréquentés** : [à distinguer des habitats d'espèce et destinations proposées].
- **Rencontres / scènes jouées** : [source, interlocuteurs, résultats].
- **Projets et avenirs envisagés** : [jamais accomplis par défaut].

## Singularités et limites
- **Affinités personnelles** : [sources, conditions, limites].
- **Capacités individuelles montrées** : [exactement ce qui est démontré].
- **Évolutions observées** : [forme initiale, forme attestée, déclencheur si connu].
- **Comportement et besoins propres** : [ne pas inférer en espèce].
- **Vulnérabilités / contraintes** : [inconnu si absent des textes].
- **Profils 5d6 (0..n)** : [liens de registre documentaire vers profils M03, IDs locaux, niveau et danger de rencontre distincts ; adaptation non canonique]. Un profil peut lier plusieurs dossiers documentaires sans attribuer ses valeurs à l'espèce.

## Sources, accès et visuels
| Affirmation | Preuve | Source précise | Confidentialité |
| --- | --- | --- | --- |
| [à compléter] | inconnu | [CB / volume / validation] | [à revoir] |

- **Spoilers** : si true, `unlisted: true` et `visibilite: publique_avec_avertissement` seulement après accord de publication ; un secret MJ demeure hors GitHub.
- **Illustrations** : provenance, licence, alt, statut de validation.
- **Renvois** : [Compendium, espèces, lieux, groupes, scènes].


## Validation individuelle du code B-002 (obligatoire avant fusion de la fiche)

- **Préfixe approuvé** : `INDC-` pour la nature documentaire `individu_creature`. Pour une identité déjà dotée d'un code historique (`DRG`, `REV`, `IMP`, `CRE`…), conserver ce code sans le remplacer.
- **Code proposé** : [uniquement si l'entité est réellement définie et justifiée ; ne jamais reprendre un code déjà attribué].
- **Fichier de référence** : [chemin réel dans `content/` ; identique au registre].
- **Source exacte** : [document, version et passage, ou décision explicite de création].
- **Preuve de validation du créateur** : [référence traçable de l'approbation individuelle].
- **Statuts** : `canon_statut` et `etat_editorial` indépendants ; un code unique n'attribue ni canon, ni `publish:true`.
- **Inscription de contrôle** : renseigner l'entrée correspondante dans `docs/bestiaire/B002_CODES_VALIDES.json` et faire réussir `npm run test:b002`. Le contrôle recherche directement la fiche dans `content/` ; aucun identifiant attribué seulement par son préfixe n'est autorisé.
