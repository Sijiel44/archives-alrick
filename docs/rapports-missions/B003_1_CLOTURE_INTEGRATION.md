# ARCHIVES D’ALRICK — Rapport technique B-003.1 : clôture de reconstruction et intégration proposée

**Date :** 1er novembre 2026  
**Référent :** Architecture et intégration du Bestiaire  
**Dépôt :** `Sijiel44/archives-alrick`  
**Statut :** **partiellement réalisée** au sens de la directive (construction et recette initiale terminées ; fusion et contrôle sur `main` non réalisés, en attente d'autorisation de la Direction et du créateur).  
**Branche :** `bestiaire/b0031-reconstruction-integration`  
**PR propriétaire de remplacement :** [#76](https://github.com/Sijiel44/archives-alrick/pull/76), créée en brouillon et non fusionnée.  
**PR historique préservée :** [#73](https://github.com/Sijiel44/archives-alrick/pull/73), non fusionnée, conservée pour provenance.

## 1. Situation vérifiée et choix d'architecture

- Base commune initiale de #73 et de `main` : `6967679b1dee5f6b9762bd6cc4378827d0ec975e`.
- `main` vérifié au démarrage : `88f774f3d0d6d520d8d11443b72202b9caf4f94b` (travaux MAG-003 compris).
- Branche historique B-003 vérifiée : `4bcbbc234e77dd1881bb4211aee21c484e4fcb1e`.
- Comparaison GitHub : 91 commits de `main` en avance sur la base commune et 24 commits propriétaires B-003. Un retour/merge direct est plus risqué qu'un report sélectif des objets documentaires.
- Stratégie retenue : **B — reconstruction propre depuis `main`**, sans altération de la branche #73 et sans restauration globale d'anciens `package.json` ou fichiers de moteur.
- Premier commit propre : `fa1f5af755cd97480f78b6a903a5422330f647c2`. Correctif de comptage des candidats critiques 5d6 : `d827a5d05e8a55fc06f885b943b25bbc7de71a46`.
- La comparaison après reconstruction donnait `ahead_by:2`, `behind_by:0` par rapport au `main` de référence, sans conflit structurel d'historique.

## 2. Inventaire et traçabilité du catalogue

La reconstruction copie les objets Git (références de blobs SHA) des **41 fiches originales**, sans modifier leur texte. Les objets sont consignés un à un dans `docs/bestiaire/B003_1_INVENTAIRE_SAUVEGARDE.json` (nom, code de travail Pxx, chemin d'origine, SHA Git, chemin de destination), avec version d'origine `4bcbbc23`. Les quatre lots historiques sont conservés :

| Lot | Fiches | Nombre |
| --- | --- | ---: |
| I | P01–P12 | 12 |
| II | P13–P24 | 12 |
| III | P25–P36 | 12 |
| IV | P37–P41 | 5 |
| **Total** | | **41** |

Le même report conserve les synthèses écologiques I–IV, le guide du catalogue, la matrice B-003.1, la canonisation du vivant, la réconciliation des neuf trajectoires et le manifeste des illustrations. Aucun second ensemble de 41 espèces n'est créé. La classification reste : **A 9, B 27, C 0, D 4, E 1** ; les entrées P12/P38 conservent des identités distinctes en attente d'arbitrage.

Les neuf trajectoires P21, P22, P23, P24, P28, P30, P34, P35 et P36 sont conservées. La documentation de B-004 différencie croissance, maturation, adaptation, apprentissage, statut social, métamorphose biologique, transformation magique justifiée et altération exceptionnelle.

## 3. Réconciliations ciblées et limites éditoriales

1. `CONTRAT_EDITORIAL.md` : le document de `main` a été vérifié identique au préfixe du document historique ; les 17 lignes complémentaires relatives à l'autonomie du monde et à la validation du vivant ont été reportées sans altérer les autres politiques.
2. `package.json` : les scripts récents M01–M05, B-002, Grimoire et MAG-003 restent ceux de `main`. Deux commandes sont ajoutées : `test:b0031` et `test:b0031:m03`, incluses dans `npm test`.
3. `scripts/test-b0031-catalogue.mjs` : adaptation ciblée pour ne pas exiger qu'une fiche demeure à jamais `proposition_non_jouee` et pour permettre ultérieurement une promotion `lore_valide` justifiée par une décision individuelle, sans exiger `faits_joues`.
4. `scripts/test-b0031-m03.mjs` : nouvelle recette mécanique utilisant le **moteur officiel**, sans dupliquer les fonctions mathématiques.
5. `docs/bestiaire/B003_1_CONTROLE_M03.md` et `B003_1_PASSERELLE_B004.md` : protocole de recette, limites et transmission vers la mission suivante.

**Séparation de statut :** existence canonique `lore_valide` uniquement sur accord explicite du créateur ; événements `faits_joues` uniquement sur preuve de séance ; publication Quartz et droits d'image sous approbation distincte. L'absence de rencontre jouée ne bloque pas une décision de canonisation. Aucune des 41 propositions n'est canonisée par le report technique. Aucune attribution nouvelle `ESP-`, `FAMT-`, `INDC-`, `BIO-`, `VARC-` ou `P5C-` dans `B002_CODES_VALIDES.json`.

## 4. Tests effectivement exécutés et résultats

**Preuve de recette initiale :** [GitHub Actions #41354555782](https://github.com/Sijiel44/archives-alrick/actions/runs/41354555782), au commit **exact** `d827a5d05e8a55fc06f885b943b25bbc7de71a46`. Job « Contenu, TypeScript, build et liens » : **success**.

Étapes du job réussies : `npm ci`, `npm test` (intégrant M01–M05, B-002, B-003.1 et MAG-003) et `npm run test:m04:browser`. `npm test` a exécuté explicitement `npm run test:b0031` et `npm run test:b0031:m03`.

- B-003.1 documentaire : **359 assertions réussies**, 41 fiches et repères Pxx, neuf réconciliations, cinq références de médias inventoriées, aucun ajout de publication ni code arbitraire.
- B-002 : **1 998 assertions réussies** dans le bilan CI, zéro doublon de code, zéro valeur de canon invalide et **0 attribution individuelle nouvelle validée**.
- M03 : test de base du moteur sur **7 776 combinaisons** et références de duels ; M05 : **1 390 assertions** réussies ; MAG-003.A/B/C/D/E et autres étapes de `npm test` réussies.
- Recette B-003.1/M03 : **cinq profils expérimentaux représentatifs et une microfaune non combattante**, niveaux 5, 10, 15, 20 et 25, groupes 1, 2, 4 ; densité combinatoire exacte de 7 776 issues par profil. Le test pondère les sommes via `sumOccurrences` et appelle `resolveCombatM03`. Il contrôle les échecs forcés naturels 5–7, les candidats critiques 27–30, la défense, l'absorption et les dégâts.
- Exemples **non canoniques** lus dans les logs : fixture P02 (niveau 5, rôle faune), taux de réussite 60,03 %, dégâts moyens 4,20 par attaque ; fixture P21 (niveau 15, rôle gardien), 77,85 % et 10,12 dégâts moyens, **sur paramètres fictifs identiques attaquant/défenseur**, sans équilibrage officiel. Les résultats de groupes multiplient une espérance d'attaques indépendantes ; ce ne sont pas des combats de groupe simulés en situation.
- Aucune revendication de playtest humain, d'équilibrage de rencontre, de comportement IA, de mobilité terrain avancée, ni de sorts/pouvoirs déduits d'une illustration.

**Point de rigueur :** après ajout des rapports de clôture à la PR, une **nouvelle CI doit être vérifiée sur le dernier commit avant approbation**. Le succès #41354555782 ne couvre que la tête `d827a5d`, pas les commits documentaires ultérieurs.

## 5. Sujets ouverts et risques

| Sujet | État et suite requise |
| --- | --- |
| P12 / P38 | Chevauchement possible des poissons cavernicoles ; comparaison biologique à poursuivre, pas de fusion automatique |
| Nacrecombe | Chaîne énergétique, flux de matière, invertébrés et grands consommateurs hypothétiques |
| Forgeciel H8 | Température des microhabitats refroidis, ressources et conditions de reproduction à vérifier |
| Herbivores des crêtes | Séparer fourrage, niches, densités et saisons ; éviter compétition inventée comme fait |
| Neuf trajectoires | Aucun palier de niveau ne déclenche de métamorphose ; mécanismes encore hypothétiques |
| Illustrations P37–P41 | Cinq JPEG signalés comme récupérés d'un Word historique, empreintes SHA-256 documentées ; **0 binaire dans GitHub**, droits et autorisation de dépôt public non prouvés |
| Sources brutes V01–V06 / campagne | Pas de relecture exhaustive revendiquée pour toutes les 41 espèces ; les références GEO attestent un environnement, non la créature proposée |

L'absence des cinq médias binaires ne bloque pas la **livraison textuelle** mais interdit de les déclarer publiés, de créer des liens cassés ou de valider leur usage public sans preuve.

## 6. Périmètre des fichiers livrés

- 41 fichiers `docs/bestiaire/B003_FICHES/P01_*.md` à `P41_*.md`, plus README.
- Dossiers B-003 historiques : quatre synthèses, matrice, réconciliation, dossier de canonisation, manifeste visuel ; rapports B-003 et B-003.1 historiques.
- Nouveaux fichiers : `docs/bestiaire/B003_1_INVENTAIRE_SAUVEGARDE.json`, `B003_1_CONTROLE_M03.md`, `B003_1_PASSERELLE_B004.md`, `scripts/test-b0031-m03.mjs`.
- Modifications : `CONTRAT_EDITORIAL.md`, `package.json`, `scripts/test-b0031-catalogue.mjs`.
- Rapports de cette étape : présent fichier et `docs/rapports-missions/FICHE_DIRECTION_B003_1_FINALE.md`. La fiche Word indépendante est remise en conversation.

## 7. Recommandation et suite conditionnelle

**Verdict technique :** reconstruction opérationnelle et recette initiale réussie, **PR #76 proposée à la Direction**, non fusionnée. Attendre la CI du commit documentaire final et la revue Direction/créateur. Aucune autorisation de publier, de canoniser les 41 espèces, de fermer #73, de déclencher GitHub Pages ni de fusionner n'est déduite du succès des tests.

**B-004 : pas commencée.** La passerelle B-004 est prête, mais la branche `bestiaire/b004-familles-evolutives`, le rapport `B004_LANCEMENT_FONDATIONS.md` et la fiche de lancement ne doivent être créés qu'après approbation de B-003.1, fusion contrôlée et vérification de `main` incluant cette intégration.
