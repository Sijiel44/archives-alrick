# M04 — Rapport d'intégration, Atelier du Bestiaire et contrôle de publication

**Dépôt :** Sijiel44/archives-alrick  
**Branche M04 :** rules/m04-integration-bestiary-5d6-20261031  
**PR :** #61, brouillon, basée sur #60  
**Date de l'audit :** 31 octobre 2026  
**Statut :** EN COURS — NON PUBLIÉ. Ce rapport distingue explicitement implémentation, vérification et validation.

## 1. Résumé exécutif

La branche M04 a été créée depuis la tête vérifiée de M03, commit 9e8fab0c6d96eda30e4b26a25db0a7f4d1f878ad. Un Atelier du Bestiaire 5d6 a été ajouté sous une page Quartz distincte, sans remplacer l'Atelier historique ni le générateur de créatures M03. Il permet la création de créatures et de PNJ simplifiés, la personnalisation des statistiques, une sauvegarde locale séparée et un calcul de confrontations exact reposant sur le moteur M03.

La fonctionnalité est **en cours de validation**. Ne pas fusionner vers main ni publier tant que les tests CI, les vérifications de navigation réelles et de compatibilité ne sont pas réalisés et concluants.

## 2. Historique M01 à M04

- PR #57 : audit, distribution exacte 5d6 et détection des impasses de protection N25.
- PR #58 / M01 : progression 1–25, budget partagé, XP, caractéristiques non plafonnées, bonus effectifs logarithmiques.
- PR #59 / M02 : adaptation de l'Atelier, dépenses de progression et maîtrises, capacités, migrations conservatrices, nouvelles sauvegardes.
- PR #60 / M03 : combat moderne, protection et dégâts, générateur d'archétypes sans plafond 12, effets mécaniques bornés.
- PR #61 / M04 : Atelier du Bestiaire, calculateur de confrontation et interface explicative distincte, tests et raccordement de documentation.

## 3. État des PR

Les PR #57, #58, #59 et #60 étaient ouvertes et marquées « Draft » lors de l'audit du 31 octobre 2026. La PR #61 a été ouverte en brouillon contre la branche de #60, sans fusionner aucune PR dans main. Cet état doit être réactualisé avant toute opération finale.

## 4. Références de commits

- Base M03 : 9e8fab0c6d96eda30e4b26a25db0a7f4d1f878ad.
- Premier moteur pur du bestiaire M04 : 0f47fac9ff8e45a0e68e317ed603b98646ee75a2.
- Interface Quartz M04 : 5f0a0e6fd3fbfed0b9bd9f5b977c6154a9023213.
- Interactions et sauvegardes : 785d4bbcc9653b59fd71c8b2c667f7467e6fd1cf.
- Tests M04 : 8c2041d810a97c48ccd85ae9147e66e78d8ceb7d.
- Première correction de typage après CI : a0edbab656efcbd8f381a606b2370f3bc061b0a8.
- Vérifier le dernier SHA de la branche avant clôture.

## 5. Architecture du moteur 5d6

