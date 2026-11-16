# MATH-EFF-001 — Rapport d'audit, interopérabilité et mesure d'équilibre

**État : livré pour contre-audit, non homologué.** Date : 16 novembre 2026. Dépôt `Sijiel44/archives-alrick` ; SHA de lancement imposé `8d4ae50e059d38b568ac5b04a576a6bd6a27b347`. Le `main` observé **avant intervention** est `8acc0079ace9da502d022dedc904eda1c02cfa31` (quatre commits de plus, historique compatible). Tous les liens source ci-dessous pointent vers ce dernier SHA figé. Branche de travail documentaire indépendante ; aucun changement de formule ni de module runtime.

## Synthèse exécutable

**Le moteur commun existe déjà en grande partie : M03 est une fonction pure et Grimoire et Studio l'utilisent.** Les raccords manquants sont surtout un contrat versionné de provenance des effets, une politique de dépense/restauration et les modèles d'intensité/temps de combat. Il serait risqué de réécrire M03 alors que le Grimoire et Studio l'appellent.

**Constats majeurs :**

1. M01/M02 distinguent caractéristique brute, rang de maîtrise et bonus effectif ; M03 hérite des bonus logarithmiques et du jet 5d6. Les niveaux ne sont pas des bonus plats de touche.
2. M03 réutilise **un seul jet pour touche puis dommages calculés**, pas de second lancer. Défense d'opposition et protection sont séparées ; pénétration n'augmente jamais la chance de toucher.
3. `mental` ne cause **aucun PV** par défaut et propose seulement un effet ; les 5–7 échouent toujours et les 27–30 ne garantissent ni touche ni dégâts.
4. `absorption` figure parmi les effets reconnus et peut être approuvée par M03, mais **n'est pas consommée** par sa fonction de combat. Ce n'est pas une absorption chiffrée opérationnelle : décision de conception indispensable.
5. Le tableau de 18 scénarios exacts montre des gains mesurables de maîtrise, mais une montée des PV au niveau 25 qui impose **26,2 actions moyennes** dans le duel de référence (rang formé, base 6). La stratégie de durée doit traiter PV, nombre d'attaques et catégories d'opposants, sans multiplier aveuglément les dégâts.

## 1. Traçabilité des sources vérifiées

