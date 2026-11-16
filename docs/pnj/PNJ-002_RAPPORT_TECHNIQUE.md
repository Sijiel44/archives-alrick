# PNJ-002 — Rapport technique, extension illustrée du Cabinet

## Périmètre et contrats

**Objet :** poursuivre PNJ-001 par un deuxième lot de douze personnages documentés, indépendants de la campagne fondatrice en tant que *rencontres proposées*, sans créer de biographies concurrentes ni déclarer de faits nouveaux. Ce P1 n'affecte pas la démonstration P0.

**Sources effectivement examinées :** douze fiches `content/personnages/PER-*.md`, frontmatters et ancres documentaires qu'elles portent, catalogue PNJ-001, `AGENTS.md`, `CONTRAT_EDITORIAL.md`, `CONTRIBUTING.md`. Les références aux campagnes brutes ne constituent **pas** une nouvelle certification de leurs contenus.

**Dépendances :** LORE (preuves et périodes), INDEX/MATH (variantes 5d6, XP et prérequis), STUDIO/ATELIERS (bibliothèque, copie de travail, images, liste blanche joueur), QUÊTES/AVE (trames), QA (tests visuels), DG (arbitrage éditorial).

## Modifications

- Douze vignettes ajoutées à `experiments/pnj-v01/selection.mjs` ; **42** références uniques. Éléments de scène distincts des faits du champ `source_brute`.
- Générateur et tests ajustés au nombre 42 ; garde-fou supplémentaire sur `categorie: personnage` pour les nouveaux dossiers ordinaires.
- Galerie HTML de consultation, recherche, filtres, vue détaillée et impression régénérée par `node experiments/pnj-v01/build.mjs` ; aucune modification du Studio et du Quartz public.
- `content/personnages/cabinet-des-rencontres-v01.md` enrichi des douze renvois, conservé `publish:false`, `spoilers:true`, `unlisted:true`.
- Douze fiches sources enrichies chacune d'un volet « À la table — propositions non jouées (volet MJ) », **sans modification de leurs identifiants, états documentaires ni publication historique**.
- Portraits générés en WebP `sigrid-concept-v01.webp`, `mirelda-concept-v01.webp` et `sariel-concept-v01.webp`, chacun inférieur à 3 Mio et affiché explicitement comme concept non canonique. Autres personnages dotés d'emblèmes provisoires.

## Risques et garanties

| Risque | Contrôle |
| --- | --- |
| Deux Sören distincts | Eren = `PER-CB2-SOREN`, marin = `PER-CB1-SOREN` ; assertion dédiée. |
| Chronologie ducale d'Edric | Le titre et le mariage ne sont pas reportés en CB1/CB2. |
| Secrets et scènes sensibles | Pas de localisation de la cité engloutie ni de révélation CB42 d'Elyra dans les vignettes. Galerie réservée à la revue MJ. |
| Engagements inventés | Mirelda non recrutée, aucun office ajouté aux proches. |
| Illustration prise pour canon | Marque « conceptuel » ; `illustrationValidee` non déclarée pour ces trois portraits. |
| Profils mécaniques inventés | Aucun chiffre, XP, prérequis ou capacité automatique ; adaptations futures par ID/version distincts. |

## Recette et contrôle qualité

Commandes reproductibles :

```bash
node experiments/pnj-v01/build.mjs
node --test experiments/pnj-v01/test.mjs
npm test
git -c core.whitespace=cr-at-eol diff --check
```

**Résultats locaux au 16 novembre 2026 :**

- Générateur **PASS** (42 cartes, 12 portraits / 30 emblèmes).
- Tests du Cabinet **PASS 3/3** (identités, Eren/Sören, provenance, absence de chiffres mécaniques, intégrité de l'aperçu).
- `npm test` **PASS** : contrôles de contenu (387 pages choisies, 285 codes uniques), types, construction Quartz (1287 fichiers), liens (1178 pages HTML, 68 853 références internes), organisations, antagonistes, suites M01–M05, Bestiaire, Grimoire et Magie.
- Vérification des espaces et erreurs d'édition **PASS** (`git -c core.whitespace=cr-at-eol diff --check`).
- Statut CI distant à constater **sur le commit final** de la [PR brouillon #132](https://github.com/Sijiel44/archives-alrick/pull/132). La recette humaine PC/tablette reste nécessaire : Chromium sandboxé n'a pas permis de capturer la galerie dans cet environnement.

## Passations préparées, sans envoi automatique

- **STUDIO :** conserver lien source/instance, `spoilers` et `publicationSource` comme données contrôlées ; cacher les liens à révélations dans la projection joueur ; images conceptuelles distinctes des médias validés et exports sans fuite.
- **ATELIERS :** fiche souple, ajout de portrait avec statut, panneaux d'usage en scène, champs facultatifs de disponibilité et consentement pour le mentorat.
- **QUÊTES/AVE :** chaque amorce a déclencheur, tension et plusieurs issues ; aucune issue ne doit être devenue un fait passé par défaut.
- **INDEX/MATH :** `characterCode` unique ; `profileId` et `profileVersion` multiples autorisés sans clonage de fiche ; XP, prérequis et acquisition dépendants d'une règle validée et d'un choix MJ.
- **LORE :** vérifier les quatre limites marquées en tableau et les correspondances d'ancres lors d'une certification exhaustive ultérieure.

**À revoir par :** LORE, INDEX, MATH, STUDIO, ATELIERS, QUÊTES, AVE, QA. **À valider par DG/créateur :** illustrations, intégration, publication et toute canonisation. PR maintenue en brouillon, sans fusion.
