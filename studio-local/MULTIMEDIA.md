# Régie multimédia · état et prochains lots

**État au 15 novembre 2026 : la régie sonore MJ est publiée ; les fonds vidéo choisis sont implémentés et recettés localement.** L’audio a été publié par la [PR 121](https://github.com/Sijiel44/archives-alrick/pull/121), au commit `1ac3fc8`, avec [déploiement Pages et contrôles publics réussis](https://github.com/Sijiel44/archives-alrick/actions/runs/43748189926). Le Studio possède les ambiances, les aperçus, le remplacement dans une fenêtre joueur et le retrait. Les guides de [régie sonore](REGIE-SONORE.md) et de [fonds vidéo](FONDS-VIDEO.md) décrivent les parcours et leurs limites. La publication vidéo est autorisée le 15 novembre ; le [workflow Pages](https://github.com/Sijiel44/archives-alrick/actions/workflows/pages.yml) donne l’état du déploiement et des recettes publiques de chaque version. Ces lots ne changent ni les règles 5d6 ni le canon.

## Socle à réutiliser

- `app.mjs` : `preparePresentation`, `presentPlayerContent`, `stopPlayerWindow` et `revokeSceneShare` assurent déjà la sélection, l’aperçu, la confirmation, le contrôle de révision et le retrait.
- `projection.mjs` : sélection des champs partageables et génération de documents de présentation. Les contenus affichés restent dans une iframe sans scripts.
- `joueur.js` et `joueur.html` : récepteur d’origine opaque, relié au MJ par un `MessageChannel` et un ticket. Il ne lit pas les campagnes ni le stockage du Studio.
- `store.mjs` : carnet d’ambiances v12, limité à douze entrées par scène. Ses champs sont strictement `id`, `name`, `title`, `description`, `imageId` ; leur ajouter un champ vidéo directement rendrait les anciennes validations incompatibles.
- `serve.mjs` et `scripts/assemble-pages.mjs` : mêmes assets et politiques de sécurité pour localhost et GitHub Pages. Le Studio MJ autorise les médias HTTPS ; le lot vidéo raccorde le contrôleur partagé au récepteur opaque. Les textes restent dans une iframe sans scripts et les connexions scriptées du récepteur restent fermées.

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

Le périmètre implémenté est un fond animé de scène, préparé dans la régie puis envoyé volontairement à la fenêtre joueur. Son [guide](FONDS-VIDEO.md) précise l’aperçu explicite **Préparer la vidéo**, la confirmation de diffusion, les commandes et les limites. Un réglage enregistré ne charge et ne diffuse rien. L’image de remplacement est obligatoire, le choix vidéo est décoché par défaut sauf après le raccourci volontaire **Préparer ce fond**, et l’affichage vidéo sur cet écran du MJ reste hors de ce lot.

- Accepter d’abord les fichiers vidéo directs MP4 ou WebM, sans audio diffusé : lecture muette, boucle facultative, affichage en couverture, assombrissement pour la lisibilité et image de remplacement.
- Ajouter le choix du fond à l’aperçu de scène. **Préparer**, **Remplacer dans la fenêtre joueur** et **Retirer** gardent leurs rôles actuels. Le choix d’un fichier ou l’édition d’une ambiance ne diffuse rien automatiquement.
- Envoyer uniquement la source sélectionnée, la boucle, l’assombrissement et l’image préparée, avec les champs de scène approuvés. Le nom privé d’une ambiance, ses notes, le crédit vidéo privé, les identifiants de campagne/scène, les autres pistes et la campagne entière restent hors du message. L’URL choisie reste accessible au destinataire et ne doit pas contenir de secret.
- Créer une couche vidéo contrôlée par le récepteur déjà scripté, autour de l’iframe des textes. Conserver l’origine opaque, l’iframe de contenu sans scripts et l’absence de `allow-same-origin`.
- Fournir pause/reprise du mouvement et retrait immédiatement accessibles. **Retirer le fond** arrête et libère la source, en conservant image et textes. Le retrait complet depuis le Studio enlève la présentation. Les fermetures et annulations nettoient aussi les médias ; ce lot n’accepte pas d’URL Blob.
- Conserver l’ancienne présentation tant que son remplacement n’est pas prêt. Une erreur ou une annulation conserve cet affichage. La révision est contrôlée avant diffusion puis avant la bascule ; un état périmé entraîne le retrait prévu par la politique de confidentialité existante.

L’iframe finale actuelle utilise `sandbox=""`. Ce sandbox bloque aussi les fonctions automatiques, notamment l’autoplay : ajouter simplement un attribut `autoplay` à une vidéo dans ce cadre ne suffit pas. Le [standard HTML sur le sandbox](https://html.spec.whatwg.org/multipage/browsers.html#sandboxing) décrit cette restriction. La couche vidéo dans le récepteur existant évite d’assouplir le document contenant les textes.

Pour `prefers-reduced-motion: reduce`, proposer d’abord l’image de remplacement et une activation volontaire du mouvement. Une préférence locale de lecture et une commande pause restent disponibles ; masquer une vidéo en CSS ne garantit pas son arrêt. Voir [MDN, préférence de mouvement réduit](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

## Contrats de données et sauvegardes

La sauvegarde **v18** conserve la régie sonore dans `entreRivesMediaV18`. Les fonds vidéo utilisent la **v19** et l’extension séparée `entreRivesVideoV19`, avec au plus un réglage par scène : `sceneId`, `url`, `imageId`, `loop`, `dim` et `credit`. Les sauvegardes v1 à v18 restent prises en charge. Le lot des objets reste compatible avec la v17.

L’extension audio est séparée du carnet d’ambiances v12. Elle contient un registre de sources, des playlists ordonnées et les rattachements aux scènes. Des identifiants stables relient les entrées. Ses noms, crédits et autres métadonnées restent privés ; aucune de ces données n’est envoyée à la projection dans la tranche audio.

Les limites audio sont de cent sources, vingt playlists et cinquante pistes par playlist. Chaque scène conserve un seul réglage vidéo avec URL de 2 048 caractères au plus, crédit de 600 et assombrissement de 0 à 80 %. Le plafond de sauvegarde de campagne reste de 4 Mio. Aucun fichier audio ou vidéo, ni image préparée encodée, n’est stocké dans le JSON : seuls les liens et réglages voyagent. Le transfert des fichiers eux-mêmes reste un lot ultérieur.

Les commandes de sauvegarde, déplacement dans l’ordre de playlist, suppression et rattachement valident les références, contrôlent la révision attendue et s’exécutent dans les transactions existantes. Une suppression de piste retire ses occurrences ; une suppression de playlist retire ses associations. Modifier une playlist chargée ou ses pistes arrête la lecture et demande de charger la nouvelle version. L’import refuse les formats futurs et conserve la lecture des sauvegardes v1 à v17. Les données musicales ne modifient aucun profil PJ ou calcul de jeu.

Les URL audio et vidéo sont validées comme données, avec taille bornée et refus des identifiants intégrés à l’URL et des protocoles exécutables. Les lecteurs attribuent leurs sources par l’API DOM ; aucun HTML, script ou iframe fourni par un fichier n’est exécuté. La compatibilité réelle d’un format dépend du navigateur et de la source ; l’extension du nom ne la garantit pas.

## Raccords techniques

| Fichier ou zone | Raccord prévu |
| --- | --- |
| `audio.mjs`, `audio-ui.mjs` et CSS | Bibliothèque, playlists, état du lecteur et commandes accessibles. |
| `video.mjs`, `video-ui.mjs`, `video-player.js` et CSS | Réglages privés par scène, aperçu et contrôleur de mouvement partagé. |
| `index.html`, `app.mjs`, `studio.css` | Accès depuis Jouer et le carnet d’ambiances, aperçu et commandes de diffusion choisie. |
| `store.mjs` | Extension privée, validation, commandes transactionnelles, restauration et version de sauvegarde. |
| `projection.mjs` | Construction d’un message média sélectionné, distinct des notes et données de campagne. |
| `joueur.js`, `joueur.html` | Couche vidéo, commandes de mouvement, nettoyage lors des remplacements et retraits. |
| `serve.mjs`, `scripts/assemble-pages.mjs` | Liste explicite des nouveaux assets et CSP cohérentes pour localhost et Pages. |

Les CSP autorisent les médias HTTPS directs nécessaires dans le Studio et le récepteur, en conservant les restrictions de scripts et de stockage. Le [contrat de la directive `media-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/media-src) distingue cette autorisation de celles des images et des connexions scriptées. Les scripts du récepteur restent des assets contrôlés ; aucun lecteur tiers n’est introduit.

## Recettes et critères de clôture

Prolonger `tests/ambiances.test.mjs`, `tests/transitions-joueur.test.mjs`, `tests/projection-scene.test.mjs` et `tests/pages.test.mjs`, avec de petits médias fictifs maîtrisés.

- Aucun son ou chargement média distant avant une commande explicite ; aucun canari MJ dans les messages envoyés.
- Lecture, pause, ordre de playlist, fin de piste, boucle, volume et erreur de source, avec absence de lecteurs concurrents involontaires.
- Aperçu vidéo, confirmation, remplacement, annulation et retrait ; le retrait arrête effectivement le média.
- Remplacement interrompu conservant la présentation précédente et refus d’une révision périmée.
- Autoplay refusé, vidéo muette, image de remplacement, mouvement réduit et commande de reprise volontaire.
- Sauvegarde/restauration v19 et lecture des v1 à v18 ; absence de binaires et de secrets dans les commits ou assets publiés.
- Clavier, focus, téléphone, fermeture de fenêtre et résultats identiques dans l’assemblage Pages.

La recette locale complète réussit : `npm test`, 146 scénarios Studio Chrome sans échec, 34 contrôles ciblés Edge sans échec et trois parcours Pages exécutés séparément dans Chrome sur l’assemblage. Les trois parcours Pages sont exclus de la commande Studio Chrome de 149 scénarios ; ils sont inclus dans les contrôles Edge. Le contrôle retrouve 877 HTML, 64 274 liens et ressources, ainsi que les 92 références du catalogue. Les cinq scénarios de stockage et neuf d’interface vidéo sont inclus. Les rendus sont inspectés à 1 440 et 390 px ; le clavier et les largeurs de 320 à 1 440 px sont contrôlés.

La publication autorisée suit le workflow Pages et ses recettes publiques par version. La qualification humaine en partie et sur appareil tactile réel n’est pas faite : elle reste dans le lot suivant **2 · Fiabilité**, avec suivi des sauvegardes et maintenance des trois alertes npm héritées. Ces alertes ne sont pas corrigées dans le lot vidéo. La [feuille de route](FEUILLE-DE-ROUTE.md#prochains-lots-recommandés) conserve cet ordre ; le [guide d’enrichissement de l’univers](ENRICHIR-UNIVERS.md) prépare en parallèle les petits lots sourcés avec ChatGPT et GitHub.
