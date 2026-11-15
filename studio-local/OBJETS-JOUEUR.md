# Inventaire relié aux objets du catalogue

Ce lot complète TABLE-04 et TABLE-05 du cadrage « Espaces Univers, MJ et Joueur » du 8 novembre 2026. Il réutilise l’inventaire personnel, le catalogue commun épinglé et les échanges existants. Il ne change aucune règle 5d6, attribution canonique, fiche publiée ou valeur mécanique.

## Périmètre documentaire

Le catalogue courant fournit trois objets publics : [l’armure de Harald](../content/objets/OBJ-CB31-ARMURE-PERE-ORIN.md), [les bijoux de communication des Revenants](../content/objets/OBJ-CB38-BIJOU-COMMUNICATION.md) et [la lyre destinée à Tairin](../content/objets/OBJ-CB38-LYRE-TAIRIN.md). Ce sont des objets documentés, avec des propriétaires ou des destinations précis. Leur présence dans un sélecteur ne les attribue pas à un PJ. La fiche de la lyre distingue notamment l’achat de l’intention du cadeau et de sa remise encore non attestée.

Les entrées viennent du même `catalogue-archives.json` que la bibliothèque. Le client sélectionne seulement les objets publics documentés sous `content/objets/`, avec un statut du catalogue et une version reconnus. Il ne consulte aucune création de campagne privée et n’ajoute aucun nouvel objet de lore. Les catégories Armures, Bijoux et Autres objets organisent la consultation ; elles ne donnent ni grade, ni prix, ni protection. Le libellé documentaire du catalogue est affiché et le lien permet de lire la source complète avec ses statuts et limites.

## Préparer une adaptation

Dans **Inventaire → Objets du catalogue**, rechercher des mots d’un nom, d’un code ou d’une description, avec ou sans accents, puis choisir une catégorie. Ouvrir une référence montre son résumé, son statut et sa version. **Lire la source du catalogue** ouvre le fichier dans la révision Git épinglée, dans un nouvel onglet.

**Préparer une adaptation pour ma table** préremplit l’ajout existant : nom précédé de « Adaptation », description, catégorie, quantité unitaire et référence d’inspiration. Les champs restent modifiables. Si une saisie est déjà présente, son remplacement exige la confirmation du dialogue. Rien n’est écrit avant **Ajouter l’objet**. L’ajout crée une entrée distincte et ne fusionne aucune quantité avec un objet existant. L’attribution et les effets sont à convenir avec le MJ.

Le formulaire libre reste disponible. Détacher la référence conserve les autres champs. Un changement de personnage réinitialise cet ajout non enregistré et sa référence afin de ne pas les reporter par inadvertance sur une autre fiche. L’archivage conserve les objets déjà enregistrés ; la consultation du catalogue reste disponible en lecture seule, également pour un inventaire dont le format global n’est pas pris en charge.

## Relier un objet existant

Depuis **Détails → Choisir une référence**, la sélection prépare un lien sans réécrire le nom, la quantité, la description, la catégorie, la valeur, le marquage porté ou les extensions de l’objet. **Enregistrer l’objet** confirme le changement. Fermer les dialogues abandonne le lien en cours et conserve la version enregistrée.

Le formulaire ne réécrit que les champs effectivement modifiés. Les champs absents, les valeurs historiques sous forme de texte et les valeurs de format inconnu restent donc conservés lors d’un simple rattachement. Un champ connu modifié explicitement est vérifié par le formulaire habituel.

**Consulter la référence**, directement dans la liste d’inventaire, ouvre son aperçu. Le lien de source enregistré est aussi disponible dans les détails. Si la version du fichier source a changé, **Rattacher à la version actuelle** prépare une actualisation volontaire de la provenance, confirmée avec l’objet. Les champs personnels restent intacts. Une autre révision du dépôt contenant la même version du fichier ne déclenche pas de fausse modification.

**Détacher la référence** demande confirmation et enlève uniquement le repère lors du prochain enregistrement. Une référence valide mais absente du catalogue conserve son nom, son identifiant et sa version ; aucun chemin fourni par le fichier n’est suivi. Une référence de format futur ou invalide reste conservée et ses commandes de remplacement sont indisponibles. Les autres champs connus de l’objet restent modifiables si la fiche est en activité.

