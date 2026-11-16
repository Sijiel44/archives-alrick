# Recette du catalogue et de la fiabilité technique

Le 15 novembre 2026, sur `codex/medias-fiabilite`, depuis le `main` publié `a7dcd58f794a1501bd72b8f1375f7398019234c8`. Le dépôt était propre au début du lot. Les fonds vidéo précédents sont publiés par les PR 122 et 123 ; cette tranche réutilise les régies et les contrats de sauvegarde existants.

## Périmètre livré

- Cinquante sons et cinquante vidéos distincts, avec catégorie, recherche, source, auteur, licence, aperçu volontaire et préparation d’une copie dans les formulaires existants. Les crédits suivent les sauvegardes. Aucun média binaire ajouté.
- Suivi local des téléchargements lancés et des fichiers relus : date, révision et empreinte. Un fichier divergent à révision égale ne valide pas la copie courante. Un reçu plus récent que la campagne affichée demande une actualisation.
- Rappel dans Archiver et diagnostic volontaire en lecture seule : nombres de campagnes lisibles/illisibles, codes d’erreur et au plus cent identifiants hachés. Aucune réparation implicite ou donnée de campagne dans le rapport.
- Mises à jour ciblées de minimatch, Sharp et source-map-js. Les règles 5d6, les formats de sauvegarde et la sélection explicite de la projection restent ceux du projet.

## Résultats locaux

| Contrôle | Résultat |
| --- | --- |
| `npm ci`, manifestes et TypeScript | Réussis depuis le verrou corrigé |
| `npm test` | Réussi ; 877 HTML et 64 275 liens/ressources internes vérifiés, 92 références de catalogue |
| `node --test --test-concurrency=3 studio-local/tests/*.test.mjs` | 163 réussis, zéro échec ; quatre parcours Pages exclus puis exécutés séparément |
| Régies, catalogue, Fiabilité et Pages dans Edge | 46 réussis, zéro exclu ni échec |
| Quatre parcours Pages sur l’assemblage, dans Chrome | 4/4 réussis |
| `npm run test:m04:browser`, avec `CHROME_BIN` Windows | 22 scénarios historiques et 10 dialogues de confirmation réussis |
| `npm audit --json` | Zéro vulnérabilité signalée |
| Disponibilité des sources | 50/50 MP3 HTTP 200 `audio/mpeg` et 50/50 vidéos HTTP 200 `video/webm` |

Les recettes navigateur utilisent des sons et vidéos synthétiques interceptés ; elles ne sollicitent pas les 100 sources à chaque lancement. La disponibilité réelle, les auteurs et les preuves individuelles figurent dans les registres des [sons](MEDIAS-SONS-SOURCES.md) et [vidéos](MEDIAS-VIDEOS-SOURCES.md).

Le rendu du catalogue est inspecté à 1 440 et 390 px ; celui des sauvegardes à 1 440 et 320 px. Les assertions couvrent les largeurs 320, 390, 768 et 1 440 px, le clavier et la fermeture des dialogues. Les captures et journaux du poste de test restent temporaires, hors commits. Un premier processus global interrompu avant son bilan a été relancé intégralement. Le contrôle historique a d’abord cherché Chrome à son chemin Linux ; la recette réussie renseigne son chemin Windows, sans changer le produit.

## Dépendances et publication

Les listes complètes des fichiers des 39 PR ouvertes ont été examinées, y compris la deuxième page de la PR 95. Aucune ne modifie `studio-local/`. Les PR 35, 54, 64, 66, 73 et 76 partagent des fichiers de dépendances ou de CI ; leurs propositions ne sont pas intégrées par ce lot et pourront nécessiter une réconciliation future. Le `main` distant est resté au commit de départ pendant cette analyse.

La branche dédiée passe par une PR, puis par les workflows CI et Pages dans le cadre de l’autorisation de publication donnée par le créateur. Le [workflow Pages](https://github.com/Sijiel44/archives-alrick/actions/workflows/pages.yml) fournit la construction, le déploiement et les essais sur l’URL publique pour chaque version. Ce document rapporte les contrôles locaux ; la PR porte les liens vers les résultats distants après leur exécution.

Le premier passage CI a révélé une transition dépendante de la livraison asynchrone de l’événement de fermeture du catalogue : le nouveau formulaire pouvait déjà être ouvert avant la libération du lecteur. La sélection arrête désormais l’aperçu directement avant de fermer le catalogue et de préparer le formulaire. La recette continue à exiger l’absence du lecteur lors de cette ouverture ; cette assertion n’est pas assouplie.

Après fusion de la PR 124, le contrôle du mouvement réduit a rencontré un autre cas de recette : deux changements d’émulation consécutifs pouvaient être regroupés par Chromium avant la notification native. La recette attend désormais l’événement `MediaQueryList.change` confirmant la sortie du mouvement réduit avant de le réactiver. Elle conserve les contrôles de pause, de retrait de source et d’absence de reprise automatique ; aucun code de projection n’est modifié. Un contrôle Pages a également expiré avant l’obtention du port de Chromium, sans exécuter les scénarios produit ; seul ce travail en échec a été relancé.

La publication de la PR 124 est ensuite vérifiée par le [workflow Pages 43783426898 réussi](https://github.com/Sijiel44/archives-alrick/actions/runs/43783426898) : construction, déploiement, recette historique et quatre parcours Studio sur l’URL publique. Ces quatre parcours passent aussi depuis un profil Chrome neuf sur le poste. Le bilan local de 163 tests précède le correctif de fermeture ; ses quatre parcours catalogue ont été rejoués avec succès dans Chrome et Edge, et les 46 contrôles de CI réussissent sur le correctif `844273d`. Un second passage global interrompu avant son bilan n’est pas compté comme réussi.

## Qualification restante

**Séance humaine NON RÉALISÉE.** Le [protocole MJ et deux PJ](SEANCE-REELLE-FIABILITE.md) prévoit 10 à 20 minutes, un téléphone physique, la confidentialité de la projection, les interruptions et la restauration dans un profil distinct. Les tests, la publication et l’homologation en partie sont des états distincts ; le lot Fiabilité reste ouvert pour cet essai. Les 100 médias n’ont pas tous été écoutés ou visionnés intégralement. Le diagnostic initial du portrait `EncodingError` reste non déterminé ; la recette actuelle attend le chargement complet et vérifie le décodage.
