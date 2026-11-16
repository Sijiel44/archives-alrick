# MATH-EFF-001 — Matrice de correspondance M01/M02/M03, MAG, CAP, OBJETS, INDEX, BESTIAIRE

**Candidat de raccord ; aucune transformation de données en production.** Une action peut provenir de plusieurs systèmes, mais la résolution résistée n'a qu'un seul moteur : `resolveCombatM03` et un seul jet de 5d6.

| Source d'effet | Caractéristique et rang | Contrôle avant calcul | Projection M03 | Particularité à préserver |
|---|---|---|---|---|
| Attaque ordinaire | Stat d'attaque, arme/discipline pertinente | Arme portée, portée, cible réalisable | `mode=melee/tir`, `kind=physique`, base/penetration explicites | Aucun bonus hors règles attestées ; défense + armure |
| Capacité physique (CAP/M02) | Stat adaptée, maîtrise de capacité ou discipline déclarée | `AbilityDefinition` defined, limites, approval MJ ; disponibilité | Même M03 + meilleur `precision/impact/penetration` approuvé | Pas d'empilement de catégories ; ressource physique non déduite |
| Capacité magique | Esprit ou stat attestée, rang école/discipline | École/prérequis, ressources, approbation | `mode=magie`, `kind=magie` selon cible/effect ; puissance au contrat | La maîtrise facilite précision/contrôle ; mana et intensité réservés |
| Sort `MAG-SORT-001 Étincelle` | École **feu**, rang propre ; degré narratif séparé | Cercle **I** attesté, apprentissage, portée, MJ, mana/charge à arbitrer | Résolution offensive `mode=magie`, `kind=magie` hypothétique, `baseDamage` réservé | Ne pas transférer les valeurs de **foudre** `demo-etincelle` |
| Autre sort/rite | École et rang pertinents | Cercle, matrice/rite, rôles, ressources, permissions | M03 seulement si opposé ; M01 si test simple ; effet non-PV séparé | Le Cercle n'est pas un niveau de personnage ni un bonus aux dégâts |
| Arme ordinaire (OBJETS) | Stat/rang de l'utilisateur | Utilisable, type d'arme/version | Base d'impact et pénétration **explicitement homologuées** dans les bornes M03 | Un bel objet descriptif ne reçoit pas de bonus |
| Arme enchantée | Stat/rang du porteur + effet homologué lié à l'objet | Détention, capacité/charge, provenance, approbation MJ | Attaque M03 normale + **meilleur** effet autorisé de sa catégorie | Pas de deuxième jet de toucher, pas d'addition libre d'affinités et d'enchantements |
| Armure/bouclier enchanté | Profil défensif de cible | Grade/effet défensif attesté, propriétaire | `equipmentGrades`, `protection`, `defense` approuvés | `absorption` **non opérationnel** ; pas de bouclier automatique |
| Créature/BESTIAIRE | Niveau/stat/rang du profil/variante MJ | Variante copiée, provenance, niveau, attaque faisable | `DefenseProfile` cible, `baseDamage`, attaque M03 | Niveau/danger/PV ne sont pas interchangeables ; original non modifié |
| Effet mental | Esprit/présence/volonté selon référentiel | Faisabilité, limites de contrôle, consentement narratif MJ | `mode=mental`, résistance `mental` ; `effectProposed` | `damage=0` ; appliquer éventuellement état validé **à part** |
| Objet de narration | Aucun par défaut | Fiche descriptive uniquement | **Aucune projection de bonus ni dégâts** | Pas de règle chiffrée inventée à partir d'une description |

## Mapping précis du registre vers `CombatM03Input`

