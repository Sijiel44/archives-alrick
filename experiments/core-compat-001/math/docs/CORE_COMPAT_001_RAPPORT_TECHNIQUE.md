# CORE-COMPAT-001 / P1-A — Audit ciblé des modules réutilisables

**Rôle :** 10 🧮 MATH · **Mandat :** DG-PLAN-REPRISE du 6 novembre 2026 · **Destinataires :** 00 DG, 01 BUILDER, 11 INDEX, 05 INTÉGRATION, 02 QA.

**Objet :** identifier la frontière mathématique réutilisable indépendamment de Quartz, du Studio MJ, des magasins et d'une réécriture partielle du site, sans créer de nouveau moteur ni activer de règle non homologuée.

**Bases exactes inspectées :**
- Modules Quartz M01–M05 et historiques : `main@88f774f3d0d6d520d8d11443b72202b9caf4f94b`.
- Modules L003 (règles, stockage, catalogue) : PR #85 `2ab809ef5351940e0fc272b859d10f21de894d00`.
- Port XP MATH : PR #99 `86cf1d57eb2d587b88e253c7f0c207db8edf2db2`.
- INDEX XP R2 : PR #97 `d071842639d0adc952dedf3e279c6a1b7004855c`.
- Intégration connue, non corrigée : PR #95 `b75e7f03af625fa1f09782cde4e480c2c6d21c84`.

**Documents exploitables :** `CORE_COMPAT_001_MATRICE.csv` (21 lignes avec chemin, Git blob, export, dépendance, preuve et risque), `CORE_COMPAT_001_CONTRATS_ET_GATES.md`, `FICHE_DIRECTION_CORE_COMPAT_001.md`, journal TAP des essais natifs. Les chemins/empreintes correspondent à une lecture directe des sources GitHub aux commits mentionnés. Il ne s'agit pas d'une certification d'assemblage du nouveau site.

## 1. Décision d'architecture : conserver les propriétaires de règles

| Classe | Source de vérité à réemployer | Condition de séparation |
|---|---|---|
| **Noyau pur prêt à être importé** | `atelier5d6-probabilities.ts`, `atelier5d6-progression.ts`, `atelier5d6-combat-m03.ts` | Passer le moteur tel quel ; valider les données du monde extérieur en amont ; retour en **preview seulement**. |
| **Noyaux calculables sans DOM** | `atelier5d6-m02.ts`, `atelier5d6-origins.ts`, `atelier5d6-bestiary.ts`, `atelier5d6-m05-sheet-view.ts`, `atelier5d6-mana-recovery.ts`, `atelier5d6-rituals-mag003b.ts` | Préserver schémas/versions et chemins de transition ; jamais transformer un aperçu en effet/transaction. |
| **Réemploi derrière adaptateurs** | `atelier5d6-bestiary-workshop.ts`, `atelier5d6-grimoire.ts`, `atelier5d6-rites-mag003c.ts` | Le code utile est mêlé à IDs temporels/aléatoires, mutations de fiche ou panneaux DOM ; extraire une façade sur les exports existants **sans modifier leur formule**. |
| **Compatibilité legacy séparée** | `atelier5d6-opposition.ts` et `atelier5d6.inline.ts` | `ruleset` explicite ; ne pas router une fiche legacy sur M03 sans conversion volontaire et réversible. |
| **Ports v0.1 réutilisables / provisoires** | `experiments/dg-lot003/src/rules/native-preview.ts`, L003 catalogue, MATH #99, INDEX #97 R2 | Ce sont des façades/adaptateurs, pas des règles canoniques ; refléter leur version, et contrôler les sources exactes au raccord. |
| **Persistance et navigateur : frontière I/O** | `experiments/dg-lot003/src/storage/storage.mjs` et interfaces historiques | WebCrypto, conversion octets/Base64, DOM, localStorage, fetch, Chrome/Quartz restent extérieurs au calcul. |

### 5d6, M01, M03

