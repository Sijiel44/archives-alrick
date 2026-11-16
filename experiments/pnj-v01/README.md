# PNJ-001 — Le Cabinet des Rencontres (prototype v0.1)

Cette galerie constitue l'aperçu autonome d'un catalogue **ouvert aux lecteurs et aux joueurs**, avec **102 personnages déjà identifiés** dans les Archives, en sept lots (30 + 12 + 12 + 12 + 12 + 12 + 12), sans créer de biographies concurrentes. Le Studio publie les références dans `studio-local/catalogue-pnj.json` ; les scénarios et adaptations de campagne sont libres. La galerie ne change pas la démonstration P0.

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
- `test.mjs` vérifie les 102 identités uniques, leurs dossiers, leurs sources, les portraits disponibles, les licences des liens extérieurs et plusieurs garde-fous éditoriaux.

Les pages Markdown sources existantes restent la référence. Les passages ajoutés dans **93 fiches sources** sont des compléments documentaires et des amorces autonomes proposées ; leurs codes et sources sont préservés. À la demande du créateur, les références des lots 004 et 005 auparavant non publiées sont désormais accessibles, avec avertissement de révélations quand nécessaire. Les mentions « joué » ou « non joué » décrivent la **provenance**, jamais la possibilité d'employer un personnage dans une autre campagne.

## Visuels

- **7 portraits hérités** (Bram, Ragna, Vaëra, Torven, Heimdall, Haldrek et Eamon) ; seul le fichier de Heimdall est indiqué comme portrait déjà approuvé dans cette sélection.
- **11 portraits conceptuels neufs** (Sivra, Mara Vifacier ; puis Sigrid, Mirelda, Sariel ; puis Naëline, Mara Ventrevent, Hervald Trois-Sillons et Sévrane ; enfin Kelm Poing-Calme et Ylva), explicitement non canoniques.
- **84 emblèmes provisoires par défaut** pour les personnages dont la sélection ne dispose pas encore de portrait individuel attribuable.
- **3 images externes d'ambiance facultatives** (forge, plantes médicinales, mer), affichées à la place de trois emblèmes *uniquement après le choix du lecteur*. Attribution et droits documentés dans `docs/pnj/PNJ-003_SOURCES_VISUELLES.md`.
- **1 fresque d'ambiance conceptuelle** pour l'accueil, sans correspondance nominative avec les personnages.

Les douze nouveaux visuels WebP des lots 002 à 009 (onze portraits et une fresque d'accueil) sont des illustrations conceptuelles ; leur style, leur apparence physique et leur association éditoriale doivent être approuvés par le créateur avant canonisation d'apparence. Ils respectent la limite de 3 Mio/fichier. Les formats SVG ne sont pas ajoutés au site.

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
- L'existence de **Dagna Roue-de-Cuivre**, **Liora**, **Vaska**, **Nerys Silvenaine** et **Farwen** est validée, mais **aucune rencontre avec Orin ni embauche** n'en découle. Leur disponibilité publique actuelle est une décision éditoriale du créateur ; Nerys est distincte de la puissance du Dernier Phare.
- **Saëlor** a accepté l'idée d'une visite, **Soren Malderive** est seulement candidat intéressé, **Edran** reste décédé sans Rappel ; leurs trois fiches sont désormais publiques avec avertissement. Soren Malderive ≠ Sören marin de Valbrume.
- **Silan**, **Tavian**, **Elwen**, **Beren** et **Mara Ventrevent** ont des engagements signés, chacun à une fonction délimitée ; **Bromvar** et **Hroldan** sont Rappelés libres sans poste imposé. **Elwen** reste un seul personnage malgré une ancienne mention contradictoire d'espèce.
- **Mara Ventrevent** ≠ **Mara Vifacier** ≠ **Mara Sombrelac** ; le portrait ajouté de Mara Ventrevent est conceptuel.
- **Mara Belden**, agricultrice de Corvelis, ne doit être confondue avec aucune de ces Mara. **Sigrun Varek** (route orientale) ≠ **Sigrun Pierreval** (Aldhammar), **Garrik** ≠ **Reginald**, et **Yrsa Veld** ≠ **Ysara Velden**.
- Les récoltes futures de **Mara Belden, Hélène Varrec, Jorven Halrec et Hervald Trois-Sillons** restent ouvertes. **Téodan** n'est pas un émissaire souverain ; **Corin** n'a pas signé de traité ; la route de **Sigrun Varek** n'est pas construite ; **Dorsa** n'est qu'en observation.
- **Reginald** est attesté dans un souvenir d'enfance, sans preuve de présence actuelle. Le portrait d'**Hervald** n'est qu'un concept : la barbe blanche et l'âge de 76 ans sont documentés, pas le paysage ni les vêtements.
- **Borin Forgecœur est décédé et non Rappelé** en CB43 ; ses scènes de présence physique doivent rester historiques. **Corven** et **Dac** ne voient pas leurs anecdotes de jeunesse transformées en grades présents.
- **Névane** est la première Revenante d'honneur, cartographe libre de Skalor et compagne d'**Eamon** dans les actualisations documentées ; cela ne lui attribue ni commandement de la compagnie ni mariage. **Lévara** travaille sur les sols et les serres mais ne devient pas automatiquement Revenante.
- **Harald le lion** ≠ **Harald Forgecœur** ≠ lions figurés dans les objets ; **Halstor** ne confère sa métamorphose à aucun autre compagnon par proximité. **Sévrane** et **Vardhena** restent invitées autonomes ; ni direction de l'accueil ni commandement de la garde présumés.
- **Amelia** maintient six Cercles seule, le septième seulement brièvement guidé, le huitième en étude et le neuvième non acquis. **Tairin** conseille sans gouverner le Palais ; **Maëlys** n'a pas organisé automatiquement la semaine de célébrations.
- Les personnages de CB44 ne reçoivent aucun emploi, contrat ou pouvoir supplémentaire.
- Pas de chiffres, d'XP, de prérequis inventés ni de capacité 5d6 automatique. Les adaptations relèveront d'INDEX/MATH.
- Les sources à spoilers restent marquées comme telles ; **ce prototype ne contient pas de véritables secrets MJ**.
- `publish:true` pour le Cabinet des Rencontres, lié depuis l'index public ; les 102 sources sont publiées et le rayon Studio les référence. Aucune note MJ ni sauvegarde n'est copiée vers le catalogue.

## Contrôles reproductibles

```bash
node experiments/pnj-v01/build.mjs
node experiments/pnj-v01/build-studio-catalogue.mjs
node --test experiments/pnj-v01/test.mjs experiments/pnj-v01/catalogue.test.mjs
npm test
```

`npm test` couvre la cohérence du contenu et le site Quartz. Les essais de consultation visuelle sur PC/tablette et les validations d'illustration demeurent des recettes humaines avant publication.

## Passage à la v0.1

1. INDEX : garder un `personnage.code` stable et référencer séparément les éventuels `profil_5d6_id` versionnés.
2. STUDIO : lire la fiche source et créer, par campagne, une **copie de travail** avec notes privées non divulguées au joueur ; la liste blanche de projection reste indépendante de cette galerie.
3. ATELIERS : choisir une illustration conceptuelle, valider les droits et les proportions avant de changer son statut.
4. QUÊTES/AVE : transformer une amorce en scénario nouveau sans la faire passer pour un épisode joué.
5. DG/créateur : les 102 références historiques sont offertes au catalogue public après tests et publication Pages. Les prochains lots documentés sont publiables directement après contrôle, sans leur inventer de canon ni de mécanique.
