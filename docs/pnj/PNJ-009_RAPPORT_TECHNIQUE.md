# PNJ-009 — Rapport technique de diffusion des fiches documentées

**Date :** 16 novembre 2026. **Nature :** diffusion du corpus existant, non création de nouveaux individus.  
**Référence d'autorisation :** demande explicite du créateur d'ouvrir toutes les fiches aux lecteurs et joueurs, avec possibilité de versions maison pour les MJ. **Pas d'altération du moteur 5d6, des sauvegardes ni du canon.**

## Diagnostic

Le rayon Studio précédemment diffusé ne présentait que 16 entrées, dont trois dragons. La galerie autonome avait 102 références mais treize sources restaient `publish:false` ; plusieurs autres étaient publiées avec avertissement, sans lien navigable depuis l'index principal. Il existait donc une différence entre **fiches produites**, **fiches générées sur Pages** et **fiches découvertes par l'interface**.

## Correctifs

- Treize frontmatters corrigés vers `publish:true`, en conservant les étiquettes `canon_statut:a_verifier` et les avertissements de révélations selon le dossier.
- Le Cabinet des Rencontres est un index public de 102 fiches historiques, lié depuis l'index principal des personnages. Les lecteurs sont informés que certains chemins dévoilent la campagne fondatrice.
- `build-studio-catalogue.mjs` recompose toutes les références de la `selection.mjs` et conserve les trois dragons du catalogue antérieur ; il refuse une disparition sous les 102 sources historiques, une source non publique ou une collision de code.
- Le rayon Studio expose 105 entrées et des liens vers les fiches, sans recopie de biographies : les sources Markdown restent uniques.
- Les portraits conceptuels originaux de **Kelm Poing-Calme** (demi-orc) et **Ylva** (instructrice) sont ajoutés, avec légende et réserve de validation artistique. Les trois images d'inspiration externes restent sourcées/licenciées ; aucune image tierce non autorisée n'est importée.
- Les tests de catalogue et de contenus sont ajustés. La liste des personnages n'est pas scindée selon qu'un épisode a été joué ou non : la provenance reste une donnée documentaire, non une règle de disponibilité.

## Vérifications à consigner au commit de publication

```bash
node experiments/pnj-v01/build.mjs
node experiments/pnj-v01/build-studio-catalogue.mjs
node --test experiments/pnj-v01/test.mjs experiments/pnj-v01/catalogue.test.mjs
npm test
git diff --check
```

**Attendus reproductibles :** 102 sources uniques et publiées ; 105 entrées du rayon avec exactement trois dragons ; 18 portraits locaux dans la sélection et trois inspirations externes ; sortie Quartz comportant le Cabinet et chaque page liée ; aucun champ de sauvegarde privée.

**Résultats locaux (16 novembre) :** `npm test` **réussi** ; 1 212 pages HTML, 70 574 liens et ressources internes vérifiés ; 401 pages explicitement publiées, 298 codes uniques ; tests PNJ **10/10** ; `git diff --check` sans anomalie. Une première tentative de `npm test` avait révélé un lien public cassé d'Astrid vers un projet non publié ; corrigé avant la seconde exécution verte.

**CI, PR, SHA, Pages et recette live :** à consigner après exécution dans le compte rendu de livraison ; ne pas supposer une mise en ligne sur la seule réussite du build local.

## Dépendances et transmission

- **LORE :** recouper les douze compléments PNJ-007 et les éventuelles contradictions des sources brutes.
- **STUDIO/ATELIERS :** rendre le nombre d'entrées variable, préserver les copies de travail MJ et l'accès public ; préparer la prochaine vague de portraits et leurs crédits.
- **INDEX/MATH :** les profils 5d6 sont des variantes versionnées, non des biographies dupliquées ; XP et prérequis restent à arbitrer.
- **QUÊTES/AVENTURES :** les accroches sont de nouvelles possibilités de jeu, pas des scènes historiques par défaut.
- **QA/INTÉGRATION/DG :** exécuter les tests, valider les statuts éditoriaux, fusionner uniquement après réussite CI et contrôler Pages.

**À revoir par LORE, STUDIO, ATELIERS, INDEX, MATH et QA. À valider par DG/créateur : les nouveaux portraits et toute canonisation ; la diffusion publique des fiches est demandée.**
