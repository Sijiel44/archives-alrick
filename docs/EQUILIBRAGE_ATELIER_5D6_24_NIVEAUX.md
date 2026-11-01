# Playtest : les 25 niveaux de l'Atelier 5d6

> **Note :** le nom du fichier conserve « 24 » pour préserver les liens existants ; le contenu décrit maintenant **25 niveaux**, cinq épreuves divines, des PV croissants et une protection naturelle distincte de l'équipement.

**Statut : prototype non canonique, en révision.** Les chiffres ci-dessous décrivent la mécanique d'une campagne autonome. Ils ne rehaussent rétroactivement ni Orin ni aucun autre personnage de l'Odyssée.

## Intentions de puissance

Un **aventurier niveau 1** est déjà formé et nettement plus capable qu'un habitant ordinaire non entraîné. Les premiers niveaux sont relativement rapides ; les derniers requièrent formation, actes, relations et épreuves beaucoup plus rares. Il n'existe pas d'ascension automatique par accumulation de petites quêtes.

| Niveaux individuels | Lecture narrative | Proposition de validation |
|---|---|---|
| 1–4 | Aventurier hors du commun ; premiers exploits | Contrats diversifiés, débriefing, entraînement |
| 5–8 | Héros local, spécialiste confirmé | Missions soutenues et apprentissage documenté |
| 9–12 | Figure régionale exceptionnelle | Plusieurs missions complexes et nouveau mentorat |
| 13–16 | Personnage de légende | Arcs durables, coût ou responsabilité réel |
| 17–20 | Très rare, mythique | Épreuves majeures et reconnaissance dans le monde |
| 21–25 | **Élite divine ou proche du divin** | **Validation MJ**, contexte cosmologique pertinent, épreuves uniques, pouvoirs explicitement approuvés |

Ces échelles ne sont **ni des grades de la guilde ni des statuts de divinité légaux ou canoniques**. En particulier, un chiffre de niveau ne confère aucun Cercle magique, aucune souveraineté, aucune autorité divine.

## Caractéristiques : 6 points par niveau et plafond 12

Création : **12 points** entre Physique, Agilité, Esprit et Présence (chaque score de 1 à 5). Chaque niveau **gagné** apporte **6 crédits de caractéristiques** :

- Total acquis au niveau `n` = `12 + 6 × (n - 1)`.
- Chaque caractéristique reste plafonnée à **12**, donc **48 points de base dépensables au maximum**.
- À partir du moment où les crédits excèdent les quatre plafonds, le surplus est conservé en réserve. **6 crédits inutilisés peuvent être convertis volontairement en 1 point de talent** à attribuer à une capacité narrative validée avec un MJ. Cette conversion ne donne pas de bonus direct aux dés.
- Un nouveau niveau donne aussi **2 points de maîtrise spécialisée** (9 spécialités à la version actuelle). Les maîtrises vont de 0 à 12, sans modifier **automatiquement** le calcul de jet tant que leurs effets ne sont pas équilibrés.

| Niveau | Crédits caractéristiques cumulés | Points de maîtrise cumulés | PV max si base 12 et aucune correction |
|---:|---:|---:|---:|
| 1 | 12 | 0 | 12 |
| 5 | 36 | 8 | 36 |
| 7 | 48 | 12 | 48 |
| 12 | 78 | 22 | 78 |
| 20 | 126 | 38 | 174 |
| 24 | 150 | 46 | 270 |

Les PV et le mana montent selon **+6 par niveau jusqu'au niveau 12**, **+12 des niveaux 13 à 20**, **+24 des niveaux 21 à 24**, puis **+36 au niveau 25**. Le maximum de mana n'augmente que pour une fiche dotée d'une réserve magique existante. Le MJ peut modifier les valeurs absolues selon les espèces, blessures ou dons, sans créer rétroactivement des capacités canoniques.

