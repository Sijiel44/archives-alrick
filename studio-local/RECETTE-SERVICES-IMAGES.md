# Services multimédias et images de scène — recette du 15 novembre 2026

Base : `main` à `6ede99200d5ab2530a7e0b1f3880b136e4dae94d`. Branche : `codex/medias-services-images`. Ce lot ne modifie ni le canon, ni les règles 5d6, ni les dépendances npm.

## Fonctionnalités

- Régie : liens YouTube normalisés, lecteur officiel visible chargé volontairement et retiré à la fermeture ; accès externe aux playlists, albums et titres Spotify ainsi qu’aux chansons Suno.
- Audio local : sélection de MP3/WAV/OGG jusqu’à 50 Mio, contrôle de signature, lecture volontaire, arrêt et révocation de l’adresse temporaire. Le fichier reste hors sauvegarde et hors serveur.
- Scènes : bouton **Illustrer**, lien HTTPS, description, crédit privé, aperçu et trois cadrages. Préparation et diffusion restent deux gestes distincts ; une image peut servir de remplacement vidéo.
- Sauvegardes : extension v20 pour les images de scène ; lecture des versions antérieures, contrôle de révision, restauration et refus des archives rétrogradées.
- Catalogue : 55 sons et 55 vidéos, 75 CC0 et 35 domaine public. Les dix ajouts concernent notamment forge, moulin, poterie, village, cloche, cheval, coq et travail du bois. Les 100 entrées précédentes sont conservées.

## Preuves locales

| Contrôle | Résultat |
| --- | --- |
| `npm test` | Réussi : contenu, types, assemblage, liens et règles historiques. |
| Suite Studio Chrome, `STUDIO_PAGES_TEST=1` | **178/178**, dont les cinq parcours Pages assemblé. |
| Edge ciblé : services, intégration, images, contrats audio/vidéo et Pages | **25/25**. |
| Anciennes projections et nouvelles images, Chrome | **8/8**, compris dans la suite complète. |
| Catalogues | Dix licences sourcées et dix URL avec réponse HTTP 200/type attendu ; unicité et conservation des anciennes entrées. Voir les deux registres de sources. |
| Interface | Captures ordinateur 1440 px et téléphone 390 px examinées ; assertions de largeur entre 320 et 1440 px. |
| YouTube réel, profil isolé | Réponse de l’iframe HTTP 200 et vignette officielle visible. La lecture complète de la vidéo n’est pas validée par ce contrôle. |

Les tests automatisés interceptent les fournisseurs et utilisent des médias fictifs pour vérifier le comportement, les permissions de chargement, le retrait et la séparation MJ/joueur. Les essais d’images couvrent un hébergeur autorisant CORS, son refus et le repli vers le catalogue. L’URL et les crédits privés de l’image ne sont pas transmis au joueur : seule une copie PNG préparée est envoyée.

L’assemblage `assemble-pages.mjs` attend une sortie Quartz neuve : un appel isolé sur le répertoire déjà assemblé est refusé. `npm run build` a été rejoué avant la recette Pages, avec succès.

## Limites et suite

Spotify et Suno restent des destinations externes ; leur lecture n’est pas contrôlée par le Studio. Un son Suno se lit localement à partir d’un téléchargement autorisé ou via son propre hébergement HTTPS. YouTube reste un lecteur visible dans la régie, indépendant des fonds vidéo de la fenêtre joueur. Voir [la faisabilité et les sources officielles](SERVICE-MEDIAS.md).

La projection d’une image distante nécessite un hébergeur autorisant CORS. L’aperçu MJ peut fonctionner sans cette autorisation. Les fichiers audio locaux sont temporaires ; les liens des campagnes sont sauvegardés, les fichiers restent chez leurs hébergeurs. Aucun visionnage ni écoute intégrale des 110 médias n’est revendiqué.

**Séance humaine avec un MJ et deux PJ : non réalisée.** Le lot Fiabilité reste ouvert selon son [protocole](SEANCE-REELLE-FIABILITE.md). Prochain développement : indices, objectifs de quête et liens **utilisé dans**.

## Coordination et publication

41 PR ouvertes examinées. La PR 127 Organisations touche aussi `app.mjs`, `serve.mjs` et la CI ; ses changements fonctionnels portent sur d’autres zones. La nouvelle étape de CI est distincte pour conserver sa recette Organisations. Le marqueur de publication devra garder les entrées des deux lots lors d’un rapprochement. Les autres recouvrements concernent surtout les dépendances et la CI (35, 54, 64, 66, 73, 76). Aucun contenu de ces PR n’est fusionné par ce lot.

Le créateur a autorisé la publication des lots terminés et vérifiés dans ce chat. La PR de ce lot conserve les résultats de CI, le déploiement Pages et le contrôle de l’URL publique. Les preuves locales ci-dessus ne valent pas homologation en séance.

### Actualisation après la publication des Organisations

La PR 127 a été fusionnée sur `main` pendant ce travail. Le commit de rapprochement `eafa90c` conserve ses fiches, son rayon, ses recettes et les deux entrées du marqueur Pages. Aucun conflit fonctionnel dans `app.mjs`, `serve.mjs` ou la CI. Après rapprochement : **`npm test` réussi et 182/182 tests Chrome**. Les deux exécutions CI de ce commit réussissent.

Le premier contrôle PR `43796889648` est resté bloqué après les deux premiers parcours Pages et a été annulé lors de l’actualisation. Son journal ne permet pas d’établir la cause précise. La CI borne désormais les recettes navigateur à cinq minutes et le travail complet à quinze minutes. Le serveur de recette Pages ferme explicitement ses connexions à la fin du test pour ne pas retenir le nettoyage ni masquer une erreur.

Une première passe Edge après rapprochement a révélé que la recette ouvrait la bibliothèque avant la confirmation de création de campagne. Elle attend maintenant l’arrivée dans **Préparer** avant de naviguer. Après cette correction du test : **29/29 contrôles Edge**, Organisations comprises, et **5/5 parcours Pages Chrome**. Les assertions de sauvegarde, décodage du portrait et confidentialité sont conservées ; ce correctif ne modifie pas le produit.
