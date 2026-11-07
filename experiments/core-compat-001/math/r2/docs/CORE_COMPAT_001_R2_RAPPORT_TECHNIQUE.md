# CORE-COMPAT-001.R2 — Contrat ciblé MATH / INDEX DATA

Projet : Les Chroniques d'Entre-Rives v0.1 — 10 MATH  
Mandat : DG-PLAN-REPRISE-002, 6 novembre 2026  
Nature : **interface expérimentale, inerte, sans formule nouvelle**  
Source INDEX : PR #105 `4f3dffd51f16c0c1881f925a94a677a87feff17c`  
Source noyau : `88f774f3d0d6d520d8d11443b72202b9caf4f94b`  
Source XP : PR #99, module `xp-decision.ts` blob `76daeb8ec21702e9ebcb27845ccd3d6b709ff574`.

## Périmètre unique : ports exigés par le DATA commun

| Domaine | DATA / référence | Fonction officielle à injecter | État P1 |
|---|---|---|---|
| PJ candidat, niveau 1–25 | `recordKind=pj`, `identity.instanceId`, `data.level`, provenance | INDEX `validateModelRecord` puis INDEX `previewNativeLevel` puis M01 `progressionAtLevel` | Preview, pas d'achat ni passage de niveau |
| Créature / menace | `recordKind=creature`, `definitionId` distinct de l'instance et variante éventuelle | M03 `resolveCombatM03` via INDEX `previewNativeCombat` avec entrée numérique **explicite** | Preview de combat, **aucun budget de développement PJ** |
| Capacités/effets | `recordKind=ability`, `mechanics.validationStatus` non authentifiant | M03 `validateM03AbilityEffect` uniquement sous port propriétaire approuvé | **Unavailable en DATA P1** : jamais d'effet interprété à partir de la narration ou du drapeau `reported-validated` |
| Ressources / sorts / rites | `spell-ref`, `ritual-ref`, `item`, références originelles et blob | Grimoire / Mana / Rites **référencés**, pas invoqués par DATA | Cast, débit, activation et effets numériques **indisponibles** |
| XP proposé | PJ réel avec `characterId` + `campaignId`, `event.id` explicite | INDEX `inspectNativeXpSuggestion` → MATH `suggestXpFromM01(ledger,event)` → M01 `experienceAward` | Montant candidat seulement, **pas de crédit** |
| Décision MJ | Identité de la décision, événement, campagne, run, accomplissement | MATH `recordXpMjDecision` / `recordEncounterXpChoice` **hors prévisualisation DATA** | Décision externe obligatoire ; pas de `M02.grantAward` |
| Identité et idempotence | `definitionId ≠ instanceId`, `recordId`, `campaignId`, `runId`, `accomplishmentId`, `eventId` | INDEX/DATA pour identification ; MATH journal pour déduplication/correction | ID exact `pj:…` conservé, aucune conversion/alias automatique |

### Fichiers et empreintes de référence (blob Git SHA-1)

| Fichier | Référence et blob exact |
|---|---|
| `experiments/p1a-index/src/data-model.mjs` | PR #105 `042e603a19a6c809b782e87c207eb8eecf8cbfdd` |
| `experiments/p1a-index/src/core-ports.mjs` | PR #105 `c8ced9d82cf64d9092e5d6d8a35ab12358876740` |
| `experiments/p1a-index/fixtures/P1A_FICTION_11_RECORDS.json` | PR #105 `0693198e7703ab89cc77cdeb9aad4beb9ce7e222` |
| `quartz/components/scripts/atelier5d6-probabilities.ts` | `bfee984fad47902623f7117e9f024a5b6e042d2d` |
| `quartz/components/scripts/atelier5d6-progression.ts` | `d2040829ea0da7c0f6eae08dc8c701226bfc53c5` |
| `quartz/components/scripts/atelier5d6-combat-m03.ts` | `09929f1b852a971d73d40474847bae036bf11ffb` |
| `experiments/dg-lot004/math-xp/src/xp-decision.ts` | PR #99 `76daeb8ec21702e9ebcb27845ccd3d6b709ff574` |
| `experiments/dg-lot004/math-xp/src/encounter-recommendations.ts` | PR #99 `58ee80a8345113aff89bfc58a3f276f3c401d7c2` |

## Exemple de passage **fiche candidate → M03 officiel** (purement fictif)

- Fiche candidate DATA P1 : `rec:demo:pj-n10`, `identity.definitionId=def:demo:pj-n10`, `instanceId=pj:p1a-talven`, `campaignId=camp:demo-rives-p1a`, `data.level=10`, `mechanics.validationStatus=unvalidated`.
- Le DATA ne possède **pas** dans cette fiche un profil chiffré M03 attesté ; la passerelle exige donc une entrée native fournie séparément par un MJ/adaptateur fiable. Aucun champ narratif n'est converti en bonus.
- Entrée explicite M03 synthétique : `natural=24`, `rawStat=16` (>12 autorisé), `masteryRank=4`, `situation=0`, `level=10`, `difficulty=21`, `kind=physique`, `mode=melee`, `feasible=true`, `baseDamage=6`, `effects` absent.
- L'appel exact est `resolveCombatM03(nativeInput)`, via `previewNativeCombat`; résultat observé dans le banc : `total=33`, `success=true`, `grossDamage=15`, `absorbed=0`, `damage=15`. **Ce n'est pas une capacité du PJ fictif approuvée : ce sont des nombres de laboratoire.**
- Résultat enveloppé : `status=preview`, `executable=false`, `appliedToSheet=false`, `playerReady=false`. Les champs de notes privées DATA n'apparaissent pas dans ce retour.
- M01 lecture de fiche N10 : `progressionAtLevel(10).experience=2025`, `development=54`, sans achat ni mise à jour.
- Autre événement pacifique synthétique : `exploration`, difficulté 6, portée ordinaire, historique vide : **120 XP candidats** par `experienceAward`, jamais versés.

