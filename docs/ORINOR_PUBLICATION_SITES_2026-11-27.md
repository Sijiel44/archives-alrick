# Atlas et Lore d’Orinor — publication sur le Studio existant

Portée : `univers_partage`. Publication expressément demandée par le créateur le **27 novembre 2026**, heure de Montréal. Les nouveaux lieux et personnages proposés restent des propositions non jouées ; l’autorisation de lecture publique ne les transforme pas en lore validé.

## Version publiée

- Site conservé : https://chroniques-entre-rives-studio.adaptableclove.chatgpt.site/
- Parcours public : https://chroniques-entre-rives-studio.adaptableclove.chatgpt.site/atlas-orinor.html
- Projet : `appgprj_6aefa21ad1bc819198e86d83a74b3484` ; audience publique conservée.
- Départ : version **49**, source `9e045dc12bed4ff6834639df48066c7b78773068`.
- Arrivée : version **51**, source Sites `4dcd63af1fcd27caffdcb689d0b84dbbc1568514`.
- Version enregistrée : `appgprj_6aefa21ad1bc819198e86d83a74b3484~appgver_456977c088bc8191bb6cd91c88e79549`.
- Déploiement : `appgdep_6b0a37302cec819186637d9a45e2a18b`, résultat Sites **succeeded**. La version 50 conserve le premier état publié ; la 51 améliore la présentation des liens de source et le contrôle HTTP après publication.

## Contenu et continuité

Le lot reprend les **36 lieux** de la PR #184, commit `3b07ab548e0614074a323da53f183f09858bdbf8`, avec leurs identifiants ORI. Quatre dossiers complémentaires présentent la prospérité et les libertés, les réseaux et l’hospitalité, les quinze personnages proposés et cinq parcours de jeu. Les **339 sections** sources sont conservées dans l’adaptation, avec des repères éditoriaux explicites.

Le parcours rejoint l’accueil, la navigation partagée et la bibliothèque commune. Recherche sans accents, filtres par région/type/état, remise à zéro, état vide et retour depuis le lecteur conservent le contexte dans l’adresse. Les fiches d’Orinor, d’Orignac, des six terroirs et les personnages antérieurs sont reliés sans fusion d’identifiants. La bibliothèque commune conserve ses **411 anciennes fiches** et ajoute 40 dossiers ; les **639 fichiers publics existants** sont toujours présents. Aucun code de stockage ou de sauvegarde n’est modifié.

Les faits retenus restent distincts des quartiers, coutumes, paysages détaillés, localités, PNJ et intrigues proposés. Brumehaute et Pontelier gardent leur nom proposé. La capitale historique reconstruite n’a pas reçu de nom inventé. Les six terroirs n’ont pas d’administration propre ; aucune conclusion administrative supplémentaire n’est appliquée à Orignac. Les références historiques GEO-002 et MON-PASS-01 restent accessibles dans le lecteur du Studio avec leur état documentaire.

L’archive `Atlas_Orinor_illustre_v01.zip` n’était pas disponible sur ce poste. Le créateur a ensuite expressément autorisé le **réemploi des illustrations déjà présentes**. Six ambiances picturales du Studio sont réutilisées, avec textes alternatifs et crédit expliquant qu’elles ne représentent pas officiellement chaque lieu. Aucune carte exploratoire, frontière, population, distance ou ligne de transport réalisée n’a été ajoutée.

## Validation

`npm test` est réussi sur le checkout de la branche source de la PR #184 : contrôle de 480 pages et 375 codes ; intégration de 1 216 pages HTML et 94 558 liens/ressources ; Archives séparées de 263 pages et 31 676 liens. Ces constructions locales ne déclenchent aucune mise en ligne Pages.

Les contrôles Sites `check-public-library.mjs` et `check-orinor-atlas.mjs` passent : 346 dossiers de lecture, 117 sources intégrales historiques vérifiées par SHA ; 36 lieux, quatre dossiers, 254 liens narratifs et préservation des anciennes entrées. Recette navigateur à 1365 et 390 pixels : recherche, filtres, état vide, cité, village proposé, retour aux filtres et source des passages fonctionnels ; aucun débordement horizontal observé.

Le dépôt source Sites contient les scripts reproductibles `build-orinor-atlas.mjs`, `integrate-orinor-navigation.mjs`, `check-orinor-atlas.mjs` et `check-orinor-published.mjs`, ainsi que les copies des sources et leurs empreintes hors du répertoire déployé. Le dernier compare les ressources publiques aux fichiers de la version livrée.

**La PR #184 demeure non fusionnée.** Ses sources conservent `publish:false`. Ce compte rendu ne modifie ni les Archives de L’Odyssée d’Orin, ni leur configuration Pages, ni les données privées. Aucun nouveau Site n’a été créé.
