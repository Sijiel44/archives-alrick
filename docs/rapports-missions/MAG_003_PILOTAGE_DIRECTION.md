# MAG-003 — Pilotage de Direction générale

**Point de contrôle : 1er novembre 2026**  
**Dernier jalon examiné : MAG-003.D — consolidation technique ; revue DG du 1er novembre 2026.**  
**État consolidé de Direction : A validée techniquement ; B prototype accepté avec consolidation ; C terminée avec réserves ; D validée techniquement avec réserves. PR #69 à #72 ouvertes en brouillon ; aucune fusion, publication ou canonisation.**  
**Autorité :** Direction générale et créateur des Archives d'Alrick ; aucune validation canonique anticipée.

## Chaîne GitHub et périmètre

- **Dépôt :** [Sijiel44/archives-alrick](https://github.com/Sijiel44/archives-alrick).
- **Base initiale main :** 6967679b1dee5f6b9762bd6cc4378827d0ec975e.
- **Branche :** magie/mag003a-recuperation-mana.
- **PR :** [#69 — MAG-003.A](https://github.com/Sijiel44/archives-alrick/pull/69), brouillon vers main.
- **Premiers commits repères :** 63f325d (moteur), 121a494 (simulateur), a136e42 (arrondis), 294fdb9 (tests), 71ef68b (intégration npm test), 80cc40c (correction du scénario), db1eeae (intensité M03), 2f33f41 (tests de l'intensité), 6f879c0 (arithmétique BigInt), 9522eb2 (report fractionnaire exact). Les rapports se trouvent dans les commits suivants de cette même branche ; la tête effective est à vérifier sur la PR, sans supposer ces identifiants définitifs.
- **Branches dépendantes à préserver :** [#55 G-001](https://github.com/Sijiel44/archives-alrick/pull/55), [#66 T-001](https://github.com/Sijiel44/archives-alrick/pull/66), [#68 MAG-002](https://github.com/Sijiel44/archives-alrick/pull/68), toutes constatées ouvertes en brouillon au démarrage ; aucun commit MAG-003.A n'y a été poussé.

## Développement et livrables

| Domaine | État | Source |
| --- | --- | --- |
| Récupération plafonnée et anti-cumul | Implémenté en prototype | atelier5d6-mana-recovery.ts |
| Fractions, jours, maximum variable, idempotence | Implémenté en prototype | alrick.mana.recovery.v1 |
| Modèle C et coût par intensité | Implémenté en laboratoire | magicCost |
| Simulation expédition avec graine fixe | Implémenté | atelier5d6-mana-expedition.ts |
| M01 5d6 et M03 combat | Réemploi des résolveurs existants | resolveProgressionAction, resolveCombatM03 |
| Scripts de tests et npm test | Déposés et intégrés | scripts/test-mag003a.mjs, package.json |
| Rapport technique | Déposé | [MAG_003_A_MOTEUR_MATHEMATIQUE.md](./MAG_003_A_MOTEUR_MATHEMATIQUE.md) |
| Simulations | Déposées | [MAG_003_A_SIMULATIONS.md](./MAG_003_A_SIMULATIONS.md) |
| Fiche de Direction | Déposée | [FICHE_DIRECTION_MAG_003_A.md](./FICHE_DIRECTION_MAG_003_A.md) |

## CI et preuve à consulter

**Premier run examiné :** [GitHub Actions #41318331534](https://github.com/Sijiel44/archives-alrick/actions/runs/41318331534) sur 71ef68b. Tests TypeScript, build, contenu, site et M01–M05 exécutés jusqu'au test MAG-003.A ; **échec réel** du scénario comparatif des politiques, dont les étapes ne discriminaient pas la grille (plafond long identique). Code/test corrigés après ce run, ne pas présenter celui-ci comme vert.

**CI validée sur le code (commit 9522eb2aa12727a3e9299efe8d999d5f9dbc7572) :** [GitHub Actions #41318867816](https://github.com/Sijiel44/archives-alrick/actions/runs/41318867816), **SUCCÈS**. Commandes réellement réalisées par Actions : npm ci, npm test (TypeScript, build, liens, M01–M05 et MAG-003.A), puis npm run test:m04:browser. Sortie MAG-003.A : **181 assertions réussies**. Ce commit documentaire actualise le bilan après cette preuve ; [vérifier aussi sa CI](https://github.com/Sijiel44/archives-alrick/pull/69/checks). Aucun playtest humain n'a été exécuté.

## Décisions ouvertes et dépendances

1. **MAG-002 / C-01 :** confirmer ou rejeter la grille 20/40/40/60/50/100, et tester les variantes prudente/ample en partie.
2. **Arrondis :** exactCarry ou cycleAdjustment, cycle effectif, continuité après variation de réserve et règles de journée.
3. **Pratiques :** définition d'un lieu sûr, durée d'un repos, interruption, rituel exceptionnel et équivalence non religieuse.
4. **Intensité et magie :** définir la correspondance officielle entre intensité choisie, effectLevel, limitation du résultat M03 et coût ; pas d'avantage gratuit de haut niveau.
5. **G-001 / MAG-050 :** séparer énergie stockée et nombres d'usages ; ne pas réinterpréter les anciennes charges.
6. **Autorité et sauvegardes :** intégration serveur, révisions concurrentes et permission MJ réelle ; migration versionnée séparée ; aucune importation implicite.
7. **MAG-003.B / MAG-003.C :** dépendre de la politique versionnée après arbitrage et de l'API du noyau, sans dupliquer les formules.
8. **Recette :** faire des playtests humains distincts des simulations, de la CI et des tests navigateur.

## Porte de validation

**Pas de fusion automatique. Pas de publication sur Pages. Pas de modification canonique.**  
Les critères techniques (moteur, scénarios, tests, rapports) sont remplis sur le code contrôlé, sous réserve du contrôle de CI du commit documentaire final. La **validation éditoriale, la fusion et la publication** restent des décisions distinctes et non acquises. Le prototype peut être inspecté sans engager les autres branches.


## MAG-003.B — Rites et cérémonies, chantier distinct (1er novembre 2026)

**Branche :** `magie/mag003b-rites-collectifs` construite depuis la PR #69 MAG-003.A ; **[PR #70](https://github.com/Sijiel44/archives-alrick/pull/70) en brouillon séparée**, base MAG-003.A. MAG-003.A demeure techniquement terminée mais sa validation par la Direction n'est pas acquise. Le lancement du prototype B n'autorise ni fusion de A, ni publication, ni canonisation.

- **Moteur proposé :** `atelier5d6-rituals-mag003b.ts`, schéma `alrick.ritual.v1`, journal, états, transitions et prévisualisations. Rites personnels ordinaires sans jet, rites incertains M01/M03 à probabilité exacte, rôles collectifs et assistance non magique.
- **Verrous :** +1 de soutien maximum, échecs naturels et faisabilité M01/M03, Cercle IX interdit, connaissances distinctes selon opération, matrices autorisées seulement, effets numériques explicitement approuvés, non-cumulables et filtrés par durée et contexte.
- **Mana collectif :** plans de dépenses individuellement attribués en lecture seule sur MAG-003.A, **aucun débit réel ni autorité serveur** ; aucune promesse d'atomicité multijoueur.
- **Tests :** `scripts/test-mag003b.mjs` raccordé à `npm test` : 14 scénarios automatisés ; [CI #41323080067](https://github.com/Sijiel44/archives-alrick/actions/runs/41323080067) **réussie** sur le code `424b902` : 44 assertions MAG-003.B / 14 scénarios, 181 assertions MAG-003.A, TypeScript, build et 15 scénarios Chrome hérités. Aucun playtest humain.
- **Rapports :** [Technique B](./MAG_003_B_RITES_COOPERATION.md) · [Scénarios B](./MAG_003_B_TESTS_SCENARIOS.md) · [Fiche Direction B](./FICHE_DIRECTION_MAG_003_B.md).
- **Décisions DG ouvertes :** validation de MAG-003.A avant intégration, politique de récupération et d'énergie, plafond de soutien, temps et expiration, droits MAG-050, serveur autoritaire, recette de jeu. Aucune modification des PR G-001 ou T-001.

---

## MAG-003.C — Intégration des interfaces de jeu (1er novembre 2026)

**Branche :** `magie/mag003c-integration-rites` · **[PR #71 — DRAFT](https://github.com/Sijiel44/archives-alrick/pull/71)** vers `magie/mag003b-rites-collectifs` (#70). Le travail est empilé sur B (#70), dépendant de A (#69), sans fusionner ni publier. **A/B demeurent soumis à revue DG ; aucune approbation n'est présumée.**

| Intégration | Livraison effective | Restrictions |
| --- | --- | --- |
| Grimoire #55 | Sources G-001 préservées dans C, mêmes sorts, Cercles, prérequis, matrices | Charges historiques et énergie `caster` non arbitrées, aucune promotion canonique |
| Mana MAG-003.A | Panneau de repos, budget, prévisualisation, crédit local confirmé, idempotence, historique | Attestation du MJ local non sécurisée ; discordances bloquées |
| Rites MAG-003.B | Catalogue démo, participants, rôles, sûreté, M01, probabilité, résolution MJ locale | Aucun effet ni débit de réserve collective, aucun commit multijoueurs |
| Tables T-001 #66 | Contrat d'export/import partiel audité, identifiants et limites documentés | Pas de commande rituelle transactionnelle ; **aucune synchronisation annoncée** |
| Foi, prières, traditions | Méditation, artisanat et prière sans miracle, recherches et variantes proposées | Pas de barème de foi ni d'Autorité, bénédiction ou Cercle automatique |
| Objets | Dossiers de matrice, stabilisation, consécration, fabrication, entretien et recherche | Objets existants seulement ; aucune recharge, aucun artefact créé |
| Persistance | Extension optionnelle `alrick.mag003c.local.v1` sur les fiches sauvegardées | Identité des registres validée, migration inter-ID non automatique |

**Tests** : `npm test` inclut G-001, MAG-003.A/B et MAG-003.C ; Chrome M04.1 étendu à la récupération et aux cérémonies, avec capture mobile émulée. [CI source contrôlée #41324634457 — SUCCESS](https://github.com/Sijiel44/archives-alrick/actions/runs/41324634457) sur un commit **précédant** l'extension Chrome MAG-003.C et cette documentation. Consulter obligatoirement [la dernière CI de #71](https://github.com/Sijiel44/archives-alrick/pull/71/checks) avant jugement ; une CI non terminée ne vaut pas succès.

**Rapports** : [MAG_003_C_INTEGRATION_JEU.md](./MAG_003_C_INTEGRATION_JEU.md) · [MAG_003_C_RECETTE.md](./MAG_003_C_RECETTE.md) · [FICHE_DIRECTION_MAG_003_C.md](./FICHE_DIRECTION_MAG_003_C.md).

**Arbitrages DG** : approbation des phases A/B ; grille et conditions de repos ; rôles et soutien collectif ; économie charges/énergie des matrices ; contrats de foi et d'intervention divine ; protocole serveur transactionnel avec autorisation, idempotence, `expectedRevision`, reçus et sauvegardes ; recette humaine sur plusieurs appareils et migrations historiques. **Décision de publication distincte.**

**Verrou permanent : NE PAS fusionner `main`, NE PAS déployer Pages, NE PAS modifier le canon.**


**Addendum de contrôle CI (code MAG-003.C, 1er novembre 2026).** [Run #41324736498 — SUCCÈS](https://github.com/Sijiel44/archives-alrick/actions/runs/41324736498) sur `90282ea8` : `npm ci`, `npm test` incluant 44 assertions C, 181 A, 44 B et G-001 ; `npm run test:m04:browser` : 17 scénarios Chrome réussis, notamment récupération réelle, anti-double clic, stockage rechargé, mobile émulé et cérémonie sans débit. **Ce contrôle précède les commits de rapports ; consulter la dernière CI de #71 pour le head final.**


---

## Décision de Direction générale — revue MAG-003.C du 1er novembre 2026

**Portée de cette section :** décision de pilotage relative à la recette automatisée et aux rapports existants ; elle n'approuve aucune fusion, publication, règle canonique ou dépense collective réelle.

### Contrôles GitHub et verdict

- [PR #69 — MAG-003.A](https://github.com/Sijiel44/archives-alrick/pull/69) : **validation technique maintenue**, sous réserve des contrôles d'autorité et de l'intégration finale. Head relevé avant cette note : `20c6651452122b2d60ca175fe49bbb27a6274d41` ; PR brouillon vers `main`.
- [PR #70 — MAG-003.B](https://github.com/Sijiel44/archives-alrick/pull/70) : **prototype accepté, consolidation nécessaire** ; soutien et qualification des contributeurs à fiabiliser. Head : `7e5cb4ce728390b8e0999106482e8581c4a935da` ; base = branche A.
- [PR #71 — MAG-003.C](https://github.com/Sijiel44/archives-alrick/pull/71) : **terminée avec réserves, recevable à la validation expérimentale**, sans autorisation de fusion. Code contrôlé : `dce1fb61c5891af1b39e48d17a2a13e71397e5b1`, base = branche B. [Actions #41325092101](https://github.com/Sijiel44/archives-alrick/actions/runs/41325092101) : `completed / success` sur ce SHA. Selon les rapports de recette : 181 assertions A, 44 B, 44 C et 17 scénarios Chrome automatisés. **Aucun playtest humain ni test sur téléphone physique attesté.**

### Réserves de consolidation avant fusion

1. **Droits et soutien MAG-003.B :** une assistance peut être approuvée localement sans qualification suffisamment vérifiée du participant. Exiger une validation explicite des compétences, de la propriété/identité de la contribution, du prérequis, de la pertinence et de l'unicité ; conserver **+1 maximum** de soutien contextuel dans les limites M01/M03 et refuser les contributions invalides. Le contrôle local n'est pas une authentification réseau.
2. **Chronologie et autorité :** le joueur saisit une journée de campagne et l'Atelier expose un mode MJ local. Un tel mode ne vaut pas autorité multijoueur ; conserver l'idempotence et le refus conservateur, préparer les contrats `expectedRevision`, actionId, permissions PJ/MJ, reçus durables et transactions atomiques **sans débiter collectivement** tant que le serveur n'est pas intégré et audité.
3. **Rites ordinaires PJ :** prévoir un parcours autonome **sans jet ni validation MJ superflue** pour une pratique connue, réalisable et non exceptionnelle. Les rites incertains, exceptionnels ou modifiant autrui restent soumis aux conditions/validations adaptées. Maintenir la séparation entre récupération, rite et intervention divine.
4. **Réconciliation Git :** C contient des sources issues de G-001 #55 alors que #55, #69, #70 et #71 ne sont pas toutes dans `main`. Contrôler les diffs croisés, migrations, imports/export et garde-fous sur l'arbre réel visé avant toute fusion, puis relancer la CI complète à chaque étape.

### Arbitrages retenus pour le prototype, non canoniques

| Sujet | Directive |
| --- | --- |
| Récupération | Référence centrale MAG-003.A ; variantes prudente et ample préservées pour essais |
| Prière et méditation | Équivalence d'accès à la récupération ordinaire ; récupération exceptionnelle conditionnelle et justifiée |
| Foi | Aucun barème, gain ni conversion automatique foi ↔ mana avant contrat cosmologique approuvé |
| Objets G-001 | Énergie stockée et nombre d'utilisations distincts conceptuellement ; pas de migration automatique des anciennes `charges` |
| Coopération | Soutien plafonné à +1, uniquement après contribution qualifiée et vérifiée |
| Multijoueur | Aucune dépense de mana collective sans transaction serveur atomique, autorisée et traçable |

### Précision sur les Tables

MAG-003.C assure **une compatibilité préparatoire avec les Tables T-001 #66**, et **non une intégration serveur des rites**. Le serveur T-001 n'est pas relié à MAG-003.C : pas de synchronisation des rituels, pas de débits collectifs autoritaires et pas de permissions réseau pour les cérémonies. Toute formulation « intégration des Tables » dans une fiche doit être lue selon cette limitation.

### Ordre de travail autorisé

1. Consolider la qualification des soutiens, prérequis et contrats énergétiques de B.
2. Simplifier le parcours des rites personnels ordinaires dans C, sans élargissement des permissions réseau.
3. Organiser des essais humains sur ordinateur et téléphone, avec des sauvegardes réelles de test et des scénarios de régression.
4. Étudier le contrat interopérable Grimoire–Tables–Rites, puis préparer une PR distincte de réconciliation/transactions si un serveur autoritaire est réellement disponible.
5. Réconcilier les branches dans l'ordre des dépendances, contrôler les changements croisés G-001 et relancer toutes les validations sur l'arbre destiné à `main` ; **fusion seulement après décision explicite**.

**Verrou DG : toutes les PR restent DRAFT, sans fusion, Pages, activation multijoueur ni canonisation.**

---

## MAG-003.D — Consolidation et porte d'intégration (1er novembre 2026)

**Branche :** `magie/mag003d-consolidation` · [PR #72, DRAFT](https://github.com/Sijiel44/archives-alrick/pull/72) → PR #71 (C) → PR #70 (B) → PR #69 (A). **Aucune fusion** ni publication. A/B/C ne sont pas considérées approuvées par le simple lancement de D.

| Réserve constatée dans C | Action réalisée dans D | Condition de sortie |
| --- | --- | --- |
| Soutien numérique non qualifié | `supportQualification` vérifie personne distincte, rôle, compétence, contribution, droit de Cercle ; +1 maximal | Revue du contrat de compétences et test humain de groupe |
| Rite personnel bloqué pour PJ | Rite du catalogue **connu, simple et automatique**, un PJ, sans autre effet ni jet, accessible en local | Revue MJ des critères de sûreté ; aucune permission réseau |
| Double crédit, chronologie et historique | Refus de clé de repos recyclée pour un autre type ; idempotence étendue au rejeu tardif ; ledger A intact | Contrôle de vraies sauvegardes et réconciliation explicite des écarts |
| Cohérence G-001/Tables | Diff #55↔D et contrat T-001 #66, aucune mutation de charges ou transaction collective | Arbitrages énergie/usages, serveur rituels atomique et permissions PJ/MJ |

**Preuve CI sur le code :** [Actions #41326549809 — SUCCÈS](https://github.com/Sijiel44/archives-alrick/actions/runs/41326549809) à `670471c3` : `npm ci`, `npm test`, MAG-003.A **181**, B **44**, C **44**, D **46** assertions ; **19 scénarios Chrome** réussis (dont deux D). Vérifier aussi la **CI du head documentaire final** de #72 avant acceptation.

**Rapports obligatoires** : [Consolidation](./MAG_003_D_CONSOLIDATION.md), [Réconciliation](./MAG_003_D_RECONCILIATION.md), [Fiche Direction D](./FICHE_DIRECTION_MAG_003_D.md).

**Réserves toujours explicites :** A/B/C non fusionnées, ambiguïté G-001 `charges`, pas de modèle de foi officiel, pas d'autorité serveur rituelle, tests humains multi-appareils et migration historique exhaustive non réalisés. Ces absences ne sont pas des succès implicites.

**Verrou Direction :** aucune fusion `main` ; aucun déploiement Pages ; aucune modification cosmologique/canonique ; aucune transaction collective avant contrôle des permissions, des révisions et de l'atomicité serveur.


---

## Décision de Direction générale — clôture technique MAG-003.D (1er novembre 2026)

**Vérification directe GitHub :** [PR #72](https://github.com/Sijiel44/archives-alrick/pull/72) ouverte en **DRAFT**, head de code et documentation `b5ba4f304983f1ecf098c0b62bce97a662cfab50`, base `magie/mag003c-integration-rites`, lui-même dépendant de B #70 et A #69. [CI finale #41326933850](https://github.com/Sijiel44/archives-alrick/actions/runs/41326933850) : **completed / success**, SHA conforme. Les rapports décrivent 181 assertions A, 44 B, 44 C, 46 D et 19 scénarios Chrome automatisés ; **aucun playtest humain sur PC ou téléphone physique attesté**.

### Décisions de clôture

- **MAG-003.D : VALIDÉE TECHNIQUEMENT AVEC RÉSERVES.** Le correctif soutien qualifié, le plafond contextuel +1, les rites ordinaires autonomes PJ et les protections d'idempotence constituent une base expérimentale recevable.
- **Publication et fusion : NON AUTORISÉES.** Les PR #69 à #72 restent en brouillon, sans canonisation ni activation d'opérations collectives autoritaires.
- **Soutien contextuel :** identité, rôle, maîtrise déclarée et droit de Cercle sont vérifiés ; **réserve résiduelle** : la compétence présente doit encore être reliée à une liste ou règle explicite de compétences **pertinentes pour la contribution exacte**. Aucun avantage fondé sur « première maîtrise disponible » ne doit être accepté comme mécaniquement autoritaire.
- **Repos :** D refuse la réutilisation d'un même identifiant pour un type de repos différent ; **réserve résiduelle** : même identifiant et même type mais conditions/prérequis/demande modifiés doivent être comparés à une **empreinte complète et canonique** de l'opération avant toute utilisation comme journal autoritaire.
- **Grimoire G-001 #55 : BLOCAGE RÉEL.** [PR #55](https://github.com/Sijiel44/archives-alrick/pull/55) toujours ouverte en brouillon et déclarée non fusionnable au contrôle ; [CI indépendante #41267847377](https://github.com/Sijiel44/archives-alrick/actions/runs/41267847377) terminée en **échec** sur `76cabcd7423e83264099063c6e1ac76d80677027`. Les CI vertes D sont propres à son arbre et ne prouvent pas la fusion conjointe G-001 + A–D vers `main`.
- **Tables T-001 #66 :** compatibilité préparatoire et audit, pas de synchronisation rituelle ni de transactions serveur multi-participants.

### Ordre des prochains travaux : recette et réconciliation finale MAG-003.E

1. Faire un diagnostic reproductible de la CI et de la fusion de G-001 #55 ; corriger dans une branche de réconciliation adaptée, sans écraser une branche propriétaire ni intégrer de règles d'énergie non arbitrées.
2. Ajouter un lien **contribution → compétence admissible** contrôlé à la définition du rite, et une vérification refusant les compétences non pertinentes, sans modifier le plafond +1.
3. Définir une empreinte de requête de repos qui inclut paramètres et conditions réellement déterminants ; vérifier rejouabilité identique et refus d'un identifiant réutilisé avec contenu divergent.
4. Tester les sauvegardes historiques et migrations sur copies, y compris G-001, MAG-003.A–D et import/export des fiches.
5. Organiser des parcours **humains** PJ/MJ sur ordinateurs et téléphones physiques ou déclarer ceux-ci non accomplis et bloquants selon la politique de publication.
6. Préparer sur une **branche/PR d'intégration distincte** un arbre commun G-001 + MAG-003.A→D, avec revues de conflits, CI complète sur la tête réellement destinée à `main` et sans fusion automatique.
7. Conserver hors périmètre de cette consolidation les contrats créatifs non validés : énergie stockée vs usages d'objet ; foi, prières et intervention divine. Les traiter dans des dossiers d'arbitrage séparés.

**Porte de sortie :** la validité expérimentale de D n'autorise ni fusion, ni publication, ni économie de foi, ni opération serveur. Toute décision ultérieure requiert les preuves techniques du nouvel arbre et une autorisation explicite du créateur et de la Direction.


### Diagnostic ciblé de la CI G-001 #55 (journaux consultés)

**Diagnostic précis du défaut G-001 #55 (CI #41267847377)** : échec de l'étape `npm run test:m04:browser` ; scénario **« G-001 : campagne v1 vers v2 avec extensions inconnues »**. Après import, l'export de campagne attendu ne crée aucun Blob et le navigateur signale **`ReferenceError: exportCampaign is not defined`** dans un gestionnaire d'événement. Les autres scénarios Chrome précédemment exécutés dans cette CI incluent des exports Bestiaire/Atelier et la migration des fiches v2→v3. **MAG-003.E doit identifier et corriger la référence manquante ou la portée de cette fonction, vérifier la migration et l'export réels, puis rerun la CI de l'arbre G-001 corrigé avant réconciliation.** [Preuve : workflow #41267847377](https://github.com/Sijiel44/archives-alrick/actions/runs/41267847377). Ne pas masquer le test ou réduire ses assertions pour faire passer la CI.


---

## Décision de contrôle — MAG-003.E : recette et réconciliation expérimentales (1er novembre 2026)

**Référent :** intégration Git, sauvegardes et recette 5d6. **Branche indépendante :** `magie/mag003e-recette-reconciliation`. **PR :** [#75 (DRAFT)](https://github.com/Sijiel44/archives-alrick/pull/75), base `main`. Toutes les PR #55, #69–#72, #66 demeurent sous leur autorité et ne sont ni modifiées ni fusionnées par E.

### Constat technique et preuves

- Blocage G-001 #55 reproduit via [Actions #41267847377](https://github.com/Sijiel44/archives-alrick/actions/runs/41267847377) : `ReferenceError: exportCampaign is not defined` lors de l'export de campagne v1→v2. Correction autonome en [PR #74 (DRAFT)](https://github.com/Sijiel44/archives-alrick/pull/74) ; [CI #41336804861 — succès](https://github.com/Sijiel44/archives-alrick/actions/runs/41336804861) sur `8c4cc52661d6ea71055ada73499b101e8c682382`. Aucun test d'export supprimé et aucun écrasement de #55.
- MAG-E : pertinence de la maîtrise conditionnée au contrat de contribution `supportRules` (rôle, compétence, connaissance, droits de Cercle), au lieu de « première maîtrise disponible ». Assistance non chiffrée et non-mages possibles. Bonus +1 maximum et M01/M03 inchangés.
- Repos : empreinte canonique versionnée des opérations ; ID identique/paramètres identiques = idempotence ; paramètres ou validation divergents = collision refusée sans second crédit. Les anciennes opérations restent exportables sans altération ; ID legacy sans preuve non rejouable automatiquement.
- `main` et G-001 étaient divergents, mais MAG-003.A→D constitue une chaîne empilée issue de `main`. L'arbre E reprend le code G-001 porté par C/D, les hooks de suivi du mana et les quatre archives documentaires G-001. Les scénarios navigateur d'export/import G-001 ont été réintroduits **avec** ceux de C/D dans l'arbre E.
- **Preuve intermédiaire** : [Actions #41337453962 — succès](https://github.com/Sijiel44/archives-alrick/actions/runs/41337453962) sur `6a530a395acedb4c5ac800a93b2a78e7b688f6e7`, incluant `npm ci`, `npm test`, TypeScript, Quartz, contenu et liens, suites A (187), B (44), C (44), D (46), E (23), 19 scénarios Chrome. **Cette CI précède la réintroduction des trois scénarios G-001 et la clôture documentaire : elle ne prouve pas le HEAD final.** Seule une CI complète nouvelle sur le SHA exact de #75 fera autorité.

### Livrables

- [Recette et réconciliation E](./MAG_003_E_RECETTE_RECONCILIATION.md).
- [Audit de sauvegardes E](./MAG_003_E_AUDIT_SAUVEGARDES.md).
- [Plan d'intégration E](./MAG_003_E_PLAN_INTEGRATION.md).
- [Fiche Direction E](./FICHE_DIRECTION_MAG_003_E.md).

### Verdict et limites de l'autorité

**Statut : techniquement vérifiable, terminée avec réserves ; réception finale conditionnée à la CI du dernier head et à la revue DG.** Les essais humains sur PC et téléphone physique et l'audit de copies autorisées d'archives personnelles demeurent **ouverts**. Le mode MJ est local, aucune dépense rituelle collective autoritaire ni gestion transactionnelle réseau n'existent. L'ambiguïté `energySource=caster`/charges, les notions de source, stockage, usages, activation et entretien ainsi que les domaines foi/mana/intervention divine restent **soumis au créateur** et hors du canon automatique.

**Verrou absolu : aucune fusion dans main, aucune publication GitHub Pages, aucune canonisation, aucune transaction serveur collective ; autorité DG + créateur requise après nouvelle revue du SHA exact.**


## Décision du créateur — intégration contrôlée et publication (1er novembre 2026)

Le créateur a explicitement autorisé l'intégration, la publication et une canonisation limitée aux règles déjà approuvées et définies. Cette décision remplace les verrous antérieurs de non-fusion et de non-publication pour le périmètre ci-dessous uniquement.

### Périmètre intégré

- L'arbre de [MAG-003.E #75](https://github.com/Sijiel44/archives-alrick/pull/75) intègre G-001 [#55](https://github.com/Sijiel44/archives-alrick/pull/55), son correctif d'export [#74](https://github.com/Sijiel44/archives-alrick/pull/74) et MAG-003.A–D [#69](https://github.com/Sijiel44/archives-alrick/pull/69), [#70](https://github.com/Sijiel44/archives-alrick/pull/70), [#71](https://github.com/Sijiel44/archives-alrick/pull/71) et [#72](https://github.com/Sijiel44/archives-alrick/pull/72). Les PR propriétaires ne sont pas fusionnées séparément ; leurs branches et leur historique sont conservés.
- La tête de `main` contrôlée avant intégration était `6967679b1dee5f6b9762bd6cc4378827d0ec975e` (Bestiaire B-002). La branche #75 part de cette tête. La branche B-003 `bestiaire/b003-montagnes-aube` part du même commit et ne partage aucun fichier modifié avec #75 ; elle reste indépendante.
- Arbre testé avant ce relevé : `f99a2db438d65c8d3a7a66c6bec94efa8ee16dba`. La [CI finale #41337690428](https://github.com/Sijiel44/archives-alrick/actions/runs/41337690428) a réussi sur ce SHA. Une validation CI sur le commit documentaire qui enregistre la présente décision reste requise avant fusion.

### Canonisation et limites

- Seules les clarifications du créateur sur les Cercles I–IX sont ajoutées au guide public : Cercles comme prérequis de compréhension/pratique et non niveaux de personnage ; activation au Cercle I d'une structure déjà préparée sans acquisition de la connaissance ou de l'architecture ; pratique du IX réservée aux êtres divins, sans automatisme de niveau 21–25, et sans réinterprétation rétroactive des scènes d'Orin et Freya.
- Les démonstrations de sorts restent non canoniques. Les taux, arrondis et autres paramètres de récupération demeurent configurables et expérimentaux. Les charges des matrices, l'énergie `caster`, coûts et entretien restent provisoires. La foi, le mana et l'intervention divine restent distincts, sans règles d'échange ou d'effet implicites. Les transactions collectives multijoueurs ne sont pas activées ; aucun pouvoir d'autorité serveur n'est ajouté.
- La refonte structurelle générale du jeu et le multijoueur restent hors périmètre afin de ne pas gêner le développement en cours du Bestiaire.

### Recette et publication

- Sur l'arbre #75, `npm ci` puis `npm test` ont réussi localement, incluant TypeScript, build Quartz, contenu/liens, suites M01–M05, Grimoire, sauvegardes et MAG-003.A–E.
- `npm run test:m04:browser` a réussi avec Chrome installé : 22 scénarios, 10 dialogues de confirmation, incluant les migrations et exports Grimoire/G-001. Aucun test sur téléphone physique ni sur sauvegardes privées réelles n'est revendiqué.
- Après publication, noter le commit de fusion et le résultat effectif du workflow GitHub Pages dans ce rapport. Toute réserve d'essai physique reste explicitement ouverte.

