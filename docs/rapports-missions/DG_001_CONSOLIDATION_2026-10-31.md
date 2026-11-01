# DG-001 — Rapport de consolidation et de gouvernance

**État :** corrections documentaires ciblées testées sur `codex/dg-001-consolidation-20261031`; PR [#63](https://github.com/Sijiel44/archives-alrick/pull/63) ouverte en brouillon; CI de la révision corrigée réussie; aucune fusion ni publication demandée ou effectuée.  
**Base examinée :** `main`, commit `6fe3c79cfdd36e69a6eaa356abc498d29b81f580` (31 octobre 2026, heure locale du projet).  
**Responsable de cette consolidation :** Direction du projet / référent de coordination DG.  
**Décisions réservées au créateur :** validation canonique, autorisation du lot de publication, arbitrages créatifs, approbation visuelle et fusion.

## Résumé vérifiable

- `npm run check:content` a été exécuté sur le clone de `main` : **369 pages publiées et 269 codes uniques**. Les 645 sujets du registre sont une autre population. Ne pas calculer un nombre de fiches manquantes par soustraction.
- `main` contient les rapports et contrats M01–M05. Les PR #57–#62 sont fusionnées; M05 indique que sa CI et le déploiement Pages ont réussi. Les PR #35, #54, #55 et #56 demeurent ouvertes en brouillon au contrôle GitHub du 31 octobre / 1er novembre UTC.
- Les quinze DOCX et leurs transcriptions CB01–CB04-04 ne sont pas dans `sources/campagnes/` : seul `sources/campagnes/README.md` y est présent. Le paquet local auquel renvoient les issues n'est pas joint à cette intervention. Aucun SHA de ces originaux, aucune recherche plein texte et aucun contrôle de droits sur les fichiers n'ont donc été exécutés.
- La phrase décrite comme corrompue dans l'ancien audit n'a pas été retrouvée dans `content/jouer/index.md` de `main`; aucune correction textuelle conjecturale n'a été appliquée. Le plan contenait en revanche des mentions actives du niveau 1–12 alors que les pages de l'atelier et les rapports M01–M05 décrivent désormais 1–25.
- Aucun code du moteur 5d6 n'a été modifié. Le rapport M05 donne des preuves automatisées d'intégration; ses limites indiquent encore l'absence de playtest humain général, de vérification physique multi-appareil et de certains contrôles lecteurs d'écran.

## Registre d'actions

| Constat et source | Risque | Action DG-001 | Responsable / priorité | Décision créateur |
|---|---|---|---|---|
| `CONTRAT_EDITORIAL.md` mettait `proposition_non_jouee` hors de `content` et interdisait sa publication dans les règles de publication. Contradiction avec les outils facultatifs déjà publiés et la mission. | Confondre publication avec canon ou attestation d'un événement joué. | Séparer explicitement validation canonique, permission de publication et statut joué; permettre la publication étiquetée des scénarios/outils approuvés. | Éditorial / P0 | Le statut canonique et l'autorisation du lot restent humains. |
| Les champs de portée ne représentaient pas explicitement les campagnes indépendantes. | Une expérience d'une autre table peut se propager à Orin ou au monde général. | Documenter `campagne_independante` et `campagne_id` facultatif; recommander la migration à la création/révision, sans migration globale. | Éditorial / P0 | Le créateur décide des faits de lore et de la campagne fondatrice. |
| README et suivi affichaient encore 259; le plan affichait plusieurs états anciens. | Rapport de direction contradictoire. | Ajouter un compteur daté, reproductible, et étiqueter les précédents comme historiques. | Éditorial / P0 | Aucun. |
| Le plan référençait encore des niveaux 1–12. | Guides et modules donnent des contrats incompatibles. | Décrire 1–25 comme plage expérimentale actuelle et non comme canon des personnages historiques. | 5d6 / P0 | Playtest humain et validation des règles restent à faire. |
| Documents de registre et issue #39 décrivent un paquet CB01–CB04-04 absent de l'arbre Git. | Une page de registre pourrait être prise à tort pour la preuve d'import. | Clarifier le circuit de transfert, manifeste SHA-256, recherche, doublons, secrets, droits et restauration; ne pas importer à l'aveugle. | Sources / P0 | Les fichiers eux-mêmes sont requis pour vérifier puis importer. |
| #35 vise encore un pipeline privé qui refuse l'ajout au dépôt public. | L'outil contredit l'orientation d'archivage public autorisée. | Recommander une adaptation contrôlée de #35 tout en séparant `sources/` de Quartz et en gardant l'import sans auto-validation canonique. | Sources / P0 | Confirmer les exceptions réelles de droits/sensibilité au cas par cas. |
| Index `content/jouer/index.md`: accusation de phrase corrompue non reproduite; plan obsolète vérifié. | Correction fausse ou règle expérimentale promue par erreur. | Ne rien inventer sur la phrase; corriger la plage 1–12 démontrée dans README/plan. | Éditorial / P0 | Aucun pour la correction documentaire; les règles demeurent expérimentales. |

## Architecture documentaire retenue

| Couche | Métadonnées recommandées | Ce qu'elle atteste | Ce qu'elle n'atteste pas |
|---|---|---|---|
| Univers partagé | `portee: univers_partage` | Lore général approuvé, cultures, lieux, espèces, organisations et faits du monde | Une rencontre ou une scène d'Orin |
| Odyssée d'Orin | `portee: jdr_alrick`, `campagne_id: odyssee_orin` | Faits et décisions de la campagne fondatrice, avec projets et déclarations séparés | Qu'une création de lore ultérieure ait été jouée rétroactivement |
| Campagne indépendante | `portee: campagne_independante`, `campagne_id` stable propre à la table | Continuité locale de cette table | Une vérité universelle ou une modification d'Orin |

Les catégories de statut (`faits_joues`, `lore_valide`, `declaration`, `projet_en_cours`, `hypothese`, `proposition_non_jouee`, `a_verifier`, `historique`) restent indépendantes de `publish`, `spoilers` et `unlisted`. Une fiche de lore général est référencée depuis les campagnes plutôt que copiée. `campagne_id` n'est pas exigé pour les fiches générales et n'est pas rétroporté en masse.

## Sources brutes, recherche et restauration

La destination documentée reste `sources/campagnes/<CB>/`, avec originaux inchangés, transcription UTF-8, index Markdown/CSV et fragments seulement s'ils sont disponibles. Avant une PR d'import : vérifier nombre de volumes, formats, tailles et empreintes SHA-256; détecter doublons exacts et probables; contrôler droits, données personnelles et secrets réellement réservés au MJ; documenter les limites de segmentation et les références exploitables. Après fusion autorisée, vérifier sur GitHub les fichiers et la recherche par code, chapitre et terme, puis restaurer depuis un clone indépendant. `sources/` n'est pas indexé par Quartz; dépôt public ne signifie pas publication sur le site. Les sources importées restent des preuves historiques, pas du canon automatique.

**Recommandation #39 :** garder ouverte jusqu'à réception du ZIP déjà mentionné dans l'issue, contrôle des 15 originaux, 15 transcriptions et manifestes, puis PR dédiée. L'issue elle-même indique que le matériel manque au dépôt et distingue correctement import de reprise CB44. **Recommandation #35 :** garder en brouillon et adapter ses tests/comportements à l'autorisation de dépôt public avant tout merge; ne pas laisser un refus général des fichiers `sources/`, et ne jamais générer de publication Quartz ni de statut canon par défaut. Aucune de ces opérations dépendantes des sources binaires n'a été simulée.

## État des missions et PR au contrôle distant

| Référence | État observé | Revue / suite recommandée |
|---|---|---|
| Issue #39 | Ouverte; import de 15 DOCX + transcriptions CB01–CB04-04 | Attendre le paquet, vérifier SHA, tailles, doublons et contenu; réaliser une PR de sources dédiée. |
| Issue #41 | Ouverte; réconciliation des 645, biographies et playtest humain | Poursuivre entrée par entrée avec preuves; ne pas utiliser les couleurs comme promotion. |
| Issue #45 | Ouverte; villages candidats des Sept Cités | Garder les 14 idées comme propositions; rechercher les villages sources avant géolocalisation ou canonisation. |
| PR #35 | Ouverte, brouillon | Adapter la pipeline à l'archivage public volontaire; fichiers binaires manquants ici. |
| PR #54 | Ouverte, brouillon; prototype Node/WebSocket lié par défaut à `127.0.0.1`, jetons opaques et rôles contrôlés côté serveur | `npm run tables:test` réussi dans un worktree propre : MJ + 2 joueurs, permissions, dés serveur, secrets, conflits, reconnexion et sauvegarde. La revue du code confirme que l'hôte peut être remplacé via `TABLES_HOST`; ne pas exposer publiquement sans conception séparée TLS/auth/rétention. Recette manuelle réelle à trois navigateurs encore requise avant fusion. |
| PR #55 | Ouverte, brouillon; grimoire 5d6 | `node scripts/test-5d6-grimoire.mjs` réussi : C1→matrice C8, IX divin, énergie, oppositions et sauvegardes. Inspection statique confirme ces axes et les sorts démo non canoniques; import/export sur sauvegardes utilisateur et parcours manuels restent à faire. Cercle, niveau et autorité sont distincts dans les champs, mais la revue créative/UX reste ouverte. |
| PR #56 | Ouverte, brouillon; fondations B-001 | `npm test` réussi dans un worktree du head PR : 367 pages publiées, 269 codes, TypeScript/build/liens et suites présentes réussis. Le rapport B-001 marque expressément l'inventaire des créatures comme échantillon non exhaustif; les nouveaux modèles distinguent espèce/individu/profil. Les préfixes futurs restent soumis au créateur; compléter audit exhaustif et lien B-002 avant d'activer les références. |
| PR #57–#61 | Fermées et fusionnées | Modules mathématiques M01–M04 intégrés à `main`; suites présentes dans `npm test`. |
| PR #62 | Fermée et fusionnée | Addendum M05: CI main, déploiement Pages et smoke Chrome réussis; aucun playtest humain déduit de ces preuves. |

La revue ciblée a inclus les diffs des trois branches, les contrats, tests et code portant sur l'hôte/session locale, permissions et sauvegarde (#54), normalisation/matrices/cercles/ressources (#55), et taxonomie, modèles, registre et statut de complétude (#56). Elle ne remplace pas une revue visuelle, test d'intrusion, essai physique multi-appareil ni validation du créateur. Les trois `npm ci` ont chacun signalé quatre avis d'audit dépendances (2 modérés, 2 élevés); aucune mise à niveau n'a été tentée dans le périmètre de documentation.

## Gouvernance opérationnelle

GitHub reste le registre opérationnel : Issues pour le périmètre et les décisions en attente, PR pour les changements, `content/suivi-editorial.md` pour les fiches, rapports `docs/rapports-missions/` pour les décisions et preuves, CI pour les tests. Éviter un tableau local concurrent. Chaque ticket spécialisé doit indiquer responsable, priorité, périmètre, sources, dépendances, fichiers, livrables, critères, tests, décisions du créateur, statut, branche/PR et résultat de revue. Un GitHub Project n'a pas été créé; les outils de projet du compte n'ont pas été vérifiés dans le cadre de cette exécution, et les Issues/PR existantes suffisent pour le suivi immédiat.

| Domaine | Responsable principal proposé | Consultés | Validation technique | Validation éditoriale / créateur |
|---|---|---|---|---|
| Cosmologie et Lore | Référent Lore | Continuité, magie, personnages | liens, statut et contrôle anti-spoilers | créateur pour canon, cosmologie et publication |
| Atlas et Géographie | Référent Atlas | Lore, campagnes, économies | liens/cartes/faits géographiques | créateur pour placements et faits nouveaux |
| Personnages et Relations | Référent Personnages | continuité, Lore, groupes | codes, homonymes, sources | créateur pour identité, parenté et statut |
| Bestiaire et Écosystèmes | Référent Bestiaire | Atlas, lore, 5d6 | taxonomie, schémas, tests M04/M05 | créateur pour canonisation des espèces |
| Moteur de règles 5d6 | Référent 5d6 | magie, bestiaire, UX | probabilités, migrations, suites npm/Chrome | créateur pour adoption de règles; joueurs pour playtest |
| Grimoire, Magie et Capacités | Référent Magie | Lore, 5d6, inventaire | validations de données, sauvegardes | créateur pour règles et capacités de canon |
| Tables multijoueurs | Référent Tables | 5d6, sécurité, sauvegardes | tests serveur, droits, concurrence | créateur pour portée, données et publication |
| Encyclopédie et Interface | Référent Produit/Quartz | tous domaines, accessibilité | build, liens, recherche, navigateur | créateur pour lot publié, arts et présentation |
| Continuité d'Orin (responsabilité permanente) | Référent Continuité | Personnages, Lore, sources | provenance, chronologie, sauvegardes | créateur pour contradictions et état de reprise |

Une seule branche principale par mission. Les domaines consultés donnent leurs contraintes avant intégration; ils ne poussent pas de changements concurrents dans la branche propriétaire sans coordination explicite.

## Missions spécialisées prêtes à lancer

Les prompts autonomes complets sont dans [DG-001 — Missions spécialisées](DG_001_MISSIONS_SPECIALISEES.md). Ordre conseillé : DG-01 sources et DG-02 contrat (cette PR réalise une première tranche), DG-03 compteur/références, DG-04 revue 54–56, DG-06 protocole humain 5d6, DG-08 parcours débutant. DG-07, DG-09–14 restent des chantiers futurs, pas des travaux accomplis ici.

## Tests et limites de cette PR

- Installations locales réalisées avec `npm ci` (Node/npm locaux; 4 vulnérabilités npm annoncées à l'installation : 2 modérées, 2 élevées; aucune correction de dépendances tentée).
- `npm run check:content` : réussi, 369 pages publiées et 269 codes uniques.
- `npm test` sur cette branche : réussi; inclut `check:content`, TypeScript, build Quartz, `check:site`, tests de probabilité/équilibre, suites de progression/M02/M03/M04/M05. Le build a vérifié 873 pages HTML et 64 196 liens/ressources; tests M05 : 1 390 assertions pures. La suite complète ne lance pas la recette navigateur Chrome séparée `npm run test:m04:browser`.
- PR #54 : `npm run tables:test` réussi dans son worktree; PR #55 : `node scripts/test-5d6-grimoire.mjs` réussi dans son worktree; PR #56 : `npm test` réussi dans son worktree (868 pages HTML, 62 910 liens/ressources). Ces résultats correspondent aux heads de branche observés le 31 octobre/1er novembre UTC et peuvent changer si les branches bougent.
- CI distante de PR #63 sur le commit corrigé `4fcb98793a69dbf9693ba76fa0f9d892727ab3d3` : run [#41262370750](https://github.com/Sijiel44/archives-alrick/actions/runs/41262370750) réussi, y compris `npm test` et `npm run test:m04:browser`. Deux premières exécutions avaient échoué parce qu'un transfert du long suivi éditorial avait été tronqué; le journal l'a identifié, le fichier complet a été retransféré, puis la CI complète est passée.
- `git diff --check` : réussi. La recette Chrome automatisée a passé dans la CI; aucun playtest humain ni essai sur appareil physique n'a été effectué.
- Aucune modification moteur, aucun ajout de contenu de campagne brut, aucun changement de canon, aucun marqueur Pages touché, aucune fusion/déploiement.

## Fichiers modifiés par cette mission

- `CONTRAT_EDITORIAL.md` — couches, portée/campagne ID, statuts indépendants et publication facultative.
- `README.md`, `PLAN_DEVELOPPEMENT_UNIVERS.md`, `content/suivi-editorial.md` — compteur daté et statut historique des anciens comptes; progression expérimentale 1–25.
- `docs/SOURCES_CAMPAGNES_PUBLIQUES.md` — procédure d'import public, d'intégrité, de recherche et de restauration.
- Ce rapport et le recueil des prompts autonomes.
