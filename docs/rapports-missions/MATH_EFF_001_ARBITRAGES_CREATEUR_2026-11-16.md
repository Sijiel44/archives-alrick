# MATH-EFF-001 — Registre d'arbitrages du créateur (16 novembre 2026)

**Contexte :** suite aux arbitrages du créateur, les quatre principes de jeu et la grille de puissance hybride sont **acceptés comme référence de conception et base de simulation**. Le créateur précise : **N20 = éveil divin ; N21 = divinité affirmée ; N25+ = PNJ uniquement, sans niveau 26**. Les valeurs proposées demeurent non implémentées tant que la recette intégrale et l'homologation des contrats n'ont pas eu lieu.

## Décisions du créateur

| Référence | Décision | Statut |
|---|---|---|
| `EFF-03-RYTHME` | Combat **dynamique** : ordinaire 3–5 rounds, élite 5–8, boss 8–12 comme objectifs de conception pour des groupes comparables | **Validée sur le principe** ; à tester par profils / effectifs |
| `EFF-05-MAITRISE` | Progression de maîtrise régulière à l'usage, avec **déblocages techniques fréquents et plaisants** ; pas de bonus linéaire brut par niveau | **Validée sur le principe** ; cadence de déblocage à calibrer |
| `EFF-04-INTENSITE` | **Puissance modulable**, y compris sous la pleine capacité à haut niveau ; effets intéressants à coût moindre, avec variantes renforcées plus coûteuses | **Validée sur le principe** ; coefficients/coûts encore réservés |
| `EFF-02-ABSORPTION` | L'absorption représente une **réduction des dégâts** | **Validée sur le principe** ; ordre précis après armure/pénétration, cumul/durée à homologuer |
| `EFF-10-DIVIN` | **Éveil au N20, nature divine affirmée au N21**, coefficient courant ×1,25/majeur ×1,50 au N21 et courant ×1,50/majeur ×2 au N25 ; N25+ réservé aux PNJ pouvant continuer les maîtrises | **Validé comme orientation et grille d'essai** ; ni coût ni formule de production homologués |

## Grille d'essai acceptée — Éveil divin, puissance flexible, même moteur

L'impact de M03 existant est conservé comme **base de comparaison** : `I = baseDamage + floor(0.7×niveau) + M(rang) + impact homologué`. Pour une attaque offensive éligible et engagée, tester `I_divin = floor(I × k)` **avant** les protections/pénétrations existantes, puis `D_net = max(0, I_divin + affinité autorisée - protection_restante)`. Le calcul de la touche, ses 5d6 et la défense restent M03. C'est une **hypothèse à simuler et arbitrer** ; aucun `k` n'existe actuellement dans M03.

Deux usages au même niveau : **intensité courante** accessible selon le statut et l'effet attestés ; **intensité majeure** sous conditions et consommation de ressources. Le joueur peut toujours **choisir de produire un effet plus faible** (`k=1` ou version mineure du sort) pour économiser ses ressources et éviter des destructions inutiles. Le niveau ne force donc pas un sort mineur à devenir explosif.

| Niveau | Effet ordinaire (sans éveil) | `k` divin courant candidat | `k` intense candidat | Lecture |
|---:|---:|---:|---:|---|
| **20** | ×1 | — | — | **Éveil divin**, étape charnière et accès narratif, sans multiplicateur offensif nouveau à ce stade |
| **21** | ×1 possible à intensité retenue | **×1,25** | **×1,50** | **Divin pleinement affirmé**, rupture offensive nette après l'éveil N20 |
| 22 | ×1 possible | ×1,30 | ×1,60 | Gain chiffré + options débloquées |
| 23 | ×1 possible | ×1,35 | ×1,70 | Croissance contrôlée |
| 24 | ×1 possible | ×1,40 | ×1,80 | Approche des signatures majeures |
| **25** | ×1 possible | **×1,50** | **×2,00** | Personnage très accompli ; puissance exceptionnelle sous coût |
| **25+** | Aucun niveau 26 numérique | Plancher identique à N25 | Autorités rares **>×2**, plafond à étudier | **PNJ uniquement** ; maîtrise/expérience de longue durée, pas inflation illimitée |

**Les coefficients du tableau sont retenus par le créateur pour les simulations approfondies, mais ne sont pas encore des formules de production homologuées ; aucun coût de mana, charge ou matrice n'est fixé ici.** Les coefficients sont volontairement progressifs pour une montée plutôt régulière ; l'interface et la fiche de table **pré-calculeraient** les impacts, sans demander au joueur de multiplier à chaque attaque. Les affinités ne sont pas multipliées deux fois.

