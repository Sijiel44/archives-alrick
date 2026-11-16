# MATH-REF-001 — Simulations exactes et plan de recette

**Statut : banc purement mathématique exécuté, moteur de production inchangé, recette humaine encore à effectuer.** Référence : `node scripts/test-math-ref-001.mjs` sur branche documentaire issue de MATH-EFF-001. Ce script charge **les vrais modules M01, M03, Bestiaire et distribution 5d6** ; il compare ensuite des **calculs hypothétiques** de coefficient/absorption **en dehors** de `resolveCombatM03` (aucun deuxième moteur livré au site).

## 1. Hypothèses, reproductibilité et limite de validité

```sh
npm ci --no-audit --no-fund
node scripts/test-math-eff-001.mjs
node scripts/test-math-ref-001.mjs
npm test
```

- Exact 5d6 : **7 776 combinaisons** et distribution des sommes `5..30`; les taux de touche et dégâts par action sont **exacts** sous les profils de test.
- Profils fictifs : `carac=3+floor(.55×(niveau−1))` ; rang de maîtrise `floor(.45×(niveau−1))` ; DD21, situation0 ; une attaque physique base6, sans impact ni affinité supplémentaires. Cible de niveau égal avec même rang et grade d'armure `min(5,floor(N/5))`.
- Projection divine : grille N20–25 validée **pour l'expérimentation** par le créateur, `floor(I×k)` avant armure ; l'absorption candidate réduit 0–2 PV après la protection restante.
- PV de rencontre : valeur Bestiaire de référence `baseHealth(N)`, puis facteurs **expérimentaux** `×1` ordinaire, `×1,5` élite et `×2` boss. Ils ne sont ni des ratios officiels de créatures ni une proposition de modifier tous les PV des PJ.
- Pour les rencontres, trois alliés contre **une seule réserve de PV** ; chaque allié peut utiliser **une action majeure au premier round seulement**, puis l'intensité courante ; 300 simulations par niveau et catégorie, PRNG fixe `20261116`, soit **6 300 rencontres simulées**.
- **Limites :** ces rounds offensifs ne modélisent pas ripostes, soins, défense active, conditions, retardement, fuite, objectifs, ressources réelles et initiative. Les résultats ne sont **pas** une durée garantie de combat en conditions humaines.

## 2. Vérifications automatisées PASS

| Invariant vérifié | Résultat |
|---|---|
| Parité des calculs `k=1`/absorption0 avec M03 pour naturels 5..30 et dix niveaux | **PASS** |
| Échec 5–7, action impossible, aucun PV automatique | **PASS** |
| Mental au N25, intensité majeure, grand dégât fictif | **PASS**, PV=0, proposition d'effet conservée |
| Pénétration augmente les dégâts nets ou les laisse constants | **PASS** |
| Absorption candidate2 réduit les dégâts d'au plus2 après armure | **PASS** ; la catégorie de M03 production reste dormante |
| N20 facteur1, N21 facteur1,25/1,50, N25 facteur1,50/2 | **PASS**, coefficients du banc |
| M01 N25 budget144, `masteryCost(31,32)=6`, `M(31)=M(32)=5` | **PASS** ; impossibilité d'attribuer des crédits N25+ sans adaptateur M02 |
| 6 300 rencontres à graine fixe sans blocage | **PASS** ; médianes N25 dans la plage de rythme candidat |

## 3. Dégâts moyens exacts, six niveaux essentiels et paliers divins

| Niveau | PV réf. | Touche | M03 actuel : dégâts/action | Intensité courante candidate | Intensité majeure candidate |
|---:|---:|---:|---:|---:|---:|
| 1 | 12 | 50,0 % | 3,00 | 3,00 | 3,00 |
| 5 | 36 | 69,5 % | 6,25 | 6,25 | 6,25 |
| 10 | 66 | 77,9 % | 9,34 | 9,34 | 9,34 |
| 15 | 114 | 77,9 % | 10,12 | 10,12 | 10,12 |
| **20 (éveil)** | 174 | 77,9 % | 11,68 | 11,68 | 11,68 |
| **21 (divin)** | 198 | 77,9 % | 11,68 | **15,57** | **20,24** |
| 22 | 222 | 77,9 % | 12,46 | 17,91 | 23,36 |
| 23 | 246 | 77,9 % | 13,24 | 19,46 | 26,47 |
| 24 | 270 | 77,9 % | 13,24 | 21,02 | 28,81 |
| **25** | 306 | 77,9 % | 11,68 | **21,80** | **31,92** |

