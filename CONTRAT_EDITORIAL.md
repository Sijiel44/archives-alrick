# Contrat éditorial de continuité — Les Archives d’Alrick

## Principes non négociables

1. Le **brut de campagne** est l'archive première ; les six volumes consolidés sont des synthèses et indices ; le site présente un état lisible et sourcé. Un ancien état n'est pas forcément le canon actuel.
2. **Source affichée** pour tout changement de canon : code CB + intervalle de paragraphes quand disponible. Jamais de référence inventée.
3. Ne pas convertir une **intention ou une préparation** en événement joué. Mentionner les suites ouvertes sans les présenter comme des faits acquis.
4. « **Rappelé** » (mort revenu à la vie via Orin) et « **Revenant** » (compagnie d'Orin) sont des champs *indépendants*. De même pour emploi, résidence, allégeance, Maison, parenté et titres.
5. Une nouvelle fiche doit posséder un **code stable et unique**, un titre humain, une catégorie, un état documentaire, et ses sources. Le dossier où elle se trouve n'est pas une preuve de son statut canonique.
6. L'IA prépare des **propositions de modifications** ; la validation éditoriale précède la publication.
7. Le code `CB42` indique une session source ; ne pas le confondre avec une date du calendrier fictif. Les dates de fichiers ne datent pas les événements du monde.
8. Les spoilers choisis sont permis dans `content/mj/`, avec `spoilers: true`, `unlisted: true` et un avertissement sur chaque page. Les joueurs peuvent y accéder volontairement. Les notes personnelles, le brut et l’inventaire de travail restent hors site et hors dépôt. Cette politique remplace celle du kit initial, conformément au projet de partage de l’univers.

## Valeurs permises pour `canon_statut`

- `faits_joues` — événement ou constat attesté en scène ;
- `declaration` — affirmation d'un personnage, pas garantie que le monde l'ait démontrée ;
- `projet_en_cours` — accord et intention, sans réalisation finale ;
- `hypothese` — explication incertaine ou de recherche ;
- `proposition_non_jouee` — pure suggestion éditoriale/MJ, à stocker plutôt hors `content` ;
- `historique` — ancienne formulation conservée pour traçabilité ;
- `a_verifier` — insuffisamment recoupé pour devenir canon.

Ces valeurs caractérisent une **fiche dominante**. Une page contenant plusieurs types de faits doit aussi distinguer chaque section par une légende explicite. Le statut d'une fiche entière ne rend pas tous ses paragraphes incontestables.

## Modèle conseillé

**Présentation narrative** en tête, **état vérifié** immédiatement dessous, **limites/contraintes**, **éléments ouverts**, **sources**, **liens**. Les gabarits spécialisés enrichissent ensuite l'identité, les relations ou les fonctions, sans changer les champs communs.

## Illustrations et portraits

Les illustrations web validées sont rangées dans `content/images/` (sous-dossiers par domaine). Formats acceptés : WebP, AVIF, PNG ou JPG, avec une limite de **3 Mio par fichier**. Les images SVG, documents sources, archives et autres fichiers binaires non approuvés restent exclus du site. Une page Markdown peut faire référence à une image locale avec un chemin relatif, par exemple `![Heimdall](../images/personnages/heimdall-portrait.webp)` depuis `content/personnages/REV-06.md`. Le contrôle du site doit vérifier que chaque image publiée est disponible à son URL finale. Les illustrations officielles doivent être approuvées par le créateur ; une image conceptuelle ne devient pas canonique par sa seule présence dans le dépôt.
