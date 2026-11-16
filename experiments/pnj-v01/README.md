# PNJ-001 — Le Cabinet des Rencontres (prototype v0.1)

Ce prototype **local et non publié** présente une sélection de **90 personnages déjà identifiés** dans les Archives, en six lots (30 + 12 + 12 + 12 + 12 + 12), sans créer de biographies concurrentes. Il sert de direction visuelle pour le futur site / Studio MJ et ne change pas la démonstration P0.

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

Le bouton **« Afficher 3 images externes »** charge, sur consentement, trois images d'ambiance historiques de Wikimedia Commons pour Durgan, Célianne et Thaléa. La galerie utilise un emblème tant que le lecteur n'a pas activé le chargement. Chaque fiche fournit l'auteur, la licence, le lien vers la page de source et un avertissement explicite : ces images ne représentent pas le personnage. Les images distantes peuvent être indisponibles ou requérir une connexion ; un emblème reste possible en repli.

## Pourquoi une sélection séparée ?

- `selection.mjs` conserve **uniquement des angles de jeu et idées de rencontre**, tous proposés et non joués.
- `build.mjs` relit les métadonnées de chaque fiche sous `content/personnages/` : nom, code, provenance, état documentaire et statut d'avertissement ne sont **pas recopiés à la main** dans la sélection.
- `index.template.html` contient la présentation, la recherche et le volet de lecture.
- `preview.html` est un **artefact généré**, régénérable et sans serveur de règles.
- `test.mjs` vérifie les 90 identités uniques, leurs dossiers, leurs sources, les portraits disponibles, les licences des liens extérieurs et plusieurs garde-fous éditoriaux.

Les pages Markdown sources existantes restent la référence. Les passages ajoutés dans **81 fiches sources** sont des **amorces autonomes non jouées** ; leurs statuts de publication, codes et sources sont préservés. Les lots 004 et 005 incluent **huit fiches `publish:false`** (cinq puis trois) : leur présence dans le catalogue MJ n'autorise ni mise en ligne ni divulgation automatique aux joueurs.

## Visuels

- **7 portraits hérités** (Bram, Ragna, Vaëra, Torven, Heimdall, Haldrek et Eamon) ; seul le fichier de Heimdall est indiqué comme portrait déjà approuvé dans cette sélection.
- **8 portraits conceptuels neufs** (Sivra, Mara Vifacier ; puis Sigrid, Mirelda, Sariel ; puis Naëline, Mara Ventrevent et Hervald Trois-Sillons), explicitement non canoniques.
- **75 emblèmes provisoires par défaut** pour les personnages dont la sélection ne dispose pas encore de portrait attribuable.
- **3 images externes d'ambiance facultatives** (forge, plantes médicinales, mer), affichées à la place de trois emblèmes *uniquement après le choix du lecteur*. Attribution et droits documentés dans `docs/pnj/PNJ-003_SOURCES_VISUELLES.md`.
- **1 fresque d'ambiance conceptuelle** pour l'accueil, sans correspondance nominative avec les personnages.

