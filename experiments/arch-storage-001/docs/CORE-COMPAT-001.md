# CORE-COMPAT-001 — Inventaire de réemploi / ports — à contresigner MATH + INDEX

**Statut : proposition de frontière, aucune migration ni nouveau moteur.** Base de référence PR85 `2ab809ef5351940e0fc272b859d10f21de894d00`, PR95 `b75e7f03af625fa1f09782cde4e480c2c6d21c84` consultée sans modification.

| Domaine | Source actuelle (chemin) | Politique P1-A et port proposé |
|---|---|---|
| Probabilités 5d6 M01 | `quartz/components/scripts/atelier5d6-probabilities.ts` | Réutiliser fonctions exactes par `RulesGateway.preview`, jamais reproduire `6^5` ni additionner une 2e formule. |
| Progression, XP M01 | `quartz/components/scripts/atelier5d6-progression.ts` | `XpSuggestionPort` vers les fonctions natives seulement, `appliedToSheet:false`, décision MJ distincte, version et hash du ruleset. |
| Capacité M02 | `quartz/components/scripts/atelier5d6-m02.ts` | `AbilityValidationPort`, refus de mécanismes absents, ne pas produire de capacité exécutable depuis un simple CreatorDraft. |
| Combat M03 | `quartz/components/scripts/atelier5d6-combat-m03.ts` | `CombatPreviewPort` natif; absorption non homologuée reste bloquée, aucune dépense. |
| Bestiaire M04 | `quartz/components/scripts/atelier5d6-bestiary-workshop.ts` et `atelier5d6-bestiary*.ts` | `BestiaryAdapter`: source documentaire, profil 5d6 et instance de campagne séparés ; pas de copie de formule. |
| Fiches M05 | `quartz/components/scripts/atelier5d6-m05-sheet-view.ts` | `CharacterImport` pure puis `CampaignInstance` mutable ; raw >12 et extensions retenues. |
| Grimoire / rites | `quartz/components/scripts/atelier5d6-grimoire.ts`, `atelier5d6-rituals-mag003b.ts`, `atelier5d6-mana-recovery.ts` | Références cataloguées non exécutable tant que la transaction mana/charges n'est pas native et atomique. |
| INDEX capacité / catalogue | `experiments/dg-lot003/src/catalog/index.mjs`; L004 `src/catalog/index.mjs` | `CatalogResolver` versionné, provenance/permissions, ref immuable, aucune création automatique `approved:true`. |
| BUILDER ports L003 | `experiments/dg-lot003/src/ports/index.ts`, `types.ts` | Conserver `createDocumentReader`, `createRulesGateway`, `createCatalogResolver`, `createCharacterImport`, `createBestiaryAdapter`. |
| ARCHIVES stockage | `experiments/dg-lot003/src/storage/storage.mjs` et adaptateur `tools/runtime.mjs` | Proposer `CampaignStore` asynchrone transactionnel, `previewImport` sans écriture, `commitImport` avec jeton et collision, `exportPrivate` SHA et octets bruts. |
| STUDIO | `experiments/dg-lot003/src/studio/index.mjs` / projection | `StudioRepository.load/save`/abonnement révision; DTO joueur séparée, construite par STUDIO uniquement. |
| Créateurs | `experiments/dg-lot004/src/creators/cycle-state.mjs`, `cycle-ui.mjs` | `CreatorDraftRepository`, brouillon versionné privé; publication/réglage mécanique conditionnés par INDEX/MATH, aucun débit. |

**Contrat minimal proposé aux autres rôles :**

```ts
interface CampaignStore {
  readCampaign(id: string): Promise<Campaign|null>;
  listEvents(id: string): Promise<readonly EventRecord[]>;
  applyEvent(command: {campaignId:string,eventId:string,expectedRevision:number,kind:string,payload:unknown}):
    Promise<{status:'committed'|'duplicate',revision:number}>;
  exportPrivate(id:string): Promise<{bytes:Uint8Array,sha256:string,manifest:ExportManifest}>;
  previewImport(bytes:Uint8Array):Promise<OpaquePreview>;
  commitImport(preview:OpaquePreview):Promise<{status:'imported',campaignId:string,revision:number}>;
  close():void;
}
```

**Important :** cette interface est **un banc exécutable P1-A**, pas l'adaptateur promis à STUDIO ; `applyEvent` ne connaît que les opérations *narratives de test* et refuse `grant-xp`, `cast-spell`, `resolve-combat`. Pour de vraies capacités, un `RulesGateway` natif valide préalablement, puis ARCHIVES définit séparément le commit métier. La signature du port `CatalogResolver` et le schéma d'identité stable doivent être ratifiés par INDEX.

**Questions ciblées MATH** : quels snapshots exacts d'inputs/outputs natifs stocker ? Comment versionner ruleset SHA sans figer la formule dans l'événement ? Où décider les dépenses atomiques ?

**Questions ciblées INDEX** : quel triplet source/version/ruleset permet la désérialisation d'un `CatalogReference` dont le document source est devenu indisponible ? Quelles extensions conserver sans exécution ? Comment distinguer `definitionId`, `documentCode`, `profileId`, `instanceId` dans les exports ?
