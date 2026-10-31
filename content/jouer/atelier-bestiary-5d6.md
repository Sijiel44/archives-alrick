---
publish: true
title: "Atelier du Bestiaire 5d6 — créer et équilibrer une créature ou un PNJ"
description: "Création interactive 5d6 M03, calculs exacts, profils de référence, sauvegarde et import/export local."
categorie: "guide"
canon_statut: "proposition_non_jouee"
etat_editorial: en_cours
portee: "univers_partage"
public_cible: ["mj", "joueurs"]
usage_en_jeu: ["outil", "regles"]
tags: [5d6, bestiaire, pnj, atelier, creature, experimentation]
---

# Atelier du Bestiaire 5d6

> **Prototype expérimental M04, non canonique.** Les profils sont des aides à la conception pour les parties. Aucun chiffre, statut divin, Cercle, Affinité, espèce ou pouvoir des Archives n'est créé ni confirmé automatiquement.

Cet atelier est complémentaire de l'[[jouer/atelier-5d6|Atelier 5d6 des personnages et des jets]]. Il réutilise le générateur des cinq archétypes M03 (faune, prédateur, gardien, mystique, colosse), les bonus logarithmiques M01 et les résolutions de combat M03, sans reprendre le budget obligatoire des PJ pour les créatures. Le mode PNJ utilise une base humanoïde simplifiée, personnalisable par le MJ.

## Comment s'en servir

En **mode rapide**, choisis le niveau, la catégorie, l'archétype et le rôle. L'atelier produit un profil jouable et un calcul de dangerosité contre des personnages de référence.

Le **mode guidé** ajoute description, ressources et protections. Le **mode expert** donne accès à toutes les caractéristiques, maîtrises, défenses et capacités déclaratives, avec leurs bonus effectifs. Les changements numériques sont recalculés localement sans recharger la page. Les valeurs générées peuvent être rétablies volontairement.

La sauvegarde est locale dans ton navigateur, sous une clé distincte des personnages, campagnes et fiches historiques. Tu peux créer, dupliquer, supprimer après confirmation, importer ou exporter des JSON au format **alrick.bestiary.v1**. L'export « vers l'Atelier 5d6 » génère un fichier de personnage/PNJ à **importer volontairement** dans l'Atelier principal, sans modifier ses propres sauvegardes. Après import, vérifier l'adaptation des caractéristiques et du budget : une créature n'est pas un PJ.

## Principes de calcul

La distribution repose sur les **7 776 combinaisons exactes** de cinq dés à six faces. Les naturels 5 à 7 échouent toujours. Les naturels 27 à 30 ne franchissent ni impossibilité cosmologique ni interdiction narrative.

- Bonus effectif de caractéristique : floor(3 × log2(1 + caractéristique / 3))
- Bonus effectif de maîtrise : floor(log2(1 + rang))
- Attaque de référence : 5d6 + E(Physique) + M(maîtrise combat) + circonstance
- Défense physique : 15 + E(max(Physique, Agilité)) + M(meilleure maîtrise défensive) + bonus MJ
- Protection : protection innée M03 + équipement M03 + protection contextuelle M03 à rendement décroissant
- Dégâts attendus : somme des dégâts calculés par M03 sur chaque naturel, pondérée par ses occurrences parmi 7 776 issues

Le calcul de dangerosité utilise un groupe fictif à niveau, profil, équipement et taille choisis. Il estime une durée **théorique**, pas une durée réelle de séance. Les catégories indicatives sont **non calibrées par des playtests** et les effets magiques, consommations, positions, tours complexes, négociations et objectifs alternatifs ne sont pas simulés.

Les capacités saisies ici sont des **annotations narratives**, jamais du code exécutable. Leur approbation déclarée n'ajoute pas de bonus de combat ; les effets structurés doivent être validés dans le système prévu pour cela.

## Atelier interactif

Le formulaire se trouve ci-dessous sur la version publiée du site, et devient disponible dans l'aperçu de la branche d'intégration seulement lorsque le build passe.

[[jouer/systeme-5d6-base12|Consulter les règles]] · [[jouer/atelier-5d6|Retour à l'Atelier de jeu]] · [[jouer/bestiaire-evolutif-25|Lire le bestiaire évolutif]]
