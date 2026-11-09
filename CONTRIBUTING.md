# Enrichir Les Chroniques d’Entre-Rives

Les Archives d’Alrick servent de source à l’univers. Les fiches vivent dans `content/`. Les sources, décisions éditoriales et chemins de publication sont détaillés dans le [contrat éditorial](CONTRAT_EDITORIAL.md). Les contenus générés dans `public/` sont reconstruits par GitHub Actions.

1. Dans Codex ou un assistant ChatGPT relié à GitHub, ouvrir le dépôt `Sijiel44/archives-alrick` si ton compte y a accès. Un contributeur externe peut proposer un changement depuis son fork GitHub. Travailler sur une branche dédiée à une fiche ou à un ensemble cohérent.
2. Rechercher les fiches liées et les sources primaires du dépôt avant d’écrire. Préserver les codes existants et les liens. Indiquer pour chaque ajout la source précise et distinguer les faits joués, les éléments de lore validés et les propositions.
3. Préparer les nouvelles fiches comme brouillons avec `publish: false`. Les avertissements et le retrait des index servent aux révélations déjà approuvées pour publication. Les dossiers réellement privés restent dans `private/` sur le poste du MJ. Garder aussi les sauvegardes et paquets de scénario privés en dehors des commits.
4. Lancer `npm ci` puis `npm test`. Ouvrir une pull request avec les sources, les fiches liées et le résultat des contrôles. Le créateur valide le statut éditorial et décide du lot à mettre en ligne.

Pour lancer un travail depuis un chat, donner un sujet précis. Par exemple, demander de « préparer une proposition de fiche sur un lieu de Valbrume, sourcer les éléments et ouvrir une pull request pour relecture ». Les contributions suivent le même parcours que les corrections humaines. Le [workflow Pages](.github/workflows/pages.yml) déploie le lot explicitement approuvé sur `main`.
