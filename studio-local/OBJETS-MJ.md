# Modèles d’objets du MJ et attribution aux PJ

Les créations de type **Objet** servent de modèles privés. Créer le modèle dans **Créations**, puis ouvrir sa fiche dans la **Bibliothèque** et choisir **Attribuer une copie à un PJ**. Le modèle reste indépendant de chacune de ses copies.

Le dialogue propose les PJ M02 dont l’inventaire est compatible. Relire le nom, la quantité, la catégorie, la description, la valeur descriptive et le repère porté. La case de relecture se décoche si un champ ou le destinataire change. Les notes privées, propriétés de préparation, liens et identifiants de campagne ne sont pas préremplis dans ces champs. La description initiale du modèle étant privée, son partage exige cette relecture explicite.

**Attribuer et préparer l’échange** ajoute une entrée distincte à l’inventaire du PJ de campagne et ouvre l’aperçu habituel de l’échange joueur. Le fichier n’est téléchargé qu’à la demande. Le joueur le compare et l’adopte selon le parcours existant ; aucune fiche personnelle n’est modifiée à distance.

L’attribution utilise `update-pj-source` et son historique v17. Les PV effectifs après les combats, les identités, liens de scène, extensions et objets opaques sont conservés. Aucun bonus, grade, protection, capacité, XP ou canon n’est attribué. Le repère de base d’échange reste celui de la version convenue pour éviter une fausse divergence côté joueur. L’historique permet de rétablir l’état antérieur selon les règles existantes.

Les champs de copie sont sélectionnés explicitement et validés : nom de 90 caractères, description de 600, valeur descriptive de 100 et quantité entière de 1 à 999. L’inventaire est limité à 150 entrées pour cette opération ; un format inconnu est conservé et l’attribution refusée. Les contrôles d’identité et de révision protègent aussi une modification du modèle depuis l’aperçu.

La provenance de table reste dans `entreRivesTableObjectV1`, extension privée de l’objet. Le `templateId` partageable reste vide afin de ne pas divulguer un identifiant sémantique de modèle privé. Les échanges ne contiennent que les champs usuels de l’objet et son identifiant de copie. La sauvegarde de campagne conserve modèle, provenance et historique ; sa version reste v17. Les sauvegardes joueur v4 et carnets v1 ne changent pas.

Le dialogue fige le PJ, la révision, la date, l’identifiant de copie et la commande tant que les champs restent identiques. Un réessai après interruption ou acquittement perdu réutilise l’opération. Une révision périmée conserve les saisies et demande une actualisation. Les recettes fictives contrôlent conservation des PV et des profils historiques, rétablissement, rejeu, confidentialité, limites, concurrence, relecture, destinataires absents et largeurs mobiles. La qualification humaine en partie reste distincte.

Le prochain développement est décrit dans [Régie multimédia](MULTIMEDIA.md) : playlists audio MJ, puis fonds vidéo muets avec image de remplacement et diffusion choisie. Ces fonctions multimédias sont prévues et ne font pas partie de ce lot d’attribution.

Recette avant publication : `npm test` réussi, 121 scénarios de la suite complète Chrome, 27 contrôles ciblés Edge et Pages exécuté séparément dans Chrome. Les sept nouveaux scénarios couvrent les données et le parcours d’attribution. L’assemblage et ses 64 270 liens et ressources internes sont vérifiés. Les vues sont inspectées à 1 440 et 390 px et les tests couvrent 320 à 1 440 px. La mise en ligne demandée utilise le workflow Pages et doit être contrôlée sur son URL publique ; la qualification humaine en partie reste distincte.
