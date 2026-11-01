# MAG-002 — Arbitrages du créateur et décisions encore ouvertes (Phase C)

**Statut :** orientation du créateur recueillie le **1er novembre 2026** pour les coûts C et la récupération par repos / prière. **La phase C demeure ouverte** : les garde-fous détaillés ci-dessous sont des propositions techniques à confirmer avant implémentation ou canonisation.

## C-01 — Orientation du créateur : économie et récupération

**Choix exprimés explicitement par le créateur :**

- Préférence pour le **modèle C hybride de coûts** (geste mineur fixe ; impact évolutif tarifé proportionnellement à la réserve). Le calibrage de chaque catégorie reste soumis aux playtests.
- **Repos court dans un lieu sûr : 20 % de la réserve maximale**, envisageable **deux fois par jour**.
- **Repos prolongé ordinaire : 50 % de la réserve maximale par journée**. Parti de zéro, le personnage a donc besoin de deux jours de repos prolongé pour remonter à 100 %.
- **Repos prolongé avec prière : possibilité de retrouver 100 % en une journée**.
- **Repos court sûr avec prière : récupération accélérée pouvant aller de 20 % à 60 %**, suivant le contexte et la qualité de la pratique. Le détail des paliers reste à définir.

**Proposition de mise en forme pour les playtests (anti-cumul, à confirmer par le créateur) :**

| Activité terminée en sécurité | Plafond de récupération sur la journée, en % de `manaMax` | Condition indicative |
| --- | ---: | --- |
| Un premier repos court | 20 % | Pause effective ; lieu sûr |
| Deux repos courts | 40 % au total | Deux pauses distinctes, pas de duplication artificielle |
| Repos court + prière / méditation structurée | 40 % au total | Une pratique intentionnelle, véritable temps consacré |
| Repos court + rituel en lieu particulièrement favorable | 60 % au total | Condition rare et explicite, soumise au MJ |
| Journée de repos prolongé sans pratique spéciale | 50 % au total | Journée calme, sûreté, absence d'interruption majeure |
| Journée de repos prolongé + prière / méditation structurée | 100 % au total | Une journée complète de repos et une pratique dédiée |

- **Non-cumul journalier :** les pourcentages sont des **plafonds de mana effectivement restauré pendant la journée**, pas des bonus librement additionnables. Exemple : deux repos courts à 20 % puis une journée longue à 50 % ne rendent pas 90 % : le repos long complète la récupération journalière jusqu'à **50 %** (sous réserve d'un manque réel de mana).
- Chaque récupération est plafonnée par `manaMax - manaActuel`. En laboratoire, comptabiliser le **mana restauré durant la journée** et les deux créneaux de repos court ; les ressources dépensées après une pause ne recréent pas le budget de récupération de la même journée.
- L'arrondi de laboratoire proposé est `floor(pourcentage × manaMax)`, cohérent avec les exemples antérieurs 36→7 et 306→61 pour 20 %. Aucune réserve de mana ne donne accès automatiquement à un sort, à un Cercle ou à la reconnaissance divine.
- « Prière » ne signifie pas gain de foi, miracle garanti, pacte divin ou accès au Cercle IX. **Pour l'équité des traditions**, un rite magique ou une méditation conforme à la culture du personnage peut être présenté au créateur comme alternative ; cette équivalence n'est pas encore tranchée.
- **Repos interrompu**, seuil d'un « lieu sûr », durée effective des pauses, niveaux de difficulté d'un rituel, effets d'un sanctuaire, potions/objets et récupération lors d'une expédition restent à arbitrer. Aucun mana d'objet n'est automatiquement restauré par repos personnel.

**Exemples d'énergie seulement, sans accès garanti aux sorts :**

| `manaMax` | 20 % | 40 % | 50 % | 60 % | 100 % |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 36 (N5 magique) | 7 | 14 | 18 | 21 | 36 |
| 306 (N25 magique) | 61 | 122 | 153 | 183 | 306 |

**Relation aux études antérieures :** le **R2 initial** « +20 % une fois par expédition puis repos long complet » reste dans l'audit comme **alternative historique comparée**, mais **n'est plus la proposition préférée** après la préférence du créateur : les nouvelles hypothèses s'organisent par journée et tiennent compte des prières. Rien ici ne modifie le moteur M01–M05, G-001, les sauvegardes ou les fichiers canoniques.

## C-02 — Autres décisions ouvertes

Les points ci-dessous restent à arbitrer ou à tester avant toute phase D :

1. **Réserve** : conserver la courbe actuelle d'un mage (N5 36 → N25 306) ou la modifier ? Les hybrides disposent-ils de la même réserve avec moins de maîtrise, ou d'une réserve différente ? Les personnages non-mages peuvent-ils accéder à une réserve personnelle par apprentissage, sans création d'une classe obligatoire ?
2. **Coûts** : **préférence C exprimée**, à calibrer par playtests : geste fixe, significatif max(4, ceil(12 % R)), majeur max(8, ceil(25 % R)). Les coûts varient-ils avec l'intensité réellement choisie, plutôt qu'avec le niveau seul ? Quel est l'effet du niveau sur une magie volontairement retenue, sans contredire M03 ?
3. **Récupération** : **orientation du créateur décrite en C-01** ; confirmer les paliers de prière, non-cumul quotidien, durée de repos, arrondis, potions, objets rechargeables, récupération de combat, repos interrompu et lieux énergétiques.
4. **Geste mineur** : coût 2 de démonstration, 1, coût nul sous condition, ou capacité de métier non-magique ? Toute gratuité doit avoir une restriction de portée, durée et de fréquence ou de faisabilité pour ne pas effacer les outils et les connaissances.
5. **Charge et énergie MAG-050 / DG04-06** : la charge est-elle une unité d'énergie, un nombre d'activations, ou les deux ? `energySource=caster` peut-il activer si `charges=0` ? Quelle règle lors d'un échec ? **Ne modifier aucune donnée G-001 avant réponse.**
6. **Concentration et objet** : une matrice autonome doit-elle être maintenue par son porteur, son énergie propre, le fabricant ou un opérateur distinct ? Que se passe-t-il si l'objet est détruit/transféré pendant l'effet ?
7. **Règles d'apprentissage** : quels gestes un débutant peut-il improviser, dans quelles disciplines ? Qu'est-ce qui exige validation MJ, essai expérimental, formation ou laboratoire ? Comment récompenser la recherche avec les aptitudes M02 sans doubler le budget M01 ?
8. **Cercle IX** : quelle preuve de reconnaissance divine est admissible ? Quel comportement précis pour les artefacts de conception IX ? La séparation d'avec niveau 25 et MAG-050 n'est pas négociable.
9. **Création d'objets** : matériaux, temps, échecs, dangers, entretien, recharges, limites de matrices, état après perte et transfert, infrastructure de bâtiments et travail collectif.
10. **Playtests avant développement** : nombre de sorts jouables dès N5, nombre souhaité d'actions significatives par scène, longueur d'expédition, préférence de simplicité de l'interface, bilan non-combattant et histoire des sauvegardes.

**Conseil technique non canonique :** accepter d'abord un laboratoire calculant A/B/C sur les mêmes scènes, sans changement de courbe ou de mécanique M03. Ensuite seulement figer une politique versionnée, rédiger une matrice de migration de sauvegardes et programmer l'Atelier d'enchantement.
