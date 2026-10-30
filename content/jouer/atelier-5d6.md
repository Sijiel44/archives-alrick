---
publish: true
title: "Atelier de jeu interactif — PJ, MJ et MJ assisté par IA"
description: "Fiches, dés 5d6, profils importables et préparation de contexte pour une aventure autonome."
categorie: "guide"
canon_statut: "proposition_non_jouee"
etat_editorial: en_cours
portee: "univers_partage"
public_cible: ["joueurs", "mj"]
usage_en_jeu: ["outil", "regles", "scenario", "prompt"]
tags: [5d6, des, personnage, mj, pnj, creatures, atelier]
---

# Atelier de jeu 5d6

Cet outil est une **première version testable**, inspirée du [[jouer/systeme-5d6-base12|système 5d6 / Base 12]]. Il est conçu pour les campagnes **indépendantes**, qu'elles soient menées par un MJ humain ou assistées par IA.

## Trois modes, un même jeu

**Joueur :** remplir sa fiche, consulter sa réserve de PV et de mana, lancer ses dés et enregistrer ses actions.

**Maître du jeu :** choisir une fiche de PNJ ou créature dans la liste locale, utiliser un profil d'essai ou importer un fichier JSON, puis appliquer les mêmes règles de résolution.

**MJ assisté par IA :** préparer un **contexte structuré à copier** dans une conversation d'IA, avec la fiche active, un extrait facultatif du répertoire et les consignes de continuité. **Le site n'envoie aucune information à ChatGPT ni à un service distant.**


## Modèle minimal de fichier JSON

Le mode MJ accepte un **profil** (objet JSON avec nom et quatre caractéristiques), un **tableau** de profils, ou un export du répertoire de l'Atelier. Exemple fictif, librement modifiable :

```json
{
  "schema": "alrick.sheet.v1",
  "name": "Gardien du vieux col (exemple)",
  "kind": "pnj",
  "profession": "Gardien",
  "skill": 1,
  "stats": {
    "physique": 4,
    "agilite": 2,
    "esprit": 3,
    "presence": 3
  },
  "pv": 12,
  "pvMax": 12,
  "mana": 0,
  "manaMax": 0,
  "emprise": 0,
  "notes": "Création fictive, non canonique."
}
```

L'export de l'Atelier utilise `alrick.sheets.v1` (un conteneur avec plusieurs profils). Seuls les fichiers **JSON explicites** sont acceptés ; les documents Word, PDF ou fiches des Archives ne sont **pas encore importés automatiquement**. Une étape future pourrait proposer une conversion **après validation du canon et des caractéristiques**.

## Fonctionnement et confidentialité

Les fiches et les derniers jets sont enregistrés dans le **stockage local de ce navigateur**. Il n'y a ni compte, ni synchronisation entre appareils, ni sauvegarde sur nos serveurs. Utiliser **Exporter JSON** pour conserver sa progression ; l'import accepte des profils compatibles avec le format `alrick.sheet.v1`. La mémoire du navigateur peut disparaître si vous effacez ses données ou utilisez la navigation privée.

Les **profils d'essai** sont fictifs et n'ajoutent aucun PNJ ni aucune créature au canon. Pour une fiche provenant des Archives, **l'import ne garantit pas que ses caractéristiques chiffrées ont été approuvées**. Le JSON n'est pas un moyen d'accéder aux dossiers MJ non publiés. Les notes de MJ enregistrées localement ne sont **pas protégées contre quelqu'un d'autre qui utilise le même navigateur**.

Les choix des personnages et les résultats d'une partie n'ajoutent **aucun événement** à la campagne fondatrice d'Orin. L'application n'est pas un agent autonome, un générateur de récit ou un moteur complet de combat.

[[jouer/systeme-5d6-base12|Lire les règles]] · [[jouer/index|Retour au guide de jeu]] · [[mj-ia/index|Préparer un MJ assisté par IA]].
