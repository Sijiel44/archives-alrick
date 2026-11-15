# Enrichir progressivement l’univers avec ChatGPT et GitHub

Ce guide prépare le chantier demandé le 15 novembre 2026. Le circuit éditorial GitHub existe déjà ; le lot vidéo n’ajoute pas d’éditeur de canon dans le navigateur, d’API ChatGPT ni d’import automatique de toutes les sources. Les règles de contribution restent celles de [AGENTS.md](../AGENTS.md), [CONTRIBUTING.md](../CONTRIBUTING.md) et du [contrat éditorial](../CONTRAT_EDITORIAL.md).

## Donner un petit lot exploitable

Fournir à ChatGPT le dépôt `Sijiel44/archives-alrick`, un sujet borné et les documents ou extraits concernés. Un bon premier lot porte sur un lieu et ses fiches liées, quelques objets ou un petit ensemble de créatures ; cela permet une relecture réelle et évite de reproduire les mêmes informations dans plusieurs fiches.

Pour chaque transmission, préciser :

- **La source** : nom exact du fichier, version ou date documentaire et emplacement des passages. Donner les codes CB et paragraphes lorsqu’ils existent ; une synthèse ou un souvenir doit être identifié comme tel.
- **Le sujet** : identifiants et chemins des fiches déjà connues, variantes de noms, liens attendus et éléments manquants à compléter.
- **La portée** : univers partagé, campagne d’Orin ou variante de table ; préciser aussi le public visé et les informations qui restent privées.
- **Le résultat attendu** : compléter une fiche, réorganiser ses sections, proposer de nouvelles fiches reliées, préparer un profil jouable ou mettre à jour un rayon du catalogue.
- **Les décisions acquises** : ce qui est attesté, ce qui a été validé par le créateur et ce qui reste une proposition. Signaler les contradictions connues.

Le dépôt GitHub et le site sont publics. Les bruts confidentiels, notes MJ, sauvegardes et paquets privés restent hors des commits. Une fiche non publiée peut tout de même être lisible dans le dépôt ; `publish: false` protège la construction du site, pas la confidentialité GitHub.

## Le parcours d’une mise à jour

1. **Rechercher avant d’écrire.** Lire les règles du dépôt, l’index de sources et les fiches liées. Chercher le code, le nom et ses variantes. Les homonymes et les personnes de différentes périodes ne sont pas fusionnés par ressemblance.
2. **Préserver l’identité documentaire.** Compléter la fiche existante lorsqu’elle décrit déjà le sujet. Conserver son identifiant, ses liens et son historique de statut. Proposer un nouvel identifiant seulement après contrôle des doublons et des règles propres au domaine.
3. **Préparer un brouillon sourcé.** Les ajouts sous `content/` commencent avec `publish: false`. Les modèles du dossier [modeles](../modeles/) fournissent les rubriques de départ. Employer les statuts du contrat ; une proposition ne devient pas un fait joué ou du lore validé par sa rédaction.
4. **Distinguer les niveaux d’information.** Séparer l’état attesté, les déclarations, les hypothèses, les propositions de jeu et les questions ouvertes. Ne pas compléter une filiation, un pouvoir, une distance ou une chronologie par vraisemblance.
5. **Relier les fiches et classer.** Ajouter des liens vers les lieux, personnes, objets ou capacités utiles. Préparer les liens de retour et le rayon attendu. Vérifier que les résumés et titres publics ne révèlent pas un secret.
6. **Contrôler et proposer.** Sur une branche dédiée, exécuter `npm ci` si nécessaire puis `npm test`, ainsi que les contrôles du domaine et du catalogue lorsqu’il est modifié. Ouvrir une PR avec les sources, les fiches liées, les hypothèses, contradictions et résultats.
7. **Relire avant publication.** Le créateur décide des changements de canon et du lot publiable. Une autorisation de développer le site ne valide pas automatiquement un nouveau fait de l’univers. Le workflow Pages publie ensuite le lot approuvé ; contrôler ses liens publics après déploiement.

## Quelles fiches préparer ?

| Domaine | Organisation conseillée | Points à vérifier |
| --- | --- | --- |
| **Objets et équipements** | Identité, fonction, fabrication ou origine, porteurs attestés, limites, usages proposés, sources et liens. Utiliser `modeles/objet.md`. | Distinguer objet unique et type d’équipement ; un texte descriptif ne donne pas automatiquement un bonus 5d6. |
| **Bestiaire** | Séparer espèce, individu, biome et profil jouable. Les modèles `creature-espece`, `creature-individu`, `biome` et `creature-profil-5d6` existent. | Les préfixes `ESP-`, `FAMT-`, `INDC-`, `BIO-`, `P5C-`, `VARC-` n’autorisent pas l’émission libre de codes. Chaque attribution destinée à `content/` demande la preuve du créateur et le registre B-002 prévu au contrat. |
| **Sorts et rituels** | Usage narratif, école ou domaine sourcé, conditions, coût attesté, limites, contre-mesures et références. Partir du modèle magie et des fiches existantes. | Distinguer description de lore et règle mécanique ; ne pas inventer un coût, rang ou acquisition validée. |
| **Capacités et actions** | Effet décrit, contexte d’usage, conditions, limites, statut et liens vers les règles concernées. | La présence dans le catalogue ne signifie pas que le PJ possède la capacité. Les décisions d’apprentissage restent un lot de progression. |
| **Personnages** | Histoire attestée, rôle, relations indépendantes, connaissances, limites et possibilités de rencontre identifiées comme proposées. Utiliser `modeles/personnage.md`. | Séparer le dossier public d’un personnage de la fiche privée du PJ à sa table. Ne pas importer les notes ou les scores d’une campagne dans le canon. |
| **Lieux et Atlas** | Proposer une hiérarchie lisible : continent, pays ou royaume, région, ville ou village, quartier, bâtiment et lieu particulier. Utiliser `modeles/lieu.md`. | Préserver les relations attestées ; un schéma ne fixe ni distance, ni frontière, ni coordonnées. Relier chaque lieu à ses personnes et ressources utiles. |

