# MATH-REF-002 — Plan d'exécution, recette et publication du 5d6 unifié

**Statut : ordre d'exécution préparé, non encore implémenté ; validation des choix A par le créateur le 16 novembre 2026.**
**Document de décision :** [MATH_REF_002_ARBITRAGES_CREATEUR_2026-11-16.md](MATH_REF_002_ARBITRAGES_CREATEUR_2026-11-16.md).
**Dépendances :** MATH-EFF-001 #147 → MATH-REF-001 #151 → MATH-SITE-001 #152. Préserver les branches et responsabilités propriétaires, les sauvegardes et le site public existant.

## 0. Résultat à livrer

Une **référence mathématique générale homologuée** pour les actions physiques, magiques et mentales, provenant de personnages, capacités, sorts, créatures, armes et enchantements, applicable :

- **Sur table :** un lancer de cinq d6 ; attaque, défense et impact déjà pré-calculés, pas de nouveau jet de dégâts.
- **Dans Studio :** une action déclarée et prévisualisée, un engagement/jet, puis une confirmation MJ/application et sauvegarde idempotentes.
- **Dans les ateliers :** définition versionnée et provenance des effets, validation des prérequis, coûts et droits, aucune lecture de bonus depuis le texte libre.
- **Dans Quartz :** guide joueur/MJ et exemples de création illustrés, publiés **après** les tests et la décision expresse de diffusion.

Une référence complète peut être mise en ligne avant les catalogues exhaustifs MAG/CAP/OBJETS, à condition que les **familles de coûts/effets retenues dans le socle** soient cohérentes et clairement séparées des définitions individuelles encore réservées.

## 1. Lot P0 — Congeler le contrat M03 (MATH + INDEX)

1. Vérifier la tête exacte de main, les sources M01–M03, les versions des PR #147/#151/#152 et les fichiers M03 avant toute modification.
2. Définir le contrat unique d'action : acteur, cible(s), faisabilité MJ, mode physique/magique/mental, caractéristiques et rang, seuil opposé, impact/affinité, pénétration, protection, absorption, effets approuvés, coûts et états.
3. **Parité stricte avec M03 :** si coefficient d'intensité k=1, absorption spéciale=0 et critique additionnel désactivé, le résultat (succès, défense, touche, impact et PV) doit rester identique à resolveCombatM03 pour les entrées compatibles.
4. Proposer l'extension **dans M03**, pas un second moteur concurrent, avec des paramètres explicites, optionnels et validés : intensité offensive homologuée, réduction après armure, résultat héroïque à choix.
5. Clarifier le **placement du +2 critique** avant/après intensité et ses interactions avec l'impact M03 : proposition de sûreté, le meilleur bonus d'impact pour l'action ; **ne jamais ajouter +2 si un +2 d'impact est déjà retenu**, ni refaire le jet. QA doit comparer les options et homologuer ce raccord précis.
6. Limiter le niveau officiel 1–25 ; les crédits de maîtrise exceptionnels pour PNJ N25 ne modifient pas le niveau de l'entité ni ses droits d'accès.

**Sortie P0 :** interface typée versionnée, table de mapping des adaptateurs et matrice de non-régression ; pas de mise en production.

## 2. Lot P1 — Reproductibilité et équilibre (MATH + QA)

### Grille des calculs

Exécuter les niveaux **1, 5, 10, 15, 20, 21, 22, 23, 24, 25**, à plusieurs investissements de maîtrise (exemples r0/1/3/7/15/31, sous réserve du budget autorisé) et plusieurs défenses/grades.

**Tests impératifs :**

