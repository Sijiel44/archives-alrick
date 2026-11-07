# 10 MATH — DG-LOT-004 / L004-REPAIR, cause CI b75 et raccord INDEX

**Propriété** : `experiments/dg-lot004/math-xp/**` de la PR MATH #99 seulement. **Références** : PR intégration #95 @ `b75e7f03af625fa1f09782cde4e480c2c6d21c84` ; PR INDEX propriétaire #97 @ `d071842639d0adc952dedf3e279c6a1b7004855c` ; MATH #99 base R2 @ `e3fcbce49074bfcbe8814842a5ad57d0ba76160d`. Aucune intervention sur les branches INDEX/05, PR #85/#91 ni les moteurs M01–M05.

## Preuve directe de la CI intégrée

- [Run #42029632210](https://github.com/Sijiel44/archives-alrick/actions/runs/42029632210), job `127252469331` : **failure**, Chrome réel. Étape navigateur : `DG004_P0B_XP_BLOCKED DG004_XP_UNAVAILABLE : Contrat MATH/INDEX refusé : {"index":["JSON privé invalide: Valeur non JSON"],"mathStatus":"suggested"}`.
- **Autre P0 distinct** à la même étape : `CYCLE_scene_VALIDATION_REJECTED` dans les écrans ATELIERS/STUDIO. La réussite XP ne suffira pas à rendre toute la CI verte.
- `npm ci`, `npm test`, tests unitaires MATH `xp-decision` (32) et INDEX originaux et build étaient PASS avant l'échec de la recette Chrome. Le succès du workflow historique distinct ne vaut pas qualification de P0-B.

## Cause source-à-source (constat direct, sans inférer un échec M01)

Le fichier d'entrée réellement servi `experiments/dg-lot004/tools/demo-runtime.mjs` de b75, lignes 119–145, construit :

- `const id=campaign.characters[0].id` ; la fiche synthétique `createFakePJBytes` a `sheets[0].id="dg004-fake-pj"`. `previewCharacterImport` ARCHIVES v3 produit `prefix:sheet.id` donc **`pj:dg004-fake-pj`**. Une autre entrée attestée dans la CI précédente était `pj:l004-hero-fiction`.
- `raw={id:"evt-demo-m01-l004",pattern:"exploration-fictive",domain:"exploration",difficulty:3,scope:"ordinaire",approved:false}` ; `initialLevel=5` ; historique `[]`. Le `campaign.id` est créé dynamiquement en navigateur ; le test reproductible utilise un UUID **fictif équivalent**, non une prétendue capture de l'UUID du run.
- MATH `suggestXpFromM01(ledger,raw)` retourne **`status:"suggested"`** (directement observé en CI). Avec l'authentique source M01 `experienceAward(raw,[])`, le candidat est **60 XP** (calcul natif, testé).
- Dans INDEX **ancien** blob `18cfa95cee60258322f0f0e32b8214ec95b509ac`, `safeIdentifier` utilise `ID_PART=/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/` : `:` est refusé ; `createXpSuggestion` ne peut pas dériver `id`, laissant une propriété `id:undefined` ; la validation appelle `clonePrivateJson`, qui rejette strictement `undefined` par `TypeError("Valeur non JSON")`. La réponse générique `JSON privé invalide` **masque** l'erreur de forme/identité. **Ni la courbe M01 ni les 5d6 sont impliqués.**

## Correctif appartenant à INDEX — déjà disponible, PAS copié par MATH

[PR #97](https://github.com/Sijiel44/archives-alrick/pull/97) HEAD `d071842639d0adc952dedf3e279c6a1b7004855c` remplace `src/catalog/index.mjs` par **blob `27ffd1dbb520eed8fff3efd293948c94ea57cf95`**. Il reconnaît littéralement les `instanceId` ARCHIVES `pj:*` bornés, conserve leur graphie, produit un identifiant de suggestion stable `xp:namespace:sha256-<digest>`, une clé d'idempotence v2 et une erreur structurée `INVALID_NATIVE_INSTANCE_ID` si le format sort des bornes. Aucun alias `pj:`→`pj-`, aucune troncature ni crédit n'est justifié. Les tests INDEX R2 sont propriétaires d'INDEX ; le résultat rapporté `114/114` ne remplace **pas** Chrome sur le nouveau HEAD de 05.

## Contrat de raccord exécutable à 05 / 11 INDEX / 02 QA

**Entrée commune pour le clic Chrome** : conserver exactement `campaign.id`, `campaign.characters[0].id`, `event.id`, `pattern`, `domain`, `difficulty:3`, `scope:'ordinaire'`, `approved:false`, contexte `initialLevel:5` et provenance ; aucune conversion de l'identifiant natif. Relever `campaign.id` et `id` dans la recette sur profil neuf sans les mettre dans les messages publics.

1. `createXpDecisionLedger({campaignId,characterId:instanceId,initialLevel:5,initialXp:0,...})` est un état purement local. `suggestXpFromM01(ledger,raw)` -> candidat 60 ; `M01.experienceAward(raw,[])` -> **60**.
2. `INDEX.createXpSuggestion({namespace:'demo',target:{campaignId,characterInstanceId:instanceId},event:{id,pattern,domain,difficulty,scope},context:{initialLevel:5},provenance,rationale})` -> `{ok:true,suggestion:{target:{characterInstanceId:instanceId},...},executable:false}` avec **INDEX R2**. Ne jamais injecter de `approved:true`, montant ni compte PJ inventé dans la suggestion.
3. `INDEX.previewXpSuggestion(suggestion,{experienceAward:M01.experienceAward,history:[]})` -> `{ok:true,candidateXp:60,awardCommitted:false,levelValidated:false,executable:false}`. Vérifier égalité au port MATH et absence de mutation de campagne, journal et fiche.
4. Pour rencontre/quête, INDEX exige un `sourceContext` versionné (type, `accomplishmentId`, `runId`, acteurs PJ/PNJ, `selectedPjIds`, menaces N1–25, assistance, difficulté réalisée et indice explicite M01 optionnel). `INDEX.previewMathEncounterFragment` retourne le fragment **sans** `eventApprovedByMJ` ni `ledgersByPj` : ceux-ci sont ajoutés **uniquement** par le MJ/services MATH autorisés. `MATH.previewEncounterXp({...fragment.mathInputFragment,eventApprovedByMJ,ledgersByPj})` fournit seulement une proposition expérimentale (boss, quête pacifique, groupe hétérogène, PNJ N20 aidant). Ne pas prétendre qu'INDEX transforme automatiquement menace N15 en indice M01 15.
5. `MATH.recordEncounterXpChoice(scene,allocation)` est le seul producteur du journal de décision : PJ sélectionnés, XP commun sans division ou individuels, idempotence boss+quête via `JSON.stringify([campaignId,runId,accomplishmentId])`, corrections MATH append-only ; **`appliedToSheet:false`**, pas de XP PNJ. `INDEX.createXpMathJournalReference` ne prend du reçu MATH que `{status,pjId,decisionId}` (sans `decidedXp`) et renvoie une référence inerte `unverified-external-math-journal`.
6. Une scène déjà récompensée avec même `campaignId/runId/accomplishmentId` ne peut pas être payée une deuxième fois sous le nom « quête ». Deux récompenses réellement distinctes exigent des `accomplishmentId` distincts et une justification MJ ; jamais de déduction `contribution = dégâts`.

## Exécutions et statut réel de ce correctif

**Réalisé localement (Node22/tsc5.8.3, sources M01 et probabilités originales Git blobs exacts)** :

```bash
node --test experiments/dg-lot004/math-xp/tests/xp-decision.test.mjs experiments/dg-lot004/math-xp/tests/encounter-recommendations.test.mjs experiments/dg-lot004/math-xp/tests/repair-math-browser-parity.test.mjs
# 67 PASS / 0 FAIL / 0 SKIP : 63 acquis + 4 tests de réparation ciblés.
```

**Contrat différentiel réel INDEX (à exécuter par 05 sur clone composite ; non exécutable sur PR99 seule)** :

```bash
# Sur checkout exact b75, avec le script MATH transféré, attester la panne :
EXPECT_INDEX=legacy node --test experiments/dg-lot004/math-xp/tests/verify-index-browser-bridge.mjs
# Après copie du blob INDEX propriétaire R2 et des blobs MATH R2 sur branche 05 uniquement :
EXPECT_INDEX=fixed node --test experiments/dg-lot004/math-xp/tests/verify-index-browser-bridge.mjs
# Ensuite recette Chrome du SHA composite :
node experiments/dg-lot004/tools/test-demo-browser.mjs
```

Le second script **importe réellement** INDEX depuis `src/catalog/index.mjs`, MATH depuis `math-xp/src/*.ts`, M01 officiel depuis Quartz. Il refuse l'absence d'INDEX au lieu de simuler un PASS. Le test cross-index n'a **PAS été exécuté ici** : le clone intégré est absent et le réseau GitHub est inaccessible ; tentative locale -> `INDEX_MODULE_ABSENT` avec code de sortie 1. La CI navigateur b75 antérieure atteste la panne dans l'application réelle, mais le correctif R2 INDEX n'est **PAS prouvé intégré** par MATH.

**Risque final :** l'absence de crédit automatique ne doit pas être vérifiée seulement dans les résultats de fonctions ; 05/QA doivent comparer la fiche/sauvegarde avant/après le clic, l'historique par PJ, le modèle de journal et les secrets de projection joueur. La scène créateur reste un autre blocage indépendant, à retourner à son propriétaire.

**Verdict MATH :** diagnostic source M01/INDEX certain, tests ciblés MATH PASS ; pas de correctif MATH de production requis ; raccord INDEX R2 à intégrer et recetter sur le HEAD final exact. Barèmes/coefficients expérimentaux, non homologués.
