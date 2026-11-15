# Régie sonore du MJ

Lot du 15 novembre 2026, développé sur `codex/regie-sonore` depuis la version publiée `6d76fc9`. La régie sonore est implémentée et recettée localement. Le créateur a autorisé sa publication le 15 novembre ; la CI, le [workflow Pages](https://github.com/Sijiel44/archives-alrick/actions/workflows/pages.yml) et le contrôle de l’URL publique restent à vérifier avant de la déclarer publiée.

## Usage dans le Studio

1. Ouvrir une campagne, passer dans **Jouer** puis rejoindre la **Régie sonore**, sous la scène courante. Le raccourci **Régie sonore** permet de la retrouver depuis les autres vues de la campagne.
2. Déplier **Bibliothèque de pistes** puis choisir **Ajouter une piste**. Saisir un nom, une URL HTTPS directe vers un fichier audio et ses crédits ou sa provenance. L’enregistrement du lien ne charge pas le média.
3. Créer une playlist, ajouter ses pistes et régler leur ordre. Une même piste peut apparaître plusieurs fois. La boucle porte sur la playlist entière.
4. Charger la playlist dans la régie, puis lancer **Lecture**. Les commandes permettent de mettre en pause, arrêter, passer à la piste précédente ou suivante et régler le volume.
5. Choisir une **Playlist suggérée** puis **Associer à la scène**. Quand la scène change, sa playlist est proposée ; **Charger la suggestion** la prépare et **Lecture** lance le son. La lecture en cours continue tant que le MJ ne la remplace pas ou ne l’arrête pas.
6. Télécharger la sauvegarde privée de la campagne pour conserver les pistes, playlists et associations hors du navigateur.

Un seul lecteur audio est utilisé par le Studio. Ouvrir une campagne ou consulter une playlist ne démarre aucun son. Le changement de campagne arrête le lecteur et libère sa source. **Arrêter le son** reste disponible dans l’en-tête pendant qu’une source est chargée, même depuis une autre vue. L’audio sort sur le périphérique choisi sur l’ordinateur du MJ ; la fenêtre de projection et les appareils des joueurs ne reçoivent aucune piste dans ce lot.

Le chargement d’une autre playlist demande confirmation lorsqu’une source est déjà chargée. Modifier ou supprimer la playlist chargée, ou l’une de ses pistes, arrête le lecteur et demande de charger sa nouvelle version. Le volume et le choix de boucle du lecteur durent dans la page ouverte ; ce ne sont pas des préférences persistantes. Le choix **Boucler cette playlist par défaut** appartient, lui, à la playlist enregistrée.

## Sources et états du lecteur

Le premier lot accepte les URL absolues HTTPS sans identifiants intégrés. Les URL de session `blob:`, les données encodées `data:`, les liens HTTP et les fichiers locaux ne constituent pas des sources durables dans ce contrat. Une page YouTube, Spotify ou de partage n’est pas un fichier audio direct.

Le navigateur doit pouvoir lire le format et accéder à l’adresse. Une URL enregistrée peut devenir indisponible ou expirer. Les crédits restent déclaratifs ; l’enregistrement d’un lien ne fournit aucune autorisation d’utilisation. Utiliser les fichiers créés pour le projet ou ceux dont l’utilisation est autorisée.

Le lecteur indique chargement, lecture, pause, arrêt et erreur à partir de ses événements. Si le navigateur refuse la lecture ou si la source échoue, une action du MJ permet de réessayer ou de choisir une autre piste. Une série de sources indisponibles ne doit pas être parcourue silencieusement. Le chargement des fichiers distants commence seulement après la commande volontaire de lecture.

## Contrat privé et sauvegardes

La campagne conserve l’extension `entreRivesMediaV18` :

- `tracks` : identifiant, nom, URL et crédit de chaque source ;
- `playlists` : identifiant, nom, liste ordonnée d’identifiants de pistes et choix de boucle ;
- `scenePlaylists` : identifiants de la scène et de la playlist proposée.

Les limites sont de 100 sources, 20 playlists et 50 entrées par playlist, dans le plafond de sauvegarde de campagne existant de 4 Mio. Une playlist vide peut être conservée. La suppression d’une piste enlève ses occurrences des playlists ; la suppression d’une playlist enlève ses associations de scène.

Les liens et les métadonnées voyagent dans la sauvegarde privée v18 ; aucun fichier audio n’y est encodé. Les sauvegardes v1 à v17 restent prises en charge, et les formats futurs sont refusés. Les transactions utilisent les contrôles de révision et d’identifiant d’opération existants. La régie ne modifie ni les règles 5d6, ni les fiches PJ, ni les exports joueur, ni le canon de l’univers.

## Recette du lot

Le relevé des 39 PR ouvertes ne trouve aucun fichier commun avec le Studio. Le lot ajoute cependant Playwright en dépendance de développement verrouillée à `1.65.0` et raccorde les recettes navigateur à la CI et à Pages : les PR historiques #35, #54, #64, #66, #73 et #76 touchent `package.json` ou les workflows et devront être conciliées avant leur éventuelle intégration. Les changements présents sont additifs ; ces autres propositions ne sont pas intégrées ici. `npm ci` a réussi.

La recette locale finale réussit : `npm test`, 132 scénarios Chrome sans échec, 21 contrôles ciblés Edge sans échec et deux parcours Pages exécutés séparément dans Chrome sur l’assemblage. Les deux parcours Pages sont exclus de la suite Chrome locale de 134 scénarios, puis exécutés avec leur configuration dédiée. Le contrôle de génération retrouve 877 pages HTML et 64 271 liens et ressources internes. Les cas audio exercent le contrat, les transactions et la restauration v18, la lecture d’un média fictif, les erreurs et refus, l’ordre, la boucle et les changements de contexte. Les rendus sont inspectés à 1 440 et 390 px ; les recettes couvrent les largeurs de 320 à 1 440 px et le clavier.

Une première exécution complète sous charge a rencontré une erreur de décodage de portrait. Les quatre contrôles isolés ont ensuite réussi, puis la suite complète finale limitée à trois tests simultanés a réussi sans modification du code des portraits. La CI et la version publiée doivent encore faire l’objet de leur propre contrôle. La qualification humaine en séance et sur appareil tactile réel reste distincte des tests automatisés.

## Suite

Le prochain lot fonctionnel est le **fond vidéo muet choisi dans la régie** : aperçu, confirmation, remplacement et retrait dans la fenêtre joueur, image de remplacement et pause du mouvement. Le [plan multimédia](MULTIMEDIA.md) détaille les raccords et les critères de recette. La synchronisation audio à distance et le transport de fichiers locaux font l’objet de lots ultérieurs. La maintenance des dépendances de construction reste aussi à traiter : l’audit npm relève trois alertes héritées concernant `sharp`, `minimatch` et `source-map-js`. Leur correction n’est pas annoncée livrée par ce lot.
