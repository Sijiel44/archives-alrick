# Fonds vidéo choisis dans la régie

Lot du 15 novembre 2026, sur `codex/fonds-video` depuis la version publiée `1ac3fc8`. Le code est implémenté et les recettes locales complètes décrites ci-dessous réussissent. Le créateur a autorisé la publication de ce lot le 15 novembre ; le [workflow Pages](https://github.com/Sijiel44/archives-alrick/actions/workflows/pages.yml) indique pour chaque version le résultat de construction, déploiement et recette sur l’URL publique. Ces états sont distincts de la qualification humaine en partie.

## Préparer une scène

1. Ouvrir une campagne et une scène dans **Jouer**, puis rejoindre **Fond vidéo choisi** depuis le raccourci de régie.
2. Choisir **Configurer le fond vidéo**. Fournir le lien HTTPS direct d’un fichier MP4 ou WebM, une **image de remplacement du catalogue**, la boucle et l’assombrissement. Le crédit ou la provenance reste privé.
3. **Enregistrer le fond vidéo** conserve ce réglage dans la campagne. Cette action ne charge pas le fichier et n’envoie aucune nouvelle présentation aux joueurs. Les retraits liés aux changements de campagne ou de révision restent appliqués.
4. Ouvrir l’aperçu de scène. Cocher **Utiliser le fond vidéo dans la fenêtre joueur**, choisir les champs de texte et relire l’image. Le choix vidéo est décoché au départ ; le raccourci **Préparer ce fond** le présélectionne explicitement.
5. Choisir **Préparer la vidéo** pour charger l’aperçu muet dans la régie. La fenêtre joueur conserve sa présentation pendant cette préparation. Si le lien échoue, le MJ peut le corriger ou décocher le fond vidéo pour préparer l’image seule.
6. Après relecture, choisir **Ouvrir une fenêtre joueur** ou **Remplacer dans la fenêtre joueur**. La diffusion n’a lieu qu’après cette confirmation. L’aperçu local est réservé au MJ ; pour une présentation vidéo, la commande d’affichage sur cet écran reste désactivée.

Une page YouTube, un lecteur intégré ou une page de partage n’est pas un fichier vidéo direct. Le navigateur doit pouvoir accéder à la source et lire son format. Les URL HTTP, les identifiants intégrés, les URL de session `blob:`, les données vidéo encodées et les fichiers locaux ne sont pas acceptés par ce lot. Les crédits sont déclaratifs ; conserver l’autorisation d’usage du fichier.

## Mouvement, remplacement et retrait

La vidéo est muette, y compris si le fichier possède une piste sonore. La boucle est facultative et l’assombrissement peut être réglé de 0 à 80 %. Le texte choisi reste lisible au-dessus du fond ; les commandes de mouvement restent accessibles.

La préférence de **mouvement réduit** présente d’abord l’image de remplacement, sans charger la vidéo distante. **Activer le mouvement** permet un choix volontaire. Le lecteur propose ensuite pause et reprise. Si le navigateur refuse le démarrage, l’image reste disponible avec une commande d’activation. Une erreur pendant la lecture revient à l’image.

**Retirer le fond** arrête la vidéo et libère sa source en conservant l’image et les textes affichés. **Retirer la scène de la fenêtre joueur**, depuis le Studio, retire la présentation entière. La fermeture de l’aperçu, l’annulation d’un chargement et le retrait nettoient aussi leurs médias ; une réponse tardive ne doit pas relancer un fond retiré.

Un remplacement prépare les nouveaux éléments avant la bascule : l’ancien affichage reste en place tant que le suivant n’est pas prêt. Une erreur ou une annulation de cette préparation conserve l’ancien affichage. La révision de campagne est vérifiée avant la diffusion et de nouveau avant la bascule ; un état devenu périmé déclenche le retrait prévu par la politique de confidentialité du Studio.

## Données et confidentialité

Le réglage est séparé du carnet d’ambiances v12. L’extension privée `entreRivesVideoV19` contient au plus une entrée par scène : `sceneId`, `url`, `imageId`, `loop`, `dim` et `credit`. Une image de remplacement est obligatoire. Les URL sont bornées à 2 048 caractères, les crédits à 600 ; les références et les révisions sont contrôlées dans les transactions existantes.

La sauvegarde de campagne v19 conserve les liens et réglages, avec l’audio v18 et les données précédentes. Aucun fichier vidéo ni image de remplacement encodée n’est ajouté à ce JSON. Les sauvegardes v1 à v18 restent lisibles ; les formats futurs sont refusés. Le plafond de 4 Mio reste en vigueur.

La fenêtre joueur reçoit seulement les champs de scène choisis et les données nécessaires au fond : URL sélectionnée, boucle, assombrissement et image de remplacement préparée. Le crédit privé, les identifiants de campagne et de scène, les notes MJ, les autres sources et la bibliothèque audio ne voyagent pas dans ce message. Le lien vidéo lui-même est nécessairement accessible au destinataire de la projection ; ne pas y placer de secret.

Le récepteur conserve son origine opaque. Les textes restent dans une iframe sans scripts et sans accès au stockage ; le contrôleur vidéo est un asset du projet autour de ce contenu. Aucun HTML ou lecteur tiers fourni par un fichier n’est exécuté.

## Recette et limites

La recette locale finale réussit :

- `npm test` : 877 pages HTML et 64 274 liens et ressources internes contrôlés.
- Suite Studio Chrome : 146 scénarios réussis sans échec ; les trois parcours Pages sont exclus de cette commande de 149 scénarios, puis exécutés séparément.
- Edge : 34 contrôles ciblés réussis sans échec, dont les trois parcours Pages. Chrome : trois parcours Pages réussis sur l’assemblage. Le contrôle des 92 références du catalogue réussit aussi.

Les cinq scénarios de stockage et neuf d’interface vidéo sont inclus dans cette recette : sauvegarde v19 et lecture v18, références, interruptions et révisions, aperçu choisi, lecture muette, mouvement réduit, annulation, remplacement et retrait. Les rendus sont inspectés à 1 440 et 390 px ; les recettes couvrent le clavier et les largeurs de 320 à 1 440 px, avec commandes fixes accessibles. La publication suit le workflow Pages autorisé, qui vérifie aussi le site public après déploiement.

La qualification humaine en séance et sur appareil tactile réel n’a pas été effectuée. Elle reste prévue au lot **2 · Fiabilité**, avec le suivi des sauvegardes et la maintenance des trois alertes npm héritées, non corrigées dans ce lot vidéo.

Ce lot n’apporte ni vidéothèque distante, ni transfert des fichiers, ni synchronisation audio multijoueur. Le lot suivant reste **Fiabilité**, avec suivi des sauvegardes, maintenance des dépendances et essai en séance réelle. Le parcours d’enrichissement éditorial est préparé dans [Enrichir l’univers avec ChatGPT et GitHub](ENRICHIR-UNIVERS.md).