1. `rollFiveDice(rng)` injecte l'aléa ; `TOTAL_OUTCOMES=7776`. La distribution est centralisée dans `atelier5d6-probabilities.ts` (blob `bfee984fad47902623f7117e9f024a5b6e042d2d`). Ne pas récupérer les `Math.random` dispersés des anciennes interfaces comme second générateur.
2. `resolveProgressionAction`, `evaluateBuild`, `effectiveStat`, `effectiveMastery`, `experienceAward`, `experienceRequired`, `canReachLevel` sont dans M01 (blob `d2040829ea0da7c0f6eae08dc8c701226bfc53c5`). Niveaux **1–25**, scores bruts **>12**, échecs naturels **5–7**, jalons **21–25**. L'indice XP **1–12** ne correspond pas au niveau des menaces.
3. `resolveCombatM03`, `resistanceScoreM03`, `effectiveProtectionM03`, `validateM03AbilityEffect` se trouvent dans M03 (blob `09929f1b852a971d73d40474847bae036bf11ffb`). Le résultat et la protection sont calculés sans DOM. **Anomalie connue et toujours bloquée :** `validateM03AbilityEffect` peut approuver `absorption`, mais `resolveCombatM03` ne l'applique pas. La protection matérielle fonctionne indépendamment ; aucun correctif de formule ni sémantique MATH-002 n'est proposé ici.
4. `atelier5d6-opposition.ts` (blob `e0dea2a243b0d6ba18974c76b182e8fd2eec0ad0`) demeure un calcul LEGACY distinct. Conserver son interprétation historique et l'archive brute ; il ne doit pas sélectionner implicitement le barème moderne.

### PJ, créatures, capacités

- M02 `evaluateSheet`/`transact` travaillent sur un état PJ versionné (`alrick.sheets.v3`). `migrateLegacy` conserve une copie `legacyOriginal` mais remet à zéro des valeurs modernes : **jamais en lot ni sans consentement**. `grantAward` **crédite directement** une suggestion M01 ; cette fonction est incompatible telle quelle avec la décision XP libre demandée au MJ.
- `generateCreatureProfileM03` est déterministe et distinct du budget PJ ; `validateBestiaryCard`, `exportBestiaryForAtelier`, `toDefense` et `deriveM05Sheet` fournissent des profils/projections. `createBestiaryCard` produit un ID par `Date.now()/Math.random` : imposer une identité d'instance externe au port. Écart de bornes à traiter par avertissement/import contrôlé : carte Bestiaire PV jusqu'à **999999**, ancienne fiche Atelier bornée à **999**. Une troncature de sauvegarde sur le nouveau site **n'a pas été testée** dans ce mandat.
- `AbilityDefinition` M02 n'autorise pas une description libre à modifier M03 ; `M03Effect` nécessite validation explicite, magnitude 1–2, durée 1–3 et non-cumul. Les identifiants/provenances doivent être fournis et maintenus par INDEX.

### Sorts, rites, mana, objets

- `normalizeGrimoire`, `eligibility`, `resolveSpellCast` (Grimoire blob `4f6d97ce1a6e57b427be6a0d22651a8ec0db899f`) appellent M01/M03 pour les dés. **Même fichier contient `createGrimoirePanel` qui utilise le DOM, et `progressEffects` qui modifie la fiche/mana.** Ne pas importer l'interface/panneau comme moteur ni déclencher les dépenses de mana/charges depuis une prévisualisation.
- `createManaState`, `applyManaOperation`, `manaOperationFingerprint` (blob `4e83763bf0d91779ada10c5ffe96481b192018f0`) constituent un journal de ressources versionné et idempotent, séparé de l'UI. Les modèles de coûts `magicCost` du laboratoire ne deviennent pas des règles adoptées du seul fait de cet import.
- `previewRitual`, `transitionRitual`, `eligibleRitualEffects` (blob `40137156b27939ec95ef2ef2e7a250204bf62c8c`) délèguent les jets à M01/M03 ; les effets, dépenses et applications restent **proposés**. Pas de commit multi-PJ côté client.
- Les `GameItem` et validateurs d'inventaire du grand `atelier5d6.inline.ts` sont locaux à l'interface et au stockage. `PreparedMatrix` appartient au Grimoire ; les `WorkOrder` de MAG-003.C restent descriptifs. INDEX peut pointer ces objets, mais il n'existe pas ici de validateur universel d'effet numérique d'objet. Aucun +1 narratif n'est exécutable par simple mention dans un texte.

## 2. Dépendances aux couches à reconstruire

**Calcul pur** : fonction déterministe + entrée native validée → valeur/proposition. Le code ne doit pas recevoir `document`, `window`, `localStorage`, un `Storage`, ni une URL de publication.

**Normalisation/identité INDEX** : `sourceId`, `instanceId`, `campaignId`, `runId`, `accomplishmentId`, schéma/version/statut et provenance. Pour ARCHIVES v3, un PJ importé peut être **`pj:dg004-fake-pj`** ; ne jamais convertir silencieusement `:` en `-`. L'INDEX R2 de la PR #97 a un contrat distinct de l'ancien INDEX resté dans la PR #95.