- Distribution exacte des **7 776** issues du jet 5d6 ; naturels 5–7 forcés, 27–30 potentiels soumis à faisabilité et seuil.
- Parité M03 de référence à k=1/absorption=0/critique désactivé et contrôle des modes mêlée, tir, magie et mental.
- Critique 27–30 **uniquement sur réussite réelle** ; une seule conséquence choisie, +2 d'impact au plus, jamais de PV sur mental, jamais de cumul illimité.
- Pénétration bornée **uniquement** par la protection ; absorption après protection, meilleur effet 0–2, pas de perforation implicite de l'absorption.
- N20 sans multiplicateur ; N21→N25 coefficients courants/majeurs de la grille acceptée ; valeur minime k=1 encore disponible même à N25.
- Personnage N25+ PNJ avec crédits autorisés et anti-doublon ; rejet des prétendus niveaux 26 et des imports inventant des crédits.
- Objet descriptif : zéro bonus ; propriété d'enchantement non homologuée : zéro effet ; source/identité/approbation effectivement vérifiées.
- MAG-SORT-001 Étincelle feu C I : aucun coût ni dégâts empruntés à demo-etincelle foudre, base/portée non homologuées bloquent l'application.
- Coûts de tentative dus sur échec, gratuits à prévisualisation et jamais débités deux fois ; soumission de deux demandes concurrentes, interruption et reprise.
- Valeurs adversaires ordinaires/élites/boss, risque de one-shot, combats de groupe, accès non violents, soins/effets non-PV clairement distincts.

### Table de mana issue du modèle C — contrôle de calcul, pas coûts fixés d'Étincelle

Les réserves ci-dessous sont **repères historiques de laboratoire** et non un cadeau automatique à chaque personnage.

| Réserve maximale illustrative | Mineur 2 | Significatif max(4, ceil(12 %)) | Majeur max(8, ceil(25 %)) |
|---:|---:|---:|---:|
| 12 | 2 | 4 | 8 |
| 36 | 2 | 5 | 9 |
| 66 | 2 | 8 | 17 |
| 114 | 2 | 14 | 29 |
| 174 | 2 | 21 | 44 |
| 306 | 2 | 37 | 77 |

Une exception de coût par sort doit être clairement enregistrée avec version et permission ; aucune formule ne peut rendre les usages majeurs gratuits par simple hausse du rang.

### Bancs et objectifs de rythme

- Cible de conception **3–5 rounds** ordinaire, **5–8 élite**, **8–12 boss**.
- Mesurer médiane, p10, p90, risque de blocage, consommation et létalité ; tester plusieurs tailles de groupe et répliquer avec graine fixe.
- Les facteurs de PV de test **1 / 1,5 / 2** ne constituent pas une homologation universelle des créatures.
- **Inclure les ripostes actives, les dépenses, les états, les changements de cible et les tactiques MJ** dans la prochaine simulation. Les 6 300 rencontres de MATH-REF-001 sont un banc préparatoire : elles n'incluent pas toutes ces dimensions.
- Pour validation manuelle, au moins les configurations : N1, N5, N10, N15, N20, N21, N25 ; novices et spécialistes ; attaque ordinaire, CAP physique, CAP magique, Étincelle hypothétique, enchantement autorisé/non autorisé, prédateur, effet mental, réussite critique et échec avec coût.

**Sortie P1 :** rapport reproductible (code, graines, versions, résultats complets, écarts), matrice PASS/FAIL et décision sur les cas extrêmes ; aucune performance humaine inventée.

## 3. Lot P2 — Adaptateurs et identité (MAG, CAP, OBJETS, INDEX, BESTIAIRE)

