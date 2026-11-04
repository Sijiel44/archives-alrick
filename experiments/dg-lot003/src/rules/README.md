# L003-RULES — Port mathématique officiel, pur (provisoire)

**Branche propriétaire :** `prototype/dg003-rules-math` ; **base figée :** `88f774f3d0d6d520d8d11443b72202b9caf4f94b`.
**Fichier importable :** `experiments/dg-lot003/src/rules/native-preview.ts`.

## Exports

- `previewNativeRules(request: unknown): RulesPreview` — point d'entrée UI synchrone, sans effets de bord.
- `previewNativeProgressionLevel(level: number)` — délégation directe de `progressionAtLevel` M01, niveaux 1 à 25.
- `RULES_PREVIEW_VERSION` — `cer.rules.dg003.provisional.v0`, interface locale NON canonique.
- Types : `RulesActor`, `RulesEffectCandidate`, `RulesProgressionRequest`, `RulesCombatRequest`, `RulesPreviewRequest`, `RulesPreview`.

## Entrées et résultats

1. **Progression :** `{kind:"progression", actor:"pj"|"creature", action:Action}` ; `Action` est l'entrée **native M01**.
2. **Combat :** `{kind:"combat",actor:"pj"|"creature",combat:Omit<CombatM03Input,"effects">,effects?:RulesEffectCandidate[]}` ; `combat` est l'entrée **native M03** sans champ `effects`. `actor` ne modifie aucune formule.
3. **Capacité :** chaque `RulesEffectCandidate` est `{source:"m02-ability",ability:AbilityDefinition,proposal:M03Effect}`. La passerelle appelle **obligatoirement** `validateM03AbilityEffect` sur la définition et sa proposition. Un objet `approved:true` injecté est refusé.
4. **Sortie acceptée :** `{status:"ok", version, engine:"M01"|"M03", actor, appliedEffects, result, applied:false}`. `result` est **exactement** le résultat natif du moteur officiel, sans modification arithmétique.
5. **Refus :** `{status:"unavailable"|"rejected",version,code,reason,applied:false}` ; le consommateur doit afficher le motif et désactiver l'application.

Les effets natifs admis au titre du contrat existant : `precision`, `defense`, `impact`, `penetration`, uniquement s'ils sont approuvés via le validateur M03. Magnitude 1–2 et durée 1–3 ; le non-cumul par catégorie/déclencheur est **calculé exclusivement par M03** (le maximum de chaque catégorie est utilisé).

**Toujours refusés :** effet `absorption` (diagnostic MATH-001.R1, sémantique non homologuée), objets à effet numérique, MATH-002/Autorités 25+, dépenses mana/charges, propositions sans autorisation native. Les capacités purement narratives n'acquièrent aucun effet par interprétation du texte.

**Contrat d'intégration important :** le champ `approvedByGM` est la donnée d'approbation locale attendue par M03, pas une signature cryptographique. Le Studio est responsable de l'identité et du propriétaire des effets, des permissions MJ et de la non-divulgation de secrets. Les événements/durées ne sont ni activés ni décrémentés par cette passerelle. Aucun calcul de règle n'est fait par INDEX/port/UI.

## Exemple d'injection UI, sans débit

```ts
import {previewNativeRules} from "./src/rules/native-preview"
const response=previewNativeRules({
  kind:"combat",actor:"pj",
  combat:{natural:24,rawStat:16,masteryRank:4,situation:0,level:10,
    difficulty:21,kind:"physique",mode:"melee",feasible:true,baseDamage:6}
})
if(response.status==="ok") {
  // Affichage seulement : response.result et response.applied === false.
} else {
  // Présenter response.reason, sans modifier PV ni ressources.
}
```

## Test autonome

Depuis la racine du dépôt avec ses dépendances préexistantes :

```sh
node --test experiments/dg-lot003/tests/rules/native-preview.test.mjs
```

Le test charge le vrai TypeScript via `esbuild` déjà installé ; à défaut, il exige `tsc` déjà disponible et compile en répertoire temporaire système. Il compare appels via port et appels directs sur les sources `quartz/components/scripts` du checkout. Aucune dépendance n'est ajoutée, aucune formule ni fichier Quartz modifié. Le statut « testé » vaut uniquement pour le SHA effectivement utilisé par l'exécution.