**Persistance/UX** : choisir et vérifier le bon `ruleset`; protéger sauvegardes et sources brutes ; traiter la projection joueur par liste blanche ; exiger une action MJ séparée pour l'application. L003 ARCHIVES utilise `crypto.subtle` et conversions d'octets (blob `be6a881018ae1709ecef71c3c5a155acfb94a658`). Ce sont des dépendances d'adaptateur, non de M01/M03.

### Risques prioritaires

| Priorité | Risque vérifié ou réservé | Traitement P1-A |
|---|---|---|
| P0 frontière | `absorption` validable mais non appliqué par M03 | Maintenir le refus dans le port; décision COMBAT/DG ultérieure. |
| P0 XP | Ancien INDEX sur #95 b75 rejette le `pj:` natif ; Chrome affiche `JSON privé invalide: Valeur non JSON` | Reprendre exactement le blob INDEX R2 via 05, tester le **même** clic avec M01 natif, sans alias. |
| P0 transactions | `M02.grantAward` crédite la suggestion native directement ; Grimoire et ancien Atelier mutent des ressources | Séparer `preview`, `MJ_decision`, `journal`, puis commit futur autorisé. |
| P1 import | Limites techniques Bestiaire/Atelier différentes ; legacy M01/M03 distinct | Conserver les données originales, adapter par explicite et tester le round-trip. |
| P1 sécurité | Catalogue/ARCHIVES/Studio ont données privées et une projection joueur | Port des règles sans stockage et whitelist joueur externe, jamais sérialiser les notes MJ. |
| P1 validité | INDEX et MATH ne prouvent pas la parité des **adaptateurs réels** tant que la CI composite ne tourne pas | Tests de bout en bout sur SHA intégration et réponse QA indépendantes. |
| P1 cohérence | Conditions de dépense/charges et objets numériques non unifiées | Aucune formule créée, aucun effet implicite ; propriétaire MAG/OBJETS. |

## 3. Tests réellement exécutés dans ce mandat

Le clone Git complet n'a pas été disponible : `git ls-remote` donne `Could not resolve host: github.com`. Les fichiers M01/M03/probabilités ont été extraits **octet par octet** des dossiers de preuve antérieurs joints au projet et comparés avec les **blobs GitHub lus dans ce mandat** : M01 `d2040829...`, probabilités `bfee984...`, M03 `09929f...` (égalité des empreintes Git complètes dans la matrice). M02/opposition du banc isolé sont uniquement des substituts de types pour la compilation et **ne sont pas invoqués**.

```sh
CORE_COMPAT_SOURCE_ROOT=/chemin/vers/source-native npm_config_ignore_scripts=true node --test experiments/core-compat-001/math/tests/native-invariants.test.mjs
# Sur checkout officiel complet, sans option CORE_COMPAT_SOURCE_ROOT :
node --test experiments/core-compat-001/math/tests/native-invariants.test.mjs
```

**Résultat direct : 12/12 PASS**, TypeScript 5.8.3 et Node 22.16.0. Couverture : 7776 issues, 21 échecs naturels 5–7, RNG injecté, bonus bruts >12, niveaux N1/5/10/15/20/25, seuils XP natifs, M03 défense/protection, effet impact non cumulatif, `absorption` volontairement inerte, faisabilité, progression N26 bloquée. **Ce test ne valide pas les adaptateurs créature/PJ réels** : les mêmes entrées natives sont comparées, sans importer les deux adaptateurs.

Deuxième commande exécutée avec les sources/ports MATH byte-identiques à #99 :

```sh
node --test experiments/dg-lot004/math-xp/tests/xp-decision.test.mjs experiments/dg-lot004/math-xp/tests/encounter-recommendations.test.mjs experiments/dg-lot004/math-xp/tests/repair-math-browser-parity.test.mjs
```

**Résultat direct : 67/67 PASS**, zéro échec/skip. Contrôles du journal MATH, choix MJ commun/individuel, rejet PNJ, boss+quête idempotents, XP suggérés par M01, exemple navigateur fictif 60 XP, absence de mutation de fiche. Les modules étaient ceux de #99, dont les blobs sont aussi vérifiés par GitHub. Il ne s'agit pas d'une recette réelle du navigateur.

