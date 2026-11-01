# Contrat éditorial de continuité — Les Archives d’Alrick

## Principes non négociables

1. Le **brut de campagne** est l'archive première ; les six volumes consolidés sont des synthèses et indices ; le site présente un état lisible et sourcé. Un ancien état n'est pas forcément le canon actuel.
2. **Source affichée** pour tout changement de canon : code CB + intervalle de paragraphes quand disponible. Jamais de référence inventée.
3. Ne pas convertir une **intention ou une préparation** en événement joué. Mentionner les suites ouvertes sans les présenter comme des faits acquis.
4. « **Rappelé** » (mort revenu à la vie via Orin) et « **Revenant** » (compagnie d'Orin) sont des champs *indépendants*. De même pour emploi, résidence, allégeance, Maison, parenté et titres.
5. Une nouvelle fiche doit posséder un **code stable et unique**, un titre humain, une catégorie, un état documentaire, et ses sources. Le dossier où elle se trouve n'est pas une preuve de son statut canonique.
6. L'IA prépare des **propositions de modifications** ; la validation éditoriale précède la publication.
7. Le code `CB42` indique une session source ; ne pas le confondre avec une date du calendrier fictif. Les dates de fichiers ne datent pas les événements du monde.
8. Les fiches destinées surtout au MJ peuvent être accessibles aux joueurs sur choix. Toute page avec `spoilers: true` — y compris hors de `content/mj/` — affiche d’abord un avertissement replié derrière une action explicite. Toute fiche à spoilers publiée porte aussi `unlisted: true` : elle reste accessible par son URL et ses liens éditoriaux, mais ne paraît pas dans la recherche, le sitemap ou la bibliothèque générale. Les pages de `content/mj/` restent également non répertoriées et averties. Les sources brutes peuvent être archivées dans GitHub après contrôle des droits, données personnelles et secrets réellement réservés au MJ ; leur présence dans `sources/` ne les publie pas sur Quartz. Les sources non autorisées ou les secrets réels restent hors du dépôt public.

## Module de Déchéance — validation de création (29 octobre 2026)

**Nouveau lore explicitement adopté** : la Déchéance comme contre-ascension et la **Pyramide du Tribut des Chutes** ; le répertoire inaugural de **3 Seigneurs et 9 Princes**, sans lien automatique avec les Dix-Huit ou les Archétypes. Les fiches d'univers `MON-DECH-01` et `ANT-DECH-01` portent `canon_statut: lore_valide` car approuvées par le créateur, **pas** `faits_joues`. Elles n'annoncent aucune rencontre ou défaite dans la campagne d'Orin.

Le mini-système optionnel `SYS-DECH-01` est **approuvé comme module de règles** (2d6, Emprise, tribut, repli), pas comme règle rétroactive des scènes CB. Le recueil `Q-DECH-01` est un **ouvrage de scénarios approuvé pour publication** mais reste `canon_statut: proposition_non_jouee` : son contenu n'est ni une chronologie ni un ensemble de faits accomplis.

Les anciens dossiers `*-proposition.md` ou `*-prototype-*.md` non publiés sont **archives de conception**, supplantées par ces quatre fiches pour la Déchéance. Les autres idées sur les Failles, les factions, les avatars et le bestiaire restent proposées et ne sont pas canonisées par contagion.

Pour les pages MJ `ANT-DECH-01` et `Q-DECH-01`, appliquer `spoilers: true`, `unlisted: true` et `visibilite: publique_avec_avertissement` ; aucune annonce de révélations dans les sommaires publics.

## Valeurs permises pour `canon_statut`

- `faits_joues` — événement ou constat attesté en scène ;
- `lore_valide` — ajout de lore explicitement approuvé par le créateur, en distinguant les détails joués des propositions d’ambiance ;
- `declaration` — affirmation d'un personnage, pas garantie que le monde l'ait démontrée ;
- `projet_en_cours` — accord et intention, sans réalisation finale ;
- `hypothese` — explication incertaine ou de recherche ;
- `proposition_non_jouee` — création, scénario ou outil facultatif qui n'est pas un fait joué ; peut être publié dans `content/` si son statut est visible, sa diffusion approuvée et ses spoilers contrôlés ;
- `historique` — ancienne formulation conservée pour traçabilité ;
- `a_verifier` — insuffisamment recoupé pour devenir canon.

Ces valeurs caractérisent une **fiche dominante**. Une page contenant plusieurs types de faits doit aussi distinguer chaque section par une légende explicite. Le statut d'une fiche entière ne rend pas tous ses paragraphes incontestables.

## Modèle conseillé

**Présentation narrative** en tête, **état vérifié** immédiatement dessous, **limites/contraintes**, **éléments ouverts**, **sources**, **liens**. Les gabarits spécialisés enrichissent ensuite l'identité, les relations ou les fonctions, sans changer les champs communs.

## Quatre parcours — même source, différents usages

Les Archives proposent désormais quatre portes d'entrée, sans dupliquer le canon : **Univers** (socle partageable), **Odyssée d'Orin** (campagne fondatrice), **Jouer dans ce monde** (aides aux joueurs et MJ) et **MJ assisté par IA** (prompts et procédures de continuité).

Les nouvelles métadonnées sont **recommandées pour toute fiche créée ou révisée à partir de maintenant**. Elles ne sont pas exigées rétrospectivement sur toutes les fiches historiques :

- `portee: "univers_partage"`, `portee: "jdr_alrick"` ou `portee: "campagne_independante"` : à quoi le texte appartient prioritairement ; `mixte` seulement si les parties sont clairement séparées ;
- `campagne_id` : identifiant stable, facultatif et propre à une campagne lorsque `portee` vaut `jdr_alrick`, `campagne_independante` ou `mixte`. Utiliser `odyssee_orin` pour la campagne fondatrice ; attribuer les autres identifiants au cas par cas. Ne pas ajouter ce champ aux fiches générales ni migrer les pages historiques en masse ;
- `public_cible: ["lecteurs", "joueurs", "mj"]` : pour qui la fiche est utile, sans fournir d'autorisation d'accès ;
- `usage_en_jeu: ["reference", "decouverte", "rencontre", "scenario", "chronique", "continuite", "prompt"]` : les usages proposés, indépendants de la vérité canonique ;
- `periode` : préciser l'époque **uniquement lorsqu'elle est connue** ; ne pas déduire le calendrier fictif de la date des messages.

Ces champs **ne remplacent jamais** `canon_statut`, `etat_editorial`, `source_brute`, `spoilers`, `unlisted` ou `publish`. Une page peut offrir des scénarios non joués tout en décrivant des faits canoniques, si chaque partie porte clairement son statut. Les pages généralistes peuvent pointer vers des événements de campagne avec avertissement ; elles ne doivent pas révéler implicitement les secrets dans leur titre ou leur résumé.

### Les trois couches documentaires

- **Univers partagé** (`portee: "univers_partage"`) : faits et lore réutilisables du monde. L'absence d'apparition en jeu n'empêche pas l'approbation canonique.
- **Odyssée d'Orin** (`portee: "jdr_alrick"`, `campagne_id: "odyssee_orin"`) : séances, décisions et conséquences réellement jouées, plus les projets explicitement distingués. Une création nouvelle ne s'ajoute pas rétroactivement au journal.
- **Campagnes indépendantes** (`portee: "campagne_independante"`, `campagne_id` propre) : continuité locale de chaque table. Un fait joué dans une campagne n'est pas automatiquement un fait du monde ni de l'Odyssée.

Une fiche de l'univers peut être liée depuis plusieurs campagnes : ne pas la dupliquer pour chaque table. Séparer les décisions de canon, de publication et d'attestation d'un fait joué. Exemple : une cité approuvée peut être `lore_valide` sans avoir été visitée par Orin ; un scénario public et facultatif peut être `proposition_non_jouee` ; une découverte jouée dans une autre table reste liée à son `campagne_id`.

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

`publish: true` autorise la mise en ligne d'une fiche verte ou jaune; le jaune doit conserver ses réserves visibles. Une `proposition_non_jouee` peut aussi être publiée comme scénario, aide ou outil facultatif si ce statut est explicite et la diffusion approuvée. Les fiches rouges (`en_chantier`) ne sont pas publiées. Ces décisions ne valident pas le lore et ne certifient aucun événement joué. Les pages à spoilers affichent un avertissement fermé et restent non répertoriées. `visibilite` vaut `publique`, `publique_avec_avertissement`, `a_relire_avant_publication` ou `brouillon` selon l'accès choisi. Le tableau [Suivi éditorial](/suivi-editorial) fournit les liens, points à reprendre et références de source.

## Boucle de suivi

Après chaque nouvel épisode ou correction :

1. **En chantier (rouge)** : isoler le fait qui bloque, la source et la décision requise; ne pas compléter par vraisemblance.
2. **En cours (jaune)** : inscrire ce qui est adopté ou joué, le responsable, les conditions, l'échéance relative et le résultat encore attendu.
3. **Validé (vert)** : recouper noms, relations, sources et renvois, retirer les anciennes étiquettes de brouillon, puis actualiser le tableau.
4. Refaire une lecture transversale des fiches liées et du registre avant toute publication d'un nouveau lot.


## Lot documentaire suivant — Grandes Puissances et passages (29 octobre 2026)

**MON-005** (Dix-Huit Grandes Puissances, Bible V01 B39-05/B39-06) et **MON-PASS-01** (six catégories de passages, V01 S09 p. 12, 85–87) sont deux **fiches `lore_valide` approuvées** et publiables, sans secrets nouveaux de l'Odyssée.

Le total passe à **177 fiches codées approuvées**. Ce nouveau lot **ne canonise pas** les systèmes de fermeture des Failles, la fréquence d'apparition, les factions antagonistes en atelier ni les scénarios non joués. Les anciens dossiers de travail non publiés doivent rester `publish:false`.

Le contrôle `npm test` vérifie le contenu, les types, la génération Quartz, les liens et les protections anti-spoilers dans les pages construites, **pas le déploiement externe**. Vérifier GitHub Pages séparément.


## Publication pilote des règles 5d6 et de leur atelier (29 octobre 2026)

Le créateur demande une **page du système** et un **outil interactif avec modes PJ, MJ et MJ assisté par IA**. Publication autorisée pour **essai**, sans validation universelle des calculs : la page `jouer/systeme-5d6-base12` et `jouer/atelier-5d6` sont des **pages non codées** de `canon_statut: proposition_non_jouee` et `etat_editorial: en_cours`. Les **177 fiches codées** approuvées restent inchangées.

Le système 5d6 **n'annule pas** les règles 2d6 du module Déchéance ni les événements et usages attestés de CB1–43. L'atelier produit des fiches locales et des profils fictifs chiffrés, mais **ne lit pas le Compendium depuis le site** et n'atteste aucun rang ou score canonique de personnage.

Les **exports JSON**, les notes MJ stockées localement et les prompts copiés sont sous le contrôle de l'utilisateur. Les données enregistrées dans un navigateur partagé ne sont **pas secrètes** ; ne pas envoyer des secrets d'Odyssée dans un contexte IA sans choix explicite. Aucune API IA n'est appelée.



## Extension pilote 5d6 (réinitialisation, niveaux, références, incidents d12)

**Demande du créateur** : généraliser progressivement le système 5d6 lors de l'édition des fiches et de nouvelles campagnes, introduire des niveaux et voies combinables, ainsi que récompenses et effets aléatoires narratifs. La première **mise en œuvre testable** ajoute ces champs et l'outil de référence sans attribuer de statistiques canoniques aux personnages.

**Une page non codée approuvée comme pilote de travail** : `content/jouer/progression-voies-incidents.md` (`publish:true`, `canon_statut: proposition_non_jouee`, `etat_editorial: en_cours`). Les deux pages 5d6 existantes sont enrichies ; le compteur **177 fiches codées** ne change pas.

**Important** : les classes restent des **voies ouvertes**, le niveau ne donne pas de +1 systématique, l'équipement ne procure pas de bonus plat canonique. Les 48 suggestions d'incidents et les profils JSON d'exemple sont **des inventions expérimentales**, sans valeur de fait joué. La recherche de référence passe par l'index **public filtré** ; les fiches à spoilers et les dossiers MJ doivent rester exclus. Un import de fiche chiffrée ne transforme jamais ses capacités en canon.


## Validation de sources et publication contrôlée — Lot 02 du 30 octobre 2026

Le créateur autorise l'**enrichissement autonome des noms et possibilités de jeu**, à condition de préserver les faits existants et d'éviter les doublons. Cette autorisation **ne vaut pas** création rétroactive de scènes, de liens familiaux, de titres ou de statuts nouveaux pour des personnages déjà joués.

Après lecture directe des documents : `MAG-106` (`faits_joues`, spoilers, `unlisted:true`, CB42 pages source 95–97), `MON-COUR-01` (`lore_valide`, courants et proximités de la Bible V01 Tome III) et `MON-ARCH-01` (`lore_valide`, trois Archétypes et limites du Conseil) sont **explicitement approuvés dans le lot**. Les amorces nouvelles sont identifiées **`proposition_non_jouee` au niveau de leur section**, sans promotion de ces scènes au canon. Les travaux composites sur les Failles restent `publish:false` ; `MON-PASS-01` conserve seul le socle publié.

Le total publié autorisé passe de **177 à 180 fiches codées**. Les fiches à spoilers ne sont ni répertoriées, ni incluses dans l'index de recherche, même si leur URL peut être suivie volontairement après avertissement. Les archives remplacées et les projets de fermeture des Failles demeurent non publiés.


## Extension du 30 octobre 2026 — accès et création non rétroactive

Le créateur autorise la création de personnages, dragons, symboles graphiques et approfondissements originaux **sans validation de chaque nom**, à condition de vérifier les doublons et de conserver la cohérence du monde. **Les codes documentaires ne doivent pas être placés dans les titres publics ou en tête des récits**, mais restent utiles comme identifiants internes, pour les sources et pour le contrôle de version.

**Publication de 18 fiches codées nouvelles :** sept courants (COUR-01 à COUR-07), six Autorités (DIV-13 à DIV-18), trois dragons (DRG-01 à DRG-03), une Faille (MON-FAI-02), Elyra (PER-CB31-ELYRA). Elles viennent s'ajouter aux **180 fiches codées précédemment approuvées**, soit **198**. Elyra, les scènes d'Orin et l'expérience issue de MAG-106 restent sous avertissement et hors index public ordinaire.

Les symboles SVG des courants sont **des repères visuels d'interface**, non des blasons cultuels universels. Les ambitions et votes des sept courants ne deviennent ni lois définitives ni personnages ennemis automatiques.

**Outils proposés en ligne :** `jouer/evenements-aleatoires-failles.md` et `jouer/protocole-failles-guildes.md` (proposition_non_jouee / en_cours). Les Guildes, Heimdall, Níðor et les Grandes Puissances peuvent intervenir, sans réseau omniscient ni fermeture universelle. La Déchéance exige de véritables **Chutes liées** et pas la seule douleur des victimes. L'hypothèse d'une Faille dans le passé de deuil d'Orin n'est **pas canonisée comme événement joué**.