| Référent | Contrat de passage | Limites |
|---|---|---|
| **INDEX** | Définition/instance/variante, id stable, révision, provenance, famille, statut, autorisations et coût réservé explicite | Aucun effet numérique reconstruit depuis texte libre ni confiance dans approved:true importé |
| **CAP** | Aptitudes/techniques/signatures, prérequis, déclencheurs, rang et raffinements tous les 2–3 rangs | Aucun gain gratuit systématique ; effets structurés non cumulables |
| **MAG** | École, Cercle, maîtrise et degré narratif séparés, intensité minime/courante/majeure, modèle C, ressources et conséquences d'échec | Étincelle feu C I séparée de la démo foudre ; coefficients seulement pour effets habilités |
| **OBJETS** | Fabrication descriptive, type d'arme/armure, propriété, enchantement, charges, propriétaire, version et provenance | Un beau nom ou une fabrication réussie ne crée pas un bonus |
| **BESTIAIRE** | Espèce, profil, individu, variante MJ, danger, niveau, PV, attaque et protections | Pas de migration des fiches sources ; PV et danger ne sont pas le niveau |
| **ARCHIVES/STUDIO** | Journal intention/jet, débit sur tentative, confirmation MJ, application/sauvegarde, export/import | Deux gestes maximum ; idempotence ; secrets de MJ en liste blanche |
| **QA** | Tests unitaires, de propriété, exacts 5d6, navigateurs et humains | Aucun « validé » sans sorties vérifiables |

**Sortie P2 :** adaptateurs **non destructifs** et exemples contractuels, avec tests sur les fiches existantes et les données importées ; aucune fusion de catalogues propriétaires sans leur revue.

## 4. Lot P3 — Recette de terrain et UX

Scénario de contrôle commun : un MJ ouvre une campagne locale fictive, crée un personnage N5 (budget 24), copie un Traqueur N5 fictif, prépare une scène, choisit un sort/capacité et une attaque, lance **cinq d6 physiques puis numériques**, constate touche et impact, confirme la dépense de tentative et l'application unique des PV/états, exporte, ferme, réimporte et constate les mêmes résultats sans doublon.

Contrôler : mobile/tablette/PC, contraste et textes alternatifs des huit figures, choix débutant/expert, valeurs pré-calculées, clavier, notes privées invisibles au joueur, deux onglets, redémarrage brutal, conflits de sauvegarde, quota de stockage, permissions de propriétaire et contresignature MJ.

**Sortie P3 :** rapport Chrome/Node et feuille de jeu sur table signés QA, liste de bugs bloquants et corrections confirmées.

## 5. Gate DG — Homologation et site

Pour déclarer **MATH-REF v1 homologuée** :

- [ ] Calculs de P0 et P1 validés, aucune régression M03, écarts documentés.
- [ ] MAG, CAP, OBJETS, INDEX, BESTIAIRE et ARCHIVES accusent réception des contrats propres et des données réservées.
- [ ] QA valide jet, ressources sur échec, critique 27–30, protections, mental, sauvegarde et restauration.
- [ ] Les expériences humaines confirment un rythme convenable ou débouchent sur un arbitrage chiffré explicitement tracé.
- [ ] DG et créateur **homologuent la version de règles** avec numéro et SHA précis.
- [ ] Ensuite seulement, les deux pages MATH-SITE-001 passent de **publish:false à publish:true** et apparaissent dans la navigation, après contrôle de leurs liens, images et labels de statut.
- [ ] Fusion, Pages/Quartz et annonce communautaire se font **séparément**, après recette de déploiement.

## 6. Ordre de missions prêt à transmettre

1. **MATH-REF-002A (P0)** — codifier l'extension M03 et ses invariants, avec le raccord critique 27–30 et les coefficients N21–N25.
2. **QA-MATH-002 (P0)** — préparer les vecteurs exacts et le banc de durée incluant défenseurs actifs, groupe, coût et état.
3. **MAG/CAP/OBJETS-002 (P1)** — produire un exemplaire habilité et un refus par origine, les coûts d'intensité, les charges et la grammaire d'effets.
4. **INDEX/ARCHIVES-002 (P1)** — verrouiller version, approbation, identité, anti-double dépense et copie/variante.
5. **MATH-SITE-002 (P2)** — mise en forme finale des deux chapitres illustrés et de la fiche de table ; attendre Gate DG avant publication.

**Aucun des lots ci-dessus n'est réputé exécuté par ce plan.** Aucun M03 de production n'est modifié ici.
