# ANT-DECH-005 — Contrat des portraits de Déchéance (Univers et Studio MJ)

**Statut :** données documentaires de référence, sans calcul de combat. **Portée :** dix personnages canoniques de l'univers partagé, niveaux **indicatifs** 2 à 20. **Responsable éditorial :** ANT ; profils mécaniques à valider par PNJ/INDEX/MATH avant usage chiffré.

## Séparation des couches

| Couche | Conteneur | Contenu autorisé | Interdits |
| --- | --- | --- | --- |
| Univers public | `content/personnages/PER-DECH-0x.md`, index | Parcours, décisions connues, intérêts, relations publiques, pactes décrits, zones d'activité générales, portes de sortie | Secrets de séance, campagne jouée inventée, profil mécanique imaginé |
| Images | `quartz/static/images/personnages-dechus/per-dech-0x.svg` | Dix portraits graphiques originaux, texte alternatif, aucune source externe | Métadonnées secrètes, portraits de tiers sans droits |
| Catalogue Studio | `studio-local/catalogue-antagonistes.json` | ID, version SHA Git du Markdown, niveau **narratif**, stade, rôle, motivation, relations documentaires, image | PV, défense, attaque, dommages, Emprise 2d6 transposée, notes MJ |
| Copie locale | Création existante `npc` | Nom, rôle, motivation, liens et notes **privées** modifiables par MJ | Remplacement automatique de la source ou publication depuis la campagne |
| Dossier MJ privé | Fichier extérieur au dépôt/site public | Clauses occultes, Ancrages, enjeux secrets, déclencheurs variables | Déploiement GitHub Pages et projection joueur |

L'adaptateur de `bibliotheque.mjs` ajoute ces références au rayon **Organisations et factions**, section **Personnages et lieurs**. Les noms et illustrations viennent du catalogue public embarqué. La fiche de référence offre **Créer un PNJ de campagne**, en utilisant `CREATION_TYPES.npc`, préremplit uniquement `role`, `motivation`, `relations` et conserve l'ID de source dans les liens de la copie. La fiche du MJ peut être éditée indépendamment ; sa sauvegarde et ses notes ne sont pas renvoyées vers GitHub.

## Niveau, Emprise et pouvoir — trois champs distincts

| Champ | Signification | Validation |
| --- | --- | --- |
| `levelIntent` | Repère de rencontre 2, 3, 5, 7, 8, 10, 12, 15, 17 ou 20 ; **non** un niveau de profil calculé | Éditorial ANT/PNJ ; MATH doit établir la fiche 5d6 |
| `corruptionStage` | Tentation, Fêlure, Rupture, Déchéance, Abîme | Cohérence avec MON-DECH-01 ; la montée exige de vrais liens selon SYS-DECH-01 optionnel |
| `rulesStatus` | `narrative_levels_only` dans le catalogue public | Aucun usage automatique en M03, aucune capacité INDEX activée |

Le *mini-système* de Déchéance `SYS-DECH-01` repose sur **2d6** ; ses valeurs Emprise 0–12 et ses charges de Tribut ne sont pas des statistiques du système commun **5d6**. Le stade Rupture doit disposer d'au moins une **Chute liée** ; un Déchu avancé dépend de branches réelles. Un employé, patient, captif ou admirateur ne compte jamais comme Chute par simple relation administrative. Les niveaux élevés ne rendent pas omnipotent ; chaque don demeure circonscrit à son pacte, à une source et à ses limites.

## Sécurité et référence croisée

- ID stable `PER-DECH-0x`, version = SHA blob de la fiche ; chemin exact, image locale autorisée, `alt` non révélateur.
- Les liens vers `ORG-DECH-0x` expriment une **relation documentaire** ; le champ `factions` n'affirme une appartenance que si la fiche le prouve. Opposition et coopération ne valent pas pacte.
- Le navigateur local ne charge que les références JSON et les dix SVG prévus ; la politique `connect-src` inclut le catalogue mais la fenêtre joueur conserve `connect-src 'none'`.
- La liste blanche de projection est toujours nécessaire : masquer un bloc de HTML ne suffit pas à protéger une note MJ. Le Studio ne doit jamais transmettre un champ libre sans action de présentation du MJ.
- Un niveau ne devient pas une capacité de combat par copie. Les révisions futures comparent `sourceId/sourceVersion` avec l'instance, demandent confirmation et ne détruisent pas les variantes.

## Recette

1. `npm run test:antagonistes` : dix ID, SHA, niveaux 2–20, stades compatibles, illustrations et CSP, aucun champ caché ni formule de combat.
2. `npm test` : continuité du contenu, M01–M05, Grimoire, Bestiaire, build et liens Quartz.
3. `node --test studio-local/tests/antagonistes.test.mjs` avec Chrome : rayon → fiche source illustrée → copie locale PNJ → note MJ → projection non divulguée.
4. CI et Pages : confirmer `content/personnages/PER-DECH-01...10`, dix SVG publics, routes Studio du catalogue et absence de secret ; conserver un compte rendu de recette.

**À revoir par :** PNJ, INDEX, MATH, STUDIO, ARCHIVES, QA, LORE. **À valider par DG/créateur :** chiffres 5d6 futurs, contenus de pactes à classer confidentiels, illustrations individuelles enrichies ; pas le principe que ces biographies co-construites sont canoniques, explicitement adopté.
