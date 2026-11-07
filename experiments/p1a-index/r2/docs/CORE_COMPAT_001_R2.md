# CORE-COMPAT-001.R2 — adaptateur candidat → fonctions 5d6 natives

**Périmètre :** aucune réécriture de l'inventaire CORE-COMPAT-001 d'origine #105. R2 implémente uniquement la **liaison candidate**, pas une nouvelle formule. La validation d'un objet JSON, même enrichi d'un `nativeRef` et d'un SHA Git, n'autorise jamais un effet dans le moteur.

## Chemins importables

`previewCandidateViaNative(record,{progressionAtLevel,previewM03})` :
- Exige `validateR2Record(record)`, `nodeType='instance'`, `mechanics.status='native-reference'`, provenance de la règle via `mechanics.nativeRef.sourceBlob` **Git SHA1** et une fonction native injectée.
- **PJ 1–25 :** appelle `progressionAtLevel(record.data.level)` de M01 (sans formule de secours). Le retour est `executable:false`, `applied:false`. L'absence du port donne `NATIVE_M01_UNAVAILABLE`. Les niveaux 26+ restent refusés par le validateur.
- **Créature :** prépare uniquement la référence au profil pour un port `previewM03` fourni par COMBAT, avec `readOnly:true`. N'envoie aucun `AuthorizedM03Effect`, ne calcule pas d'attaque, interdit la famille `absorption` et les objets chiffrés. Absence du port => `NATIVE_M03_UNAVAILABLE`.
- **PNJ narratif / objets / sort / rites / capacités :** indisponible, aucune conversion de texte ni coût/XP.

### Tests exécutés ici

- M01/M03 **délégués via ports sentinelles injectés**, vérification des arguments, résultat copié et source immuable (les sentinelles ne sont **PAS** le moteur officiel).
- Garde-fous : port absent, exceptions natives, N26, aucune mécanique pour capacité descriptive, absorption bloquée, données JSON invalides ; refus par `code/path` structurés.
- `node --test ...` 58 tests R1 + 54 tests R2 = 108 PASS ; **aucune prétention de preuve chiffrée M01 réelle**.

### Tests préparés, non exécutés dans ce conteneur

`node --test r2/tests/native-core-on-assembled-clone.test.mjs` : compile le **vrai** M01/probabilités via `esbuild` installé dans un clone complet et teste 5d6=7776, naturels 5–7, niveaux 1/5/10/15/20/25, N26, PJ N1/N10/N25 et non-mutation. Test annoncé NON EXÉCUTÉ ici (absence de checkout GitHub complet / `esbuild`). Pour `M03` il faut encore valider avec 10 MATH/COMBAT le port exact `previewM03`, les bornes et les familles. Les règles de combat et d'XP ne sont jamais copiées.

Sources (sources de vérité, SHA Git inchangés) : M01 `quartz/components/scripts/atelier5d6-progression.ts` blob `d2040829ea0da7c0f6eae08dc8c701226bfc53c5`, probabilité `bfee984fad47902623f7117e9f024a5b6e042d2d`, M03 `09929f1b852a971d73d40474847bae036bf11ffb`, MATH XP #99 `experiments/dg-lot004/math-xp/src/encounter-recommendations.ts` blob `58ee80a8345113aff89bfc58a3f276f3c401d7c2`, INDEX L004 #97 `27ffd1dbb520eed8fff3efd293948c94ea57cf95`.

**À 10 MATH** : confirmer quels champs de `CandidateRecord` sont autorisés à passer au port réel ; fournir et tester au SHA intégré les fonctions natives, leurs validations, et confirmer que le statut `reported-validated` du schéma INDEX ne confère aucune permission technique. Aucun nouveau barème XP ni formule MATH-002 adoptés.
