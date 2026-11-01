# Audit mathématique du moteur 5d6 — 31 octobre 2026

> **Statut : diagnostic technique et propositions NON CANONIQUES.** Branche de travail
> `rules/5d6-audit-probabilites-20261031`. Aucune règle de combat, sauvegarde,
> fiche, affinité ou Autorité n'est modifiée par cet audit.
> **Référence de code :** `atelier5d6.inline.ts`, `atelier5d6-opposition.ts`,
> `atelier5d6-bestiary.ts`, `atelier5d6-origins.ts` et les tests `scripts/test-5d6-*.mjs`.

## 1. État des mécanismes dans main (audit sur commit 3443be26)

| Sous-système | Ce qui fonctionne réellement | Lacune ou risque |
|---|---|---|
| 5d6 | Cinq dés, caractéristique, spécialité 0–2, situation −2/0/+2 ; critiques naturels | L'ancien banc de probabilité ne forçait que le 5 à échouer, contrairement à l'Atelier (5–7) |
| Création de vie | Quatre étapes, niveau 5, 36 crédits de caractéristiques, 8 points de maîtrise, PV 36 | Les 4 caractéristiques peuvent déjà avoir une moyenne de 9 ; des extrêmes à 12 sont possibles |
| Progression 1–25 | +6 crédits et +2 maîtrises par niveau, plafonds de 12, XP cumulés cubiques | Plafond global des quatre attributs atteignable au niveau 7 |
| Ressources | PV progressifs, mana progressif seulement si déjà présent | Les écarts entre guerrier/mage tiennent surtout aux profils MJ et non à une économie complète |
| Opposition | Seuil = max(difficulté, résistance), contact héroïque, absorption, confirmation MJ | À haut niveau, défense ET absorption peuvent rendre un duel interminable |
| Bestiaire | Cinq archétypes, niveaux individuels 1–25 | Aucun indice de menace dérivé des rounds, de l'intelligence ou du terrain |
| Lore | L'échelle de jeu reste distincte des puissances ontologiques | Ne jamais confondre manifestation 25 et les Fondements hors barème |
| Sauvegardes | Clé locale historique et formats alrick.sheets.v1/v2, alrick.campaign.v1 | Toute évolution de fiche nécessite tests de migration séparés |

## 2. Distribution exhaustive de cinq dés à six faces

Il y a exactement **6⁵ = 7 776 quintuplets équiprobables**, moyenne **17,5**, symétrie autour de 17,5.
Les comptes sont obtenus par convolution et contrôlés indépendamment par énumération exhaustive.

| Naturel | Issues | Probabilité |
|---:|---:|---:|
| 5 | 1 | 0,0129 % |
| 6 | 5 | 0,0643 % |
| 7 | 15 | 0,1929 % |
| 8 | 35 | 0,4501 % |
| 9 | 70 | 0,9002 % |
| 10 | 126 | 1,6204 % |
| 11 | 205 | 2,6363 % |
| 12 | 305 | 3,9223 % |
| 13 | 420 | 5,4012 % |
| 14 | 540 | 6,9444 % |
| 15 | 651 | 8,3719 % |
| 16 | 735 | 9,4522 % |
| 17 | 780 | 10,0309 % |
| 18 | 780 | 10,0309 % |
| 19 | 735 | 9,4522 % |
| 20 | 651 | 8,3719 % |
| 21 | 540 | 6,9444 % |
| 22 | 420 | 5,4012 % |
| 23 | 305 | 3,9223 % |
| 24 | 205 | 2,6363 % |
| 25 | 126 | 1,6204 % |
| 26 | 70 | 0,9002 % |
| 27 | 35 | 0,4501 % |
| 28 | 15 | 0,1929 % |
| 29 | 5 | 0,0643 % |
| 30 | 1 | 0,0129 % |

Totaux remarquables :
- 5 naturel : **1/7 776 = 0,01286 %**, échec exceptionnel ;
- 6–7 naturels : **20/7 776 = 0,25720 %**, échecs mineurs ;
- 5–7 cumulés : **21/7 776 = 0,27006 %**, échec obligatoire même avec de très forts bonus ;
- 27–29 naturels : **55/7 776 = 0,70730 %**, critiques potentiels ;
- 30 naturel : **1/7 776 = 0,01286 %**, exceptionnel potentiel.

Les naturels 27–30 ne garantissent pas un effet si l'action ou la pénétration est impossible :
**critique, contact, pénétration et dégâts sont quatre notions distinctes.**

### Probabilité exacte de réussite numérique

Une réussite ordinaire exige simultanément `naturel > 7` et
`naturel + caractéristique + spécialité + situation ≥ difficulté`.
Sans précondition narrative, chaque point supplémentaire déplace le seuil naturel.

