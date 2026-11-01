# ARCHIVES D'ALRICK — RAPPORT DE MISSION

## G-001 · Réconciliation du Grimoire avec M01–M05

**Date :** 31 octobre 2026 (Québec)  
**Référent :** Grimoire et systèmes magiques  
**Dépôt :** `Sijiel44/archives-alrick`  
**Branche propriétaire :** `feat/grimoire-5d6-v1`  
**PR :** [#55](https://github.com/Sijiel44/archives-alrick/pull/55) · **Audit source :** [DG-04/#65](https://github.com/Sijiel44/archives-alrick/pull/65) · **Coordination Tables :** [T-001/#66](https://github.com/Sijiel44/archives-alrick/pull/66)

**STATUT : TERMINÉE AVEC RÉSERVES — EN REVUE FINALE TECHNIQUE ; NON FUSIONNÉE / NON PUBLIÉE.**

### Livrables et réalisations

- **Réconciliation de #55 avec `main` M01–M05** : historique de développement préservé par commit à deux parents ; ancienne divergence de 122 commits éliminée, sans écraser le combat, l'Atelier ou le Bestiaire.
- **Maths alignées M01/M03** : jets délégués à `resolveProgressionAction` / `resolveCombatM03` ; bonus effectifs, résistance, protections et absorption partagés ; caractéristiques brutes supérieures à 12 possibles.
- **Contrats magiques** : Cercles distincts du niveau, des maîtrises et de l'affinité. MAG-050 (Cercle I active une matrice construite en VIII sous conditions), IX soumis à reconnaissance divine du MJ et non au niveau 25. Six sorts de démo restent non canoniques.
- **Sauvegardes conservatoires** : exports `alrick.sheets.v3` et `alrick.campaign.v2`, lectures anciennes, champs inconnus préservés, `legacyOriginal` et `migrationWarnings` pour les données non interprétées. Objets d'inventaire, matrices, effets et historiques pris en compte.
- **Tests** : jeux de parité niveaux 5/10/15/20/25, objets C1→C8, IX, extensions, ressources ; recette Chrome complémentaire de sauvegardes ajoutée.

### Preuves disponibles

**CI de référence réussie :** [GitHub Actions #41267164718](https://github.com/Sijiel44/archives-alrick/actions/runs/41267164718) sur `c656be4` : `npm ci`, `npm test` (M01–M05 + Grimoire), `npm run test:m04:browser` (Chrome M04/M05).  
**Attention :** le scénario Chrome spécifique G-001 et les rapports sont postérieurs à ce run ; consulter les checks de **dernier commit** de #55 avant toute revue de fusion. Aucun `npm` local, aucun appareil physique ou fichier réel personnel testé par ce référent.

### Réserves et risques

- **Arbitrage prioritaire non tranché :** la matrice au mana du porteur consomme aussi une charge dans le prototype. Options documentées : énergie stockée, nombre d'activations, mana exclusif, consommation combinée ; aucune n'est devenue canon.
- Migrations à éprouver sur vraies sauvegardes, contrôle humain PJ/MJ et téléphones, objets supprimés/renommés ; revue de sécurité du stockage et des dépendances (4 avis npm : 2 modérés, 2 élevés au contrôle de référence).
- Aucun transfert complet du Grimoire vers le pilote Tables : pas de transaction réseau mana+charges, ni permission serveur réelle. Ne pas présenter le prototype local comme serveur sécurisé.

### Décisions demandées au créateur

1. Valider **la signification d'une charge** et le cas `energySource=caster`, avec coûts et tests attendus.
2. Arbitrer entretien/concentration d'une matrice, effet après perte de l'objet, attestations IX et permanences.
3. Autoriser une **revue finale de code** après dernier CI vert et essais humains ; toute fusion et publication restent des décisions distinctes.

### Verdict Direction générale

**Recevable à la revue finale technique sous réserves**, si les checks du dernier head restent verts et les tests d'import/export attendus sont confirmés ; **pas prêt pour fusion ou mise en service** avant les validations humaines et l'arbitrage énergétique.

**Archives :** `G_001_RECONCILIATION_GRIMOIRE_5D6.md` · `G_001_COMPATIBILITE_SAUVEGARDES.md` · `G_001_QUESTIONS_CREATEUR.md`.  
**Restrictions :** aucune fusion automatique, aucun déploiement, aucune règle cosmologique ajoutée, aucune migration destructive.
