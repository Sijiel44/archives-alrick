# Régie multimédia · plan des prochains lots

**État au 14 novembre 2026 : prévu, non implémenté.** Le Studio possède déjà les ambiances de scène, les aperçus, le remplacement dans une fenêtre joueur et le retrait. Il ne possède pas encore de lecteur audio, de playlists ni de fonds vidéo. Ce document propose leur raccord après le lot des objets MJ, sans modifier les règles 5d6 ou le canon.

## Socle à réutiliser

- `app.mjs` : `preparePresentation`, `presentPlayerContent`, `stopPlayerWindow` et `revokeSceneShare` assurent déjà la sélection, l’aperçu, la confirmation, le contrôle de révision et le retrait.
- `projection.mjs` : sélection des champs partageables et génération de documents de présentation. Les contenus affichés restent dans une iframe sans scripts.
- `joueur.js` et `joueur.html` : récepteur d’origine opaque, relié au MJ par un `MessageChannel` et un ticket. Il ne lit pas les campagnes ni le stockage du Studio.
- `store.mjs` : carnet d’ambiances v12, limité à douze entrées par scène. Ses champs sont strictement `id`, `name`, `title`, `description`, `imageId` ; leur ajouter un champ vidéo directement rendrait les anciennes validations incompatibles.
- `serve.mjs` et `scripts/assemble-pages.mjs` : mêmes assets et politiques de sécurité à raccorder pour localhost et GitHub Pages. Aujourd’hui, l’absence de `media-src` et le repli sur `default-src 'none'` bloquent les médias.

## Tranche 1 · playlists audio du MJ

Le résultat attendu est une régie sonore utilisable pendant une séance locale : retrouver une ambiance, lancer sa playlist, ajuster le volume et arrêter le son sans quitter la scène.

1. Ajouter une bibliothèque privée de pistes, avec nom, lien direct vers le fichier, crédit ou provenance et durée constatée lorsque disponible.
2. Composer une playlist ordonnée et la rattacher facultativement à une scène. Les commandes initiales sont lecture/pause, précédent/suivant, volume et boucle de playlist.
3. Utiliser un seul lecteur audio natif dans le Studio. Le chargement d’une campagne ne démarre aucun son. La lecture débute par une commande du MJ ; les boutons et erreurs décrivent l’état réel du lecteur.
4. Conserver les playlists indépendamment du changement de scène. Présenter la playlist suggérée par la nouvelle scène et laisser le MJ choisir de la lancer. Un changement de scène ne doit pas provoquer une coupure ou une reprise sonore implicite.
5. Commencer par les fichiers directement accessibles à une URL du site ou en HTTPS, sans compte, SDK ou service tiers. Une page de partage qui ne mène pas à un fichier lisible n’est pas une source audio native.

Le lecteur doit traiter `ended`, `error`, les chargements interrompus et les promesses rejetées de `play()`. Une piste indisponible est signalée ; le passage automatique à la suivante ne doit pas masquer une série d’échecs. Les refus d’autoplay exigent une commande de lecture disponible, conformément au [guide MDN sur l’autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).

L’audio de cette tranche reste côté MJ, pour la sortie sonore choisie sur son ordinateur. La diffusion synchronisée vers plusieurs joueurs distants constitue un lot distinct. Les fichiers locaux pourront être ajoutés ensuite avec un statut explicite lorsqu’ils doivent être sélectionnés de nouveau ; une URL Blob de session ne doit jamais être présentée comme une sauvegarde durable.

## Tranche 2 · fonds vidéo muets dans la projection

Le résultat attendu est un fond animé de scène, préparé dans la régie puis envoyé volontairement à la fenêtre joueur : eau, brume, feu ou autre clip choisi par le MJ.

- Accepter d’abord les fichiers vidéo directs MP4 ou WebM, sans audio diffusé : lecture muette, boucle facultative, affichage en couverture, assombrissement pour la lisibilité et image de remplacement.
- Ajouter le choix du fond à l’aperçu de scène. **Préparer**, **Remplacer dans la fenêtre joueur** et **Retirer** gardent leurs rôles actuels. Le choix d’un fichier ou l’édition d’une ambiance ne diffuse rien automatiquement.
- Envoyer uniquement la source sélectionnée et ses réglages publics, avec les champs de scène approuvés. Le nom privé d’une ambiance, ses notes, les autres pistes et la campagne entière restent hors du message.
- Créer une couche vidéo contrôlée par le récepteur déjà scripté, autour de l’iframe des textes. Conserver l’origine opaque, l’iframe de contenu sans scripts et l’absence de `allow-same-origin`.
- Fournir pause/reprise du mouvement et retrait immédiatement accessibles. Au retrait, arrêter le média, vider sa source et libérer les éventuelles URLs Blob. Fermer une campagne ou retirer sa scène ne doit pas laisser une vidéo active en arrière-plan.
- Conserver l’ancienne présentation tant que son remplacement n’est pas prêt. Une erreur de chargement ou un aperçu périmé garde le contrôle au MJ.

