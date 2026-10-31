# M04.1 — Rapport final : intégration, recette Chrome et publication du système 5d6

**Dépôt :** Sijiel44/archives-alrick  
**Date de clôture :** 31 octobre 2026  
**Statut :** **TERMINÉE — FUSIONNÉE — PUBLIÉE — RECETTE PUBLIQUE RÉUSSIE**  
**Adresse publique :** https://sijiel44.github.io/archives-alrick/  
**Atelier du Bestiaire :** https://sijiel44.github.io/archives-alrick/jouer/atelier-bestiary-5d6  
**Commit déployé :** c85c5a81a59f41c63effbc15ea98aa14fc445ad7  
**CI / publication finale :** https://github.com/Sijiel44/archives-alrick/actions/runs/41253591405

> Ce document remplace l'état provisoire M04. Il consigne les résultats effectivement exécutés et les limites connues, sans confondre CI, fusion, déploiement et test du site public.

## 1. Synthèse et chronologie des vérifications

M04 a livré l'Atelier du Bestiaire, mais la recette complète et le contrat de transfert M03/M02 restaient à valider. M04.1 a audité les cinq PR #57 à #61, corrigé les défauts, éprouvé le comportement du navigateur réel et publié les pages approuvées après validation.

La tête initiale de M04 était **56318bc3d9e38974355b7e6d004b8583122925f2**, CI **#41243403493** réussie. L'intégration s'est faite sans modifier les PR parallèles #54, #55 et #56. La référence de retour arrière de main avant M04.1 est **3443be26b15a90f078e7fdcb94ae5fbb5cfd9191**.

La dernière tête M04.1 testée avant fusion était **9f47f6a1935ed7f05a0ecb14d88ef27463c7f4c5**, CI **#41253301774** réussie (9/9). Les cinq fusions ont conduit à **7ec48f51c6591343921678595ebe1a38f49bbbf6**. Après ajout des vérifications du site public et des captures, la CI de main **#41253510945** a réussi, suivie de la CI main **#41253591519** sur le commit publié.

La publication a été déclenchée par modification explicite de .github/pages-publication-approved.txt sur main ; elle ne résulte pas automatiquement des fusions.

## 2. Filiation Git et préservation des travaux parallèles

| PR | Objet | Base finale | État |
| --- | --- | --- | --- |
| #57 | Probabilités exactes 5d6 | main | Fusionnée |
| #58 | Progression M01, niveaux 1–25 | main après #57 | Fusionnée |
| #59 | Atelier et capacités M02 | main après #58 | Fusionnée |
| #60 | Combat et bestiaire mathématique M03 | main après #59 | Fusionnée |
| #61 | Atelier du Bestiaire, intégration M04.1 | main après #60 | Fusionnée |
| #54 | Multijoueur | main (branche propre) | Ouverte, non fusionnée |
| #55 | Grimoire | main (branche propre) | Ouverte, non fusionnée |
| #56 | Bestiaire documentaire | main (branche propre) | Ouverte, non fusionnée |

Les cinq PR liées ont été retargetées vers main dans leur ordre de dépendance, puis fusionnées avec l'historique Git préservé et des identifiants de tête attendus. Aucun force-push ni duplication volontaire de commits de M01–M04. Les branches #54–#56 seront à réconcilier séparément avec la nouvelle version de main.

## 3. Audit des contrats de données et correctifs appliqués

### 3.1 Faux contrat M02 à l'export

**Défaut :** l'export du Bestiaire utilisait une enveloppe alrick.sheets.v3, ruleset:"m02", sans transporter toute la structure de développement M02. Une créature de niveau élevé pouvait être soumise artificiellement au budget d'un PJ et bloquée avant un jet.

**Correction :** l'enveloppe alrick.sheets.v3 est conservée pour l'import, mais le profil intégré annonce **ruleset:"m03-bestiary"**, avec **kind:"creature" ou "pnj"**. Il transporte niveau/highestLevel, quatre caractéristiques, maîtrises, PV, mana, protections, résistances, grades d'équipement, identité et notes. L'objet Bestiaire complet est conservé dans **bestiarySource**. L'Atelier principal affiche ce profil hors budget de développement PJ, tout en faisant intervenir les formules M03 pour les jets et l'opposition.

Un profil M03 est protégé contre les achats de caractéristiques/maîtrises M02 ; sa construction se fait dans l'Atelier du Bestiaire. La protection est distincte de la capacité du MJ à confirmer les dégâts appliqués pendant un combat.

### 3.2 Résistance M03 ≠ protection absorbante

