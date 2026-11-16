# PNJ-003 — Registre d'inspirations visuelles extérieures

**Objectif :** documenter les médias *d'ambiance* susceptibles d'aider un MJ à préparer une fiche. Ce n'est pas un registre de portraits canoniques ; ces œuvres appartiennent à leur contexte historique réel, **pas** à Entre-Rives.

**Vérification des notices :** 16 novembre 2026, Wikimedia Commons. Le droit indiqué est celui de chaque fichier à cette date et doit être revérifié avant une publication officielle. L'utilisation d'une image d'ambiance ne constitue pas l'attribution d'un costume, d'un visage, d'une époque ou d'un lieu au personnage fictif.

| Association purement illustrative | Œuvre et auteur | Notice de licence vérifiée | Statut éditorial |
| --- | --- | --- | --- |
| Durgan — forge et geste artisanal | [*The Blacksmith's Forge* — Alfred Provis](https://commons.wikimedia.org/wiki/File:The_Blacksmith%27s_Forge_by_Alfred_Provis_-_Alfred_Provis_-_ABDAG004355.jpg) ; Aberdeen Art Gallery | Peinture dans le domaine public ; reproduction marquée CC0 sur Commons | Ambiance historique proposée, non portrait |
| Célianne — observation végétale | [*Plantes médicinales, planche 2* — Larousse du XXe siècle](https://commons.wikimedia.org/wiki/File:Plantes_m%C3%A9dicinales_planche_2_-_Medicinal_plants%2C_medical_herbs%2C_botanical_illustrations%2C_plate_2_-_Public_domain_illustration_from_Larousse_du_XX%C3%A8me_si%C3%A8cle_1932.jpg) ; fichier mis en ligne par EN NOIR & BLANC | Fichier CC0 1.0 indiqué sur Commons | Planche botanique réelle, non carnet du personnage |
| Thaléa — mer et navigation | [*Seascape with waves and sailing ship* — Christian Mølsted](https://commons.wikimedia.org/wiki/File:Christian_M%C3%B8lsted_-_Seascape_with_waves_and_sailing_ship.jpg) | Peinture dans le domaine public (Commons) | Ambiance marine, non représentation du yacht |

## Contrat technique du prototype

- `selection.mjs` conserve pour chaque média extérieur `url` (miniature), `source` (notice originale), `titre`, `credit`, `licence` et `nature` (avertissement de non-identification).
- `build.mjs` limite ces URL d'images à `https://upload.wikimedia.org/` ou `https://thumb.wikimedia.org/`, et exige une notice `https://commons.wikimedia.org/wiki/File:`. C'est un contrôle des formats, **pas une validation juridique automatique**.
- La galerie charge les images externes **uniquement après activation d'un bouton explicite** ; sans cette activation, des emblèmes locaux restent affichés. En cas d'échec de l'image, la vignette peut revenir à l'emblème.
- Les miniatures dépendent d'un hébergeur externe : disponibilité, politique anti-hotlink, évolutions de licences et confidentialité du lecteur doivent être examinées avant toute mise en ligne. Wikimedia Commons décrit le lien direct comme techniquement possible mais le **déconseille en général**. La piste privilégiée pour publier sera de copier localement une œuvre réellement réutilisable après approbation, attribution et contrôle du fichier inférieur à 3 Mio.
- Les liens source restent accessibles depuis la fiche, même lorsque le lecteur refuse le chargement distant ; aucune image extérieure n'est pour l'instant ajoutée aux assets officiels `content/images/`.

## Autres gisements à évaluer ultérieurement

- [OpenGameArt — *2D RPG Character Portraits*](https://opengameart.org/content/2d-rpg-character-portraits), publication créditée à Arcade Dream et marquée **CC0** sur la notice consultée ; la sélection d'une image individuelle et sa correspondance esthétique sont **à décider**, aucun asset de cette archive n'est intégré ici.
- [OpenGameArt — *RPG portraits*](https://opengameart.org/content/rpg-portraits), publication de Buch et licence CC0 indiquée ; il s'agit d'un lot de très petites icônes, à traiter comme exemples de style et non portraits officiels.

**Statut :** propositions documentées ; **à revoir par STUDIO/ATELIERS/ARCHIVES et DG/créateur avant publication**.
