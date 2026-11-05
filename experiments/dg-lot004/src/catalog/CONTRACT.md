# L004-B/C — Contrat d'échange provisoire INDEX (pour 10 MATH / 21 ATELIERS / 20 STUDIO / 05 INTÉGRATION)

**État : INTERFACE PROVISOIRE, NON CANONIQUE.** Base intégrée PR85 `2ab809ef5351940e0fc272b859d10f21de894d00` ; aucun changement M01/M02/M03, aucune adoption du niveau/XP et aucune mutation de scène.

## Sous-arbre et module
`experiments/dg-lot004/src/catalog/index.mjs` (ESM sans dépendance), tests `experiments/dg-lot004/tests/catalog/catalog.test.mjs`. Réemploie le validateur descriptif L003 via un import relatif, sans le modifier.

### L004-B — XP : trois actes séparés
1. **Suggestion** `createXpSuggestion(input) => {ok,errors,suggestion?,executable:false}` : donnée descriptive versionnée, `id` stable `xp:<namespace>:<slug>`, `version` SemVer, `revision` entier, `status=proposed|withdrawn`, `target:{campaignId,characterInstanceId}`, `event:{id,pattern,domain,difficulty:1..12,scope}`, `context:{initialLevel:1..25,oneShot?:{id,runId}}`, `provenance`, `rationale`, `idempotencyKey`, `correctionOf?`. Aucun champ d'XP accordé ni approbation, aucun level-up.
2. **Prévisualisation** `previewXpSuggestion(suggestion,{experienceAward,history})` : si le délégataire M01 manque, retourne `unavailable`; sinon, n'utilise que la fonction `experienceAward` injectée par 10 MATH, avec `approved:false`. Montant **candidat** non attribué, sans promesse d'équivalence à une récompense MJ. Pour `scope` majeur/légendaire, la prévisualisation est **bloquée** tant que le référent MATH n'a pas fourni le chemin de validation native ; INDEX ne forge jamais `approved:true`. Aucune formule recopiée.
3. **Attribution libre MJ et validation du niveau** : exclusivement M02/M01 ou ports natifs séparés ; INDEX ne fournit pas de fonction d'attribution, ne calcule pas un niveau ni ne débite/augmente une ressource. `previewLevelMatrix(levels,{progressionAtLevel})` passe les six niveaux de référence (1/5/10/15/20/25) au port M01 injecté et renvoie des résultats **sans application**.
4. **Corrections** `correctXpSuggestion(prior,changes)` : nouvelle révision immuable du même ID et même idempotencyKey, Version SemVer supérieure et `correctionOf` vers la révision précédente ; ancienne source intacte. `validateXpRegistry` vérifie collisions `id/version` et `idempotencyKey` entre différentes suggestions / runs one-shot.

### L004-C — Chaîne descriptive, identité stable
- `createDescriptiveChain({id,version,provenance,links:[...],privateSnapshot?})` : **4 maillons exactement** `item → capability → creature → scene`; chaque maillon `{kind,source:{id,version,schema,...},instance?:{id,campaignId},status:'draft'|'proposed'|'archived'}`. Les liens ne sont ni des équipements attribués, ni des effets appliqués ni une scène publiée.
- `validateDescriptiveChain` : noms/versions/provenances, unicité `(kind,source.id,source.version)`, distinction obligatoire des identités source/instance, rejet des champs d'autorisation (`approved:true,autoApply:true,applied:true`), `rulesEffect` numérique, `absorption` et bague chiffrée.
- `createPrivateChainSnapshot(chain,rawSources)` : copie profonde sûre de chaque source brute avec inconnus, versions, statut et origine intactes ; stockage **MJ privé seulement**, jamais un DTO joueur.
- `previewDescriptiveChain` : résumé **MJ uniquement** avec `executable:false,requiresGMReview:true`, aucun malus numérique tiré d'une flûte narrative. Données fictives uniquement.

### Consommateurs
- **10 MATH** : injecter **directement** `experienceAward` et `progressionAtLevel` M01, vérifier les six seuils; l'option `experienceAward` n'est **jamais** une délégation de `grantAward`.
- **21 ATELIERS** : prendre les retours `{ok,errors,...}`, afficher suggestion sans bouton « accorder XP », créateur de liens descriptifs ; conserver `id/version/source/instance` et snapshot privé.
- **20 STUDIO** : rattacher le `scene` à une copie d'instance existante et à sa campagne par ports ; ne publier aucun snapshot INDEX ni notes MJ dans l'origine joueur.
- **05 INTÉGRATION** : copier uniquement le sous-arbre INDEX de cette branche, enregistrer branche/commit/blob SHA, relancer tests natifs après assemblage.
- **04 ARCHIVES / 02 QA** : contrôler round-trip, collisions, extensions inconnues, fail-closed et privilèges.

**L004 :** aucun `approved:true` forgé ; aucune conversion de texte narratif en règle ; flûte uniquement descriptive ; suggestions XP ≠ attribution MJ ≠ validation niveau. Ce document est une passation prête à centraliser par DG, pas une preuve de lecture par les autres chats.
