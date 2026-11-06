# CORE-COMPAT-001 — Inventaire d'actifs réutilisables et ports P1 (sans second moteur)

**Base code lue :** `main@88f774f3d0d6d520d8d11443b72202b9caf4f94b` ; **base Studio expérimentale** : PR85 `2ab809ef5351940e0fc272b859d10f21de894d00` ; **INDEX** : PR97 `d071842639d0adc952dedf3e279c6a1b7004855c` ; **MATH encounter** : PR99 `e3fcbce49074bfcbe8814842a5ad57d0ba76160d` (ancrage étudié, HEAD PR actuel susceptible de différer). Le manifeste `CORE_SOURCE_SHA.json` associe les blobs exacts au fichier.

| Module existant | Actif à reprendre / contrat | Dépendance au moteur, UI ou stockage | Port recommandé | Test d'invariant / limite |
|---|---|---|---|---|
| `atelier5d6-probabilities.ts` M01-probas | Distribution exacte 5d6 `TOTAL_OUTCOMES=7776`, naturels 5–7 échecs | Pur TS, pas de DOM | `probabilityNative` lecture seule | Vrai TS via esbuild **non exécuté ici** ; ne pas recoder un générateur |
| `atelier5d6-progression.ts` M01 | `progressionAtLevel`, `experienceRequired`, `experienceAward`, `canReachLevel` | TS importe probabilités | `previewNativeLevel(level)` ; port XP natif séparé | niveaux 1/5/10/15/20/25, N26 rejeté ; calculs officiels seulement |
| `atelier5d6-m02.ts` M02 | `AbilityDefinition`, `M02Sheet`, `grantAward`, transactions | M01, historique `alrick.sheets.v3` | lecture/draft, **ne jamais appeler** `grantAward` en preview | budget et capacités approuvées sous domaine MATH ; ne pas appliquer une suggestion XP |
| `atelier5d6-combat-m03.ts` M03 | `resolveCombatM03`, `M03Effect`, `validateM03AbilityEffect` | M01, DefenseProfile, approbations natales | `previewM03` COMBAT injection only | pas de `AuthorizedM03Effect` forgé ; absorption numérique non homologuée (réserve antérieure) |
| `atelier5d6-bestiary-workshop.ts` M04/Bestiaire | `BestiaryCard`, `createBestiaryCard`, `validateBestiaryCard` | générateur M03, opposition & M01 | `readProfile`/`makeInstance` du port BESTIAIRE DG003 | variante/instance distincte, pas d'espèce issue du profil |
| `atelier5d6-m05-sheet-view.ts` M05 | référence documentaire opt-in (lecture) | liaison documentaire distincte ; navigation limitée | `documentReader` | code documentaire ≠ ID mécanisme ; aucune canonisation |
| `atelier5d6-grimoire.ts` | `Spell`, `Grimoire`, `eligibility`, `normalizeGrimoire` | mana, oppositions ; enveloppe versionnée | `grimoire-readonly` | préserver RAW avant normaliseur : `normalizeSpell` peut imposer version 1 / statut campagne |
| `atelier5d6-rituals-mag003b.ts` | `RitualDefinition`, `RitualInstance`, journal et preview | M01/M03 et mana ; états du rite | `ritualReadonly`, validateur propriétaire MAG | prévisualisation ≠ applicationPlan ; aucune dépense automatiquement déclenchée |
| INDEX PR97 | `createXpSuggestion`, `validateXpRegistry`, chaînes descriptives | ESM importe catalogue L003, pas de formule | `catalogResolver` / `xpSuggestion` en lecture | accepte `pj:l004-hero-fiction` brut, conserve source, instance, version, run |
| MATH PR99 | `previewEncounterXp`, `recordEncounterXpChoice`, ledger | M01 natif, application de choix MJ distincte de fiche | `mathXpPreview`, `mathXpJournal` **distincts** | boss + quête doublons, PJ/PNJ, pas d'attribution à la fiche |
| DG003 ports `types.ts`, `ports.ts` | source/profil/instance, résultat `ready/invalid/unavailable/blocked` | délégation injectée ; pas de formule | ports versionnés par domaine | conserver champ inconnu sur source brute, pas dans DTO joueur |
| DG003 ARCHIVES `storage.mjs` | preview import/restauration, `exportPrivate`, hash de source | Uint8Array, WebCrypto, stockage local | `privateStoragePreview` et `commitRestore` séparés | identité originale octet+SHA ; P1 JSON labo ne la remplace pas |
| DG003 STUDIO `projection.mjs` | projection joueur whitelist et origines 4173/4174 | navigateur et choix MJ | `playerProjection` **par STUDIO** | aucun secret/extension MJ en message, DOM ou sauvegarde joueur |
| ATELIERS DG004 | cycle objet-capacité-créature-scène | créateur descriptif DOM et STUDIO local | `creatorDraft` → `catalogRef` explicite | scène ne modifie pas variante/source historique ; pas de malus de flûte |

