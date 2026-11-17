# MATH-SITE-001 — Audit des raccords et publication pilote 5d6

**Référent :** 10 MATH — Les Chroniques d’Entre-Rives
**Base de travail :** `main` au `c34ada7e73758582e3b1dec3dba8e99a37478180` (17 novembre 2026, contrôlé avant intervention).
**Statut :** lot de navigation et de documentation préparé pour recette et décision d'intégration ; aucune modification des formules M01–M03.

## Constat avant modification

| Parcours observé | Existant constaté | Manque traité / suite |
| --- | --- | --- |
| Accueil nouveau site `studio-local/accueil.html` | Entrées Bestiaire, univers, joueurs, Studio et exemple de jet 5d6 | Entrée **Mathématiques** au menu et au parcours joueurs |
| Studio MJ `studio-local/index.html` | Menu Bibliothèque, Créations, Bestiaire ; bouton « Arbitrer une action · 5d6 » et « Opposition · M03 » | Entrée permanente **Mathématiques** et aide visible pendant une opposition |
| Préparation scènes et bibliothèque | Copies de créatures, fiches 5d6, éditeur de personnages, `prefillWorkshop` pour créations PNJ/monstres | Bouton public « Préparer un profil 5d6 (variante MJ) », guide depuis « Préparer » |
| Bestiaire `atelier-bestiaire.mjs` | `createBestiaryCard(level, archetype, kind, role)`, cinq archétypes, trois rôles ; preview puis ajout à une campagne | Code de **réglage** `N05-GARDIEN-DEFENSIF`, lisible et recalculé avec la sélection ; distinguer code et identifiant documentaire |
| Guides Quartz `content/jouer/...` | Deux guides Markdown riches avec huit illustrations, mais présents sur branche MATH de conception et non `main` | Réimport dans le lot et publication **pilote**, avertissements M03/expérimental maintenus |

## Méthode pour chiffrer une créature sans l'uniformiser

1. **Fiche source** : espèce/personne, histoire, habitat, capacités attestées et provenance (inchangés).
2. **Profil de campagne** : `niveau (1–25)` × `archétype (faune, prédateur, gardien, mystique, colosse)` × `rôle (offensif, défensif, soutien)`. Un **code de réglage** facilite la comparaison et la duplication mais n'est **ni l'ID d'espèce ni l'ID d'instance**.
3. **Caractéristiques et calculs** : réemployer uniquement le générateur M03 `generateCreatureProfileM03` existant et son adaptateur `createBestiaryCard`. Les profils de créature suivent le contrat créature, distinct du budget de personnage joueur.
4. **Personnalisation** : variations qualitatives, équipement effectivement défini, techniques homologuées et décision du MJ ; pas de valeur chiffrée déduite automatiquement de la seule description d'une espèce ou d'un objet.
5. **Vie de la fiche** : prévisualiser → décider → sauvegarder une **copie locale distincte** ; en combat, vérifier opposition, coûts éventuels, état courant de protection et confirmation humaine.

## Parcours de référence

- **Préparation** : Bibliothèque → PNJ ou créature → « Préparer un profil 5d6 (variante MJ) » → niveau/archétype/rôle → prévisualisation → ajout à la campagne. Le nom et le texte public sont préremplis, mais aucun score n'est imputé à la fiche source.
- **Séance** : personnage ou créature déjà profilé → Arbitrer 5d6 / Opposition M03 → confirmer l'application → sauvegarder l'événement si le contrat l'autorise. **Deux gestes fréquents** restent l'objectif UX, non une promesse universelle avant recette.
- **Lecture publique** : Accueil → Mathématiques → exemples illustrés et liens vers les guides détaillés Quartz. Le Studio offre le même accès depuis son menu.

## Décisions et limites ouvertes

