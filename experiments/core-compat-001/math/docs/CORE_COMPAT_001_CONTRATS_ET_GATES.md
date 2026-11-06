# CORE-COMPAT-001 — Contrats minimaux de reprise / contrôles QA

**Statut :** exigences d'adaptateur pour BUILDER/INDEX, **non** une nouvelle bibliothèque de règles. Conserver tous les exports officiels et leurs paramètres/versions.

## A. Interfaces existantes à importer (référence, non réécriture)

| Port logique | Export officiel consommé | Entrée native | Sortie / garantie |
|---|---|---|---|
| Dice | `rollFiveDice(rng)`, `sumOccurrences(sum)` | RNG injectable `()=>number` | Toujours 5d6 et distribution officielle 7 776 issues. |
| Progression | `resolveProgressionAction(Action)` | `{natural,rawStat,masteryRank,situation,threshold,feasible}` | Résultat M01 (échec forcé/critique potentiel), sans écriture. |
| XP / seuil | `experienceAward(event,history)`, `experienceRequired(level)`, `canReachLevel(level,xp,milestones)` | N1–25, indice d'accomplissement 1–12, historique explicite | Suggestion et éligibilité **distinctes** de la promotion. |
| Combat | `resolveCombatM03(CombatM03Input)` | Combat M03 natif, `defender` explicite | Résultat complet; pas de mutation de PV. |
| Effet | `validateM03AbilityEffect(ability,proposal)` | M02 défini/MJ approuvé, magnitude 1–2, durée 1–3 | Objet d'effet approuvé; `absorption` **bloqué** par adaptateur. |
| Profil | `evaluateSheet`, `validateBestiaryCard`, `toDefense` | Schéma et version natifs distincts, identité source/instance séparée | Données référencées sans conversion massive. |
| Ressource | `applyManaOperation(state,op)`, `manaOperationFingerprint` | Opération et journal explicites | Nouvel état/reçu idempotent ; commit **jamais** depuis preview. |
| Rite | `previewRitual`, `transitionRitual` | Rite et action natives | Résultat/transition locale; pas de transaction multi-PJ. |
| Sort | `eligibility`, `resolveSpellCast` | Grimoire, Spell, MagicSheet, 5d6 et cible | Résultat sans ressource débitée par la preview ; durées / charges dans port distinct. |
| XP MJ | `suggestXpFromM01`, `previewEncounterXp`, `recordEncounterXpChoice` | Journaux et participants PJ explicites | `appliedToSheet:false`, suggestion et décisions tracées séparément. |
| INDEX | `createXpSuggestion`, `previewMathEncounterFragment`, `validateXpRegistry` | Identity/version/provenance, `pj:` natif | Non exécutant, `missingExternalFields` à fournir par le MJ/Studio. |

## B. Contrat de façade proposé — non implémenté ici

Le conteneur UI choisit un `ruleset`, instancie un **adaptateur**, puis appelle **uniquement** l'export natif. Les structures suivantes servent d'accord de responsabilité, pas de règle nouvelle :

```ts
// Ce sont des signatures de frontière, PAS un nouveau moteur implémenté.
type SourceRef = {sourceId:string; sourceSchema:string; sourceVersion:string; sourceSha?:string}
type InstanceRef = {campaignId:string;instanceId:string;source:SourceRef}
type PreviewEnvelope<T> = {
  schema:string; engine:'M01'|'M03'|'MAG'|'RITUAL'|'MANUAL';
  provenance:SourceRef; appliedToSheet:false;
  status:'preview'|'rejected'|'unavailable'; result?:T; reasons?:string[]
}
// Aucune instanceRef ne peut être produite en transformant silencieusement 'pj:...'.
// Les opérations de commit sont des interfaces distinctes, non fournies par le calcul.
```

Un `PreviewEnvelope` n'est pas une sortie ajoutée aux fonctions M01/M03 ; c'est une enveloppe de transport éventuelle, construite **sans recalculer** le contenu `result`. Le traitement de la donnée source et du DTO joueur relève d'INDEX/ARCHIVES/STUDIO.

## C. Recette minimale obligatoire sur le nouveau socle

| Gate | Test | Statut de cette mission |
|---|---|---|
| G01 | Trois blobs numériques officiels vérifiés SHA, 5d6 7776/21 | **Exécuté, PASS** |
| G02 | N1/5/10/15/20/25, XP M01, budgets, bruts >12 | **Exécuté, PASS** |
| G03 | M03, défense ≠ protection, effets non cumulés, échec naturel | **Exécuté, PASS** |
| G04 | `absorption` accepté par validateur mais bloqué au port | Écart natif confirmé; **port L003 rapporté**, pas re-test de ce port ici |
| G05 | Même objet `CombatM03Input` produit résultat identique pour PJ/créature via **leurs vrais adaptateurs** | **NON EXÉCUTÉ** : port/adaptateurs composites requis |
| G06 | M02/Grimoire/Rites/Mana réutilisables avec données exportées puis réimportées et IDs identiques | **NON EXÉCUTÉ** ; revue statique seulement |
| G07 | `GameItem` descriptif : aucun effet numérique par interprétation | **Contrat proposé**, QA nécessaire |
| G08 | Suggestion MATH/M01 et décision commune/individuelle, PNJ exclus, historique/corrections | **Exécuté, 67/67 PASS**, module isolé |
| G09 | INDEX R2 accepte vrai `pj:...`, même event/run, parité `experienceAward` | **NON EXÉCUTÉ ici**, script composite livré sous #99 ; INDEX rapporte 114 tests locaux |
| G10 | Clic « Calculer » navigateur : zéro mutation de fiche/stockage/joueur | **NON EXÉCUTÉ** ; #95 b75 Chrome échoue |
| G11 | Export/import legacy et PV>999 sans perte de source | **NON EXÉCUTÉ**, test de round-trip à concevoir sur ARCHIVES |
| G12 | Secrets MJ absents de toute projection/DTO joueur | **NON EXÉCUTÉ**, gate indispensable avant diffusion |

L'intégration se termine seulement lorsque **05 INTÉGRATION** fournit son SHA exact, logs Node/Chrome et manifest Git des blobs et **02 QA** sa recette indépendante. Ne jamais déduire un succès de ces gates à partir d'une CI documentaire.

## D. Dépendances et responsables

- **01 BUILDER** : frontière `core` / `profile adapters` / `store adapter` / `UI`; aucune formule copiée ; choix du nouveau bundler non décidé dans ce mandat.
- **11 INDEX** : schémas/IDs/provenance/versions ; `pj:` natif non transformé, contrôle source/run/accomplissement et liste blanche ; blocage objets numériques et absorption.
- **05 INTÉGRATION** : seule autorité sur la branche composite ; copier les blobs propriétaires vérifiés, exécuter gates G05,G09,G10 et documenter le résultat réel.
- **02 QA** : parité adaptateurs réels, sécurité stockage et DTO joueur, scénarios adversariaux, export/import.
- **00 DG** : décider la fondation cible, les réserves acceptables et la tranche ultérieure des corrections sans toucher au canon.

**Aucune migration générale des fiches historiques requise pour démarrer le nouveau socle.** Les formats anciens restent des sources/archives. MATH-002 et la sémantique de l'absorption M03 ne sont pas adoptées.
