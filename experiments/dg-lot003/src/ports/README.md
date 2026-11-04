# L003-PORTS — BUILDER (contrat exécutable, provisoire)

**Portée :** `experiments/dg-lot003/src/ports/`. Contrat DG-LOT-003 non canonique. Ce paquet ne dépend que de ses propres fichiers `types.ts` et `ports.ts`. Il n'importe ni Quartz ni les sous-arbres des autres spécialistes. **Aucune formule 5d6, transaction ou persistance.**

## Point d'entrée

```ts
import {
  createPorts, createDocumentReader, createRulesGateway,
  createCatalogResolver, createCharacterImport, createBestiaryAdapter,
} from "../ports/index.ts"
```

Les fonctions `createX(options?)` et `createPorts({documents?, rules?, catalog?, characters?, bestiary?})` retournent les cinq façades ci-dessous, toutes asynchrones et typées :

| Façade | Méthode exacte | Dépendance injectée |
| --- | --- | --- |
| `documentReader` | `read(ref: DocumentRef): Promise<PortResult<DocumentRecord>>` | `documents.read(ref)` |
| `rulesGateway` | `preview(request: RulesPreviewRequest): Promise<PortResult<RulesPreview>>` | `rules.previewNative(request)` |
| `catalogResolver` | `resolve(ref: CatalogRef): Promise<PortResult<CatalogRecord>>` | `catalog.resolve(ref)` |
| `characterImport` | `preview(bytes: Uint8Array): Promise<PortResult<CharacterImportPreview>>` | `characters.preview(bytes)` |
| `bestiaryAdapter` | `readProfile(ref: BestiaryRef): Promise<PortResult<BestiaryProfile>>` / `makeInstance(ref, instance: InstanceIdentity): Promise<PortResult<BestiaryInstance>>` | `bestiary.readProfile(ref)` |

Retour commun `PortResult<T>` : `{status:"ready",value:T}` **ou** `{status:"unavailable"|"invalid"|"blocked",reason:string}`. Aucune exception d'un délégataire n'est traduite en réussite. Une dépendance absente renvoie toujours `unavailable`. Tous les paramètres/snapshots JSON sont recopiés avant délégation ou renvoi ; les octets d'import sont recopiés par `Uint8Array`.

## Identifiants séparés (pas d'inférence canonique)

```ts
const ref = {
  document: {kind:"document", code:"CRE-DEMO-001"}, // ou null pour un profil purement fictif
  source:   {kind:"source", id:"local-bestiary-source", version:"fixture-1"},
  profile:  {kind:"profile", id:"p5-demo-001", schema:"alrick.bestiary.v1", ruleset:"m03"},
} as const
const instance = {kind:"instance", id:"copy-001", campaignId:"campaign-local-001"} as const
```

- `document.code` est un identifiant documentaire **attesté par INDEX/documentation**, jamais attribué par BUILDER.
- `source.id/version` identifient le snapshot/provenance ; la mise à jour d'une source n'affecte pas une copie de campagne.
- `profile.id/schema/ruleset` identifient un profil mécanique sans le confondre avec un code documentaire.
- `instance.id/campaignId` identifient une copie de travail, sans modifier le profil ni la source.
- Une `BestiaryInstance` possède `instance`, `document`, `source`, `profile`, `snapshot` séparés. `makeInstance` fabrique une copie détachée, sans écriture.

## Raccordement provisoire par INTÉGRATION

```ts
const ports = createPorts({
  documents:  {read: async ref => /* INDEX/documentation */ ({status:"unavailable",reason:"not wired"})},
  rules:      {previewNative: async req => /* MATH natif */ ({status:"unavailable",reason:"not wired"})},
  catalog:    {resolve: async ref => /* INDEX */ ({status:"unavailable",reason:"not wired"})},
  characters: {preview: async bytes => /* ARCHIVES */ ({status:"unavailable",reason:"not wired"})},
  bestiary:   {readProfile: async ref => /* BEST/INDEX */ ({status:"unavailable",reason:"not wired"})},
})
const result = await ports.bestiaryAdapter.makeInstance(ref, instance)
```

Les commentaires remplacent les vraies injections, que **seuls les propriétaires concernés** doivent fournir. Le câblage intégrateur doit conserver les types et retourner un `PortResult` explicite. Aucun `approved:true` n'est forgé. `RulesGateway` ne reconnaît que `m01-progression`, `m03-combat` et `grimoire-readonly` ; toute autre opération est bloquée sans calcul de secours. Le délégataire MATH doit lui-même vérifier effets autorisés, faisabilité, exclusions absorption/objets numériques/Autorités 25+, et la provenance du moteur natif. Une sortie `ready` d'un délégataire n'est **pas** une approbation de transaction MJ.

`CharacterImport.preview` transporte des **octets bruts copiés** à ARCHIVES. Son résultat exige `schema`, `sourceDigestSHA256` (64 hex), `preview`, `warnings`. **ARCHIVES** est propriétaire du vrai SHA256, de la conservation des octets d'origine, des limites de taille, de la validation historique v2/v3, du commit/restauration et des collisions. Cette façade **ne stocke pas les octets**. Elle ne doit jamais être utilisée comme export joueur. `DocumentReader` et `CatalogResolver` ne contrôlent pas la publication; la projection joueur à liste blanche relève de STUDIO.

## Tests

Depuis une arborescence compatible avec Node >=22.16 (strip-types disponible) :

```bash
node --experimental-strip-types --test experiments/dg-lot003/tests/ports/ports.test.mjs
```

Avec un dépôt complet équipé d'esbuild, INTÉGRATION peut aussi regrouper `src/ports/index.ts` dans son build courant; **aucune nouvelle dépendance**. Vérification TypeScript réalisée localement :

```bash
tsc --noEmit --target ES2022 --lib ES2022,DOM --module ESNext --moduleResolution bundler --allowImportingTsExtensions --strict experiments/dg-lot003/src/ports/index.ts experiments/dg-lot003/src/ports/ports.ts experiments/dg-lot003/src/ports/types.ts
```

**Limites :** pas de preuve du Studio complet, de la sécurité des deux origines, de la compatibilité applicative v2/v3 réelle, ni de `npm test` au SHA intégré. Ces preuves reviennent respectivement à STUDIO, ARCHIVES, QA et INTÉGRATION.