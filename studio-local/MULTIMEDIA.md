# Régie multimédia · état et prochains lots

**État au 15 novembre 2026 : la tranche audio MJ est implémentée et recettée localement ; les fonds vidéo restent prévus.** Le lot des objets MJ a été intégré par la PR 120 et publié. Le Studio possède déjà les ambiances de scène, les aperçus, le remplacement dans une fenêtre joueur et le retrait. Le [guide de régie sonore](REGIE-SONORE.md) décrit le lecteur, son contrat privé et les résultats de recette. La publication audio est autorisée ; sa CI, son déploiement Pages et son contrôle public restent à confirmer. Aucun changement de règle 5d6 ou de canon n’est prévu par ces lots.

## Socle à réutiliser

- `app.mjs` : `preparePresentation`, `presentPlayerContent`, `stopPlayerWindow` et `revokeSceneShare` assurent déjà la sélection, l’aperçu, la confirmation, le contrôle de révision et le retrait.
- `projection.mjs` : sélection des champs partageables et génération de documents de présentation. Les contenus affichés restent dans une iframe sans scripts.
- `joueur.js` et `joueur.html` : récepteur d’origine opaque, relié au MJ par un `MessageChannel` et un ticket. Il ne lit pas les campagnes ni le stockage du Studio.
- `store.mjs` : carnet d’ambiances v12, limité à douze entrées par scène. Ses champs sont strictement `id`, `name`, `title`, `description`, `imageId` ; leur ajouter un champ vidéo directement rendrait les anciennes validations incompatibles.
- `serve.mjs` et `scripts/assemble-pages.mjs` : mêmes assets et politiques de sécurité pour localhost et GitHub Pages. La tranche audio ajoute `media-src https:` au Studio MJ. Les politiques de la projection et de l’espace joueur restent inchangées ; l’autorisation des fonds vidéo dans le récepteur appartient à la tranche suivante.

## Tranche 1 · playlists audio du MJ

Le contrat retenu est documenté dans [Régie sonore du MJ](REGIE-SONORE.md). Le périmètre commence par les URL HTTPS absolues directes ; l’import de fichiers locaux et les URL relatives restent des extensions ultérieures.

Le premier lot permet de retrouver une ambiance, lancer sa playlist, ajuster le volume et arrêter le son sans quitter la scène.

1. Ajouter une bibliothèque privée de pistes, avec nom, lien direct vers le fichier, crédit ou provenance et durée constatée lorsque disponible.
2. Composer une playlist ordonnée et la rattacher facultativement à une scène. Les commandes initiales sont lecture/pause, précédent/suivant, volume et boucle de playlist.
3. Utiliser un seul lecteur audio natif dans le Studio. Le chargement d’une campagne ne démarre aucun son. La lecture débute par une commande du MJ ; les boutons et erreurs décrivent l’état réel du lecteur.
4. Conserver les playlists indépendamment du changement de scène. Présenter la playlist suggérée par la nouvelle scène et laisser le MJ choisir de la lancer. Un changement de scène ne doit pas provoquer une coupure ou une reprise sonore implicite.
5. Commencer par les fichiers directement accessibles à une URL HTTPS absolue, sans compte, SDK ou service tiers. Une page de partage qui ne mène pas à un fichier lisible n’est pas une source audio native.

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

La version de sauvegarde **v18** est retenue pour la régie sonore ; le lot précédent des objets reste compatible avec la v17. Les pistes, playlists et associations privées utilisent l’extension `entreRivesMediaV18`. Les fonds vidéo auront leur propre évolution de contrat, à définir lors de leur implémentation.

L’extension audio est séparée du carnet d’ambiances v12. Elle contient un registre de sources, des playlists ordonnées et les rattachements aux scènes. Des identifiants stables relient les entrées. Ses noms, crédits et autres métadonnées restent privés ; aucune de ces données n’est envoyée à la projection dans la tranche audio.

