# PNJ-005 — Rapport technique du cinquième lot

## Mission, sources et limites

Demande créateur : continuer l'enrichissement de **personnages existants et documentés**, sans créer d'identités nouvelles tant que ce fonds n'est pas traité ; préparer de belles fiches illustrées pour la future version du site. Travail limité aux fiches `content/personnages/`, aux images sous `content/images/personnages/`, au prototype `experiments/pnj-v01/` et aux rapports `docs/pnj/`. **Aucun changement à Quartz public, au moteur 5d6, au code Studio P0 ou aux sauvegardes de campagnes.**

Références consultées : `AGENTS.md`, `CONTRIBUTING.md`, `CONTRAT_EDITORIAL.md`, douze fiches sources du lot et registre expérimental PNJ-001/004. Les documents cités en `source_brute` par les fiches servent de traçabilité ; leur certification intégrale demeure du ressort de LORE. Le présent enrichissement **ne prétend pas vérifier l'intégralité de CB42 et CB43**. Les détails narratifs nouveaux sont toujours classés comme propositions non jouées.

## Inventaire du lot et garde-fous

| Fiche | Code documentaire source | Statut/source conservé | Point à vérifier lors de la revue |
| --- | --- | --- | --- |
| Saëlor Feuilledor | `RES-04` | `projet_en_cours`, **non publiée** | Visite de principe ≠ contrat, ni rencontre déjà jouée |
| Silan de Sept-Ponts | `RES-09` | `faits_joues`, spoiler | Contrat secrétaire de voyage signé CB43, sous Nahla |
| Orvak Main-de-Velours | `RES-11` | `faits_joues`, spoiler | Accueil du Palais en exercice, aucune promotion ajoutée |
| Soren Malderive | `RES-17` | `projet_en_cours`, **non publiée** | Disponibilité à confirmer, pas de contrat ; distinct du marin Sören |
| Bromvar des Vieilles Clefs | `RES-19` | `faits_joues`, spoiler | Rappelé libre, aucune charge de concierge acceptée |
| Edran Veille-au-Feu | `RES-20` | `lore_valide`, **non publiée** | Décédé, aucun Rappel ; scènes historiques uniquement |
| Aurélian Vire-Sel | `RES-21` | `faits_joues`, spoiler | Rappelé, fonctions culinaires au Palais acceptées CB43 |
| Hroldan Trois-Clefs | `SEC-75` | `faits_joues`, spoiler | Rappel avec consentement, poste refusé/non décidé ; lien Harald |
| Tavian Relsor | `PER-CB43-TAVIAN-RELSOR` | `faits_joues`, spoiler | Mandat préparatoire Orinor, aucun rapport final attesté |
| Elwen Saurel | `SEC-66` | `faits_joues`, spoiler | Contrat Maison signé ; ancienne erreur d'espèce ne crée pas d'homonyme |
| Beren Haubans-Gris | `RES-26` | `faits_joues`, spoiler | Second de Thaléa engagé, équipage complet non prouvé |
| Mara Ventrevent | `RES-27` | `faits_joues`, spoiler | Maîtresse d'équipage signée ; formation de Larek sous Thaléa ; distincte des autres Mara |

## Changements contrôlés

1. **Douze références additionnelles** dans `selection.mjs`, soit **78 cartes uniques**, avec noms, statuts, ancres, sources, avertissements et publication relus **directement des fiches source** par `build.mjs`. Pas de duplication de biographies ni de faits joués dans la sélection.
2. **Douze enrichissements** sur les pages source, chacun séparant explicitement **attitude et contradiction proposées, rencontre à choix, réplique fictive, limites documentaires**. Aucun code, date, âge, parenté, statut de canon, contrat ou source brute n'est altéré.
3. **Portrait original** `mara-ventrevent-concept-v01.webp` généré pour le prototype puis optimisé en WebP sous 3 Mio. Association volontaire et `illustrationValidee:false`; provenance, choix visuels et prompt archivés dans `PNJ-005_SOURCE_VISUELLE.md`.
4. Mise à jour du catalogue Markdown qui demeure `publish:false`, `spoilers:true` et `unlisted:true` ; prototype HTML local régénérable, sans exposition automatique sur Quartz ou dans la fenêtre joueur du Studio.
5. Les trois images externes de PNJ-003 restent **désactivées avant consentement**, accompagnées de licence/credit/source, jamais assimilées à des portraits canoniques. Aucune image d'un autre site ajoutée dans ce lot.
6. **Une identité unique, plusieurs adaptations possibles** : aucun attribut ou pouvoir 5d6 n'est créé. Les futurs `profileId`/`profileVersion` restent dépendants d'INDEX/MATH. La formation de Larek n'accorde aucune capacité, prérequis ou XP de droit.

## Recette reproductible

```bash
node experiments/pnj-v01/build.mjs
node --test experiments/pnj-v01/test.mjs
npm test
git -c core.whitespace=cr-at-eol diff --check
```

**Contrôles locaux au 16 novembre 2026 :**

- Générateur : **PASS**, 78 cartes, 14 portraits locaux, 3 inspirations externes.
- Tests PNJ : **PASS 6/6**, dont nouveaux cas de non-publication, personnages décédés, identités Soren/Mara/Elwen, illustration non validée et séparation des fiches sources.
- `npm test` : **PASS**, code de sortie 0 ; contrôle de contenu (387 pages et 285 codes uniques), TypeScript, Quartz, 1 178 pages HTML et 68 915 liens/ressources, suites 5d6, organisations, antagonistes, Bestiaire, Magie et Grimoire.
- `git -c core.whitespace=cr-at-eol diff --cached --check` : **PASS** ; les 23 fichiers du lot ont été ajoutés explicitement à l'index sans inclure le répertoire tiers `artifacts/`.
- Recette humaine de lecture PC/tablette : **ouverte** ; les captures CI générales du Studio ne prouvent pas une intégration de ce prototype à son interface.

## Autres modules et questions ouvertes

- **LORE :** preuves primaires à certifier sur CB42/CB43 ; identité d'Elwen et sort d'Edran, statut de contrat pour chaque personne.
- **INDEX/MATH :** une fiche stable peut alimenter plusieurs adaptations 5d6 versionnées ; XP/prérequis, mentorat collectif et disponibilité restent à arbitrer hors du texte narratif.
- **STUDIO/ATELIERS :** copie de travail et variant visuel liés par `code` ; garder les sources non publiées, les notes MJ, la sélection joueur et la recherche publique dans des couches distinctes.
- **ARCHIVES/QA :** texte, codes, images, statuts, export futur, protections des fiches et tests de restauration à vérifier sans toucher aux sauvegardes actuelles.
- **QUÊTES/AVE :** réutiliser ces rencontres comme propositions autonomes, avec consentement des PNJ et issues non imposées.

**À revoir par :** LORE, INDEX, MATH, STUDIO, ATELIERS, ARCHIVES, QA, QUÊTES, AVE.

**À valider par DG/créateur :** illustration, publication, profils éventuels et intégration au site ; aucune fusion ou canonisation sans autorisation.
