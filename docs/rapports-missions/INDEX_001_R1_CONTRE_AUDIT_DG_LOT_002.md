# INDEX-001.R1 — Contre-audit DG-LOT-002 (rapport technique)
**État : VALIDATION PARTIELLE / RÉSERVES / BLOCAGES.** Aucune formule, donnée de production, publication ou canon modifiée.

## Ancrages
- ORG-001 : PR #78, head `82d6b4c1096c7faa12da6b80ff09b82e11b9f259` (non modifiée).
- Code source exact : `main@88f774f3d0d6d520d8d11443b72202b9caf4f94b`; lectures GitHub par `fetch_file(ref=SHA)`.
- Schéma **original inchangé** : `entre-rives.catalog.entry.v0.2-proposal`; cinq fixtures **originales inchangées**, non canoniques.
- Preuves détaillées, matrice de parité, trace de **89 correspondances** et journaux reproductibles livrés séparément sous le nom `INDEX_001_R1_DGLOT002_PREUVES_COMPLETES.zip` à la session DG.

## Sources directement vérifiées au SHA applicatif
| Module | Git blob |
|---|---|
| `quartz/components/scripts/atelier5d6-m02.ts` | `39a91de6c21d42c7bf66b2c575024cd8164fa521` |
| `quartz/components/scripts/atelier5d6-combat-m03.ts` | `09929f1b852a971d73d40474847bae036bf11ffb` |
| `quartz/components/scripts/atelier5d6-grimoire.ts` | `4f6d97ce1a6e57b427be6a0d22651a8ec0db899f` |
| `quartz/components/scripts/atelier5d6-rituals-mag003b.ts` | `40137156b27939ec95ef2ef2e7a250204bf62c8c` |
| `quartz/components/scripts/atelier5d6-bestiary-workshop.ts` | `4dd84b20ee0ff213a0c8f17ad172fafbd5bd9c10` |
| `quartz/components/scripts/atelier5d6.inline.ts` | `c5d233692c41ef14cb7d06fcccba66905a710ba6` |
| `quartz/components/scripts/atelier5d6-rites-mag003c.ts` | `e2d98f8cdfbb3aba0433258ae1e518a73548a7bc` |
| `quartz/components/scripts/atelier5d6-progression.ts` | `d2040829ea0da7c0f6eae08dc8c701226bfc53c5` |
| `quartz/components/scripts/atelier5d6-probabilities.ts` | `bfee984fad47902623f7117e9f024a5b6e042d2d` |

## Comparaison des structures et champs INDEX
| Source | Champs vérifiés / sémantique native | Contrat de passage non destructif |
|---|---|---|
| M02 `AbilityDefinition` | `id,kind,rank,levelRequired,masteryRequired,provenance,effect:text,limitations,approvedByGM,status`; source `alrick.sheets.v3` | Garder ID et achat M02; statut INDEX indépendant; aucun texte chiffré déduit |
| `M03Effect` | `abilityId,kind,magnitude,duration,trigger`; `validateM03AbilityEffect` exige `AbilityDefinition` définie/approuvée et bornes natives | INDEX n'émet jamais `approved:true`; M03 résout avec non-cumul |
| `Spell` | `id,version,source,status,circle,manaCost,upkeepMana,duration,baseImpact,resistance` ; `eligibility/resolveSpellCast` | `INDEX.version` ≠ version Spell; Cercle ≠ niveau; garder source brute |
| `RitualDefinition` | `id,version,practice,roles,components,energy,effects[].durationTicks/numerical`; instance séparée | `applicationPlan.applied=false`, aucun débit multi-PJ par INDEX |
| `BestiaryCard` | `id,schema,ruleset=m03,status,stats,masteries,baseDamage,abilities[]` sans ID de capacité | Liaison explicite card/slot/snapshot, non par titre ou code documentaire |
| `GameItem` / `PreparedMatrix` | item `id,templateId,category,quantity,value,description`; matrice `itemId,spellId,charges,energySource` | Aucun validateur effet chiffré d'objet; `charges` ne signifie ni `usesRemaining` ni `energyStored` |

**Propriétés du contrat :** `id` stable `cap:<namespace>:<slug>`, `version` indépendante, `entryType` immuable, `definitionState` non canonisant, `provenance(sourceSchema,sourceId,sourceVersion,sourceCommit)`, alias scoped, `conditions`, `action`, `cost`, `duration`, effets discriminés `descriptive|numeric`, `restrictions`, `rulesProfileRef`, `documentaryRefs` optionnels, `extensions` conservées hors vue joueur. Définition INDEX ≠ validation mécanique ≠ permission MJ ≠ autorité de publication.

