# Feuille de route du Studio MJ

Relevé du 7 novembre 2026 sur `codex/studio-local-pilote`. Le lot M03 part d’un arbre propre à `3252f93c1c1b629286c308378a84abc63d9c628f`, sur le `main` historique `88f774f3d0d6d520d8d11443b72202b9caf4f94b`. Le découpage reprend le plan directeur et les priorités du Lab du 7 novembre. Les états ci-dessous décrivent le pilote local. La qualification en partie et l’homologation relèvent d’une étape distincte.

| Lot | État du pilote | Périmètre et suite |
| --- | --- | --- |
| 0 · Audit et socle | En place | Branche locale, serveur restreint à localhost, IndexedDB transactionnel, aperçu et restauration avec contrôle de révision. Une entrée illisible ne bloque plus l’accès aux campagnes saines. L’adoption des contrats communs reste à arbitrer. |
| 1 · Accueil et navigation | En place | Découverte illustrée, accès à l’univers et au Studio, menus et vues adaptables. Le parcours joueur de découverte est disponible. |
| 2 · Cockpit MJ | En place | Reprise, Préparer → Jouer → Archiver, recherche de scène, improvisation, notes, chronique approuvée. Arbitrage M01 et opposition M03 avec décision MJ explicite dans le journal de la scène. |
| 3 · Fresque horizontale | En place | Scènes, ordre, taille des cartes, vue liste, embranchements, repères, références et scènes jouées confirmées. Préparation depuis des jalons, import d’une aventure, mini-carte et filtre par couloir. |
| 4 · Bibliothèque et catalogue | Partiel | 92 références des Archives, ressources de démonstration et variantes locales, rayons, recherche, filtres, cartes et liste, raccourcis Markdown. Imagerie accepte les liens HTTPS et leurs crédits. L’interopérabilité INDEX et les sources communautaires restent à instruire. |
| 5 · Ateliers et Atlas | Partiel | Douze modèles de fiches privées, Atlas hiérarchique, liens Markdown et repères. Création et import M04, lecture M05 et cibles M03. Les aventures peuvent alimenter la Fresque. Raccord mécanique des créations à développer. |
| 6 · Hub joueur | Partiel | Espace autonome, création guidée niveau 5 et libre de 1 à 25, panneaux de jeu, inventaire modifiable et filtrable, recherche des capacités, historique des 5d6 et sauvegarde personnelle v2. Progression, grimoire et mises à jour entre les deux espaces à développer. |
| 7 · Activités et progression | Partiel | Carnet d’interludes avec cinq types d’activité, rattachement aux scènes et journal privé. Catalogue détaillé, effets du repos, mentors et décisions d’XP restent à intégrer. |
| 8 · Régie audiovisuelle | Partiel | Aperçu et fenêtre séparée pour les scènes, les fiches PJ et les images locales. Carnet d’ambiances et remplacement confirmé dans la même fenêtre. Retrait depuis la régie et lors des changements de contexte. |
| 9 · Communauté et modèles | Partiel | Lien Discord dans le parcours Joueurs et le pied de page de l’accueil public. Recherche de table, paquets expurgés, export de modèles, import partiel et circuit éditorial à définir. Les sauvegardes existantes sont des archives privées. |
| 10 · Stabilisation | Partiel | Recettes automatisées du Studio et de Quartz, clavier, largeurs mobiles et restauration dans un profil vierge. Prévoir recette humaine MJ, appareil tactile réel et décision de publication. |

## Lot Espace joueur · 8 novembre 2026

Le lot part de `be42464` sur `main`. L’accueil distingue la découverte de l’univers, le Studio MJ et l’espace joueur. Le navigateur stocke les PJ dans une base dédiée. Les deux outils appellent les mêmes moteurs M01 et M02. L’assemblage statique précise l’extension des imports 5d6 pour que les moteurs se chargent aussi sur GitHub Pages.

| Mission | Avancement |
| --- | --- |
| TABLE-01 · Sauvegardes | Campagnes `chroniques-entre-rives.studio-local` v1 à v16, sauvegardes personnelles `chroniques-entre-rives.joueur` v2 avec empreinte, lecture des v1 et imports historiques PJ `alrick.sheets.v3`. La restauration joueur crée une copie. Une révision divergente entre onglets bloque l’écriture. |
| TABLE-02 · Visibilité | L’espace joueur utilise son propre stockage. Son export M02 sélectionne les champs de jeu. La projection reste un récepteur dédié, limité aux éléments approuvés dans la régie. |
| TABLE-03 · Création autonome | Parcours guidé au niveau 5, création libre de 1 à 25, histoire et liens facultatifs, aperçu avant enregistrement. Le brouillon de création entre deux visites reste à prévoir. |
| TABLE-04 · Fiche de jeu | Six panneaux accessibles au clavier, PV et mana ajustables, inventaire recherché et modifiable, marquage descriptif des objets portés, recherche des capacités, jets libres et d’action, historique des 50 derniers jets consignés et notes privées. Grimoire et effets mécaniques de l’équipement restent à développer. |
| TABLE-05 · Échange | Remise d’une copie M02 au MJ testée. Le prochain lot doit relier les copies par une identité et une version, montrer les divergences et permettre au joueur d’accepter un retour du MJ. |
| TABLE-06 à TABLE-09 | Régie des participants, paquets d’aventure `chroniques-entre-rives.aventure` v1, étude des tables synchronisées et enrichissement de l’univers se poursuivent séparément. |

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

## Dépendances et PR

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

Faire essayer l’aventure à une table et relever les gestes qui demandent encore de quitter la scène courante. Rattacher les décisions de progression aux PJ et à leur contexte de jeu. Le [comparatif en sept langues et les 18 pistes de développement](PISTES-DE-DEVELOPPEMENT.md) détaillent les résultats à vérifier.
