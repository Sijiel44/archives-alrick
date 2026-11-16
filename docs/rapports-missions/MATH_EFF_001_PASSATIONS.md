# MATH-EFF-001 — Passations préparées par référent

**Statut : messages prêts à transmettre ; aucune transmission externe présumée, aucun propriétaire modifié.** Base `main@8acc0079ace9da502d022dedc904eda1c02cfa31`. Contrat candidat [MATH_EFF_001_CONTRAT_EFFETS_V0.md](MATH_EFF_001_CONTRAT_EFFETS_V0.md) ; [matrice](MATH_EFF_001_MATRICE_INTEROP.md) ; [rapport](MATH_EFF_001_RAPPORT_TECHNIQUE.md).

## MAG — Magie, sorts et maîtrise d'école

**Mission demandée :** présenter la fiche technique et les sources de `MAG-SORT-001 Étincelle` **feu / Cercle I**, avec maîtrise en école du feu et neuf degrés narratifs distincts. Préciser les contraintes de portée, cible, résistance, usages non offensifs, description d'effet, ressources en mana et règles de tentative échouée **sans les fixer avant arbitrage**. Fournir deux projections M03 contrôlées (touché et résisté) et un test mental séparé. Réconcilier le Grimoire v1 et le futur contrat en préservant les démonstrations `demo-*` comme non canoniques : **ne pas dériver Étincelle du `demo-etincelle` foudre**. Contre-auditer la priorité accordée à la précision/contrôle de maîtrise sur la puissance brute.

**Attendu :** spécification candidate, table de compatibilité et arbitrages EFF-04/05/09 ; pas de modification des coûts ni matrices.

## OBJETS — Objets, enchantements, équipements

**Mission demandée :** classer les champs en **description**, équipement M03 (grade et protection), effet/charge homologué, ressource et provenance. Démontrer trois exemples : arme ordinaire sans supplément, objet décoratif sans `+1`, arme enchantée avec un seul effet numérique autorisé. Identifier propriétaire, version, cumul, épuisement, recharge et transfert au personnage sans double effet. Distinguer bonus défensif de la catégorie `absorption` encore dormant.

**Attendu :** adaptateur candidat non destructif, aucune valeur d'enchantement attribuée automatiquement, questions EFF-02/07.

## CAP — Capacités physiques, magiques et techniques

**Mission demandée :** mapper chaque `AbilityDefinition` approuvée au déclencheur M03 et à la famille d'effet correspondante. Tester précision, impact, pénétration, défense, durée, absence de cumul et restauration d'une capacité devenue inactive. Identifier les propres rangs/maîtrises de capacité sans confondre rang brut et `M(r)`. Les effets mentaux restent non-PV sans règle attestée ; pas de bonus acquis seulement à la création du texte d'une capacité.

**Attendu :** grammaire commune avec MAG et OBJETS, deux capacités pilotes et décision EFF-05/06.

## INDEX — Registre de règles et provenance

**Mission demandée :** proposer `EffectDefinitionV0`/instance, identifiants stables, révisions, source/type/famille, statut, auteur/homologation, propriétaire d'effet, ordre d'application et adaptateurs M02/Spell/Bestiary/objet. Fermer la faille potentielle `approved:true` importé sans preuve d'autorité et séparer `effects` d'attaquant vs défenseur. Conserver les champs inconnus et les variantes utilisateur sans exécuter des descriptions libres.

**Attendu :** schéma interop versionné, tests d'import/export/validation, décisions EFF-01/02/08 ; pas de migration sans accord.

## BESTIAIRE — Profils, créatures, HP

**Mission demandée :** tester projection `creature profile`/attaque vers M03 et défendre les niveaux/grades/protections actuels. Comparer réserve PV ordinaire, élite et boss sur N1/5/10/15/20/25 et 1v1, 2v2, 3v1 ; signaler risques de one-shot. Documenter qu'un N25 `baseHealth=306` avec base 6 et rang formé nécessite ≈26,2 actions attendues en duel de référence. Ne pas modifier les HP de production à ce stade.

**Attendu :** scénarios de rencontre, écarts et options EFF-03.

## ARCHIVES — Sauvegardes, Studio MJ, transactions

**Mission demandée :** définir un événement unique `intentId` et deux états distincts prévisualisation/appliqué ; contrôle rôle MJ, snapshot de l'état cible, ressources au moment approprié, opération atomique ou reprise fiable, version contrôlée, déduplication sur double-clic/deux onglets/reconnexion, export/restauration déterministe. Vérifier les journaux `record-opposition` et Grimoire existants avant toute architecture. Fenêtre joueur uniquement par liste blanche, aucune donnée MJ privée.

**Attendu :** contrat de sauvegarde avec recettes de replay et passation EFF-08 ; pas de mutation applicative sans autorisation.

## QA — Recettes mécaniques, humaines et UI

**Mission demandée :** automatiser les 7 776 cas M01/M03, les limites d'entrée, l'absence de PV mental, les immunités et échecs 5–7, les contacts 27–30, l'armure/pénétration, le non-cumul et la non-application de l'absorption. Vérifier les six origines et les trois rangs sur six niveaux ; compléter par séances humaines de **dés physiques** et captures deux gestes (une résolution, une confirmation). Contrôler l'absence de dépense en simple prévisualisation, la dépense après tentative ratée suivant politique arbitré, et l'idempotence ; simuler conflits de stockage et import legacy.

**Commandes minimales :** `npm run test:m03`, `node scripts/test-math-eff-001.mjs`, `npm test` et recette manuelle de la [fiche de table](MATH_EFF_001_FICHE_TABLE_ET_RECETTE.md).

**Attendu :** rapport PASS/FAIL par invariant, copie des sorties, protocole Chrome/table, matrice de compatibilité ; aucun PASS applicatif revendiqué par le seul banc.

## DG — Direction générale

**Mission demandée :** vérifier SHA et dépendances, arbitrer EFF-01..10 de la [fiche Direction](FICHE_DIRECTION_MATH_EFF_001.md), associer propriétaires et PR, distinguer **documentation en revue** / **prototype homologué** / **moteur intégré** / **site publié**. Obtenir confirmation explicite avant fusion ou publication publique. Protéger coûts mana, charges, matrices expérimentales et le canon de `MAG-SORT-001`.

**Attendu :** décision signée (validé / avec réserves / à corriger / incertain / rejeté), ordre des lots, critères de sortie et mandat de prototype optionnel.

## Blocage commun à rappeler aux sept propriétaires

L'accord sur le **principe** d'unification ne fixe pas les **chiffres** de dégâts/coûts, l'absorption, les durées ni le palier 21–25. Aucun propriétaire ne doit retoucher la production, fusionner ou diffuser comme règle canonique les valeurs fictives du banc. M03 reste la référence de comparaison tant que la DG n'a pas tranché.
