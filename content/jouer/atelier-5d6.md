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

> La [[jouer/echelle-existences-niveaux-affinites|nouvelle échelle des existences 1–25 et des affinités]] est une **proposition de conception** : elle place les habitants ordinaires plutôt aux niveaux 1–4 et les premiers aventuriers autour du niveau 5, mais **ne modifie pas encore le moteur, les sauvegardes ni le barème de progression actif**. Il faut tester et valider la migration avant d'appliquer cette nouvelle lecture.

> **Évolution de résistance (niveau 25).** Dans l'Atelier, la robustesse **naturelle** et les **PV** augmentent avec le niveau, même sans équipement. Les protections portées peuvent évoluer par **grades 0 à 5**, distinctement des défenses innées et des protections supplémentaires du MJ. Un **27–30 naturel** peut exceptionnellement produire un **contact héroïque** sur un être de niveau très supérieur, sans pénétrer son endurance : normalement **0 PV**, éventuellement **1 PV** sur 30 naturel lorsque l'attaque dépasse toutes les absorptions. Une action mentale ou un pouvoir interdit n'est jamais accordé par ce seul contact. Le [[jouer/bestiaire-evolutif-25|bestiaire évolutif 1–25]] permet au MJ de créer des fiches de créatures génériques sans les transformer en canon.

> **Extension de jeu en préparation : compagnies, missions, inventaires et progression divine.** La nouvelle version de l'Atelier propose l'édition d'objets, leur attribution et transfert entre fiches locales, 12 rangs de groupe, 24 missions publiques, un journal de récompenses, ainsi que l'export et l'import de la campagne complète. Ces outils ne synchronisent pas les joueurs entre appareils. Les missions et les valeurs chiffrées restent des propositions non jouées.

Cet outil est une **version pilote évolutive**, inspirée du [[jouer/systeme-5d6-base12|système 5d6 / Base 12]]. Il est conçu pour les campagnes **indépendantes**, qu'elles soient menées par un MJ humain ou assistées par IA.

## Module facultatif : défense, dégâts, ripostes

L'Atelier propose maintenant **un mode opposition** indépendant des jets classiques : choisir une cible locale, une résistance physique/magique/mentale, et éventuellement un seuil minimal fixé par le MJ. La cible doit être franchie avant que des dégâts soient possibles. La maîtrise et le niveau augmentent **la force de l'impact**, et non le score de précision. Le MJ définit sur les fiches une résistance supplémentaire (0–8) et une protection qui absorbe les dégâts (0–60).

