# MATH-REF-002A — Cahier de démarrage de l'extension M03

**Date :** 16 novembre 2026  
**Statut :** mission technique ouverte, aucune formule de production modifiée.  
**Responsables :** 10 MATH (contrat) ; 11 INDEX (interfaces) ; 02 QA (contre-tests).  
**Ordres GitHub :** [MATH-REF-002A #154](https://github.com/Sijiel44/archives-alrick/issues/154), [QA-MATH-002 #153](https://github.com/Sijiel44/archives-alrick/issues/153).  
**Origine :** [arbitrages du créateur](MATH_REF_002_ARBITRAGES_CREATEUR_2026-11-16.md) et [plan d'exécution](MATH_REF_002_PLAN_VALIDATION_ET_PUBLICATION.md).  
**Dépendances :** #147 → #151 → #152 ; cette branche est empilée sur la branche documentaire de #152. **Ne pas intégrer indépendamment de cette chaîne.**

## 1. Engagement du lot

Proposer **une extension du moteur M03 existant** pour toutes les actions chiffrées, sans moteur concurrent : attaque d'arme, capacité physique, capacité magique, sort, enchantement ou créature. Le mode mental doit garder une sortie narrative/état et **zéro dommage PV par défaut**.

Deux usages cibles :
- **Table :** un seul lancer 5d6, valeurs de bonus, défense et impact affichées sur les fiches, pas de jet de dégâts supplémentaire.
- **Studio MJ :** prévisualisation gratuite, engagement de tentative et jet, confirmation MJ, application et sauvegarde idempotentes, sans fuite des secrets.

## 2. Contrat transversal proposé — à raccorder aux interfaces réelles

L'enveloppe de données est ici **conceptuelle** (pas encore une API homologuée), en attendant la lecture et l'alignement avec les types et les tests M03 :

| Champ | Nature | Règle |
|---|---|---|
| `actionId / attemptId` | Références durables | Distinguer définition, instance et tentative ; une tentative ne se dépense qu'une fois |
| `origin` | `ordinary_attack / physical_ability / magic_ability / spell / object / creature` | Adaptateur, pas nouveau calcul |
| `mode` | `physical / magical / mental` | Aucun dommage PV mental automatique |
| `definitionId / version / provenance / authority` | Identité & autorisation | Rejeter bonus de texte libre ou approbation importée auto-déclarée |
| `actor / target / level / rank / attribute` | Données de fiche | Niveau 1–25 ; rang distinct du Cercle et degré narratif |
| `dice / situation / opposition` | Résolution M03 | 5d6, échecs naturels 5–7 ; 27–30 seulement si action réellement réussie |
| `baseDamage / impact / affinity` | Impact M03 homologué | Réutiliser les règles de classement/non-cumul M03 |
| `penetration / protection / absorption` | Défense | Pénétration sur protection uniquement, absorption distincte après protection |
| `eligibleIntensity / intensity / k` | Offensive autorisée | `k=1` par défaut, coefficients divins uniquement sur effets éligibles |
| `resourceReservation / commitState` | Coûts | Modèle C sous MAG, exceptions explicites ; débit unique à tentative engagée |
| `resolvedEffects / validation / journal` | Sorties | PV, états, conséquences, preuve MJ et sauvegarde séparés |

**Invariants d'intégration :** aucune formule ou coût tirés du sort `demo-etincelle` foudre pour `MAG-SORT-001` Étincelle **feu**, Cercle I. Aucun bonus aux objets purement descriptifs. Aucune mutation à la simple prévisualisation.

## 3. Chaîne candidate du calcul, sans homologie de production

1. Résoudre la faisabilité, les cinq dés et l'opposition selon les règles M03 actuelles. Un naturel de 5 à 7 reste un échec forcé.
2. Si action ratée ou mental non-damaging : zéro PV ; les dépenses de tentative engagée restent dues.
3. Sur succès offensif : retrouver l'impact `I` M03 effectivement autorisé, **sans ajouter deux fois une maîtrise ou un bonus d'impact**.
4. Si l'intensité est admissible et approuvée : appliquer `D = floor(I × k) + affinité_autorisée`; sinon `k=1`. Il n'y a **aucun multiplicateur universel de niveau**.
5. Protection restant `P=max(0, protection - min(protection, pénétration))`.
6. Absorption `A` prise au **meilleur effet homologué**, 0 à 2 pour l'ordinaire, sans cumul ; non percée par la pénétration.
7. Dommages PV `max(0, D - P - A)`, puis application uniquement après validation et une seule fois.

**Point d'implémentation non réglé :** sur un naturel 27–30 ET réussite, le choix `+2 impact` maximum ou bénéfice tactique/narratif doit être raccordé exactement à l'impact et aux bonus existants M03. L'ordre par rapport à `k` et l'anti-cumul requièrent comparaison QA. Le calcul ci-dessus ne permet pas une application automatique de ce +2 avant arbitrage technique.

## 4. Niveaux divins et maîtrise

N20 : éveil divin, coefficient offensif 1 ; N21 : divinité affirmée. La sélection mineure reste possible avec `k=1`.

| Niveau | Effet courant éligible | Effet majeur éligible |
|---:|---:|---:|
| 20 | ×1 | ×1 |
| 21 | ×1,25 | ×1,50 |
| 22 | ×1,30 | ×1,60 |
| 23 | ×1,35 | ×1,70 |
| 24 | ×1,40 | ×1,80 |
| 25 | ×1,50 | ×2,00 |

Les coefficients ne se transfèrent **ni aux soins, ni à la protection, ni à toutes les armes** sans habilitation. `M(r)=floor(log2(1+r))`; raffinements qualitatifs modestes tous les deux/trois rangs et accès structurés aux paliers 1, 3, 7, 15, 31. N25+ signifie **PNJ de niveau 25** avec crédits de maîtrise exceptionnels autorisés par MJ, **jamais niveau 26**.

## 5. Matrice de tests bloquants (QA #153)

| Identifiant | Entrées/événement | Attendu |
|---|---|---|
| PARITY-M03 | `k=1`, absorption `0`, bonus critique additionnel désactivé | Sortie identique à M03 existant, même touche et dégâts |
| NATURAL-FAIL | Naturels 5–7, même si les bonus sont forts | Échec forcé |
| HEROIC | Naturels 27–30, succès réel / échec réel | Bénéfice possible sur succès uniquement ; aucun PV mental automatique |
| PENETRATION | Pénétration supérieure à la protection, absorption 2 | Protection à 0, absorption maintenue à 2 |
| DEFENSE | Deux absorptions ordinaires éligibles simultanées | Maximum des réductions autorisées, jamais somme |
| INTENSITY | N20/N21/N25, mineure/courante/majeure, effet non habilité | Coefficient de la grille seulement si habilité, choix mineur accessible |
| MANA | Prévisualisation, tentative ratée, double soumission, reprise | 0 prélèvement en aperçu ; un seul débit à tentative même ratée |
| MENTAL | Action mental réussie avec état | 0 PV ; état soumis à contrôle MJ |
| ITEM | Arme descriptive / enchantement homologué | Aucun bonus descriptif ; seul effet versionné autorisé |
| SPARK | Étincelle feu C I vs `demo-etincelle` foudre | Aucun héritage de dégâts ou coût démo |
| RESTORE | Export puis import puis application répétée | Aucun doublon de PV/ressource ; versions et provenance conservées |
| ENCOUNTERS | N1,5,10,15,20,21,25, adversaires actifs, groupes | Rapporter distribution durée/létalité ; cibles 3–5/5–8/8–12 rounds **à vérifier**, pas présumées validées |

Le banc de **7 776** résultats exacts et les **6 300** simulations historiques sont des références à rejouer/étendre ; les simulations complètes doivent ajouter attaques de riposte, dépenses, états, choix et changement de cible, avec graines fixes et sorties archivées.

## 6. Livrables et verrou de diffusion

- 10 MATH : modifier le **fichier réel M03** sous revue, avec tests de parité exacts et interface versionnée ; pas de second calcul parallèle.
- 02 QA : exécuter les tests ci-dessus, documenter succès, échecs, graines, paramètres, scripts et versions.
- MAG/CAP/OBJETS/BESTIAIRE/INDEX : valider les six chemins d'origine et au moins une définition autorisée et un refus par origine.
- ARCHIVES/STUDIO : démontrer l'unicité des mutations et le contrôle de visibilité MJ/joueur ; recette Chrome multi-onglets.
- DG : contrôler P0/P1 et autoriser **séparément** la publication des pages Quartz `publish:false`.

**Ce document amorce le développement : il ne constitue pas un test exécuté, une implémentation, une homologation, une fusion ou une publication.**
