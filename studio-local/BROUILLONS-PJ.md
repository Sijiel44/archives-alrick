# Création PJ · reprise locale et transport du brouillon

Le lot [Rangement joueur](RANGEMENT-JOUEUR.md) fait ensuite passer la base en version IndexedDB 5 et la sauvegarde personnelle en v4. Le magasin de brouillons et son fichier v1 restent inchangés ; leur contenu est conservé lors de cette migration.

Ces deux lots complètent TABLE-03 et les protections de TABLE-01 du cadrage « Espaces Univers, MJ et Joueur » du 8 novembre 2026. Le créateur guidé et libre et les moteurs M01/M02 restent les mêmes. Un brouillon conserve une intention de création, pas une fiche jouable validée.

## Lot A · reprise locale

Un seul emplacement de brouillon est disponible par profil et origine du navigateur. Il est séparé des personnages et des campagnes MJ. Après modification, le créateur lance une écriture IndexedDB. Les écritures sont séquencées : si les champs changent pendant un enregistrement, les choix les plus récents sont enregistrés ensuite. Le statut confirme la transaction terminée. Un formulaire vierge fermé sans modification ne crée pas de brouillon.

Le contenu conserve l’identifiant de création, les valeurs textuelles des champs fixes, le mode guidé/libre, les domaines personnalisés et leurs rangs, le portrait préparé et les indices des rubriques dépliées. Les champs désactivés de l’autre mode restent conservés. Les champs vides et les budgets incomplets ne sont pas corrigés ou convertis implicitement. Le fichier original de portrait n’est pas stocké : la copie réduite du créateur est conservée, selon les limites historiques.

Le brouillon est repris explicitement dans le créateur. Il faut de nouveau vérifier la fiche avec M02. L’enregistrement du personnage garde l’identifiant de création et confirme la fiche et le retrait du brouillon dans une seule transaction sur les deux magasins. Une interruption ne laisse ni personnage partiel ni brouillon perdu. Une révision divergente arrête cette conversion. L’identité stable empêche une nouvelle tentative de créer un second personnage de même identifiant.

Le nom de base reste `entre-rives.espace-joueur.v1`. La version IndexedDB 4 ajoute le magasin `brouillons` sans modifier les fiches, leurs extensions, leurs notes, leurs jets ou leur grimoire. Les anciennes connexions sont fermées par le mécanisme existant de changement de version. L’emplacement `creation-pj` garde une révision monotone, même après retrait ou conversion : le contenu devient nul, au lieu de remettre la révision à zéro. Un ancien onglet ne peut donc pas recréer silencieusement un brouillon retiré.

## Lot B · fichier personnel

**Télécharger le brouillon** sélectionne seulement le formulaire de création, y compris une version divergente encore affichée. L’enveloppe utilise `format: chroniques-entre-rives.brouillon-pj`, `version: 1`, une date UTC, le contenu `payload` et son empreinte SHA-256. La limite est de 512 Kio, enveloppe comprise. Le contenu suit cette forme :

```json
{
  "id": "pj-identifiant-de-creation",
  "fields": { "new-player-mode": "free", "new-player-name": "Nom à choisir" },
  "customMasteries": [],
  "portrait": "",
  "expanded": []
}
```

L’exemple illustre la structure ; un vrai export conserve tous les champs fixes du créateur. Les valeurs restent des chaînes pour préserver les champs vides et les saisies incomplètes. Les champs sont limités à 96 entrées et 4 000 caractères chacun ; les domaines personnalisés à douze noms distincts de 60 caractères maximum et des rangs textuels de 40 caractères maximum. Le contrôle JSON historique bloque les clés dangereuses. Le portrait utilise la validation historique. Les choix de listes et les identifiants de champ sont vérifiés contre le formulaire courant avant toute substitution.

L’import vérifie le format, la version, l’empreinte, la taille et la compatibilité du formulaire, puis affiche un aperçu textuel. La confirmation remplace seulement le brouillon local, avec une garde de révision. Si un brouillon existe, une case explicite est nécessaire. La copie importée reçoit un nouvel identifiant de création afin de ne pas écraser un PJ déjà créé depuis le même fichier. Aucun personnage n’est ajouté tant que M02 n’a pas vérifié le formulaire et que le joueur n’a pas confirmé sa création.

Les sauvegardes personnelles v1 à v3, les échanges v1, les exports M02 et les sauvegardes de campagne v1 à v17 gardent leur contrat. Le brouillon se transporte dans son propre fichier ; il n’est pas inclus dans une sauvegarde de personnage ou une projection joueur. Aucun secret MJ n’est recherché ou sélectionné.

## Échec, concurrence et limites

Une interruption garde les champs affichés et le contenu enregistré. **Garder mon brouillon** réessaie l’écriture. En cas de conflit, l’automatisme s’arrête : télécharger les choix en cours permet de les conserver avant **Relire le brouillon enregistré**. Cette relecture et **Recommencer** nécessitent une confirmation locale. Un échec d’écriture lors de **Fermer** laisse le créateur ouvert avec les choix récupérables.

Les fermetures habituelles attendent la transaction et une fermeture avec modifications non confirmées déclenche l’avertissement natif du navigateur. Une fermeture forcée, une suppression des données du navigateur ou une panne de l’appareil avant confirmation reste une limite réelle ; le fichier téléchargé fournit une copie indépendante. Il n’y a pas de synchronisation automatique ni de serveur de données.

La recette utilise des personnages fictifs et vérifie la reprise libre/guidée, les portraits, les champs incomplets, les domaines, le clavier/mobile, la conversion atomique, les réessais, la concurrence, le transport, la migration de la base v3 et les refus sans écrasement. La recette Pages exerce la reprise depuis le site assemblé et contrôle l’absence des notes MJ dans le fichier. L’essai en partie réelle et sur appareil tactile reste à réaliser.
