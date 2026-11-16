# MATH-REF-002 — Registre des arbitrages du créateur (16 novembre 2026)

**Statut : ARBITRAGES DE CONCEPTION VALIDÉS PAR LE CRÉATEUR ; homologation technique et publication à venir.**
**Source de décision :** réponse du créateur « J’aime aussi les recommandations on peux partir la dessus, donc prepare la suite », en validation des quatorze réponses **A** de la consultation MATH du même jour.
**Socle contrôlable :** M01–M03, MATH-EFF-001 (PR #147), MATH-REF-001 (PR #151), guide MATH-SITE-001 (PR #152).
**Portée :** contrat de référence **candidat** pour le nouveau site et les adaptateurs MAG / CAP / OBJETS / INDEX / BESTIAIRE / ARCHIVES / STUDIO. Aucun changement d'exécutable M03 dans cette mission.

> IMPORTANT : « validé par le créateur » qualifie ici les **choix de conception**. Le document **ne certifie pas** les résultats d'une recette applicative, d'un playtest humain, d'une fusion ou d'une publication. Les paramètres réservés au catalogue de chaque sort/objet restent réservés.

## A. Décisions 1 à 14 — aucune réponse B ou C retenue

| # | Décision retenue (option A) | Effet contractuel / limite |
|---:|---|---|
| 1 | **Dégâts communs M03.** Préserver la formule M03 hors extensions autorisées. | Impact offensif = base homologuée [1..12] + floor(0,7 × N) + M(rang) + meilleur impact autorisé, plus affinité magique homologuée et extension d'intensité si habilitée. Jamais second dé de dégâts. |
| 2 | **Combats brefs par profils de rencontre.** Conserver les PV PJ, adapter les créatures ordinaires, élites et boss avec exceptions MJ. | Objectifs déjà retenus : 3–5 rounds ordinaires, 5–8 élites, 8–12 boss. Les multiplicateurs de PV 1 / 1,5 / 2 sont des **hypothèses du banc**, pas des valeurs universelles canonisées par cette réponse. |
| 3 | **Très bon jet gratifiant.** Sur un naturel 27–30 et une action réellement réussie, choix entre avantage tactique/narratif ou **impact supplémentaire borné à +2**. | Sans second jet ; jamais de PV automatiques en mental ni de transgression de faisabilité. À intégrer sous forme d'une source d'impact non cumulable avec un autre bonus de même catégorie ; vérifier sa compatibilité exacte avec les effets M03. |
| 4 | **Absorption après protection.** Réduction 1–2, meilleur effet seulement. | Chaîne : impact → pénétration de la protection → protection restante → meilleure absorption, puis PV. Pas de PV temporaires cachés. Valeur plafonnée aux effets ordinaires ; exception divine = homologation distincte. |
| 5 | **Pénétration limitée à l'armure/protection**, pas à l'absorption spéciale. | Pénétration n'augmente pas l'impact brut et ne modifie pas une seconde fois le jet de touche. |
| 6 | **Divin : amplification offensive ciblée en v1.** | Coefficients déjà acceptés : N20 éveil sans multiplicateur ; N21 courante ×1,25 / majeure ×1,50 ; N22 ×1,30 / ×1,60 ; N23 ×1,35 / ×1,70 ; N24 ×1,40 / ×1,80 ; N25 ×1,50 / ×2. Uniquement pour un effet offensif éligible et une intensité choisie ; pas pour toutes les armes ni tout effet descriptif. Soins et protections divins feront l'objet de règles spécialisées ultérieures. |
| 7 | **Maîtrise plaisante.** Raffinements modestes tous les 2–3 rangs et déblocages majeurs aux paliers logarithmiques. | M(r)=floor(log2(1+r)), donc paliers 1,3,7,15,31… ; aucun +1/rang automatique, bonus infini ou nouveau Cercle implicite. CAP/MAG proposent la liste de techniques, prérequis et accès. |
| 8 | **Coûts de magie : modèle C comme grille de référence.** | Geste mineur : 2 mana ; significatif : max(4, ceil(0,12 × manaMax)) ; majeur : max(8, ceil(0,25 × manaMax)). Des exceptions par sort doivent être explicitement définies et approuvées ; pas d'héritage de l'ancien demo-etincelle foudre. |
| 9 | **Coût à la tentative engagée, même en cas d'échec.** | Aucune dépense à la prévisualisation. Un seul débit idempotent attaché à l'intention/au jet engagé ; confirmation MJ d'application des PV/états distincte. Annulation/interruption et compensation à spécifier par MAG/ARCHIVES. |
| 10 | **Objets/enchantements sur les mêmes familles bornées que CAP/M03.** | Propriété homologuée, provenance, révision et limites obligatoires. Charges/ressources définies par objet, non inventées universellement. Un objet purement descriptif donne 0 bonus numérique automatique. |
| 11 | **États mentaux légers préstructurés.** | Petits états proposés tels que troublé, intimidé, désorienté, à durée brève/1–3 rounds à qualifier par CAP/QA et toujours validés par MJ. Aucun PV automatique ; aucune domination mentale déduite d'un simple succès. |
| 12 | **Pas de jauge d'endurance physique universelle en v1.** | Conditions, limites et éventuelles ressources attachées à chaque capacité par CAP, sans « deuxième mana » automatique. |
| 13 | **25+ : PNJ seulement, niveau conservé à 25.** | Crédit exceptionnel de maîtrise indicatif **3 à 6 points par grand jalon narratif**, attribué par MJ ; aucune XP annuelle automatique ni niveau 26. M02 doit gérer une extension versionnée de budget sans écraser les données existantes. |
| 14 | **Publication progressive.** | Homologuer et publier le cœur 5d6 et combat **avant** la finalisation exhaustive de tous les catalogues de sorts, capacités et objets. Ceci n'autorise **ni la publication immédiate ni la fusion sans recette**. |

## B. Invariants antérieurs confirmés et préservés

- **Cinq d6 inchangés**, distribution de 7 776 combinaisons, naturels 5–7 = échecs forcés.
- **E(c)=floor(3×log2(1+c/3))** ; **M(r)=floor(log2(1+r))**. Les caractéristiques brutes n'ont pas de plafond définitif à 12 ; progression des personnages de 1 à 25.
- Les niveaux du personnage, Cercles I–IX, rangs numériques de maîtrise et neuf degrés narratifs d'école **ne se convertissent pas les uns dans les autres**.
- Niveau **20 = éveil divin**, **21 = divinité affirmée**, **25 = accomplissement**. Départ d'une campagne à haut niveau possible par accord explicite de toute la table.
- **L'intensité doit aussi pouvoir diminuer** : un mage N25 peut choisir un usage mineur utile avec dépense moindre quand la définition l'autorise. La maîtrise facilite d'abord précision, contrôle et techniques ; la puissance consomme des ressources.
- Une action physique, magique, mentale, d'objet ou de créature suit un **contrat de résolution commun** ; les états non-PV et coûts spécifiques demeurent des familles spécialisées. Mental = 0 PV automatique.
- Étincelle **MAG-SORT-001 = feu, Cercle I** ; l'ancienne démo de foudre **demo-etincelle** n'est ni sa source de dommages ni sa source de coûts.
- **Un lancer sur table, deux gestes maximum dans Studio** : prévisualiser sans mutation ; engager et lancer une fois ; confirmer MJ et appliquer une fois ; journaliser, sauvegarder, restaurer sans doublon. Secrets MJ hors fenêtre joueur.

## C. Ordre exact des calculs candidat

Pour une action offensive **éligible** et réussie, avec effet validé, vérifier d'abord les cinq dés, le bonus effectif, la faisabilité et la résistance cible (M03).

1. **Impact M03 avant intensité :** I = baseDamage + floor(0,7×N) + M(rang) + meilleur impact autorisé.
2. **Intensité éventuelle :** k=1 hors effet intensifiable ; sinon coefficient d'action de la grille divine si niveau/habilitation/intensité le permettent.
3. **Bruts candidats :** D = floor(I×k) + bonus d'affinité magique autorisé. Ne pas multiplier une deuxième fois l'affinité ni réajouter M(rang).
4. **Protection restante :** P = max(0, protectionM03 − min(protectionM03, pénétration autorisée)).
5. **Absorption spéciale :** A = meilleure réduction homologuée, dans les bornes ordinaires 0–2 et sans cumul du même type.
6. **PV perdus :** max(0, D − P − A).
7. **Mental, échec, action impossible ou contact potentiel sans réussite :** 0 PV ; traiter séparément la proposition narrative/état.

**Point de revue important :** le choix critique +2 du point 3 est approuvé comme *intention de design*, mais son ordre exact avec le multiplicateur k, le plafond d'impact M03 et les autres sources d'impact doit être testé puis fixé **sans double comptage**. Le schéma ci-dessus n'en fait pas une autorité automatique en production.

## D. Détails expressément non tranchés par « tous A »

- Nombre précis de PV par famille/espèce : à équilibrer en QA/Bestiaire ; coefficients 1/1,5/2 du banc ne deviennent pas un dogme.
- Répertoire complet des techniques de maîtrise : CAP/MAG définiront leurs effets et conditions, pas un gain automatique tous les deux rangs.
- Portée, résistance, base de dégâts, aire, durée et autres propriétés de chaque sort, notamment MAG-SORT-001 ; coûts dérogatoires explicites si besoin.
- Stock de charges, recettes et matières de chaque enchantement ; pas de fabrication d'effet à partir d'une simple réussite d'artisanat.
- Table définitive des états mentaux et durées, interactions avec immunités et consentement narratif.
- Politique de remboursement/annulation d'une tentative engagée, concurrence entre onglets et restauration.
- Divinité défensive/soins et capacités rares des PNJ 25+ au-delà de l'enveloppe offensive ordinaire.

## E. Décision de mise en production

**Décisions créateur : validées. Formules enrichies : candidates à homologation. Site : non publié.**

Aucun fichier de production M03, Grimoire, Bestiaire, Studio ni données canoniques n'a été modifié par ce registre. Homologation à prononcer **après** les tests reproductibles, recettes navigateur + dés physiques et contre-audits. Les deux pages illustrées MATH-SITE-001 restent **publish: false** jusqu'à un feu vert explicite de diffusion.

**Suite :** [Plan d'exécution MATH-REF-002](MATH_REF_002_PLAN_VALIDATION_ET_PUBLICATION.md) et [PR #152](https://github.com/Sijiel44/archives-alrick/pull/152).
