# ANT-DECH-007 — Contrat technique Univers / Studio MJ / Imagerie

**Mission :** introduire une compagnie marchande canonique et ses six personnes de référence, sans inventer de calcul 5d6 ni révéler les dossiers privés du MJ. **Date de rédaction :** 16 novembre 2026.

## Entrées sources et réutilisation

| Source de vérité | Code / contrat existant | Enrichissement ANT-DECH-007 |
| --- | --- | --- |
| Documentation Quartz | `content/groupes/ORG-DECH-01..06.md`, `content/personnages/PER-DECH-01..20.md` | `ORG-DECH-07.md` + `PER-DECH-21..26.md`, même frontmatter et mêmes liens `[[code]]` |
| Factions publiques | `studio-local/catalogue-organisations.json` ; schéma `entre-rives/organisations-publiques/1` | Entrée 07 additive, image `org-dech-07.svg`, relations existantes, version par `git hash-object` |
| Personnages publics | `studio-local/catalogue-antagonistes.json` ; schéma `entre-rives/antagonistes-publics/1` | Six entrées additives, trois `corruptionStage: Non Déchu`, `levelIntent` narratif seulement |
| Bibliothèque | `studio-local/bibliotheque.mjs` ; `libraryReference`, `buildLibraryIndex` | Copies `faction` et `npc` déjà prises en charge ; groupe « Maisons de négoce » non confondu avec les six institutions |
| Serveur local | `studio-local/serve.mjs`, liste blanche `studioAssets` | Type MIME WebP reconnu pour six portraits, SVG conservés pour les vingt précédents |
| Projection joueur | Fenêtre contrôlée par sélection explicite, CSP `connect-src 'none'` | Aucun transport des champs de note, fronts MJ, identités cachées ou historiques de pactes confidentiels |

## Fiches et illustrations

| ID | Type | Image principale | Situation | Niveau indicatif |
| --- | --- | --- | --- | ---: |
| `ORG-DECH-07` | `faction` | `images/organisations/org-dech-07.svg` | Compagnie de négoce, non assimilée à un culte | n. a. |
| `PER-DECH-21` | `npc` | `images/personnages-dechus/per-dech-21.webp` | Orianne, non Déchue | 17 |
| `PER-DECH-22` | `npc` | `images/personnages-dechus/per-dech-22.webp` | Maren, Rupture, une vraie Chute liée | 14 |
| `PER-DECH-23` | `npc` | `images/personnages-dechus/per-dech-23.webp` | Siva, Fêlure | 6 |
| `PER-DECH-24` | `npc` | `images/personnages-dechus/per-dech-24.webp` | Perrin, non Déchu | 9 |
| `PER-DECH-25` | `npc` | `images/personnages-dechus/per-dech-25.webp` | Mérine, Tentation | 4 |
| `PER-DECH-26` | `npc` | `images/personnages-dechus/per-dech-26.webp` | Gabin, non Déchu | 2 |

Les six portraits sont originaux, générés par ImageGen, puis encodés en WebP sans contenu distant. Chaque SVG déjà produit reste une variante graphique distincte, non utilisée par défaut. Les originaux des six anciennes illustrations vectorielles ne changent pas. La provenance et les textes alternatifs sont inscrits dans `studio-local/media/PROVENANCE.md` et les catalogues. Les images n'exposent pas de donnée de campagne.

## Sémantique du moteur et continuité

- `levelIntent` est une **intention narrative** bornée à 2–20. Ne pas la convertir en niveau effectif, attaque, défense, dommage, PV, mana, Emprise, point de foi ou protection de combat. Les profils doivent être choisis via INDEX/MATH/PNJ/COMBAT.
- `corruptionStage` décrit la position fictionnelle du personnage. `Non Déchu` signifie absence de transformation prouvée et **absence de Tribut automatique**. Pour Maren, la Rupture requiert une vraie Chute liée ; son identité sensible et sa procédure de libération sont documentées dans le dossier MJ hors Git.
- `version` est le SHA Git de l'objet source Markdown, recomputé par le test. Modifier une fiche implique un changement intentionnel de version du catalogue ; les copies de campagne sont des **instances séparées** et ne doivent pas être écrasées lors d'une évolution de la référence.
- `relations` et `factions` décrivent des liens consultables, pas une allégeance mécanique ni un contrat commercial automatiquement applicable.

## Parcours de recette reproductible

1. Exécuter `npm ci`, puis `npm run test:organisations` et `npm run test:antagonistes`. Contrôler sept organisations, vingt-six NPC, codes, SHA des fiches et intégrité des vingt SVG historiques plus six WebP.
2. Exécuter `npm test` : contenu, types, Quartz, liens, statistiques de progression, modules M01–M05, bestiaire, Grimoire, stockage et autres régressions du dépôt.
3. Dans le navigateur Chrome de CI : ouvrir le Studio → Bibliothèque → Organisations ; sélectionner **Maisons de négoce** et vérifier l'emblème et le chemin `ORG-DECH-07.md`.
4. Ouvrir une campagne fictive, copier cette faction ; contrôler que l'objectif et les membres passent dans la **copie locale** sans changer le catalogue public. Ajouter une note privée canari et vérifier son absence du récepteur joueur.
5. Ouvrir **Personnages et lieurs** ; parcourir la pagination des 26 références. Vérifier Maren et Gabin, leurs portraits, leurs niveaux indicatifs et la création d'une copie `npc` avec note privée non projetée.
6. Tester export/restauration d'une campagne avec une faction et un PNJ via les parcours standard STUDIO/ARCHIVES. Ce lot ne modifie ni le format de sauvegarde ni le journal d'événements : la régression existante en est la preuve, pas une migration nouvelle.
7. Sur le commit final : attendre la CI GitHub et vérifier les URL **Pages** des sept fiches et des sept visuels principaux après fusion. Les sorties non approuvées et les notes MJ ne doivent donner aucune URL publique.

## Surfaces de risque et décisions ouvertes

**Public/privé :** les catalogues publics ne contiennent pas `secret`, `lieur_id`, note privée, `campaign_id`, attribut de combat ou données utilisateur. Les portraits et emblèmes sont des ressources WebP/SVG sans scripts ou liens tiers. Les secrets de pactes sont stockés uniquement dans un document privé du créateur, hors dépôt et hors Pages. Une fenêtre de projection vide ne doit rien inférer des copies en stockage local.

**À valider par INDEX/MATH/MAG/COMBAT :** effets chiffrés éventuels des trois objets rituels (garantie, registre, cachet), conditions de renoncement et dégâts si une opposition devient martiale. **À revoir par PNJ/LORE :** âges, langues, régions précises et raccords avec les personnages existants. **À revoir par STUDIO/QA/ARCHIVES :** tests de restauration et de sélection explicite des images. **À valider par DG/créateur :** toute future publication de secrets ou fiche de règles chiffrées.
