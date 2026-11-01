# MAG-002 — Arbitrages à soumettre au créateur (Phase C)

**Statut :** ouvert. Ces questions doivent être tranchées **avant** toute implémentation et toute canonisation.

1. **Réserve** : conserver la courbe actuelle d'un mage (N5 36 → N25 306) ou la modifier ? Les hybrides disposent-ils de la même réserve avec moins de maîtrise, ou d'une réserve différente ? Les personnages non-mages peuvent-ils accéder à une réserve personnelle par apprentissage, sans création d'une classe obligatoire ?
2. **Coûts** : garder un barème fixe ; appliquer des pourcentages aux effets à impact évolutif ; ou tester le compromis **C (geste fixe, significatif max(4, ceil(12 % R)), majeur max(8, ceil(25 % R)))** ? Les coûts varient-ils avec l'intensité réellement choisie, plutôt qu'avec le niveau seul ? Quel est l'effet du niveau sur une magie volontairement retenue, sans contredire M03 ?
3. **Récupération** : R0 (repos long), R1 (petites récupérations par scène), R2 (20 % une fois par expédition + repos sûr long, chiffres expérimentaux) ? Quelles limites pour potions, objets rechargeables, récupération de combat, repos interrompu et lieux énergétiques ?
4. **Geste mineur** : coût 2 de démonstration, 1, coût nul sous condition, ou capacité de métier non-magique ? Toute gratuité doit avoir une restriction de portée, durée et de fréquence ou de faisabilité pour ne pas effacer les outils et les connaissances.
5. **Charge et énergie MAG-050 / DG04-06** : la charge est-elle une unité d'énergie, un nombre d'activations, ou les deux ? `energySource=caster` peut-il activer si `charges=0` ? Quelle règle lors d'un échec ? **Ne modifier aucune donnée G-001 avant réponse.**
6. **Concentration et objet** : une matrice autonome doit-elle être maintenue par son porteur, son énergie propre, le fabricant ou un opérateur distinct ? Que se passe-t-il si l'objet est détruit/transféré pendant l'effet ?
7. **Règles d'apprentissage** : quels gestes un débutant peut-il improviser, dans quelles disciplines ? Qu'est-ce qui exige validation MJ, essai expérimental, formation ou laboratoire ? Comment récompenser la recherche avec les aptitudes M02 sans doubler le budget M01 ?
8. **Cercle IX** : quelle preuve de reconnaissance divine est admissible ? Quel comportement précis pour les artefacts de conception IX ? La séparation d'avec niveau 25 et MAG-050 n'est pas négociable.
9. **Création d'objets** : matériaux, temps, échecs, dangers, entretien, recharges, limites de matrices, état après perte et transfert, infrastructure de bâtiments et travail collectif.
10. **Playtests avant développement** : nombre de sorts jouables dès N5, nombre souhaité d'actions significatives par scène, longueur d'expédition, préférence de simplicité de l'interface, bilan non-combattant et histoire des sauvegardes.

**Conseil technique non canonique :** accepter d'abord un laboratoire calculant A/B/C sur les mêmes scènes, sans changement de courbe ou de mécanique M03. Ensuite seulement figer une politique versionnée, rédiger une matrice de migration de sauvegardes et programmer l'Atelier d'enchantement.