Les valeurs du générateur **resistancePhysical** et **resistanceMagic** sont des bonus de résistance/seuil défensif. La version initiale les inscrivait dans la protection, qui intervient dans l'absorption des dégâts. Le transfert corrigé renseigne **resistanceBonus** et laisse **protection** indépendante, conformément à la distinction entre pénétration et absorption dans M03. Le calcul de protection innée et de l'équipement conserve le moteur M03 existant.

### 3.3 Sauvegardes, imports et champs inconnus

Les extensions JSON inoffensives du Bestiaire et les métadonnées de capacités sont conservées sous limites de taille et validation ; aucune capacité narrative n'exécute de magie ni d'effet automatiquement. Les identifiants dupliqués d'une fiche importée sont renouvelés. Une sauvegarde locale illisible n'est pas écrasée sans confirmation de nouvelle création.

La sélection active du Bestiaire est mémorisée dans une clé locale séparée, sans casser le format de liste existant. Le navigateur rouvre la même fiche après rechargement, y compris après import. Pour les anciennes fiches **legacy**, l'Atelier protège la lecture seule et le champ legacyOriginal conserve les informations inconnues de l'original. Les confrontations mélangeant ancien moteur et M03 sont refusées sans adaptation volontaire.

### 3.4 Export JSON et contrôle MJ des impacts

La recette Chrome a découvert un véritable **ReferenceError** sur l'export inter-Ateliers. Le chemin de transfert a été corrigé dans le script Quartz effectivement compilé. Un problème d'interaction intermittent du bouton d'export Bestiaire a ensuite été isolé par une recette réelle et traité par un gestionnaire d'export dédié en capture, indépendant des commandes destructives.

L'Atelier principal calcule l'impact potentiel avec resolveCombatM03 ; **les PV d'une autre fiche ne sont retirés qu'après confirmation explicite du MJ**. Cette confirmation est vérifiée dans le navigateur, puis les PV sont de nouveau contrôlés après rechargement. Il ne s'agit pas d'une authentification MJ sécurisée côté serveur.

## 4. Contrôles mathématiques

- **5d6 :** distribution exacte des **7 776** issues élémentaires, tests de probabilités et d'extrêmes.
- **Caractéristiques :** pas de plafond définitif à 12 dans M01/M02. La progression 1–25 conserve des profils différenciés et un budget partagé pour les PJ.
- **Colosse niveau 15 :** Physique **15**, Agilité **7**, Esprit **8**, Présence **8**, **194 PV**.
- **Bonus effectifs :** **+7, +5, +5, +5**, issus de la transformation logarithmique de M01.
- **Combat M03 :** distinctions entre réussir/toucher/effleurer/blesser, seuil de pénétration, protection absorbante, dégâts bruts, dégâts potentiels et application après décision MJ.
- **Simulations de groupe :** résultats interprétés comme des **projections mathématiques expérimentales**, dépendantes des hypothèses de composition, d'actions et de cadence ; aucun résultat n'est présenté comme une partie effectivement jouée.

Les tests de M04 sur les fonctions pures sont exécutés dans npm test ; le navigateur contrôle la cohérence entre chiffres calculés et valeurs réellement affichées. Les protections, maîtrises et situations modifiées modifient effectivement les prévisions de performance.

## 5. Recette réelle Chrome, Quartz et mobile

**Environnement :** Chrome/Chromium headless réel sur runner GitHub Actions, piloté via CDP. La suite charge le HTML construit par Quartz sur serveur local, puis une seconde fois le **site GitHub Pages public**, avec profil de navigateur isolé et stockage local réel.

| Parcours exécuté | Résultat |
| --- | --- |
| Rapide, guidé, expert ; Colosse N15 et valeurs exactes | **Réussi** |
| Modification d'une maîtrise et de la protection avec recalcul | **Réussi** |
| Export JSON du Bestiaire et réimport de la fiche | **Réussi** |
| Sauvegarde, rechargement, duplication et suppression avec confirmation | **Réussi** |
| Export volontaire du Bestiaire vers l'Atelier principal en règles M03 | **Réussi** |
| Navigation Quartz et affichage mobile 390 px, sans débordement | **Réussi** |
| Import M03, niveau/PV/statistiques/défenses/source et budget non PJ | **Réussi** |
| Import M02, conservation de legacyOriginal et données historiques | **Réussi** |
| Attaque M02 contre M03, confirmation MJ, persistance des dégâts | **Réussi** |

