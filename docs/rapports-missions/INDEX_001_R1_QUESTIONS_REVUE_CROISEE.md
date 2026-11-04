# INDEX-001.R1 — Passations préparées pour revue croisée (NON ENVOYÉES)

**Base :** `88f774f3d0d6d520d8d11443b72202b9caf4f94b`, contrat `entre-rives.catalog.entry.v0.2-proposal`, cinq fixtures originales inchangées. DG centralise les réponses, sans attribuer une validation à un référent non consulté.

## MATH — validation chiffrée
1. Confirmez-vous que toutes les valeurs calculées passent exclusivement par M01/M03 et résolveurs natifs, jamais par INDEX ?
2. `absorption` apparaît dans les types et le validateur M03 mais pas dans `resolveCombatM03`. Doit-on garder cette famille **BLOQUÉE** jusqu'à correction/test ?
3. Quelle politique de non-cumul entre bonus issus de capacités, sorts, rites et objets ? Quelle durée/horloge fait autorité pour un `M03Effect` ?
4. À inputs strictement identiques y compris defender, mode et feasibility, le résultat M03 doit-il être identique PJ/créature, sans imposer à la créature le budget M02 ?

## ARCHIVES — schémas, versions et sauvegardes
5. Quelle archive brute permet de restituer `Spell.version` et `Spell.status` lorsque `normalizeSpell` force `version:1` et `status:"campagne"` ?
6. Confirmez-vous identité `(id,version)` INDEX distincte de `sourceVersion`, SHA moteur, ID documentaire et snapshot campagne, et quarantaines pour alias collisionnés ?
7. Quel test d'import/export réel assure préservation des champs inconnus, des secrets MJ hors projection joueur, et restitution de version ancienne ?
8. Confirmez-vous absence de conversion automatique `PreparedMatrix.charges` en `energyStored` ou `usesRemaining` ?

## QA — autorisations et confidentialité
9. Quel test prouve qu'un JSON de catalogue, même `definitionState=validated`, ne peut jamais construire `approved:true` en M03 ni débiter mana/charges ?
10. Quelles assertions DOM, messages inter-fenêtres, exports et imports prouvent absence de `gmNotes`, `legacyOriginal` et extensions privées de la vue joueur (pas de CSS-masking) ?
11. Faut-il refuser au niveau adaptateur les entrées acceptées à tort par le schéma v0.2 (magnitude M03=3 ; cost non-applicable avec amounts) ?
12. Quelles preuves d'autorisation et idempotence sont requises pour éventuellement débloquer une bague chiffrée, en lien avec OBJETS/COMBAT/MAG ?

## Autres interlocuteurs
- **COMBAT :** borne, trigger, durée, non-cumul, `absorption` et validation réelle de `AbilityDefinition`.
- **MAG :** `eligibility`, sort connu/Cercle, consommation mana/charge, rite non appliqué.
- **OBJETS :** définir validateur natif GameItem→intent de combat sans injection directe de `AuthorizedM03Effect`.
- **BESTIAIRE :** liaison stable d'abilities[] (sans ID natif) et distinction profil de jeu/code documentaire.
- **ATELIERS :** même définition visible dans PJ, Bestiaire et Objets avec états non-autorisé/indisponible lisibles.
- **STUDIO :** snapshot campagne/version/rulesProfile figés et projection joueur exclusivement whitelist.

**Documents de support :** [rapport INDEX-001.R1](./INDEX_001_R1_CONTRE_AUDIT_DG_LOT_002.md), [fiche Direction](./FICHE_DIRECTION_INDEX_001_R1.md) et archive locale originale+tests fournie à DG.

**Statut : questions rédigées, non envoyées, aucune réponse ni validation inter-référents reçue.**