Une résistance réussie annule l'effet ; une riposte éventuelle du défenseur demande un **jet et une action distincts**. Les dégâts ne sont appliqués aux PV du PNJ/PJ qu'après confirmation expresse du MJ. Une action mentale ne retire pas de PV automatiquement et 0 PV ne signifie pas automatiquement la mort. Voir les [[jouer/systeme-5d6-base12|règles de résistance et d'impact]].

## Trois modes, un même jeu

**Expérience progressive (prototype) :** les fiches conservent un compteur d'XP cumulés. Les seuils sont `5 × (niveau − 1)³` (5 XP au niveau 2, 320 au niveau 5, 69 120 au niveau 25). Une mission de rang `r` accomplie ou terminée par un repli responsable attribue `10 × r` XP aux PJ membres de la compagnie au moment du débriefing. Le MJ peut ajuster ce montant ; l'accès aux niveaux 21–25 demande aussi une épreuve narrative approuvée individuellement. Les membres absents doivent être retirés de la liste de participants de la compagnie avant d'enregistrer la mission.

## Trois modes, un même jeu

**Sauvegarde complète :** utiliser « Exporter toute la campagne » pour conserver ensemble personnages, inventaires, modèles d'objets, compagnies, certifications et missions. « Importer sauvegarde complète » remplace la campagne locale **après confirmation** ; exporter d'abord l'état actuel. L'ancien export des fiches `alrick.sheets.v2` reste disponible pour importer des personnages individuellement. Les données restent dans le navigateur.

**Extension pilote :** le personnage possède maintenant un champ de description et un portrait facultatif importé depuis l'appareil (image réduite et enregistrée localement dans la fiche et son export JSON). La progression individuelle va de **1 à 25**, avec **+6 points de caractéristiques** et **+2 points de maîtrise** par niveau nouvellement atteint, chaque maîtrise étant plafonnée à 12. Les points peuvent rester en réserve. **PV maximum : +6** par nouveau niveau de 2 à 12, **+12** de 13 à 20, puis **+24** de 21 à 24 ; même progression de mana maximum **uniquement si une réserve magique existe déjà**. Une caractéristique reste plafonnée à **12**. Six crédits non investis peuvent être convertis volontairement en un point de talent à valider par le MJ. Les niveaux 21 à 24 exigent une **autorisation MJ** d'ascension exceptionnelle. Ces propositions de progression sont expérimentales et ne doivent pas être attribuées rétroactivement aux personnages canoniques.

Les anciennes fiches et leur emplacement de sauvegarde sont conservés. **Les maîtrises additionnelles sont suivies sans bonus de jet automatique** : la résolution 5d6 existante et les spécialités +0/+1/+2 restent inchangées en attendant le playtest. Pour les 12 indices de groupe et les missions, ouvrir le [[jouer/guide-aventurier-12-rangs|Guide de l'aventurier]].

**Joueur :** remplir sa fiche, consulter sa réserve de PV et de mana, lancer ses dés et enregistrer ses actions.

**Maître du jeu :** choisir une fiche de PNJ ou créature dans la liste locale, utiliser un profil d'essai ou importer un fichier JSON, puis appliquer les mêmes règles de résolution.

**MJ assisté par IA :** préparer un **contexte structuré à copier** dans une conversation d'IA, avec la fiche active, un extrait facultatif du répertoire et les consignes de continuité. **Le site n'envoie aucune information à ChatGPT ni à un service distant.**


## Modèle minimal de fichier JSON

Le mode MJ accepte un **profil** (objet JSON avec nom et quatre caractéristiques), un **tableau** de profils, ou un export du répertoire de l'Atelier. Exemple fictif, librement modifiable :

```json
{
  "schema": "alrick.sheet.v2",
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

L'export de l'Atelier utilise désormais `alrick.sheets.v2` (un conteneur avec plusieurs profils, leurs maîtrises et leurs portraits facultatifs) ; les anciennes fiches `v1` restent importables. L'import JSON accepte jusqu'à **5 Mio** pour tenir compte des portraits, mais la capacité de stockage local dépend du navigateur. Seuls les fichiers **JSON explicites** sont acceptés ; les documents Word, PDF ou fiches des Archives ne sont **pas encore importés automatiquement**. Une étape future pourrait proposer une conversion **après validation du canon et des caractéristiques**.

## Nouveautés de l'Atelier v1.1

- **Réinitialiser cette fiche…** : remet à zéro le personnage actif **après confirmation**, sans toucher aux autres fiches ni au journal général. Exporter son JSON avant toute remise à zéro.
- **Niveau 1–12 et voies libres** : suivre l'expérience, les talents et la vocation sans imposer une classe unique ou un bonus brut de statistiques.
- **Bénédictions, malédictions et objets singuliers** : consigner les possibilités narratives et leurs limites sans fabriquer d'équipement « +1 ».
- **Incidents d12** : après trois échecs dans la même catégorie (magie, mêlée, tir, négociation), l'Atelier suggère une conséquence aléatoire facultative, parfois favorable plus tard. Les échecs sur 5 naturel ne cumulent pas une deuxième catastrophe.
- **Références des Archives** : le MJ recherche les fiches **publiquement indexées** des personnages et créatures, les consulte sans téléchargement et peut créer une **adaptation 5d6** ; les notes et statistiques chiffrées créées restent hypothétiques.

[[jouer/progression-voies-incidents|Lire le projet de progression, voies et événements aléatoires]].

## Profils JSON d'essai à importer

Trois exemples compatibles sont disponibles : **Eren (adaptation chiffrée non canonique à partir d'une fiche publique)**, une gardienne de relais fictive et un fauve fictif.

[Télécharger les trois fiches JSON de démonstration](https://sijiel44.github.io/archives-alrick/static/atelier5d6-profils-demo.json)

Ils ne fixent **aucune statistique canonique** de personnage ou créature. Le format de l'export est désormais `alrick.sheets.v2` ; les anciens exports `alrick.sheets.v1` restent importables.

## Fonctionnement et confidentialité

Les fiches et les derniers jets sont enregistrés dans le **stockage local de ce navigateur**. Il n'y a ni compte, ni synchronisation entre appareils, ni sauvegarde sur nos serveurs. Utiliser **Exporter JSON** pour conserver sa progression ; l'import accepte des profils compatibles avec le format `alrick.sheet.v1`. La mémoire du navigateur peut disparaître si vous effacez ses données ou utilisez la navigation privée.

Les **profils d'essai** sont fictifs et n'ajoutent aucun PNJ ni aucune créature au canon. Pour une fiche provenant des Archives, **l'import ne garantit pas que ses caractéristiques chiffrées ont été approuvées**. Le JSON n'est pas un moyen d'accéder aux dossiers MJ non publiés. Les notes de MJ enregistrées localement ne sont **pas protégées contre quelqu'un d'autre qui utilise le même navigateur**.

Les choix des personnages et les résultats d'une partie n'ajoutent **aucun événement** à la campagne fondatrice d'Orin. L'application n'est pas un agent autonome, un générateur de récit ou un moteur complet de combat.

[[jouer/systeme-5d6-base12|Lire les règles]] · [[jouer/index|Retour au guide de jeu]] · [[mj-ia/index|Préparer un MJ assisté par IA]].
