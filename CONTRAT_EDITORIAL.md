# Contrat éditorial de continuité — Les Archives d’Alrick

## Principes non négociables

1. Le **brut de campagne** est l'archive première ; les six volumes consolidés sont des synthèses et indices ; le site présente un état lisible et sourcé. Un ancien état n'est pas forcément le canon actuel.
2. **Source affichée** pour tout changement de canon : code CB + intervalle de paragraphes quand disponible. Jamais de référence inventée.
3. Ne pas convertir une **intention ou une préparation** en événement joué. Mentionner les suites ouvertes sans les présenter comme des faits acquis.
4. « **Rappelé** » (mort revenu à la vie via Orin) et « **Revenant** » (compagnie d'Orin) sont des champs *indépendants*. De même pour emploi, résidence, allégeance, Maison, parenté et titres.
5. Une nouvelle fiche doit posséder un **code stable et unique**, un titre humain, une catégorie, un état documentaire, et ses sources. Le dossier où elle se trouve n'est pas une preuve de son statut canonique.
6. L'IA prépare des **propositions de modifications** ; la validation éditoriale précède la publication.
7. Le code `CB42` indique une session source ; ne pas le confondre avec une date du calendrier fictif. Les dates de fichiers ne datent pas les événements du monde.
8. Les fiches destinées surtout au MJ peuvent être accessibles aux joueurs sur choix. Toute page avec `spoilers: true` — y compris hors de `content/mj/` — affiche d’abord un avertissement replié derrière une action explicite. Toute fiche à spoilers publiée porte aussi `unlisted: true` : elle reste accessible par son URL et ses liens éditoriaux, mais ne paraît pas dans la recherche, le sitemap ou la bibliothèque générale. Les pages de `content/mj/` restent également non répertoriées et averties. Les notes personnelles, le brut et l’inventaire de travail restent hors site et hors dépôt. Cette politique remplace celle du kit initial, conformément au projet de partage de l’univers.

## Valeurs permises pour `canon_statut`

- `faits_joues` — événement ou constat attesté en scène ;
- `lore_valide` — ajout de lore explicitement approuvé par le créateur, en distinguant les détails joués des propositions d’ambiance ;
- `declaration` — affirmation d'un personnage, pas garantie que le monde l'ait démontrée ;
- `projet_en_cours` — accord et intention, sans réalisation finale ;
- `hypothese` — explication incertaine ou de recherche ;
- `proposition_non_jouee` — pure suggestion éditoriale/MJ, à stocker plutôt hors `content` ;
- `historique` — ancienne formulation conservée pour traçabilité ;
- `a_verifier` — insuffisamment recoupé pour devenir canon.

Ces valeurs caractérisent une **fiche dominante**. Une page contenant plusieurs types de faits doit aussi distinguer chaque section par une légende explicite. Le statut d'une fiche entière ne rend pas tous ses paragraphes incontestables.

## Modèle conseillé

**Présentation narrative** en tête, **état vérifié** immédiatement dessous, **limites/contraintes**, **éléments ouverts**, **sources**, **liens**. Les gabarits spécialisés enrichissent ensuite l'identité, les relations ou les fonctions, sans changer les champs communs.

## Quatre parcours — même source, différents usages

Les Archives proposent désormais quatre portes d'entrée, sans dupliquer le canon : **Univers** (socle partageable), **Odyssée d'Orin** (campagne fondatrice), **Jouer dans ce monde** (aides aux joueurs et MJ) et **MJ assisté par IA** (prompts et procédures de continuité).

Les nouvelles métadonnées sont **recommandées pour toute fiche créée ou révisée à partir de maintenant**. Elles ne sont pas exigées rétrospectivement sur toutes les fiches historiques :

- `portee: "univers_partage"` ou `portee: "jdr_alrick"` : à quoi le texte appartient prioritairement ; `mixte` seulement si les parties sont clairement séparées ;
- `public_cible: ["lecteurs", "joueurs", "mj"]` : pour qui la fiche est utile, sans fournir d'autorisation d'accès ;
- `usage_en_jeu: ["reference", "decouverte", "rencontre", "scenario", "chronique", "continuite", "prompt"]` : les usages proposés, indépendants de la vérité canonique ;
- `periode` : préciser l'époque **uniquement lorsqu'elle est connue** ; ne pas déduire le calendrier fictif de la date des messages.

Ces champs **ne remplacent jamais** `canon_statut`, `etat_editorial`, `source_brute`, `spoilers`, `unlisted` ou `publish`. Une page peut offrir des scénarios non joués tout en décrivant des faits canoniques, si chaque partie porte clairement son statut. Les pages généralistes peuvent pointer vers des événements de campagne avec avertissement ; elles ne doivent pas révéler implicitement les secrets dans leur titre ou leur résumé.

### Versions indépendantes de campagne

Une autre table, avec ou sans IA, peut prendre l'univers comme point de départ. Ses choix et découvertes vont dans **son propre journal**, jamais automatiquement dans le canon de l'Odyssée d'Orin. Une IA ne doit pas prétendre avoir consulté le site entier : fournir un noyau documentaire daté et les fiches pertinentes pour chaque scène. Le prompt proposé est un outil, pas une règle officielle ni une mémoire persistante.

### Corrections prioritaires CB43

L'**Espace sur demande** désigne l'ensemble du domaine avec ses îles et transports ; la **Maison divine** désigne la communauté ; le **Palais divin** est la résidence personnelle d'Orin sur l'île de la Maison. Les îles publiques et des Revenants sont distinctes. Les Gardiennes du Passage, la mer intérieure, les maisons de fonction et la gare agrandie sont attestées dans CB43 ; les nouvelles îles de loisirs et demeures détaillées attendent la source CB4.4. **Elyan Corbeau-Gris est FAM-08 dans le Compendium**, grand-père maternel et mentor d'Orin ; sa fiche web PER-CB43 ne désigne pas un autre individu.

## Index de rubriques et navigation sans faux canon

Les treize rubriques thématiques possèdent des **index de lecture** reliés par la porte [[univers/index|Univers]]. Ces index sans code documentaire :

1. peuvent être publiés **sans modifier le décompte des fiches codées** approuvées ;
2. proposent comme liens de lecture **seulement les fiches déjà approuvées pour publication** ; les pages rouges ou brouillons restent citées en tant que *sujets à migrer*, sans lien de publication ;
3. signalent avant les liens que certaines fiches publiques ouvrent des **avertissements de spoilers** ;
4. conservent la distinction entre **fait joué, lore validé, déclaration, hypothèse, proposition et chantier** ;
5. n'inventent ni placement cartographique, ni période, ni droits d'accès, ni capacités magiques, ni chiffres de règles à partir de titres ou de résumés.

Une rubrique **publique** peut expliquer qu'un thème existe dans la Bible, l'Atlas ou le Codex sans présenter son dossier source encore non migré comme une page accessible. Toute nouvelle fiche se rattache à une rubrique et, selon sa portée, à l'un des quatre parcours ; elle n'a pas besoin de recopier l'histoire entière d'Orin.

**Exemple de méthode pour les sciences magiques :** le guide [[univers/magie-pour-jouer|Comprendre la magie]] cite les codes MAG du volume V04, mais n'est pas une fiche technique codée nouvelle et ne fixe pas de caractéristiques de jeu.

## Illustrations et portraits

Les illustrations web validées sont rangées dans `content/images/` (sous-dossiers par domaine). Formats acceptés : WebP, AVIF, PNG ou JPG, avec une limite de **3 Mio par fichier**. Les images SVG, documents sources, archives et autres fichiers binaires non approuvés restent exclus du site. Une page Markdown peut faire référence à une image locale avec un chemin relatif, par exemple `![Heimdall](../images/personnages/heimdall-portrait.webp)` depuis `content/personnages/REV-06.md`. Le contrôle du site doit vérifier que chaque image publiée est disponible à son URL finale. Les illustrations officielles doivent être approuvées par le créateur ; une image conceptuelle ne devient pas canonique par sa seule présence dans le dépôt.

## Groupes et alliances — classements indépendants

Les collectifs (compagnies, coalitions, conseils, suites et ordres) disposent de fiches `GRP-...` dans `content/groupes/`. Leur regroupement documentaire ne crée **aucune alliance réelle** : un membre de la Maison, un Revenant, un Rappelé, une puissance du Conseil des Dix-Huit et une personne de la Première Ancre peuvent avoir des statuts totalement distincts. Une fiche de groupe doit distinguer le noyau attesté, les membres honorifiques, les collaborateurs temporaires, les invités, les candidats et les liens historiques. La version actuelle des Revenants figure dans `content/groupes/GRP-01.md`. Ne jamais inférer une appartenance formelle de la seule présence dans une scène ou d'un code de fiche individuel historique. Sources et évolutions réelles priment sur les anciens résumés.

## Fiches jouables — amorces de rencontres et missions

Les fiches individuelles accueillent une section **« En jeu — rencontrer, interpréter et faire intervenir ce personnage »** suivant `modeles/personnage.md`. Elle donne aux lecteurs et MJ des usages jouables : rencontre ordinaire, PNJ commanditaire, allié temporaire, responsable de mission, formateur ou adversaire éventuel ; trois à cinq amorces adaptables avec enjeux, pistes et décisions ouvertes ; dialogue introductif **signalé comme scène proposée** ; rappels des talents, limites, ton et relations du personnage.

**Obligations :** préserver le libre arbitre des joueurs et du PNJ, ne jamais présenter des missions proposées comme aventures déjà jouées, ne pas fixer automatiquement l'identité d'un adversaire ou la cause d'une anomalie, ne pas attribuer de pouvoirs sans source. Les actes en scène, les témoignages du créateur, les interprétations et les propositions d'aventures restent identifiables séparément. Ne pas réintroduire sous forme de scénario public des révélations personnelles confiées au MJ : **notre dépôt GitHub et ses éventuelles pages MJ sont publics**. Conserver les notes vraiment confidentielles hors du dépôt et limiter les fiches publiées à des amorces sans révélations cachées.

Le site Quartz présente actuellement des **textes et des liens**, pas un personnage IA autonome. Une future expérience de dialogue exigera une fonctionnalité distincte et la définition de son périmètre, sans confondre simulation et canon.


## Procédure d’enrichissement d’un nouvel épisode

1. **Inventorier les sources.** Relever le nom exact, la version, le rôle (source primaire, synthèse ou index), l’intégrité et les limites de chaque document. Les repères de paragraphes restent propres à leur fichier brut ; les tableaux reçoivent des repères distincts.
2. **Lire l’état directeur et les mises à jour récentes.** Commencer par l’index et le registre, puis les compléments les plus récents des volumes concernés. Un état « actif » ancien ne remplace pas une correction plus récente.
3. **Mettre à jour le registre avant de créer des fiches.** Réutiliser les codes existants, chercher les homonymes et noter les variantes. Attribuer un nouveau code seulement après avoir vérifié qu’aucune personne, aucun lieu, objet ou institution ne possède déjà une fiche.
4. **Rédiger les fiches avec leurs preuves.** Pour chaque fait, conserver le statut, la citation, la source, les conditions, les limites et la personne qui connaît l’information en jeu. Séparer scènes jouées, paroles rapportées, déclarations, capacités, projets, contrats, hypothèses et propositions.
5. **Signaler les points ouverts.** Ne résoudre aucune contradiction par vraisemblance seule. Présenter au créateur les décisions qui changent une identité, une filiation, une chronologie, une compétence, une obligation ou le statut d’un projet.
6. **Contrôler les relations et les accès.** Vérifier les liens, les doublons et les catégories. Si une fiche publiée contient des révélations, ajouter `spoilers: true` et `unlisted: true` : la page exige un choix explicite avant lecture et n’est pas indexée. Les pages `content/mj/` reçoivent les deux protections.
7. **Faire une relecture globale avant publication.** Comparer les fiches au registre et aux six volumes, relire les statuts et contradictions, vérifier chaque lien et chaque avertissement, puis publier seulement le lot approuvé.


## Code couleur et publication par état éditorial

Chaque fiche à code stable porte `etat_editorial`, affiché en tête avec un point coloré et un libellé. La couleur ne remplace jamais le texte :

- `valide` — **vert** : faits et sources suffisamment recoupés; aucune question bloquante à arbitrer pour cette version.
- `en_cours` — **jaune** : base fiable, mais mise en place, conséquences, calendrier ou détails restent en cours. Le texte doit distinguer clairement ce qui est acquis de ce qui reste à faire.
- `en_chantier` — **rouge** : contradiction, identité, consentement, preuve ou décision de canon à reprendre. La fiche reste en brouillon et n'est pas publiée.

`publish: true` autorise la mise en ligne d'une fiche verte ou jaune; le jaune doit conserver ses réserves visibles. Les propositions non jouées et les fiches rouges ne sont pas publiées. Les pages à spoilers affichent un avertissement fermé et restent non répertoriées. `visibilite` vaut `publique`, `publique_avec_avertissement`, `a_relire_avant_publication` ou `brouillon` selon l'accès choisi. Le tableau [Suivi éditorial](/suivi-editorial) fournit les liens, points à reprendre et références de source.

## Boucle de suivi

Après chaque nouvel épisode ou correction :

1. **En chantier (rouge)** : isoler le fait qui bloque, la source et la décision requise; ne pas compléter par vraisemblance.
2. **En cours (jaune)** : inscrire ce qui est adopté ou joué, le responsable, les conditions, l'échéance relative et le résultat encore attendu.
3. **Validé (vert)** : recouper noms, relations, sources et renvois, retirer les anciennes étiquettes de brouillon, puis actualiser le tableau.
4. Refaire une lecture transversale des fiches liées et du registre avant toute publication d'un nouveau lot.
