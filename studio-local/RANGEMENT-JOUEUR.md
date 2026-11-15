# Rangement des personnages · archives personnelles et sauvegarde v4

Le lot complète TABLE-04 et TABLE-05 du cadrage « Espaces Univers, MJ et Joueur » du 8 novembre 2026. Il aide à retrouver sa fiche et à ranger les copies anciennes. Il ne change aucune règle, identité de personnage ou donnée de campagne MJ.

## Répertoire

Le répertoire lit les enregistrements de l’espace joueur. La recherche combine les mots du nom, du métier et du niveau, en ignorant les accents. Les notes, l’histoire et les extensions privées ne sont pas des résultats de recherche. Les filtres distinguent les fiches en activité, les archives et l’ensemble des fiches. Les tris utilisent le nom, le niveau ou la date de modification. La consultation ne modifie pas les enregistrements.

Les portraits valides utilisent le rendu image habituel, sans référent, avec un remplacement en cas d’échec. Les listes sont limitées à vingt résultats par groupe affiché. Les commandes restent des boutons natifs accessibles au clavier. Entrée depuis la recherche ouvre le premier résultat ; Fermer ou Échap rend le focus à l’accès au répertoire.

Les copies sont regroupées uniquement par l’identité stable `sheet.id`, sans rapprochement implicite de noms. Le nombre de copies inclut les archives. Une version d’échange est affichée si elle existe, sans la qualifier d’état homologué ou de version approuvée par le MJ. La dernière fiche en activité ouverte peut être retrouvée via une préférence locale contenant son seul identifiant d’enregistrement. Une archive n’est jamais choisie automatiquement devant une fiche en activité au retour sur le site.

## Archivage réversible

Le rangement appartient à l’enregistrement personnel, à côté du profil : `filing: { archivedAt: null }` pour une fiche en activité, ou une date ISO UTC pour une archive. Les extensions inconnues de cet objet restent conservées. Le profil M02, l’identité, les notes, les jets, le grimoire et les objets ne sont ni normalisés ni réécrits par le rangement.

L’archivage ou la remise en activité vérifie la révision attendue, puis confirme la métadonnée et la nouvelle révision dans une transaction. Une interruption ou une révision périmée conserve l’enregistrement précédent. Un choix déjà appliqué ne produit pas de nouvelle modification après lecture à jour. Le magasin ne fournit aucune suppression de fiche par ce parcours.

Une archive reste consultable et exportable. Les modifications du profil, des notes, du portrait, des objets et du grimoire et les nouveaux jets nécessitent sa remise en activité. Le stockage refuse aussi les écritures sur une archive si une interface périmée présente encore des champs actifs. Les notes en cours sont protégées par l’avertissement existant avant abandon ; une erreur d’écriture les laisse affichées. Les champs de ressources d’une archive montrent les valeurs enregistrées.

Les archives ne sont pas des fiches de référence proposées lors de la comparaison d’un échange. La remise en activité les rend à nouveau disponibles. La transaction d’adoption vérifie également qu’une fiche comparée n’a pas été archivée entre l’aperçu et la confirmation. Aucune ancienne copie n’est archivée automatiquement lors d’un échange.

## Sauvegardes et migration

La sauvegarde `chroniques-entre-rives.joueur` v4 sélectionne `sheet`, `notes`, `rolls`, `grimoire`, `filing` et calcule son empreinte sur ce contenu. Les sauvegardes v1 à v3 restent lisibles avec un rangement en activité par défaut. Les exports M02 et les échanges gardent leurs formats et excluent le rangement personnel. Les fichiers futurs, altérés ou annonçant une version incompatible avec leurs données sont refusés.

La restauration d’une sauvegarde v4 ajoute une copie et garde son état d’archive, annoncé dans l’aperçu. L’adoption d’un échange crée une nouvelle copie en activité, sans importer de métadonnée de rangement privée. Le plafond personnel de 2 Mio reste appliqué. Les anciennes applications ne lisent pas la v4 : utiliser le client mis à jour et conserver ses exports datés.

La base `entre-rives.espace-joueur.v1` passe en version IndexedDB 5 pour fermer les anciennes connexions avant les écritures enrichies. Les anciennes fiches se lisent avec un rangement par défaut ; leurs données et les brouillons sont conservés. Le format de brouillon v1 et les sauvegardes de campagne v1 à v17 ne changent pas. Il n’y a pas de synchronisation distante ni de modification automatique des données MJ.

## Vérification et limites

Les recettes utilisent des fiches fictives. Elles vérifient les copies d’échange, la recherche, les portraits, le clavier, les longues listes et les petites résolutions, la consultation sans écriture, la conservation intégrale lors d’un archivage/remise en activité, les contrôles en lecture seule, le refus des écritures périmées, la restauration de l’archive, la confidentialité des échanges et la migration d’une vraie base v4 avec brouillon.

La recette Pages utilise aussi le répertoire et restaure une fiche en activité après consultation de son archive. L’essai humain en partie et sur appareil tactile réel reste distinct. Le [carnet de personnages](CARNET-JOUEUR.md) complète maintenant ce rangement avec une sauvegarde multiple et un aperçu des copies à importer.

Le bilan du lot comprend `npm test`, les 97 scénarios de la suite Studio dans Chrome et les 30 contrôles ciblés Edge. Sept contrôles du rangement et de Pages réussissent aussi dans chacun des deux navigateurs après le dernier ajustement mobile. Le rendu est inspecté à 1 440 et 390 px et les recettes vérifient les largeurs de 320 à 1 440 px. Ces résultats constituent une recette automatisée et une inspection visuelle, sans homologation en partie.