La nouvelle couche pure est quartz/components/scripts/atelier5d6-bestiary-workshop.ts. Elle importe generateCreatureProfileM03 (sans modification de l'ancien generateCreatureProfile), effectiveStat et effectiveMastery M01, sumOccurrences M01 et les fonctions de résolution, résistance et protection M03. Le composant Quartz est BestiaryWorkshop.tsx, chargé par quartz.ts. Son comportement client est atelier5d6-bestiary-workshop.inline.ts.

Une page éditoriale distincte : content/jouer/atelier-bestiary-5d6.md. L'Atelier principal reste accessible et indépendant.

## 6. Atelier du Bestiaire

Deux catégories : « créature » et « PNJ ». Cinq archétypes de départ : faune, prédateur, gardien, mystique et colosse. Rôles offensif, défensif, soutien. Le PNJ utilise une référence humanoïde simplifiée sans prétendre être un build PJ complet. Le MJ peut personnaliser identité, origine, profession, caractéristiques brutes, maîtrises, ressources, défense, protections, équipement, dégâts, pénétration, descriptions et capacités. Les capacités narratives n'activent aucun effet chiffré automatique.

Les statuts locaux sont brouillon, jeu validé et documentaire approuvé déclaré ; aucune intégration automatique dans le registre canonique. L'approbation documentaire locale n'a pas valeur de publication éditoriale.

## 7. Formules réellement utilisées

Distribution : 5 dés à 6 faces, 6^5 = 7 776 issues. Catégories naturelles M01, échec forcé pour 5–7 et aucune réussite cosmologique automatique sur 27–30.

Bonus de caractéristique E(c) = floor(3 × log2(1 + c/3)). Bonus de maîtrise M(m) = floor(log2(1 + m)). Le combat délègue intégralement à resolveCombatM03, qui combine le naturel, les bonus effectifs, les circonstances, les défenses calculées et les absorptions.

Dégâts attendus = somme, pour chaque naturel n de 5 à 30, de P(n) × dégâts de resolveCombatM03(n). P(n) = sumOccurrences(n)/7776. Le détail sépare réussite, contact potentiel, blessure réelle, défense, absorption et dégâts. Aucun « pourcentage de réussite » n'est inventé.

## 8. Trois modes

- Rapide : catégorie, niveau, archétype, rôle, nom, résultats mathématiques et opposition.
- Guidé : reprend les éléments rapides et expose les descriptions, ressources et protections (l'ergonomie doit être vérifiée en navigateur).
- Expert : toutes les caractéristiques, maîtrises, défenses et capacités narratives.

Le même contrat de sauvegarde et les mêmes calculs sont utilisés dans les trois cas.

## 9. Exemples de profils à vérifier

Exemple créature : prédateur N5, 6 dégâts de base, maîtrise et protection issus de generateCreatureProfileM03, comparer au groupe de quatre personnages polyvalents N5, grade 0. Modifier manuellement sa protection physique et observer la diminution des dégâts attendus des opposants.

Exemple PNJ : mystique N12, rôle soutien, profession archiviste, réserve de mana générée, maîtrise magie ou runes paramétrable. Aucun Cercle ni autorité n'est créé ; les pouvoirs décrits restent déclaratifs.

Ces exemples sont des cas fonctionnels documentés, non une attestation de parcours manuel exécuté.

## 10. Résultats des tests du générateur

Nouvelle suite : scripts/test-5d6-m04.mjs. Elle teste la création de 25 niveaux × 5 archétypes × 2 catégories, les statistiques supérieures à 12, la validation des imports et leurs limites, un cycle JSON complet et les capacités narratives inertes. Statut d'exécution à lire dans la dernière CI réussie de #61 ; un simple ajout au script npm test ne prouve pas leur passage.

## 11. Résultats des tests de combat

La suite M04 compare les résultats agrégés à un décompte direct via resolveCombatM03 sur les 26 naturels, pondérés par 7 776 issues. Elle vérifie aussi l'impact de la protection, les hypothèses et la reproductibilité des scénarios. La suite M03 existante demeure dans npm test. Les plages de rounds et l'équilibrage tactique restent **expérimentaux**, à confronter à des playtests humains.

## 12. Sauvegardes et import/export

Nouvelle clé isolée : archives-alrick-bestiary-v1 ; schéma JSON alrick.bestiary.v1 et ruleset m03. Validation stricte des scores, puissances et protections, nombre de fiches limité, suppression confirmée, duplication, export et réimport. Les anciennes clés alrick.sheets.v1/v2/v3, alrick.campaign.v1/v2 et archives-alrick-atelier-5d6-v1/v2 ne sont pas modifiées par ce composant.

Un export de compatibilité alrick.sheets.v3 est disponible pour importer volontairement la créature dans l'Atelier 5d6. Vérifier en navigateur la totalité de l'aller-retour avant de déclarer la compatibilité achevée. Les champs inconnus du schéma de bestiaire ne sont pas garantis à l'import ; aucun schéma PJ n'est remplacé.

## 13. Vérifications navigateur et mobile

Non effectuées à la rédaction de ce rapport : création complète en navigateur réel, retour SPA, rechargement, suppression après confirmation, import/export complet vers Atelier, accessibilité, vue mobile et essais d'interface sur les appareils. Les tests automatiques, même verts, ne se substituent pas à cette recette.

## 14. Travaux parallèles

- #54 : projet distinct de tables multijoueurs ; modifications de package.json et Atelier5d6.tsx. Risque de conflits futurs de fichiers, pas d'intégration automatique.
- #55 : grimoire M5d6 ; modifie package.json, Atelier5d6.tsx et atelier5d6.inline.ts ; risques d'intégration explicites à résoudre après M04.
- #56 : fondations documentaires du bestiaire ; registre et modèles séparés, sans fusion ni ajout canonique automatique. Prévoir un mapping versionné entre registre documentaire et fiches de jeu.

La branche M04 ne prétend pas avoir fusionné ni résolu intégralement ces chantiers.

## 15. Documentation modifiée

La page de création du bestiaire explique l'utilisation, les hypothèses mathématiques, les sauvegardes et les limitations. Des renvois et avertissements distinguent désormais plus clairement les fiches historiques et modernes dans jouer/index.md, jouer/atelier-5d6.md et jouer/systeme-5d6-base12.md. Un audit éditorial complet des anciennes valeurs reste recommandé avant publication.

## 16. GitHub Pages et URL publique

Site configuré dans le dépôt pour https://sijiel44.github.io/archives-alrick/. Le workflow .github/workflows/pages.yml fonctionne sur main avec un garde-fou de publication dédié ; la CI .github/workflows/ci.yml est distincte, exécutée sur les PR et ne publie pas. AUCUN déploiement M04 n'est déclaré ni attesté.

## 17. Problèmes résiduels / critères bloquants

1. Confirmer la CI sur le SHA final de M04, corriger chaque échec.
2. Tester les parcours réels, y compris responsive/mobile et navigation SPA.
3. Tester import/export du Bestiaire et l'import volontaire dans l'Atelier principal, notamment pour les fiches modernes.
4. Vérifier la non-régression des anciennes sauvegardes.
5. Revoir accessibilité, qualité du formulaire et indicateurs de difficulté.
6. Harmoniser les passages documentaires anciens sans effacer l'historique.
7. Réconcilier les conflits potentiels avec #54, #55 et l'architecture documentaire #56.
8. Réaliser des playtests humains pour valider la durée et l'équilibrage des rencontres.

## 18. Retour arrière

Aucune publication M04 n'ayant été réalisée à ce stade, le retour arrière consiste à laisser #61 non fusionnée et à conserver la branche. Pour un futur déploiement : relever avant merge le SHA de main, conserver une sauvegarde de main et du workflow, vérifier le déploiement, puis, en cas de régression, créer un revert explicite et contrôlé des commits de M04 avec nouvelle CI et contrôle de GitHub Pages. Ne jamais effacer une sauvegarde locale de navigateur pour « corriger » un problème.

## 19. Améliorations recommandées

- Tests E2E sur navigateur (création, édition, localStorage, import/export, navigation SPA, mobile).
- Modèle de rencontres avec initiative, ressources et actions d'équipe.
- Comparateur de profils sauvegardés, stratégies et scénarios reproduisibles.
- Impression de fiches pour le MJ.
- Liaison contrôlée avec les entrées documentaires de #56 (pas de canon automatique).
- Validation éditoriale des catégories de difficulté après essais de table.

## 20. Bilan de clôture

**Implémenté sur branche M04 :** composant et page du Bestiaire, moteur et import/export JSON, profils de référence, calculateur exact, suites de tests M04 et liens de navigation.

**Testé avant M04 :** les moteurs M01/M02/M03 ont des CI documentées ; la tête M03 9e8fab0 a sa CI verte (run 41241290667).

**En vérification M04 :** TypeScript, contenu, build Quartz, suite npm test et navigation des utilisateurs.

**Expérimental :** création simplifiée de PNJ, métriques de dangerosité et rounds théoriques.

**Non publié et non résolu :** recette navigateur/mobile, fiabilité des sauvegardes réelles, intégration des travaux #54–#56 et confirmation Pages.

**Conclusion : M04 n'est pas clôturée.** Le créateur a autorisé une publication seulement après validation complète. Aucune fusion vers main ni déclaration de publication ne doit avoir lieu tant que les blocages ci-dessus ne sont pas levés.

---

Documentation autonome pour reprise de M04 dans une nouvelle conversation : consulter la PR #61 et la tête de branche au moment de la reprise, relancer npm ci / npm test, puis effectuer la recette navigateur et statuer sur chaque critère avant intégration finale.
