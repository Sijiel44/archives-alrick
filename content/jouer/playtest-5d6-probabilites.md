---
publish: true
title: "Playtest 5d6 — probabilités exactes et protocole PJ/MJ/MJ-IA"
description: "Audit mathématique des 7 776 issues 5d6, effet de la formation, critiques rares, magie et test de compatibilité de la Déchéance."
canon_statut: "proposition_non_jouee"
etat_editorial: "valide"
visibilite: "publique"
portee: "univers_partage"
public_cible: ["joueurs", "mj"]
usage_en_jeu: ["regles", "demarrage", "outil"]
source_brute: "Système 5d6 Base 12, Atelier 5d6 et Déchéance 2d6 déjà publiés dans les Archives ; calcul combinatoire exact sur 7776 résultats ; aucune partie humaine attestée"
derniere_revision_documentaire: "2026-10-30"
tags: [jdr, cinq-des, 5d6, probabilites, playtest, magie]
---

# 5d6 — Vérification mathématique, pas encore campagne-test

Le [[jouer/systeme-5d6-base12|prototype de base]] demande **5d6 + Caractéristique + Compétence + Situation** face à un seuil. Les six seuils proposés sont 15, 18, 21, 24, 27 et 30. Un personnage novice commence avec quatre caractéristiques (Physique, Agilité, Esprit, Présence) et des compétences de +0, +1 ou +2. Les chiffres ci-dessous sont **exactement calculés sur les 6⁵ = 7 776 issues équiprobables des cinq dés**, pas mesurés lors d'une partie avec des joueurs.

## Probabilité brute d'atteindre le seuil

| Bonus total | Seuil 15 | Seuil 18 | Seuil 21 | Seuil 24 | Seuil 27 | Seuil 30 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| +0 | 77,85 % | 50,00 % | 22,15 % | 5,88 % | 0,72 % | 0,013 % |
| +2 | 90,20 % | 69,48 % | 39,97 % | 15,20 % | 3,24 % | 0,27 % |
| +3 | 94,12 % | 77,85 % | **50,00 %** | 22,15 % | 5,88 % | 0,72 % |
| +4 | 96,76 % | 84,80 % | **60,03 %** | 30,52 % | 9,80 % | 1,62 % |
| +5 | 98,38 % | 90,20 % | **69,48 %** | 39,97 % | 15,20 % | 3,24 % |
| +6 | 99,28 % | 94,12 % | 77,85 % | **50,00 %** | 22,15 % | 5,88 % |

Ce tableau mesure **uniquement le franchissement numérique du seuil**. Il n'anticipe ni conséquences supplémentaires ni succès automatiques éventuellement attribués aux critiques dans la version d'essai. **Le MJ doit décider avant la séance** si un naturel 27–29 suffit malgré un seuil non atteint, ou s'il ne peut renforcer qu'une action déjà réussie. **Cette ambiguïté est à arbitrer** : un texte de playtest ne doit pas la transformer discrètement en nouvelle règle.

## Les critiques sont réellement exceptionnels

| Somme naturelle des dés | Nombre d'issues | Probabilité | Traitement dans le prototype |
| --- | ---: | ---: | --- |
| **5** | 1 | 0,01286 % | Échec exceptionnel |
| **6 à 7** | 20 | 0,25720 % | Échec critique mineur |
| **27 à 29** | 55 | 0,70730 % | Réussite critique potentielle si l'action est possible |
| **30** | 1 | 0,01286 % | Réussite exceptionnelle si l'action est possible |

À un seuil **21 avec +3**, le franchissement numérique se produit dans **50 % des cas**. Si les échecs à **1–2 points** du seuil peuvent devenir des progrès partiels, leur fréquence brute est **19,48 %** ; les autres issues sont **30,52 %** avant prise en compte éventuelle des critiques. Cette répartition distingue nettement la **réussite nette**, le **progrès à coût** et l'**échec utile au récit**.

### Ce que les chiffres suggèrent, sans encore le valider

