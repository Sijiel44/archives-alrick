# Liens de services et fichiers audio temporaires

Recherche et intégration du **15 novembre 2026**. Le Studio distingue les fichiers directs, les pages de services et les fichiers choisis sur l’appareil. Les liens personnels et leurs crédits restent des métadonnées privées de campagne ; ils ne rejoignent pas le catalogue de médias libres.

## Parcours disponibles

Ajouter une piste avec un nom, une adresse HTTPS et sa provenance. Une vidéo YouTube, une playlist Spotify ou une chanson Suno apparaît comme une référence de service dans la régie. L’ouverture de sa fiche ne contacte pas le service. Les liens sont normalisés : identifiants vérifiés et paramètres de suivi retirés. Une adresse connue mais incomplète reçoit un message pour obtenir le lien complet.

### YouTube

**Charger le lecteur YouTube** crée le lecteur officiel visible, puis l’utilisateur utilise ses commandes. Les liens de vidéos, liens courts `youtu.be`, Shorts et playlists sont acceptés. Aucun fichier YouTube n’est téléchargé ou converti en son ; aucun SDK distant n’est exécuté dans la page MJ. Le lecteur ne démarre pas automatiquement. **Arrêter et retirer le lecteur**, Échap et Fermer suppriment l’iframe. La projection de scène reste indépendante.

L’iframe utilise `youtube-nocookie.com`, avec un référent limité à l’origine par `strict-origin-when-cross-origin`. YouTube exige une identification du client ; supprimer tout référent peut provoquer l’erreur 153. L’exception concerne uniquement cette iframe. La politique des autres images et médias reste séparée. Le lecteur conserve ses contrôles, un minimum de 200 × 200 pixels et aucune surcouche devant lui. Une vidéo peut être indisponible en intégration, comporter des annonces ou renvoyer vers YouTube ; son lien source reste accessible.

Sources officielles : [paramètres](https://developers.google.com/youtube/player_parameters), [identification et présentation du lecteur](https://developers.google.com/youtube/terms/required-minimum-functionality), [mode de confidentialité renforcée](https://support.google.com/youtube/answer/171780), [politiques de contenu](https://developers.google.com/youtube/terms/developer-policies). Le mode renforcé ne signifie pas absence de connexion ni de traitement par le service après activation.

### Spotify

**Ouvrir dans Spotify** retrouve une playlist, un album ou un titre dans le service. Le Studio conserve le lien canonique, sans synchronisation avec la scène, mixage, extraction du flux ou chargement automatique.

Les [conditions des Widgets Spotify](https://developer.spotify.com/documentation/embeds/terms), section IV, encadrent l’intégration aux fonctionnalités de jeu, la synchronisation audiovisuelle et l’utilisation avec les flux d’autres services. Ce lot propose donc un accès externe. Une éventuelle intégration plus poussée nécessite une étude distincte de ces conditions. Techniquement, Spotify documente des [iframes de playlist](https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed) ; son [Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started) ajoute un compte Premium et une authentification, sans besoin pour le parcours de liens actuel.

### Suno et lecture locale

**Ouvrir dans Suno** accepte le lien complet d’une chanson et préserve sa destination. Une URL de page Suno n’est pas présentée comme un MP3. Le Studio ne récupère pas de fichier audio depuis la page ou une API non documentée. Aucun lecteur Suno incorporé n’est revendiqué : la recherche n’a pas établi de documentation primaire stable pour ce parcours.

**Lire un fichier audio** ouvre un MP3, WAV ou OGG obtenu par l’utilisateur, jusqu’à 50 Mio. La signature du fichier est contrôlée avant de proposer le lecteur ; le décodage reste celui du navigateur. La lecture attend l’action sur les commandes natives et met la régie en pause. Le fichier n’est envoyé à aucun serveur. Fermer, arrêter, changer de contexte ou quitter la page retire le lecteur et révoque son adresse temporaire. **Le fichier ne figure pas dans les sauvegardes** : il faut le sélectionner à nouveau pour une autre séance. Un fichier hébergé ailleurs en HTTPS peut également être utilisé par son lien direct dans la régie habituelle.

Les [conditions Suno](https://suno.com/terms), effectives le 3 septembre 2026, distinguent notamment usage personnel, téléchargements autorisés et usage commercial. L’aide [Téléchargements](https://help.suno.com/en/articles/13876865), actualisée le 13 novembre, indique des crédits selon l’offre ; les téléchargements d’essai n’autorisent pas un usage commercial. L’aide [Droits avec un abonnement](https://help.suno.com/en/articles/9601665) lie les droits annoncés aux téléchargements effectués dans les conditions applicables. La disponibilité d’un lien n’attribue pas les droits sur son contenu. Utiliser le téléchargement proposé par Suno et conserver la provenance du fichier ; ce lot n’extrait ni n’enregistre de flux.

## Vérification

Les recettes de données contrôlent les identifiants, domaines, protocoles, paramètres et destinations canoniques. Les recettes navigateur utilisent une iframe YouTube fictive interceptée : activation explicite, référent limité à l’origine, absence de requête lors de l’ouverture, contrôle de fermeture et largeurs de 320 à 1 440 pixels. Spotify et Suno ne chargent aucun iframe. Un WAV synthétique vérifie lecture choisie, arrêt, révocation de l’URL temporaire, absence de persistance et refus d’un faux fichier audio.

La lecture réelle par les fournisseurs dépend de leur disponibilité et de leurs restrictions. Une recette interceptée n’homologue pas la lecture de chaque vidéo, compte ou playlist. Les essais humains en séance restent ceux du [protocole de Fiabilité](SEANCE-REELLE-FIABILITE.md).
