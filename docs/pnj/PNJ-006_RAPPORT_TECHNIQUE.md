# PNJ-006 — Rapport technique : le quotidien de Corvelis et ses voisins

**Date :** 16 novembre 2026 · **Mission :** sixième lot PNJ-001, documents déjà existants · **Branche :** `feat/pnj-001-fiches-illustrees-v01` · **Statut :** proposition non canonisée, PR brouillon.

## Contrat, dépendances, sources

Périmètre : enrichir douze fiches existantes indépendamment de la campagne fondatrice, sans réinventer les événements ni les individus. Références primaires disponibles dans ce dépôt : les douze fichiers `content/personnages/` ci-dessous, leurs ancres `source_brute` (CB42/CB43 et Compendium), `AGENTS.md`, `CONTRIBUTING.md`, `CONTRAT_EDITORIAL.md`, moteur de galerie `experiments/pnj-v01/` et workflow `.github/workflows/pages.yml`. La certification LORE des campagnes brutes demeure distincte de cette reprise de fiches.

| Code source | Personnage | Points vérifiés dans la fiche | Proposition ajoutée |
| --- | --- | --- | --- |
| SEC-69 | Téodan Veyre | Relevés agricoles ; travail avec Lysandra ; aucun mandat de signer | Enquête sur les coûts de transport |
| SEC-70 | Mara Belden | Exploitante d'environ 50 ans ; essais avec Orin | Choix d'un essai réversible sans surcharge |
| SEC-71 | Hélène Varrec | Comparaison de parcelles ; démarche non imposée | Démonstration à refaire sur sol humide |
| SEC-72 | Jorven Halrec | Pertes au moulin/stockage ; vol non établi | Inventaire contradictoire |
| SEC-73 | Hervald Trois-Sillons | 76 ans ; barbe courte blanche ; chariot et dévers | Test de correction et concept visuel |
| SEC-54 | Corin d'Avarenne | Démarche d'audience ; aucun traité signé | Clarifier un mandat avant négociation |
| PER-CB42-SIGRUN-VAREK | Sigrun Varek | Tunnel/bastions seulement envisagés | Refus de vendre un passage non autorisé |
| PER-CB43-DORSA-VAUN | Dorsa Vaun | Naine de 68 ans ; mission d'observation | Examen des charges de travail sans embauche |
| SEC-65 | Sigrun Pierreval | Aldhammar ; mémoire de Harald ; préparatifs | Audit des lieux avant une réouverture |
| SEC-64 | Reginald | Tavernier dans un souvenir, présent inconnu | Retour en arrière explicitement marqué |
| SEC-29 | Yrsa Veld | Cousine déclarée de Maëron ; ports | Vérification d'un patronage prétendu |
| SEC-05 | Garrik | Taverne ; recette de Maëlys | Réception sans prise de contrôle extérieure |

## Résultat et architecture de données

- Catalogue prototype : **90 identités**, six lots ; la sélection conserve son `file` source et ne crée pas de biographie parallèle.
- **81 sources enrichies** en tout par les lots PNJ ; **12 supplémentaires** dans PNJ-006, avec sections « En jeu — pistes proposées, non jouées ».
- **15 portraits locaux** dont **8 concepts non validés**, **75 emblèmes de repli** et 3 images d'ambiance externes facultatives. Nouveau visuel : `hervald-trois-sillons-concept-v01.webp`, notice distincte.
- Fiches et variantes 5d6 : **aucun chiffre, XP, rang, pouvoir ni contrat inventé**. Plusieurs profils versionnés pourront être associés plus tard à un identifiant de personnage stable par INDEX/MATH, sans dupliquer le texte source.
- Les sources gardent leurs `publish`, `spoilers`, `unlisted`, `canon_statut` et leurs ancres. Les deux projets `projet_en_cours` demeurent projets.
- Le catalogue MJ `cabinet-des-rencontres-v01.md` reste `publish:false`, `spoilers:true`, `unlisted:true`. Huit fiches sources des précédents lots restent `publish:false` : non éligibles à publication par simple inclusion dans la galerie.
- L'index public `content/personnages/index.md` reçoit uniquement un sommaire descriptif des douze **sources déjà `publish:true`** et prévient de leurs révélations.

## Contrôles et recette

Commandes reproductibles :

```bash
node experiments/pnj-v01/build.mjs
node --test experiments/pnj-v01/test.mjs
npm test
git diff --check
```

**Exécution locale :** génération 90 cartes / 15 portraits / 3 externes ; tests PNJ **7 réussis sur 7**. `npm test` : **réussi, sortie 0**, dont vérification de 387 pages choisies / 285 codes uniques, typage, build Quartz (475 fichiers lus, 1178 pages HTML et 68 964 ressources/liens vérifiés), organisations, antagonistes, M01–M05, Bestiaire, Grimoire et MAG-003. Contrôle CI du commit final : à renseigner après exécution GitHub. Recette humaine en attente : galerie PC/tablette, lisibilité sur petit écran, liens vers les sources, contrôle d'affichage d'image facultative et exclusion des notes privées en projection joueur.

## Mise en ligne — vérification du dispositif existant

La demande de mise en ligne du créateur est enregistrée. L'index des douze noms est préparé pour la branche PNJ. Cependant le workflow Pages `.github/workflows/pages.yml` demande lors du déploiement manuel la confirmation **« J’ai relu les fiches et j’accepte de rendre ce site et les spoilers MJ consultables »** (`contenu_revu:true`). Le référent PNJ ne peut pas attester au nom du créateur que cette revue a eu lieu. La PR PNJ est **brouillon** et peut intégrer d'autres changements en attente ; une fusion en bloc ne constitue pas une publication prudente de douze portraits.

**Porte de sortie :** relire les douze fiches et la section de l'index, obtenir l'accord éditorial explicite du créateur sur leurs contenus et leurs révélations, puis demander à DG/INTÉGRATION de sélectionner une publication autorisée. Ne pas cocher la confirmation de revue par défaut. Ne pas mettre le catalogue MJ brouillon ni les huit sources `publish:false` en ligne.

## Transmission préparée, non envoyée automatiquement

- **LORE :** recouper les ancres CB42/CB43 et résoudre la généalogie nommée de Corin.
- **INDEX/MATH :** décider du lien `personnage.code → profil_5d6_id@version`, sans XP ou maîtrise attribuée.
- **STUDIO/ATELIERS :** source unique, variantes en copie, portrait à valider et filtre de publication liste blanche ; crédits externes et opt-in.
- **QUÊTES/AVENTURES :** douze amorces réutilisables, sans faire passer les variantes pour des épisodes joués.
- **DG/INTÉGRATION :** validation éditoriale, revue de spoilers et contrôle du déploiement.

**À revoir par LORE, INDEX, STUDIO/ATELIERS, QUÊTES et QA. À valider par DG/créateur : contenu, illustration, périmètre public, déclenchement Pages.**
