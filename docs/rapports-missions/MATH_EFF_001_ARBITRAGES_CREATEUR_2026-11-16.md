# MATH-EFF-001 — Registre d'arbitrages du créateur (16 novembre 2026)

**Contexte :** suite aux cinq questions d'arbitrage MATH-EFF-001, le créateur a confirmé les quatre premières propositions et demandé une synthèse **hybride** pour les niveaux divins 21–25 et l'après-25. Cette note préserve fidèlement sa décision et distingue le **validé sur le principe** du **chiffrage encore proposé**. Pas de modification des formules de production ni de canonisation.

## Décisions du créateur

| Référence | Décision | Statut |
|---|---|---|
| `EFF-03-RYTHME` | Combat **dynamique** : ordinaire 3–5 rounds, élite 5–8, boss 8–12 comme objectifs de conception pour des groupes comparables | **Validée sur le principe** ; à tester par profils / effectifs |
| `EFF-05-MAITRISE` | Progression de maîtrise régulière à l'usage, avec **déblocages techniques fréquents et plaisants** ; pas de bonus linéaire brut par niveau | **Validée sur le principe** ; cadence de déblocage à calibrer |
| `EFF-04-INTENSITE` | **Puissance modulable**, y compris sous la pleine capacité à haut niveau ; effets intéressants à coût moindre, avec variantes renforcées plus coûteuses | **Validée sur le principe** ; coefficients/coûts encore réservés |
| `EFF-02-ABSORPTION` | L'absorption représente une **réduction des dégâts** | **Validée sur le principe** ; ordre précis après armure/pénétration, cumul/durée à homologuer |
| `EFF-10-DIVIN` | Entre A et B : **rupture de puissance très visible de N20 à N21**, croissance importante jusqu'à N25, puis **maîtrise/expérience accrue pour des êtres divins exceptionnels après N25** | **Orientation confirmée, modèle numérique NON validé** |

## Proposition MATH — Éveil divin, puissance flexible, même moteur

L'impact de M03 existant est conservé comme **base de comparaison** : `I = baseDamage + floor(0.7×niveau) + M(rang) + impact homologué`. Pour une attaque offensive éligible et engagée, tester `I_divin = floor(I × k)` **avant** les protections/pénétrations existantes, puis `D_net = max(0, I_divin + affinité autorisée - protection_restante)`. Le calcul de la touche, ses 5d6 et la défense restent M03. C'est une **hypothèse à simuler et arbitrer** ; aucun `k` n'existe actuellement dans M03.

Deux usages au même niveau : **intensité courante** accessible selon le statut et l'effet attestés ; **intensité majeure** sous conditions et consommation de ressources. Le joueur peut toujours **choisir de produire un effet plus faible** (`k=1` ou version mineure du sort) pour économiser ses ressources et éviter des destructions inutiles. Le niveau ne force donc pas un sort mineur à devenir explosif.

| Niveau | Effet ordinaire (sans éveil) | `k` divin courant candidat | `k` intense candidat | Lecture |
|---:|---:|---:|---:|---|
| 20 | ×1 | — | — | Dernier seuil mortel de référence |
| **21** | ×1 possible à intensité retenue | **×1,25** | **×1,50** | Rupture sensible dès l'éveil |
| 22 | ×1 possible | ×1,30 | ×1,60 | Gain chiffré + options débloquées |
| 23 | ×1 possible | ×1,35 | ×1,70 | Croissance contrôlée |
| 24 | ×1 possible | ×1,40 | ×1,80 | Approche des signatures majeures |
| **25** | ×1 possible | **×1,50** | **×2,00** | Personnage très accompli ; puissance exceptionnelle sous coût |
| **25+** | Aucun niveau 26 numérique | Plancher identique à N25 | Autorités rares **>×2**, plafond à étudier | Maîtrise/expérience de longue durée, pas inflation illimitée |

**Aucun coefficient, mana, charge ou matrice du tableau n'est canonisé**. Les coefficients sont volontairement progressifs pour une montée plutôt régulière ; l'interface et la fiche de table **pré-calculeraient** les impacts, sans demander au joueur de multiplier à chaque attaque. Les affinités ne sont pas multipliées deux fois.

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

## N25+ — Avancer sans niveau 26

Proposition : **niveau de personnage plafonné à 25**, maîtrise numérique continuant à progresser par les règles homologuées, avec des **Autorités exceptionnelles** acquises par exploits, expérience ou reconnaissance du MJ. Elles permettraient des gestes spécifiques (zone, précision, contrôle, intensités au-delà de ×2, transformations) sous conditions et ressources, **pas un multiplicateur illimité permanent**. Les neuf degrés narratifs des écoles, les Cercles et les rangs de maîtrise continuent d'être des axes distincts. La piste de jalons « Autorité I/II/III » n'est ici qu'un exemple de classification ; aucun nouvel XP, niveau, statut divin automatique ou seuil n'est décrété.

## Deux confirmations nécessaires avant spécification finale

1. **Accession N21 :** le seuil 21 suffit-il automatiquement à entrer dans le régime divin, ou ouvre-t-il l'**éveil/Autorité** qui doit être reconnu narrativement par le MJ ? Recommandation MATH : N21 donne le **potentiel**, et une reconnaissance explicite du palier fixe la rupture sans diviniser automatiquement tous les personnages de niveau 21.
2. **Intensités :** les coefficients **×1,25 courant / ×1,50 majeur à N21**, **×1,50 courant / ×2,00 majeur à N25**, puis des Autorités 25+ maîtrisées, sont-ils un **point de départ accepté pour la simulation**, ou souhaites-tu un écart initial encore plus fort ? Aucun barème de mana/charges n'est fixé tant que MAG/OBJETS ne l'a pas contre-audité.

**Statut opérationnel :** en attente de ces arbitrages. Cette note est un journal de décision rattaché à la PR documentaire MATH-EFF-001, pas une modification des mécaniques de production.