**Migration :** la sauvegarde conserve le `highestLevel`, les réserves de PV/mana, portraits, dons, notes et les champs historiques. Lors d'une mise à jour de l'outil, les anciens niveaux n'attribuent pas automatiquement un « rappel » de PV ou mana : seul un **nouveau niveau** applique la nouvelle progression.

## Expérience : paliers de plus en plus longs

L'Atelier enregistre des **XP cumulés**, séparés des niveaux de groupe. Le seuil proposé pour accéder au niveau `n` est `5 × (n − 1)³`, sans plafond d'expérience fictif imposé au monde.

| Niveau atteint | XP cumulés nécessaires |
|---:|---:|
| 2 | 5 |
| 3 | 40 |
| 5 | 320 |
| 12 | 6 655 |
| 20 | 34 295 |
| 24 | 60 835 |

Les missions réussies ou conclues par un repli responsable accordent, **à titre de playtest**, `10 × rang de mission` XP aux personnages joueurs actuellement membres de la compagnie. Un échec n'en accorde pas automatiquement. Le MJ peut corriger l'expérience en mode MJ ; la progression des niveaux 21 à 24 reste **conditionnée aux épreuves divines**, même avec assez d'XP.

Ce barème est volontairement raide et doit être éprouvé en campagne longue : il peut nécessiter des gains plus élevés pour des arcs majeurs (pas pour les petites tâches répétitives), afin que le système récompense l'importance narrative plutôt que le « farming » de contrats.

## Vraies probabilités des 5d6 (énumération exhaustive)

Les 5 dés ont **7 776 combinaisons**. Le jet naturel 5 reste un échec exceptionnel quels que soient les bonus. Le banc d'essai exécutable est `scripts/test-5d6-balance.mjs`, lancé par `npm test`.

| Difficulté | Bonus +1 (habitant peu formé) | Bonus +3 (aventurier novice) | Bonus +12 (spécialiste) | Bonus +24 (hypothèse non activée) |
|---:|---:|---:|---:|---:|
| 21 | 30,52 % | 50,00 % | 99,28 % | 99,73 % |
| 24 | 9,80 % | 22,15 % | 94,12 % | 99,73 % |
| 27 | 1,62 % | 5,88 % | 77,85 % | 99,73 % |
| 30 | 0,08 % | 0,72 % | 50,00 % | 99,73 % |
| 36 (seuil exploratoire non activé) | 0 % | 0 % | 5,88 % | 94,12 % |
| 42 (seuil exploratoire non activé) | 0 % | 0 % | 0,01 % | 50,00 % |

**Correction du 31 octobre 2026 :** la probabilité plafonne à **7 755/7 776 = 99,73 %**, et non 99,99 %, car les naturels 5, 6 et 7 échouent obligatoirement, quels que soient les bonus. Le bonus +24 est une hypothèse analytique, pas un bonus de jet accessible dans l'Atelier. Le calcul et ses tests sont isolés dans `atelier5d6-probabilities.ts`.

**Conclusion :** additionner systématiquement les maîtrises jusqu'à +12 ferait disparaître toute incertitude à difficulté 21–30 pour de nombreux héros. **Ne pas activer cette règle** sans revoir la granularité, les résistances adverses, les coûts des pouvoirs, la progression des créatures et les seuils des affrontements de très haut niveau. Une prouesse inconcevable reste inconcevable sans capacités ni conditions compatibles avec le lore.

## Défense et dégâts : deuxième banc de test