## Cinq fixtures originales : verdicts
1. **Attaque PJ/créature — RÉSERVÉ** : une même entrée INDEX peut décrire des paramètres M03 identiques; recalcul Python synthétique sans cible confirme total 24/dégâts bruts 11 pour N5, naturel 18, brut 6, maîtrise 3, difficulté 21, base 6. La parité TypeScript via deux ateliers n'a **pas** été exécutée.
2. **Sort démo Étincelle — RÉSERVÉ** : source `demo-etincelle`, 4 mana, `baseImpact=3`; Grimoire/M03 font autorité. `normalizeSpell` force `version:1,status:"campagne"` aux sorts personnels importés — source brute à préserver par ARCHIVES.
3. **Rite fictif — RÉSERVÉ** : narration et bonus situation +1 temporaire proposé ; validateur des rites limite les effets ; `applicationPlan` n'applique aucun effet ou débit.
4. **Anneau de stockage narratif — VALIDÉ AU NIVEAU STRUCTUREL** : aucun volume, coût magique, bonus ni charge inventés; pas de traitement mécanique.
5. **Bague fictive à impact +1 — BLOQUÉ** : `GameItem` n'est pas une `AbilityDefinition`; pas de chemin natif d'autorisation d'un effet chiffré d'objet.

## Réserve MATH-001 corroborée dans le code
`M03Effect.kind="absorption"` passe les conditions de `validateM03AbilityEffect` mais **n'est jamais consommé** dans `resolveCombatM03` (les sommes de `precision,defense,impact,penetration` seules interviennent). **BLOQUER `combat.absorption`** jusqu'à décision MATH/COMBAT et non-régression. Constat indépendant MATH-001 **rapporté**, validation finale du référent MATH **non reçue**. Aucune hypothèse de MATH-002 adoptée.

## Essais et empreintes réellement exécutés
- Origine `INDEX_001_DOSSIER_PREPARATOIRE.zip` SHA256 `becff0be89b525b4170068757da3661f7fad847c3c49981dff3da1a38ea96484`.
- Origine `INDEX_001_CONTRE_AUDIT_DOSSIER_COMPLET.zip` SHA256 `97c7e83f06d86a28639387a7a07b2aa68fd0c9a815d67b1d92cf2812bc76c979`.
- Schéma v0.2 SHA256 `fb76e6a8ca200cd82788341fd356e751480a243063780a2aa01a7d95b4c5adb1`.
- Cinq fixtures SHA256 `7396a5eaade764dd048c243ee1765d12ab22a473e88a4ebad15b6c08a1480a89`.
- `python test_index001_contract_proposal.py` → **8/8 PASS**, `python test_index001_v02_proposal.py` → **20/20 PASS**, `python test_index001_r1_synthetique.py` → **36/36 PASS**. **64 tests locaux, synthétiques**, jamais `npm test`, jamais TypeScript natif ou CI GitHub.
- Les 36 PASS incluent détection **positive de deux défauts du schéma** : `magnitude:3` M03 admissible côté JSON, et `cost.mode=not-applicable` combiné avec `amounts`. Ce sont des **lacunes** à corriger dans un contrat futur, non des droits d'application. Premier essai R1 35/36 à cause de trois colonnes/clefs de traçabilité omises dans le CSV R1; corrigé, 89 lignes, 36/36.
- Git clone/ls-remote en conteneur : `Could not resolve host: github.com`; code consulté via GitHub connecté et SHAs de blobs. Aucun checkout exécuté.

## Risques et décisions à DG
- **BLOQUER** effet `absorption`, bague chiffrée et toute construction `AuthorizedM03Effect` depuis INDEX.
- **RÉSERVER** versions/sauvegardes de Spell, IDs de capacités de créature, durée M03, source `charges`, paramètres numériques hors schéma, secrets MJ.
- **VALIDER PARTIELLEMENT** traçabilité et identité/version/absence de canonisation; schéma et fixtures restent prototypes.
- **MATH** doit valider bornes/cumuls/parité. **ARCHIVES** doit qualifier snapshot brut/rollback et import Spell. **QA** doit valider permissions, projection joueur DOM/messages et champs malformés. COMBAT/MAG/OBJETS/ATELIERS/STUDIO/BESTIAIRE suivent.
- **Questions de passation préparées, NON envoyées**. Arbitrages et réponses restent à centraliser par la session DG.

**Non exécuté :** aucune correction de moteur, pas de merge, publication, canonisation, migration destructive, test navigateur/mobile ni PR de production. Cette branche contient uniquement du rapport de contre-audit.