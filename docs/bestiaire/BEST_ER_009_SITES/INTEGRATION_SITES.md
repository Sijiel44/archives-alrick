# BEST-ER-009 — Contrat d’intégration Sites observé

Inspection en lecture seule le 26 novembre 2026. Projet existant **appgprj_6aefa21ad1bc819198e86d83a74b3484**, version enregistrée **49**, source **9e045dc12bed4ff6834639df48066c7b78773068**. Aucun fichier du Site modifié et aucune publication effectuée.

## Le catalogue réellement observé

Le lecteur public assemble 306 lectures depuis les modules de dist/app.mjs, dont les 35 créatures issues de dist/bestiary-data.mjs. world-data.mjs compte 12 lectures et archive-data.mjs 95, sans autre type creatures. Les tableaux readingModules du snapshot donnent chaque module, export, nombre et blob.

La bibliothèque commune charge dist/library-index.json : 411 cartes et 514 variantes ; 49 cartes bestiaire et 84 accès. Le lecteur de références de jeu charge dist/studio/public-documents.json : 357 documents, dont 49 en bestiaire. Le catalogue documentaire bestiaire séparé comporte 35 entrées ; catalogue-archives.json 92 entrées dont 11 au rayon bestiaire. BEST-ER-008 et BEST-ER-009 sont absents de ces parcours.

## Chaîne de lecture et schémas

1. **dist/bestiary-data.mjs** exporte bestiarySource (schema entre-rives.studio.bestiary-references.v1), puis bestiaryEntries. Source : id, version, name, description, kind, shelf, group, status, path, tags, links, details (couples titre/texte), art.src et art.alt.
2. Son mapper crée une lecture : id, type:creatures, name, subtitle, symbol, status, description, introduction, art (src, fallback, alt, credit), sections, articlePath, links, provenance, originalPath, sourceVersion. Il construit articlePath=./articles/ID.md et remappe les images vers ./media/bestiaire/ (exceptions des trois individus conservées).
3. **dist/app.mjs** importe ces lectures et les concatène avec worldEntries, les lots world-batch-five/six/seven/eight/nine/twelve/thirteen/fourteen/fifteen/sixteen, archiveEntries, antagonistEntries et guideEntries. Aucun filtre éditorial général avant readingById.
4. **dist/library-model.mjs**, fonction mergeLibrary : fusion par ID, variantes reading/game, classement creatures vers bestiaire. Exclut hidden, publish:false, spoilers:true et unlisted:true. **Ne filtre pas un statut proposition_non_jouee/proposal/test par lui-même.**
5. **dist/bibliotheque.mjs** charge l’index JSON déjà construit, ajoute quelques guides MATH et affiche les filtres recherche/catégorie/usage. Il ne recharge pas les métadonnées source de publication.
6. **dist/studio/bibliotheque.mjs** importe catalogue-archives.json, catalogue-organisations.json, catalogue-bestiaire.json, catalogue-pnj.json et catalogue-antagonistes.json. Le catalogue bestiaire est mappé sans filtre publish ; il entre dans fixedEntries et buildLibraryIndex. creatureReference exige l’ID et la version exacts pour une référence de créature. Les profils et variantes de campagne demeurent séparés.
7. **dist/studio/fiches.mjs** charge public-documents.json (entries et pathIds), affiche markdown, statut, provenance, image et liens internes. **dist/article-renderer.mjs** limite le rendu Markdown et les images : une référence documentaire dans les sources ne suffit pas à rendre un média arbitraire visible.

## Risque bloquant de statut

Le mapper actuel de bestiary-data.mjs attribue sans condition le libellé **« Bestiaire validé · Non joué · Sans profil 5d6 »** et une provenance concluant **« contenu descriptif validé »**. Les champs publish/canon_statut/etat_editorial de nos préparations n’y sont pas propagés. Copier les dix propositions dans ce tableau les présenterait comme validées et pourrait les exposer malgré leur brouillon. **Ne pas effectuer cet import.**

Les propositions historiques déjà publiées et leurs libellés ne constituent pas une dérogation applicable aux nouvelles fiches. L’accès aux sources et l’absence de collision ne suffisent pas à autoriser le changement de statut. Aucun code ESP n’est attribué à009.

## Mapping à préparer après validation éditoriale

| Livrable009 | Cible technique et contrôle |
| --- | --- |
| ID de travail puis identité approuvée | Décision de registre distincte ; conserver alias et manifeste, sans recycler033..042 |
| Nom, résumé, identité et révision | Référence JSON et fiche de lecture ; sourceVersion doit attester le texte exact |
| Description complète, écologie, cycle, comportement | Article interne dist/articles/ ; résumé details ne remplace pas la fiche complète |
| Capacités, conditions, limites et contre-jeu | Sections documentaires, sans injection de profil/capacité M03 |
| Variantes, ressources et quatre amorces | Article intégral, statut de proposition explicite, recettes non homologuées visibles |
| Image originale, alt et provenance | Fichier média local, art/credit et chemin contrôlé ; recette visuelle séparée |
| Statut et droit de publication | Mapper sensible aux statuts et rejet des brouillons avant indexage/import ; pas de libellé validé automatique |
| Références et retours | IDs existants, liens internes, retour aux filtres, aucune sortie documentaire imposée vers GitHub/Archives |
| Bibliothèque commune | Régénération de library-index.json à partir des dernières sources ; préserver les ajouts Sites concurrents |
| Référence de jeu complète | Synchroniser public-documents.json/pathIds et catalogue-bestiaire.json sans copier de sauvegarde |

Le lot est un **paquet de préparation**, pas un import de production attesté. Ne pas modifier la production avant l’arbitrage du statut approprié, l’intégration contrôlée et la recette.

## Vérification requise avant toute publication009

Le script existant scripts/check-public-library.mjs est figé à 35 bestiaires, 32 ESP et 3 INDC. Il exige pour chaque article canonique publish:true, visibilite:publique, spoilers:false, unlisted:false, canon_statut:lore_valide, code exact et SHA Git correspondant. Une évolution validée doit adapter le contrat de données et les contrôles, sans transformer nos propositions pour satisfaire ces assertions.

Recette encore non effectuée pour009 : bureau/mobile, recherche noms/IDs sans accents, filtre bestiaire, pagination, deux lecteurs, retour aux filtres, images originales, liens, statut visible et exclusion des brouillons, absence de médias cassés, préservation des contenus actuels. Le domaine fourni peut utiliser des adresses simplifiées : tester les liens réellement servis. Chaque publication doit reprendre la dernière version du projet existant, préserver son audience et confirmer le résultat du déploiement. Aucun nouveau Site, fusion main, workflow Pages ou modification des Archives d’Orin n’est inclus dans cette mission.

## Sources exactes conservées

Le snapshot associe les SHA Git aux modules et données. Modules de lecture : dist/bestiary-data.mjs, world-data.mjs, archive-data.mjs, antagonists-data.mjs, guide-data.mjs et les dix world-batch importés. archive-data.mjs inclut historical-people.mjs, historical-residents.mjs, historical-residents-continued.mjs, historical-cb43.mjs, historical-cb44.mjs, historical-cb38-42.mjs, kelm-orinor-expansion.mjs et tavern-family.mjs. Ces descendants doivent être préservés lors de toute intégration, ainsi que les lecteurs/index/catalogues cités ci-dessus.
