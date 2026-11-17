# Deux sites, deux responsabilités — décision du créateur du 17 novembre 2026

| Destination | Contenu | Maintenance |
| --- | --- | --- |
| `https://sijiel44.github.io/archives-alrick/` | L’Odyssée d’Orin : récit, personnes rencontrées, lieux, faits, projets et documents de campagne | Dépôt `Sijiel44/archives-alrick`, branche dédiée, PR et workflow Pages |
| `https://chroniques-entre-rives-studio.adaptableclove.chatgpt.site/` | Les Chroniques d’Entre-Rives : univers, jeu de rôle, fiches, Studio MJ et espace joueur | Projet Sites existant `appgprj_6aefa21ad1bc819198e86d83a74b3484` ; ouvrir, vérifier, enregistrer et déployer une version |

Le créateur autorise la publication des travaux d’univers dans ce cadre. Un élément peut appartenir aux Chroniques sans avoir été joué dans l’Odyssée. Cette décision ne transforme ni les hypothèses en canon ni les créations en faits joués. Les sauvegardes privées et notes sensibles restent hors publication.

## Contrat de construction

- `npm run build` / `npm run build:archives` produit **public-archives/**. C’est le seul répertoire accepté par le workflow Pages.
- La sélection repose sur `portee: jdr_alrick`, `publish: true`, et une liste fermée de sources historiques sans portée : `config/campaign-legacy.json`. Toute nouvelle fiche doit expliciter sa portée. Les identifiants et les originaux restent intacts.
- Les sommaires de campagne sont reconstruits, les liens vers les fiches exclues deviennent du texte ; recherche, sitemap et liens locaux sont contrôlés. Les révélations gardent leur avertissement et restent hors index.
- `npm run build:integration` génère l’ancien assemblage dans **public/** uniquement pour les tests de compatibilité. **Ne jamais publier ce répertoire.**
- `node scripts/export-studio-sites.mjs <checkout-Sites/dist>` apporte les assets publics autorisés du Studio et les références lisibles sur place. L’export est additif : il ne remplace pas le parcours d’univers existant. Relire le diff du Site avant chaque nouvelle synchronisation pour préserver ses évolutions propres.
- Le Site conserve ses 158 fiches de lecture v14 et ajoute un accès aux références du catalogue commun. Les fiches de campagne sensibles ne sont pas copiées : seules les adaptations publiques du catalogue sont proposées. Aucun renvoi de lecture ne doit conduire vers GitHub ou les Archives.

## Sauvegardes et continuité technique

Les campagnes créées sur le domaine des Chroniques gardent leur base IndexedDB et sont ouvertes par le Studio complet. Le portail public ne lit plus les campagnes.

GitHub Pages et Sites ont des origines distinctes : leurs données ne peuvent pas migrer toutes seules. Les anciennes adresses `/studio/` et `/studio/espace-joueur.html` servent uniquement à retrouver puis télécharger campagnes, fiches et brouillon, sans effacement ni envoi réseau. L’utilisateur importe ensuite chaque fichier dans le Studio ou l’espace joueur des Chroniques et vérifie l’aperçu. Les fichiers conservent les formats validés et les sommes de contrôle existants. Garder ce dispositif tant que des joueurs peuvent encore avoir des données sur l’ancienne origine.

## Prompts de maintenance

**Campagne :** « Mets à jour les Archives de L’Odyssée d’Orin avec le texte joint [code de source]. Recherche les fiches touchées, distingue les faits des intentions, conserve les identifiants, teste puis publie le lot autorisé sur Pages. »

**Univers ou outil :** « Mets à jour le Site Chroniques d’Entre-Rives existant, projet appgprj_6aefa21ad1bc819198e86d83a74b3484. Préserve ses contenus et données, ajoute [lot] avec des liens internes, vérifie bureau/mobile et publie sur la même adresse. Ne crée pas un nouveau Site. »

## Suite prioritaire

1. Recette en séance avec un MJ et deux joueurs : sauvegarde, restauration, projection choisie et médias. Ce test humain reste à faire.
2. Rapprocher les deux catalogues de lecture internes (parcours éditorial et références de jeu), sans perdre les fiches, leurs codes ni leurs statuts.
3. Progression des PJ : mentorat, décisions MJ, historique et rétablissement.
4. Dossier joueur imprimable et exports de contenus approuvés.
5. Enrichissement de l’Atlas et des renvois « utilisé dans ».
6. Jeu distant : étude d’authentification, permissions et reconnexion avant développement. Le site actuel ne synchronise pas des parties entre appareils.

Tests automatisés réussis et publication ne valent pas homologation en séance.