- La formation +1 au seuil 21 fait passer le personnage à **60,03 %** si son bonus initial est +3. Une compétence +2 lui donne **69,48 %**. L'apprentissage a un effet sensible.
- Un aventurier à **+3** échoue numériquement presque quatre fois sur cinq contre un seuil **24** ; le MJ ne devrait pas qualifier cette difficulté de routine.
- Un héros à **+6** a **50 %** de franchir 24 ; ce seuil décrit un vrai défi pour un expert.
- Les critiques très rares ne sont pas une raison de demander un jet à chaque acte domestique : les actions sans incertitude dramatique peuvent réussir sans lancer de dés.

## Test encadré en trois contextes

**PJ — incident de caravane :** un spécialiste utilise Physique +3 et Métier +1 ; les joueurs savent qu'un franchissement de 21 vaut **60,03 %** avant situation. Le MJ fixe d'abord ce que signifient un succès, une réussite partielle et un échec.

**MJ — antagoniste :** la difficulté 24 est réservée à un adversaire bien protégé ou une manoeuvre difficile. Les points de vie 12 et les dommages 1/3/6 sont **des hypothèses du prototype**, pas des statistiques canoniques de toutes les espèces.

**MJ assisté par IA :** le système peut être décrit dans un contexte copié depuis l'[[jouer/atelier-5d6|Atelier]], mais **l'IA ne doit pas annoncer un lancer qu'elle n'a pas réellement effectué**. Déclarer la difficulté et les conséquences possibles avant le lancer ; conserver la fiche, la situation, la somme naturelle et le résultat total pour un contrôle humain.

## Magie : éviter de confondre fiction et test

Les [[univers/magie-pour-jouer|Cercles et traditions]] décrivent des aptitudes apprises et des conditions locales. Un score d'Esprit élevé et **5 dés favorables** ne donnent pas accès à un Cercle inconnu, ne permettent pas une naissance divine ni un retrait d'Existence. Les ressources suggérées **12 mana / coût 3, 6 ou 12** sont une économie de test : la fatigue, le repos, les rites, les préparations et l'échelle des puissances anciennes exigent encore des séances de validation.

## Déchéance : deux systèmes qui ne s'additionnent pas

La [[jouer/decheance-systeme|Déchéance v1.0]] est un **mini-système optionnel validé** fondé sur **2d6, Corps/Esprit/Lien**, Vitalité et Emprise. Le **5d6/Base 12** est un **système principal en essai** avec **quatre caractéristiques**. **Additionner 5d6 aux défenses 7–12 de la Déchéance serait une erreur d'équilibrage.**

Deux modes honnêtes pour les tables :
1. **Jouer Déchéance en module 2d6 autonome**, tel que validé, sans modifier ses seuils.
2. **Essayer une adaptation de fiction** où l'Emprise (0–12), les pactes, Ancrages et obligations restent les mêmes, mais tous les jets suivent le 5d6. Les seuils, défenses et dégâts doivent être **retestés** et la conversion clairement marquée comme **expérimentale**, jamais comme remplacement du module approuvé.

## Protocole de partie réelle à remplir

| Indicateur | Ce qu'il faut noter |
| --- | --- |
| Joueurs et niveau | Nombre de PJ, bonus de départ, métiers, moyens |
| Actions et difficulté | Seuil annoncé, bonus final, somme naturelle, résultat |
| Réussite et progression | Net, partiel, échec, durée et conséquence effective |
| Surcharge | Nombre de jets par séance, temps pris, moments où la fiction s'interrompt |
| Magie | Accès au rite, fatigue/mana, coût réellement payé, effet |
| Combats | Tours, PV perdus, morts évitées ou causées, possibilité de retrait |
| Déchéance optionnelle | Pacte accepté librement, Emprise, Ancrages, consentement du joueur |
| MJ-IA | Erreurs de rappel des règles, confusions de sources, jets non réalisés |

**Aucun test humain documenté** n'est encore présenté dans cette fiche. Les conclusions d'équilibrage restent **provisoires** ; la prochaine étape est un compte rendu de deux ou trois séances réellement jouées.

## Références

[[jouer/systeme-5d6-base12|Règles 5d6]], [[jouer/atelier-5d6|Atelier]], [[jouer/progression-voies-incidents|Progression]], [[jouer/decheance-systeme|Déchéance 2d6]], [[jouer/protocole-failles-guildes|Missions de guilde]].