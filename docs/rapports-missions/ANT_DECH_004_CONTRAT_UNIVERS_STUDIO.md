# ANT-DECH-004 — Contrat de données « organisations » (Univers ↔ Studio MJ)

**État :** v1 livrée sur branche de mission. **Périmètre :** six organisations publiques de la Déchéance et de ses contre-pouvoirs. **Décision éditoriale :** le créateur a demandé le 15 novembre 2026 que les organisations développées ensemble soient canoniques et publiées directement. Cette décision ne transforme pas leurs actes possibles en événements déjà joués.

## Deux représentations, une même identité

| Couche | Fichier ou objet | Portée | Invariant |
| --- | --- | --- | --- |
| Univers | `content/groupes/ORG-DECH-0x.md` | Canon partagé, public | Code stable, statut `lore_valide`, textes, alliances et limites accessibles aux joueurs |
| Médias | `quartz/static/images/organisations/org-dech-0x.svg` | Illustration publique | Emblème original, texte alternatif, aucune ressource externe exécutée par le SVG |
| Répertoire Studio | `studio-local/catalogue-organisations.json` | Référence publique embarquée | Même ID, chemin source, version = SHA Git du contenu Markdown, illustration, relations publiques |
| Copie de campagne | `CREATION_TYPES.faction` dans les créations locales du MJ | Instance éditable et privée | ID local distinct, lien `links` vers `ORG-DECH-0x`, état et notes propres à la campagne |

La bibliothèque du Studio fusionne ce **petit catalogue additif** avec le catalogue historique épinglé `catalogue-archives.json`. Elle n'ingère pas automatiquement l'ensemble du dépôt, et un ancien monde local reste ouvrable lorsque de nouvelles organisations sont ajoutées.

## Contrat public version 1

Le fichier `catalogue-organisations.json` suit `entre-rives/organisations-publiques/1` et n'accepte que les propriétés documentaires suivantes :

- `id` : code documentaire stable et non réutilisable ;
- `version` : SHA Git du *blob Markdown* publié, recalculé lorsque sa source change ;
- `path` : chemin relatif exact dans le dépôt ;
- `image` / `artAlt` : nom d'un emblème dans la liste autorisée et texte alternatif ;
- `name`, `description`, `purpose`, `members`, `influence`, `limits` : contenus présentables au joueur ;
- `relations` : autres IDs de références publiques ;
- `tags` : termes de recherche sans révélations.

Dans `bibliotheque.mjs`, les entrées deviennent `kind: faction`, `shelf: factions`, `origin: archives`, `status: lore`. Le Studio expose la source GitHub et son illustration dans la fiche. Une action explicite **Créer une faction de campagne** préremplit les champs `name`, `description`, `purpose`, `members` et `influence` puis ajoute l'ID de référence dans les liens de la nouvelle création. Elle ne copie ni données de table, ni champs cachés, ni pouvoirs.

Les ressources illustrées sont servies à deux chemins :

- **Quartz public :** `/archives-alrick/static/images/organisations/org-dech-0x.svg` ;
- **Studio statique :** `/archives-alrick/studio/images/organisations/org-dech-0x.svg`.

L'hôte local du Studio ne sert que les six noms de fichiers prévus. Toute image proposée ultérieurement devra avoir une provenance et des droits explicites ; les portraits de PNJ relèvent de la mission PNJ. Les emblèmes originaux sont des illustrations de factions, **pas** des portraits d'individus canoniques.

## Préserver la distinction entre référence, instance et événement

1. **Référence** — Une organisation existe dans l'univers ; ses mandats et limites sont connus. Elle n'est ni toute-puissante ni présente dans chaque campagne.
2. **Instance** — Le MJ crée dans sa campagne un comptoir, une antenne locale, une coalition concurrente ou une variante par copie de travail. Sa révision et ses annotations demeurent privées. Le lien vers le code source évite les homonymes et facilite la navigation, sans resynchroniser la copie à l'aveugle.
3. **Fait joué** — Accord signé, capture, réforme, désastre ou dissolution ne deviennent événements de campagne qu'après un acte à la table ; ils n'altèrent pas le canon partagé par leur simple existence en sauvegarde.

**Sécurité :** les notes, révélations de pacte, agents infiltrés, échéances cachées et identifiants de campagne ne doivent jamais figurer dans `content/`, dans le JSON public ou dans les métadonnées et légendes des images. La fenêtre joueur doit rester une projection volontaire d'éléments publics choisis. Les exports du MJ conservent leur caractère privé ; les copies ne sont pas téléversées sur le site.

**Mécanique :** les fiches sont descriptives. Elles n'ajoutent aucun bonus 5d6, capacité spéciale, profil PNJ ou pouvoir surnaturel. Une éventuelle conversion numérique devra réemployer les objets de règles approuvés et passer par INDEX/MATH, avec les profils PNJ/Bestiaire sous leurs responsables respectifs. Les menaces politiques et matérielles doivent toujours avoir des moyens, limites et alternatives négociables.

## Recette et évolutions

- `npm run test:organisations` : six sources publiées, IDs, SHA, liens, visibilité, interdiction de secrets et absence de mécanique inventée.
- `npm run check:content`, `npm run build`, `npm run check:site` : métadonnées, image dans l'assemblage, liens Markdown et Quartz.
- `CHROME_BIN=... node --test studio-local/tests/organisations.test.mjs` : rayon des factions → six images → fiche source → campagne locale → copie modifiable → note MJ non projetée.
- CI GitHub : le même parcours navigateur est inscrit dans la suite Studio ; vérifier le Pages public après fusion.

Pour une prochaine version, proposer à STUDIO et INDEX : `sourceRef={id,version,kind}` dans le modèle commun, comparaison de révisions **sans écrasement**, icônes d'alliance/hostilité explicitement propres à une campagne, relation typée faction/PNJ/lieu, et adaptation facultative vers scène/rencontre. Ne pas étendre silencieusement le format JSON v1.