Proposition initiale de limites techniques : cent sources, vingt playlists et cinquante pistes par playlist, sans dépasser le plafond de sauvegarde de campagne existant de 4 Mio. Les vidéos et fichiers audio ne seraient pas encodés dans le JSON : seuls les liens et réglages voyageraient. Le transfert des fichiers eux-mêmes nécessiterait un paquet séparé ultérieur.

Les commandes de sauvegarde, déplacement dans l’ordre de playlist, suppression et rattachement valident les références, contrôlent la révision attendue et s’exécutent dans les transactions existantes. Une suppression de piste retire ses occurrences ; une suppression de playlist retire ses associations. Modifier une playlist chargée ou ses pistes arrête la lecture et demande de charger la nouvelle version. L’import refuse les formats futurs et conserve la lecture des sauvegardes v1 à v17. Les données musicales ne modifient aucun profil PJ ou calcul de jeu.

Les URL audio acceptées sont validées comme données, avec taille bornée et refus des identifiants intégrés à l’URL et des protocoles exécutables. Le lecteur attribue ses sources par l’API DOM ; aucun HTML, script ou iframe fourni par un fichier n’est exécuté. La durée constatée est affichée par le lecteur, sans supposer qu’une extension de fichier garantit sa compatibilité. Les sources vidéo restent à raccorder dans leur tranche propre.

## Raccords techniques à prévoir

| Fichier ou zone | Raccord prévu |
| --- | --- |
| Nouveau module de régie audio et CSS | Bibliothèque, playlists, état du lecteur et commandes accessibles. |
| `index.html`, `app.mjs`, `studio.css` | Accès depuis Jouer et le carnet d’ambiances, aperçu et commandes de diffusion choisie. |
| `store.mjs` | Extension privée, validation, commandes transactionnelles, restauration et version de sauvegarde. |
| `projection.mjs` | Construction d’un message média sélectionné, distinct des notes et données de campagne. |
| `joueur.js`, `joueur.html` | Couche vidéo, commandes de mouvement, nettoyage lors des remplacements et retraits. |
| `serve.mjs`, `scripts/assemble-pages.mjs` | Liste explicite des nouveaux assets et CSP cohérentes pour localhost et Pages. |

La CSP de la régie audio autorise les médias HTTPS directs dans le Studio MJ. Pour les vidéos, les CSP devront autoriser les sources sélectionnées dans le récepteur tout en conservant ses restrictions de scripts et de stockage. Le [contrat de la directive `media-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/media-src) distingue cette autorisation de celles des images et des connexions scriptées. Les scripts du récepteur resteront des assets contrôlés ; un module ou un lecteur externe ne devra pas être introduit implicitement.

## Recettes et critères de clôture

Prolonger `tests/ambiances.test.mjs`, `tests/transitions-joueur.test.mjs`, `tests/projection-scene.test.mjs` et `tests/pages.test.mjs`, avec de petits médias fictifs maîtrisés.

- Aucun son ou chargement média distant avant une commande explicite ; aucun canari MJ dans les messages envoyés.
- Lecture, pause, ordre de playlist, fin de piste, boucle, volume et erreur de source, avec absence de lecteurs concurrents involontaires.
- Aperçu vidéo, confirmation, remplacement, annulation et retrait ; le retrait arrête effectivement le média.
- Remplacement interrompu conservant la présentation précédente et refus d’une révision périmée.
- Autoplay refusé, vidéo muette, image de remplacement, mouvement réduit et commande de reprise volontaire.
- Sauvegarde/restauration v18 et lecture des v1 à v17 ; absence de binaires et de secrets dans les commits ou assets publiés.
- Clavier, focus, téléphone, fermeture de fenêtre et résultats identiques dans l’assemblage Pages.

La tranche audio dispose de son code, de sa documentation et de recettes locales réussies. La CI et la publication autorisée restent à contrôler avant d’annoncer sa disponibilité publique. La qualification en séance reste distincte. L’ordre retenu est : publier la régie sonore MJ après contrôle, puis ajouter le fond vidéo choisi dans la régie. La [feuille de route](FEUILLE-DE-ROUTE.md#prochains-lots-recommandés) situe ces tranches parmi les autres besoins de la table.
