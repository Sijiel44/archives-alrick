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
- Le Site conserve ses 211 fiches de lecture v22 (95 articles complets vérifiés) et ajoute un accès aux 357 références du catalogue commun. L’export du Studio ne copie pas les fiches de campagne sensibles : seules les adaptations publiques du catalogue sont proposées. Aucun renvoi de lecture ne doit conduire vers GitHub ou les Archives.

## Sauvegardes et continuité technique

Les campagnes créées sur le domaine des Chroniques gardent leur base IndexedDB et sont ouvertes par le Studio complet. Le portail public ne lit plus les campagnes.

GitHub Pages et Sites ont des origines distinctes : leurs données ne peuvent pas migrer toutes seules. Les anciennes adresses `/studio/` et `/studio/espace-joueur.html` servent uniquement à retrouver puis télécharger campagnes, fiches et brouillon, sans effacement ni envoi réseau. L’utilisateur importe ensuite chaque fichier dans le Studio ou l’espace joueur des Chroniques et vérifie l’aperçu. Les fichiers conservent les formats validés et les sommes de contrôle existants. Garder ce dispositif tant que des joueurs peuvent encore avoir des données sur l’ancienne origine.

## Prompts de maintenance

**Campagne :** « Mets à jour les Archives de L’Odyssée d’Orin avec le texte joint [code de source]. Recherche les fiches touchées, distingue les faits des intentions, conserve les identifiants, teste puis publie le lot autorisé sur Pages. »

**Univers ou outil :** « Mets à jour le Site Chroniques d’Entre-Rives existant, projet appgprj_6aefa21ad1bc819198e86d83a74b3484. Préserve ses contenus et données, ajoute [lot] avec des liens internes, vérifie bureau/mobile et publie sur la même adresse. Ne crée pas un nouveau Site. »

## Suite prioritaire

1. Recette en séance avec un MJ et deux joueurs : sauvegarde, restauration, projection choisie et médias. Ce test humain reste à faire.
2. Bibliothèque commune réalisée par le lot BIB-001 : entrée unique, catégories, recherche, lectures associées et retour aux filtres. Continuer les rapprochements éditoriaux lorsque deux identifiants différents désignent un même sujet ; ne pas les fusionner automatiquement.
3. Progression des PJ : mentorat, décisions MJ, historique et rétablissement.
4. Dossier joueur imprimable et exports de contenus approuvés.
5. Enrichissement de l’Atlas et des renvois « utilisé dans ».
6. Jeu distant : étude d’authentification, permissions et reconnexion avant développement. Le site actuel ne synchronise pas des parties entre appareils.

Tests automatisés réussis et publication ne valent pas homologation en séance.

## BIB-001 — bibliothèque commune

La page `/bibliotheque.html` réunit les index de lecture et de jeu. Les identifiants identiques partagent une carte, avec deux accès et deux statuts si nécessaire. Aucun article, portrait, identifiant ou lien historique n’est supprimé. Les brouillons, fiches non répertoriées et références signalant des révélations sont exclus de ce nouvel index ; leur présence historique sur une autre page ne vaut pas autorisation de découverte publique.

Sur le Site v31 de départ : 291 dossiers, 357 références ; après filtrage, **406 fiches distinctes et 103 doubles lectures**, dans 12 catégories. Ces nombres se recalculent à chaque intégration. Recherche sans accents, code exact prioritaire, filtres enregistrés dans l’adresse, chargement de 24 résultats à la fois, retour aux filtres depuis les deux lecteurs. Les Archives de campagne et les sauvegardes privées ne sont pas modifiées par ce lot.

Publication v33 : les cinq ajouts concurrents de la v32 ont été préservés avant publication. Le résultat contient **411 fiches, 514 accès de lecture et 298 illustrations référencées**. Le contrôle historique conserve 296 dossiers, 115 sources intégrales vérifiées et 201 images. La recette navigateur a été rejouée avec succès sur le domaine public, avec ses adresses simplifiées sans extension et le chargement asynchrone du catalogue.

Maintenance : ouvrir la dernière source du Site existant, puis exécuter `node scripts/integrate-library-sites.mjs <checkout-Sites/dist>`. L’export complet du Studio le fait également lorsque le portail est présent. Le script lit les imports courants du catalogue : il ne fige pas les lots de lore ni leur nombre et ne remplace pas les articles par une ancienne copie.

Contrôles : `npm test`, contrôle d’intégrité du Site `node scripts/check-public-library.mjs`, puis `SITES_CHECKOUT=<checkout-Sites> node --test publication/library-browser.test.mjs` (variable d’environnement à adapter au shell). La recette couvre les deux lecteurs, les filtres, leur remise à zéro, les états vides et erreur réseau, l’absence de liens GitHub et les largeurs 1365/390 pixels. Avec `PUBLIC_LIBRARY_URL`, elle peut être rejouée sur le domaine publié.

Prochain développement fonctionnel : progression PJ (mentorat, validation MJ et historique rétablissable), après examen des fonctions existantes et des PR INDEX/M03. L’essai en séance avec des personnes reste une validation distincte.

Recette du 17 novembre : périmètre 2/2 ; construction des Archives et 31 676 liens contrôlés ; Chrome 3/3 sur la récupération/restauration avec notes privées, le lecteur interne et les deux portails à 1365 et 390 pixels. Captures relues. Le débordement des codes documentaires sur mobile a été corrigé. Aucune donnée réelle utilisée.
