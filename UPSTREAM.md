# Provenance technique

- Moteur : [Quartz 5](https://github.com/jackyzha0/quartz), branche `v5`, commit `97a2d05f80c4c50534959b1d0d41cc4b3895625e`.
- Le répertoire `quartz/` contient le moteur officiel et les adaptations locales. Sa licence MIT est conservée dans `LICENSE.txt`.
- Les utilitaires inutilisés `quartz/util/emoji.ts` et `emojimap.json` (15 Mo, destinés aux images sociales automatiques) ne sont pas embarqués. Le plugin d’images sociales automatiques est désactivé ; une image sociale statique est fournie.
- Plugins Quartz : paquets `@quartz-community/*` verrouillés dans `package-lock.json`.
- Thème : `@quartz-themes/core` et `@quartz-themes/its-theme` 1.0.1, variante `ttrpg-dnd`. La licence de ce dernier est GPL-2.0 ; voir son [dépôt source](https://github.com/quartz-themes/its-theme) et sa licence dans `node_modules/@quartz-themes/its-theme/LICENSE` après installation. Son intégration concerne les styles, pas le lore de campagne.
- Police d’interface : polices système ; aucun téléchargement de Google Fonts.

## Adaptations du moteur à conserver lors des mises à jour

- `quartz.ts` : chargeur YAML Quartz 5, composants d’Alrick, cadre de page et remplacement du dispatcher par celui utilisant la disposition finale.
- `quartz/components/Alrick.tsx`, `frames/AlrickFrame.tsx`, `scripts/alrick.inline.ts`, `styles/custom.scss` : interface et avertissement natif à chaque page MJ.
- `Head.tsx` : directives anti-indexation MJ et chemin de favicon local pour la 404.
- `renderPage.tsx`, `plugins/pageTypes/dispatcher.ts`, `util/ctx.ts` : prise en compte de `--baseDir` pour la recherche et la 404.

Le champ `version` de `package.json` désigne l’édition du site (0.1.0). Le moteur reste Quartz 5, au commit identifié ci-dessus.

Les licences techniques tierces conservent leur portée d’origine. Aucun droit de réutilisation public n’est accordé ici sur les textes, personnages et illustrations de campagne.