| M03 | Origine de la donnée | Précondition / contrôleur |
|---|---|---|
| `natural` | Somme cinq d6 (physiques saisis ou numériques), `[5..30]` | 5 éléments entiers dans `[1..6]` ; résultat figé après jet |
| `rawStat` | Caractéristique de l'acteur issue du snapshot de fiche | M01 évalue le bonus `E`, ne pas fournir le bonus déjà calculé |
| `masteryRank` | Rang numérique effectif de la discipline/école de l'acteur | M01 évalue `M` ; ne pas transmettre Cercle ou degré narratif |
| `level` | Niveau du personnage/créature exécutant l'action, `[1..25]` | Pas le niveau de l'objet, le grade d'armure ou le Cercle |
| `situation` | Décision contextuelle MJ, `[-2..2]` | Exclusif des bonus d'objet de la même nature sans arbitrage |
| `difficulty`, `mjMinimum` | Difficulté de l'effet + seuil MJ | DD `[15..30]`, minimum `[0..45]` ; non implicites |
| `kind` | Résistance de la cible (`physique`, `magie`, `mental`) | Choisir la nature de l'opposition ; distinct de la provenance de l'action |
| `mode` | `melee`, `tir`, `magie`, `mental` | Mental impose zéro dégât ; `magie` permet uniquement bonus d'affinité autorisé |
| `defender` | Profil de la cible, résolu via Bestiaire/fiches | Versions/copies/propriétaire ; pas de projection des champs MJ secrets côté joueur |
| `feasible` | Déclaration MJ (portée, visibilité, immunité, cible) | `false` annule toute réussite ; dés élevés ne court-circuitent pas |
| `baseDamage` | Définition mécanique approuvée de l'attaque `[1..12]` | Absence bloque les effets PV ; jamais de « 1 » par défaut pour effet descriptif |
| `penetration` | Propriété mécanique attestée `[0..8]` | Zéro uniquement si la règle/source établit l'absence ; autrement réservé |
| `affinityBonus` | Décision MAG validée `[0..10]` | **Réservé** pour Étincelle ; pas un gain automatique du Cercle/degré |
| `effects` | Liste d'effets actifs validés avec source/revision et propriétaire | `validateM03AbilityEffect` pour capacités M02, autres homologations à créer. Meilleur bonus par catégorie. Séparer attaquant/défenseur. |

## Cinq comparaisons minimales de contrat

Toutes les valeurs ci-dessous sont **des exemples fictifs**, uniquement pour démontrer le raccord ; aucune fiche CAP/MAG/OBJETS n'est canonisée.

| Cas | Identifiant de démonstration | Entrées principales | Sortie attendue |
|---|---|---|---|
| Coup d'arme banal | `ATT-ORDINAIRE` | N10, force simulée, lames rang 5, base 6 | Touche selon défense ; dégâts nets M03 |
| Technique physique | `CAP-PHYS-TEST` | Identiques + impact approuvé magnitude 2 | Même touche ; +2 bruts au plus si succès |
| Capacité magique | `CAP-MAG-TEST` | Esprit, maîtrise magie rang 5, `kind=magie`, base fictive 6 | Résistance/protection magiques M03 |
| Étincelle feu C I | `MAG-SORT-001` | École feu, base fictive 6, coûts/bonus **réservés** | Même M03 ; aucun héritage `demo-etincelle` |
| Arme enchantée | `OBJ-ENCHANT-TEST` | Coup ordinaire + effet approuvé magnitude 2 | La règle est sur l'effet autorisé, pas sur le nom d'objet |

Le banc ajoute créature, objet descriptif sans bonus, acte mental sans PV, impossibilité et refus MJ. Tous les appels passent par M03 dans `scripts/test-math-eff-001.mjs`.

## Protocole de découplage et migration (non exécuté)

1. INDEX définit un identifiant stable, un historique de révision et un statut par effet, avec familles communes, droits et provenance.
2. CAP/MAG/OBJETS/BESTIAIRE fournissent des **adaptateurs de lecture** vers le contrat v0 ; les anciennes fiches et coûts restent intacts.
3. MATH compare à données identiques les sorties calculées par l'existant et la projection, notamment 5d6/mental/protection/pénétration et niveaux 1/5/10/15/20/25.
4. ARCHIVES/STUDIO journalisent **l'intention, le jet, la prévisualisation, le consentement MJ, le débit et l'application** séparément ; replay et double-clic idempotents.
5. QA valide manuellement (dés physiques) et par code, y compris les coûts en cas d'échec, cache des secrets MJ, deux onglets, restauration et import legacy.
6. DG arbitre les contrats encore expérimentaux, puis seulement autorise implémentation/migration/merge/publication.

**Interdit tant que non arbitré :** lecture libre du texte d'une fiche pour en extraire un bonus, double résolution de dégâts, traduction Cercle→rang, multiplication de dégâts au N25, adoption des coûts de démonstration, effet mental→PV et attribution automatique des charges d'un enchantement.
