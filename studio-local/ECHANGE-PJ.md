# Échanges explicites joueur / MJ · contrat v1

Tranche TABLE-05 du cadrage « Espaces Univers, MJ et Joueur » du 8 novembre 2026, confirmé par le créateur. Les formats présents ont été examinés : exports `alrick.sheets.v3`, sauvegardes personnelles joueur v1/v2 et campagnes privées v1 à v17. Les échanges restent manuels, distincts des sauvegardes privées et des paquets d’aventure.

## Fichier transporté

Le format `chroniques-entre-rives.echange-pj`, version 1, contient exactement `format`, `version`, `checksum` et `payload`. Le contenu contient exactement `created`, `origin` (`joueur` ou `mj` déclaré), `base`, `revision` et `sheet`. La taille maximale reste de 2 Mio. Les règles natives M02 vérifient la fiche avant émission et réception.

L’identité de personnage est le `sheet.id` existant. Une copie locale du joueur possède son propre identifiant d’enregistrement ; un participant MJ possède son identifiant de campagne. Aucun de ces identifiants locaux ne remplace l’identité de personnage.

`revision` est l’empreinte SHA-256 du profil partageable, avec les clés d’objets triées récursivement et l’ordre des tableaux conservé. `base` désigne la révision reçue lors de la précédente adoption ; pour un premier envoi, elle désigne le profil envoyé. Ce sont des versions de contenu, sans numéro d’ordre ni horloge de synchronisation. Une base différente signale une divergence ou une origine commune incertaine. Une date ou un rôle déclaré ne prouve ni la fraîcheur ni l’identité de l’expéditeur.

L’empreinte `checksum` couvre le contenu complet selon la même représentation. Les clés supplémentaires, les versions futures, une empreinte incorrecte, une révision incompatible et les champs hors sélection sont refusés. L’empreinte détecte une altération ; elle ne constitue pas une signature d’auteur.

## Sélection partageable

`sharedSheet()` sélectionne les mêmes données pour le M02 historique et le nouvel échange : identité, niveau, XP, PV, mana, caractéristiques, maîtrises, défenses, portrait valide, capacités et inventaire descriptif. Le suivi local d’échange, le récit personnel, les notes, les jets personnels, les extensions privées, les scènes et la campagne ne sont pas transportés. Les listes privées de décisions et d’historique de progression restent hors de cette sélection existante.

Le MJ transmet les PV courants provenant du journal de jeu et le nom enregistré du participant. L’aperçu est revérifié contre la révision de campagne au téléchargement. Les données des autres participants restent exclues. Le destinataire doit vérifier la provenance du fichier auprès de sa table.

## Comparaison et adoption

La comparaison n’associe que les fiches de même `sheet.id`. Elle montre les groupes modifiés : nom, niveau/XP, PV, mana, caractéristiques, maîtrises, défenses, portrait, inventaire et capacités/progression. Les quantités, capacités et limites restent lisibles en français. Les détails de provenance se déplient séparément. Une version identique ne peut pas être réadoptée comme mise à jour de la copie comparée ; l’import indépendant reste un choix distinct.

L’adoption exige une case de confirmation. La création d’une nouvelle copie reste le choix par défaut. Chez le joueur, la nouvelle copie devient active ; la copie comparée reste accessible. Ses notes, ses jets et ses champs personnels sont repris. Les extensions d’objets sont conservées lorsqu’un identifiant ou un nom permet une correspondance unique ; les entrées opaques restent privées dans la copie. L’ancienne fiche reste intégralement disponible, y compris si des objets partageables sont absents du fichier reçu.

Dans la campagne, le MJ peut conserver ce choix ou sélectionner **Actualiser le PJ comparé**. Cette option exige une fiche de même identité, vérifiée avec M02 et effectivement différente, puis la confirmation du MJ. Le participant garde son identifiant, ses notes et toutes ses références. Le profil, le nom et les ressources reçus deviennent actifs. Les valeurs du fichier sont adoptées ensemble ; aucune fusion automatique ni décision de règle supplémentaire n’est appliquée. La copie indépendante reste un autre participant dont les scènes sont choisies séparément.

Le champ source `entreRivesExchangeV1` conserve localement la révision reçue, la version du suivi, la date et l’origine déclarées. Ce seul suivi reste compatible avec les extensions JSON des anciennes sauvegardes. L’historique du participant décrit ci-dessous utilise la sauvegarde de campagne v17. Les sauvegardes et les exports M02 historiques restent lisibles. Une version future du suivi bloque l’émission d’un échange plutôt que d’inventer une filiation.

Les écritures suivent les transactions existantes. Le joueur vérifie la révision de la fiche comparée dans la transaction qui crée la copie. Le MJ vérifie la révision attendue de campagne. Un échec n’ajoute pas de copie ou d’historique partiel et garde l’aperçu pour réessayer. La signature de l’opération et son identifiant empêchent sa répétition après un acquittement perdu.

## Versions de campagne et PV historiques

Une actualisation crée une entrée privée `entreRivesPJUpdatesV17` sur le participant. Elle contient l’identifiant de l’opération, sa date, le nombre d’actions déjà consignées, le nom et la source complets précédents et les PV effectifs juste avant adoption. `restoredFrom` est nul pour une réception et désigne une entrée antérieure pour un rétablissement. Aucun ancien état n’est supprimé automatiquement ; la limite existante de 4 Mio de la sauvegarde bloque une écriture trop volumineuse en conservant l’état enregistré.

Les sauvegardes contenant ces entrées ou leurs opérations utilisent la version 17. Les versions 1 à 16 restent importables. Les versions futures ou les enveloppes annonçant un format inférieur à leurs données sont refusées. L’aperçu compte les changements de version. Les sources conservées sont vérifiées par M02, et les entrées correspondent au journal transactionnel dans le même ordre.

Les anciens combats utilisent le profil qui était actif à leur position dans le journal. Une adoption fournit un nouveau point de départ des PV pour les actions suivantes. La restauration vérifie chaque chaîne de PV et recalcule chaque impact avec M03 et le profil historique approprié. Une nouvelle protection ou un nouveau niveau ne réinterprète donc pas les anciens combats. Les actions restent toutes présentes, même après plusieurs changements au même endroit du journal.

**Versions** ouvre l’historique depuis la liste des PJ ou leur fiche. Le MJ consulte l’état antérieur avec ses PV effectifs, puis peut le rétablir après confirmation. Cette décision crée une autre entrée et reprend le nom, le profil et les PV conservés avant le changement choisi. Les notes, les liens et les combats ultérieurs restent présents. Ce rétablissement est une nouvelle décision de table, sans annulation rétroactive des combats. Le format d’échange v1 reste inchangé. L’historique de campagne est hors du profil partageable. La sauvegarde personnelle joueur v3 conserve désormais le [grimoire de références](GRIMOIRE-JOUEUR.md), également exclu des échanges ; les v1 et v2 restent importables.

## Suite à qualifier

L’archivage des copies indépendantes et les décisions de progression nécessitent un lot supplémentaire. La synchronisation et l’authentification relèvent de TABLE-08. Les scénarios de recette utilisent des personnages fictifs ; l’essai en partie et sur appareil tactile réel reste distinct.
