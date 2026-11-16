/** Dependency-injected, read-only façades. No imports from other DG-LOT-003 owners. */
import type {
  BestiaryAdapter, BestiaryAdapterOptions, BestiaryInstance, BestiaryProfile, BestiaryRef,
  CatalogRecord, CatalogRef, CatalogResolver, CatalogResolverOptions,
  CharacterImport, CharacterImportOptions, CharacterImportPreview,
  DocumentReader, DocumentReaderOptions, DocumentRecord, DocumentRef,
  InstanceIdentity, MaybePromise, PortOptions, PortResult, Ports,
  RulesGateway, RulesGatewayOptions, RulesPreview, RulesPreviewRequest,
} from "./types.ts"

const unavailable = <T>(reason: string): PortResult<T> => ({ status: "unavailable", reason })
const invalid = <T>(reason: string): PortResult<T> => ({ status: "invalid", reason })
const blocked = <T>(reason: string): PortResult<T> => ({ status: "blocked", reason })
const isText = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0 && v.length <= 180
const sameSource = (a: {id:string; version:string}, b: {id:string; version:string}) => a.id === b.id && a.version === b.version
const sameProfile = (a: {id:string; ruleset:string; schema:string}, b: {id:string; ruleset:string; schema:string}) => a.id === b.id && a.ruleset === b.ruleset && a.schema === b.schema
const isDocumentRef = (v: DocumentRef) => v?.document?.kind === "document" && isText(v.document.code) && v?.source?.kind === "source" && isText(v.source.id) && isText(v.source.version)
const isCatalogRef = (v: CatalogRef) => isText(v?.namespace) && isText(v?.id) && isText(v?.version)
const isBestiaryRef = (v: BestiaryRef) =>
  v != null && (v.document === null || (v.document?.kind === "document" && isText(v.document.code))) &&
  v.source?.kind === "source" && isText(v.source.id) && isText(v.source.version) &&
  v.profile?.kind === "profile" && isText(v.profile.id) && isText(v.profile.ruleset) && isText(v.profile.schema)
const isInstance = (v: InstanceIdentity) => v?.kind === "instance" && isText(v.id) && isText(v.campaignId)
const operations = new Set(["m01-progression", "m03-combat", "grimoire-readonly"])

/** JSON clone has no effects on the input. Unknown JSON properties survive unchanged. */
function copyData<T>(value: T): T {
  // JSON.parse rejects non-JSON structures. Prevents executable functions/classes crossing ports.
  const data = JSON.stringify(value)
  if (typeof data !== "string") throw new TypeError("Donnée non JSON")
  return JSON.parse(data) as T
}
function detach<T>(result: PortResult<T>): PortResult<T> {
  if (!result || typeof result !== "object" || !("status" in result)) return invalid("Réponse de port absente")
  if (result.status === "ready") {
    try { return { status: "ready", value: copyData(result.value) } }
    catch { return invalid("Réponse native non sérialisable en JSON") }
  }
  return ["invalid", "unavailable", "blocked"].includes(result.status) && isText(result.reason)
    ? {status:result.status, reason:result.reason} : invalid("Réponse de port invalide")
}
async function delegate<I, O>(input: I, fn: ((input: I) => MaybePromise<PortResult<O>>) | undefined, name: string): Promise<PortResult<O>> {
  if (!fn) return unavailable(`${name} : délégataire non raccordé`)
  try {
    // Keep a private input copy even when a native dependency mutates its argument.
    return detach(await fn(copyData(input)))
  } catch (err) {
    return invalid(`${name} : ${err instanceof Error ? err.message : "exception du délégataire"}`)
  }
}