Le module `quartz/components/scripts/atelier5d6-opposition.ts` calcule des scores de résistance distincts : physique (meilleure des caractéristiques Physique et Agilité), magique (Esprit), mentale (meilleure d'Esprit et Présence), auxquels s'ajoutent entraînement défensif partiel, expérience et bonus MJ de 0–8. Les personnages des niveaux 21–24 obtiennent un supplément de défense de playtest ; la résistance finale est plafonnée à 50.

Le jet doit atteindre le **maximum** de la difficulté ordinaire, de la résistance de cible et du seuil MJ. Aucun critique ne traverse une défense non franchie. Sur réussite offensive : `base d'impact + maîtrise (0–12) + palier de dégâts − protection`. Sur négociation/mental : **aucun PV automatique**. À au moins cinq points sous le seuil, une riposte est **possible mais jamais gratuite**, et requiert une action et son propre jet. Les dégâts sont appliqués aux PV uniquement sur confirmation MJ.

Le banc `scripts/test-5d6-opposition.mjs` utilise les fonctions TypeScript réellement exécutées par l'Atelier, via esbuild ; il couvre également les 7 776 combinaisons des dés. Les chiffres sont des prototypes et n'attribuent ni immunité, ni pouvoir divin, ni Cercle magique.

## Robustesse innée, équipement et élites du bestiaire

La robustesse d'un personnage **ne dépend pas du port d'une armure**. La fonction `innateProtection(niveau, type)` augmente l'absorption physique de **0** au niveau 1 à **14** au niveau 20, puis **20, 27, 35, 44 et 55** pour les niveaux 21–25. L'absorption magique innée vaut environ 70 % de cette valeur ; les résistances mentales augmentent par le score défensif mais **aucun PV mental n'est retiré automatiquement**.

L'équipement ajoute son **grade de 0 à 5**, soit **0 / 2 / 5 / 10 / 18 / 30** points d'absorption physique (magie environ 70 %), et un bonus graduel au seuil de résistance. Les protections supplémentaires déjà définies par le MJ restent indépendantes et ne sont pas effacées. L'absorption finale est : **innée + équipement + ajustement MJ**.

Un **contact héroïque (27–30 naturel)** peut effleurer une résistance supérieure, à condition d'atteindre la difficulté ordinaire du geste et que ce contact soit matériellement possible. Il n'inflige alors **aucun état ni effet automatique**, et **0 PV par défaut**. Sur **30 naturel seulement**, si l'impact brut aurait excédé la totalité des protections, le MJ peut faire appliquer **1 PV maximum**. Aucun résultat de dés ne transgresse une immunité explicite du canon.

Les profils génériques `faune`, `prédateur`, `gardien`, `mystique`, `colosse` constituent le début d'un **bestiaire 1–25**. Le générateur n'invente ni nouvelle espèce, ni fait de campagne, ni grade divin canonique. Les anciennes fiches de PJ/PNJ restent importables avec leurs anciens PV et champs ; la progression n'accorde pas rétroactivement de ressources pour les niveaux déjà acquis.

| Niveau | PV de référence | Absorption physique innée |
|---:|---:|---:|
| 1 | 12 | 0 |
| 5 | 36 | 2 |
| 12 | 78 | 5 |
| 20 | 174 | 14 |
| 24 | 270 | 44 |
| **25** | **306** | **55** |

## Plan de tests de table avant équilibrage final

1. **Niveaux 1–4** : comparer un habitant (1, sans spécialité), un novice (3) et un spécialiste novice (5 + compétence) sur exploration, secours et conflit.
2. **Niveaux 5–8** : vérifier le rythme des caractéristiques plafonnées, la conversion en talents et la rapidité d'apprentissage.
3. **Niveaux 9–12** : tester les spécialisations croisées, l'accès aux ressources et les choix hors combat.
4. **Niveaux 13–20** : tester dépenses de mana, combats successifs, blessures, conflits non violents, disproportion des ressources et limites des talents.
5. **Niveaux 21–25** : exiger une justification divine explicite, des conséquences du monde et la possibilité du refus MJ. Comparer uniquement à des adversaires ou missions de la même échelle.
6. **Continuité** : charger les anciens exports `alrick.sheets.v1/v2`, utiliser export complet `alrick.campaign.v1`, vérifier création/attribution/transfert et sauvegarde locale, puis test navigateur et mobile.

**Point ouvert :** le rendement des points de talents et des maîtrises doit être validé lors d'une vraie partie. L'énumération statistique ne prouve pas, à elle seule, qu'un système de jeu est amusant, juste ou équilibré.