Les neuf nouveaux visuels WebP des lots 002 à 006 (huit portraits et une fresque d'accueil) sont des illustrations conceptuelles ; leur style, leur apparence physique et leur association éditoriale doivent être approuvés par le créateur avant publication. Ils respectent la limite de 3 Mio/fichier. Les formats SVG ne sont pas ajoutés au site.

### Réutiliser un lien externe

Le contrat éditorial autorise l'insertion d'images Markdown dans une fiche sous réserve de validation. Pour les visuels de tiers, **vérifier d'abord la licence propre au fichier**, le crédit, la stabilité de la ressource et le droit d'intégration ; ne pas confondre « gratuit à voir », « gratuit à utiliser » et « libre de republier ». Dans le prototype PNJ, la source et l'URL du média sont conservées séparément, et aucun asset distant ne devient un portrait officiel. **Ne pas hotlinker automatiquement** ces images sur le site publié : le lien vers la notice source reste toujours disponible.

## Gardes-fous

- Le code `PER-CB2-SOREN` pointe vers **Eren gardien** ; ce n'est pas le marin Sören.
- Le vrai **Sören marin** est documenté sous `PER-CB1-SOREN` ; la localisation de la cité engloutie demeure hors du catalogue.
- **Edric Varen** et **Edric de Valbrume** sont une seule identité à deux époques ; la titulature et son mariage ne sont pas rétroactifs.
- **Mirelda** reste indépendante de son atelier ; ni recrutement ni résultat de fermentation n'est attribué par les nouvelles amorces.
- **Tomas** n'a pas acquis une maîtrise autonome des Cercles élevés, même lorsqu'il a réussi un essai guidé.
- **Célianne** n'est pas employée automatiquement parce que sa mère Mirena dirige une équipe ; **Serah** n'a pas déjà achevé sa formation.
- **Maël Torvenn**, le luthier, n'est pas **Torven Cendreval**, le médecin.
- **Dorrik est décédé** au dernier point documentaire : les rencontres proposées pour lui sont situées de son vivant ou dans une variante annoncée.
- **Revenant** (compagnie) et **Rappelé** (retour à la vie) ne sont jamais fusionnés.
- **Éren Valombre** (Rappelé, sans contrat), **Eren gardien** et **Sören marin** sont trois identités distinctes. **Naëline**, également Rappelée, reste libre de choisir son activité.
- **Lurne** a signé son contrat de navigateur-cartographe en CB43 et **Margha** a été recrutée avec confirmation du créateur, mais ni signature fictive de Margha, ni voyage déjà effectué ne sont ajoutés. **Nahla** a bien signé une période d'essai rémunérée ; le tableau tardif « vacant » est incomplet.
- L'existence de **Dagna Roue-de-Cuivre**, **Liora**, **Vaska**, **Nerys Silvenaine** et **Farwen** est validée, mais **aucune rencontre avec Orin, embauche ou diffusion publique** n'en découle. Nerys est distincte de la puissance du Dernier Phare.
- **Saëlor** a accepté l'idée d'une visite, **Soren Malderive** est seulement candidat intéressé, **Edran** reste décédé sans Rappel ; leurs trois fiches sont `publish:false`. Soren Malderive ≠ Sören marin de Valbrume.
- **Silan**, **Tavian**, **Elwen**, **Beren** et **Mara Ventrevent** ont des engagements signés, chacun à une fonction délimitée ; **Bromvar** et **Hroldan** sont Rappelés libres sans poste imposé. **Elwen** reste un seul personnage malgré une ancienne mention contradictoire d'espèce.
- **Mara Ventrevent** ≠ **Mara Vifacier** ≠ **Mara Sombrelac** ; le portrait ajouté de Mara Ventrevent est conceptuel.
- **Mara Belden**, agricultrice de Corvelis, ne doit être confondue avec aucune de ces Mara. **Sigrun Varek** (route orientale) ≠ **Sigrun Pierreval** (Aldhammar), **Garrik** ≠ **Reginald**, et **Yrsa Veld** ≠ **Ysara Velden**.
- Les récoltes futures de **Mara Belden, Hélène Varrec, Jorven Halrec et Hervald Trois-Sillons** restent ouvertes. **Téodan** n'est pas un émissaire souverain ; **Corin** n'a pas signé de traité ; la route de **Sigrun Varek** n'est pas construite ; **Dorsa** n'est qu'en observation.
- **Reginald** est attesté dans un souvenir d'enfance, sans preuve de présence actuelle. Le portrait d'**Hervald** n'est qu'un concept : la barbe blanche et l'âge de 76 ans sont documentés, pas le paysage ni les vêtements.
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
5. DG/créateur : examiner les 90 fiches et décider du lot à valider. La mise en ligne doit respecter la revue explicite exigée par le workflow Pages ; aucune déclaration de revue ne sera fabriquée et le brouillon MJ n'est pas publié automatiquement.
