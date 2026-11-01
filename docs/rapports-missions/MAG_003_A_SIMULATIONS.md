# MAG-003.A — Simulations d'expédition et comparaison des politiques

**1er novembre 2026 · [PR #69](https://github.com/Sijiel44/archives-alrick/pull/69) · Statut : calculs automatisés, pas de playtest humain.**

## Protocole reproductible

Code vérifiable : scripts/test-mag003a.mjs exécute les sources TS par esbuild. Le simulateur est dans quartz/components/scripts/atelier5d6-mana-expedition.ts. Graine par défaut **20261101**, générateur congruentiel déterministe (1664525, 1013904223, modulo 2 puissance 32) et cinq tirages uniformes par jet via le vrai rollFiveDice M01. Pour des actions non aléatoires, aucune graine n'est nécessaire. Chaque événement donne un reçu, mana avant/après, plafond consommé et disponible, actions possibles/refusées et avertissements.

### Réserves légales de référence, sans nouvel octroi

Les niveaux 5+ proviennent de la fiche magique initiale N5 = 36, suivie des paliers historiques de ressources (+6, +12, +24 et +36 au N25). Le niveau 1 n'accorde **aucune réserve personnelle automatique** ; 12 est une hypothèse documentaire distincte.

| Niveau | Réserve du mage de référence | 20 % | 40 % | 50 % | 60 % | 100 % |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 (non-magique) | 0 | 0 | 0 | 0 | 0 | 0 |
| 5 | 36 | 7 | 14 | 18 | 21 | 36 |
| 10 | 66 | 13 | 26 | 33 | 39 | 66 |
| 15 | 114 | 22 | 45 | 57 | 68 | 114 |
| 20 | 174 | 34 | 69 | 87 | 104 | 174 |
| 25 | 306 | 61 | 122 | 153 | 183 | 306 |

Chiffres ci-dessus = plafonds individuels arrondis vers le bas, avant fractions transmises de journées précédentes ; ce sont des exemples de calcul, pas des victoires de playtest.

## Séquences déterministes

1. **Journée N5, 36 mana initialement vides :** repos court 20 % → 7 ; deuxième repos court → 14 au total ; dépense de 2 → 12 en jauge (budget utilisé reste 14) ; repos long ordinaire 50 % → +4 seulement, jauge 16 et 18 récupérés cumulés. Un nouveau repos long le même jour n'ajoute rien, même après une dépense. Le gain ne peut dépasser le mana manquant.
2. **Réserve impaire 35 :** journée 1 repos long 50 % → 17 ; journée 2 repos long 50 % → +18, total 35. Les stratégies exactCarry et cycleAdjustment garantissent cette propriété ; après dépense complète, la troisième journée récupère à nouveau 17, pas 18 supplémentaires à chaque jour.
3. **Hausse en cours de journée :** départ 36 mana maximum avec jauge 0, hausse du maximum à 306, puis repos long : +18 (budget basé sur 36), pas +153. Journée suivante : nouveau plafond de 153, soit 171 mana cumulés. Baisse du maximum à 10 : jauge écrêtée à 10, budget déjà utilisé conservé.
4. **Tentative de boucle :** deux repos courts par jour maximum. Soixante-dix-neuf repos courts supplémentaires avec identifiants distincts n'ouvrent aucun crédit ; une répétition de transaction retourne le même reçu ; plusieurs repos longs dans la journée ne contournent pas les 50 %.
5. **Rite exceptionnel :** une attestation de simulation ne vaut pas validation MJ, même si le lieu est marqué favorable. Une pratique structurée avec approbation MJ peut recevoir 100 % selon la politique de laboratoire ; ce privilège doit être réglé éditorialement.
6. **Interruption :** l'événement d'interruption ferme l'identifiant de période. Une reprise sous le même identifiant est refusée ; pas de crédit de mana.
7. **Reprise/export :** le JSON versionné conserve la journée, le budget, les fractions et les reçus. Les sauvegardes historiques de l'Atelier restent séparées.

## Coûts expérimentaux

| Réserve | Significatif C (12 %) | Majeur C (25 %) | Significatif utilitaire avec intensité 36 | Majeur avec intensité 36 |
| ---: | ---: | ---: | ---: | ---: |
| 36 | 5 | 9 | 5 | 9 |
| 66 | 8 | 17 | 5 | 9 |
| 114 | 14 | 29 | 5 | 9 |
| 174 | 21 | 44 | 5 | 9 |
| 306 | 37 | 77 | 5 | 9 |

Geste mineur : 2 partout. Modèle fixe témoin A (non canonique) : 2/4/16, uniquement comme témoin. **Sécurité importante :** le simulateur refuse un usage de l'intensité réduite en M03 combat sans correspondance entre l'intensité payée et un niveau d'effet inférieur explicite. Par exemple le porteur N25 utilisant une intensité 36 peut simuler un impact basé sur le niveau d'effet 5 ; il ne peut pas payer 9 mana puis obtenir automatiquement l'impact d'une manifestation N25. Les sorts utilitaires ne déduisent aucun bonus d'effet du mana payé.

## Comparaison des politiques

Trois grilles de laboratoire sont comparées sur les **mêmes suites de pratiques et les mêmes profils** :

| Grille | Premier court | Second court cumulatif | Court approfondi | Rituel court exceptionnel | Long ordinaire | Retraite exceptionnelle |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Référence | 20 % | 40 % | 40 % | 60 % | 50 % | 100 % |
| Prudente | 15 % | 30 % | 35 % | 50 % | 50 % | 100 % |
| Ample | 25 % | 50 % | 50 % | 65 % | 60 % | 100 % |

**Première pause N25 depuis 0 :** prudent 45, référence 61, ample 76 mana. Les autres variantes restent à jouer avec de véritables contraintes de durée, de sécurité, de combats et de ressources. La grille de référence se recommande **provisoirement comme point de départ**, parce qu'elle correspond aux préférences C-01 du créateur ; les trois restent réversibles, sans décision canonique.

## Tests et qualification

Matrice automatisée : N1/N5/N10/N15/N20/N25 ; deux courts ; dépense après repos ; long après court ; changement de jour ; maximum variable ; doublon ; repos interrompu ; absence de mana ; mana presque plein ; export/import ; récupération infinie ; coûts fixes et proportionnels ; M01 et M03 ; reproductibilité de graine. Aucun test de joueurs humains, ni intégration des objets/Grimoire ni contrôle multijoueur revendiqués.

**Preuve CI :** consulter [les checks de la PR #69](https://github.com/Sijiel44/archives-alrick/pull/69/checks) et la page de pilotage MAG_003_PILOTAGE_DIRECTION.md pour le dernier état. Les chiffres sont des calculs/simulations automatisées, jamais des observations de terrain.

## Résultat CI vérifié

La [CI GitHub #41318867816](https://github.com/Sijiel44/archives-alrick/actions/runs/41318867816) est **verte** sur le code 9522eb2 : 181 assertions MAG-003.A, types, build, M01–M05 et recette navigateur automatisée M04.1. Ces essais ne constituent pas un playtest humain.
