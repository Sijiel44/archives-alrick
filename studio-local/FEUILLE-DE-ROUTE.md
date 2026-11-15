# Feuille de route du Studio MJ

Relevé courant du **15 novembre 2026**. Le découpage reprend le plan directeur et les priorités du Lab du 7 novembre, puis le cadrage **Espaces Univers, MJ et Joueur du 8 novembre**, confirmé par le créateur. La régie sonore a été publiée par la [PR 121](https://github.com/Sijiel44/archives-alrick/pull/121), au commit `1ac3fc8`, avec [déploiement Pages et contrôles publics réussis](https://github.com/Sijiel44/archives-alrick/actions/runs/43748189926). Elle inclut les lots joueur et l’attribution d’objets déjà publiés par la PR 120. Le lot courant est le [fond vidéo choisi](FONDS-VIDEO.md), implémenté sur `codex/fonds-video` et recetté localement. Sa publication est autorisée le 15 novembre ; le [workflow Pages](https://github.com/Sijiel44/archives-alrick/actions/workflows/pages.yml) donne l’état de construction, déploiement et recette publique par version. Le lot suivant reste **Fiabilité**, avec une **séance réelle** à conserver dans la recette.

Les sections datées ci-dessous conservent les états observés lors de chaque lot ; leurs formulations « proposé » ou « non publié » sont historiques. Le tableau courant et les [prochains lots recommandés](#prochains-lots-recommandés) donnent la synthèse actuelle. Le pilote initial du 7 novembre partait de `3252f93c1c1b629286c308378a84abc63d9c628f`, sur le `main` historique `88f774f3d0d6d520d8d11443b72202b9caf4f94b`. Les tests, la publication et la qualification en partie restent trois états distincts.

| Lot | État du pilote | Périmètre et suite |
| --- | --- | --- |
| 0 · Audit et socle | En place | Branche locale, serveur restreint à localhost, IndexedDB transactionnel, aperçu et restauration avec contrôle de révision. Une entrée illisible ne bloque plus l’accès aux campagnes saines. L’adoption des contrats communs reste à arbitrer. |
| 1 · Accueil et navigation | En place | Découverte illustrée, accès à l’univers et au Studio, menus et vues adaptables. Le parcours joueur de découverte est disponible. |
| 2 · Cockpit MJ | En place | Reprise, Préparer → Jouer → Archiver, recherche de scène, improvisation, notes, chronique approuvée. Répertoire filtré PJ, PNJ et créatures sans quitter la scène. Arbitrage M01 et opposition M03 avec décision MJ explicite dans le journal de la scène. |
| 3 · Fresque horizontale | En place | Scènes, ordre, taille des cartes, vue liste, embranchements, repères, références et scènes jouées confirmées. Préparation depuis des jalons, import d’une aventure, mini-carte et filtre par couloir. |
| 4 · Bibliothèque et catalogue | Partiel | 92 références des Archives, ressources de démonstration et variantes locales, rayons, recherche, filtres, cartes et liste, raccourcis Markdown. Imagerie accepte les liens HTTPS et leurs crédits. L’interopérabilité INDEX et les sources communautaires restent à instruire. |
| 5 · Ateliers et Atlas | Partiel | Douze modèles de fiches privées, Atlas hiérarchique, liens Markdown et repères. Création et import M04, lecture M05 et cibles M03. Les aventures peuvent alimenter la Fresque. Raccord mécanique des créations à développer. |
| 6 · Hub joueur | Partiel | Espace autonome, création guidée niveau 5 et libre de 1 à 25, brouillon local et transport par fichier, répertoire illustré, archivage réversible, panneaux de jeu, inventaire, capacités, historique des 5d6 et sauvegarde personnelle v4. Carnet v1 pour transporter plusieurs fiches après aperçu des doublons. Grimoire personnel de références, notes et favoris de séance. Échanges versionnés et actualisation du PJ de campagne avec rétablissement. Attribution d’une copie d’objet MJ avec relecture et échange expurgé. Progression et pratique mécanique des sorts à développer. |
| 7 · Activités et progression | Partiel | Carnet d’interludes avec cinq types d’activité, rattachement aux scènes et journal privé. Catalogue détaillé, effets du repos, mentors et décisions d’XP restent à intégrer. |
| 8 · Régie audiovisuelle | Partiel | Aperçu et fenêtre séparée pour les scènes, les fiches PJ et les images locales. Carnet d’ambiances et remplacement confirmé dans la même fenêtre. Régie sonore MJ publiée. Fonds vidéo muets choisis avec image de remplacement, aperçu explicite, confirmation, pause/retrait et mouvement réduit : implémentés et recettés localement, publication autorisée suivie par le workflow Pages. La diffusion audio distante reste à développer. |
| 9 · Communauté et modèles | Partiel | Lien Discord dans le parcours Joueurs et le pied de page de l’accueil public. Recherche de table, paquets expurgés, export de modèles, import partiel et circuit éditorial à définir. Les sauvegardes existantes sont des archives privées. |
| 10 · Stabilisation | Partiel | Recettes automatisées du Studio et de Quartz, clavier, largeurs mobiles et restauration dans un profil vierge. Prévoir recette humaine MJ, appareil tactile réel et décision de publication. |

## Lot Espace joueur · 8 novembre 2026

Le lot part de `be42464` sur `main`. L’accueil distingue la découverte de l’univers, le Studio MJ et l’espace joueur. Le navigateur stocke les PJ dans une base dédiée. Les deux outils appellent les mêmes moteurs M01 et M02. L’assemblage statique précise l’extension des imports 5d6 pour que les moteurs se chargent aussi sur GitHub Pages.

| Mission | Avancement |
| --- | --- |
| TABLE-01 · Sauvegardes | Campagnes `chroniques-entre-rives.studio-local` v1 à v19, incluant les métadonnées audio et réglages vidéo privés ; sauvegardes personnelles `chroniques-entre-rives.joueur` v4 avec empreinte, lecture des v1 à v3 et imports historiques PJ `alrick.sheets.v3`. Carnet personnel v1 : sélection de plusieurs fiches et archives, contrôle des doublons et restauration atomique. La restauration joueur crée des copies et conserve leur état d’archive. Une révision divergente entre onglets bloque l’écriture. Le suivi des copies exportées et l’essai en séance restent au lot Fiabilité. |
| TABLE-02 · Visibilité | L’espace joueur utilise son propre stockage. Son export M02 sélectionne les champs de jeu. La projection reste un récepteur dédié, limité aux éléments approuvés dans la régie. |
| TABLE-03 · Création autonome | Parcours guidé au niveau 5, création libre de 1 à 25, histoire et liens facultatifs, aperçu avant enregistrement. Brouillon persistant avec portrait, reprise et fichier personnel après aperçu. Conversion atomique en personnage M02 vérifié. Qualification en table à réaliser. |
| TABLE-04 · Fiche de jeu | Sept panneaux accessibles au clavier, PV et mana ajustables, inventaire recherché et modifiable, références d’objets du catalogue et adaptations de table, marquage descriptif des objets portés, recherche des capacités, grimoire des références du catalogue, jets libres et d’action, historique des 50 derniers jets consignés et notes privées. Attribution d’une copie d’objet MJ disponible. Apprentissage et pratique mécanique des sorts, effets de l’équipement à intégrer séparément. |
| TABLE-05 · Échange | Aller-retour joueur/MJ par fichiers versionnés, identité stable, comparaison et divergence signalée. Nouvelle copie par défaut ou actualisation explicite du PJ de campagne avec liens conservés, versions privées consultables et rétablissement. Répertoire et archivage réversible des copies personnelles ; qualification en table à prévoir. |
| TABLE-06 · Régie des participants | Répertoire de séance, filtres de type et de contexte, recherche, navigation clavier et lecture mobile. Fiches et commandes natives réutilisées ; relecture explicite après changement dans un autre onglet. Qualification en séance à réaliser. |
| TABLE-07 à TABLE-09 | Paquets d’aventure `chroniques-entre-rives.aventure` v1, étude des tables synchronisées et enrichissement de l’univers se poursuivent séparément. |

La revue du 10 novembre retrouve 39 PR ouvertes. Leurs listes de fichiers ne recoupent ni les fichiers de ce lot ni les modules historiques qu’il utilise. La recette vérifie la création guidée, les niveaux libres 1, 5, 10, 15, 20 et 25, l’ajout d’un objet, la lecture d’une capacité, l’aller-retour dans un profil vierge et l’import MJ. Les cas de confidentialité, fichier altéré, version inconnue, extensions personnelles, transaction interrompue et conflit entre onglets sont couverts. Le texte divergent peut être téléchargé dans une sauvegarde personnelle.

Le lot a été contrôlé dans Chrome et Edge, au clavier et sur des largeurs de 320 à 1 440 px. L’assemblage Pages fait l’objet d’une recette navigateur distincte. La validation en séance et sur appareil tactile réel reste à réaliser.

## Amélioration du parcours joueur · 10 novembre 2026

La carte Personnage de l’accueil ouvre directement la création. Les autres accès déplient les accords de table et l’exemple 5d6. L’espace joueur réutilise l’illustration du pont, présente le portrait sur la fiche et affiche cinq dés après le lancer. Les animations d’entrée sont brèves et respectent la préférence de mouvement réduit.

Le portrait utilise le champ historique `sheet.portrait`. Le fichier JPG, PNG ou WebP est réduit à 320 pixels sur son plus grand côté et encodé en JPEG dans la fiche. La limite de 3 Mio à l’entrée et celle de 180 000 caractères pour le portrait suivent l’Atelier historique. Les liens HTTPS directs sont également acceptés. La sauvegarde personnelle v1 conserve les données de la fiche, et l’export M02 sélectionne le portrait valide. Une panne d’image affiche un remplacement, et une interruption d’enregistrement laisse le choix du portrait dans le formulaire pour réessayer.

La création libre présente la base de 12 points, les dépenses et les points disponibles au niveau choisi. Les coûts et bonus proviennent de M01/M02, y compris le prix du rang suivant. Les maîtrises sont classées par usage. Les domaines ajoutés par le joueur restent des propositions de spécialisation à valider avec le MJ. Un mentor, une école et un apprentissage peuvent être déclarés dans l’histoire personnelle.

La suite complète passe 63 tests dans Chrome, avec la recette Pages exécutée séparément et réussie. Les six scénarios ciblés Accueil/Joueur et la recette Pages passent également dans Edge. `npm test` réussit. Les nouveaux contrôles couvrent l’entrée depuis la carte Personnage, les portraits par fichier et par lien, leur restauration, le refus d’un format ou protocole incompatible, le retrait, la reprise après interruption d’écriture, les coûts affichés, les domaines personnalisés et le mouvement réduit.

### Avis MATH et prochain lot de règles

MATH a été consulté à la demande du créateur. Son avis recommande des crédits d’achat pour étudier la dotation initiale et les paliers, avec un suivi dédié. Le moteur actuel accorde 0, 24, 54, 84, 114 et 144 points de développement aux niveaux 1, 5, 10, 15, 20 et 25, en plus des 12 points de caractéristiques de départ. Les maîtrises sont payées dans ce budget commun.

La proposition de travail prévoit deux crédits de maîtrise au départ et deux aux paliers 5, 10, 15, 20 et 25. Le montant, les paliers définitifs et le traitement d’un personnage créé directement à haut niveau restent à décider. Les crédits et les rangs ont des valeurs différentes aux rangs élevés. Le mentorat devra conserver le mentor, le domaine, la période d’apprentissage, le coût, la décision MJ et un identifiant d’acquisition unique. Le contrat de sauvegarde et l’échange joueur/MJ devront transporter ces décisions avant qu’elles deviennent des gains mécaniques.

Cette tranche améliore la création avec le budget M02 existant. Les dotations et acquisitions par mentor constituent un prochain lot mécanique à examiner. L’échange de mises à jour entre copies joueur et MJ reste également prévu dans TABLE-05.

## Poste de jeu joueur · 12 novembre 2026

Le créateur a confirmé le cadrage du 8 novembre comme source de référence. Cette tranche poursuit TABLE-04. Le poste joueur utilise six panneaux, une sélection de personnage latérale sur ordinateur, un en-tête compact pendant le jeu et une navigation au clavier avec les flèches, Début et Fin. Les liens directs ouvrent le panneau visé. Les caractéristiques et les maîtrises disposent de cartes et de repères visuels. Sur téléphone, les six onglets restent visibles sur deux rangées et l’en-tête du personnage est compact.

L’inventaire reprend les catégories de l’Atelier historique. La recherche porte sur le nom, la catégorie et la description. Le filtre distingue les objets portés. Les détails permettent de modifier la quantité et les champs descriptifs, puis de sauvegarder ou de retirer l’objet après confirmation. Les autres champs d’une entrée existante sont conservés. Les entrées illisibles restent dans la sauvegarde personnelle. Les longues listes se chargent par groupes de 30 résultats. Le marquage d’équipement est descriptif et les effets se décident avec le MJ.

Un jet libre ou d’action peut être consigné explicitement avec ses cinq dés, son résultat, ses modificateurs, un intitulé et une date. L’historique conserve les 50 derniers jets consignés. Une interruption laisse le dernier résultat affiché et permet de réessayer son enregistrement. Un résultat déjà consigné est reconnu dans la même fiche. Les capacités sont recherchables et leurs sources et limites restent consultables.

La sauvegarde personnelle `chroniques-entre-rives.joueur` v2 ajoute le journal des jets au contenu vérifié par empreinte. Les fichiers v1 et les exports PJ M02 restent lus par des adaptateurs. La base IndexedDB conserve son nom et passe à la version 2 pour fermer les anciennes connexions avant les nouvelles écritures. Les personnages locaux sont repris. L’export M02 destiné au MJ contient le marquage de l’équipement et conserve sa sélection de champs partageables. Les notes et l’historique personnel restent dans la sauvegarde du joueur.

La branche `codex/espace-joueur` part de `3674e35` pour ce lot. Le `main` distant reste à `be42464`. Les listes de fichiers des 39 autres PR ouvertes ont été contrôlées le 12 novembre et ne touchent aucun fichier du Studio ni son assemblage Pages. Le lot poursuit la proposition de la PR 112.

La suite du Studio passe 67 tests dans Chrome, avec la recette Pages exécutée séparément. Huit scénarios Joueur et Séance passent dans Edge. `npm test`, l’assemblage Pages, ses liens et sa recette navigateur dans Chrome et Edge réussissent. Les vérifications ajoutées couvrent la sauvegarde v1, une base locale v1 encore ouverte, les champs inconnus d’objets, une modification périmée, l’interruption et le réessai d’un jet, la conservation de la maîtrise sélectionnée et d’une saisie de PV en cours, la restauration privée, la limite des 50 entrées et le refus de dés invalides. Les panneaux et commandes tactiles ont été contrôlés de 320 à 1 440 px. Le rendu final a été inspecté à 390, 768 et 1 440 px. La recette en partie et sur appareil tactile réel reste à réaliser.

La prochaine tranche prioritaire est TABLE-05, avec identité des copies joueur/MJ, comparaison des versions et décision explicite lors d’un échange. Le grimoire et les brouillons persistants de création restent également prévus. Les dotations de maîtrise et le mentorat demeurent l’étude de règles décrite ci-dessus.

## Échanges joueur / MJ · 14 novembre 2026

L’audit reprend la branche propre `codex/espace-joueur` à `88093e2`, la PR 112 ouverte et `main` à `be42464`. Les 39 autres propositions ont été contrôlées par leurs listes de fichiers ; aucune ne touche le Studio ou son assemblage Pages. Le créateur demande de revoir le rendu, de poursuivre les missions du cadrage du 8 novembre et de mettre les modifications en ligne.

TABLE-05 dispose d’une première tranche d’échange dans les deux sens. Le format identifié `chroniques-entre-rives.echange-pj` v1 réutilise la sélection M02 historique, l’identité de la source et une empreinte de version. Le fichier reçu est vérifié puis comparé à une copie locale de même identité. Les divergences et les versions identiques sont indiquées. L’adoption nécessite une confirmation et crée une nouvelle copie. Chez le joueur, elle reprend les notes, les jets et les extensions personnelles de la copie comparée. Chez le MJ, le participant précédent et ses liens restent en place. La mise à jour en place reste un lot distinct, notamment pour la continuité du journal des PV. [Contrat v1](ECHANGE-PJ.md)

L’export MJ dispose d’un aperçu spécifique et utilise les PV courants après une opposition réellement consignée. Il sélectionne une seule fiche et refuse un aperçu périmé. Les champs privés et les données des autres participants sont exclus. Les anciennes sauvegardes restent lisibles et conservent le suivi de version dans les extensions de la source. Une transaction interrompue ou une comparaison périmée laisse l’aperçu disponible et n’ajoute aucune copie partielle.

Le rendu joueur a été revu sur ordinateur et téléphone : en-tête mobile plus compact, commande de portrait d’au moins 44 px, provenance et choix du fichier repliables, comparaison par groupes et commandes d’importation conservées au bas de l’aperçu. Les valeurs complexes se lisent avec leurs noms et leurs descriptions.

La suite du Studio compte 71 scénarios réussis dans Chrome, avec la recette Pages séparée. Les 14 scénarios ciblant joueur, séance, M02 et échange passent dans Edge. Les nouveaux cas couvrent l’aller-retour dans les deux sens, les sauvegardes restaurées dans des profils vierges, les champs privés, les copies précédentes, les liens de scène, les divergences, les versions futures et les empreintes altérées. Les comparaisons sont contrôlées de 320 à 1 440 px. L’essai humain en partie et sur appareil tactile réel reste à réaliser.

La suite de TABLE-05 doit permettre au MJ de rattacher une version approuvée au participant existant en préservant ses références et la cohérence de ses PV historiques. Le grimoire, les brouillons persistants et le poste de séance TABLE-06 restent prévus. Le lot ne modifie aucune règle 5d6 ni aucun élément de canon.

## Actualisation du PJ de campagne · 14 novembre 2026

Le lot part de `4eb42a3`, version publiée et fusionnée de la PR 112, sur `codex/pj-mises-a-jour`. Le dossier était propre. Les 39 autres propositions ouvertes ont les mêmes têtes que lors du contrôle précédent ; leurs listes de fichiers ne recoupent pas le Studio. Les dépendances et les moteurs natifs restent inchangés. Le prochain besoin concret est de recevoir un état de PJ sans recréer un participant ni rattacher ses scènes à la main.

Le MJ choisit désormais **Actualiser le PJ comparé** après chargement d’un échange v1 de même identité. Le choix par défaut reste une nouvelle copie. Le nom, le profil et les ressources reçus deviennent actifs après comparaison et confirmation. Le participant garde son identifiant, ses notes MJ, ses références et ses scènes. Une version identique ne produit pas d’actualisation inutile.

**Versions** ouvre les états conservés depuis la liste des PJ ou leur fiche. Chaque changement garde le nom, la source complète et les PV effectifs précédents. Le MJ peut consulter cet état puis le rétablir explicitement. Le rétablissement crée une autre entrée, garde les notes et les liens, et conserve les combats ultérieurs. Il indique les transitions de PV sans réécrire les événements passés.

La sauvegarde privée v17 conserve ces versions et leur position dans le journal de jeu. Les anciens combats sont vérifiés avec leur ancien profil, même si la protection ou le niveau ont changé. Les actions suivantes partent des nouvelles ressources approuvées. Les formats v1 à v16 restent lisibles. Les versions personnelles joueur v2 et les échanges v1 restent inchangés, et les états précédents ne sont pas transmis au joueur. Les écritures périmées, trop volumineuses ou interrompues conservent les données enregistrées et l’aperçu. Les anciens états ne sont jamais éliminés automatiquement. [Contrat détaillé](ECHANGE-PJ.md)

La recette ajoute trois scénarios : combats avant et après échange puis rétablissement et restauration ; interruption et concurrence entre deux onglets ; contrôle des identités, budgets, répétitions et sauvegardes falsifiées. Le scénario de combat change réellement la protection, afin que la restauration échoue si un ancien impact est recalculé avec le profil courant. L’assemblage Pages couvre également une actualisation sans nouveau participant. L’essai en partie et sur appareil tactile réel reste à réaliser.

`npm test` réussit. La suite complète du Studio passe 74 scénarios dans Chrome ; la recette Pages est exécutée séparément et réussit dans Chrome et Edge. Les neuf scénarios ciblés M02, échange et actualisation passent dans Edge. Le catalogue conserve ses 92 références sourcées. Les formulaires sont contrôlés de 320 à 1 440 px, et l’historique a été inspecté à 390 et 1 440 px avec une campagne fictive.

La suite prioritaire est TABLE-06 : faciliter le passage entre les fiches PJ, PNJ et créatures pendant la séance en conservant la scène courante. Le grimoire, les brouillons de création et les décisions de progression restent prévus. Ce lot est préparé pour relecture, sans signal de publication supplémentaire.

## Répertoire des participants en séance · 14 novembre 2026

Le lot TABLE-06 part de `c538196`, tête de la [PR 113](https://github.com/Sijiel44/archives-alrick/pull/113), sur `codex/regie-participants`. La proposition dépend donc de l’actualisation des PJ préparée dans cette PR. Le dossier était propre au départ. Les 39 autres PR ouvertes gardent leurs têtes précédemment contrôlées et ne recoupent pas les fichiers du Studio. Aucun paquet ni moteur de règles n’est ajouté.

**Répertoire de séance** complète le dialogue de fiche existant. Il réunit les PJ, les PNJ et les créatures de la campagne courante, y compris les créations descriptives. Les filtres distinguent les participants de la scène et les autres fiches de campagne. La recherche accepte plusieurs mots et ignore les accents ; elle porte sur le nom, le type, le métier, le rôle et la description, sans utiliser les notes ni l’histoire privée comme résultats de recherche.

La fiche reste à côté du répertoire sur ordinateur ; les deux vues alternent sur téléphone. Les listes longues se chargent par groupes de 30. Les commandes précédente/suivante parcourent tous les résultats, et la liste se parcourt au clavier. Le retour rend le focus à la scène. Le choix et les filtres restent en mémoire dans l’onglet et sont réinitialisés lors d’un changement de scène ou de campagne.

Consulter une fiche ne change ni les participants, ni les PV, ni la sauvegarde, ni la projection approuvée. Les commandes réutilisent les outils natifs existants. Un changement annoncé par un autre onglet bloque ces commandes jusqu’à la relecture explicite. Si la scène courante a changé, le dialogue se ferme sur le nouveau contexte. Le répertoire reste privé MJ ; aucun nouveau format d’export ou stockage synchronisé n’est créé.

Le journal des oppositions utilise aussi le profil historique de la cible pour afficher un ancien impact. Cela complète la validation de sauvegarde de la PR 113 : la protection affichée reste celle de l’action même après actualisation ou rétablissement d’un PJ. Le test de combat vérifie cette valeur dans le journal.

La recette couvre la consultation sans écriture, les types et contextes, les fiches descriptives, les longues listes, le clavier, les largeurs de 320 à 1 440 px, la concurrence entre onglets, la scène vide et les noms contenant du balisage. Un scénario distinct vérifie que la projection ne contient que les champs approuvés et reste inchangée pendant la consultation d’un autre participant. La recette Pages exerce également ce répertoire sur le site assemblé. L’essai en partie et sur appareil tactile réel reste à réaliser ; la proposition n’ajoute aucune autorisation de publication.

`npm test` réussit. La suite complète du Studio passe 79 scénarios dans Chrome, avec un scénario Pages ignoré dans cette commande puis exécuté séparément et réussi. Dans Edge, les 12 scénarios ciblés répertoire, M02, actualisation et projection ainsi que la recette Pages réussissent. Les trois vues ordinateur, répertoire mobile et fiche mobile ont été inspectées avec une campagne fictive. Aucun fichier de campagne réelle n’est inclus.

## Grimoire personnel de références · 14 novembre 2026

Le lot part de `84e6927`, tête de la [PR 114](https://github.com/Sijiel44/archives-alrick/pull/114), sur `codex/grimoire-joueur`, avec un dossier propre. Les lots précédents apportent déjà les sauvegardes, la fiche joueur, les échanges et le répertoire MJ ; les nouveaux parcours les réutilisent. La liste complète des fichiers des 39 autres PR ouvertes a été relue : aucun recoupement avec les fichiers de ce lot. Aucune dépendance n’est ajoutée. Le prochain besoin de TABLE-04 est de retrouver les sorts sans quitter sa fiche et sans confondre une référence avec une acquisition mécanique.

Le septième panneau **Grimoire** présente les six sorts de démonstration du catalogue commun. La recherche ignore les accents, et les filtres distinguent les domaines, les Cercles indiqués et les collections personnelles. Les descriptions, coûts de base, limites et sources gardent leurs versions et statuts. Les références sur les écoles et les pratiques sont accessibles dans un volet distinct. Le panneau ne publie aucune création privée, n’attribue aucun Cercle et ne dépense pas de mana.

Chaque personnage conserve jusqu’à 80 références avec ses notes et un favori de séance. Les listes longues se chargent par groupes de 12. Les références absentes du catalogue et leurs extensions restent lisibles ; un changement de source est signalé et le rattachement à la nouvelle version nécessite un choix explicite. Le bloc historique expérimental `sheet.grimoire` reste intact, distinct de ces repères personnels.

La sauvegarde personnelle v3 ajoute `grimoire` à côté de `sheet`, `notes` et `rolls`. Les v1 et v2 restent importables ; la mise à jour reprend aussi les bases joueur précédentes. La restauration ajoute une copie. Les échanges v1 et l’export M02 excluent les repères privés, et une adoption reporte ceux de la fiche comparée sur la nouvelle copie. Les transactions gardent la révision attendue et le brouillon en cas d’interruption ou de conflit. Les sauvegardes de campagne v17 et les moteurs natifs ne changent pas. [Contrat du grimoire](GRIMOIRE-JOUEUR.md)

Les cinq nouveaux scénarios couvrent la consultation sans écriture, les filtres et la navigation au clavier, les petites résolutions, la conservation du profil historique, les références anciennes ou absentes, les extensions, la restauration dans un profil vierge, les bases précédentes, la limite de 80, la pagination, l’interruption et la concurrence. Les deux exports sont contrôlés et les repères privés se retrouvent après adoption d’un échange. L’assemblage Pages exerce également le panneau et le format v3. La qualification en partie et sur appareil tactile réel reste à faire.

`npm test` réussit. La suite complète du Studio compte 84 scénarios réussis dans Chrome ; Pages est ignoré dans cette commande puis exécuté séparément et réussi dans Chrome et Edge. Les 17 scénarios ciblés joueur, grimoire et échanges passent dans Edge. Après ajustement visuel mobile, les neuf scénarios grimoire et séance joueur repassent dans Chrome, puis le site est reconstruit et ses liens contrôlés. Le rendu a été inspecté à 1 440, 390 et 320 px ; les contrôles couvrent les largeurs de 320 à 1 440 px. Aucun essai humain en partie n’est déduit de ces résultats.

## Deux lots de création PJ · 14 novembre 2026

Le départ est `18d81cb`, tête de la [PR 115](https://github.com/Sijiel44/archives-alrick/pull/115), sur `codex/brouillons-pj`, avec un dossier propre. Les parcours de création et les sauvegardes personnelles sont déjà en place ; la reprise d’un formulaire reste le besoin suivant de TABLE-03. La liste complète des fichiers des 39 autres PR ouvertes a été contrôlée sans recoupement avec ces lots. Les lots complètent les composants existants et conservent les moteurs, le catalogue et les versions de sauvegarde des personnages et des campagnes. Aucune dépendance n’est ajoutée.

**Lot A · Reprise locale.** Le créateur conserve automatiquement les valeurs modifiées, même incomplètes, les domaines personnalisés, le portrait préparé et les rubriques dépliées. Le statut distingue une écriture en cours d’une transaction confirmée. La carte de brouillon permet de reprendre depuis l’espace joueur après fermeture. Une reprise exige une nouvelle vérification M02. La création du personnage et le retrait du brouillon partagent une transaction ; un échec ne supprime pas les choix et n’ajoute pas de fiche partielle. Les révisions restent monotones lors d’un retrait.

**Lot B · Transport personnel.** Un fichier `chroniques-entre-rives.brouillon-pj` v1 conserve les choix du formulaire, jusqu’à 512 Kio. L’import vérifie le fichier et propose un aperçu. Le remplacement d’un brouillon existant est explicite ; les PJ enregistrés restent conservés. La copie reçoit une nouvelle identité de création. Les brouillons divergents se téléchargent avant relecture de la version locale. Les fichiers futurs, altérés ou incompatibles sont refusés. [Contrat des deux lots](BROUILLONS-PJ.md)

Les écritures utilisent la base joueur existante en version IndexedDB 4, avec un magasin distinct des PJ. Les fiches et grimoires précédents restent intacts. La sauvegarde personnelle v3, les échanges v1 et les archives de campagne v17 ne changent pas ; un brouillon se transporte séparément. L’ensemble reste local, sans transmission automatique ni attribution de règle ou de canon.

`npm test` réussit. La suite complète du Studio passe 91 scénarios dans Chrome ; Pages est ignoré dans cette commande et exécuté séparément avec succès. Les 21 contrôles ciblés Edge couvrent les brouillons, les créations, le grimoire, la fiche de séance joueur et Pages. Après raffinement de la conversion, onze contrôles Chrome et huit contrôles Edge, dont Pages, vérifient aussi un fichier valide dont les clés JSON ont été réordonnées. L’assemblage est reconstruit et ses liens vérifiés. Le rendu est inspecté à 1 440 et 390 px ; les tests contrôlent les largeurs de 320 à 1 440 px. La qualification en partie et sur appareil tactile réel reste à réaliser.

## Rangement des personnages et des copies · 14 novembre 2026

Le départ est `9c29496`, tête de la [PR 116](https://github.com/Sijiel44/archives-alrick/pull/116), sur `codex/rangement-personnages`, avec un dossier propre. Les créations, les brouillons, les échanges et les fiches de jeu existent déjà ; le lot suivant facilite le choix de la bonne copie et le rangement des anciennes fiches. Les quatre PR précédentes restent des dépendances ouvertes. Les listes complètes de fichiers des 39 autres PR ouvertes ne recoupent aucun des 17 fichiers de ce lot. Aucun moteur ni catalogue n’est reconstruit et aucune dépendance logicielle n’est ajoutée.

**Parcourir mes personnages** présente les portraits, les noms, métiers, niveaux, dates et versions d’échange. La recherche combine les mots en ignorant les accents. Les filtres distinguent activité, archives et ensemble des fiches ; les tris et le chargement par groupes de vingt servent les listes longues. **Voir les copies** utilise l’identité M02, sans fusionner les fiches ni rapprocher arbitrairement les noms. La dernière fiche en activité ouverte est retrouvée à la prochaine visite.

**Archiver cette copie** conserve les données et retire la fiche du sélecteur habituel. L’archive reste consultable et exportable. Sa remise en activité est explicite et rétablit les modifications et les jets. Le stockage contrôle les révisions et refuse aussi les écritures issues d’un onglet périmé. La transaction ne change que le rangement et ses métadonnées ; les profils, notes, objets, grimoires et journaux restent intacts. Aucune copie n’est supprimée ou archivée automatiquement.

La sauvegarde personnelle v4 ajoute `filing` à son contenu vérifié. Les v1 à v3 restent lisibles avec un classement en activité par défaut. La restauration garde le statut d’archive après aperçu ; les échanges excluent ce classement et créent une copie en activité. Les archives ne sont pas proposées comme références à comparer. La base passe en version IndexedDB 5 sans modifier les anciens personnages ni le brouillon. Les formats des échanges, brouillons et campagnes restent inchangés. [Contrat du rangement](RANGEMENT-JOUEUR.md)

`npm test` réussit. La suite complète du Studio passe 97 scénarios dans Chrome ; Pages, ignoré par cette commande, réussit dans une recette séparée. Une première exécution avait dépassé le délai de démarrage d’un navigateur ; le scénario isolé puis la suite complète relancée après la construction passent. Les 30 contrôles ciblés Edge réussissent. Après l’ajustement des filtres mobiles, sept contrôles comprenant le rangement et Pages passent dans chacun des deux navigateurs. L’assemblage final et ses 64 268 liens et ressources internes sont vérifiés. Le rendu est inspecté à 1 440 et 390 px ; les recettes contrôlent les largeurs de 320 à 1 440 px, le clavier, les interruptions d’écriture, les onglets périmés et la migration avec brouillon. L’essai humain en partie et sur appareil tactile réel reste à réaliser. Le lot est proposé après la PR 116, sans fusion ni déploiement.

## Carnet de personnages · 14 novembre 2026

Le lot part de `2c3abee`, tête de la [PR 117](https://github.com/Sijiel44/archives-alrick/pull/117), sur `codex/carnet-personnages`, avec un dossier propre. Les sauvegardes individuelles, échanges, brouillons, grimoires, répertoires et archives sont déjà disponibles dans la chaîne des cinq PR précédentes, encore ouvertes. Le Hub reste partiel : inventaire relié au catalogue, progression et pratique mécanique des sorts demandent d’autres lots. La synchronisation et l’authentification restent à instruire. Les fichiers des 39 autres PR ne recoupent aucun des treize fichiers de ce lot. Les moteurs, les dépendances logicielles et le contenu canonique restent inchangés.

**Sauvegarder mon carnet** transporte les fiches enregistrées et leurs archives dans un fichier personnel distinct des échanges MJ. Les filtres, la recherche et les cases permettent de choisir jusqu’à cent copies, avec un plafond de 20 Mio. Les sélections restent conservées hors du filtre ou de la page affichée. Les notes encore dans le formulaire ne sont ni abandonnées ni enregistrées automatiquement ; le brouillon conserve son transport séparé.

**Restaurer un carnet** vérifie le fichier entier et rapproche les copies par identité M02 et contenu. Les versions différentes sont signalées ; les contenus identiques locaux ou répétés dans le fichier restent décochés par défaut. La confirmation ajoute toutes les copies choisies dans une transaction, sans remplacer les fiches locales. Les archives et les extensions sont préservées. Une interruption annule le lot ; une modification dans un autre onglet impose un nouvel aperçu. Les lectures remplacées ou fermées ne peuvent pas écraser l’aperçu suivant.

Le format `chroniques-entre-rives.carnet-joueur` v1 conserve les cinq champs de la sauvegarde personnelle v4 et ses contrôles. Les formats individuels, brouillons, échanges et campagnes ne changent pas ; la base reste en version IndexedDB 5. Le carnet n’importe aucune campagne MJ et ne synchronise aucune donnée distante. [Contrat du carnet](CARNET-JOUEUR.md)

`npm test` réussit. La suite complète du Studio passe 106 scénarios Chrome ; Pages, ignoré dans cette commande, réussit séparément. Après les derniers ajustements, les neuf scénarios du carnet et Pages passent ensemble dans Chrome. Les quarante contrôles ciblés Edge, comprenant ces mêmes parcours et les régressions joueur, réussissent. L’assemblage final et ses 64 269 liens et ressources internes sont vérifiés. Le rendu est inspecté à 1 440 et 390 px ; clavier, collections longues, largeur de 320 à 1 440 px et absence de défilement horizontal sont contrôlés. L’essai humain en partie et sur appareil tactile réel reste à réaliser. Le lot est proposé après la PR 117, sans fusion ni déploiement.

## Inventaire relié au catalogue · 14 novembre 2026

Le lot part de `3c53fdd`, tête de la [PR 118](https://github.com/Sijiel44/archives-alrick/pull/118), sur `codex/inventaire-catalogue`, avec un dossier propre. Les six lots précédents restent ouverts : échanges, répertoire MJ, grimoire, brouillons, archives et carnet sont déjà développés et réutilisés. Le Hub demeure partiel ; progression, pratique des sorts, modèles MJ et synchronisation demandent des lots distincts. Les fichiers des 39 autres PR ne recoupent aucun des onze fichiers de cette proposition. Aucun moteur, dépendance logicielle ou contenu canonique n’est modifié.

**Objets du catalogue** présente les trois références publiques existantes, leurs catégories, leur statut et leur source épinglée. Le joueur peut préparer une adaptation dans le formulaire d’ajout ou relier un objet déjà saisi sans en changer les autres champs. La confirmation reste celle de l’inventaire. Aucune attribution canonique, fusion de quantité ou modification mécanique n’est automatique.

Les fiches deviennent consultables depuis les lignes d’inventaire et proposent leurs raccourcis Markdown. Une source modifiée est signalée ; son actualisation est volontaire et conserve les extensions. Les références absentes ou futures restent conservées. L’archivage permet la consultation et bloque les changements. La provenance personnelle suit la sauvegarde v4 et le carnet v1, et reste hors des échanges M02/v1. Les garde-fous de révision et de transaction existants protègent les écritures. [Contrat des objets reliés](OBJETS-JOUEUR.md)

`npm test` réussit. La suite complète du Studio passe 114 scénarios Chrome, Pages étant exécuté séparément. Après le renforcement de la conservation des champs historiques, treize contrôles Chrome couvrent les objets, l’inventaire et Pages ; quarante-huit contrôles ciblés Edge réussissent. Une session Edge interrompue par une mise à jour de l’environnement a été relancée entièrement. Le rendu final est inspecté à 1 440 et 390 px ; les recettes couvrent les largeurs de 320 à 1 440 px, le clavier, les sources non masquées par les commandes fixes, les références futures et les champs opaques. L’assemblage final et ses 64 270 liens et ressources internes sont vérifiés. La qualification humaine en partie et sur appareil tactile réel reste à réaliser. Ce lot est proposé après la PR 118, sans fusion ni déploiement.

## Modèles d’objets MJ et publication · 14 novembre 2026

Le lot part de `c647eed`, tête de la PR 119, sur `codex/objets-mj-publication`, avec un dossier propre. Il réutilise les créations Objet, les PJ M02, l’historique v17 et les échanges versionnés. Aucun format ni règle mécanique n’est ajouté. Le créateur demande maintenant explicitement la mise en ligne des lots actuels et du prochain lot : la publication regroupe les PR 113 à 119 et cette attribution, sans intégrer les 39 autres propositions ni changer les contenus canoniques.

Depuis une création Objet de la Bibliothèque, **Attribuer une copie à un PJ** propose une copie à relire. L’attribution conserve le modèle, les champs opaques, les PV effectifs, les liens et les profils historiques des combats. Elle est transactionnelle, protégée contre les révisions périmées et réutilisable après acquittement perdu. La provenance et les identifiants du modèle restent privés. L’échange destiné au joueur s’ouvre après confirmation, avec téléchargement et adoption explicites. [Contrat et parcours](OBJETS-MJ.md)

Le multimédia est cadré séparément dans [le plan de régie](MULTIMEDIA.md) : playlists audio natives côté MJ puis fonds vidéo muets dans le récepteur joueur. Les commandes de lecture, le mouvement réduit, les politiques CSP et les sauvegardes seront traités dans ces prochains lots ; aucun lecteur multimédia n’est annoncé livré ici.

Recette de publication : `npm test` réussit ; la suite complète du Studio passe 121 scénarios Chrome et les 27 contrôles ciblés Edge réussissent, Pages compris. Le parcours Pages est aussi exécuté séparément dans Chrome, avec attribution et échange expurgé. L’assemblage final et ses 64 270 liens et ressources internes sont vérifiés. Les rendus sont inspectés à 1 440 et 390 px ; les tests couvrent les largeurs de 320 à 1 440 px. Les 39 autres PR ne recoupent pas le périmètre de publication. La CI et le workflow Pages doivent réussir avant le contrôle public ; la qualification en partie reste à réaliser.

## Régie sonore MJ · 15 novembre 2026

Le lot part de `6d76fc9`, version publiée de la PR 120, avec un dossier propre, sur `codex/regie-sonore`. Il poursuit le lot 8 sans reconstruire les ambiances ou le récepteur joueur. La bibliothèque de pistes par lien HTTPS, les playlists ordonnées et l’association facultative à la scène courante sont raccordées dans **Jouer**. Un seul lecteur côté MJ offre lecture, pause, arrêt, précédent/suivant, volume et boucle. Aucune ouverture de campagne ni sélection de playlist ne déclenche de chargement distant ou de son. Un changement de scène propose sa playlist sans interrompre la lecture ; un changement de campagne arrête le lecteur. Le raccourci **Régie sonore** et **Arrêter le son** permettent de garder le contrôle depuis les autres vues.

L’extension privée `entreRivesMediaV18` transporte les liens, crédits, playlists et associations dans la sauvegarde v18, sans binaire. Les formats v1 à v17 restent lisibles sans modification destructive. Les références, suppressions, révisions et réessais utilisent les transactions existantes. Modifier une playlist chargée ou ses pistes arrête le lecteur et demande de charger la nouvelle version. La CSP audio du Studio autorise les médias HTTPS, sur localhost comme dans l’assemblage Pages. Les exports joueur, la projection et les règles 5d6 gardent leur contrat. [Guide et limites](REGIE-SONORE.md)

Les fichiers des 39 PR ouvertes ne recoupent pas le Studio. Le raccord des tests navigateur à la CI et à Pages ajoute Playwright en dépendance de développement verrouillée à `1.65.0` ; six propositions historiques touchent `package.json` ou les workflows : #35, #54, #64, #66, #73 et #76. Les changements présents sont additifs et ces propositions ne sont pas intégrées. Leur conciliation reste à vérifier lors de leur reprise. `npm ci` réussit. L’audit npm signale trois alertes héritées concernant `sharp`, `minimatch` et `source-map-js`, à traiter dans un lot de maintenance distinct.

La recette locale finale réussit : `npm ci`, `npm test`, 132 scénarios Chrome sans échec et 21 contrôles ciblés Edge sans échec. La suite Chrome locale comporte 134 scénarios, dont les deux parcours Pages exclus puis exécutés séparément sur l’assemblage ; ces deux parcours réussissent aussi dans Chrome. La génération vérifie 877 pages HTML et 64 271 liens et ressources internes. Les rendus sont inspectés à 1 440 et 390 px, avec recettes clavier et largeurs de 320 à 1 440 px. Une première exécution sous charge a rencontré une erreur de décodage de portrait ; les quatre contrôles isolés puis la suite complète limitée à trois tests simultanés ont réussi sans modification du code des portraits.

Le créateur autorise la publication le 15 novembre. La PR dédiée, la CI, le [workflow Pages](https://github.com/Sijiel44/archives-alrick/actions/workflows/pages.yml) et le contrôle de la version déployée restent à vérifier. La qualification humaine en partie et sur appareil tactile réel reste distincte. Les fonds vidéo, l’import de fichiers locaux et la synchronisation audio ne font pas partie de cette tranche.

## Fonds vidéo choisis · 15 novembre 2026

Le lot part de `1ac3fc8`, version publiée de la PR 121, sur `codex/fonds-video`. Il réutilise l’aperçu de scène, la fenêtre joueur opaque, le contrôle de révision et les transactions. Chaque scène peut conserver une URL HTTPS de vidéo, une image de remplacement obligatoire, la boucle, un assombrissement de 0 à 80 % et un crédit privé. L’enregistrement ne charge et ne diffuse rien. L’aperçu demande **Préparer la vidéo**, puis une confirmation séparée pour ouvrir ou remplacer la présentation joueur. L’affichage vidéo sur cet écran du MJ reste hors de ce lot.

Le fond reste muet, avec pause, reprise et retrait. Le mouvement réduit commence sur l’image avec activation volontaire. Les remplacements préparent le nouveau contenu avant la bascule et contrôlent de nouveau la révision ; les erreurs ou annulations gardent l’ancien affichage, tandis qu’un état périmé déclenche le retrait de confidentialité. Le document des textes reste sans scripts et le récepteur ne reçoit ni notes MJ, ni crédits privés, ni données de campagne. Les sauvegardes v19 conservent uniquement les réglages, avec lecture des versions antérieures.

La recette locale finale réussit : `npm test`, 146 scénarios Studio Chrome sans échec, 34 contrôles ciblés Edge sans échec et trois parcours Pages exécutés séparément dans Chrome sur l’assemblage. Les trois parcours Pages sont exclus de la commande Studio Chrome de 149 scénarios ; ils sont inclus dans la recette Edge. Les cinq scénarios de stockage et neuf d’interface vidéo sont couverts. Le contrôle retrouve 877 HTML, 64 274 liens et ressources et 92 références de catalogue. Les rendus sont inspectés à 1 440 et 390 px ; clavier et largeurs de 320 à 1 440 px sont contrôlés. La publication autorisée suit le workflow Pages et sa recette publique par version. La qualification humaine en partie et sur appareil tactile réel n’a pas été réalisée et reste au lot Fiabilité. [Guide du lot et limites](FONDS-VIDEO.md)

Le créateur demande aussi de préparer la complétion progressive des objets, créatures, sorts, capacités, personnages et lieux. Le [guide d’enrichissement avec ChatGPT et GitHub](ENRICHIR-UNIVERS.md) décrit un parcours par sources, fiches brouillons, liens Markdown et PR. Le catalogue du Studio reste une sélection versionnée de 92 références ; son renouvellement est un prochain lot documenté. Aucun éditeur de canon ni backend ChatGPT n’est livré avec les vidéos.

## Relevé des dépendances du pilote initial

Le `main` distant et le `main` de référence concordent. Les listes de fichiers des 39 PR ouvertes ont été comparées au répertoire `studio-local/` et aux modules historiques de progression, dés, Bestiaire M04 et combat M03 utilisés ici. Aucun fichier commun n’a été relevé dans ce périmètre. Les sources natives restent la référence des calculs. [PR ouvertes](https://github.com/Sijiel44/archives-alrick/pulls) · [Moteur M03 épinglé](https://github.com/Sijiel44/archives-alrick/blob/88f774f3d0d6d520d8d11443b72202b9caf4f94b/quartz/components/scripts/atelier5d6-combat-m03.ts)

| Travaux connexes | Décision pour le pilote |
| --- | --- |
| Passerelle M01/M03 et tables LAN | Les expérimentations #87 et #103 et le pilote LAN #66 restent des références de parité. Le Studio local appelle `resolveCombatM03` et `toDefense` depuis les modules déjà utilisés par le Bestiaire. [#87](https://github.com/Sijiel44/archives-alrick/pull/87) · [#103](https://github.com/Sijiel44/archives-alrick/pull/103) · [#66](https://github.com/Sijiel44/archives-alrick/pull/66) |
| Causalité et stockage | Les candidats #85, #95 et #110 et le prototype #104/#106 utilisent des espaces expérimentaux. Le pilote conserve ses transactions IndexedDB et sa révision attendue pour le journal et l’effet en PV. [#95](https://github.com/Sijiel44/archives-alrick/pull/95) · [#106](https://github.com/Sijiel44/archives-alrick/pull/106) · [#110](https://github.com/Sijiel44/archives-alrick/pull/110) |
| INDEX et ateliers | Les contrats #105/#108 et #102/#107 restent des candidats pour une future passerelle de fiches. Le Studio utilise les identifiants d’instance existants et préserve les profils source. [#105](https://github.com/Sijiel44/archives-alrick/pull/105) · [#108](https://github.com/Sijiel44/archives-alrick/pull/108) · [#107](https://github.com/Sijiel44/archives-alrick/pull/107) |

## Lot livré · opposition M03 dans la scène courante

Le MJ annonce l’enjeu, choisit une cible parmi les profils 5d6 déjà rattachés à la scène et verrouille les paramètres. Il saisit les dés de table ou utilise le lanceur du Studio. L’aperçu distingue le contact, la résistance, la protection, la pénétration et l’impact. Les pertes de PV nécessitent un choix explicite et sont inscrites avec la conséquence dans une seule transaction. La projection joueur garde les champs sélectionnés de la scène.

Le format v8 conserve l’action et la transition de PV. Les archives v1 à v7 restent lisibles. Le périmètre couvre la mêlée, le tir, la magie avec valeurs saisies et l’influence mentale narrative. Les coûts de mana, effets de capacités, soins, corrections de PV et cibles PJ mécaniques sont des lots séparés. Voir le [protocole](PROTOCOLE-JEU.md) et les [tests de recette](tests/opposition.test.mjs).

## Recette de ce lot

- Suite du Studio réussie dans Chrome et Edge, 32 tests par navigateur. Les nouveaux cas vérifient la parité native, la confirmation de l’impact, les réessais, la projection et la restauration dans un profil vierge.
- Suite historique `npm test` réussie. La recette Chrome historique `test:m04:browser` valide 22 scénarios. Le contrôle de génération retrouve les 92 références du catalogue épinglé.
- Rendu inspecté à 1 440 px et 390 px dans Chrome. La recette contrôle le débordement horizontal de 320 à 1 280 px et l’activation au clavier de la confirmation. La qualification humaine en séance et sur appareil tactile reste à faire.

## Fichiers du lot

- Régie et styles dans [app.mjs](app.mjs), [index.html](index.html) et [studio.css](studio.css).
- Adaptateur, libellés, serveur et sauvegarde dans [opposition.mjs](opposition.mjs), [protocole.mjs](protocole.mjs), [serve.mjs](serve.mjs) et [store.mjs](store.mjs).
- Recettes navigateur dans [opposition.test.mjs](tests/opposition.test.mjs) et [accueil.test.mjs](tests/accueil.test.mjs).
- Mode d’emploi et décisions dans [README.md](README.md), [PROTOCOLE-JEU.md](PROTOCOLE-JEU.md), [DECISION.md](DECISION.md), [MISSION-LOT-01.md](MISSION-LOT-01.md) et cette feuille de route.

## Lot livré · fiche PJ mécanique M02

À partir de `929e5f0`, le Studio lit les exports de fiches de l’Atelier historique, contrôle le budget M02 et conserve l’entrée sélectionnée dans l’archive privée v9. Les valeurs servent aux jets et aux oppositions. Les capacités, l’inventaire, le mana et l’XP sont consultables. Les sauvegardes v1 à v8 restent lisibles.

Le `main` distant et les têtes Git des PR connexes #54, #66, #85, #87, #95, #103, #106, #108 et #110 correspondent au relevé précédent. Le quota REST GitHub a empêché de renouveler le recensement exhaustif des PR. [Moteur historique M02](https://github.com/Sijiel44/archives-alrick/blob/88f774f3d0d6d520d8d11443b72202b9caf4f94b/quartz/components/scripts/atelier5d6-m02.ts)

Recette du lot M02. 34 tests réussis sur Chrome et 34 sur Edge, dont le rattachement, la restauration v9 et une opposition avec retrait confirmé de PV. La suite historique et le contrôle du catalogue passent. Un export produit par le bouton de l’Atelier Quartz a été importé dans le Studio. L’aperçu a été inspecté à 1 440 px et la fiche à 390 px.

Fichiers du lot M02. [Adaptateur](pj-m02.mjs), [stockage](store.mjs), [serveur](serve.mjs), [régie](app.mjs), [bibliothèque](bibliotheque.mjs), [interface](index.html), [styles](studio.css), [recette M02](tests/pj-m02.test.mjs), [recette de découverte](tests/accueil.test.mjs), [mode d’emploi](README.md), [protocole](PROTOCOLE-JEU.md), [décision](DECISION.md) et cette feuille de route.

## Lot livré · création guidée du PJ

À partir de `760078d`, **Préparer → Personnages joueurs** propose quatre périodes de vie avec les choix de l’Atelier historique. L’éducation, la lecture, le récit et les liens sont consultables avec la fiche. Le MJ peut revenir sur les choix depuis l’aperçu du budget et valider la création séparément. Le parcours génère un PJ de niveau 5 en v9, avec les mêmes portes de jeu et de restauration qu’une fiche importée.

La recette vérifie la parité du calcul M02, le retour aux choix, la restauration en v9 et la confidentialité du récit dans la projection. Les suites Chrome et Edge passent chacune 36 tests. La suite historique et le contrôle du catalogue réussissent. Le formulaire a été vérifié de 320 à 1 440 px, avec inspection visuelle sur ordinateur et au format téléphone.

Fichiers du lot. [Adaptateur M02](pj-m02.mjs), [régie](app.mjs), [interface](index.html), [styles](studio.css), [recette](tests/pj-parcours.test.mjs), [guide](README.md), [décision](DECISION.md) et feuille de route.

## Lot livré · fiche joueur à présenter

À partir de `b238640`, la régie peut présenter une fiche PJ M02 sur cet écran ou dans une fenêtre locale distincte. Le MJ choisit les champs, compare l’aperçu et déclenche la présentation. La fenêtre ne reçoit que le document expurgé et le signal de retrait. Les choix de présentation restent temporaires.

Les suites Chrome et Edge passent chacune 38 tests. La recette vérifie l’origine opaque de la fenêtre, le refus des accès au stockage, l’égalité entre aperçu et contenu présenté, le retrait manuel et le retrait après sauvegarde dans un autre onglet. Le rendu a été inspecté sur ordinateur et à 390 px. La suite historique et le contrôle du catalogue passent.

Fichiers du lot. [Régie](app.mjs), [génération de la projection](projection.mjs), [serveur](serve.mjs), [fenêtre](joueur.html), [réception](joueur.js), [interface](index.html), [styles](studio.css), [recette](tests/fiche-joueur.test.mjs), [guide](README.md), [décision](DECISION.md) et feuille de route.

## Lot livré · atelier de création et PJ libre

À partir de `cc1299d`, **Créations** rassemble les modèles pour les PNJ, créatures, rencontres, quêtes, missions, aventures, lieux, factions, objets, sorts, rituels et capacités. Chaque fiche rejoint le rayon de son type. Les liens privés et la hiérarchie des lieux sont limités à la campagne. Les raccourcis Markdown fonctionnent aussi dans les repères. Les créations peuvent être préparées, mises de côté et restaurées dans les sauvegardes v10.

La création libre des PJ utilise le budget M02 existant, le choix du niveau, les caractéristiques de départ et finales et les maîtrises. La création suit un aperçu distinct. Les fiches rejoignent les parcours de jeu et de présentation existants.

La recette passe 41 tests du Studio dans Chrome et 41 dans Edge, la suite historique et 22 scénarios du Bestiaire historique dans Chrome. Le contrôle du catalogue retrouve les 92 références. Les formulaires ont été testés de 320 à 1 440 px et le rendu a été inspecté à 390 et 1 440 px. La qualification en séance et sur appareil tactile reste à faire.

Les 39 PR ouvertes sont toujours présentes. Le nouveau contrôle des PR connexes sur les ateliers, INDEX et le stockage ne relève aucun chevauchement dans les fichiers du Studio ou des moteurs M02 et M04 examinés. Les brouillons de contrat restent des références pour la passerelle future. [Ateliers descriptifs](https://github.com/Sijiel44/archives-alrick/pull/90) · [Parcours créateurs](https://github.com/Sijiel44/archives-alrick/pull/100) · [Contrat INDEX](https://github.com/Sijiel44/archives-alrick/pull/105)

Fichiers principaux. [Modèles de création](creations.mjs), [stockage](store.mjs), [catalogue](bibliotheque.mjs), [adaptateur M02](pj-m02.mjs), [interface](index.html), [régie](app.mjs), [styles](studio.css), [recette Atelier](tests/creations.test.mjs), [recette PJ](tests/pj-libre.test.mjs) et [guide](README.md).

## Lot livré · aventure vers la Fresque

À partir de `67b7f5b`, les aventures du MJ peuvent préparer jusqu’à 12 scènes dans une même opération. L’aperçu distingue les champs partageables, les notes privées et les fiches utiles à chaque scène. Les embranchements dans l’ordre sont facultatifs et le point de reprise existant est conservé. La restauration v11 retrouve les scènes, les liens et l’aventure source. Le pilote restaure aussi les archives précédentes.

La recette passe 43 tests dans Chrome et 43 dans Edge, la suite historique et le contrôle des 92 références du catalogue. Les cas ajoutés couvrent le retour aux jalons, les références privées, le refus des doublons, l’interruption d’une sauvegarde et la restauration v11. L’aperçu a été testé de 320 à 1 440 px et inspecté à 390 et 1 440 px. La validation en séance reste à faire.

Le contrôle du 8 novembre retrouve 39 PR ouvertes et le même `main` de référence. Les huit PR connexes contrôlées ne touchent aucun fichier de `studio-local/`. [Prototype de scène](https://github.com/Sijiel44/archives-alrick/pull/98) · [Parcours créateurs](https://github.com/Sijiel44/archives-alrick/pull/100)

Fichiers du lot. [Jalons](creations.mjs), [stockage](store.mjs), [régie](app.mjs), [interface](index.html), [styles](studio.css), [recette](tests/aventure-fresque.test.mjs), [guide](README.md) et [décision](DECISION.md).

## Lot livré · projection de scène dans la fenêtre joueur

À partir de `99c7286`, **Jouer → Présenter** ouvre l’aperçu de la scène courante. Le MJ choisit le titre, le texte ou les deux. Le document présenté est celui de l’aperçu. L’affichage sur place reste disponible. Le changement de scène, le changement de contexte et les sauvegardes retirent la fenêtre.

La recette passe 45 tests dans Chrome et 45 dans Edge, ainsi que la suite historique et le contrôle des 92 références du catalogue. Les nouveaux cas vérifient la sélection, l’origine opaque, le retrait, le secours local et le refus d’un aperçu périmé. L’aperçu a été vérifié de 320 à 1 440 px et inspecté à 390 et 1 440 px. La validation sur un deuxième écran en séance reste à faire.

Le contrôle des cinq PR connexes sur le cockpit et les fenêtres joueur ne relève aucun fichier en commun avec le Studio. Le `main` de référence reste à `88f774f3`. [Cockpit MJ](https://github.com/Sijiel44/archives-alrick/pull/88) · [Tables en réseau local](https://github.com/Sijiel44/archives-alrick/pull/66)

Fichiers du lot. [Régie](app.mjs), [projection](projection.mjs), [interface](index.html), [fenêtre](joueur.html), [réception](joueur.js), [recette scène](tests/projection-scene.test.mjs), [recette du cockpit](tests/sessions.test.mjs), [guide](README.md) et [décision](DECISION.md).

## Lot livré · cartes et portraits à présenter

À partir de `5fdc6dc`, la projection peut montrer une carte ou un portrait seul depuis la bibliothèque, ou une image accompagnée des champs choisis de la scène courante. Les références de la scène servent de suggestions. L’aperçu et la fenêtre isolée utilisent la même copie PNG. La projection est temporaire et reprend le retrait existant.

La recette passe 47 tests dans Chrome et 47 dans Edge, la suite historique et le contrôle des 92 références du catalogue. Les nouveaux cas couvrent la carte seule, le portrait de scène, le chargement annulé, le repli et le retrait. Le rendu a été inspecté dans la fenêtre joueur et au format téléphone. La validation en séance reste à faire.

Le contrôle des cinq PR connexes à la régie ne relève aucun fichier en commun avec le Studio. Le `main` de référence reste à `88f774f3`. [Cockpit MJ](https://github.com/Sijiel44/archives-alrick/pull/88) · [Tables en réseau local](https://github.com/Sijiel44/archives-alrick/pull/66)

Fichiers principaux. [Catalogue](bibliotheque.mjs), [régie](app.mjs), [projection](projection.mjs), [interface](index.html), [serveur](serve.mjs), [fenêtre](joueur.html), [réception](joueur.js), [recette](tests/projection-images.test.mjs) et [guide](README.md).

## Lot livré · carnet d’ambiances de scène

À partir de `d806921`, chaque scène possède un carnet de combinaisons de titre, texte et image. Les entrées se préparent depuis la Fresque ou la scène courante. En séance, le MJ peut les charger dans l’aperçu, ajuster la sélection et décider quand la montrer. Le carnet figure dans la sauvegarde privée v12.

La recette passe 49 tests dans Chrome et 49 dans Edge, la suite historique et le contrôle des 92 références du catalogue. Les nouveaux cas couvrent la portée par scène, la séparation du nom privé et de la projection, les réessais et la restauration v12. Le rendu a été inspecté sur ordinateur et au format téléphone. La validation en séance reste à faire.

Le contrôle des six PR connexes au cockpit, aux créations et à INDEX ne relève aucun fichier en commun avec le Studio. Le `main` de référence reste à `88f774f3`. [Cockpit MJ](https://github.com/Sijiel44/archives-alrick/pull/88) · [Catalogue INDEX](https://github.com/Sijiel44/archives-alrick/pull/108)

Fichiers principaux. [Régie](app.mjs), [interface](index.html), [styles](studio.css), [stockage](store.mjs), [recette](tests/ambiances.test.mjs) et [guide](README.md).

## Lot livré · transitions dans la fenêtre joueur

À partir de `4e6862a`, préparer une ambiance laisse la présentation en cours visible. **Remplacer dans la fenêtre joueur** envoie le nouvel aperçu au canal déjà ouvert. La fenêtre garde le document courant jusqu’au chargement du suivant. Le retrait est possible directement depuis l’aperçu. Une fermeture de la fenêtre rend à nouveau disponible la commande d’ouverture.

La recette passe 51 tests dans Chrome et 51 dans Edge, ainsi que la suite historique et le contrôle des 92 références du catalogue. Les nouveaux cas couvrent l’annulation, le chargement retardé, le remplacement dans la même fenêtre, le retrait et le refus d’un aperçu périmé. Le rendu a été inspecté dans la fenêtre joueur et aux formats ordinateur et téléphone. La validation en séance reste à faire.

Le contrôle des cinq PR connexes à la régie ne relève aucun fichier en commun avec le Studio. Le `main` de référence reste à `88f774f3`. [Cockpit MJ](https://github.com/Sijiel44/archives-alrick/pull/88) · [Tables en réseau local](https://github.com/Sijiel44/archives-alrick/pull/66)

Fichiers principaux. [Régie](app.mjs), [interface](index.html), [styles](studio.css), [fenêtre](joueur.html), [réception](joueur.js), [recette](tests/transitions-joueur.test.mjs) et [guide](README.md).

## Lot livré · mini-carte de la Fresque

À partir de `e41bbd6`, la mini-carte permet de repérer une scène dans l’ordre de préparation, de lire ses embranchements et de rejoindre sa carte. Les repères sont utilisables au clavier et au toucher. La scène courante reste identifiée pendant le repérage.

La recette passe 52 tests dans Chrome et 52 dans Edge, ainsi que la suite historique et le contrôle des 92 références du catalogue. Le nouveau cas utilise 14 scènes et vérifie les deux sens des embranchements, le défilement, le réordonnancement et la conservation du point de reprise. Le rendu a été inspecté sur ordinateur et au format téléphone. La validation en séance reste à faire.

Le contrôle des cinq PR connexes à la Fresque et aux ateliers ne relève aucun fichier en commun avec le Studio. Le `main` de référence reste à `88f774f3`. [Cockpit MJ](https://github.com/Sijiel44/archives-alrick/pull/88) · [Prototype de scène](https://github.com/Sijiel44/archives-alrick/pull/98)

Fichiers principaux. [Régie](app.mjs), [interface](index.html), [styles](studio.css), [recette](tests/fresque-minimap.test.mjs) et [guide](README.md).

## Lot livré · couloirs de la Fresque et parcours publics

La Fresque peut classer les scènes dans des couloirs nommés et les filtrer. La mini-carte garde la lecture des embranchements entre fils. Les sauvegardes v13 incluent ces affectations, et la suppression d’un couloir réattribue ses scènes à **Sans couloir**.

L’accueil guide les lecteurs à travers trois étapes d’Univers et trois étapes Joueurs. Le parcours Univers relie l’Atlas, les habitants et les passages. Le parcours Joueurs va de l’idée de personnage à une première action 5d6. Les deux parcours se lisent dans l’accueil.

La recette passe 53 tests dans Chrome et 53 dans Edge, la suite historique et le contrôle des 92 références du catalogue. Elle vérifie le filtrage, la navigation entre couloirs, la restauration v13 et les liens des parcours. Le rendu a été inspecté sur ordinateur et au format téléphone.

Fichiers principaux. [Régie](app.mjs), [stockage](store.mjs), [accueil](accueil.html), [styles publics](accueil.css), [recette des couloirs](tests/fresque-lanes.test.mjs) et [guide](README.md).

## Lot livré · interludes de campagne

Le carnet est accessible depuis **Préparer** et **Jouer**. Le MJ prépare un repos, un voyage, un entraînement, une recherche ou une autre activité, après une scène ou entre deux séances. Une fois le résultat et sa date saisis, l’interlude rejoint le journal privé dans **Archiver**. La préparation y reste consultable et le résultat peut être corrigé. Les décisions mécaniques restent à la table.

La sauvegarde privée v14 conserve les préparations et les résultats. Les anciens exports restent importables. La chronique destinée aux joueurs garde son texte propre et son approbation séparée. Le contrôle des huit PR connexes au Studio et aux ateliers n’a relevé aucun fichier commun avec le pilote local.

La recette passe 54 tests dans Chrome et 54 dans Edge, la suite historique et le contrôle des 92 références du catalogue. Elle couvre la préparation, la correction d’un résultat, la séparation de la chronique joueur et la restauration en profil vierge. Le rendu a été inspecté aux formats ordinateur et téléphone. La validation en séance reste à faire.

Fichiers principaux. [Régie](app.mjs), [interface](index.html), [stockage](store.mjs), [styles](studio.css), [recette](tests/interludes.test.mjs) et [guide](README.md).

## Lot livré · images par lien

Le rayon **Imagerie** accepte les liens directs HTTPS. Une image peut être indépendante ou illustrer une fiche de campagne. La fiche de l’image conserve le texte alternatif, la provenance déclarée et les crédits. Le Studio charge l’image depuis son adresse et affiche un message si elle est indisponible. La sauvegarde privée v15 conserve les liens et les associations. Les formats précédents restent lisibles.

La recette passe 55 tests dans Chrome et 55 dans Edge. Elle couvre l’affichage du portrait, la réparation d’un lien cassé, la restauration dans un profil vierge et le retrait de l’image. Le rendu a été inspecté aux formats ordinateur et téléphone. [Mode d’emploi](README.md#illustrations-du-studio) · [Recette navigateur](tests/images-par-lien.test.mjs)

## Lot livré · accès aux campagnes saines

À partir de `4913cfb`, le Studio charge les campagnes lisibles et indique le nombre d’entrées illisibles. Cette lecture laisse les entrées en place. Le MJ peut ouvrir, modifier et exporter une campagne saine. Le format d’archive reste compatible avec les sauvegardes v1 à v15. Une panne d’accès à la base entière reste traitée comme une erreur de stockage. [Guide](README.md#sauvegarder-hors-du-navigateur) · [Recette navigateur](tests/recuperation.test.mjs)

La suite complète passe 56 tests dans Chrome et 56 dans Edge. Les cas concernés ont été rejoués dans Edge après l’ajustement du focus à la reprise. Le nouveau scénario vérifie le cas sans campagne lisible, la modification entre deux onglets, la conservation intégrale des entrées rejetées et la restauration d’une campagne saine dans un autre profil. Le rendu a été inspecté sur ordinateur et téléphone. La suite historique et le contrôle des 92 références passent également.

## Lot livré · première aventure importable

Depuis **Préparer** ou **Bibliothèque → Aventures et quêtes**, le MJ choisit un fichier local, consulte son contenu, puis ajoute la fiche d’aventure, ses fiches liées, ses scènes et ses embranchements à la campagne. La copie est enregistrée en une seule opération et conserve le point de reprise existant. Les sauvegardes v16 conservent sa provenance. L’accueil distingue désormais la création d’une campagne de l’import d’un scénario. Les cinq PR connexes examinées ne modifient aucun fichier de `studio-local/`.

*Le Pain des Fidèles* est fourni dans un fichier privé local. Cette adaptation narrative non jouée de Q-DECH-01 propose trois pistes d’enquête, quatre scènes modulaires, neuf fiches et six embranchements. La recette technique couvre l’import, la projection et l’archivage. L’essai en séance reste à faire. [Guide d’import](README.md#importer-une-aventure-prête-à-jouer) · [Recette](tests/import-aventure.test.mjs)

Les suites passent 59 tests sur Chrome et 59 sur Edge, ainsi que la recette historique et le contrôle des 92 références. La recette vérifie le refus des formats et références invalides, l’absence d’écritures partielles, la conservation du point de reprise, la projection sans notes MJ et la restauration v16. Le fichier du scénario a également été importé puis mené jusqu’à l’archive avec des données fictives. L’aperçu a été inspecté sur ordinateur et téléphone. Le serveur local renvoie 404 pour le chemin du fichier MJ.

## Prochains lots recommandés

Le lot courant est le [fond vidéo choisi](FONDS-VIDEO.md), qui suit la régie sonore publiée. Après sa recette et sa publication, le prochain lot est **2 · Fiabilité**. Chaque ligne correspond à un lot utilisable et vérifiable ; aucun calendrier ni achèvement n’est présumé. La préparation de l’enrichissement sourcé peut avancer en parallèle selon [son guide](ENRICHIR-UNIVERS.md), sans publier automatiquement de nouveau canon.

Le lot Fiabilité reprend aussi le diagnostic du portrait joueur : deux contrôles publics ont signalé un `EncodingError` alors que les parcours vidéo et audio réussissaient. La recette attend désormais le chargement complet et conserve la vérification du décodage ; la cause initiale reste non déterminée et ne doit pas être déclarée corrigée sans preuve.

| Ordre | Lot et rattachement | Livraison attendue | Preuve avant clôture |
| --- | --- | --- | --- |
| 1 · Implémenté et recetté localement | **Fonds vidéo choisis** · Régie, lot 8 | URL MP4/WebM directe, aperçu explicite, confirmation, remplacement et retrait dans la fenêtre joueur ; vidéo muette, image de remplacement et commande pause. | Publication autorisée et état du contrôle public dans le workflow Pages. Qualification humaine distincte au lot 2 ; conserver le récepteur opaque et le contenu sans scripts. |
| 2 · Suivant | **Fiabilité, sauvegardes et séance réelle** · TABLE-01, 02, 06 et lot 10 | Date et révision de la dernière copie exportée, rappel en fin de séance et diagnostic volontaire des entrées illisibles. Corriger les trois alertes npm héritées. Faire essayer l’aventure, l’audio et la vidéo à une table. | Export/restauration dans un profil vierge, versions, quota et conflits ; audit après mises à jour ; observations humaines sur téléphone, au clavier et pendant une partie. La séance réelle est une condition de ce lot. |
| 3 | **Indices, quêtes et liens de retour** · Cockpit, Fresque et catalogue | Retrouver « utilisé dans » depuis une fiche ; suivre des indices et objectifs reliés à plusieurs scènes, avec état et décision manuelle. | Liens stables après renommage, plusieurs chemins vers un indice, historique de découverte et sélection explicite de ce qui est partageable. |
| 4 | **Progression et apprentissage** · TABLE-04 et interludes | Décisions MJ liées à une séance, un interlude ou un mentor, avec avant/après, source et rétablissement. | Parité M01/M02, niveaux 1, 5, 10, 15, 20 et 25, absence de double acquisition, sauvegardes et échanges. Les dotations de maîtrise et autres règles encore proposées nécessitent un arbitrage distinct. |
| 5 | **Dossier joueur et paquets de créations** · TABLE-04, 05 et 07 | Fiche imprimable, récapitulatif approuvé et indices révélés ; export/import d’une sélection de créations avec dépendances et provenance. | Aperçu expurgé, refus de dépendance manquante, copie indépendante du modèle et restauration sans écrasement. Les sauvegardes complètes MJ restent privées. |
| 6 | **Atlas avec cartes et repères** · Univers et lot 5 | Épingles liées aux lieux, scènes et fiches, filtres et alternative en liste ; présentation joueur choisie. | Navigation clavier et téléphone, cohérence des identifiants, séparation des repères privés et révélés, image de remplacement disponible. |
| 7 | **Table synchronisée** · TABLE-08, étude préalable | Évaluer les prototypes LAN existants, puis une invitation révocable et une preuve de reconnexion avant toute ouverture. | Hébergement, autorisations par personne, confidentialité, conflits et fonctionnement dégradé testés. GitHub Pages seul ne fournit pas cette synchronisation. |
| En parallèle · Préparation | **Complétion de l’univers et catalogue versionné** · TABLE-09, lots 4 et 5 | Inventorier les références manquantes ; compléter objets, bestiaire, sorts, capacités, personnages et lieux par petits lots sourcés avec ChatGPT/GitHub. Préparer les catégories, liens Markdown et renouvellement contrôlé du catalogue embarqué. | Réutiliser les identifiants, distinguer les statuts et conserver les brouillons `publish: false`. Vérifier sources, liens et accès. Le créateur décide du canon et de la publication ; aucun import implicite des sources privées. |
| En continu | **Qualité UI et parcours de jeu** · lot 10 | Améliorer recherche, navigation, contrastes, mise en page et illustrations utiles selon les gestes observés en partie. | Recettes d’accessibilité, téléphone et clavier ; garder les tâches fréquentes du MJ et les fiches reliées au premier plan. |

Le [plan multimédia](MULTIMEDIA.md) détaille les critères des deux premières tranches audiovisuelles. Le [comparatif en sept langues et les 18 pistes de développement](PISTES-DE-DEVELOPPEMENT.md) reste un inventaire d’idées historique ; plusieurs besoins joueur qu’il décrivait sont désormais implémentés et ne doivent pas être reconstruits.