L’iframe finale actuelle utilise `sandbox=""`. Ce sandbox bloque aussi les fonctions automatiques, notamment l’autoplay : ajouter simplement un attribut `autoplay` à une vidéo dans ce cadre ne suffit pas. Le [standard HTML sur le sandbox](https://html.spec.whatwg.org/multipage/browsers.html#sandboxing) décrit cette restriction. La couche vidéo dans le récepteur existant évite d’assouplir le document contenant les textes.

Pour `prefers-reduced-motion: reduce`, proposer d’abord l’image de remplacement et une activation volontaire du mouvement. Une préférence locale de lecture et une commande pause restent disponibles ; masquer une vidéo en CSS ne garantit pas son arrêt. Voir [MDN, préférence de mouvement réduit](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

## Contrats de données et sauvegardes proposés

La prochaine version de sauvegarde disponible est **v18**, le lot des objets restant compatible avec la v17. Cette attribution est prévue pour le multimédia et devra être confirmée au démarrage de son implémentation.

Préparer une extension privée séparée, par exemple `entreRivesMediaV18`, plutôt que réécrire le carnet d’ambiances v12. Elle contiendrait un registre de sources, des playlists ordonnées et les rattachements aux scènes. Des identifiants stables relieraient les entrées ; les noms privés resteraient distincts des éventuels libellés explicitement projetés.

Proposition initiale de limites techniques : cent sources, vingt playlists et cinquante pistes par playlist, sans dépasser le plafond de sauvegarde de campagne existant de 4 Mio. Les vidéos et fichiers audio ne seraient pas encodés dans le JSON : seuls les liens et réglages voyageraient. Le transfert des fichiers eux-mêmes nécessiterait un paquet séparé ultérieur.

Les commandes de sauvegarde, déplacement, suppression et rattachement devront valider les références, contrôler la révision attendue et s’exécuter dans les transactions existantes. Une suppression ne laissera pas de piste orpheline silencieuse. L’import refusera les formats futurs et conservera la lecture des sauvegardes v1 à v17. Les données musicales ne modifieront aucun profil PJ ou calcul de jeu.

Les URLs acceptées seront validées comme données, avec taille bornée et refus des identifiants intégrés à l’URL et des protocoles exécutables. Le lecteur attribuera ses sources par l’API DOM ; aucun HTML, script ou iframe fourni par un fichier ne sera exécuté. Les limites de format et de durée constatées seront des états du lecteur, sans supposer qu’une extension de fichier garantit sa compatibilité.

## Raccords techniques à prévoir

| Fichier ou zone | Raccord prévu |
| --- | --- |
| Nouveau module de régie audio et CSS | Bibliothèque, playlists, état du lecteur et commandes accessibles. |
| `index.html`, `app.mjs`, `studio.css` | Accès depuis Jouer et le carnet d’ambiances, aperçu et commandes de diffusion choisie. |
| `store.mjs` | Extension privée, validation, commandes transactionnelles, restauration et version de sauvegarde. |
| `projection.mjs` | Construction d’un message média sélectionné, distinct des notes et données de campagne. |
| `joueur.js`, `joueur.html` | Couche vidéo, commandes de mouvement, nettoyage lors des remplacements et retraits. |
| `serve.mjs`, `scripts/assemble-pages.mjs` | Liste explicite des nouveaux assets et CSP cohérentes pour localhost et Pages. |

Les CSP devront autoriser précisément les sources nécessaires via `media-src`, tout en gardant les restrictions de scripts et de stockage du récepteur. Le [contrat de la directive `media-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/media-src) distingue cette autorisation de celles des images et des connexions scriptées. Les scripts du récepteur resteront des assets contrôlés ; un module ou un lecteur externe ne devra pas être introduit implicitement.

## Recettes et critères de clôture

Prolonger `tests/ambiances.test.mjs`, `tests/transitions-joueur.test.mjs`, `tests/projection-scene.test.mjs` et `tests/pages.test.mjs`, avec de petits médias fictifs maîtrisés.

- Aucun son ou chargement média distant avant une commande explicite ; aucun canari MJ dans les messages envoyés.
- Lecture, pause, ordre de playlist, fin de piste, boucle, volume et erreur de source, avec absence de lecteurs concurrents involontaires.
- Aperçu vidéo, confirmation, remplacement, annulation et retrait ; le retrait arrête effectivement le média.
- Remplacement interrompu conservant la présentation précédente et refus d’une révision périmée.
- Autoplay refusé, vidéo muette, image de remplacement, mouvement réduit et commande de reprise volontaire.
- Sauvegarde/restauration v18 et lecture des v1 à v17 ; absence de binaires et de secrets dans les commits ou assets publiés.
- Clavier, focus, téléphone, fermeture de fenêtre et résultats identiques dans l’assemblage Pages.

Une tranche ne sera déclarée implémentée qu’après son code, ses recettes navigateur et sa documentation. La qualification en séance restera identifiée séparément. L’ordre proposé est : terminer et publier le lot des objets, développer la playlist audio MJ, puis ajouter le fond vidéo choisi dans la régie.