## Raccourcis Markdown et navigation

L’aperçu propose le raccourci `[[code|nom]]` de la fiche publique. **Copier le raccourci** utilise le presse-papiers lorsqu’il est disponible ; sinon, le champ est sélectionné pour une copie manuelle. Les identifiants restent ceux du catalogue commun. Ce raccourci sert aux notes et aux textes qui prennent en charge les liens de la bibliothèque ; il ne change aucune possession ni règle.

Les commandes sont natives, les champs sont étiquetés et le résultat d’une recherche est annoncé. Entrée depuis la recherche ouvre le premier résultat ; Échap ferme l’aperçu et rend le focus au bouton d’origine. Une adaptation ramène au nom de l’objet à compléter. Le sélecteur ouvert depuis les détails rend le focus dans ce dialogue, sans perdre ses saisies.

## Provenance, stockage et confidentialité

Le repère personnel appartient à l’objet d’inventaire, sous `entreRivesObjectSourceV1` : `version: 1`, `id`, `name`, `sourceVersion` (empreinte Git du fichier) et `revision` (commit épinglé). Les champs supplémentaires de ce repère sont conservés lors d’une actualisation. Les URLs et chemins éventuellement présents dans une sauvegarde ne sont jamais utilisés comme liens : le client construit uniquement des liens GitHub vers les chemins publics connus du catalogue. Le repère est déclaratif et ne certifie ni l’auteur d’un fichier ni une décision du MJ.

Les changements utilisent l’enregistrement joueur existant, avec sa révision attendue et sa transaction IndexedDB. Une interruption ou une modification dans un autre onglet conserve les données précédentes et laisse les champs à confirmer disponibles. Une fiche archivée refuse les écritures, même si un ancien onglet affiche encore des commandes actives. Une consultation ne modifie aucune fiche.

La sauvegarde personnelle v4 et le carnet v1 conservent la provenance, les extensions et les références absentes ou futures. Les échanges v1 et l’export M02 continuent de sélectionner leurs seuls champs partageables : ce repère privé en est exclu. Lors d’un retour du MJ, l’adoption conserve les champs privés si l’objet correspond sans ambiguïté à une entrée locale, selon les règles existantes d’identité d’objet. Le profil reçu sans copie locale ne reconstitue aucune provenance privée.

Les formats de sauvegarde, les schémas de campagne et la base IndexedDB 5 restent inchangés. Aucun moteur, prix, bonus, grade d’équipement ou calcul de protection n’est modifié. Les sources vraiment privées et les fichiers de campagne restent hors des commits et de la liste d’assets Pages.

## Recette et suite

Les scénarios fictifs couvrent consultation sans écriture, recherche et catégories, liens épinglés, raccourci Markdown et repli sans presse-papiers, adaptation, confirmation d’un remplacement de saisie, rattachement et détachement, références modifiées, absentes et futures, retour du MJ, confidentialité, restauration personnelle et par carnet, interruption d’écriture, onglet périmé et fiche archivée. Les contrôles de clavier et de largeur ne remplacent pas une qualification humaine en partie ou sur appareil tactile réel.

`npm test` réussit. La suite complète du Studio passe 114 scénarios Chrome, avec Pages ignoré dans cette commande puis exécuté séparément. Après les derniers raffinements, treize contrôles Chrome couvrent les objets, l’inventaire historique et Pages ; les quarante-huit contrôles ciblés Edge réussissent aussi. Une première session Edge a été interrompue par une mise à jour de l’environnement ; la relance complète fournit ce bilan. Le rendu final est inspecté à 1 440 et 390 px ; les recettes couvrent 320 à 1 440 px, les dialogues imbriqués, le retour du focus et le lien de source accessible au clavier au-dessus des commandes fixes. L’assemblage final et ses 64 270 liens et ressources internes sont vérifiés. Aucun de ces résultats ne constitue une homologation en partie.

L’Atelier historique possède déjà des modèles privés d’objets et une attribution réservée au MJ dans `quartz/components/scripts/atelier5d6.inline.ts`. Leur reprise, l’import de modèles et une transmission expurgée au joueur forment le prochain lot proposé. Le catalogue public actuel ne remplace pas ces modèles de table.
