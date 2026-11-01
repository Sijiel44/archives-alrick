# MAG-003.B — Moteur de rites personnels et coopération (rapport technique)

**Archives d'Alrick — 1er novembre 2026**  
**Branche :** `magie/mag003b-rites-collectifs` · **Base technique :** `magie/mag003a-recuperation-mana` (PR #69, brouillon)  
**Statut :** prototype expérimental livré pour audit ; aucune fusion, aucune publication, aucune adoption canonique.

## 1. Dépendance et séparation éditoriale

La PR #69 de MAG-003.A est **terminée techniquement mais non validée par la DG** lors du démarrage de MAG-003.B. Afin d'éviter un développement détaché de son API, MAG-003.B est empilée sur sa branche, avec une PR distincte, à destination de cette branche. L'intégration finale dans `main` dépend de la validation et de l'intégration de MAG-003.A. Aucun changement n'est fait sur G-001 #55, T-001 #66 ou MAG-002 #68.

Le Contrat éditorial interdit de traiter les propositions comme du canon. Les frontières Codex / MAG-050 sont volontairement plus restrictives que les usages documentaires : matrice explicitement autorisée, Cercle I–VIII uniquement, droit vérifié sur **l'action exacte** (concevoir, comprendre, assister, activer). La présence d'assistants ne crée aucun droit sur un Cercle, et le Cercle IX est refusé.

## 2. Architecture et code

**Nouveau noyau :** `quartz/components/scripts/atelier5d6-rituals-mag003b.ts`.  
**Schéma :** `alrick.ritual.v1`, export/import JSON et contrôles de version.  
**Modèles :** `RitualDefinition`, `RitualInstance`, `RitualParticipant`, `RitualContribution`, `RitualEffect`, `RitualEvent`, `RitualJournalEntry`.  
**États :** `brouillon → prepare → engage → resolu`, avec interruption depuis préparé/engagé et annulation depuis brouillon/préparé ; aucun retour en arrière ni sortie d'état final. Les libellés techniques sans accents sont sérialisés et correspondent aux statuts fonctionnels français.

**Fonctions :** `validateRitualDefinition`, `createRitualInstance`, `transitionRitual`, `previewRitual`, `applicationPlan`, `exportRitual`, `importRitual`.

Chaque transition porte un ID, une empreinte, un tick explicite et une entrée de journal. Le même ID + contenu est idempotent ; collision sur même ID + contenu différent refusée. Le tick est monotone, non lié au temps système.

Le moteur n'écrit **aucun** bonus, PV, mana ou effet dans les fiches. `resolu` signifie que la résolution a été calculée, et **non que les conséquences ont été appliquées**.

## 3. Rites personnels, connaissances et jets

Pratiques : méditation, prière, recueillement, discipline runique, étude magique, préparation rituelle, tradition personnalisée. Un rite maîtrisé et réalisable est **automatique, sans lancer de dés** ; une pratique incertaine exige un naturel 5d6 explicite.

M01 : `resolveProgressionAction` et `probabilityProgressionAction` avec caractéristique brute et maîtrise de l'officiant ; échecs naturels 5–7, faisabilité et seuil calculés par M01 ; aucune caractéristique plafonnée à 12.  
M03 : `resolveCombatM03` avec paramètres explicites et distribution exacte via `sumOccurrences` sur 7 776 issues ; aucun dommage appliqué.  
Les deux branches se fondent sur les fonctions existantes. Les pratiques peuvent donner une proposition narrative et ne convertissent jamais une description libre en bonus.

## 4. Rôles, participation et effets

Rôles : officiant, runiste, canaliseur, chantre, gardien, artisan, assistant. Les non-mages peuvent apporter composants, protection, structure, connaissance ou sécurité. Les contributions de durée et de prévention d'interruption sont descriptives / limitées ; elles ne créent pas automatiquement de tours, de défense ou de ressource.

Un seul jet principal ; le soutien contextuel **plafonné à +1** et contraint par la situation M01/M03 **−2..+2**. Même dix aides qualifiées ne procurent pas dix bonus. La source requiert une contribution expressément approuvée, pas le simple nombre de participants.

Effets proposés : clarté, concentration, harmonie, préparation, protection et inspiration ; contexte et expiration obligatoires, durée 1–3 ticks de laboratoire, sans moteur persistant de temps. L'unique bonus numérique accepté dans le catalogue est **+1 contextuel explicitement approuvé par le MJ** ; aucune application automatique ni cumul. Ces limites sont des hypothèses de test, non des durées canoniques. Aucun effet numérique ne découle directement du langage narratif.

## 5. Mana et sûreté transactionnelle

Le modèle `RitualDefinition.energy` exige une **politique énergétique nommée**, un plafond par contributeur et un plafond total. Les contributions ont un ID, un propriétaire et une quantité entière, validés à la préparation. Le calcul lit les `ManaState` de MAG-003.A via `validateManaState` ; il vérifie solde, identité, journal d'opérations et totalité des engagements par personne.

`previewRitual` produit des opérations `ManaOperation` **spend** avec identifiants déterministes distincts, sans les exécuter. Le registre MAG-003.A reste intact. `applicationPlan` retourne `applied:false` ; les rites multi-personnages exigent un futur serveur transactionnel et un protocole de révision / rollback / verrouillage. Ce prototype n'offre **aucun** commit multi-personnages, aucun crédit de mana, aucune copie de réserve et aucun mécanisme d'autorisation réseau. Les attestations locales ne constituent pas un contrôle de droits sécurisé.

## 6. Limites, risques et décisions DG

- **Bloquant :** MAG-003.A #69 toujours en brouillon ; validation éditoriale et politique d'énergie obligatoires avant intégration.
- **Bloquant pour le multijoueur :** serveur autoritaire, permissions, validation MJ, transactions atomiques, contrôle des révisions et idempotence inter-sessions.
- **À définir :** règles concrètes de durée, coût de composants, seuils, effet et expiration ; validation des contributions, droits de connaissances MAG-050, catalogue des rites et rituels collectifs exceptionnels.
- **À évaluer :** comportement de la coopération +1 dans les situations réelles ; les 10 assistants n'augmentent pas la puissance d'un Cercle.
- **Hors périmètre :** économie de foi, Grimoire, Tables, rétroactivité sur la campagne, UI publique, débits réels, simulation de réseau.

Le script `scripts/test-mag003b.mjs` est raccordé à `npm test`. **Preuve GitHub Actions :** [workflow #41322728636](https://github.com/Sijiel44/archives-alrick/actions/runs/41322728636), réussite complète sur le code du commit `075dea296e5c993408528296df7899ca87438952` : npm ci, npm test (TypeScript, build, M01–M05, MAG-003.A), **41 assertions MAG-003.B sur 14 scénarios**, ainsi que **15 scénarios Chrome M04.1/M05**. Aucun playtest humain ni test serveur. Voir `MAG_003_B_TESTS_SCENARIOS.md`.

**Décision soumise à la Direction :** valider/rejeter le modèle de rite et la règle de soutien ; confirmer les limites sur les Cercles et l'autorité ; ne pas fusionner ni publier sans examen.