Le passage 20→21 augmente les dégâts moyens attendus d'environ **33 %** en intensité courante et **73 %** en majeure, avec la même chance de toucher dans le profil choisi. C'est une vraie rupture mais pas une réussite automatique. La précision continue à dépendre du rang, de la caractéristique et de la cible.

## 4. Rythme expérimental de rencontre — groupe de trois

Trois alliés du même niveau, une tentative majeure par allié au premier round, puis intensité courante, 300 affrontements offensifs par cas ; médiane et intervalle des 10e/90e percentiles :

| Niveau | Ordinaire ×1 PV | Élite ×1,5 PV | Boss ×2 PV |
|---:|---:|---:|---:|
| **10** | 3 rounds (2–4) | 4 (4–5) | 5 (4–6) |
| **20** | 5 (5–6) | 8 (7–9) | 10 (9–12) |
| **21** | 4 (4–5) | 6 (6–8) | 9 (8–10) |
| **25** | **5 (4–6)** | **7 (6–8)** | **9 (8–11)** |

Au N25, les médianes se placent dans le rythme souhaité par le créateur (**3–5 / 5–8 / 8–12**). **Attention :** les N10 et niveaux plus bas ne satisfont pas nécessairement le rythme des boss avec ces seuls facteurs PV. Ajouter mécaniques de phase/objectifs et adapter les rencontres par niveau avant d'en faire une règle générale ; ne pas imposer ×2 PV à toutes les créatures.

La simulation avec **une majeure par combattant** est un **budget d'usage de test**, pas une règle de mana approuvée. Les réels coûts, recharge, charges et économie d'actions pourront changer les chiffres ; ils doivent être intégrés avant homologation.

## 5. Points de rupture à contre-auditer

1. **Effets inattendus d'armure :** la multiplication **avant** armure rend parfois les dégâts nets plus sensibles que le seul coefficient `k`. Tester grade5, protection contextuelle max, résistances magiques et pénétrations.
2. **Écarts de niveaux :** vérifier N5 contre N25 (blocage observé dans M03 de référence), N20 contre N21, N21 contre N25 et l'inverse, en particulier risque d'adversaire trivial ou d'immunité déguisée.
3. **Nombre d'alliés :** 1v1, 2v2, 3v1, 4v1, 4v4, créatures avec contrôles de zone et soins ; mesurer le nombre de rounds *réels* et les ressources consommées.
4. **Multiplicateurs d'effets non offensifs :** `k` ne doit pas doubler automatiquement toutes les durées, aires, soins, états mentaux ou boucliers. Chaque famille exige une définition de budget et d'intensité homologuée.
5. **Autorités 25+ PNJ :** budget d'achat après N25 sans niveau26, journal des gains MJ, droits, coût croissant M01 et déblocages techniques ; pas de points distribués automatiquement par ancienneté.
6. **Économie magique :** réviser les seuils MAG-002/003 sur réserve basse/haute, mineure→majeure et tentative ratée. Le `demo-etincelle` de foudre ne fournit aucun chiffre canon pour Étincelle feu.

## 6. Recette humaine et intégration encore non exécutées

| ID | Action de recette | Attendu avant publication |
|---|---|---|
| `TAB-01` | Jouer sur table un coup N5, cinq dés naturels 18 | Touche et 9 PV avec chiffres de référence, aucun deuxième jet |
| `TAB-02` | N21 + Étincelle feu en mineure/courante/majeure | Même moteur de touche ; intensité choisie avant lancer, coûts visibles, champs approuvés |
| `TAB-03` | Enchantement offensif et armure avec absorption1/2 | Aucun bonus gratuit, meilleur effet par catégorie, dégâts jamais négatifs |
| `TAB-04` | Attaque mentale réussie, grande puissance | 0 PV, état proposé et soumis au MJ |
| `UX-01` | Voir la fiche et les seuils avant le jet | Aucun débit, ni nouveau résultat aléatoire gratuit |
| `UX-02` | Engager lancer, rater, appliquer/refuser conséquences | Tentative débitée suivant la politique approuvée, PV non appliqués si échec |
| `UX-03` | Cliquer deux fois / reconnecter / deux onglets | Idempotence complète et journal cohérent, aucune répétition des ressources/PV |
| `UX-04` | Fenêtre joueur lors d'une action MJ | Aucun secret ou note MJ transmis |
| `DATA-01` | Import/export/restauration/legacy M01–M05, Grimoire et Bestiaire | Conservation des champs inconnus, provenance, statut canon/proposition et règles d'effet |

**Verdict :** banc mathématique prometteur et reproductible ; **ni recette de combat humain, ni interface en deux clics, ni fusion, ni site publié** à ce stade.
