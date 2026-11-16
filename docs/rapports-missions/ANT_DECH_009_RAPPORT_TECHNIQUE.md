# ANT-DECH-009 — Rapport technique et éditorial

**Mission :** développer une première institution parmi les douze propositions du lot 008, avec plusieurs antagonistes gradués et des possibilités de réforme, d'échec et de rédemption. **Référent :** ANT. **Date :** 16 novembre 2026. **Portée :** univers partagé public et références Studio ; pas de scène de l'Odyssée d'Orin attribuée ni de règle de combat inventée.

## Sources et prévention des collisions

- Base existante relue : `content/monde/decheance-canon.md`, `content/groupes/organisations-decheance.md`, `content/groupes/GRP-ANC-01.md`, `ORG-DECH-01..09`, `content/personnages/personnages-dechus.md` et les catalogues Studio.
- La proposition **Office des Itinérants** provient de `docs/rapports-missions/ANT_DECH_008_PISTES_ORGANISATIONS.md`, antérieurement non canonique. Le créateur ayant demandé de développer l'une de ces pistes directement, `ORG-DECH-10` et ses quatre biographies sont créés comme **lore partagé**. Les onze autres pistes restent propositions.
- Recherche des noms `Aldiane Réval`, `Teron Clarsac`, `Mirel Coten`, `Ossian Démer`, `Néva Onrel`, `Dalen Vépre` dans `origin/main` : aucune collision exacte avant création. Leurs noms ne reposent pas sur une désignation morale trop explicite.
- L'Office n'est ni une institution souveraine du royaume ni la Première Ancre. Leurs rencontres possibles n'établissent aucune alliance historique. Les ressources (deux maisons, dépôt mobile, personnel et réserves finies) empêchent toute puissance indéfinie.

## Livrables publics et enjeux

| Code | Sujet | État / niveau narratif | Tension et réparation possibles |
| --- | --- | --- | --- |
| `ORG-DECH-10` | Office des Itinérants | Institution civile | Le refuge protège, mais exige des preuves discriminatoires ; droit de sortie et recours |
| `PER-DECH-33` | Aldiane Réval | Non Déchue, N15 | Directrice autrefois généreuse, réticente à reconnaître sa politique d'exclusion ; réformer et indemniser |
| `PER-DECH-34` | Teron Clarsac | Fêlure, N11 | Greffier qui répète un pacte limité sur ses propres pages ; renoncer, restituer les dossiers, réparer |
| `PER-DECH-35` | Mirel Coten | Tentation, N6 | Guide qui teste une balise sans pouvoir surveiller les personnes ; renoncer ou fonder un relais libre |
| `PER-DECH-36` | Ossian Démer | Non Déchu, N2 | Jeune cuisinier témoin, capable de faute humaine et d'action secourable ; témoignages et comptes transparents |

Quatre peintures originales WebP, quatre illustrations SVG alternatives et l'emblème vectoriel de l'Office sont documentés dans `studio-local/media/PROVENANCE.md`. Le Studio réemploie les schémas JSON existants, les SHA de fiches et la création locale `npc`/`faction` avec confidentialité de la projection joueur.

## Fronts et alternatives

Le dossier `ANT_DECH_009_FRONTS_ADAPTATIONS.md` propose trois accès selon l'expérience (repas de secours, route sans nom, charte de l'Office) et une horloge que le MJ peut arrêter. L'Office peut se réformer, se scinder, rester autoritaire ou produire un ancien adversaire repentant. Une vraie rédemption suppose restitution des données, indemnisation, protection des victimes et changement vérifiable ; elle ne force pas le pardon. Aucun pacte ni emploi n'accorde un niveau de combat, une Chute liée ou des pouvoirs de surveillance hors de son objet.

## Tests, PR, CI et limites

Recette détaillée : `ANT_DECH_009_CONTRAT_TECHNIQUE.md`. Tests de données Node : **6/6 verts**. **`npm test` complet réussi en local**, 433 pages publiables, 331 codes, 1 372 HTML et 81 280 liens/ressources internes vérifiés, avec régressions M01–M05/MAG/Grimoire. Navigateur Chrome absent localement : test à effectuer en CI GitHub. PR, SHA et contrôle Pages à compléter à la clôture. L'autorisation de publication directe figure dans le marqueur Pages de mission ; son déclenchement ne remplace pas le contrôle du déploiement effectif.

**À revoir par LORE** (cohérence géographique et Première Ancre), **PNJ** (biographies, subalternes), **MAG** (rites), **INDEX/MATH** (profils), **AVENTURES/QUÊTES** (scènes), **STUDIO/QA/ARCHIVES** (données et sauvegardes). **À valider par DG/créateur :** toute règle chiffrée, le prochain candidat d'institution et les relations historiques additionnelles. Aucune passation envoyée automatiquement.