**Inspecté mais non exécuté dans ce mandat** : `atelier5d6-m02.ts` réel, `bestiary-workshop.ts`, Grimoire, MAG/RITES, INDEX R2 ESM, ARCHIVES et UI. L'ancien succès documentaire/CI INDEX #97 et la CI générale de #99 restent des preuves **rapportées** du dépôt, sans qualification P1-A composite. Les tests INDEX v0.2, Chrome, npm test global, débits réels, sauvegardes réelles et sécurité joueur ne sont pas revendiqués ici.

## 4. Raccord P0-B consultatif à 05 — sans changement de #95

**Constat dans la CI #95 b75** : [run 42029632210](https://github.com/Sijiel44/archives-alrick/actions/runs/42029632210), step Chrome échoué. L'ancienne `index.mjs` blob `18cfa95cee60258322f0f0e32b8214ec95b509ac` reçoit une fiche `pj:...` de `previewCharacterImport`, mais `safeIdentifier` refuse `:`. La factory conserve `id:undefined`; le clone JSON retourne `Valeur non JSON`. Le même clic par MATH fournit la suggestion M01 **60 XP** ; le scénario ne crédite aucun XP. **Un deuxième échec**, `CYCLE_scene_VALIDATION_REJECTED`, touche les créateurs/STUDIO indépendamment de l'XP.

**Correctif d'identité déjà livré par INDEX, non copié par MATH** : PR #97 HEAD `d071842639d0adc952dedf3e279c6a1b7004855c`, fichier `experiments/dg-lot004/src/catalog/index.mjs` blob **`27ffd1dbb520eed8fff3efd293948c94ea57cf95`** ; conserve `pj:` exact et retourne une erreur structurée pour un ID réellement invalide. Le port MATH de #99 reste au HEAD `86cf1d57eb2d587b88e253c7f0c207db8edf2db2` ; `src/xp-decision.ts` blob `76daeb8...` et `src/encounter-recommendations.ts` blob `58ee...` inchangés.

**Recette intégrateur et QA requise après copie vérifiée** :

```sh
node --test experiments/dg-lot004/math-xp/tests/xp-decision.test.mjs experiments/dg-lot004/math-xp/tests/encounter-recommendations.test.mjs experiments/dg-lot004/math-xp/tests/repair-math-browser-parity.test.mjs
EXPECT_INDEX=fixed node --test experiments/dg-lot004/math-xp/tests/verify-index-browser-bridge.mjs
node --test experiments/dg-lot004/tests/catalog/catalog.test.mjs experiments/dg-lot004/tests/catalog/catalog-r2.test.mjs
node experiments/dg-lot004/tools/test-demo-browser.mjs
```

Le script composite `verify-index-browser-bridge.mjs` doit être exécuté **dans le clone complet après reprise de la R2 INDEX**. Sur la branche MATH seule, son absence de module INDEX est un blocage explicite, non une preuve de réussite. Contrôler : parité MATH/INDEX/`experienceAward`, `sourceEventId = JSON.stringify([campaignId,runId,accomplishmentId])`, PNJ N20 aidant, deux PJ sélectionnés, index 1–12 non confondu avec niveau N1–25, duel boss/quête identifié, décision MJ commune ou individuelle, journal inerte, aucune écriture de fiche/localStorage sur « Calculer », DTO joueur sans données MJ. **Ne pas lancer `grantAward` M02.**

## 5. Verdict et arbitrages

**Validé techniquement dans ce mandat :** sources pures M01/M03/probabilités isolables, valeurs/invariants sur fixtures exécutées, port XP MATH sans crédit sur fixtures exécutées, cartographie statique des chemins/dépendances vérifiée par fichiers Git exacts.

**Recevable sous réserve :** M02, bestiaire, rites, mana, Grimoire pour leurs exports de calcul/projection ; leurs transitions et schémas nécessitent les tests ciblés d'intégration et de validation indépendante.

**Bloqué tant que non validé :** effet `absorption`, effets numériques d'objets, écriture XP automatique, migration legacy massive, publication, mutualisation de ressources comme autorité serveur.

**Décisions encore ouvertes :** interface minimale du nouveau conteneur/transport, origine de l'identité MJ/authentification, adaptateurs PJ/créature et import au cas par cas, schémas de journal et mécanisme d'application ultérieur, barèmes expérimentaux menace/XP (ni homologués ni recopiés dans M01), correctifs de l'UI composante #95 par le seul 05.

**Passation :** ce dossier et la matrice sont destinés à BUILDER, INDEX, 05 et DG. Un dépôt dans GitHub ne prouve pas qu'un rôle a lu la passation. Aucun module officiel ni branche intégrée n'a été modifié.
