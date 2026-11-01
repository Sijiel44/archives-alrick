# B-003.1 — Protocole de recette mécanique 5d6

**Autorité de calcul :** les fonctions de `quartz/components/scripts/atelier5d6-combat-m03.ts` et `atelier5d6-bestiary.ts`. Le test `scripts/test-b0031-m03.mjs` charge le code installé via esbuild ; il ne réimplémente pas la résolution 5d6.

Les cas documentaires P02, P20, P21, P12 et P35 sont **des fixtures hypothétiques** ; P32 est une microfaune hors combat. Le choix d'un rôle `faune`, `predateur`, `gardien` ou `colosse` ne classe pas biologiquement une espèce. Les niveaux représentatifs 5, 10, 15, 20 et 25 montrent des **individus expérimentaux**, sans lien avec maturation, longévité, métamorphose, divinité ni obligation de fiche de combat.

Le test parcourt 26 sommes de dés avec coefficients de `sumOccurrences` (7 776 issues) et appelle `resolveCombatM03` pour les jets, la défense, la faisabilité, la protection et les dégâts. Il couvre l'échec naturel forcé, les candidats critiques, les taux de succès, la protection et des groupes de 1, 2 et 4 via une hypothèse simple d'attaques indépendantes. Les sommes de dégâts groupées ne simulent **ni initiative, ni terrain, ni IA, ni endurance, ni équilibre officiel**.

**Les mesures chiffrées de CI sont des résultats de fixture, pas des statistiques de créature canonique.** B-003.1 ne modifie ni le moteur M01–M05, ni les plafonds de caractéristiques, ni les fonctions d'armure.
