# MATH-REF-001 — Référence mathématique générale 5d6 (candidate v0.1)

**État : proposition intégrale pour contre-audit, NON encore homologuée ni appliquée.** Créateur : arbitrages du 16 novembre 2026. Socle : M01–M03 existants, [audit MATH-EFF-001](MATH_EFF_001_RAPPORT_TECHNIQUE.md), [registre d'arbitrages](MATH_EFF_001_ARBITRAGES_CREATEUR_2026-11-16.md). Environnement de référence : `Sijiel44/archives-alrick`, `main@aedd155693c49be0d71f3f72884e5dace4d070bb` contrôlé avant ce lot ; quatre commits de contenu depuis l'audit initial, aucun fichier M01–M03 modifié par ces quatre commits. Cette note n'a pas autorité de canon et ne remplace pas M03 de production.

## 0. Règle lisible en une phrase

> **Jette 5d6 pour savoir si ton action fonctionne. Si elle inflige des dégâts, son impact est déjà calculé : soustrais la protection résiduelle et l'absorption.** Pas de second jet de dégâts. Un effet mental n'enlève jamais de PV automatiquement.

Le même principe s'applique à **attaque ordinaire, capacité physique, capacité magique, sort, rite opposé, enchantement, objet et créature**. Le contexte, les ressources et les effets autorisés varient, pas la physique mathématique sous-jacente.

## 1. Données et frontières du système

| Information | Nature | Conséquence autorisée |
|---|---|---|
| Niveau du personnage `N=1..25` | Progression de PJ/PNJ | Contribution d'impact, protection innée et accès de campagne |
| Caractéristique brute `c` | M01 ; **pas de plafond 12** | Bonus décroissant `E(c)` |
| Rang numérique de maîtrise `r>=0` | M01/M02, école/discipline propre | Bonus décroissant `M(r)` ; précision, contrôle, impact existant |
| Cercle magique I–IX | Accès au répertoire/rituel/matrice | **Jamais** égal au niveau ni à un multiplicateur de dégâts |
| Neuf degrés narratifs de maîtrise d'école | Statut/enseignement fictionnel | Déblocage validé, **pas** `+9` au jet |
| Éveil divin `N20`, divin affirmé `N21..25` | Décision du créateur | Options de puissance et fiction ; aucune divinité imposée hors pacte de table |
| Expérience `25+` | **PNJ uniquement**, toujours niveau 25 | Crédits de maîtrise supplémentaires validés, non niveaux 26+ |
| Objet | Référence/propriété/instance/charges | Aucun bonus automatique si purement descriptif |

Une campagne peut démarrer avec des PJ de haut niveau si **MJ et participants** approuvent l'échelle de départ ; l'architecture ne doit pas imposer une campagne 1→25 à tout le monde.

## 2. Le jet de résolution : M01 et M03 inchangés

1. **Bonus effectifs :** `E(c)=floor(3×log2(1+c/3))`, `M(r)=floor(log2(1+r))`.
2. **Jet unique :** `J=5d6 + E(c) + M(r) + situation[-2..2] + précision_homologuée[0..2]`.
3. **Défense opposée :** `R=15+E(carac défensive pertinente)+M(meilleure maîtrise défensive)+bonusMJ[0..8]+meilleur effet de défense[0..2]` ; ne pas cumuler toutes les maîtrises défensives.
4. **Seuil :** `S=max(DD[15..30],seuil MJ[0..45],R)`.
5. **Résultat :** les valeurs naturelles 5–7 échouent toujours. Une réussite exige `faisable=true` et `J>=S`. Un naturel 27–30 peut ouvrir un contact narratif même sans succès, **sans PV automatique** et sans transgresser une impossibilité.

La maîtrise efficace change par paliers logarithmiques. Exemples `r→M(r)` : `0→0`, `1→1`, `3→2`, `7→3`, `15→4`, `31→5`. La différence de maîtrise n'est pas effacée : elle contribue aussi au contrôle, à la sélection de techniques et, déjà dans M03, à l'impact. Il n'existe pas de `+1 par niveau` automatique.

## 3. La chaîne unique de dégâts

### M03 actuellement en production (référence de parité)

Pour un coup qui réussit et qui peut enlever des PV :

```
I = baseDamage[1..12] + floor(0.7*N) + M(r) + impact_homologué[0..2]
D_bruts = I + affinité_magique_autorisée[0..10]
protection = protection_innée + protection_équipement + protection_contexte
penetration_retenue = min(protection, penetration_base[0..8] + penetration_effet[0..2])
protection_restante = max(0,protection - penetration_retenue)
PV = max(0,D_bruts - protection_restante)
```

**Ni la pénétration, ni le dommage, ni l'armure ne modifient une seconde fois la chance de toucher.** Un échec, une action impossible et un « contact spectaculaire » sans touche causent zéro PV.

### Extension candidate MATH-REF-001 (non implémentée en production)

Le créateur confirme une vraie rupture de puissance de `N20→N21` et une intensité modulable. Nous proposons d'étendre **le même calcul M03**, entre impact et absorption, par deux paramètres homologués :

```
k = coefficient_intensité_de_l'effet(niveau,mode_choisi,habilitation)
D_bruts_candidat = floor(I * k) + affinité_magique_autorisée
absorption_effective = min(absorption_autorisée[0..2],
                            max(0,D_bruts_candidat - protection_restante))
PV_candidat = max(0,D_bruts_candidat - protection_restante - absorption_effective)
```

- `k=1` pour l'intensité **minimale** et les actions ordinaires N1–20. L'éveil de N20 est **réel narrativement** et peut débloquer des gestes, mais n'ajoute pas encore de coefficient offensif.
- `k>1` seulement pour une définition d'effet **éligible et homologuée** à partir de N21. Le **niveau seul ne multiplie pas chaque effet descriptif** : il autorise une option dans le budget de l'action.
- `absorption[0..2]` est le **meilleur effet de réduction de dégâts homologué**, appliqué **après** l'armure et la pénétration. Elle n'est **pas** un stock de PV temporaires, et deux absorptions ne s'additionnent pas. Plage 1–2, durée 1–3 rounds : réemploi du contrat de capacité M03 existant, à faire ratifier par QA/CAP.
- Les affinités magiques restent **additives** et ne sont pas multipliées une deuxième fois. Le rang `M(r)` est déjà inclus dans `I` et n'est pas ajouté après le multiplicateur.
- **Mode mental : `D_bruts=PV=0` quelle que soit l'intensité**, une réussite propose une conséquence narrative/état que le MJ doit approuver. Aucun effet de statut ne se déduit automatiquement d'un texte libre.
- Les dégâts sont calculés en **entiers** par `floor` ; pas de dés supplémentaires, même en puissance divine.

Ces deux champs **n'existent pas aujourd'hui comme calcul actif** dans `resolveCombatM03`. Une implémentation après homologation doit **étendre M03** et faire des tests de parité pour `k=1, absorption=0`, **pas écrire un moteur parallèle**.

## 4. Grille de puissance acceptée pour les simulations

| Niveau | Identité | Intensité minimale | Courante divine | Majeure divine |
|---:|---|---:|---:|---:|
| 1–19 | Ordinaire | ×1 | — | — |
| **20** | **Éveil divin** | ×1 | — | — |
| **21** | **Divin affirmé** | ×1 | **×1,25** | **×1,50** |
| 22 | Développement divin | ×1 | ×1,30 | ×1,60 |
| 23 | Développement divin | ×1 | ×1,35 | ×1,70 |
| 24 | Développement divin | ×1 | ×1,40 | ×1,80 |
| **25** | Accomplissement | ×1 | **×1,50** | **×2,00** |
| **25+ (PNJ)** | Autorités d'exception | ×1 possible | Grille N25 | **>×2 à étudier**, rare et limité |

**Statut : grille de conception acceptée par le créateur, mais non homologuée comme formule publiée.** Le joueur peut toujours choisir une intensité moindre : une Étincelle minime reste utile à N25 sans coût d'explosion obligatoire. Les calculs `×1,30` etc. sont **précalculés sur fiche ou dans Studio** ; la table ne doit pas faire de décimales à chaque action.

Le N20 marque l'éveil dans la fiction et peut apporter un choix de technique ; au N21 le saut calculé se voit même à maîtrise constante. Les rares effets véritablement exceptionnels restent bornés par leur famille de capacité, leur coût et l'autorisation MJ.

## 5. Maîtrises : gains plaisants sans inflation

Le rang `r` est payé au coût M01 (`masteryCost`, prix croissant par tranches de six rangs) et résolu par `M(r)`. Proposer au CAP/MAG une **cadence de choix techniques** liée aux achats réellement réalisés : petits raffinements de précision/contrôle/condition à intervalles rapprochés, et **paliers majeurs** aux rangs où `M(r)` augmente (`1,3,7,15,31,…`). Les déblocages ne garantissent jamais un `+1 dégât` gratuit ni un cumul infini ; un effet chiffré requiert homologation `AuthorizedM03Effect` et ses bornes.

Pour **N25+ PNJ seulement**, `level` reste 25 ; des crédits exceptionnels de maîtrise, attribués lors de grands jalons d'expérience par le MJ, pourraient s'ajouter aux **144 points de budget M01 N25**. Les achats utiliseraient **les coûts de maîtrise M01**, mais **M02 bloque actuellement** les dépenses au-delà du budget autorisé : il faudra un registre/snapshot versionné de crédits post-25, anti-doublon, avant toute intégration. Hypothèse de travail non canonique : **3 à 6 crédits par grand jalon**, jamais automatiquement par année écoulée. Pas de nouveau niveau, pas de barème d'XP divin public destiné aux PJ.

## 6. Magie, objets, capacités : une intensité, plusieurs provenances

| Provenance | Exemple | Comment elle rejoint M03 | Limites et ressources |
|---|---|---|---|
| Attaque ordinaire | Lame | Physique, stat, rang, base, pénétration attestés | Aucune intensité magique déduite |
| Capacité physique | Coup précis ou technique d'assaut | Même M03 + effet homologué | Effort/usage/conditions de CAP, **pas de mana inventé** |
| Capacité magique | Trait contrôlé | `mode=magie`, résistance appropriée | École/maîtrise, coût MAG et intensité homologués |
| Sort | `MAG-SORT-001 Étincelle` **feu** C I | Même touche M03, dommages/armure M03 si offensif | DD/base/mana/portée encore à homologuer ; `demo-etincelle` **foudre** distinct |
| Enchantement/objet | Arme porteuse d'une flamme | Attaque de l'utilisateur + meilleur effet de l'objet | Provenance, version, propriété, charges ; aucun bonus si pure description |
| Créature | Griffes ou souffle | Profil et attaque Bestiaire projetés dans M03 | Copies/variantes MJ, pas modification de la source canon |
| Effet mental | Peur, suggestion | Opposition mentale M03, effet proposé | **0 PV** ; durée/état séparément validés |

Les préférences MAG-002/003 sur les coûts (geste mineur, action significative, majeure) et récupération existent déjà : elles constituent des **références de travail**, mais les valeurs de `MAG-SORT-001`, des charges et des matrices **restent réservées** jusqu'au contre-audit MAG/OBJETS/DG. Les intensités doivent être financées à partir des ressources pertinentes et prévisibles ; augmenter la maîtrise ne rend pas toutes les attaques maximales gratuites.

## 7. Cycle d'application : un jet, deux gestes maximum

1. **Préparer sans jeter :** action, cible, faisabilité, habilitation, coûts potentiels, DD, protection et résultat théorique affichés ; aucune dépense ou PV muté. L'écran joueur voit seulement sa liste blanche.
2. **Geste 1 — « Engager et lancer 5d6 » :** consentement MJ/acteur selon droits, vérification de la ressource, **engagement/debit de tentative selon politique homologuée**, jet 5d6 unique, snapshot idempotent. Un essai raté coûte aussi une ressource si la politique `on-attempt` le prévoit. Pas de reroll gratuit en regardant la prévisualisation.
3. **Geste 2 — « MJ : appliquer le résultat » :** présenter touche, dégâts nets, résistance/protection/absorption, effet mental proposé, cibles et dépenses. Appliquer conséquences **une fois**, avec clé d'opération et contrôle de version ; export et restauration conservent le jet et le coût initial.

Sur table, on annonce et vérifie le coût **avant** les dés, puis on lance **5d6 une seule fois** ; tous les bonus fixes et l'impact net sont affichables sur une fiche pré-calculée. Les ressources ne sont pas déduites au moment d'un simple aperçu.

**Point de jonction :** Grimoire v1 débite après confirmation de la tentative, Studio a déjà une confirmation d'application séparée ; leur unification doit préserver ces garanties sans payer deux fois ni introduire une simulation gratuite de jets.

## 8. Critères avant homologation et publication

- **Parité M03 :** avec `k=1` et absorption nulle, les 7 776 issues doivent donner le même jet, seuil, touche et PV qu'actuellement.
- **Sécurité :** `approved:true` importé n'est pas une preuve suffisante ; identité/revision de l'effet, propriétaire, habilitation et approbation MJ vérifiées. Aucun secret MJ dans fenêtre joueur.
- **Balance :** N1/5/10/15/20/21/22/23/24/25, novices/formés/spécialistes, résistance physique/magique/mentale, pénétrations, objets, créatures. Vérifier les risques de one-shot et de blocage entre niveaux très différents.
- **Rythme :** objectif créateur **3–5 rounds ordinaire, 5–8 élite, 8–12 boss**, avec groupes et scènes jouées ; les facteurs de PV utilisés au banc restent des hypothèses, pas de nouvelles règles Bestiaire.
- **Ressources et sauvegardes :** coûts, échec, charges, doubles clics, deux onglets, export/import, intégrité des journaux et copie MJ strictement testés.
- **Publication :** contre-audit MAG, OBJETS, CAP, INDEX, ARCHIVES, QA et DG ; décision expresse d'homologation des chiffres, puis documentation Quartz et recette Chrome/table avant fusion/déploiement.

**Livrables associés :** [simulations/recette](MATH_REF_001_SIMULATIONS_RECETTE.md), [fiche jeu sur table](MATH_REF_001_FICHE_5D6_TABLE.md), [fiche Direction](FICHE_DIRECTION_MATH_REF_001.md), `scripts/test-math-ref-001.mjs`.
