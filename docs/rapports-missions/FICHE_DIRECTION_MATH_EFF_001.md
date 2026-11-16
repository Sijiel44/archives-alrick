# FICHE DIRECTION — MATH-EFF-001

**Objet :** consolider les effets de jeu sur un contrat unique (attaque, dégâts, protection, pénétration, absorption, états) au-dessus de M01–M03.

**Référence :** SHA imposé `8d4ae50e059d38b568ac5b04a576a6bd6a27b347` ; `main` vérifié au démarrage `8acc0079ace9da502d022dedc904eda1c02cfa31`, quatre commits supplémentaires compatibles.

**Verdict proposé : RECEVABLE pour contre-audit et prototype de raccord, NON HOMOLOGUÉ.** Pas de fusion, publication publique, coût magique canonisé, changement des formules ou migration autorisée.

## Acquis vérifiés

- M03 implémente déjà toucher, résistance, protection, pénétration, dégâts et geste mental non-PV ; le Grimoire et Studio y sont reliés.
- Une seule résolution 5d6 suffit pour touche + dégâts ; en ligne, deux gestes possibles : calculer puis confirmer/appliquer. À la table, un jet unique et deux soustractions prévisibles.
- Banc indépendant exact 7 776 issues, 18 profils (six niveaux × trois maîtrises) et six provenances d'effet ; contrôle de l'objet non enchanté et du mode mental.
- `npm test` intégral **PASS** après constitution du dossier ; aucune recette humaine ou navigateur nouvelle revendiquée.
- Durée N25 préoccupante : ≈26,2 actions pour épuiser les 306 PV de référence avec dégâts de base 6 (profil formé), contre ≈5,8 au N5. Estimation analytique fictive, pas résultat de jeu humain.
- Défaut documenté : l'effet `absorption` est accepté mais n'intervient pas dans le calcul des dégâts M03.

## Arbitrages attendus de DG et du créateur

| Code | Importance | Décision à rendre | Options et recommandations préparatoires |
|---|---|---|---|
| **EFF-01** | **P0, bloquant** | Accepter **M03 existant comme noyau commun** et un contrat d'adaptateurs versionné ? | **Oui conseillé**, sans changer les formules ; ouvrir contre-audit INDEX/MAG/OBJETS/CAP/QA |
| **EFF-02** | **P0** | Sens mathématique de `absorption` M03 et appartenance de défense | A réduction avant pénétration ; B après armure ; C bouclier consommable ; D retirer/déprécier. Recommandation : **pas de choix chiffré sans QA** |
| **EFF-03** | **P0** | Durée cible des combats ordinaires N15–25 | Essai : escarmouche 3–6 rounds, élite 6–10, boss variable ; étudier PV/archétypes, objectifs de victoire et nombre d'actions avant dégâts renforcés |
| **EFF-04** | **P0** | Économie de puissance MAG/CAP/OBJETS et coût d'essai raté | Mana, charges, effort, intensité et timing de débit **réservés** ; distinguer prévisualisation gratuite et tentative effectivement engagée |
| **EFF-05** | P1 | Rang, paliers et neuf degrés d'école | Garder quatre axes séparés : N personnage, Cercle, rang numérique, degré narratif. Privilégier déblocages de techniques plutôt que `+1` par rang |
| **EFF-06** | P1 | Quelles familles d'effets et états mentaux seront exécutables ? | Décrire condition/contrôle/durée/cible/sortie ; mental non-PV par défaut ; MJ garde l'autorité |
| **EFF-07** | P1 | Politique d'objets et d'enchantement | Tout objet descriptif est neutre. Seul effet identifié, révisé, approuvé et possédé projette un bonus M03 ; règles de cumul à fixer |
| **EFF-08** | P1 | Identité transactionnelle et secrets MJ | Intention→résolution→confirmation→débit/application→sauvegarde ; replay idempotent, fenêtre joueur en liste blanche |
| **EFF-09** | P1 | Statut de `MAG-SORT-001 Étincelle` feu, Cercle I | Valider nature de résistance/éligibilité ; DD, dégâts et coûts non fixés. Aucun héritage `demo-etincelle` foudre |
| **EFF-10** | P2 | Intensité des effets 21–25 et multiplicateurs | MATH-002 reste une étude ; refuser multiplicateur automatique de dégâts, faire essais de sensibilité d'abord |

## Feu vert demandé, par étapes et sans présumer de l'accord

1. **Autoriser la revue** de cette enveloppe et la mission de passation en lecture seule aux propriétaires.
2. **Arbitrer EFF-01 à EFF-04** ; fixer les seuils de durée souhaités et une doctrine de dépense ratée.
3. **Autoriser un prototype optionnel** d'adaptateurs (sans moteur concurrent) sur branche propriétaire, avec tests de parité et UI deux gestes.
4. **Faire valider par QA** cinq parcours d'attaque, mental, enchantement, restauration, multi-onglets et table physique.
5. **Décider explicitement** de la fusion et de la publication du site. La présence d'une PR documentaire ne constitue pas une homologation.

## Pièces de transmission

- [Rapport sourcé et simulations](MATH_EFF_001_RAPPORT_TECHNIQUE.md)
- [Contrat unique des effets v0](MATH_EFF_001_CONTRAT_EFFETS_V0.md)
- [Matrice M03/effets/objets/sorts](MATH_EFF_001_MATRICE_INTEROP.md)
- [Passations spécialisées](MATH_EFF_001_PASSATIONS.md)
- [Aide de table et recette UX](MATH_EFF_001_FICHE_TABLE_ET_RECETTE.md)
- `node scripts/test-math-eff-001.mjs` : reproduction sur les modules de production intacts

**Autorité de décision :** DG et créateur. Les valeurs d'échantillon sont marquées « fictives ». Rien ne remplace le contrôle des sources et les rapports de QA.
