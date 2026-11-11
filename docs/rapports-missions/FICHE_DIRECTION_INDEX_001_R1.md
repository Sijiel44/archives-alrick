# FICHE_DIRECTION_INDEX_001_R1 — DG-LOT-002

**Périmètre :** contrat versionné de références INDEX ; pas d'exécution de règles ni de canonisation. **Organisation :** PR #78 @ `82d6b4c1096c7faa12da6b80ff09b82e11b9f259`. **Application :** `main@88f774f3d0d6d520d8d11443b72202b9caf4f94b`.

## Verdict
- **VALIDÉ (structurel, sous réserve d'intégration)** : inventaire de six familles (`AbilityDefinition`, `M03Effect`, `Spell`, `RitualDefinition`, `BestiaryCard`, `GameItem`), 89 correspondances champ/source/ligne, conservation exacte du schéma v0.2 et des cinq fixtures.
- **Essais réellement exécutés** : 8/8 préparatoires, 20/20 v0.2, 36/36 R1 en Python synthétique. Deux tests R1 PASS détectent des **lacunes** du schéma v0.2 ; ils ne les homologuent pas. Aucune CI/TypeScript de moteur/recette navigateur effectuée.
- **RÉSERVÉ** : parité PJ/créature seulement sur banc Python indépendant sans cible (total 24/dégâts bruts 11 dans un cas N5 identique), signatures MATH/ARCHIVES/QA non reçues, sauvegardes et versions Spell, sécurité DOM/messages.
- **BLOQUÉ** : `M03Effect.absorption` validé mais non consommé dans la résolution ; bague chiffrée sans validateur natif d'objet. Aucun `approved:true` forgé et aucun effet numérique appliqué.
- **NON EXÉCUTÉ** : `npm test`, CI GitHub INDEX, tests TypeScript/navigateur, migrations, playtests, merge, publication ou canonisation.

## Décisions à DG
1. Homologuer **uniquement la traçabilité structurelle** et les scénarios comme base de revue ; garder le schéma v0.2 en laboratoire.
2. Maintenir le blocage `absorption` M03 et l'effet chiffré d'objet jusqu'à résolveur/validateur natif et tests d'autorisation.
3. Obtenir **MATH** : bornes, non-cumul, familles, égalité d'inputs M03, sans adoption des hypothèses MATH-002.
4. Obtenir **ARCHIVES** : snapshot brut, restitution de version/statut Spell (normalizeSpell force version 1 / status campagne), alias scopes, charges non converties.
5. Obtenir **QA** : test de fail-closed, coût/magnitude invalides, confidentialité réelle des données MJ (DOM/messages/export) et idempotence.
6. Suivre par COMBAT, MAG, OBJETS, ATELIERS, STUDIO et BESTIAIRE avant prototype intégré.

**Preuves :** [rapport technique compagnon](./INDEX_001_R1_CONTRE_AUDIT_DG_LOT_002.md) ; archive locale `INDEX_001_R1_DGLOT002_PREUVES_COMPLETES.zip` (rapport détaillé, CSV 89 lignes, matrices, questions, scripts, journaux, quatre originaux SHA256). L'archive est remise à la session DG, **non importée dans GitHub**. Les passations sont **préparées et non envoyées**.

**À revoir par :** MATH, ARCHIVES, QA, COMBAT, MAG, OBJETS, ATELIERS, STUDIO et BESTIAIRE. **À valider par DG/créateur :** validation partielle et ordre des arbitrages.