# MAG-003.A — Moteur mathématique de récupération (rapport technique)

**Archives d'Alrick — 1er novembre 2026**  
**PR :** [#69](https://github.com/Sijiel44/archives-alrick/pull/69) (DRAFT) · **Branche :** magie/mag003a-recuperation-mana · **Base initiale :** 6967679b1dee5f6b9762bd6cc4378827d0ec975e  
**État :** code expérimental déposé, revue DG obligatoire. Ni fusion, ni publication, ni adoption canonique.

## Sources et indépendance

Inspection effective du code de main : atelier5d6-progression.ts (M01), atelier5d6-probabilities.ts (7 776 issues 5d6), atelier5d6-m02.ts, atelier5d6-combat-m03.ts, atelier5d6-bestiary.ts (M03), atelier5d6.inline.ts (réserves et fiches), M05_CONTRAT_MOTEUR_5D6.md, CONTINUITE_SAUVEGARDES.md et package.json. Sur la PR [MAG-002 #68](https://github.com/Sijiel44/archives-alrick/pull/68), étude de conception, décisions du créateur et architecture consultées sans fusion. PR [#55](https://github.com/Sijiel44/archives-alrick/pull/55) Grimoire et [#66](https://github.com/Sijiel44/archives-alrick/pull/66) Tables : ouvertes en brouillon lors de la vérification ; leurs branches restent intactes.

**Code livré :** quartz/components/scripts/atelier5d6-mana-recovery.ts (état, politiques, journal, coûts), atelier5d6-mana-expedition.ts (simulateur et résolveurs M01/M03), scripts/test-mag003a.mjs (tests sur TypeScript original bundlé par esbuild) et package.json (test:mag003a ajouté à npm test). Aucun changement des objets Grimoire, sauvegardes historiques ou contenu canonique.

## Contrat de récupération

Schéma de laboratoire : **alrick.mana.recovery.v1**. État sérialisable par personnage, journée de campagne explicite, mana actuel, maximum actuel, maximum de référence du début du jour, plafond de taux déjà obtenu, mana réellement récupéré depuis le début du jour, fractions en unités de 1/10 000, identifiants des repos et journal d'événements.

Formule de chaque récupération valide :

- plafondCumule = arrondiPolitique(maximumDuDébutDuJour × meilleurTauxAutorisé)
- gainRéel = min(maximumActuel − manaActuel ; max(0 ; plafondCumule − récupérationDéjàUtilisée))
- récupérationDéjàUtilisée augmente seulement du gain réellement effectué.
- Une dépense intermédiaire **ne diminue jamais** la récupération déjà utilisée.
- Un repos plus avancé **remplace** le taux atteint (maximum), sans addition indépendante.
- Le maximum du jour reste ancré : hausse de maximum en milieu de journée = zéro crédit rétroactif ; baisse = mana courant écrêté et budget déjà consommé conservé.

**Référence du créateur à tester (plafonds journaliers, pas des gains supplémentaires) :** premier repos court sûr 20 %, deuxième 40 % cumulés, court approfondi 40 %, rituel court exceptionnel 60 %, long ordinaire 50 %, retraite exceptionnelle 100 %. Maximum deux repos courts valides par jour ; chacun requiert une période distincte, une situation sûre et une pratique effectivement achevée. Approfondi et exceptionnel demandent une pratique structurée. Exceptionnel exige une validation MJ et une condition favorable explicite. Les rites non religieux utilisent la même sémantique mécanique de concentration. Le rituel ne produit pas de miracle ni d'accès au Cercle IX.

Deux autres politiques **non canoniques** : prudent (15/30/35/50/50/100 %) et ample (25/50/50/65/60/100 %). Toute politique possède un identifiant et une version. Les taux sont des nombres entiers sur 10 000, évitant l'accumulation de flottants pour les fractions de mana.

## Gestion des arrondis

- **exactCarry** : les fractions d'un plafond entier effectivement consommé sont reportées à la journée suivante ; le report appliqué est inclus dans le calcul du nouveau reste. Pour 35 mana et 50 % de repos long répété : 17 puis 18, puis 17 après dépense et changement de journée.
- **cycleAdjustment** : arrondi à l'inférieur chaque jour, attribution déterministe du reste seulement à la fin d'un cycle de deux journées ; pour le même cas : 17 puis 18.
- Un plafond non consommé parce que la jauge est presque pleine ne crée pas une banque de crédits entiers pour plus tard.
- Les changements de journée sont transactionnels et ne dépendent ni du navigateur ni du fuseau horaire ; export/import restitue les compteurs et les fractions.

## Contrat transactionnel

Chaque opération comprend ID unique, personnage, journée, type, pratique, validation (approbation, autorité, origine), mana avant/après, dépense, gain, budget journalier avant/après, politique et version, résultat accepté/refusé et motif. Une répétition de même ID retourne le reçu enregistré **sans rejouer** l'opération. Les refus sont consignés. Un repos interrompu via l'événement d'interruption rend sa période inutilisable.

**Limite d'autorité :** les attestations MJ sont des données du prototype local, jamais des permissions cryptographiquement vérifiées. Pas de garantie serveur multiutilisateur ni de prévention des révisions concurrentes. Les sauvegardes importées sont validées structurellement, non signées ; un serveur autoritaire et la validation MJ réelle constituent un chantier ultérieur.

## Coûts et dépendances moteur

Modèle C de MAG-002 implémenté sans toucher aux anciens coûts : mineur 2, significatif max(4, plafondEntierSupérieur(12 % du maximum)), majeur max(8, plafondEntierSupérieur(25 % du maximum)). Variante intensité : même tarification basée sur une **intensité librement choisie et bornée au maximum**, non sur la réserve totale. Cette intensité ne confère aucun sort, Cercle ou puissance M03 ; ces droits restent à vérifier séparément. Modèle témoin fixe 2/4/16 pour les comparaisons, non une migration.

Le simulateur consomme les fonctions de **M01** pour les actions ordinaires et de **M03** pour les confrontations, avec tirage par rollFiveDice et graine fixe. Les bonus proviennent exclusivement de effectiveStat/effectiveMastery, sans nouveau plafond à 12. M03 retourne des dégâts **proposés**, jamais appliqués automatiquement aux PV.

## Tests, limites et décision

Tests codés : niveaux 1, 5, 10, 15, 20, 25 (réserves automatiques 0/36/66/114/174/306) ; impairs, repos cumulés, dépenses, changement de journée, hausse/baisse maximum, interruptions, doublons, restauration JSON, mana nul et presque plein, anti-boucles, modèles de coûts, M01/M03 et deux stratégies d'arrondi. Vérification demandée : npm test incluant types, build, contrôles de contenu et régressions M01–M05. Les preuves réelles doivent être relevées dans la [CI de la PR #69](https://github.com/Sijiel44/archives-alrick/pull/69/checks) et sont distinctes d'une exécution humaine.

Arbitrages ouverts : durée et conditions d'un lieu sûr, vrai repos interrompu, rythme de campagne, grilles et choix d'arrondi, effet de l'intensité sur le sort, autorité serveur, recharge d'objets, séparation énergie/usages des matrices G-001 et recette humaine. **Aucune fusion, publication ou revendication de playtest humain.**

## 7. Résultat CI vérifié (mise à jour)

[Workflow GitHub #41318867816](https://github.com/Sijiel44/archives-alrick/actions/runs/41318867816) : **SUCCÈS** sur le code 9522eb2. npm test comprend la vérification TypeScript, le build et les régressions M01–M05 ; **181 assertions MAG-003.A réussies** ; recette navigateur M04.1 réussie. Aucun playtest humain exécuté. Les commits documentaires ultérieurs sont revérifiés sur la PR avant clôture.
