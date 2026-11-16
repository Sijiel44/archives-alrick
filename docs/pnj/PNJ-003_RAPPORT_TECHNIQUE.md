# PNJ-003 — Rapport technique, lot 3 et inspirations externes

## Périmètre

Troisième lot de **douze personnes préexistantes**, issu exclusivement des fiches documentaires `content/personnages/`, sans invention de nouvelles personnes ni canonisation de suites. Maintenir la galerie du Cabinet comme prototype local du futur site v0.1. Pas de raccord à la démo P0, pas de serveur, de sauvegarde modifiée ou de publication.

**Contrats lus :** `AGENTS.md`, `CONTRIBUTING.md`, `CONTRAT_EDITORIAL.md`, `modeles/personnage.md`, les 12 fiches sources et leurs renvois. Les bruts cités par les fiches n'ont pas été intégralement recertifiés ; les sources et statuts existants sont préservés.

## Travaux du lot

- 12 entrées ajoutées à `experiments/pnj-v01/selection.mjs`, **54 cartes** avec sources uniques et non dupliquées ; identité et statut toujours extraits du Markdown source.
- 12 sources enrichies de **trois pistes de rencontre, une scène ou réplique clairement fictive, des choix et des limites**, plus mentorat conditionnel quand pertinent.
- 3 inspirations d'œuvres publiées sur Wikimedia Commons, avec notices auteur/licence vérifiées, identifiées **ambiance non canonique**, non portraits. Le registre est dans `PNJ-003_SOURCES_VISUELLES.md`.
- Contrôles de champs et de domaines sur les médias externes dans le générateur ; lien de licence dans le détail de la carte, chargement de l'image sur choix exprès du lecteur, en-tête sans référent (`no-referrer`), repli sur emblème en cas d'échec.
- Catalogue Markdown de lecture `publish:false` et prototype HTML régénéré ; navigation Quartz, Studio, compilateur et règles inchangés.

## Invariants examinés

| Enjeu | Garde-fou |
| --- | --- |
| Identité | 54 `code` et sources de fichiers uniques ; Durgan ≠ Harald, Maël Torvenn ≠ Torven Cendreval. |
| Chronologie | Maëlya/Édric CB39, Thaléa capitaine CB43, Mirena intendante CB43, Serah en projet de formation. |
| Secrets | Les 12 fiches gardent leurs champs historiques `spoilers`, `unlisted`, `publish`; aucune note privée insérée ; catalogue entier réservé à revue. |
| Magie et progression | Tomas : Cercle élevé assisté ≠ maîtrise autonome ; aucun XP, rang ni capacité automatiquement acquis. |
| Droits des images | Trois notices publiques vérifiées, informations d'auteur/licence conservées ; jamais traitées comme portraits ; consentement au chargement externe. |
| Portabilité | Une image externe indisponible n'empêche pas la lecture de la fiche ; les images officielles restent en assets locaux après validation. |

## Recette reproductible

```bash
node experiments/pnj-v01/build.mjs
node --test experiments/pnj-v01/test.mjs
npm test
git -c core.whitespace=cr-at-eol diff --check
```

**Résultats locaux au 16 novembre 2026 :**

- Générateur **PASS** : 54 identités, 12 portraits locaux et 3 inspirations externes référencées.
- `node --test experiments/pnj-v01/test.mjs` : **PASS 4/4** (identités/source/statuts, absence de mécanique inventée, champs de licence et désactivation des médias distants par défaut, intégrité syntaxique du JavaScript embarqué).
- `npm test` : **PASS** (387 pages choisies, 285 codes uniques, vérification TypeScript, Quartz 1287 fichiers, 1178 pages HTML et 68 883 liens/ressources internes, suites 5d6, Bestiaire, organisations, antagonistes, Grimoire et Magie).
- `git -c core.whitespace=cr-at-eol diff --check` : **PASS**.
- **Recette humaine PC/tablette : à effectuer** pour vérifier le chargement volontaire, l'affichage des crédits et le repli des URL externes. La CI sera contrôlée sur le commit GitHub final de la [PR brouillon #132](https://github.com/Sijiel44/archives-alrick/pull/132) ; aucune validation graphique Chrome n'est revendiquée.

## Passations préparées

- **LORE :** vérifier les noms, le statut de Célianne et Tomas, les périodes de Maëlya, Mirena, Serah et Thaléa.
- **INDEX/MATH :** conserver une seule source de PNJ et des variantes `profileId`/`profileVersion`; vérifier XP/prérequis pour le mentorat, pas d'automatisme à haut niveau.
- **STUDIO/ATELIERS :** choix explicite de charger une image externe, statut des droits, source et crédit visibles ; liste blanche séparée pour joueurs et notes confidentielles hors de la bibliothèque publique.
- **ARCHIVES/QA :** sauvegarde locale sans URL externe active par défaut, URLs sûres, repli et recette de chargement/échec sur PC et tablette.
- **QUÊTES/AVE :** adapter les 36 pistes en scénarios ouverts, sans annoncer qu'elles ont déjà eu lieu.

**À revoir par :** LORE, INDEX, MATH, STUDIO, ATELIERS, ARCHIVES, QA, QUÊTES, AVE.

**À valider par DG/créateur :** choix des visuels, intégration et toute publication ou canonisation. Aucune fusion automatique.
