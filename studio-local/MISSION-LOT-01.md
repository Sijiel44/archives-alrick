# Audit et lot Accueil des Chroniques d’Entre-Rives

L’état courant des lots figure dans la [feuille de route du Studio MJ](FEUILLE-DE-ROUTE.md).

Relevé du 7 novembre 2026. Le dépôt de travail est `Sijiel44/archives-alrick`. Avant intervention, la branche locale `codex/studio-local-pilote` était propre à `bd127231ef2661e03f665a03712a3ae405ac4031`. Le premier pilote `28cd269e62498e167dc0e4e45a9bd7e55a19d450` est un ancêtre de cette branche. Le `main` distant est à `88f774f3d0d6d520d8d11443b72202b9caf4f94b`. Aucun ref distant du nom de la branche du pilote n’a été retourné. Le point de départ de la recette est le Studio local.

Le site de référence répond en HTTP 200. Une ouverture en profil Chrome neuf affiche « L’aventure vous attend » et une entrée « Espace joueur ». Son HTML contient aussi une section Communauté. Aucun identifiant de révision commun n’a été établi avec le pilote local. Les retours du Lab du 7 novembre distinguent le pilote, L003/L004 et le prototype de stockage. [Site de référence](https://chroniques-entre-rives-studio.adaptableclove.chatgpt.site/)

## Matrice de l’existant

| Fonctionnalité | Existant constaté | Écart | Réutilisation possible | Priorité | Responsable proposé |
| --- | --- | --- | --- | --- | --- |
| Découverte et navigation | Accueil MJ illustré et navigation à cinq vues dans le pilote | Entrée dédiée aux visiteurs et aux joueurs | Quatre illustrations locales, identité et lien direct au Studio | Lot 1 | BUILDER · DESIGN |
| Cockpit MJ | Campagne active, reprise, notes privées, recherche de campagne, improvisation et sauvegarde | Raccourcis de séance, état de session, prochaine séance et phase Archiver | Formulaires, vues Préparer/Jouer et actions existantes | Lot 2 | STUDIO |
| Fresque | Cartes de scènes, ordre, liens dirigés avec libellé, vue liste, scène active | Statuts narratifs confirmés, autres types, groupes et zoom | Identifiants de scène, commandes atomiques et parcours clavier | Lot 3 | STUDIO · INDEX |
| Bibliothèque et Atlas | Bestiaire fictif, copies avec provenance, contenus historiques Quartz | Catalogue unifié, filtres, liens aux fiches et lieux libres | Catalogue local, identités et contenus Quartz évalués par statut | Lots 4–5 | INDEX · LORE |
| Moteurs M01–M05, Atelier PJ, Grimoire, Bestiaire | Implémentations TypeScript, schémas et bancs historiques sur main | Raccord par ports au Studio et validation de la provenance | M01 progression, M02 fiche, M03 combat, M04 bestiaire, M05 dérivation de fiche. Réutiliser les ports testés et le Grimoire | Lots 4–6 | MATH · ATELIERS |
| INDEX | Contrat candidat d’enveloppe et validation dans #105 | Adoption et intégration avec les formats Studio et ARCHIVES | Comparer les identifiants, le statut et les fixtures | Lots 4–6 | INDEX |
| Hub joueur | PJ modifiables dans la régie privée et page Joueur visible dans le HTML du site de référence | Hub opérationnel séparé avec journal et permissions | Contrats M02, modèles de profils et affichages accessibles | Lot 6 | STUDIO · MATH |
| Activités et progression | Conception Lab, progression historique et choix de niveau 1–25 dans le pilote | Interludes, fenêtre de temps fictif et validation des acquisitions | M01/M02, modèles descriptifs et décision explicite du MJ | Lot 7 | MATH · STUDIO |
| Projection et médias | Projection locale sandboxée avec liste blanche et révocation. Images locales de démonstration | Fenêtre séparée à vérifier, média et ambiances | Frontière publique existante et actifs locaux | Lot 8 | STUDIO · QA |
| Chronique et communauté | Export privé de campagne, formats de partage décrits par le Lab | Archive narrative et publication d’une chronique ou d’un paquet expurgé | Aperçu, provenance et collision déjà traités par ARCHIVES | Lots 2 et 9 | STUDIO · ARCHIVES · COMM |
| Persistance et reprise | IndexedDB transactionnel, révisions, archives v1/v2, aperçu et restauration sans remplacement | Raccord aux formats historiques et contrôle de volumétrie réelle | Magasin du pilote, bancs #104/#106 et recette de causalité | Transverse · Lot 10 | ARCHIVES · QA |

## Périmètres historiques examinés

| PR ouverte en brouillon | HEAD vérifié | Périmètre réutilisable et réserve |
| --- | --- | --- |
| #85 | `2ab809e` | Candidat intégré L003, contrats STUDIO/ARCHIVES et runtime. [PR #85](https://github.com/Sijiel44/archives-alrick/pull/85) |
| #91 | `20679f7` | Recette indépendante L003 rattachée au candidat #85. Les résultats de sa description ne qualifient pas le Studio local. [PR #91](https://github.com/Sijiel44/archives-alrick/pull/91) |
| #95 | `6004369` | Démonstration L004 et intégration P0. Le relevé précédent documente le blocage de causalité à ce SHA. [PR #95](https://github.com/Sijiel44/archives-alrick/pull/95) |
| #104 | `f84f8c5` | Banc IndexedDB isolé et comparaison A/B/C. [PR #104](https://github.com/Sijiel44/archives-alrick/pull/104) |
| #105 | `4f3dffd` | Contrat et fixtures INDEX P1A pour les ressources et exports privés. [PR #105](https://github.com/Sijiel44/archives-alrick/pull/105) |
| #106 | `f254d9c` | Export IndexedDB atomique et essai de concurrence. [PR #106](https://github.com/Sijiel44/archives-alrick/pull/106) |

Les références et états de PR sont vérifiés par Git et par l’API des PR. L’endpoint Actions a renvoyé une erreur de délai pendant ce relevé. Le [dossier de décision](DECISION.md) conserve les résultats et liens de la vérification précédente sur les SHA concernés. Les instructions de publication Pages restent dans le workflow historique. [Workflow Pages](https://github.com/Sijiel44/archives-alrick/blob/88f774f3d0d6d520d8d11443b72202b9caf4f94b/.github/workflows/pages.yml)

## Navigation et dépendances

| Surface | Entrée et responsabilité | Dépendances |
| --- | --- | --- |
| Découverte | `/accueil` présente l’univers et des repères pour les joueurs. Les liens déclenchent explicitement l’entrée dans le Studio. | HTML, CSS, illustrations locales et un module limité à la fermeture du menu. CSP dédiée. |
| Studio MJ | `/` reste le point d’entrée du pilote. Les fragments `#reprendre`, `#campagne` et `#bibliotheque` donnent une destination aux liens de découverte. | Serveur Node, app et IndexedDB du pilote. Le fragment indique une action et ne transporte aucune donnée de campagne. |
| Projection | La projection du Studio reçoit le titre et la description sélectionnés. | Rendu sandboxé et contrat local du pilote. Un futur second écran devra faire l’objet d’une recette de confidentialité. |
| Archives historiques | Quartz et moteurs M01–M05 restent des sources de référence. | Build historique indépendant. Les raccords de règles passent par des adaptateurs avec tests de parité. |

La campagne, les notes et les sauvegardes restent sous le même profil et la même origine. Le lot n’introduit aucune mutation de schéma. Le retour au commit `bd12723` remet l’ancienne navigation en service avec les mêmes données. Le principal risque est une régression de reprise au changement de route. La recette traverse l’accueil, la création, la bibliothèque et la reprise d’une scène avec un canari fictif réservé au Studio.

## Directions visuelles à arbitrer

| Direction | Palette et composition | Où elle est utile |
| --- | --- | --- |
| **Rives au crépuscule** | Ardoise `#111A22`, bleu charbon `#1C2933`, cuivre lumineux `#E3A476`, or `#D3B475`. Panorama à droite, texte ivoire sur voile sombre, titres Georgia. | Direction provisoire du lot. Les mêmes illustrations soutiennent la découverte et le Studio, dont les panneaux restent sobres. |
| **Atlas de terrain** | Encre `#18221F`, vert minéral `#30453B`, laiton `#C7AC71`, papier `#EFE7D1`. Composition de carnet et repères cartographiques. | Lieux, consultation du monde, bibliothèque éditoriale. |
| **Lanternes de veille** | Anthracite `#1D171C`, brun prune `#392831`, ambre `#F1B272`, crème `#F4E9DD`. Mise en lumière concentrée sur le passage. | Présentation narrative, entrées de chapitre et révélation d’illustration. |

La direction retenue pour l’essai garde la palette Lab et relève le cuivre des actions pour la lisibilité. Sur les surfaces unies, ivoire sur nuit atteint 15,16:1, texte secondaire sur panneau 9,20:1, nuit sur cuivre 8,23:1, focus sur panneau 9,82:1. Le panorama reçoit un voile à gauche et les boutons gardent une surface propre. Le menu illustré s’ouvre au clic et au clavier, se ferme avec Échap et utilise une transition courte uniquement si le système autorise le mouvement. Le morphing du fond reste une étude. [Site d’inspiration](https://returntomonkeyisland.com/) · [Référence de navigation](https://www.reddit.com/r/web_design/comments/1xe6v14/made_a_dropdown_that_morphs_as_you_move_between/) · [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Sortie du lot et suite

- Baseline exécutée avant intervention sur Windows, Node 24 et Chrome. Les neuf tests du pilote passent sur `bd12723`.
- Les nouveaux scénarios vérifient l’image, le menu, les raccourcis de découverte, le clavier, les petites largeurs, le mouvement réduit, la reprise et l’absence de données MJ dans le document de découverte.
- Restent à vérifier avec des personnes en situation réelle la lisibilité du panorama, la navigation au lecteur d’écran et le confort sur tablette.
- Pour le lot 2, STUDIO peut regrouper campagne, scène, notes et sauvegarde dans un tableau de bord et mettre les actions fréquentes à portée de main. ARCHIVES et QA vérifient la reprise, les conflits et le retour arrière. Pour le lot 3, commencer par distinguer une scène préparée d’un fait joué confirmé. INDEX et STUDIO stabilisent ce statut avant d’ajouter d’autres types de cartes ou une disposition libre.
