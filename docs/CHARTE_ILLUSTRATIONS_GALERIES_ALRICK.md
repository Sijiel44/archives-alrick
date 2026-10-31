# Illustrer les Archives : images principales et galeries

**Objet :** proposer un standard réutilisable pour les villes, puissances divines, personnages centraux, Revenants, Rappelés et antagonistes. La **fonction d'image** est la même ; les **restrictions de canon et de spoilers** diffèrent selon chaque fiche.

## Format adopté

- **En-tête panoramique :** une image illustrative avec description `alt`, légende et ouverture de l'image en grand. Un rendu trop large est cadré au format **16:9**.
- **Galerie carrée :** deux à six vignettes en grille, ouverture de chaque image dans le navigateur. Trois colonnes sur grand écran, deux sur téléphone.
- **Fichiers :** pour ce premier lot, 28 illustrations vectorielles originales, adaptées aux **Sept Cités** dans `quartz/static/images/atlas/` ; elles ne dépendent pas de Pinterest.
- **Style :** sur chaque page, légender « image d'ambiance conceptuelle » et ne jamais annoncer une façade, un objet ou une scène comme canonique parce qu'il apparaît sur une image.
- **Accessibilité :** utiliser un `alt` descriptif unique, une étiquette d'agrandissement, `loading=lazy` pour les vignettes et un contraste suffisant sur les légendes.

### Exemple HTML réutilisable dans une page Markdown

```html
<figure class="atlas-city-hero">
  <a href="URL_DE_L_IMAGE" aria-label="Agrandir cette illustration">
    <img src="URL_DE_L_IMAGE" alt="Description concrète de l'image" loading="eager"/>
  </a>
  <figcaption>Illustration d'ambiance, non représentation canonique.</figcaption>
</figure>

<div class="atlas-image-gallery" role="group" aria-label="Galerie du lieu">
  <a href="URL_IMAGE_1" aria-label="Agrandir le quartier">
    <img src="URL_IMAGE_1" alt="Aperçu de la ville et des terrasses" loading="lazy"/>
    <span class="atlas-gallery-caption">Terrasses</span>
  </a>
</div>
```

Les classes CSS sont ajoutées à `quartz/styles/custom.scss`. Les images liées au domaine hébergé restent directement affichables depuis les pages GitHub Pages après déploiement. Aucun JavaScript externe, cookie ni hotlink tiers n'est nécessaire.

## Les illustrations externes : encadrer sans dépendre

Une image Pinterest, un lien de recherche d'images ou une miniature d'un auteur n'est **pas une autorisation de republier ou de hotlinker**. Les sites d'origine peuvent changer les URLs, bloquer les incorporations ou retirer l'image. Pour les images téléchargées légalement, tenir un registre : **auteur, titre, URL de la source, licence, modifications et date**.

Privilégier des **illustrations originales générées pour le projet** ou des œuvres sous licences compatibles (Wikimedia Commons, auteur avec accord, etc.) que l'on peut héberger dans le dépôt. Utiliser un lien externe seulement si la licence et la stabilité sont connues ; ne pas copier une œuvre protégée sans autorisation. Ne pas intégrer automatiquement des images Pinterest par simple URL d'aperçu.

## Personnages et révélations

Les personnages majeurs pourront recevoir :
- un **portrait principal fidèle à leur apparence connue** ;
- une galerie **tenues / équipements / lieux associés / attitudes** ;
- pour les puissances, une illustration de leur Maison ou symbole **avec limites de représentation** ;
- pour les Revenants et Rappelés, des portraits identifiés séparément, sans confondre ces deux catégories ;
- pour les antagonistes, deux versions d'affichage si un portrait révèle un secret de campagne : les versions à spoilers doivent porter `spoilers:true`, `unlisted:true`, `visibilite: publique_avec_avertissement`.

**Ce dossier ne commande aucun portrait non sourcé :** les futurs ajouts devront être vérifiés sur le Compendium et les scènes d'origine avant publication.

## Audit éditorial avant publication

1. L'image est réellement dans `quartz/static/images/` ou possède une provenance externe vérifiée.
2. Le texte `alt` décrit le visuel, pas un détail historique inventé.
3. La vignette s'affiche en petite taille sur mobile et s'ouvre en grand.
4. L'image ne révèle pas un nom caché ni une forme divine non encore connue.
5. Le nom du fichier et la galerie ne créent pas de fausse nouvelle fiche de personnage.
6. La page passe le build, ses liens internes sont valides, et la publication Pages est volontaire.

**Limite du lot actuel :** les 28 images SVG sont des **études d'ambiance stylisées** auto-hébergées, et non des peintures fantasy photoréalistes ; la grande maquette picturale de Dornaël produite dans la conversation sert d'orientation artistique et ne se substitue pas à des fichiers transférés sur GitHub.
