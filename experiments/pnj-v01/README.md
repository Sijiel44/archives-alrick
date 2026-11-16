# PNJ-001 — Le Cabinet des Rencontres (prototype v0.1)

Ce prototype **local et non publié** présente une sélection de **42 personnages déjà identifiés** dans les Archives, en deux lots (30 + 12), sans créer de biographies concurrentes. Il sert de direction visuelle pour le futur site / Studio MJ et ne change pas la démonstration P0.

## Voir les fiches illustrées

Depuis la racine du dépôt :

```bash
node experiments/pnj-v01/build.mjs
```

Ouvrir ensuite `experiments/pnj-v01/preview.html` avec un navigateur. L'aperçu HTML se suffit à lui-même et utilise les illustrations déjà présentes dans `content/images/personnages/`. Pour une navigation HTTP locale si le navigateur restreint les fichiers locaux :

```bash
python3 -m http.server 8090 --bind 127.0.0.1
```

Ouvrir `http://127.0.0.1:8090/experiments/pnj-v01/preview.html`.

Le visiteur peut filtrer par catégorie, rechercher un nom, ouvrir une carte, consulter une amorce non jouée, retrouver le code documentaire et ouvrir la fiche d'origine. L'impression d'une fiche passe par le bouton dédié. Aucun secret MJ privé n'est contenu dans le prototype.

## Pourquoi une sélection séparée ?

- `selection.mjs` conserve **uniquement des angles de jeu et idées de rencontre**, tous proposés et non joués.
- `build.mjs` relit les métadonnées de chaque fiche sous `content/personnages/` : nom, code, provenance, état documentaire et statut d'avertissement ne sont **pas recopiés à la main** dans la sélection.
- `index.template.html` contient la présentation, la recherche et le volet de lecture.
- `preview.html` est un **artefact généré**, régénérable et sans serveur de règles.
- `test.mjs` vérifie les 42 identités uniques, leurs dossiers, leurs sources, les portraits disponibles et plusieurs garde-fous éditoriaux.

Les pages Markdown sources existantes restent la référence. Les passages ajoutés dans **33 fiches sources** sont des **amorces autonomes non jouées** ; leurs statuts de publication, codes et sources sont préservés.

## Visuels

- **7 portraits hérités** (Bram, Ragna, Vaëra, Torven, Heimdall, Haldrek et Eamon) ; seul le fichier de Heimdall est indiqué comme portrait déjà approuvé dans cette sélection.
- **5 portraits conceptuels neufs** (Sivra, Mara ; puis Sigrid, Mirelda, Sariel), explicitement non canoniques.
- **30 emblèmes provisoires** pour les personnages dont la sélection ne dispose pas encore de portrait attribuable.
- **1 fresque d'ambiance conceptuelle** pour l'accueil, sans correspondance nominative avec les personnages.

Les six nouveaux visuels WebP des deux lots sont des illustrations conceptuelles ; leur style, leur apparence physique et leur association éditoriale doivent être approuvés par le créateur avant publication. Ils respectent la limite de 3 Mio/fichier. Les formats SVG ne sont pas ajoutés au site.

## Gardes-fous

- Le code `PER-CB2-SOREN` pointe vers **Eren gardien** ; ce n'est pas le marin Sören.
- Le vrai **Sören marin** est documenté sous `PER-CB1-SOREN` ; la localisation de la cité engloutie demeure hors du catalogue.
- **Edric Varen** et **Edric de Valbrume** sont une seule identité à deux époques ; la titulature et son mariage ne sont pas rétroactifs.
- **Mirelda** reste indépendante de son atelier ; ni recrutement ni résultat de fermentation n'est attribué par les nouvelles amorces.
- **Dorrik est décédé** au dernier point documentaire : les rencontres proposées pour lui sont situées de son vivant ou dans une variante annoncée.
- **Revenant** (compagnie) et **Rappelé** (retour à la vie) ne sont jamais fusionnés.
- Les personnages de CB44 ne reçoivent aucun emploi, contrat ou pouvoir supplémentaire.
- Pas de chiffres, d'XP, de prérequis inventés ni de capacité 5d6 automatique. Les adaptations relèveront d'INDEX/MATH.
- Les sources à spoilers restent marquées comme telles ; **ce prototype ne contient pas de véritables secrets MJ**.
- `publish:false` pour le catalogue Markdown. Aucune modification du workflow Pages ou de `studio-local/`.

## Contrôles reproductibles

```bash
node experiments/pnj-v01/build.mjs
node --test experiments/pnj-v01/test.mjs
npm test
```

`npm test` couvre la cohérence du contenu et le site Quartz. Les essais de consultation visuelle sur PC/tablette et les validations d'illustration demeurent des recettes humaines avant publication.

## Passage à la v0.1

1. INDEX : garder un `personnage.code` stable et référencer séparément les éventuels `profil_5d6_id` versionnés.
2. STUDIO : lire la fiche source et créer, par campagne, une **copie de travail** avec notes privées non divulguées au joueur ; la liste blanche de projection reste indépendante de cette galerie.
3. ATELIERS : choisir une illustration conceptuelle, valider les droits et les proportions avant de changer son statut.
4. QUÊTES/AVE : transformer une amorce en scénario nouveau sans la faire passer pour un épisode joué.
5. DG/créateur : décider du lot à valider et publier. Aucun merge ni mise en ligne automatiques.
