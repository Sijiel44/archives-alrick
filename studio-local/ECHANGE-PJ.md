# Échanges explicites joueur / MJ · contrat v1

Tranche TABLE-05 du cadrage « Espaces Univers, MJ et Joueur » du 8 novembre 2026, confirmé par le créateur. Les formats présents ont été examinés : exports `alrick.sheets.v3`, sauvegardes personnelles joueur v1/v2 et campagnes privées v1 à v16. Les échanges restent des copies manuelles, distinctes des sauvegardes privées et des paquets d’aventure.

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

L’adoption exige une case de confirmation et crée une nouvelle copie. Aucun remplacement en place ni fusion automatique des états de jeu n’est réalisé. Chez le joueur, la nouvelle copie devient active ; la copie comparée reste accessible. Ses notes, ses jets et ses champs personnels sont repris. Les extensions d’objets sont conservées lorsqu’un identifiant ou un nom permet une correspondance unique ; les entrées opaques restent privées dans la copie. L’ancienne fiche reste intégralement disponible, y compris si des objets partageables sont absents du fichier reçu.

Dans la campagne, la nouvelle copie est un autre participant. Les notes MJ et les références de scènes continuent de viser le participant précédent. Le MJ choisit explicitement le participant à utiliser dans une scène. Cette limite est annoncée avant importation.

Le champ source `entreRivesExchangeV1` conserve localement la révision reçue, la version du suivi, la date et l’origine déclarées. Les formats de sauvegarde existants conservent déjà les extensions JSON de la fiche source ; leur enveloppe ne change pas. Les sauvegardes et les exports M02 historiques restent lisibles. Une version future du suivi bloque l’émission d’un échange plutôt que d’inventer une filiation.

Les écritures suivent les transactions existantes. Le joueur vérifie la révision de la fiche comparée dans la transaction qui crée la copie. Le MJ vérifie la révision attendue de campagne. Un échec n’ajoute pas de copie partielle et garde l’aperçu pour réessayer.

## Suite à qualifier

L’actualisation en place d’un participant, ses conséquences sur le journal de PV et ses références de scène, l’archivage des anciennes copies et les décisions de progression nécessitent un lot supplémentaire. La synchronisation et l’authentification relèvent de TABLE-08. Le scénario de recette utilise des personnages fictifs ; l’essai en partie et sur appareil tactile réel reste distinct.
