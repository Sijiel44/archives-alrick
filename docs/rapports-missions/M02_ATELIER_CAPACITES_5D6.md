# M02 — Intégration de la progression 5d6 dans l'Atelier et système de capacités

**Dépôt :** [Sijiel44/archives-alrick](https://github.com/Sijiel44/archives-alrick)  
**Date :** 31 octobre 2026  
**Statut :** développement expérimental en PR brouillon ; CI complète verte, tests d'interface manuels non réalisés. **Ni fusion, ni publication.**  
**Branche :** `rules/m02-atelier-capacites-5d6-20261031`  
**PR :** [#59](https://github.com/Sijiel44/archives-alrick/pull/59)  
**Base de travail :** [#58 — M01](https://github.com/Sijiel44/archives-alrick/pull/58), elle-même empilée sur [#57 — audit](https://github.com/Sijiel44/archives-alrick/pull/57).

## 1. Résumé exécutif et statut réel

M02 est une **intégration expérimentale** du modèle M01 dans le parcours de création libre et guidée de l'Atelier. L'écriture des progressions passe par les fonctions pures de M01 ; scores bruts et maîtres de domaine peuvent franchir 12 sans plafond arbitraire. Ajout d'un registre de capacités (emplacements narratifs distincts des effets définis), de transactions d'achat/remboursement contrôlées, d'événements d'XP vérifiés et de jalons MJ 21–25. Les données anciennes sont conservées en lecture seule et toute adaptation exige une confirmation explicite, crée **une copie distincte** et conserve un instantané brut de la source.

**Réserve importante :** le module d'opposition relève de M03. Pour une fiche M02, le jet d'opposition existant est refusé avec message explicite plutôt que d'appliquer implicitement un nouveau bonus à l'ancien moteur de dégâts/protections. Les anciennes fiches restent lisibles et exportables. Il n'y a pas de playtest humain revendiqué.

## 2. PR #57 et #58 / non-duplication

- **#57**, `rules/5d6-audit-probabilites-20261031` : distribution des 7 776 issues 5d6, natural 5–7 en échec forcé, audit de la résistance N25.
- **#58**, `rules/m01-progression-5d6-20261031` : `atelier5d6-progression.ts`, tests, coûts M01, XP et jalons exceptionnels.
- **#59 M02** cible **la branche M01** ; aucune règle calculatoire parallèle n'a été développée. Aucune des PR n'est fusionnée.

## 3. Inventaire du code étudié

Lecture de `docs/rapports-missions/M01_PROGRESSION_5D6.md`, `quartz/components/scripts/atelier5d6-progression.ts`, `atelier5d6-probabilities.ts`, `atelier5d6.inline.ts`, `atelier5d6-origins.ts`, `quartz/components/Atelier5d6.tsx`, `package.json`, `scripts/test-5d6-progression.mjs` et sections ciblées du parcours, des jets, du stockage et des imports/exports. Examen des métadonnées des PR #57 et #58 et de leur filiation.

## 4. État initial de l'Atelier

Les fiches PJ historiques utilisaient 12 points de départ, +6 crédits de caractéristiques par niveau et +2 maîtrises gratuites par niveau, avec score/maîtrise plafonnés à 12. Les jets ordinaires additionnaient le **score brut** et la spécialité 0–2. Le niveau 5 ancien donnait 36 crédits de caractéristiques et 8 points de maîtrise ; ce n'est **pas équivalent** aux 12 points initiaux et 24 points de développement partagés de M01. Les schémas d'export étaient `alrick.sheets.v2`, `alrick.campaign.v1` ; persistance locale `archives-alrick-atelier-5d6-v1`.

## 5. Modifications apportées

- **`atelier5d6-m02.ts`** : adaptateur pur `M02Sheet`, `Development`, `evaluateSheet`, `transact`, `grantAward`, `approveMilestone`, `eligibleLevel`, `draftFromLifePath`, `migrateLegacy`, `restoreLegacy`. Dépense et admissibilité issues du vrai module M01.
- **Atelier JS/TS** : champs bruts sans borne 12 pour M02, bonus logarithmiques affichés, achats de caractéristiques et maîtrises atomiques, affichage budget, capacités, XP, jalons, création niveau 5 et jet ordinaire 5d6 avec E(c)+M(m)+situation.
- **Interface** : choix libres d'origine, niveau 5, capacité définie ou emplacement, validation MJ, historique d'XP, bouton de création d'une adaptation distincte de l'original.
- **Versionnage** : `alrick.sheets.v3` / `alrick.campaign.v2` pour les nouveaux exports ; ancienne version acceptée à l'import ; nouvelle clé `archives-alrick-atelier-5d6-v2`, lecture de la clé v1 en repli sans l'écraser.

## 6. Architecture des capacités

`AbilityDefinition` comporte : `id` stable, `name`, `description`, `domain`, `kind`, `levelRequired`, `masteryDomain` et `masteryRequired` optionnels, `effect`, `limitations`, `resources`, `provenance`, `approvedByGM`, `status` et `rank` ; `parentId` sert aux futurs arbres de capacités.

Catégories de M01 : aptitude = 3 points dès N3 ; technique = 6 dès N5 ; signature = 9 dès N17 et avec accord MJ. Un **`slot`** est un emplacement payé dont l'effet reste indéfini et qui n'accorde aucun pouvoir ; une capacité **`defined`** requiert effet, description et limites. Les rangs supplémentaires prélèvent une nouvelle fois le coût de la catégorie. Un changement de catégorie exige remboursement et nouvel achat. Il n'existe volontairement **aucun catalogue inventé** de sorts, Cercles, Autorités, miracles ou statuts divins.

**À approfondir :** amélioration/sous-arbres et spécialisations nommées sont prévues par l'architecture, mais il n'existe pas encore de catalogue d'effets validé ni de moteur d'exécution générique pour toutes les capacités. Un texte d'effet validé est enregistré, non exécuté comme un sort.

## 7. Progression mathématique et validation

Référence M01 : `B(n)=6(n−1)`, `E(c)=floor(3*log2(1+c/3))`, `M(m)=floor(log2(1+m))`. Coûts : ajout d'un point atteignant le rang r de caractéristique = `1+floor((r−1)/8)` ; pour une maîtrise = `1+floor((r−1)/6)`. Les comptes sont **communs** : caractéristiques, maîtrises et capacités. `evaluateSheet` délègue à `evaluateBuild` de M01 puis complète les validations narratives. `transact` copie d'abord la fiche, recalcule toute la dépense, refuse les modifications invalides et ne renvoie que le résultat légal. Les remboursements sont également revérifiés.

Résolution ordinaire M02 : `5d6 + E(c) + M(m) + situation` ; 5–7 échouent naturellement malgré tout bonus. Les règles d'opposition M03 ne sont pas modifiées ici.

## 8. Politique de migration et préservation

1. L'ancien stockage v1 est lu sans réécriture de sa clé ; les fiches détectées anciennes sont affichées avec **étiquette historique en lecture seule**.
2. Avant une adaptation, un dialogue explique qu'il s'agit d'une copie M02, que points et XP de progression repartent au niveau 1 et que l'original reste disponible.
3. `migrateLegacy` refuse toute conversion sans consentement ; `legacyOriginal` stocke l'objet JSON brut complet, y compris les champs inconnus (inventory, portrait, magie, capacités, relations et notes).
4. La copie M02 et la fiche originale restent deux entrées distinctes dans le répertoire ; `restoreLegacy` permet la reconstitution programmatique de l'original archivé.
5. Les exports des fiches et de campagne contiennent les informations de version et les archives nécessaires. L'import de campagnes v1/v2 et d'anciennes listes de fiches reste possible.

**Limite identifiée :** l'interface de restauration d'un instantané *dans une fiche courante* n'a pas de bouton spécifique : la réversibilité passe par l'ancien profil conservé et l'export de l'instantané. Les très gros profils et les champs malformés restent tributaires des limites historiques d'import.

## 9. Exemples non canoniques — niveaux 5 et 25

- **N5 / parcours guidé :** stats initiales 3/3/3/3 et distribution de 24 points commune aux scores et maîtrises selon les quatre épisodes de vie, sans aucun crédit de maîtrise supplémentaire. XP = 400, PV historiques de création N5 = 36. Aucun Cercle, Autorité ou effet gratuit.
- **N25 spécialiste mathématique M01 :** 39/3/3/3, Physique brut 39 → E=+11 ; budget 144 ; la complétude acquise doit provenir aussi de maîtrises, d'aptitudes et de l'histoire.
- **N25 polyvalent mathématique M01 :** 18/17/17/17, E max +8 ; le budget commun permet aussi l'achat de domaines non martiaux. Ces distributions sont des *prototypes mathématiques*, pas des personnages du canon.

## 10. Spécialisation contre polyvalence de haut niveau

Les exemples extrêmes de M01 ne sont **pas des obligations**. Le coût croissant des caractéristiques pousse les personnages avancés à consacrer une partie de leur budget aux domaines annexes. La maîtrise d'un métier et l'aptitude acquise n'exigent pas que l'attribut général devienne dominant. Cependant M02 ne doit pas rendre la polyvalence obligatoire en uniformisant quatre valeurs. Pour le playtest, comparer à chaque palier N5/N10/N15/N20/N25 les investissements de combat, secours, arts, recherche, négociation, artisanat, exploration et magie ; observer coûts, efficacité et liberté de choix avant d'ajuster M01.

## 11. Tests et vérifications (statut daté)

- Nouveau `scripts/test-5d6-m02.mjs` : budgets, niveau 1/5/10/15/20/25, score 39 sans cap, refus d'excès, remboursement, achats d'aptitude/technique/signature, signature sans validation MJ, capacité définie sans effet, prérequis de maîtrise, XP répétés et identifiant dupliqué, migration réversible, parcours N5 et jalons MJ 21–25.
- Le script est ajouté à `npm test` après les tests de probabilités, progression, opposition et origines.
- Premier workflow PR #59 `#41237994340` : `npm ci` **réussi**, `npm test` **échoué au contrôle TypeScript** (imports inutilisés et garde de types). Corrections apportées au commit `eb7411d72defba69edbc96ab06d89451af5929c5`. Nouveau workflow `#41238047005` lancé.
- **Ne pas considérer le build, les tests M02 ou un playtest humain comme réussis tant que leur résultat n'est pas établi par CI.** Ajouter ici l'URL de la dernière exécution confirmée lors de la revue.

**Validation automatisée concluante — 31 octobre 2026 :** [workflow GitHub Actions #41238369944](https://github.com/Sijiel44/archives-alrick/actions/runs/41238369944), commit `c0fc43410f3af4408e9c8226198668b51b6dd6e9` : **SUCCÈS** pour `npm ci`, `npm test`, la vérification TypeScript, le build Quartz et le contrôle des liens. La suite a contrôlé **367 pages de contenu**, compilé **454 fichiers Markdown**, émis **1 195 fichiers**, vérifié **1 106 pages HTML et 63 148 liens**. Les tests des probabilités, des oppositions et du parcours historique, ainsi que M01 et M02, sont **verts**. La sortie M02 certifiée est :

```json
{"result":"OK","test":"M02","checkedLevels":[1,5,10,15,20,25],"validation":"M01 shared budget","legacy":"explicit reversible snapshot","xp":"anti-repeat","milestones":5}
```

**Attention à la portée de ce résultat :** tests automatisés et compilation réussis, mais **aucun essai humain de navigateur ni campagne de migration sur l'ensemble des vraies fiches anciennes n'est revendiqué**. Les validations UI sur ordinateur et mobile restent à effectuer avant M04. Les anciens échecs de CI sont historiques et corrigés, pas l'état courant de M02.

## 12. Difficultés et limites

L'Atelier est un composant long et historiquement couplé aux sauvegardes, au combat, au bestiaire et à la magie. La politique conservatrice évite de requalifier automatiquement le passé d'un personnage selon un nouveau budget. Le combat d'opposition attend la mission M03, notamment le déséquilibre des résistances N25 signalé dans #57. Les anciennes missions de groupe sont adaptées en événements M01 pour les PJ M02 ; les fiches historiques restent inchangées. La capacité mécanique structurée ne garantit pas que son effet textuel dispose d'un exécuteur automatique. **Aucune modification du canon d'Orin.**

## 13. Fichiers créés ou modifiés

- Ajout : `quartz/components/scripts/atelier5d6-m02.ts`.
- Ajout : `scripts/test-5d6-m02.mjs`.
- Modifié : `quartz/components/scripts/atelier5d6.inline.ts`.
- Modifié : `quartz/components/Atelier5d6.tsx`.
- Modifié : `package.json`.
- Ajout : `docs/rapports-missions/M02_ATELIER_CAPACITES_5D6.md`.

## 14. Branches / PR / commits

- Branche M02 : `rules/m02-atelier-capacites-5d6-20261031`.
- Base M02 : `rules/m01-progression-5d6-20261031` (PR #58, non fusionnée).
- Dépendance ascendante : PR #57.
- PR #59 (DRAFT) : https://github.com/Sijiel44/archives-alrick/pull/59.
- Commits principaux : `50540a27` (adaptateur), `d08eedab` (tests), `17fc8651` (npm), `e100046a` (sauvegardes/Atelier), `73499870` (interface), `67daa16f` (achats/jets), `d2e8856a` (actions UI/export), `cc1c37aa` (rangs), `1ef5206e` (préservation du niveau courant), `eb7411d7` (corrections TS). Vérifier le dernier SHA GitHub pour tout commit documentaire ultérieur.

## 15. Instructions pour M03 et M04

**M03 :** rester sur une branche distincte, étudier les seuils de résistance, absorption, blessures et jeux de dommages des combattants N25 ; vérifier le grimoire et le bestiaire avec le bonus effectif. Proposer une passerelle sûre pour les jets M02 en opposition, aujourd'hui bloqués volontairement. Ne jamais confondre la maîtrise d'un sort et une Autorité ou un Cercle accordé.

**M04 :** comparer/assembler #57, #58 et #59 avec les PR grimoire, bestiaire et multijoueur ; exécuter `npm ci`, `npm test`, `npm run build`, essais navigateur desktop et mobile avec imports anciens (v1/v2) et nouveaux (v3), répétition d'XP, profils N25 et sauvegarde complète. Un MJ doit vérifier explicitement le comportement et l'historique avant toute publication. **La décision de fusion et la mise en ligne appartiennent uniquement à M04.**

---

**Rappel du statut :** cette branche constitue un chantier de règles expérimental. Les tests et leur conclusion CI doivent être validés avant de présenter M02 comme terminée.
