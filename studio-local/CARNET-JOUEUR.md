# Carnet de personnages · sauvegarde personnelle multiple

Cette tranche complète TABLE-01, TABLE-04 et TABLE-05 du cadrage « Espaces Univers, MJ et Joueur » du 8 novembre 2026. Elle réutilise les fiches personnelles, le rangement et leurs contrôles M02. Elle ne modifie ni le canon, ni les règles 5d6, ni les formats des échanges ou des campagnes MJ.

## Emporter les fiches enregistrées

**Sauvegarder mon carnet**, dans **Mes personnages**, relit les fiches enregistrées du navigateur. Les portraits, noms, métiers, niveaux, dates et états d’archive aident au choix. La recherche ignore les accents et combine ses mots. Les filtres distinguent toutes les fiches, celles en activité et les archives. La liste commence par vingt résultats et peut être étendue.

Toutes les fiches sont cochées au départ. **Cocher les résultats** ajoute les résultats du filtre à la sélection, y compris ceux encore hors écran ; **Tout décocher** vide la sélection entière. Un changement de recherche ou de filtre conserve les autres choix. Le compteur annonce les fiches cochées et les archives incluses. Le bouton de téléchargement reste indisponible tant que la sélection est vide ou dépasse cent fiches.

Le carnet contient exclusivement les données enregistrées. Les notes encore saisies dans le formulaire restent affichées et ne sont ni abandonnées ni sauvegardées automatiquement. Enregistrer ces modifications avant l’export si elles doivent voyager. Le brouillon de création utilise son propre fichier et reste hors du carnet. Le téléchargement et la consultation ne modifient aucun personnage.

Le fichier est personnel : il contient les notes, les jets, les objets, les portraits, le grimoire et le rangement. L’échange individuel depuis **Sauvegarde** reste le parcours de transmission au MJ. Le carnet ne lit aucune base de campagne et n’émet aucune requête de synchronisation.

## Restaurer après aperçu

**Restaurer un carnet** reste disponible dans un espace vide. La lecture vérifie le fichier entier avant de proposer une sélection : version, taille, empreinte, identifiants de copies distincts, dates et validité de chaque profil et de ses données privées. Une entrée invalide, même non sélectionnée, bloque la lecture du fichier. Rien n’est écrit à ce stade.

L’aperçu rapproche les copies uniquement par l’identité stable `sheet.id`. Les noms semblables ne provoquent aucune fusion. Un contenu identique inclut le profil complet, les notes, les jets, le grimoire et le rangement, extensions comprises. La comparaison ignore l’ordre des clés d’objets JSON, tout en conservant l’ordre des listes. La date de copie et son identifiant de stockage ne définissent pas l’égalité de contenu.

Une copie identique à une fiche locale ou à une entrée précédente du fichier reste décochée par défaut. Une autre version d’une identité locale est signalée et cochée ; les nouvelles identités sont également cochées. L’utilisateur peut volontairement cocher un contenu identique. Un second import du même fichier ne présélectionne donc aucune copie déjà présente. Les comparaisons ne qualifient aucune version de canonique ou d’approuvée par le MJ.

**Ajouter les copies** crée de nouveaux enregistrements locaux, avec de nouveaux identifiants de stockage et une révision initiale. L’identité du personnage et les cinq champs personnels sont repris sans normalisation. Les fiches locales ne sont ni remplacées, ni supprimées, ni archivées. Les archives importées restent en consultation. La première nouvelle fiche en activité est ouverte, ou la première archive si la sélection ne contient que des archives.

## Transaction et concurrence

L’écriture revalide toute la sélection et fige ses données avant la transaction IndexedDB. Elle compare les identifiants et les révisions de l’ensemble du carnet local avec l’aperçu. Un ajout ou une modification dans un autre onglet impose un nouvel aperçu. Les copies cochées sont ajoutées dans une seule transaction : une interruption, une collision ou une erreur de quota annule le lot entier.

Pendant l’écriture, les commandes de confirmation, fermeture et sélection sont désactivées ; Échap ne ferme pas le dialogue. Après une erreur, **Actualiser l’aperçu** relit les données locales et recalcule les choix par défaut. Les fichiers choisis successivement et les dialogues fermés invalident les lectures précédentes encore en attente. Un abandon de notes non enregistrées utilise l’avertissement existant avant l’import ; son annulation conserve le formulaire et le stockage. Le brouillon de création n’est pas touché par la transaction.

## Format et compatibilité

`chroniques-entre-rives.carnet-joueur` v1 contient `created`, `payload: { entries }` et une empreinte SHA-256 de la sérialisation JSON du contenu. Chaque entrée contient `sourceId`, `savedAt` et `payload`, composé strictement de `sheet`, `notes`, `rolls`, `grimoire`, `filing`. Les extensions valides à l’intérieur de ces données sont conservées. Le fichier est limité à 20 Mio et cent fiches ; chaque fiche garde la limite personnelle existante de 2 Mio avec sa marge d’enveloppe. Plusieurs fichiers permettent d’emporter une collection plus grande.

L’empreinte détecte une altération ; elle ne chiffre pas le fichier et ne certifie pas son auteur. Les fichiers futurs ou dont l’enveloppe annonce des données incompatibles sont refusés. Les sauvegardes individuelles joueur v1 à v4, les brouillons v1, les échanges v1 et les campagnes v1 à v17 gardent leur propre parcours. La base joueur reste en version IndexedDB 5 et aucun magasin n’est ajouté. Un ancien client ne lit pas le carnet ; conserver les exports individuels pour les clients qui les exigent.

## Recette et limites

Les recettes utilisent des personnages fictifs : export complet et sélectif, archives et extensions, prévisualisation des copies, doublons internes et déjà présents, ordre des clés, réimport, rollback après une deuxième écriture interrompue, modification dans un autre onglet, fichier altéré ou futur, tailles et profils refusés, notes en cours, lectures remplacées, clavier et longues listes. Pages exerce le téléchargement et l’import avec contrôle d’absence de notes MJ. La qualification humaine en partie et sur appareil tactile réel reste distincte.

`npm test` réussit et la suite complète du Studio passe 106 scénarios Chrome, Pages étant exécuté séparément. Après les derniers ajustements, les neuf scénarios du carnet et Pages passent ensemble dans Chrome ; les quarante contrôles ciblés Edge couvrent aussi les échanges, brouillons, grimoires, fiches de séance et archives. Le rendu est inspecté à 1 440 et 390 px ; les recettes vérifient les largeurs de 320 à 1 440 px et une collection de 103 fiches. L’assemblage final et ses 64 269 liens et ressources internes passent le contrôle du site. Ces résultats ne constituent pas une homologation en partie.
