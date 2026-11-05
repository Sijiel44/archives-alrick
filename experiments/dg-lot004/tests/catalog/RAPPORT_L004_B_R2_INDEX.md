# L004-B.R2 — INDEX : correction P0-B et confrontation MATH #99

**Date de la reprise :** 2026-11-05. **Mandat :** DG-LOT-004, spécialité 11 INDEX. **PR propriétaire modifiée :** #97, branche `prototype/dg004-index-xp-links`. **Base inchangée :** PR85 `2ab809ef5351940e0fc272b859d10f21de894d00`. Aucun autre propriétaire/branche, aucune production, formule, publication, merge ou canon modifiés.

## Défaut réel reproduit

Source [#93 commentaire 6658247764](https://github.com/Sijiel44/archives-alrick/issues/93#issuecomment-6658247764), [Chrome CI run 42028928740](https://github.com/Sijiel44/archives-alrick/actions/runs/42028928740). `createXpSuggestion` utilisait le pattern `ID_PART` refusant `pj:l004-hero-fiction`. La dérivation échouait sans message structuré, puis le clone JSON d'une propriété non définie entraînait `JSON privé invalide: Valeur non JSON`. L'identifiant `prefix:sheet.id` provient de `experiments/dg-lot003/src/storage/storage.mjs` (blob `be6a881018ae1709ecef71c3c5a155acfb94a658`). La correction accepte **exactement** cette chaîne, sans alias `pj-l004-...` ; la longueur typée est limitée à 40 caractères par la compatibilité avec MATH #99. Tout ID plus long est refusé de façon explicite et non tronqué.

Le fichier `tools/demo-runtime.mjs` de la PR #95 a aussi été lu : il appelle `createXpSuggestion({namespace:'demo', target:{campaignId:campaign.id, characterInstanceId:id},event:{id:'evt-demo-m01-l004',...},context:{initialLevel:5},...})`, puis compare directement à `suggestXpFromM01`. Un nouveau test reprend ses champs et ses préconditions, sans prétendre exécuter Chrome dans ce conteneur.

## Correction de contrat, stricte et versionnée

1. Conserver **`target.characterInstanceId` natif**, et tous les identifiants source/instance/run sans normalisation. Déduire un ID INDEX **`xp:<namespace>:sha256-<digest-complet>`** de `JSON.stringify([campaignId,instanceId,runId,accomplishmentId|eventId,eventId])` ; SHA-256 standard sans nouvelle dépendance, comparé à `node:crypto` en test. Les IDs d'origine v1 sont encore lus sans migration silencieuse ; le registre vérifie les identités de source complètes et bloque collision/hash/alias explicites.
2. `idempotencyKey` v2 encode le tuple exact `[campaignId,characterInstanceId,runId,accomplishmentId|eventId]` ; la comparaison par contenu, indépendante de la version et du type `encounter/quest`, bloque le même accomplissement boss+quête pour **le même PJ**, et ne confond pas deux campagnes/runs différents.
3. `errors:string[]` est maintenu pour compatibilité. En cas d'erreur, `code` et `issues:[{code,path,message}]` permettent des messages UX explicites, sans échec générique JSON. Refus ciblés pour ID invalide, source/provenance/permissions et contradictions d'indice.
4. `sourceContext` versionné uniquement en tant que **données** : `kind=encounter|quest|accomplishment`, `accomplishmentId`, `runId`, `eventStatus`, `sourceSceneId?`, `participants` PJ/PNJ (niveau 1–25 et contributions narratives), `selectedPjIds` (PJ uniquement), `threats` (N1–25, nombre et boss), `assistance` PNJ attestée, difficultés descriptive avant/après aide, `explicitM01Index?` 1–12. Un indice explicite doit égaler `event.difficulty`; le **niveau ennemi N15** ne vaut jamais automatiquement un indice 15 ou 6.
5. `previewMathEncounterFragment` prépare un **fragment non exécutable** conforme aux champs `previewEncounterXp` MATH #99, en excluant **obligatoirement** `eventApprovedByMJ` et `ledgersByPj`. Le code ne peut pas inventer les approbations ou les journaux. Sans indice M01 explicite, l'ancienne prévisualisation directe retourne `MATH_INDEX_NOT_ATTESTED`, laissant à MATH le modèle expérimental d'étiquette. Avec source enrichie, l'ID M01 canonique est `JSON.stringify([campaignId,runId,accomplishmentId])`, même pour boss/quête : cohérent avec le code MATH #99, notamment les historiques à ID JSON.
6. `createXpMathJournalReference` ne conserve que les identifiants d'un reçu **externe déjà existant** ; `authority:'unverified-external-math-journal'` empêche toute confusion avec une approbation ou un montant acquis. Le **journal append-only et les montants MJ** demeurent chez MATH, propriétaire de `recordEncounterXpChoice`. Aucune fiche n'est mutée, aucune division des XP, aucune source de malus de flûte.

## Sources MATH #99 réellement lues (sans exécution des moteurs TS)

- PR #99 HEAD `e3fcbce49074bfcbe8814842a5ad57d0ba76160d`.
- `experiments/dg-lot004/math-xp/src/encounter-recommendations.ts` blob `58ee80a8345113aff89bfc58a3f276f3c401d7c2`, exports `XP_ENCOUNTER_SCHEMA`, `previewEncounterXp`, `recordEncounterXpChoice`. Il propose **modèle A expérimental** à partir de l'étiquette / indice MJ puis M01 `experienceAward`, et modèle B alternatif non adopté, exclut les PNJ et journalise sans fiche ; N25+ bloqué.
- `experiments/dg-lot004/math-xp/src/xp-decision.ts` blob `76daeb8ec21702e9ebcb27845ccd3d6b709ff574`, journal `cer.math.xp-decision.provisional.v1` et exports `suggestXpFromM01`, `recordXpMjDecision`, `previewXpProgression`.
- Passation MATH [#93 commentaire 6662346332](https://github.com/Sijiel44/archives-alrick/issues/93#issuecomment-6662346332). Les **63 tests MATH** rapportés par MATH ne sont **pas** de nouveaux tests exécutés par INDEX.
- Module M01 `quartz/components/scripts/atelier5d6-progression.ts` Git blob `d2040829ea0da7c0f6eae08dc8c701226bfc53c5` : 5d6 et XP invariants non modifiés.

## Commandes et verdicts directs

```bash
node --version                       # v22.16.0
node --check experiments/dg-lot004/src/catalog/index.mjs
node --test experiments/dg-lot004/tests/catalog/catalog.test.mjs experiments/dg-lot004/tests/catalog/catalog-r2.test.mjs
# 113 PASS, 0 FAIL, 0 SKIP : 64 tests L004 existants non retouchés, 50 régressions R2.
node --test experiments/dg-lot004/tests/catalog/native-m01.test.mjs
# NON EXÉCUTABLE : ERR_MODULE_NOT_FOUND 'esbuild'. Ce n'est PAS un PASS.
git ls-remote https://github.com/Sijiel44/archives-alrick.git HEAD
# Impossible en conteneur : Could not resolve host: github.com
```

**Limites :** Node 24/clone npm complet non disponibles *dans cette session INDEX* ; pas de simulation Python substitutive, pas de nouveaux tests TypeScript MATH, Chrome/CI post-correctif, ni recette de transfert de source/instance entre branches. L'ancien run Chrome en échec est une **preuve de défaut initial**, non une validation du nouveau SHA. La CI sur branche #97 et celle de la branche intégrée devront être associées à leur propre HEAD final. `sourceContext` contient des données MJ (assistances, menaces) et **ne doit pas devenir un DTO joueur**.

## Actions restantes à 05/QA/MATH

- **05 INTÉGRATION** : récupérer les blobs exacts de PR #97 (voir manifest), copier sur sa branche propriétaire, lancer test Node/TS/Chrome sur le **HEAD intégré final**, rerouter les erreurs structurées pour UI, préserver source réelle (aucun alias). Tester clic calculer sans mutation et, séparément, décision MJ MATH avec montant global/individuel, y compris 0 et correction de journal.
- **10 MATH** : confirmer `eventId` canonique, labels expérimentaux, signature/borne 40 char et cas de long ID ARCHIVES ; vérifier l'égalité M01 officielle 1/5/10/15/20/25 sans adopter de barème.
- **02 QA** : tests d'opposition v1/v2, doublon boss+quête, PNJ N20 décisif, sélection PJ/PNJ, run one-shot, source inconnu, round-trip et secrets ; recette Chrome réelle sur les ports loopback.
- **DG** : décider barèmes et mode de décision, sans aucune validation normative implicite.

**Statut** : prêt pour intégration contrôlée. Au stade de ce rapport, aucune passation inter-chat n'est considérée lue par 05 ou par la DG ; seules PR et fichiers constituent les artefacts partageables.
