# MATH-EFF-001 — Fiche rapide 5d6 et recette « deux gestes »

**Aide de table basée sur les règles M03 EXISTANTES**, non un nouveau règlement. Les statistiques des exemples sont fictives et les coûts des sorts/enchantements restent réservés.

## Fiche MJ / joueur : une action, un jet de 5 dés

1. **Avant le combat**, inscrivez sur chaque fiche trois nombres utiles : `bonus d'attaque = E(stat)+M(rang)` ; `résistance = 15+E(stat défensive)+M(maîtrise défensive)+bonusMJ` ; `protection = innée + équipement + contexte`. Inscrivez pour chaque attaque `impact fixe = base + floor(.7×niveau) + M(rang) + effet approuvé` et sa pénétration éventuelle. Le MJ conserve à part les secrets.
2. **Annoncez une action et une cible.** Le MJ décide si elle est faisable, choisit DD/conditions, valide l'éventuel effet de capacité/sort/objet.
3. **Jetez 5d6 une seule fois.** Additionnez les dés et votre bonus d'attaque, la situation (−2 à +2) et une précision homologuée. Comparez au plus grand de DD, résistance de la cible et minimum MJ. **5–7 aux dés = échec** ; même 27–30 ne perce pas une impossibilité. Si le jet ne touche pas, **0 PV** ; un éventuel contact spectaculaire reste narratif.
4. **Si l'attaque blesse**, retirez de l'impact fixe la protection **restante après pénétration**, sans jamais passer sous zéro. Pas de jet de dégâts supplémentaire. Si l'action est **mentale**, elle ne retire **jamais de PV automatiquement** : le MJ décide de l'effet proposé.
5. **Enregistrez l'usage** et, selon la politique homologuée de la capacité, les ressources dépensées ; appliquez les PV/états une seule fois.

### Exemple facile à calculer (fictif, non canonique)

Attaquant N5 : caractéristique 5 → `E=4`, maîtrise rang 1 → `M=1`, arme de base 6, corps à corps physique. Cible N5 : résistance physique 20, protection physique 1. Difficulté 21, pas de modificateur, pas de pénétration.

- 5d6 = **3 + 3 + 4 + 4 + 4 = 18** ; toucher `18 + 4 + 1 = 23` contre `max(21,20)=21` → **touché**.
- Impact brut `6 + floor(.7×5) + 1 = 10` ; armure 1 → **9 PV**. Aucun autre dé à lancer.
- Si cette action est déclarée **mentale** avec une cible et une opposition mentale, **0 PV** même sur réussite ; seulement un effet à arbitrer.

### À mémoriser

**« 5 dés pour toucher. Si ça passe, dégâts fixes moins protection. Le mental n'enlève pas de PV tout seul. »**

## Parallèle interface Studio MJ (proposition non implantée)

| Moment | Geste | Affichage nécessaire | Écriture/sauvegarde |
|---|---|---|---|
| Préparation | Choisir action/cible, vérifier coût/feasibilité | Bonus, DD, résistance, protection, origine de l'effet et coûts réservés | Aucune mutation |
| 1. Calculer | Bouton « Lancer 5d6 » **ou** saisie des cinq dés réels | Réussite/échec, touche, dégâts nets, état proposé, provenance, vérification coût | Prévisualisation/événement d'intention seulement |
| 2. Confirmer | Bouton MJ « Appliquer résultat » | Cible, PV avant/après, coût effectif, bouton désactivé si déjà appliqué | Mutation atomique/idempotente et journal |
| Reprise | Restaurer/importer | Même jet et résultat d'origine ; pas de relancer ni de rejouer un débit | Relecture vérifiée du journal, zéro doublon |

Un **joueur** peut voir sa réussite sans obtenir les notes privées du MJ. Un **MJ** conserve sa liberté d'annuler ou rectifier une action impossible avant application. Le choix exact du moment où un mana/charge est dû, notamment après échec du lancer, doit suivre la politique MAG/OBJETS **à arbitrer** et ne peut être contourné en calculant gratuitement jusqu'au succès.

## Recette physique et navigateur à faire jouer par QA

| ID | Mise en situation | Résultat attendu |
|---|---|---|
| TBL-01 | Refaire l'exemple N5 à la main avec 5d6=18 | Touché, 9 PV, aucune seconde poignée de dés |
| TBL-02 | 5d6=5 ou 7 avec bonus extrêmement élevé | Échec naturel, zéro dégât |
| TBL-03 | 5d6=30 contre objectif impossible (`feasible=false`) | Zéro contact/dégât automatique |
| TBL-04 | Défenseur protégé puis pénétration du même montant | Protection réduite, dégâts bornés par M03, aucune seconde touche |
| TBL-05 | Capacité mentale réussie contre une volonté | Résultat narratif proposé, **0 PV** et confirmation MJ |
| TBL-06 | Équiper une arme descriptive « exceptionnelle » sans effet homologué | Aucun `+1`, ni dégâts ni précision cachés |
| TBL-07 | Équiper une arme enchantée avec deux effets impact autorisés | Seulement la meilleure magnitude (≤2), pas leur somme |
| TBL-08 | Comparer `MAG-SORT-001` feu C I à `demo-etincelle` foudre | Aucune copie du mana 4 ni des dégâts de démonstration ; champs réservés |
| UX-01 | Bouton calcul puis annulation MJ | 0 PV débité, 0 ressource débitée, état inchangé |
| UX-02 | Calcul puis confirmation deux fois, rechargement/reconnexion | Un **seul** effet et débit, jet et trace intacts |
| UX-03 | Deux onglets modifient une cible, puis export/restauration | Conflit détecté, journal cohérent, aucune duplication |
| UX-04 | Fenêtre joueur ouverte pendant le calcul MJ | Aucun secret de PNJ, note privée ou résultat non partagé |
| UX-05 | Usage de sort dont tentative échoue | Débit *conforme à la politique arbitrée* après engagement ; pas de test gratuit par prévisualisation |

**Critères ergonomiques recommandés :** résolution numérique après sélection en **un clic** ; validation de l'effet en **deux clics maximum** sur une action déjà préparée. Saisie manuelle des cinq dés reste une option de substitution, non cinq clics supplémentaires imposés aux joueurs en ligne. Cas narratifs ou coûts à arbitrer signalés explicitement plutôt que calcul silencieux.

**Limite de cette mission :** ces recettes UX, de concurrence et de terrain ne sont **pas exécutées** par le script mathématique. Elles doivent être reproduites dans la branche Studio par QA avant de déclarer un vrai parcours « PASS ».
