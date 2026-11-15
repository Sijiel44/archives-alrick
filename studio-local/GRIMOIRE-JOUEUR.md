# Grimoire personnel · références et sauvegarde v3

Depuis le lot [Rangement joueur](RANGEMENT-JOUEUR.md), la sauvegarde personnelle v4 conserve aussi l’état d’archive. Le grimoire garde le contrat décrit ici ; les fichiers v1 à v3 restent importables. Une archive se consulte, et sa remise en activité rétablit les commandes de modification.

Ce lot complète TABLE-04 du cadrage « Espaces Univers, MJ et Joueur » du 8 novembre 2026. Il permet de consulter les essais de sorts du catalogue commun et de conserver ses repères personnels. Il ne traduit aucune technique de campagne en sort et ne change aucun moteur 5d6.

## Référentiel et statut

Les six sorts viennent de `catalogue-archives.json`, épinglé à `88f774f3d0d6d520d8d11443b72202b9caf4f94b`, et gardent leurs identifiants, versions, coûts de base et limites. Leurs sources sont `quartz/components/scripts/atelier5d6-grimoire.ts` et [Grimoire 5d6 v1](../docs/GRIMOIRE_5D6_V1.md). Les libellés des domaines utilisent `AFFINITY_DOMAINS` du moteur d’origines existant.

La sélection joueur accepte uniquement les sorts de démonstration explicitement sélectionnés de ce module public. Une création privée de campagne ne devient pas publique par son type. Les références vers le Codex, le Grimoire 5d6 et les rites ouvrent leur source épinglée. Les écoles ne sont pas déduites automatiquement d’un domaine ou d’un niveau.

**Favori de séance** signifie une référence à retrouver rapidement. Il ne vaut pas connaissance du sort, validation MJ, Cercle attesté, préparation mécanique, jet ou dépense de mana. Le coût est celui du catalogue d’essai ; les conditions complètes restent dans la source. La pratique mécanique, les matrices et l’apprentissage restent à intégrer séparément après qualification.

## Enregistrement personnel

Le grimoire de références appartient à l’enregistrement joueur, à côté de `sheet`, `notes` et `rolls`. Il est distinct du bloc historique expérimental `sheet.grimoire`, conservé intact dans la source M02 et jamais réinterprété par ce panneau.

`grimoire` est une liste de 0 à 80 entrées, sans doublon d’identifiant :

```json
{
  "id": "demo-lueur-guide",
  "name": "Lueur de veille",
  "version": "4f6d97ce1a6e57b427be6a0d22651a8ec0db899f",
  "notes": "Question à discuter avec le MJ.",
  "session": true
}
```

L’identifiant est une chaîne stable de 1 à 128 caractères autorisés. Le nom contient au plus 120 caractères, la version de référence de 1 à 128 caractères et les notes au plus 4 000 caractères. `session` est un booléen. Les extensions inconnues à l’intérieur d’une entrée valide sont conservées lors d’une modification et d’une restauration. Les données restent soumises au contrôle JSON existant et à la limite personnelle globale de 2 Mio.

Un identifiant absent du catalogue reste lisible avec son nom conservé et ses notes ; aucun lien ni effet n’en est déduit. Si la version présente diffère de la version conservée, le dialogue avertit. Seule la case explicite de rattachement adopte le nouveau nom et la nouvelle version. Une modification de notes ne met pas silencieusement la référence à jour. Le retrait demande confirmation.

## Transactions et formats

La base joueur garde son nom et passe en version IndexedDB 3 pour fermer les anciennes connexions lors de la mise à jour. Les anciens enregistrements se lisent avec un grimoire vide. La transaction attend la révision du personnage et n’est confirmée qu’après sa validation. Une interruption ou un conflit conserve les données enregistrées et le brouillon dans le dialogue. Les commandes d’écriture et les champs sont bloqués pendant l’enregistrement.

L’enveloppe `chroniques-entre-rives.joueur` v3 sélectionne `sheet`, `notes`, `rolls`, `grimoire` et calcule son empreinte SHA-256 sur ce contenu. Les v1 et v2 restent lisibles avec un grimoire vide ; les versions futures, incohérentes ou altérées sont refusées. Une restauration ajoute une copie après aperçu, sans écraser une fiche existante. Un ancien client ne lit pas une sauvegarde v3 : conserver les exports datés et utiliser le client mis à jour pour la restauration.

L’échange `chroniques-entre-rives.echange-pj` v1 et l’export `alrick.sheets.v3` sélectionnent toujours le seul profil partageable. Les repères personnels, leurs notes et la liste de favoris sont exclus. Lors d’une adoption d’échange, le grimoire de la fiche personnelle comparée est reporté sur la nouvelle copie, avec la garde de révision existante. L’autre copie reste intacte. La sauvegarde de campagne v17 et la projection MJ/joueur ne changent pas.

## Vérification

La recette `tests/grimoire-joueur.test.mjs` utilise exclusivement des fiches fictives. Elle couvre la consultation sans écriture ni dépense de mana, les filtres et le clavier, les largeurs mobiles, les références périmées ou absentes, les extensions, la restauration dans un profil vierge, la concurrence, l’interruption, les limites et la migration de la base v2. Elle vérifie aussi l’exclusion des données privées dans les deux exports et leur conservation lors de l’adoption d’une version.

La recette Pages parcourt ce panneau dans le site assemblé et contrôle son contenu dans la sauvegarde personnelle puis son absence dans l’échange. Le client charge le catalogue public depuis la même origine ; les formulaires restent sans envoi réseau et les données personnelles restent dans IndexedDB. L’essai humain en partie et sur appareil tactile réel reste distinct.