**CI M04.1 de branche :** #41253301774, 9/9 scénarios Chrome, quatre confirmations de dialogue, réussite complète.  
**CI main :** #41253510945, npm ci, npm test, TypeScript, build Quartz, contrôles de site et 9/9 Chrome, réussite complète.  
**CI main du commit publié :** #41253591519, réussite complète.  
**Preuves d'interface :** artefact GitHub Actions « recette-m041-ci » ; captures bureau, mobile et Atelier principal. Les images ont été ouvertes et examinées : rendu lisible, absence de débordement horizontal constaté sur le viewport mobile testé. Il ne s'agit pas d'une revue esthétique exhaustive.

## 6. Publication effective et contrôle de l'URL

**Workflow :** [GitHub Pages #41253591405](https://github.com/Sijiel44/archives-alrick/actions/runs/41253591405) — commit déployé **c85c5a81a59f41c63effbc15ea98aa14fc445ad7**.

Résultats distincts observés dans GitHub Actions :

1. **build : success** — npm ci / npm test, configure-pages, création de l'artefact Pages.
2. **deploy : success** — actions/deploy-pages a effectivement déployé.
3. **smoke public : success** — le navigateur Chrome a parcouru **https://sijiel44.github.io/archives-alrick/** et la page d'Atelier du Bestiaire ; **9/9 scénarios complets réussis**, export/import et combat compris.

Le test du site public n'est pas déduit de la seule réussite de CI : il est exécuté après le job deploy en utilisant l'origine HTTPS de GitHub Pages via l'option PUBLIC_BASE du script de recette. Les captures du site public sont stockées dans l'artefact **recette-m041-pages** du workflow #41253591405.

**URL directe :** https://sijiel44.github.io/archives-alrick/jouer/atelier-bestiary-5d6

Les créations restent dans le stockage local du navigateur. Les protections éditoriales des fiches de campagne déjà présentes dans Quartz (publish:false, spoilers:true, unlisted:true) ne sont pas levées par cette mission. Le système est un prototype expérimental de jeu, pas une canonisation rétroactive du récit.

## 7. Retour arrière, limites et travaux ultérieurs

**Référence avant mission :** main 3443be26b15a90f078e7fdcb94ae5fbb5cfd9191.  
**Référence après fusion M04 :** 7ec48f51c6591343921678595ebe1a38f49bbbf6.  
**Commit du déploiement :** c85c5a81a59f41c63effbc15ea98aa14fc445ad7.

En cas de défaut critique, établir un revert Git explicite des changements concernés, contrôler à nouveau npm ci / npm test / navigateur, puis émettre un **nouveau signal de publication approuvée** ; ne pas forcer ou réécrire l'historique partagé.

Limites persistantes : stockage par navigateur sans synchronisation multijoueur, contrôle MJ d'interface et non rôle sécurisé, projections de groupe non validées par des parties humaines, tests mobiles sur un viewport représentatif seulement. Les PR #54–#56 restent des travaux séparés, à revoir par conflit de données et d'ergonomie avant fusion.

**M05 :** préserver la séparation du chantier. Les fiches mathématiques visuelles, la refonte esthétique et l'enrichissement graphique des combats seront planifiés après M04.1, sans les mélanger rétroactivement au code publié.

## 8. Verdict de clôture

**M04.1 terminée et publiée.** Le contrat M03 du Bestiaire est cohérent avec l'Atelier principal, le calcul et la persistance réels fonctionnent, l'intégration Git est achevée, les tests de navigateur (local et public) sont verts et le workflow Pages a réellement déployé.

Le rapport Word complet associé est **M04_Rapport_Final_5D6.docx**.

## 9. Sources et références techniques

- PR #57 à #61 et #54 à #56 : https://github.com/Sijiel44/archives-alrick/pulls
- CI M04.1 avant fusion : https://github.com/Sijiel44/archives-alrick/actions/runs/41253301774
- CI main : https://github.com/Sijiel44/archives-alrick/actions/runs/41253510945
- CI main du commit publié : https://github.com/Sijiel44/archives-alrick/actions/runs/41253591519
- Publication et smoke Chrome public : https://github.com/Sijiel44/archives-alrick/actions/runs/41253591405
- Code des essais Chrome : scripts/test-5d6-m04-browser.mjs
- Export/transfert : quartz/components/scripts/atelier5d6-bestiary-workshop.inline.ts et atelier5d6-bestiary-workshop.ts
- Atelier principal : quartz/components/scripts/atelier5d6.inline.ts
- Enveloppe visuelle : quartz/components/BestiaryWorkshop.tsx
- Site public : https://sijiel44.github.io/archives-alrick/