## Contrat minimal testable maintenant

Modules P1 proposés : `src/core-ports.mjs` exporte `previewNativeLevel(level,{progressionAtLevel})`, `previewLevelReferenceMatrix({progressionAtLevel})`, `inspectNativeXpSuggestion(request,{suggestXpFromM01})`, `previewNativeCombat(request,{previewM03})`. **Tout nombre vient du port natif injecté ou d'un mock identifié comme tel par les tests** ; si port absent ou invalide, réponse structurée `ok:false`, jamais une formule de secours. Pas de décision MJ, aucune mise à jour de XP, mana, PV ou niveau.

`tests/core-compat.test.mjs` prouve **uniquement la qualité des frontières et des données** sur Node22 avec ports fictifs. `tests/native-core-on-clone.test.mjs` est un test préparé, **non exécuté ici**, qui charge `atelier5d6-progression.ts` et probabilités par l'esbuild du dépôt complet ; ce test, ainsi que la CI intégrée, doit être exécuté par 01 BUILDER/10 MATH/05 INTÉGRATION avant de qualifier les invariants sur le code natif.

### Matrice M01 : résultats attendus de la fonction officielle `experienceRequired(level)`

| Niveau | XP cumulée d'après M01 | Donnée structurale P1 |
|---:|---:|---|
| 1 | 0 | N1 accepté, pas d'achat automatique |
| 5 | 400 | port natif lecture seule |
| 10 | 2025 | PJ fictif N10, données de départ non calculées |
| 15 | 4900 | variante fictive N15 ≠ personnage complet |
| 20 | 9025 | palier exceptionnel N21+ non automatiquement déverrouillé |
| 25 | 14400 | PJ fictif N25 ≠ promotion automatique, Autorité ou rite |

Ces valeurs sont déduites **de la fonction du moteur M01 lue dans le code**, mais n'ont **pas** été obtenues par une exécution TypeScript native dans ce conteneur. Les tests natifs préparés confrontent ces rapports à la source authentique ; ne pas confondre prévision documentaire et CI verte.

## Couplages à supprimer dans une reconstruction partielle éventuelle

1. Ne pas transporter les objets métier en clonant les DOM de Quartz/Atelier ; définir de petits ports d'API pur/typé avant UI.
2. Séparer l'identité documentaire (`code`, édition, spoilers), l'ID natif de fiche, l'ID de catalogue INDEX, l'instance de campagne et la version de snapshot. Les chaînes peuvent être n:n sans fabriquer des sources.
3. Ne jamais passer directement le JSON privé à la fenêtre joueur ; construire la projection par sélection, avec un contrat de protocole d'origine et de désactivation contrôlée.
4. Ne pas remplacer la sérialisation ARCHIVES par `JSON.stringify` d'un objet public ; mémoriser les octets d'import historiques et prouver intégrité/restauration.
5. Ne pas lier les coefficients expérimentaux d'XP MATH à une règle officielle, une mise à jour de fiche ou un bouton « attribuer » sans autorisation ultérieure.

**Dépendances bloquantes :** accord 10 MATH sur ports et statut des effets, 01 BUILDER sur architecture de séparation UI/stockage, 04 ARCHIVES sur format de sauvegarde, 02 QA sur contrats de sécurité et parcours navigateur. Aucun changement sur les branches historiques ni sur la PR #95.