| Bonus total | Seuil 21 | Seuil 24 | Seuil 27 | Seuil 30 | Seuil 40 (opposition) |
|---:|---:|---:|---:|---:|---:|
| +0 | 22,15 % | 5,88 % | 0,72 % | 0,01 % | 0 % |
| +3 | 50,00 % | 22,15 % | 5,88 % | 0,72 % | 0 % |
| +6 | 77,85 % | 50,00 % | 22,15 % | 5,88 % | 0 % |
| +12 | 99,28 % | 94,12 % | 77,85 % | 50,00 % | 0,27 % |
| +16 | 99,73 % | 99,73 % | 96,76 % | 84,80 % | **5,88 %** |
| +24 (hypothèse uniquement) | 99,73 % | 99,73 % | 99,73 % | 99,73 % | 69,48 % |

**Correction testée :** +24 n'a jamais 99,99 % de réussite face aux seuils
ordinaires, mais **7 755/7 776 = 99,72994 %** au maximum, car 5, 6 et 7 restent
des échecs obligatoires. **+24 n'est pas accessible par la formule actuelle**
dont le maximum habituel est 12 (caractéristique) + 2 (spécialité) +
2 (situation) = **+16**.

## 3. Reconstitution de la progression actuelle des niveaux 1 à 25

- Seuil XP cumulé du niveau n : `5 × (n − 1)³`.
- Crédits de caractéristiques cumulés : `12 + 6 × (n − 1)`.
- Points de maîtrise cumulés : `2 × (n − 1)`, chaque maîtrise plafonnée à 12.
- PV de référence : 12 au niveau 1 ; +6/niveau pour 2–12 ;
  +12 pour 13–20 ; +24 pour 21–24 ; +36 pour 25.
- Mana maximum : même gain **seulement si une réserve magique existe déjà**.
- Protection physique innée : par paliers, indépendamment de l'équipement.
- La colonne « surplus théorique » suppose que les quatre scores ont déjà
  atteint leur maximum global de 48. Les points réels non investis dépendent
  de la fiche et des conversions volontaires en talents.

| Niveau | XP cumulés | Crédits carac. | Surplus après plafond 48 | Points de maîtrise | PV de référence | Protection physique innée |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 12 | 0 | 0 | 12 | 0 |
| 2 | 5 | 18 | 0 | 2 | 18 | 0 |
| 3 | 40 | 24 | 0 | 4 | 24 | 0 |
| 4 | 135 | 30 | 0 | 6 | 30 | 0 |
| 5 | 320 | 36 | 0 | 8 | 36 | 2 |
| 6 | 625 | 42 | 0 | 10 | 42 | 2 |
| 7 | 1080 | 48 | 0 | 12 | 48 | 2 |
| 8 | 1715 | 54 | 6 | 14 | 54 | 2 |
| 9 | 2560 | 60 | 12 | 16 | 60 | 5 |
| 10 | 3645 | 66 | 18 | 18 | 66 | 5 |
| 11 | 5000 | 72 | 24 | 20 | 72 | 5 |
| 12 | 6655 | 78 | 30 | 22 | 78 | 5 |
| 13 | 8640 | 84 | 36 | 24 | 90 | 9 |
| 14 | 10985 | 90 | 42 | 26 | 102 | 9 |
| 15 | 13720 | 96 | 48 | 28 | 114 | 9 |
| 16 | 16875 | 102 | 54 | 30 | 126 | 9 |
| 17 | 20480 | 108 | 60 | 32 | 138 | 14 |
| 18 | 24565 | 114 | 66 | 34 | 150 | 14 |
| 19 | 29160 | 120 | 72 | 36 | 162 | 14 |
| 20 | 34295 | 126 | 78 | 38 | 174 | 14 |
| 21 | 40000 | 132 | 84 | 40 | 198 | 20 |
| 22 | 46305 | 138 | 90 | 42 | 222 | 27 |
| 23 | 53240 | 144 | 96 | 44 | 246 | 35 |
| 24 | 60835 | 150 | 102 | 46 | 270 | 44 |
| 25 | 69120 | 156 | 108 | 48 | 306 | 55 |

**Diagnostic :** le total 48 est disponible dès le **niveau 7**.
Le système n'oblige pas à tout investir, mais après ce niveau il ne peut plus
différencier des personnages par les caractéristiques seules. La conversion
`6 crédits → 1 talent` compense en partie, mais les talents ne produisent pas
encore une progression mécanique contrôlée et uniforme.

**Rythme :** du niveau 20 au 21 il faut 5 705 XP supplémentaires ;
du niveau 24 au 25, 8 285 XP. Une mission du rang maximal public 12
récompense normalement 120 XP, soit **au moins 70 missions de rang 12**
pour passer de 24 à 25 sans autres récompenses. Les accomplissements
exceptionnels doivent donc disposer d'une voie XP distincte, sans farming
et avec validation MJ ; cela reste une proposition à chiffrer.