- **Rattachement réel à un PNJ existant** : l'Atelier crée aujourd'hui une *nouvelle copie chiffrée*. Il ne modifie pas en place une création PNJ ni ne relie automatiquement une variante au même ID source. Mission suivante DATA-MODEL/INDEX/STUDIO : référence source stable, `profileInstanceId`, lien bidirectionnel, remplacement explicite, retour à l'original, import/export idempotent, et test de séparation public/privé.
- **Variantes par rôle** : la base M03 distingue cinq archétypes ; le rôle change notamment certains profils PNJ, **mais pas toutes les valeurs des créatures**. Étudier variations déterministes bornées des rôles et des écarts individuels, avec tests N1/5/10/15/20/21/25, sans modifier M03 de production sans arbitrage.
- **Rapidité des combats** : revoir les duels défensifs de haut niveau, DPT, taux de touche, durées estimées, combats de groupe, choix tactiques et effets mentaux. Ne pas promettre une durée courte à tous les niveaux tant que les simulations n'ont pas statué.
- **Éveil divin** : N20 ouvre l'éveil, N21 le divin affirmé ; N25+ réservé avant tout aux PNJ extraordinaires. Les multiplicateurs, la maîtrise hors niveau et les dépenses associées restent au banc.
- **Mana et enchantements** : aucune charge, récupération ou bonus n'est déduit du nom ou du niveau ; coûts et intensités expérimentaux restent signalés et non homologués.
- **Publication** : les pages de règles sont rendues publiables comme **guides pilotes non canoniques** à la demande du créateur. Le contrôle complet, l'examen DG/QA, la fusion et le déclenchement manuel du workflow Pages restent distincts ; ne jamais annoncer un déploiement sans preuve.

## Passations

- **STUDIO/ATELIERS** : raccorder une variante chiffrée à une création PNJ existante, avec choix explicite d'instance et retour arrière ; préserver la disponibilité en un ou deux gestes pendant la partie.
- **INDEX** : référentiel de `profileInstanceId`, `sourceRef`, versions, archetype, rôle, règles M03, états éditoriaux et visibilité ; aucun pouvoir déduit du texte.
- **BESTIAIRE/PNJ** : auditer espèce → individu → variante niveau/archétype, rôle narratif vs difficulté de combat ; préparer deux individus d'une espèce de même niveau mais profils différents.
- **MAG/CAP/OBJETS** : utiliser l'effet commun homologué, sans imposer de coûts expérimentaux ni PV aux effets mentaux ; Étincelle feu/Cercle I distinct de `demo-etincelle` foudre.
- **ARCHIVES** : provenances, sauvegardes et conflits d'identifiants en import/réimport, surtout en cas de personnage déjà chiffré.
- **QA/DG** : recette navigation desktop/tablette/mobile, assets WebP, édition locale, copier-coller d'un profil, protection MJ, sauvegarde/reprise, N1/5/10/15/20/21/25 et validation explicite avant publication réelle.

Sources de code : `quartz/components/scripts/atelier5d6-bestiary-workshop.ts`, `quartz/components/scripts/atelier5d6-bestiary.ts`, `studio-local/atelier-bestiaire.mjs`, `studio-local/app.mjs`, `studio-local/index.html`, `studio-local/accueil.html`, `scripts/assemble-pages.mjs`, `content/jouer/systeme-5d6-unifie-reference.md`, `content/jouer/atelier-creation-5d6-guide-illustre.md`.

## Preuves techniques du lot

- `npm test` : **OK**, contrôle éditorial, TypeScript, construction Quartz + portail + Studio, 1 551 pages et 94 616 références internes validées, M01–M05, bestiaire, magie et grimoire.
- `node --test studio-local/tests/mathematiques-publication.test.mjs` : **3 tests OK**, chargement des illustrations WebP, liens de préparation et visibilité des avertissements de publication pilote.
- `git diff --check` : **OK**.
- `CHROME_BIN=/usr/bin/chromium node --test studio-local/tests/mathematiques-browser.test.mjs` : **bloqué dans l'environnement local** par l'interdiction système de création du socket Chromium (`Operation not permitted`). **Ce n'est pas une recette navigateur réussie**. La même recette est inscrite dans `.github/workflows/ci.yml` pour une exécution réelle par GitHub Actions.
- Aucune publication effective revendiquée avant fusion approuvée, CI navigateur et déploiement Pages vérifié.