## Invariants et limites d'acceptation

1. L'identité de DATA n'est pas un reçu d'autorité mécanique ; `reported-validated` n'est ni validation du moteur ni autorisation MJ.
2. `data.level` doit être entier entre 1 et 25 ; N26 refusé. Une créature peut entrer M03, **pas** obtenir le budget PJ de `progressionAtLevel`.
3. Toute entrée numérique est **explicite** ; aucune génération de score à partir d'un nom, d'un objet, d'un récit, d'un niveau adverse ou d'un coefficient d'XP.
4. `effects` injectés, absorption, malus d'objet, débit mana et champ numérique inconnu : refus avant M03.
5. Les ressources, sorts, rites et objets restent des références ; aucune déduction de charge/mana, ni lancement, entretien ou modification de PV.
6. Les suggestions XP ne manipulent aucun journal : `recordXpMjDecision` est distinct. Événement déjà décidé, y compris à 0 XP : **bloqué à la preview**, la correction est append-only.
7. La clé d'événement est choisie/validée hors MATH (`campaignId`, `runId`, `accomplishmentId`), avec le même accomplissement boss/quête empêché d'être payé deux fois ; pas de normalisation silencieuse `pj:`.
8. Aucune prévisualisation n'est une projection joueur ni un certificat de canon/fait joué ; STUDIO seul applique la whitelist.

## Preuves exécutées / non exécutées

**Exécuté localement :** Node.js 22.16.0, TypeScript 5.8.3 ; vrais TypeScript M01/M03/probabilités + MATH XP compilés avec `tsc` ; 4/4 blobs runtime originaux, et **port CORE exact INDEX #105** `c8ced9...`. Les `19` tests du port MATH sont **PASS**. Ils contrôlent N1/5/10/15/20/25, non-mutation, parité numérique PJ/créature à entrée native identique, échecs naturels 5–7, 7776 combinaisons, refus N26/niveaux contradictoires, éligibilité des seuls PJ pour progression/XP, événement rejoué, correction et ID collision. Le journal original est attaché (`tests/R2_NATIVE_LOCAL.tap`).

**Frontière simulée dans ce banc** : le `validateModelRecord` DATA complet **n'a pas été exécuté localement**. Les tests injectent un validateur synthétique explicitement déclaré pour isoler la passerelle. Le port CORE est une copie **octet-identique** de INDEX #105 (blob contrôlé), avec uniquement sa constante `MODEL_LEVELS` substituée dans la fixture de laboratoire ; elle ne reproduit aucun validateur ou calcul.

**Test composite préparé mais non exécuté avec succès** : `tests/index-105-on-clone.test.mjs` exige les modules réels `src/data-model.mjs`, `src/core-ports.mjs`, 11 fixtures INDEX #105 et esbuild/TypeScript M01/M03/MATH. Localement, le test **échoue explicitement** `INDEX_105_SOURCE_ABSENT` (code 1) ; log conservé. À exécuter uniquement dans un checkout contenant les blobs propriétaires assemblés. Ce test doit valider les 11 fiches et l'exemple chiffré direct, refuser les effets et vérifier la projection candidate avec whitelist STUDIO requise. La CI Chrome #95 n'est pas exécutée et reste un autre chantier P0.

## Commandes

```sh
# depuis la racine du checkout complet, avec sources MATH et port INDEX gelé de test
node --test experiments/core-compat-001/math/r2/tests/data-native-bridge.test.mjs
# gate composité, nécessite sources INDEX #105 et esbuild du repo
node --test experiments/core-compat-001/math/r2/tests/index-105-on-clone.test.mjs
# uniquement s'il faut reconstruire et vérifier le SHA des sources natives
 git hash-object quartz/components/scripts/{atelier5d6-progression.ts,atelier5d6-combat-m03.ts,atelier5d6-probabilities.ts}
```

## Arbitrages à 00 DG, 01 BUILDER, 11 INDEX

- **DG** : l'enveloppe DATA est-elle une référence descriptive (recommandé P1) ou devient-elle porteuse d'un « profil numérique approuvé » ? Dans ce dernier cas, définir un **reçu externe** versionné, identité/autorité MJ et scope, sans auto-appliquer la règle.
- **INDEX** : le DATA doit conserver `sourceRef`, définition, instance et variante sans remapper les IDs. L'ID d'événement campagne/run/accomplissement doit être un contrat public distinct du texte narratif.
- **BUILDER** : injecter un vrai validateur DATA à la passerelle ; séparer la simulation native, la projection joueur et les magasins privés ; ne pas utiliser les wrappers MATH comme moteur de ressources.
- **COMBAT/MAG/OBJETS** : rendre un jour disponibles des validations versionnées si les règles l'autorisent ; pour l'heure **indisponibles** les malus d'objet, absorption, rites/sorts exécutés, pouvoirs MATH-002, autorités 25+, budgets de créatures assimilés aux PJ.
- **05/QA** : préparer un composite P1 séparé de #95 ; exécuter le gate DATA natif, les imports/sauvegardes, le comportement de l'UI et la protection des secrets. Aucun succès P0 Chrome ne découle de ce dossier.

**Statut : prévisualisation mathématique bornée validée sur le port exact CORE #105 ; validation du vrai DATA INDEX #105 et des adaptateurs applicatifs réservée. Aucun correctif des moteurs officiels, aucun merge/publication/canonisation.**