| Source du dépôt (SHA figé) | Contrat réellement présent / point d'attention |
|---|---|
| [M01 progression](https://github.com/Sijiel44/archives-alrick/blob/8acc0079ace9da502d022dedc904eda1c02cfa31/quartz/components/scripts/atelier5d6-progression.ts) | `effectiveStat`, `effectiveMastery`, `resolveProgressionAction`, budgets et jalons ; valeurs 5d6 |
| [M02 capacités et développement](https://github.com/Sijiel44/archives-alrick/blob/8acc0079ace9da502d022dedc904eda1c02cfa31/quartz/components/scripts/atelier5d6-m02.ts) | `AbilityDefinition`, validation des actions et états `defined`/`slot` ; validation MJ |
| [M03 combat](https://github.com/Sijiel44/archives-alrick/blob/8acc0079ace9da502d022dedc904eda1c02cfa31/quartz/components/scripts/atelier5d6-combat-m03.ts) | `resolveCombatM03`, `resistanceScoreM03`, `effectiveProtectionM03`, `validateM03AbilityEffect` ; absorption inactive |
| [Moteur d'opposition historique](https://github.com/Sijiel44/archives-alrick/blob/8acc0079ace9da502d022dedc904eda1c02cfa31/quartz/components/scripts/atelier5d6-opposition.ts) | Protéctions anciennes **incompatibles** avec la protection moderne ; ne pas supprimer, ne pas fusionner |
| [Grimoire v1](https://github.com/Sijiel44/archives-alrick/blob/8acc0079ace9da502d022dedc904eda1c02cfa31/quartz/components/scripts/atelier5d6-grimoire.ts) | `Spell`, éligibilité, Cercles attestés, mana, matrices et `resolveSpellCast` vers M03 ; `demo-etincelle` foudre et non canonique |
| [Bestiaire M03](https://github.com/Sijiel44/archives-alrick/blob/8acc0079ace9da502d022dedc904eda1c02cfa31/quartz/components/scripts/atelier5d6-bestiary.ts) | PV par niveau et profils de créatures M03 ; N25=306 PV de base |
| [Adaptateur Studio local](https://github.com/Sijiel44/archives-alrick/blob/8acc0079ace9da502d022dedc904eda1c02cfa31/studio-local/opposition.mjs) | Converge vers M03 avec cinq dés et cible Bestiaire |
| [Journal et contrôles Studio](https://github.com/Sijiel44/archives-alrick/blob/8acc0079ace9da502d022dedc904eda1c02cfa31/studio-local/store.mjs) | Validation des oppositions, opérations `record-opposition`, cohérence des PV, intégrité à restaurer |
| [Banc officiel M03](https://github.com/Sijiel44/archives-alrick/blob/8acc0079ace9da502d022dedc904eda1c02cfa31/scripts/test-5d6-m03.mjs) | 7 776 combinaisons et duels/affrontements multi-acteurs à graine fixe |

Antécédents à reprendre sans les canoniser : dossier MATH-001 R1 (question des effets défensifs) et proposition MATH-002 (enveloppe `EffectDefinition/EffectInstance`, hypothèses de budget d'effet renforcé 21–25). Ces études **n'ont pas autorisé** le doublement des dégâts ni les coûts expérimentaux.

## 2. Formules et protections auditables, sans modification

### Touche / opposition

`E(c)=floor(3 log2(1+c/3))`; `M(r)=floor(log2(1+r))`; `J=5d6 + E + M + situation[-2..2] + précision[0..2]`. Seuil `S=max(DD[15..30],minimumMJ[0..45],R)`, avec `R=15+E(caractéristique_défensive)+M(meilleure_maîtrise_défensive)+bonusMJ[0..8]`, plus meilleur effet de défense homologué 0–2. Échec naturel 5–7. Les 27–30 sont des *potentiels* critiques ; aucune réussite automatique si impossible.

### Impact et dégâts

`D_bruts = base[1..12] + floor(0.7 × N[1..25]) + M(r) + meilleur impact homologué [0..2] + bonus_affinité_magie[0..10]`. `protection = innée + équipement + protection_contextuelle`, avec rendement décroissant. `Pénétration = min(protection, penetration_base[0..8] + meilleure pén_homologuée[0..2])`. `D_net=max(0,D_bruts-max(0,protection-Pénétration))`. Seule la touche réussie peut créer des dégâts. **Mental=0 PV**, même si des champs numériques sont fournis.

### Protéger les limites

- `validateM03AbilityEffect` exige statut défini, description/effet/limites, approbation MJ et rang validé ; magnitudes 1–2, durées 1–3 tours, déclencheur type.
- Le résolveur M03 ne prouve pas lui-même qu'un objet a été créé ou qu'un effet `approved:true` vient du bon acteur ; cette vérification incombe à un adaptateur INDEX/MJ qui contrôle source/révision/ownership.
- `effects` sert à la fois aux effets d'attaque et de défense ; l'adaptateur doit construire un snapshot contrôlé **à partir de deux propriétaires**, jamais l'accepter depuis une importation opaque.
- Le code **n'utilise pas** `absorption` pour les dégâts : l'interface donne une impression de prise en charge qui doit être corrigée, documentée ou dépréciée après arbitrage.
- Grimoire a une sémantique de tentative payante après confirmation du lancement ; Studio a une confirmation distincte d'application. Une transaction universelle ne doit pas débiter deux fois ni laisser un jet gratuit.
- Le type `Spell` actuellement implémenté distingue `circle`, `minimumMastery`, affinité et niveau du porteur, mais **ne fournit pas un champ des neuf degrés narratifs d'école**. L'adaptateur devra l'ajouter comme métadonnée attestée, sans réinterpréter l'un des champs existants. La validation `minimumMastery` sur les créations locales est historiquement bornée à 12 : ce n'est **pas** un plafond de caractéristique ni un rang maximum de personnage, mais mérite une recette pour les maîtrises avancées.

## 3. Simulations exactes — 5d6, profils de maîtrise, six niveaux

**Méthode reproductible :** `node scripts/test-math-eff-001.mjs` utilise les vraies fonctions M01/M03/Bestiaire et la distribution **exacte** des 7 776 résultats à cinq dés, sans Monte-Carlo. Modèle fictif : `caractéristique=3+floor(.55(N-1))`, attaquant rang formé `floor(.45(N-1))`, défenseur même niveau et même rang, grade physique `min(5,floor(N/5))`, DD=21, mode mêlée physique, base 6, aucun effet, situation 0, cible `baseHealth(N)`. Les valeurs « actions » sont **PV / dégâts attendus par action** : estimation de charge offensive, non une médiane de tours ni une prédiction du temps réel. N1/5/10/15/20/25, trois rangs (débutant 0, formé, spécialiste `floor(.8(N-1))`). Les profils ne sont **pas** des budgets de progression attestés.

| N | PV de référence | Maîtrise formée `r/M` | Touche | Dégâts/action | Actions pour PV entiers | Actions si base=12 | Tours si 3 alliés (base 6) |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 12 | 0 / 0 | 50,0 % | 3,00 | 4,0 | 2,0 | 1,3 |
| 5 | 36 | 1 / 1 | 69,5 % | 6,25 | 5,8 | 3,5 | 1,9 |
| 10 | 66 | 4 / 2 | 77,9 % | 9,34 | 7,1 | 4,7 | 2,4 |
| 15 | 114 | 6 / 2 | 77,9 % | 10,12 | 11,3 | 7,7 | 3,8 |
| 20 | 174 | 8 / 3 | 77,9 % | 11,68 | 14,9 | 10,6 | 5,0 |
| 25 | 306 | 10 / 3 | 77,9 % | 11,68 | **26,2** | 18,7 | 8,7 |

**Effet de maîtrise à caractéristiques et cibles identiques :**

| Niveau | Débutant rang 0 | Formé | Spécialiste | Effet constaté |
|---:|---:|---:|---:|---|
| 1 | 3,00 dégât/action | 3,00 | 3,00 | Impossible de différencier à N1 dans ce profil (rangs 0) |
| 5 | 4,80 | 6,25 | 7,79 | Précision + dégâts augmentent |
| 10 | 6,00 | 9,34 | 11,02 | Maîtrise sensible, sans `+1/niveau` |
| 15 | 6,60 | 10,12 | 11,87 | Progrès par paliers |
| 20 | 6,00 | 11,68 | 13,57 | Sans maîtrise, protection et défense pèsent davantage |
| 25 | 6,00 | 11,68 | 13,57 | N25 spécialiste encore ≈22,6 actions pour 306 PV |

**Interprétation :** maîtrise effectivement utile sur chance de touche et dommages (résolution logarithmique), mais **paliers**, pas croissance linéaire continue. La progression **des rangs** peut être presque régulière, sans promettre un bonus au jet chaque niveau. Pour rendre les écarts plaisants, compléter par des options techniques et contrôles **débloqués par paliers**, à définir par CAP/MAG plutôt que gonfler les dégâts automatiquement.

### Trois voies de combats plus courts, à prototyper et faire arbitrer

| Option | Gain observé dans le banc N25 formé | Coût/risque | Statut |
|---|---|---|---|
| **A. Qualifier les PV des rencontres ordinaires** : ennemis/escarmouches vs élites/boss, ex. hypothèse à **50 %** des PV de base | 26,2 → ≈13,1 actions | Réviser modèle HP/créatures ; non trivial pour survie PJ | Expérimental |
| **B. Valoriser le groupe / actions concertées** : 3 attaques alliées par round sur même réserve | 26,2 actions → ≈8,7 rounds (fortement approximatif) | Économie d'actions et défenses de groupe ; pas un duel 1v1 | Déjà possible, rythme à tester |
| **C. Accroître l'impact via une capacité *coûteuse* et homologuée** : tester seulement l'extrémité autorisée `baseDamage=12` | 26,2 → ≈18,7 actions, soit encore beaucoup | Coûts, conditions, résistance, objets et mana non arbitrés | Réservé ; pas d'activation |

En vrai, choix de cible, contrôle, retraite, seuil de déroute, objectifs non létaux et scènes à enjeu peuvent raccourcir les *combats* plus que les PV seuls. **Cible de design candidate à arbitrer : 3–6 rounds escarmouche, 6–10 rounds élite, boss plus long mais optionnel.** Ce sont des objectifs de recette humaine, pas des règles effectives. Il faut mesurer duels 1v1, groupe 2v2/3v1, mental et adversaires déséquilibrés, puis approuver une option. Pas de coup critique automatique ni dégâts x16.

## 4. Étincelle et comparaisons de sources

`MAG-SORT-001` = **feu**, Cercle I, rang d'école du feu. Son usage offensif passe par la même touche/résistance/protection M03. **Aucune statistique réelle du sort n'est ici attestée.** Dans le banc, DD=21, base=6, mana réservé **uniquement comme valeurs d'essai communes aux autres sources**. `demo-etincelle` du Grimoire correspond à une décharge de **foudre** non canonique ; son mana 4, son impact 3 et ses autres réglages ne migrent jamais vers le sort feu.

Les six types testés : attaque ordinaire, capacité physique homologuée, capacité magique, sort feu fictif, arme enchantée avec effet homologué, attaque de créature. S'ajoutent l'objet purement descriptif **sans aucun bonus**, un acte mental **sans dégâts PV**, échec naturel, impossibilité narrative et approbation MJ absente. Tous invoquent le **vrai** `resolveCombatM03`. Le banc ne crée pas de module d'effets de production et ne dépense aucune ressource.

Voir la [matrice d'adaptateurs](MATH_EFF_001_MATRICE_INTEROP.md) et le [contrat transversal](MATH_EFF_001_CONTRAT_EFFETS_V0.md).

## 5. Recettes et risques de régression

Exécution locale contrôlée : `npm ci --no-audit --no-fund` (dépendances depuis le verrou), `npm run test:m03` **PASS** avant modifications ; `node scripts/test-math-eff-001.mjs` **PASS** (6 origines, 18 profils, 7 776 issues, garde-fous objets/mental/MJ, constat absorption et séparation Étincelle feu/foudre). **`npm test` PASS (code de sortie 0)** : contenu, types, build Quartz, liens du site, organisation, antagonistes, bestiaire, PNJ, 5d6, M01–M05, Grimoire et MAG-003.A–E. C'est un contrôle automatisé : **aucune recette Chrome ou humaine nouvelle n'a été exécutée**. L'exécution de build a généré les fichiers locaux habituels ; aucun site n'a été mis en ligne.

**Risques à couvrir lors de l'intégration ultérieure :** changer les imports Grimoire et Studio en même temps, bonus fictif `approved:true`, accumulation d'enchantements, charge consommée deux fois à la reconnexion, plusieurs onglets, exposition de secrets MJ, état mental appliqué comme dégâts, validation de niveaux/Cercles/écoles confondus, déplacement de champs lors de migrations et réparations legacy.

## Verdict technique

**Recevable pour expérimentation documentaire et recette, pas pour homologation ni livraison fonctionnelle.** Conserver M03 comme moteur commun et ajouter en premier le contrat de sources/version/autorisation, puis une UX à un jet et deux gestes. Arbitrer absorption, économie des ressources, échelles de puissance et rythme avant toute migration de données ou déploiement du site.
