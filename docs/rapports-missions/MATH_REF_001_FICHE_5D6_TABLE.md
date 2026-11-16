# MATH-REF-001 — Fiche de table : un jet, un résultat

**Aide de jeu candidate**, utilisable pour tester les règles M03 existantes. Les multiplicateurs divins, réductions d'absorption et exemples de coûts sont **non homologués en production** : marquer les essais comme tels sur la feuille du MJ.

## En quatre lignes

1. **Choisis ton action et sa puissance** : mineure, courante ou majeure si l'effet le permet ; annonce le coût avant de lancer.
2. **Jette 5d6 une fois** et ajoute ton bonus de jet déjà inscrit sur la fiche. Si les dés font 5–7, c'est raté. Sinon, compare au seuil de la cible.
3. **Si tu touches**, ton impact fixe est déjà inscrit sur la fiche. Retire la protection restante après pénétration, puis l'absorption éventuelle. **Pas de deuxième lancer de dégâts**.
4. **Le MJ applique** les PV, les dépenses, ou l'état mental proposé. Un effet mental réussi ne retire **aucun PV automatiquement**.

## La mini-fiche à pré-calculer avant la partie

| Ligne de fiche | Calcul par les règles ou le Studio | Chiffre à lire au moment du jet |
|---|---|---|
| Bonus de toucher | `E(carac)+M(maîtrise)+situation+meilleure précision homologuée` | Un seul bonus signé |
| Seuil de cible | `max(DD,seuilMJ,défense de cible)` | Un seuil à atteindre |
| Impact mineur | Base M03, sans coefficient supplémentaire | Nombre fixe |
| Impact courant | Base M03, × coefficient de niveau **seulement si habilité** | Nombre entier pré-calculé |
| Impact majeur | Base M03, × coefficient de niveau **seulement si habilité** | Nombre entier pré-calculé |
| Protection restante | `max(0,protection-pénétration)` | Nombre à retirer |
| Absorption homologuée | Meilleure réduction validée (candidate 0–2) | Nombre à retirer ensuite |

**Astuce :** avec un équipement inchangé, les impacts restent fixes entre deux évolutions de rang ou de niveau. Un joueur peut les écrire sur trois cases et n'a plus besoin de multiplier quoi que ce soit pendant un combat.

## Exemple ordinaire N5 : production M03 actuelle

Attaquant fictif N5, caractéristique brute 5 `E=4`, maîtrise rang1 `M=1`, base arme6, DD21. Cible N5 résistante à 20, protection1. Jet de cinq dés : **3 + 3 + 4 + 4 + 4 = 18**.

- Toucher : `18+4+1=23` contre `max(21,20)=21` → **réussite**.
- Impact : `6+floor(.7×5)+1=10`. Protection1 → **9 PV nets**.
- Aucun autre dé. Si la cible était impossible à atteindre, **0 PV** quel que soit le jet.

## Exemple divin N21 : PROTOTYPE de référence, pas production

Attaquant N21 fictif, caractéristique brute14 (`E=7`), rang9 (`M=3`), base6, DD21. Cible de même niveau résistance25, protection8 ; même jet naturel **18**.

- Toucher identique pour les trois intensités : `18+7+3=28` contre 25 → **réussite**.
- Impact minimal : `6+floor(.7×21)+3=23` bruts, `23−8=15` PV.
- Impact courant, coefficient ×1,25 : `floor(23×1.25)=28` bruts, `28−8=20` PV.
- Impact majeur, coefficient ×1,50 : `floor(23×1.5)=34` bruts, `34−8=26` PV.
- Si la cible possède une **absorption homologuée2**, la proposition donnerait **13 / 18 / 24 PV** respectivement, après armure.

**Même sort, même jet, puissance choisie.** Une Étincelle de feu Cercle I pourrait rester volontairement minime même utilisée par un mage divin, avec coût mineur à valider ; la foudre `demo-etincelle` ne sert pas de barème.

## Pour le Studio MJ : deux gestes sur une action déjà préparée

| Geste | Interface et autorité | Effet sur la sauvegarde |
|---|---|---|
| Préparer (sans bouton de jet) | Action, cible, coût et intensité visibles ; MJ vérifie la faisabilité | Aucun PV, aucun mana, aucune charge dépensée |
| **1 — « Engager et lancer »** | Cinq d6 générés ou saisis physiquement, après engagement ; calcul touche + dégâts/état, tentative payée selon contrat | Journal d'intention/jet et ressource, **une seule fois** |
| **2 — « MJ : appliquer »** | Fiche de résultat claire, confirmation et possibilité de refus/rectification | PV/états appliqués puis persistés de façon idempotente |

L'écran joueur ne contient **que** les informations explicitement partagées, jamais les notes privées du MJ. Le comportement exact des ressources sur annulation, échec et interruption est à contre-auditer avec MAG/ARCHIVES avant développement.

## Ce qu'il ne faut jamais faire

- Lancer des dés séparés pour les dégâts.
- Ajouter directement le rang de maîtrise ou le Cercle au total.
- Donner des dégâts PV à une suggestion mentale sans règle expressément homologuée.
- Ajouter deux absorptions ou deux bonus du même type en cumul illimité.
- Donner un bonus à un objet seulement parce que sa description dit « exceptionnel ».
- Activer des dégâts divins au N20 : c'est **l'éveil**, le premier coefficient multiplicateur proposé commence au **N21**.
- Confondre les 25+ PNJ avec des personnages niveau26.