## Sensibilité chiffrée (sans adoption)

Simulation de calcul **exact sur les 7 776 issues 5d6**, reproduisant les formules M01/M03 sur profils fictifs déjà utilisés par le banc MATH-EFF : attaque physique base 6, défenseur de même niveau, DD21, rang `floor(.45×(N−1))`, caractéristique `3+floor(.55×(N−1))`, grade `min(5,floor(N/5))`, aucun autre effet ni affinité. Les coefficients ne sont **pas appliqués dans le code M03** : résultat **hypothétique**, non recette des futures règles.

| Niveau | PV référence | Dégâts moyens/action M03 | Dégâts courants candidats | Dégâts intenses candidats | Actions attendues à intensité majeure constante |
|---:|---:|---:|---:|---:|---:|
| 20 | 174 | 11,68 | 11,68 | 11,68 | 14,9 |
| **21** | 198 | 11,68 | **15,57** | **20,24** | **9,8** |
| 22 | 222 | 12,46 | 17,91 | 23,36 | 9,5 |
| 23 | 246 | 13,24 | 19,46 | 26,47 | 9,3 |
| 24 | 270 | 13,24 | 21,02 | 28,81 | 9,4 |
| **25** | 306 | 11,68 | **21,80** | **31,92** | **9,6** |

Le saut **N20→N21** augmente ici les dégâts moyens d'environ **33 %** en régime divin courant et **73 %** en usage intense, à paramètres identiques de référence. L'hypothèse « intensité majeure constante » sert uniquement de borne de sensibilité : elle n'est pas soutenable sans ressources illimitées. L'équilibrage réel doit intégrer prix, cooldown/conditions et groupes. Il faudra veiller à ce que les boss ne deviennent pas triviaux par trois ou quatre attaques majeures simultanées.

## N25+ — PNJ d'exception, progression des maîtrises sans niveau 26

**Décision du créateur : N25+ est réservé aux PNJ.** Ils restent de **niveau 25**, mais leur expérience continue de leur faire gagner des **points de compétence/maîtrise**, distribués lors d'étapes significatives de leur histoire, avec validation MJ. Ces points améliorent des rangs numériques existants selon leur coût progressif M01/M02 ; la **cadence**, la **source de points** et leur **quantité** sont à calibrer, sans instaurer de niveau 26 ni attribuer gratuitement un bonus brut par année écoulée.

Les **Autorités exceptionnelles** peuvent refléter l'expérience, les accomplissements et la maîtrise : techniques rares (zone, précision, contrôle, effets spécifiques, intensité sous conditions au-delà de ×2) sans multiplicateur de dégâts illimité et permanent. Les neuf degrés narratifs d'école, les Cercles et les rangs numériques restent distincts ; la catégorie « Autorité » ne crée pas automatiquement un second budget d'XP.

**Personnages joueurs :** progression jusqu'au niveau 25 possible selon la campagne. Les groupes peuvent commencer une campagne avec des personnages déjà avancés **si le MJ et tous les joueurs l'acceptent**. Le dépassement de maîtrise « 25+ » n'est pas destiné aux PJ.

## Arbitrages clos ; travail mathématique restant

- **Clos — seuil divin :** éveil au niveau **20**, nature divine affirmée au **21**, dans une progression de campagne généralement longue et construite avec le MJ ; pas de divinisation subite requise ni de saut de niveau en un jour.
- **Clos — amplitude de référence :** le créateur accepte les coefficients du tableau **comme base des calculs et simulations**, en conservant l'intensité volontairement réduite.
- **Clos — périmètre 25+ :** réservé aux **PNJ**, sans niveau supérieur à 25, avec des points de maîtrise possibles après le niveau 25.
- **À calibrer :** fréquence et coût des gains de maîtrise de PNJ après N25 ; effets défensifs et absorption ; coût des intensités ; temps des combats groupés ; contrats d'Autorités ; règle narrative précise de reconnaissance à l'éveil.

**Statut opérationnel :** les arbitrages créatifs principaux sont enregistrés, mais les formules de production, coûts, ressources et publication du règlement restent soumis à recette complète et validation finale. Cette note est un journal de décision de la PR documentaire MATH-EFF-001.