export function createDocumentReader(options: DocumentReaderOptions = {}): DocumentReader {
  return { async read(ref) {
    if (!isDocumentRef(ref)) return invalid("Référence documentaire invalide")
    const r = await delegate(ref, options.read, "DocumentReader")
    if (r.status !== "ready") return r
    if (!isDocumentRef(r.value) || r.value.document.code !== ref.document.code || !sameSource(r.value.source, ref.source))
      return invalid("Document retourné différent de la source demandée")
    return r
  }}
}
export function createRulesGateway(options: RulesGatewayOptions = {}): RulesGateway {
  return { async preview(request) {
    if (!request || !operations.has(request.operation)) return blocked("Opération non homologuée ; aucune formule de secours")
    if (!isText(request.ruleset) || request.input === undefined) return invalid("Requête de prévisualisation invalide")
    // The injected MATH/native adapter must enforce M03 approval, action feasibility and unsupported effects.
    // No PV/mana/charge update occurs in this façade.
    const r = await delegate(request, options.previewNative, "RulesGateway")
    if (r.status !== "ready") return r
    if (!isText(r.value?.source) || r.value.output === undefined) return invalid("Prévisualisation native invalide")
    return r
  }}
}
export function createCatalogResolver(options: CatalogResolverOptions = {}): CatalogResolver {
  return { async resolve(ref) {
    if (!isCatalogRef(ref)) return invalid("Référence de catalogue invalide")
    const r = await delegate(ref, options.resolve, "CatalogResolver")
    if (r.status !== "ready") return r
    if (!isCatalogRef(r.value?.ref) || r.value.ref.namespace !== ref.namespace || r.value.ref.id !== ref.id || r.value.ref.version !== ref.version)
      return invalid("Catalogue : identité/version divergentes")
    return r
  }}
}
export function createCharacterImport(options: CharacterImportOptions = {}): CharacterImport {
  return { async preview(bytes) {
    if (!(bytes instanceof Uint8Array) || bytes.byteLength === 0) return invalid("Import : octets absents")
    if (!options.preview) return unavailable("CharacterImport : délégataire ARCHIVES non raccordé")
    try {
      // Bytes are copied before handing them to ARCHIVES; this port never parses or commits them.
      const r = detach(await options.preview(new Uint8Array(bytes)))
      if (r.status !== "ready") return r
      if (!isText(r.value.schema) || !/^[a-fA-F0-9]{64}$/.test(r.value.sourceDigestSHA256) ||
          !Array.isArray(r.value.warnings) || r.value.warnings.some(v => typeof v !== "string") || r.value.preview === undefined)
        return invalid("Import : aperçu/SHA256 fourni par ARCHIVES invalide")
      return r
    } catch (err) { return invalid(`CharacterImport : ${err instanceof Error ? err.message : "exception"}`) }
  }}
}
export function createBestiaryAdapter(options: BestiaryAdapterOptions = {}): BestiaryAdapter {
  const readProfile: BestiaryAdapter["readProfile"] = async (ref) => {
    if (!isBestiaryRef(ref)) return invalid("Bestiaire : référence documentaire/source/profil invalide")
    const r = await delegate(ref, options.readProfile, "BestiaryAdapter")
    if (r.status !== "ready") return r
    const p = r.value
    if (!isBestiaryRef(p) || !sameSource(p.source, ref.source) || !sameProfile(p.profile, ref.profile) ||
        p.document?.code !== ref.document?.code) return invalid("Bestiaire : identité ou version de profil divergente")
    return r
  }
  return {
    readProfile,
    async makeInstance(ref, instance) {
      if (!isInstance(instance)) return invalid("Bestiaire : identité de campagne/instance invalide")
      if (!isBestiaryRef(ref)) return invalid("Bestiaire : référence source invalide")
      const p = await readProfile(ref)
      if (p.status !== "ready") return p
      // The profile and its source remain untouched. Distinct namespace prevents aliases between local instances.
      const output: BestiaryInstance = {
        instance: copyData(instance), document: copyData(p.value.document),
        source: copyData(p.value.source), profile: copyData(p.value.profile),
        snapshot: copyData(p.value.snapshot)
      }
      return { status: "ready", value: output }
    }
  }
}
export function createPorts(options: PortOptions = {}): Ports {
  return {
    documentReader: createDocumentReader(options.documents),
    rulesGateway: createRulesGateway(options.rules),
    catalogResolver: createCatalogResolver(options.catalog),
    characterImport: createCharacterImport(options.characters),
    bestiaryAdapter: createBestiaryAdapter(options.bestiary),
  }
}