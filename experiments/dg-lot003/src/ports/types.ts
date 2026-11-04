/** DG-LOT-003 · temporary prototype contracts. NOT a canonical schema. */
export type JsonValue = null | boolean | number | string | readonly JsonValue[] | { readonly [key: string]: JsonValue }
export type PortResult<T> =
  | { readonly status: "ready"; readonly value: T }
  | { readonly status: "unavailable" | "invalid" | "blocked"; readonly reason: string }
export type MaybePromise<T> = T | Promise<T>

/** The four namespaces are deliberately NOT interchangeable, even if their IDs match. */
export interface DocumentaryIdentity { readonly kind: "document"; readonly code: string }
export interface SourceIdentity { readonly kind: "source"; readonly id: string; readonly version: string }
export interface ProfileIdentity { readonly kind: "profile"; readonly id: string; readonly ruleset: string; readonly schema: string }
export interface InstanceIdentity { readonly kind: "instance"; readonly id: string; readonly campaignId: string }

export interface DocumentRef { readonly document: DocumentaryIdentity; readonly source: SourceIdentity }
export interface DocumentRecord extends DocumentRef { readonly snapshot: JsonValue }
export interface DocumentReader {
  read(ref: DocumentRef): Promise<PortResult<DocumentRecord>>
}
export interface DocumentReaderOptions {
  readonly read?: (ref: DocumentRef) => MaybePromise<PortResult<DocumentRecord>>
}

export type NativePreviewOperation = "m01-progression" | "m03-combat" | "grimoire-readonly"
export interface RulesPreviewRequest {
  readonly operation: NativePreviewOperation
  readonly ruleset: string
  readonly input: JsonValue
}
/** A preview is NOT an authorized transaction, nor permission to change PV/mana/charges. */
export interface RulesPreview { readonly source: string; readonly output: JsonValue }
export interface RulesGateway {
  preview(request: RulesPreviewRequest): Promise<PortResult<RulesPreview>>
}
export interface RulesGatewayOptions {
  readonly previewNative?: (request: RulesPreviewRequest) => MaybePromise<PortResult<RulesPreview>>
}

export interface CatalogRef { readonly namespace: string; readonly id: string; readonly version: string }
export interface CatalogRecord { readonly ref: CatalogRef; readonly snapshot: JsonValue }
export interface CatalogResolver { resolve(ref: CatalogRef): Promise<PortResult<CatalogRecord>> }
export interface CatalogResolverOptions {
  readonly resolve?: (ref: CatalogRef) => MaybePromise<PortResult<CatalogRecord>>
}

export interface CharacterImportPreview {
  readonly schema: string
  readonly sourceDigestSHA256: string
  /** Private-only preview: NEVER send it to the player projection. */
  readonly preview: JsonValue
  readonly warnings: readonly string[]
}
export interface CharacterImport { preview(bytes: Uint8Array): Promise<PortResult<CharacterImportPreview>> }
export interface CharacterImportOptions {
  /** ARCHIVES owns parsing, SHA256, raw-byte retention and commit/reject. */
  readonly preview?: (bytes: Uint8Array) => MaybePromise<PortResult<CharacterImportPreview>>
}

export interface BestiaryRef { readonly document: DocumentaryIdentity | null; readonly source: SourceIdentity; readonly profile: ProfileIdentity }
export interface BestiaryProfile extends BestiaryRef { readonly snapshot: JsonValue }
export interface BestiaryInstance extends BestiaryRef { readonly instance: InstanceIdentity; readonly snapshot: JsonValue }
export interface BestiaryAdapter {
  readProfile(ref: BestiaryRef): Promise<PortResult<BestiaryProfile>>
  makeInstance(ref: BestiaryRef, instance: InstanceIdentity): Promise<PortResult<BestiaryInstance>>
}
export interface BestiaryAdapterOptions {
  /** BEST/INDEX supply a read-only loader; no canonical source writes. */
  readonly readProfile?: (ref: BestiaryRef) => MaybePromise<PortResult<BestiaryProfile>>
}

export interface PortOptions {
  readonly documents?: DocumentReaderOptions
  readonly rules?: RulesGatewayOptions
  readonly catalog?: CatalogResolverOptions
  readonly characters?: CharacterImportOptions
  readonly bestiary?: BestiaryAdapterOptions
}
export interface Ports {
  readonly documentReader: DocumentReader
  readonly rulesGateway: RulesGateway
  readonly catalogResolver: CatalogResolver
  readonly characterImport: CharacterImport
  readonly bestiaryAdapter: BestiaryAdapter
}