## 4. Combat : banc comparatif exact de profils symétriques

Hypothèses **de test**, et non fiches canoniques : un coup physique par
round, arme de base 6, aucune guérison, pas de contre-attaque ni d'affinité,
opposants identiques, bonus de situation +2, spécialité +1 au niveau 5 puis
+2, maîtrises offensives 6 au niveau 5 puis 12, grades d'équipement 1 à 5.
Les scores d'attaque sont respectivement 9, 12, 12, 12 et 12.
La durée représente l'**espérance de jets nécessaires pour mettre 0 PV**,
avec touches et dégâts fixes ; elle n'est pas une simulation d'un combat complet.

| Duel symétrique | Défense | Absorption | Dégâts/touche | Réussite du toucher | PV | Rounds moyens pour retirer tous les PV |
|---|---:|---:|---:|---:|---:|---:|
| N5 contre N5 | 23 | 4 | 11 | 96,76 % | 36 | **4,1** |
| N10 contre N10 | 29 | 10 | 15 | 90,20 % | 66 | **5,5** |
| N15 contre N15 | 31 | 19 | 12 | 77,85 % | 114 | **12,8** |
| N20 contre N20 | 33 | 32 | 7 | 60,03 % | 174 | **41,6** |
| N25 contre N25 | 40 | 85 | 1 | 5,88 % | 306 | **5 206,7** |

**Alerte haute priorité :** pour deux combattants N25, même un coup de base
6 + maîtrise 12 + bonus de palier 68 = **86 dégâts bruts**, absorbés à **85**.
À +16 de précision, `P(5d6+16 ≥ 40) = 457/7 776 = 5,877 %`.
Retirer 306 PV en coups de 1 nécessite 306 touches, soit
`306 × 7776/457 = 5 206,7 rounds` en moyenne à une attaque/round.
Cela n'inclut ni fatigue, ni régénération ni interruptions, qui pourraient
rendre le duel encore plus lent ou non résoluble.
C'est un **contre-exemple mécanique mesuré**, pas une affirmation que
les êtres de niveau 25 sont narrativement obligés de se battre de cette façon.

## 5. Recommandations de conception à arbitrer, sans activation

**A. Caractéristiques (priorité 1).**
Comparer (i) un gain réduit avec recalibrage des profils existants,
(ii) un coût croissant des valeurs 9–12, (iii) une progression parallèle
en talents, réserves et options de maîtrise. Ne pas multiplier automatiquement
les bonus de jet : +12 de maîtrise ajouté à +12 de caractéristique supprimerait
presque toute incertitude devant 21–30.

**B. Combats élevés (priorité 1).**
Comparer deux réglages indépendants : chance de franchir une défense
équivalente (viser une fenêtre jouable sans gommer les écarts de niveau) et
dégâts après absorption. Une simple multiplication générale des dégâts
menacerait l'équilibre N5 contre N25. Calculer d'abord les rencontres
N5/N10/N15/N20/N25, les équipements et les capacités conditionnelles.

**C. XP et accomplissements (priorité 2).**
Prévoir des récompenses non martiales pour soin, diplomatie, exploration,
artisanat, secours et découvertes, en plus des missions ; rendre les
récompenses répétitives décroissantes et l'ascension 21–25
conditionnelle à un accomplissement et une validation distincts.

**D. Intégration (priorité 2).**
Ne pas toucher aux schémas `alrick.sheets.v1/v2`,
`alrick.campaign.v1`, à la clé
`archives-alrick-atelier-5d6-v1` ni au moteur de grimoire/multijoueur
tant qu'un contrat d'API versionné et des tests de migration ne sont pas adoptés.
Le nouveau `atelier5d6-probabilities.ts` est un module pur immédiatement
réutilisable : `sumOccurrences`, `probabilitySuccess`, `naturalCategory`,
`rollFiveDice(rng)`. **L'Atelier visuel n'en dépend pas encore**.

## 6. Validation et limites du présent lot

- Les 7 776 issues sont énumérées et comparées à une distribution obtenue
  par convolution.
- Tous les seuils 15–50 et bonus −4 à +24 (1 044 combinaisons)
  sont recroisés exactement.
- Le plafond des échecs naturels 5–7 est contrôlé.
- Le duel N25 est testé sur les **vraies fonctions TypeScript**
  `resistanceScore`, `effectiveProtection` et `resolveOpposition`.
- Le test vérifie qu'un générateur de dés injecté peut être déterministe.
- Aucun résultat de partie humaine n'est revendiqué.
- Aucune migration n'est nécessaire : les changements du premier lot
  n'affectent pas les fiches, les PV existants ou le comportement de l'Atelier.

**Prochaine décision :** valider un **objectif de durée de combat par
palier**, puis proposer 2–3 versions de rééquilibrage et comparer leurs
conséquences avant toute modification des formules publiées.
