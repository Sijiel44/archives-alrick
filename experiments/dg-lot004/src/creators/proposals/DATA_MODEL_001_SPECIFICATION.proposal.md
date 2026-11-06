# DATA-MODEL-001 — Fiches nouvelles et adaptateurs non destructifs
**21 ATELIERS → 11 INDEX + 04 ARCHIVES + 00 DG · 6 novembre 2026 · P1 / PROPOSITION NON VALIDÉE**

## 0. Périmètre, règles de preuve et données de référence
Le présent dossier ne migre aucune fiche, ne modifie aucun moteur M01–M05, aucun canon, aucune campagne jouée, aucun export réel. Les **14 enregistrements** de `DATA_MODEL_001_FIXTURES.proposal.json` sont entièrement fictifs. Le schéma JSON `DATA_MODEL_001_SCHEMA.proposal.json` est une **syntaxe candidate**, non un registre homologué. Il décrit des *références* mécaniques ; il ne calcule pas de statistiques et ne valide pas une puissance.

Sources examinées dans le dépôt, avec empreintes Git blob (ne pas confondre avec SHA de fichier brut) :
- Bestiaire M04 `quartz/components/scripts/atelier5d6-bestiary-workshop.ts` : `4dd84b20ee0ff213a0c8f17ad172fafbd5bd9c10`, type `BestiaryCard` et `BESTIARY_SCHEMA='alrick.bestiary.v1'`.
- Créateurs L003 `experiments/dg-lot003/src/creators/index.mjs` : `b53f1868baa8a5eb5ed4415000247a128e668846`, `cer.creator.dg003.descriptive.v0` (item/capacity/spell).
- Studio L003 `experiments/dg-lot003/src/studio/index.mjs` : `5ce963e6120404f7cadbf6512cb0639c2adc888f`, `cer.studio.dg003.provisional.v0`.
- Projection ARCHIVES ↔ Studio `experiments/dg-lot003/tools/adapters.mjs` : `aa8a28950b5ddab90fd8ba7b56c7934e489f45c5`, overlay `__cer_dg003_studio_projection_v0`, préservation `sourceId/source/sheet` et champs inconnus.
- Stockage ARCHIVES validé `experiments/dg-lot003/tools/runtime.mjs` : `444066ca6dbeaf59a9f8097e550bfff6105e47c7` (load/save, export/preview/commitRestore, empreintes, file d'écriture, adaptateur de sauvegarde).
- Chaîne descriptive INDEX L004 `experiments/dg-lot004/src/catalog/index.mjs` : `27ffd1dbb520eed8fff3efd293948c94ea57cf95`, quatre maillons `item → capability → creature → scene`, source/instance distinctes, snapshot privé.
- Protocole créateurs P0 `#100@ceb316e00d667ba9d5155822fd57cabc931f3380` : préserver `pendingStudioOp`, ses IDs, sa provenance, la lecture ARCHIVES durable. **Hors périmètre du chantier P1**.

**Limites de preuve :** seules les structures ci-dessus sont directement relues. Les propriétés exhaustives de `RitualDefinition`, du Grimoire natif et de chaque campagne historique n'ont pas été confrontées à leurs fichiers sources dans ce dossier ; leur classification reste **inconnue** et requiert les propriétaires INDEX/MAG/ARCHIVES. Les champs de fiches PJ historiques v2/v3 sont conservés comme source opaque `sheet` ; aucun contrat physique détaillé PJ n'est déduit du simple aperçu `name/level`.

## 1. Modèle et invariants proposés
```text
Source brute — octets + schema/commit/SHA + champs inconnus (ARCHIVES)
      │ provenance non destructive
      ▼
Définition versionnée — identité et narration, référence moteur native
      │ variante [baseDefinitionRef + variantChanges] ; sans modifier l'original
      ▼
Variante versionnée (facultative) — intentions/écarts, recalcul M04/M01 externe
      │ instance [definitionRef] + campagne
      ▼
Instance — ID propre, campagne, état courant, journal/version, liens
      │ projection explicite à liste blanche (STUDIO seulement)
      ▼
DTO public joueur — ni secrets MJ, ni source brute, ni clés de restauration
```

`recordId` est une identité logique **stable** et `recordVersion` est un SemVer de la nouvelle enveloppe **seulement**. `provenance.sourceVersion` conserve son type d'origine (numérique Grimoire, texte rites, v2/v3, SemVer INDEX) ; aucun cast silencieux. Définition et variante ne portent **jamais** d'état courant ; l'instance est la seule porteuse de `state.revision/current/historyRefs`. Une édition ne réécrit pas un document historique ni une définition employée par une ancienne campagne : elle produit une version explicite ou une nouvelle instance, avec référence arrière.

Les **trois couches** ne sont pas un unique statut : `continuity.referenceStatus` (proposition/canon), `continuity.playedStatus` (joué/non joué/non vérifié), `continuity.publicationStatus` (publié/non publié/non vérifié). Une publication ne signifie pas « fait joué » et un fait joué ne transforme pas automatiquement la définition du monde en canon. Sources historiques et preuves de ces statuts restent séparées.

`mechanics.mode` = `none`, `pending` ou `native-reference`. Ce dernier exige l'identité native (`engine/nativeSchema/nativeId/nativeVersion`), et **n'est pas une autorisation d'appliquer**. Le registre INDEX choisira le contrat officiel, non ce JSON. Les PJ N1/N10/N25 ne reçoivent ni seuils, ni dégâts, ni XP, ni bonus par niveau. La progression reste 1–25, sans plafond arbitraire à 12.

`privacy.gmOnly` est privé : les sorties joueur sont reconstruites avec `privacy.publicFields`, jamais par suppression a posteriori de champs secrets. `media[].rights='unknown'` signifie **aucun affichage public automatique** ; chaque illustration doit garder ID, alt, licence, crédit, empreinte/source si disponibles et décision de diffusion. `legacy.unknownFields` garde les inconnus comme données inertes, sans exécution ni interpolation HTML.

## 2. Comparaison des familles — champs historiques réellement identifiés
**Code de décision** : **R** = repris à l'identique dans la source brute ; **A** = adaptable via un champ d'enveloppe/une référence explicite ; **O** = obsolète pour cette *vue* (jamais supprimé de l'original) ; **?** = inconnu/non authentifié, suspendu. C'est une décision de projection candidate, **pas** un constat que tous les anciens documents possèdent ces champs.

| Exemple fictif et référence vérifiée | R — à préserver | A — à proposer | O — hors de cette nouvelle vue | ? — non justifié |
|---|---|---|---|---|
| PJ N1, N10, N25 ; ARCHIVES import `alrick.sheets.v2/v3` | `sourceId/source/sheet` et octets originaux ; ID natif `pj:...` | `level` présentable dans l'état/aperçu, référence M01 et contexte de campagne | ancienne vue mettant la totalité de `sheet` dans l'interface joueur | statistiques/mana/PV, valeurs épique N25, progression et champ exact de l'ancien export |
| Créature M04 `BestiaryCard` v1 | `stats/masteries/pvMax/manaMax`, `resistanceBonus/protection/equipmentGrades`, `abilities`, `baseDamage` sources *non recalculées* | `id,name,description,kind,role,status,level,archetype` avec identité définition/instance | statut `jeu_valide` utilisé comme preuve de canon (confusion) | validité officielle d'une variante N10 et lien au catalogue universel |
| Variante de créature N10 (créée ici) | lien vers la définition source M04 et profil M03 natif éventuel | `baseDefinitionRef/variantChanges` ; nouveau profil généré uniquement via M04 | remplacement destructif du profil v1 original | formule de variation de danger et coût en puissance |
| PNJ narratif ; `BestiaryKind='pnj'` M04 | `name/description/origin/profession/notes` dans la source | modèle sans profil M04 si pas de jet ; fiche chiffrée séparée si nécessaire | imposer `pvMax/manaMax` sur un portrait narratif | calendrier/personne/relations non présents dans le modèle M04 |
| Objet ; créateur L003 | `name,version,provenance,description,limitations,category,appearance` | définition descriptive + médias avec droits, instance inventaire si approuvée | appliquer numériquement `charges/cost` depuis la prose | ancienne fiche objet hors L003 et ses champs propres |
| Capacité ; créateur L003 | `trigger,tags,description,limitations` | `definitionRef` stable vers INDEX, prérequis et famille d'effet après contrat | `approved:true` inféré d'une validation descriptive | `AbilityDefinition` exhaustive M02 et codes historiques de capacités |
| Sort ; créateur L003 / Grimoire externe | `tradition,manifestation` L003 | `nativeId/nativeVersion` Grimoire comme référence, coûts/mana seulement via moteur natif | considérer L003 comme `resolveSpellCast` ou un sort castable | champs Grimoire exacts, charges, mana natif |
| Rite référencé ; ancien `RitualDefinition` évoqué | document/source originale à conserver, sans interprétation | `entityType='ritual'`, `mechanics.mode='pending'`, source avec version textuelle | calcul collectif/mana inventé par l'atelier | **tous champs rituels précis** tant que MAG/INDEX n'ont pas fourni la source |
| Scène/participants ; Studio L003 | `id,title,publicDescription,privateNotes,participantIds,activeSceneId` et copies `characters/creatures` | définition de scène vs instance, relation participant → ID d'instance, état courant | `privateNotes` dans DTO joueur ou changement de scène public sans CLEAR | anciennes notes de campagne non importées et leurs champs libres |

## 3. Schéma et exemples
Le fichier `DATA_MODEL_001_SCHEMA.proposal.json` est un **schéma de structure** utilisant JSON Schema 2020-12. Les 14 enregistrements fictifs démontrent :
- une définition PJ et trois instances N1/N10/N25 **sans valeurs de règles inventées** ;
- une définition créature, variante N10, instance ; un PNJ purement narratif ;
- un objet, une capacité, un sort et un rite **référencé**, et une scène (définition + instance) avec participants ;
- un media fictif en attente de droits (aucun fichier image joint) ; un canari MJ uniquement en privé ; aucun statut canon/joué accordé.

Le `$id` du schéma utilise volontairement `example.invalid` : il ne constitue ni un site à publier ni une ressource externe à charger. `sourceSha256` est absent des fixtures car aucun fichier source binaire historique n'y est embarqué ; **ne jamais inventer un digest pour satisfaire un test**.

## 4. Contrat import/export P1 à arbitrer avec 04 ARCHIVES / 11 INDEX
**Prévisualisation, jamais migration automatique.** API de conception :
```text
previewLegacyImport(bytes, {readerForSchema,sourceRef})
  → {status,recognizedSchema,originalDigest,classification[],unknowns[],blocking[],proposal?}
confirmImport(preview, {gmApproval,expectedSourceDigest,campaignId})
  → {status,recordRef,originalBlobRef,receipt}  // commit atomicité du stockage 04
exportPrivateRecords(ids,{includeOriginalBytes:true})
  → archive confidentielle validée par ARCHIVES + manifest et empreintes
previewPrivateRestore(bytes,{expectedDigest,existingCatalog})
  → diff, collisions d'IDs, conflits versions, refus de données étrangères
commitPrivateRestore(preview,{gmApproval,expectedRevision})
  → validation transactionnelle de 04, pas de suppression silencieuse
projectForPlayer(instanceId,{explicitSelection,approvedFields})
  → nouveau DTO sans provenance privée, rawSource, media non autorisés
```

Invariants attendus avant tout code : (1) conserver les octets originaux si disponibles, sourceHash + sourceSchema/version *native* ; (2) ne transformer que les champs prouvés, enregistrer chemin/source et décision de mapping ; (3) qu'un champ inconnu survive à export → réimport **octet pour octet** dans son conteneur source si possible, et sémantiquement dans `legacy.unknownFields` ; (4) aucune fusion si ID/version collisionne avec autre provenance ; (5) ne jamais substituer un ID d'instance à une définition ou variante ; (6) aucun `played`/canon automatique ; (7) aucun secret `gmOnly` ou original dans la projection ; (8) refuser si droits d'image non établis ; (9) si une écriture ACK échoue, relire et comparer les identités avant de retenter, ne jamais détruire l'existant.

**Adaptateurs minimaux proposés, non écrits :**
- `04 ARCHIVES` : `readOriginal(sourceRef)`, `hashAndStoreOriginal(bytes)`, `loadCampaignAtRevision`, `preview/commit/rollback-safe`, enveloppe de clé propre, pas de remplacement de `archiveToStudio/studioToArchive`.
- `11 INDEX` : `resolveDefinitionRef(ref)`, `validateRecordProvenance`, `mapLegacyAbility/Spell/Ritual` référencés, `listVariantLinks`, sans créer de seconde règle.
- `20 STUDIO` : `instantiateDefinition(ref,{campaignId,variantRef})`, `updateInstanceState`, `previewPublicProjection`; les participants restent des IDs d'instances.
- `21 ATELIERS` : `renderDraftForm(schema,mode)`, `previewImportDiff`, `showProvenanceAndUnknowns`, `previewVersionFork`; aucun save natif, aucun calcul.

## 5. Arbitrages DG/INDEX/ARCHIVES — bloquants pour P1 implémentation
| ID | Question | Préférence de conception / responsable |
|---|---|---|
| DM-01 | ID logique stable et schéma d'identités interop natif | INDEX choisit convention; ne jamais renommer les `pj:` ARCHIVES |
| DM-02 | Version nouvelle vs native, corrections et variantes | INDEX : SemVer enveloppe, type natif conservé; variante non destructive |
| DM-03 | Définition jouable ou seulement narrative | MATH/INDEX tranchent `engineRef`; rien n'est exécutable par défaut |
| DM-04 | Authentification v2/v3, Grimoire, rites et champs inconnus | ARCHIVES/MAG livrent inventaire de preuves, aucune invention |
| DM-05 | Atomicité sauvegarde/rollback, conflits multi-onglets | ARCHIVES arbitre expectedRevision, source digest et refus |
| DM-06 | Canon / publication / fait joué | DG + LORE tranchent droits et pièces justificatives des trois statuts |
| DM-07 | Médias et illustrations | droits vérifiables avant publication; gestion de versions et crédit |
| DM-08 | Instance de scène et copie créature | STUDIO/ATELIERS; ne pas régresser `pendingStudioOp` P0 |

**Verdict :** dossier utilisable pour décisions, **pas** pour importer ni publier des fiches. Aucun champ O n'est supprimé de l'original ; aucun champ ? n'est transformé sans nouvelle preuve.
