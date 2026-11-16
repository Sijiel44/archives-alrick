# Quêtes, indices et objectifs

Dans une campagne ouverte, **Quêtes et indices** rassemble le suivi de la séance. Les modèles de quête, mission et aventure restent dans **Créations** ; le bouton **Créer une quête** ouvre ce formulaire existant.

1. Préparer un indice ou un objectif. Son titre et ses notes sont privés. Le rattacher à une quête est facultatif.
2. Cocher les scènes où il peut apparaître et relier les fiches utiles. Un même indice peut être découvert par plusieurs chemins.
3. Depuis la Fresque, ouvrir le suivi d’une scène ; depuis Jouer, utiliser **Quêtes et indices**. Rechercher ou filtrer par quête, scène et état.
4. Choisir **Consigner une décision**, indiquer le nouvel état et le contexte. Revenir à un état précédent ajoute une décision à l’historique sans effacer les précédentes.
5. Pour diffuser une information, remplir le **Texte destiné aux joueurs**, ouvrir **Préparer pour les joueurs**, cocher ce texte puis relire l’aperçu et lancer la présentation. Le titre privé, les notes, les liens et l’historique restent hors du document transmis.

« Découvert » est un état de préparation du MJ : il ne diffuse rien automatiquement. Les objectifs passent de **À entreprendre** à **En cours**, **Accompli** ou **Abandonné** ; les indices de **À découvrir** à **Découvert**, **Exploité** ou **Écarté**. La table décide librement des transitions.

## Fiches reliées et liens de retour

Chaque fiche propose son raccourci `[[identifiant]]`. Un libellé personnalisé utilise `[[identifiant|Nom à afficher]]`. Les identifiants restent stables après renommage. Les fiches du suivi sont aussi consultables dans **Bibliothèque → Aventures et quêtes**.

**Utilisé dans cette campagne** retrouve les scènes, participants, fiches de préparation, créations, repères, illustrations, indices et objectifs qui citent une fiche. Les liens Markdown sont résolus dans leur campagne. Les résultats permettent de rejoindre une fiche ou sa carte dans la Fresque. Les autres campagnes ne sont pas parcourues.

## Sauvegarde et limites

La sauvegarde de campagne **v21** conserve les éléments du suivi et leurs décisions dans `entreRivesQuestStepsV21`. Les versions 1 à 20 restent importables. Le contrôle transactionnel refuse une révision périmée ; un réessai de la même commande ne double pas la décision. La restauration contrôle les références privées et la chaîne d’historique, et conserve les extensions privées inconnues selon le contrat existant.

Limites : 500 éléments par campagne, 20 scènes et 12 références par élément, 100 décisions par élément. Le type indice/objectif reste fixe après création. Une piste peut être écartée sans supprimer son historique. Retirer un repère ou une image enlève sa référence structurée du suivi ; les notes et décisions sont conservées. Les références absentes du catalogue restent identifiées comme indisponibles.

Les anciens repères de type indice restent utilisables et peuvent être reliés au suivi ; ils ne sont pas convertis automatiquement. Ce lot ne modifie pas les règles 5d6, n’accorde aucune récompense et ne synchronise pas les appareils. L’export joueur des indices approuvés appartient au lot Dossier joueur. L’essai humain MJ + deux PJ reste à réaliser.