Ces catégories organisent la recherche. Elles ne prouvent ni statut canonique, ni possession, ni alliance, ni autorisation d’accès.

## Liens Markdown et accès dans le Studio

Dans les sources Quartz, un lien relatif comme `[Les Montagnes de l’Aube](../lieux/GEO-001.md)` et le lien wiki `[[lieux/GEO-001|Les Montagnes de l’Aube]]` peuvent renvoyer à la fiche existante. Employer les chemins réels et vérifier le rendu après construction.

Dans les textes du Studio, les raccourcis `[[GEO-001|Les Montagnes de l’Aube]]` ou `[Les Montagnes de l’Aube](#fiche/GEO-001)` ouvrent une référence **déjà présente dans le catalogue**. Les liens entre créations privées utilisent leurs propres identifiants stables. Un identifiant documentaire absent du catalogue ne se transforme pas automatiquement en fiche consultable du Studio.

La bibliothèque distingue déjà Atlas, Bestiaire, Objets et équipements, Sorts et rituels, Capacités et actions, Aventures et quêtes, Imagerie et Fiches de campagne. Le chantier d’enrichissement devra compléter ces rayons avec des références sources et des fiches reliées ; il ne doit pas reconstruire leurs composants fonctionnels.

## Pourquoi une nouvelle fiche n’apparaît-elle pas aussitôt dans la bibliothèque ?

Les pages Quartz et le catalogue embarqué du Studio ont des chemins de mise à jour distincts. Le script [build-catalogue.mjs](build-catalogue.mjs) sélectionne actuellement **92 références** dans la révision épinglée `88f774f3d0d6d520d8d11443b72202b9caf4f94b`. [bibliotheque.mjs](bibliotheque.mjs) construit ses liens sources à cette révision. Cette sélection protège la provenance des fiches et évite une importation implicite de contenus privés ou non approuvés.

Une mise à jour du catalogue devra donc former un **lot versionné et sourcé** : choisir la nouvelle révision, examiner les différences des sources, vérifier publication et spoilers, ajouter les références voulues aux catégories et régénérer le JSON. Les identifiants existants et les références déjà utilisées en campagne restent stables. Les profils mécaniques et leurs acquisitions font l’objet de contrôles distincts.

La recette devra vérifier le générateur avec `node studio-local/build-catalogue.mjs --check`, les recherches par rayon, les liens sources et Markdown, les images et les sauvegardes anciennes. La publication d’un texte Quartz ne constitue donc pas une preuve de sa présence dans le catalogue du Studio.

## Prompt à copier dans un chat ayant accès au dépôt

```text
Travaille dans le dépôt GitHub Sijiel44/archives-alrick.

Lot demandé : [sujet précis et petit périmètre].
Sources fournies : [nom, version et passages accessibles].
Fiches ou identifiants déjà connus : [codes et chemins].
Public et portée : [univers partagé / campagne / variante de table].
Éléments à compléter : [liste].
Décisions validées et questions ouvertes : [liste].

Lis AGENTS.md, CONTRIBUTING.md et CONTRAT_EDITORIAL.md.
Cherche les doublons et les fiches liées avant toute création.
Préserve les identifiants, les liens et les statuts existants.
Prépare les nouvelles fiches en brouillon avec publish: false.
Sépare faits sourcés, déclarations, hypothèses et propositions de jeu.
N’invente pas de source, de code approuvé ni de règle mécanique.
Garde les données privées hors des commits.
Propose les catégories et liens Markdown utiles au jeu.
Indique si le catalogue du Studio nécessite un lot de mise à jour distinct.
Exécute les tests appropriés et ouvre une PR sourcée sur une branche dédiée.
Présente les contradictions et décisions de canon au créateur.
Ne publie pas et ne fusionne pas sans autorisation du lot correspondant.
```

Si le chat ne peut pas lire les sources ou écrire dans le dépôt, lui donner les extraits partageables et demander une proposition Markdown ou un patch à relire. Ne pas lui faire prétendre avoir parcouru tout le projet. Conserver la PR et les fichiers sources comme trace de la décision ; un historique de conversation ne remplace pas le registre documentaire.

## Développements préparés, encore à réaliser

Le futur lot éditorial devra fournir un inventaire des références manquantes, une file de fiches à compléter, des liens « utilisé dans », un aperçu des différences de catalogue et une adoption explicite des références nouvelles. L’édition de contenu depuis le site et toute écriture GitHub nécessitent une conception d’accès distincte. Le parcours par PR ci-dessus est utilisable dès maintenant avec un assistant disposant des accès nécessaires ; aucun backend de publication du canon n’est annoncé livré ici.
