# Studio MJ local

Pilote local des Chroniques d’Entre-Rives pour préparer, jouer et archiver une séance. Les campagnes sont enregistrées dans le profil du navigateur à l’adresse ci-dessous. La bibliothèque mêle des fiches de démonstration, une sélection des Archives et des ressources privées du MJ.

[Feuille de route et état des lots](FEUILLE-DE-ROUTE.md)

## Lancer

Depuis la racine du dépôt, avec Node.js 24 installé.

```powershell
node studio-local/serve.mjs
```

Ouvrir [l’accueil de découverte](http://127.0.0.1:4380/accueil) ou [le Studio local](http://127.0.0.1:4380/) dans un profil de test. Garder le terminal ouvert pendant l’utilisation. `Ctrl+C` arrête le serveur. Le serveur écoute sur l’interface locale et sert les fichiers de l’application. Pour retrouver les données, revenir avec le même profil et la même adresse, port compris. Voir [l’audit et le lot Accueil](MISSION-LOT-01.md).

Le Studio existe aussi en version statique sur [GitHub Pages](https://sijiel44.github.io/archives-alrick/studio/). Les campagnes sont enregistrées dans le navigateur à l’adresse utilisée. Pour continuer en ligne une campagne commencée sur `127.0.0.1`, la télécharger dans **Sauvegardes** depuis le Studio local, puis la restaurer dans le Studio en ligne. Les fichiers d’aventure privés se sélectionnent depuis le poste du MJ.

## Préparer une soirée

Sur [l’accueil public](http://127.0.0.1:4380/accueil), le menu **Parcours** mène à **Univers** et **Joueurs**. Le premier relie l’Atlas, la vie quotidienne et les passages entre les mondes. Le second accompagne la création d’un personnage, la préparation du groupe et une première action 5d6. Les étapes se lisent directement dans l’accueil.

1. À l’accueil, créer un one-shot ou une campagne libre et choisir le niveau de départ entre 1 et 25. Le one-shot donne des repères de préparation. Les deux modes utilisent les mêmes fiches.
2. Dans **Préparer**, enregistrer deux personnages. Dans **Bibliothèque**, copier une créature fictive. Modifier son exemplaire de campagne si nécessaire.
3. Créer une scène, cocher les participants et saisir une note privée MJ. Enregistrer, puis passer à **Jouer** pour retrouver la scène active et ses participants.
4. Choisir **Présenter**, cocher le titre ou le texte de la scène et relire l’aperçu avant de l’afficher dans la fenêtre joueur.
5. Fermer et rouvrir le navigateur. Reprendre la campagne depuis l’accueil et vérifier la scène courante.

En cas de conflit entre deux onglets, le premier enregistrement validé est conservé. Garder ou copier le brouillon du second onglet avant de recharger l’état enregistré. Vérifier les changements puis les reporter depuis cet état.

## Préparer dans la Fresque et improviser

- Dans **Préparer**, la Fresque présente les scènes de gauche à droite. La vue liste donne accès aux mêmes commandes. Déplacer une scène change son ordre dans la préparation. La scène courante reste la même.
- Choisir une taille de carte dans la vue horizontale et filtrer les repères par type. **Ajouter un repère** permet de rédiger un indice, un lieu ou une conséquence possible. Rattacher le repère à une scène ou le placer en réserve. Le titre déplie sa fiche, où son emplacement peut être modifié.
- Relier une scène de départ à une scène d’arrivée et, si utile, nommer la condition. Par exemple, relier **Le gué** à **Le sentier des saules** avec la condition « Si le courant monte ». La piste apparaît dans **Jouer** quand la scène de départ est courante. Le MJ choisit quelle scène lancer.
- Dans **Jouer**, rechercher une scène, une fiche de cette campagne ou une référence de la bibliothèque. Ouvrir une fiche depuis les résultats ou choisir une autre scène.
- Les repères de la scène courante sont disponibles dans **Jouer**, dans un panneau privé MJ. Ajouter un repère depuis ce panneau le rattache à la scène par défaut.
- Utiliser **Improviser une scène** pour créer une scène pendant la séance. Choisir de la jouer tout de suite ou de la garder en réserve. Les deux choix l’ajoutent à la Fresque. Les notes et les conditions des liens restent dans la régie MJ.

Ouvrir **Mini-carte de la Fresque** dans **Préparer**. Le losange indique la scène courante et les points signalent les scènes reliées. Choisir un numéro ou utiliser **Scène à repérer** pour lire les embranchements entrants et sortants de cette scène. Sur les repères, les flèches gauche et droite parcourent la Fresque. **Rejoindre la carte** place le focus sur la carte dans la vue horizontale ou la vue liste. **Repérer la scène courante** ramène la mini-carte au point de reprise.

Le repérage est un geste de préparation. La commande **Jouer** sur une carte reste le geste qui change la scène de la partie.

Dans **Couloirs de campagne**, créez un fil narratif, puis choisissez-le dans le menu **Couloir** des cartes concernées. Le filtre affiche ce fil dans l’ordre général de la Fresque. La mini-carte garde tous les embranchements, et **Rejoindre la carte** réaffiche une destination hors du filtre. Pour déplacer les cartes, revenez à **Tous les couloirs**. Supprimer un couloir replace ses scènes dans **Sans couloir**. La sauvegarde v13 conserve les couloirs et leurs affectations.

### Préparer la Fresque depuis une aventure

1. Créer ou ouvrir une fiche **Aventure** dans la campagne. Dans **Scènes ou jalons**, écrire un titre par ligne. La notation `Le gué :: La passe s’ouvre à minuit.` place ce qui suit `::` dans les notes privées. Relier à l’aventure les lieux, PNJ, rencontres ou missions à garder sous la main.
2. Dans **Préparer → Ouvrir les aventures du MJ**, ouvrir la fiche puis choisir **Préparer la Fresque**. Relire la liste et ouvrir l’aperçu. Pour chaque scène, vérifier le titre, compléter au besoin le texte partageable et choisir les fiches à garder dans la régie. Modifier la liste des jalons reconstruit l’aperçu.
3. Choisir si les scènes doivent être reliées dans l’ordre, puis confirmer l’ajout. Jusqu’à 12 scènes sont ajoutées à la fin de la Fresque dans une seule sauvegarde. La campagne conserve son point de reprise ou prend la première scène si la Fresque était vide.
4. Ouvrir **Fiches de préparation** sur une carte de la Fresque ou dans **Jouer** pour retrouver la source et les références sélectionnées. Une aventure préparée donne ensuite accès à **Voir les scènes dans la Fresque**. Les scènes et leurs embranchements se modifient avec les commandes habituelles.

## Parcourir la bibliothèque et l’Univers

1. Ouvrir **Bibliothèque** pour choisir **Atlas**, **Bestiaire**, **Objets et équipements**, **Sorts et rituels**, **Capacités et actions**, **Aventures et quêtes**, **Imagerie** ou **Fiches de campagne**. La barre de recherche de l’accueil interroge toute la bibliothèque. Dans un rayon, elle cherche dans celui-ci. Les résultats peuvent être filtrés par catégorie, type, origine et statut, ainsi que par niveau exact pour les PJ.
2. Dans l’**Atlas**, filtrer par exemple sur **Villes** ou **Villages**. Les plans et cartes se retrouvent aussi dans **Imagerie**, avec les illustrations du Studio. **Univers** sépare les repères de lore sur les Couronnes, les Failles, les peuples et la magie des outils de préparation.
3. Ouvrir **Voir la fiche** pour lire son résumé, son statut, la source et les **Fiches liées**. Une fiche peut porter le statut **Lore validé**, **Fait joué**, **Proposition de jeu** ou **Prototype**, selon son origine. Les sorts repris du Grimoire servent de références de démonstration. Les capacités et rituels sont consultables depuis leurs dossiers de référence.
4. Utiliser **Copier** dans **Raccourci Markdown**. Insérer `[[GEO-013]]`, `[[GEO-013|Dornaël]]` ou `[Dornaël](#fiche/GEO-013)` dans une description de scène, une note de scène ou un repère. La régie ouvre les références connues dans l’aperçu. **Fiche précédente** revient au document consulté avant le lien. Une adresse de type `/#fiche/GEO-013` ouvre aussi directement la référence à l’arrivée dans le Studio.

Les résultats de recherche proposent **Cartes** pour parcourir les illustrations et **Liste** pour comparer des fiches plus compactes. Le Studio mémorise ce choix dans le profil navigateur. Les filtres se replient sur téléphone et leur titre indique combien sont appliqués.

## Réutiliser une fiche en campagne

- Depuis un lieu de l’Atlas, choisir **Créer une variante**. Le bouton **Créer un lieu** ouvre une fiche privée de lieu. Depuis un repère personnel, **Copier comme repère** permet de réutiliser la fiche dans une autre campagne du profil. Choisir une scène ou la réserve. Depuis **Jouer**, la scène courante est proposée par défaut.
- Dans le **Bestiaire**, une créature peut rejoindre la campagne comme exemplaire descriptif. La copie garde l’identifiant et la version de la référence. L’**Atelier du Bestiaire** permet aussi de préparer des profils mécaniques de créature ou de PNJ.
- Retrouver la variante dans la Fresque, en séance ou dans **Fiches de campagne**. Pour modifier l’original d’une autre campagne, ouvrir la campagne source depuis la fiche.

**Créer un repère** ajoute une fiche personnelle à la campagne active. Les notes de PJ et les notes de scène sont consultables dans leurs écrans MJ respectifs. La recherche de la bibliothèque indexe les descriptions des repères, les noms et niveaux des PJ, et les descriptions de créatures.

## Illustrations du Studio

L’accueil présente une vue des rives au crépuscule. **Imagerie** réunit cinq illustrations du Studio, dont la Lamproie de nacre, un schéma régional et les sept plans de quartiers des Archives. Les plans sont des repères schématiques. La fiche d’une copie de créature retrouve l’image de sa référence quand l’identifiant et la version correspondent. Voir les [illustrations et leurs prompts](media/PROVENANCE.md).

Dans **Bibliothèque → Imagerie**, choisir **Ajouter une image par lien** et coller son adresse HTTPS directe. Renseigner le titre, une description courte et, si disponible, le crédit ou la licence. Le champ **Provenance et droits** distingue les créations du projet, les images générées pour lui, les autorisations indiquées et les droits à vérifier.

Choisir **Image indépendante** pour l’ajouter uniquement au rayon ou sélectionner la fiche de campagne à illustrer. Le même formulaire s’ouvre depuis une fiche de PJ, de PNJ, de créature ou une autre création du MJ. La fiche de l’image permet de corriger son lien, de changer sa fiche associée ou de la retirer. Les images par lien s’affichent dans la régie du Studio. La sauvegarde privée v15 conserve leur adresse et leurs crédits. L’image elle-même reste chez son hébergeur. La projection joueur utilise les illustrations locales.

## Composer ou importer un profil 5d6

Dans **Bestiaire 5d6**, choisir **Composer**, saisir le nom, puis sélectionner le type, l’archétype, le rôle et le niveau. **Prévisualiser le profil** utilise le générateur M04 et la fiche M05 d’origine pour afficher les valeurs brutes, les bonus, les PV maximum, le mana, les maîtrises et les défenses. **Importer une fiche** accepte l’export individuel `alrick.bestiary.v1` de l’Atelier historique. Relire l’aperçu avant de cliquer sur **Ajouter à la campagne**. La copie reçoit son identifiant propre et garde le profil source dans la sauvegarde privée.

Dans **Préparer**, ouvrir **Fiche 5d6** à côté du profil ou rattacher celui-ci à une scène. Dans **Jouer**, la fiche d’un participant peut préremplir un jet simple à partir de la caractéristique et de la maîtrise choisies. Le MJ confirme toujours l’annonce et la conséquence. La fiche affiche les résistances et l’absorption M03 pour consultation.

## Appliquer le protocole de jeu

Le bouton **Protocole de jeu** dans **Jouer** et **Consulter le protocole** dans **Préparer** ouvrent le guide de table. Depuis une scène courante, **Arbitrer une action · 5d6** permet d’annoncer l’intention et l’enjeu. Pour un jet simple, saisir le score brut et le rang de maîtrise, puis valider l’annonce avant de lancer les dés du Studio ou de saisir les cinq dés de la table. Le Studio utilise le moteur M01 des Archives. Pour une action certaine ou impossible, choisir l’issue sans jet.

Saisir la conséquence retenue puis l’enregistrer dans le **Journal de jeu** de la scène. Le journal est privé. Pour préparer la prochaine séance, relire les entrées et écrire séparément la chronique destinée aux joueurs. Voir [le protocole et l’inventaire des raccords historiques](PROTOCOLE-JEU.md).

## Créer des fiches pour la campagne

1. Ouvrir une campagne, puis choisir **Créations**. Les modèles couvrent PNJ, créatures, rencontres, quêtes, missions, aventures, lieux, factions, objets, sorts, rituels et capacités. Les rayons spécialisés de la **Bibliothèque** proposent aussi un accès direct à leur modèle principal.
2. Renseigner le nom, les champs propres au modèle et l’état de préparation. Dans l’Atlas, le type de lieu est obligatoire. Choisir au besoin un parent parmi les lieux de la campagne. Les fiches de lieux donnent accès au parent et aux enfants.
3. Ajouter des fiches liées depuis le catalogue ou depuis la même campagne. La fiche enregistrée fournit un raccourci `[[creation-…]]` à coller dans un champ de fiche ou de repère. **Ajouter comme repère** place le raccourci dans la réserve ou la scène courante. Les notes MJ restent dans la fiche privée.
4. Pour un PNJ ou une créature, **Préremplir un profil 5d6** ouvre le Bestiaire 5d6 avec le nom et la description. Confirmer séparément le profil mécanique. Les sorts, rituels, capacités et objets renseignent la préparation et servent de référence à la table. Leur application reste une décision du MJ.

## Importer une aventure prête à jouer

1. Ouvrir ou créer la campagne de destination. Dans **Préparer**, choisir **Importer une aventure**. La même commande est disponible dans **Bibliothèque → Aventures et quêtes**.
2. Sélectionner un fichier `.cer-aventure.json`. Vérifier l’accroche, les scènes, les fiches et les embranchements dans l’aperçu. **Consulter les scènes et les notes privées du MJ** ouvre le dossier de préparation.
3. Choisir **Ajouter l’aventure à la Fresque**. Les scènes et leurs fiches sont copiées ensemble. Le point de reprise est conservé. Si la Fresque est vide, la première scène importée devient le point de reprise. Les cartes et fiches peuvent ensuite être adaptées dans la campagne. Un deuxième import de la même source dans cette campagne est refusé, y compris quand le fichier porte une version de contenu plus récente.
4. Choisir **Jouer** sur la scène voulue. Les fiches de préparation et les conditions des embranchements sont destinées au MJ. La fenêtre joueur reçoit le titre, le texte ou l’image que le MJ sélectionne dans l’aperçu de projection.

Le fichier local *Le Pain des Fidèles* est fourni séparément dans `private/aventures/le-pain-des-fideles.cer-aventure.json`. C’est une adaptation narrative de Q-DECH-01 pour une table débutante, avec quatre scènes, neuf fiches et six embranchements. Le dossier relève d’une proposition non jouée. Les oppositions chiffrées se règlent avec les profils et le module choisis par la table. Garder le fichier dans un emplacement privé, à part des pages distribuées aux joueurs.

### Format du fichier d’aventure

L’enveloppe `chroniques-entre-rives.aventure` en version `1` est limitée à 512 Kio. Elle contient `format`, `version`, `source`, `adventureId`, `creations`, `scenes` et `links`. La source décrit un identifiant de scénario, une version de contenu et une référence documentaire. Les identifiants internes commencent par `creation-<source.id>-`, `scene-<source.id>-` et `branche-<source.id>-`. Ils sont résolus dans la campagne de destination.

Le paquet contient une fiche **Aventure** et jusqu’à douze fiches liées, ainsi qu’une à douze scènes et jusqu’à trente-six embranchements. Les fiches reprennent les champs de l’atelier et les scènes portent `id`, `title`, `description`, `privateNotes` et `referenceIds`. Les embranchements portent `id`, `fromId`, `toId` et `label`. Toutes les références du paquet pointent vers des fiches ou des scènes du même fichier. Les champs inconnus et dépendances manquantes sont signalés avant l’import. Les données importées sont conservées dans la sauvegarde de campagne v16.

## Créer un PJ libre

1. Dans **Préparer → Personnages joueurs**, choisir **Créer un PJ libre**. Le niveau initial reprend celui de la campagne et peut être ajusté de 1 à 25.
2. Répartir 12 points dans les quatre caractéristiques de départ, avec un score de 1 à 5 chacune. Fixer les valeurs finales et les rangs de maîtrise. Le budget s’actualise selon le niveau et les coûts M02. Le métier, le récit, les liens et le but sont facultatifs.
3. Choisir **Vérifier le budget et la fiche**, relire les valeurs, les bonus et les ressources, puis **Créer le PJ**. La fiche est jouable en régie et peut être préparée pour la vue joueur avec la sélection habituelle.

## Créer un PJ par parcours de vie

1. Dans **Préparer → Personnages joueurs**, choisir **Créer par parcours de vie**. Renseigner le nom, les quatre périodes, le mode de transmission et la lecture. La campagne affiche son niveau de départ à côté du niveau 5 du parcours historique.
2. Si utile, écrire l’histoire, les liens et mentors, et le but du PJ. Ces champs décrivent le personnage. Les quatre périodes orientent le calcul natif M02.
3. Choisir **Prévisualiser le PJ**. Relire le budget, les caractéristiques, les maîtrises, les ressources et le récit. **Revenir aux choix** conserve la saisie pour la modifier. **Créer le PJ niveau 5** ajoute la fiche à la campagne.
4. Rattacher le PJ à une scène et ouvrir sa fiche depuis **Préparer** ou **Jouer**. **Parcours et récit** réunit les choix narratifs dans la fiche privée. Le PJ utilise le même format de sauvegarde v9 que les fiches M02 importées.

## Importer un personnage joueur M02

1. Dans **Préparer → Personnages joueurs**, choisir **Importer un PJ M02** puis un export JSON `alrick.sheets.v3` de l’Atelier historique.
2. Sélectionner une fiche. L’aperçu montre les caractéristiques, les ressources, les maîtrises, les résistances, les capacités et l’inventaire. L’Atelier M02 fournit le contrôle de budget.
3. Créer un PJ ou rattacher la fiche à un PJ narratif. Le rattachement conserve le nom, les notes et les scènes. Le niveau vient de la fiche. Seule l’entrée sélectionnée est conservée dans la sauvegarde privée.
4. Dans **Jouer**, ouvrir la fiche d’un participant pour préremplir un jet ou la cibler en opposition. Les PV partent de la valeur de l’export et évoluent après validation du MJ.

## Présenter une scène

1. Dans **Jouer**, choisir **Présenter** dans les actions rapides ou **Préparer la projection** dans le panneau de scène.
2. Cocher le titre, le texte ou les deux. Choisir éventuellement une image dans **Carte ou portrait à montrer**. Les illustrations liées à la scène apparaissent dans le premier groupe. La régie affiche un aperçu de la sélection. Les notes privées, repères et fiches de préparation restent dans la régie.
3. Choisir **Ouvrir une fenêtre joueur** pour la déplacer sur un deuxième écran ou partager cette fenêtre. **Montrer sur cet écran** affiche le même aperçu sur place. Le panneau de scène propose aussi un raccourci d’affichage local.
4. Utiliser **Retirer la scène de la fenêtre joueur** depuis la régie. Le changement de scène, la sortie de **Jouer** ou une nouvelle sauvegarde retirent la fenêtre. Chaque présentation reprend avec les champs décochés.

Pour montrer une image seule depuis **Bibliothèque**, ouvrir une fiche illustrée et choisir **Préparer la projection de l’image**. Relire l’aperçu, puis l’afficher dans la fenêtre joueur ou sur place. Les cartes de l’Atlas et les illustrations locales du catalogue sont disponibles. La projection utilise une image par présentation et le choix est temporaire.

## Préparer le carnet d’ambiances

1. Dans **Préparer**, ouvrir **Carnet d’ambiances** sur une carte de la Fresque. Dans **Jouer**, le raccourci **Ambiances** rejoint le carnet de la scène courante.
2. Choisir **Ajouter une ambiance**. Donner un nom privé et composer un titre, un texte ou une image du catalogue. Le bouton **Reprendre le titre et le texte de la scène** fournit un point de départ. Une scène peut conserver jusqu’à 12 ambiances.
3. En séance, choisir **Préparer** sur une ambiance. Vérifier l’aperçu et ajuster les champs ou l’image pour cette présentation. Le nom de travail reste dans la régie. Ouvrir la fenêtre joueur ou afficher la sélection sur place.
4. Utiliser **Modifier** ou **Supprimer** pour gérer les ambiances de la scène. Les sauvegardes privées v12 conservent le carnet et les identifiants des images du catalogue.

Quand la fenêtre joueur est déjà ouverte, **Préparer** affiche la prochaine ambiance dans la régie. **Remplacer dans la fenêtre joueur** confirme l’envoi à cette même fenêtre. **Annuler** laisse la présentation en cours visible. **Retirer la projection en cours** reste accessible dans le dialogue. Si la fenêtre a été fermée, **Ouvrir une fenêtre joueur** permet de la rouvrir avec l’aperçu préparé.

## Présenter une fiche joueur

1. Ouvrir la **Fiche 5d6** d’un PJ de la campagne depuis **Préparer** ou depuis les participants dans **Jouer**. Choisir **Préparer la fiche joueur**.
2. Cocher les champs à montrer et relire l’aperçu. Le nom est facultatif. L’option **Inventaire** affiche uniquement les noms et quantités des objets. Les notes, le récit privé, les liens de source et les détails des objets restent dans la régie.
3. Choisir **Ouvrir une fenêtre joueur** pour un écran séparé ou pour le partage de cette fenêtre dans Discord. **Montrer sur cet écran** utilise la projection locale existante.
4. Utiliser **Retirer la fiche joueur** dans la barre du Studio. Le changement de contexte ou de révision et la fermeture normale du Studio retirent aussi la fiche. Selon le navigateur, la fenêtre se ferme ou garde un message de retrait.

La présentation est une lecture temporaire locale. Les choix sont à refaire à chaque présentation. La fenêtre reçoit seulement le document de la fiche choisie et ne peut pas lire le stockage du Studio.

## Résoudre une opposition M03

1. Dans **Préparer**, rattacher un PJ M02, une créature ou un PNJ doté d’un profil 5d6 à la scène. Dans **Jouer**, choisir **Opposition · M03**. Le bouton **Cibler en opposition** d’une fiche de participant présélectionne sa cible.
2. Annoncer l’intention et l’enjeu. Choisir la cible, le type d’impact et les valeurs brutes de l’attaquant. La fiche de cible donne la résistance et la protection. **Valider l’annonce** fixe ces choix avant le lancer.
3. Lancer les dés ou saisir les cinq faces de la table. Relire le résultat et décrire la conséquence. Si des dégâts sont proposés, cocher **Appliquer ce changement de PV** pour les inscrire avec l’action. Laisser la case vide pour consigner le jet avec les PV actuels.
4. Retrouver le résultat dans le journal de la scène et les PV en jeu dans **Participants** ou dans la fiche. À zéro PV, le participant est hors de combat et le MJ décide de la suite narrative.

L’influence mentale propose un effet narratif. Le raccord magique utilise les valeurs saisies pour l’impact. Les coûts de mana, les soins et les effets des capacités relèvent de raccords ultérieurs. [Protocole détaillé](PROTOCOLE-JEU.md)

## Terminer et reprendre une séance

Le tableau de bord de l’**Accueil** affiche le point de reprise, les PJ et la dernière séance archivée. Dans **Jouer**, la barre d’actions donne accès à la recherche, aux notes, à l’improvisation, à la projection et aux sauvegardes.

1. Dans **Archiver**, ajouter une séance et cocher uniquement les scènes effectivement jouées et confirmées. La Fresque affiche ensuite leur statut. La scène active reste le point de reprise.
2. Écrire le résumé et les repères de la prochaine séance dans les champs **Privé MJ**. Rédiger séparément la chronique destinée aux joueurs.
3. Relire la chronique dans l’archive, puis l’approuver pour copier ou télécharger le texte affiché. Une modification du texte retire son approbation. Les copies déjà faites restent disponibles chez leurs destinataires.

## Jouer et consigner un interlude

1. Ouvrir **Interludes** depuis **Préparer** ou **Jouer**, puis choisir **Préparer un interlude**. Donner un titre, choisir le type d’activité et préciser si elle a lieu après une scène ou entre deux séances.
2. Après l’activité, choisir **Consigner** dans la liste **À jouer**. Indiquer la date de jeu, le résultat et ses conséquences. Les décisions de règles restent à la table.
3. Retrouver l’entrée dans **Archiver → Interludes consignés**. Le journal classe les résultats par date de jeu et permet de corriger un résultat. Les notes de préparation et les résultats font partie de la sauvegarde privée. La chronique destinée aux joueurs se rédige dans l’archive de séance.

## Sauvegarder hors du navigateur

Dans **Sauvegardes**, télécharger l’archive JSON et la déplacer dans un dossier privé hors du dépôt. L’archive contient les notes MJ en clair. Le contrôle SHA-256 sert à détecter une altération accidentelle du fichier.

Si une entrée enregistrée dans ce profil est illisible, le Studio indique le nombre d’entrées concernées et les conserve sur place. Ouvrir chaque campagne encore lisible depuis **Mes campagnes** pour en télécharger une copie. Si le navigateur refuse l’accès à tout le stockage, le Studio affiche l’erreur générale. Le message de lecture partielle concerne les entrées du profil que le navigateur a pu lire.

Pour vérifier la restauration, ouvrir le même Studio dans un autre profil de test, choisir le fichier, lire l’aperçu et confirmer. Une campagne de même identifiant bloque l’importation. Le Studio accepte les archives v1 à v16. Les embranchements et l’improvisation utilisent au minimum le format v2, les archives de séance le format v3, les repères le format v4, les repères copiés avec leur provenance le format v5, le journal d’actions simples le format v6, les profils mécaniques du Bestiaire le format v7, les oppositions M03 le format v8, les fiches PJ M02 le format v9 et les créations privées avec leurs liens le format v10. Le format v11 conserve les scènes issues d’une aventure et leurs fiches de préparation. Le format v12 ajoute le carnet d’ambiances de chaque scène. Le format v13 ajoute les couloirs, le format v14 les interludes, le format v15 les images par lien et le format v16 les aventures importées. Pour revenir à une version plus ancienne, conserver un export daté d’avant les nouvelles opérations et le restaurer dans un profil vierge. Le bouton **Restaurer** attend une sauvegarde du Studio. Importer les fiches historiques depuis **Préparer** pour les PJ ou **Bestiaire 5d6** pour le Bestiaire.

## Vérifier le pilote

```powershell
npm.cmd --prefix studio-local/tests ci
npm.cmd --prefix studio-local/tests test
node studio-local/build-catalogue.mjs --check
git rev-parse HEAD
```

La recette automatisée ouvre Google Chrome avec des profils de test isolés et des données fictives. Le serveur de recette choisit un port libre. Utiliser `CHROME_BIN` pour indiquer un autre chemin vers un navigateur Chromium installé. Le contrôle du catalogue et la recette historique nécessitent les dépendances installées par `npm.cmd ci` depuis la racine du dépôt. La recette historique se lance ensuite avec `npm.cmd test`. Voir [la décision d’architecture](DECISION.md).
