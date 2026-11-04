/**
 * L003-CATALOG — contrat expérimental v0.2, exécutable EN LECTURE SEULE.
 * Aucune invocation de M01/M03/Grimoire, aucun approved:true, aucun débit.
 * Fichiers sous experiments/ seulement ; jamais un format canonique.
 */

export const CATALOG_SCHEMA = 'entre-rives.catalog.entry.v0.2-proposal';
export const CATALOG_RUNTIME = 'cer.catalog.dg003.provisional.v0';
export const CATALOG_PRIVATE_SNAPSHOT = 'cer.catalog.dg003.private-snapshot.v0';
export const CATALOG_UNAVAILABLE = 'Indisponible — règle/validateur non homologué';
export const SUPPORTED_DESCRIPTIVE_TYPES = Object.freeze([
  'aptitude', 'technique', 'signature', 'creature-ability', 'spell', 'item-effect', 'narrative',
]);
const KINDS = new Set([...SUPPORTED_DESCRIPTIVE_TYPES, 'ritual']);
const STATES = new Set(['experimental', 'validated', 'deprecated']);
const ORIGINS = new Set(['native', 'campaign', 'illustrative', 'adapter']);
const ACTIONS = new Set(['attack', 'cast', 'perform-ritual', 'activate-item', 'passive', 'describe']);
const IMPLEMENTATIONS = new Set(['m01', 'm03', 'grimoire', 'ritual', 'manual', 'future']);
const ENGINES = new Set(['M01', 'M03', 'GRIMOIRE', 'RITUAL', 'MANUAL', 'NONE']);
const COST_MODES = new Set(['not-applicable', 'specified', 'unknown', 'native']);
const ID_RE = /^cap:[a-z0-9][a-z0-9._-]*:[a-z0-9][a-z0-9._-]*$/;
const VERSION_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
const HEX40_RE = /^[a-f0-9]{40}$/i;
const HEX64_RE = /^[a-f0-9]{64}$/i;
const ASCII_KEY_RE = /^[a-z0-9][a-z0-9._:/-]{0,159}$/i;
const BLOCKED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const FORGED_FLAGS = new Set(['approved', 'approvedByGM', 'authorized', 'autoApply', 'applied', 'commit', 'chargeDebited']);
const MAX_BYTES = 160_000;

function own(record, key) { return Object.prototype.hasOwnProperty.call(record, key); }
function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function msg(errors, path, reason) { errors.push(`${path}: ${reason}`); }
function nonEmpty(value, max = 300) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);
}
function isVersion(value) {
  if (typeof value !== 'string' || value.length > 96 || !VERSION_RE.test(value)) return false;
  const prerelease = value.split('-').slice(1).join('-');
  return !prerelease.split('.').some(p => p.length > 1 && /^\d+$/.test(p) && p.startsWith('0'));
}
function intRange(value, min, max) { return Number.isSafeInteger(value) && value >= min && value <= max; }
function amount(value) { return Number.isFinite(value) && value >= 0 && Number.isSafeInteger(value * 1000); }

/**
 * Clone JSON sûr : sans getters, fonctions, cycles, clés magiques ou prototypes
 * inattendus. Les champs inconnus JSON restent intacts uniquement dans les
 * objets privés ; ils ne se transforment jamais en instruction ou autorisation.
 */
export function clonePrivateJson(value) {
  const seen = new WeakSet();
  let bytes = 0;
  function walk(node, depth) {
    if (depth > 24) throw new TypeError('JSON imbriqué trop profondément');
    if (node === null || typeof node === 'boolean') return node;
    if (typeof node === 'string') {
      bytes += node.length * 2;
      if (node.length > MAX_BYTES || bytes > MAX_BYTES) throw new RangeError('Taille JSON excessive');
      return node;
    }
    if (typeof node === 'number') {
      if (!Number.isFinite(node)) throw new TypeError('Nombre JSON non fini');
      return node;
    }
    if (typeof node !== 'object') throw new TypeError('Valeur non JSON');
    const proto = Object.getPrototypeOf(node);
    if (Array.isArray(node) ? proto !== Array.prototype : proto !== Object.prototype && proto !== null) {
      throw new TypeError('Prototype non JSON');
    }
    if (seen.has(node)) throw new TypeError('Référence circulaire/non arborescente');
    seen.add(node);
    const output = Array.isArray(node) ? [] : {};
    const props = Object.getOwnPropertyDescriptors(node);
    if (Object.keys(props).length > 1200) throw new RangeError('Objet JSON trop grand');
    for (const [key, descriptor] of Object.entries(props)) {
      if (BLOCKED_KEYS.has(key)) throw new TypeError(`Clé JSON interdite: ${key}`);
      if (!own(descriptor, 'value')) throw new TypeError('Accesseur JSON interdit');
      if (Array.isArray(node) && key === 'length') continue;
      if (!descriptor.enumerable) throw new TypeError('Propriété JSON masquée');
      bytes += key.length * 2;
      if (bytes > MAX_BYTES) throw new RangeError('Taille JSON excessive');
      if (Array.isArray(node)) {
        if (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= node.length) throw new TypeError('Tableau JSON non canonique');
        output[Number(key)] = walk(descriptor.value, depth + 1);
      } else output[key] = walk(descriptor.value, depth + 1);
    }
    if (Array.isArray(node) && output.length !== node.length) throw new TypeError('Tableau JSON clairsemé');
    seen.delete(node);
    return output;
  }
  const copy = walk(value, 0);
  if (JSON.stringify(copy).length > MAX_BYTES) throw new RangeError('Taille JSON excessive');
  return copy;
}

function forbidEscalation(node, errors, path = 'entry') {
  if (Array.isArray(node)) return node.forEach((x, i) => forbidEscalation(x, errors, `${path}[${i}]`));
  if (!record(node)) return;
  for (const [key, value] of Object.entries(node)) {
    if (FORGED_FLAGS.has(key) && value === true) msg(errors, `${path}.${key}`, 'approbation ou application interdite dans INDEX');
    forbidEscalation(value, errors, `${path}.${key}`);
  }
}

function validateProvenance(p, errors) {
  if (!record(p)) { msg(errors, 'provenance', 'objet requis'); return; }
  if (!nonEmpty(p.sourceSchema, 160)) msg(errors, 'provenance.sourceSchema', 'source obligatoire');
  if (!nonEmpty(p.sourceId, 160)) msg(errors, 'provenance.sourceId', 'ID source obligatoire');
  if (!ORIGINS.has(p.originKind)) msg(errors, 'provenance.originKind', 'origine inconnue');
  for (const key of ['sourceVersion', 'sourcePath', 'creator']) {
    if (p[key] !== undefined && p[key] !== null && !nonEmpty(p[key], 400))
      msg(errors, `provenance.${key}`, 'texte non vide ou null attendu');
  }
  if (p.sourceCommit !== undefined && p.sourceCommit !== null && !HEX40_RE.test(p.sourceCommit))
    msg(errors, 'provenance.sourceCommit', 'SHA Git de 40 caractères attendu');
  if (p.sourceHash !== undefined && p.sourceHash !== null && !HEX64_RE.test(p.sourceHash))
    msg(errors, 'provenance.sourceHash', 'SHA256 de 64 caractères attendu');
  if (p.originKind === 'native' && !HEX40_RE.test(p.sourceCommit ?? ''))
    msg(errors, 'provenance.sourceCommit', 'requis pour origine native');
}

function validateAliases(list, errors) {
  if (list === undefined) return;
  if (!Array.isArray(list) || list.length > 60) { msg(errors, 'aliases', 'liste limitée à 60'); return; }
  const seen = new Set();
  list.forEach((v, i) => {
    if (!record(v)) { msg(errors, `aliases[${i}]`, 'objet requis'); return; }
    for (const k of ['sourceSchema', 'sourceId', 'scope']) {
      if (!nonEmpty(v[k], 160) || !ASCII_KEY_RE.test(v[k])) msg(errors, `aliases[${i}].${k}`, 'identifiant/scope invalide');
    }
    const key = JSON.stringify([v.scope, v.sourceSchema, v.sourceId]);
    if (seen.has(key)) msg(errors, `aliases[${i}]`, 'alias dupliqué');
    seen.add(key);
  });
}

function validateCost(cost, errors) {
  if (cost === undefined) return;
  if (!record(cost) || !COST_MODES.has(cost.mode)) { msg(errors, 'cost', 'mode invalide'); return; }
  if (cost.mode === 'specified') {
    if (!Array.isArray(cost.amounts) || cost.amounts.length === 0 || cost.amounts.length > 12)
      msg(errors, 'cost.amounts', 'montants requis et limités');
    else cost.amounts.forEach((a, i) => {
      if (!record(a) || !nonEmpty(a.resource, 80) || !nonEmpty(a.unit, 50) || !amount(a.value))
        msg(errors, `cost.amounts[${i}]`, 'ressource, unité et montant >=0 finis requis');
    });
    if (own(cost, 'nativeReference')) msg(errors, 'cost.nativeReference', 'incompatible avec specified');
  } else {
    if (own(cost, 'amounts')) msg(errors, 'cost.amounts', 'montants interdits hors mode specified');
    if (cost.mode === 'native' && !nonEmpty(cost.nativeReference, 250))
      msg(errors, 'cost.nativeReference', 'référence native requise');
    if (cost.mode !== 'native' && own(cost, 'nativeReference'))
      msg(errors, 'cost.nativeReference', 'référence interdite hors mode native');
  }
}

function validateDuration(duration, errors) {
  if (duration === undefined) return;
  if (!record(duration) || !COST_MODES.has(duration.mode)) { msg(errors, 'duration', 'mode invalide'); return; }
  if (duration.mode === 'specified') {
    if (!Number.isFinite(duration.value) || duration.value < 0 || !nonEmpty(duration.unit, 80))
      msg(errors, 'duration', 'valeur positive et unité requises');
    if (own(duration, 'nativeReference')) msg(errors, 'duration.nativeReference', 'incompatible avec specified');
  } else {
    if (own(duration, 'value') || own(duration, 'unit')) msg(errors, 'duration', 'quantification interdite hors specified');
    if (duration.mode === 'native' && !nonEmpty(duration.nativeReference, 250))
      msg(errors, 'duration.nativeReference', 'référence native requise');
    if (duration.mode !== 'native' && own(duration, 'nativeReference'))
      msg(errors, 'duration.nativeReference', 'référence interdite hors mode native');
  }
}

function validateNumeric(effect, entry, errors, path) {
  if (entry.entryType === 'item-effect' || entry.entryType === 'narrative')
    msg(errors, path, 'objet chiffré non homologué / narration non exécutable');
  if (!record(effect.authorization) ||
      !['pending-native-validation', 'rejected', 'authorized-in-source-only'].includes(effect.authorization.status) ||
      !nonEmpty(effect.authorization.validator, 200)) msg(errors, `${path}.authorization`, 'preuve SOURCE UNIQUEMENT nécessaire');
  if (!record(effect.parameters)) { msg(errors, `${path}.parameters`, 'paramètres requis'); return; }
  const p = effect.parameters;
  if (effect.family === 'combat.absorption' || p.kind === 'absorption') {
    msg(errors, path, 'absorption M03 bloquée : non résolue par le moteur natif'); return;
  }
  if (effect.resolver === 'M03' && /^combat\./.test(effect.family)) {
    const kinds = new Set(['precision', 'defense', 'impact', 'penetration']);
    if (!kinds.has(p.kind) || effect.family !== `combat.${p.kind}` ||
        !intRange(p.magnitude, 1, 2) || !intRange(p.duration, 1, 3) ||
        !['attaque', 'defense'].includes(p.trigger) ||
        (p.kind === 'defense') !== (p.trigger === 'defense'))
      msg(errors, path, 'bornes/famille/trigger M03 incompatibles');
    if (effect.authorization?.validator !== 'validateM03AbilityEffect')
      msg(errors, `${path}.authorization.validator`, 'validateur M03 natif requis');
  } else if (effect.resolver === 'M03' && effect.family === 'spell.damage') {
    if (!intRange(p.baseImpact, 0, 12) || p.effect !== 'degats' ||
        !['physique', 'magie', 'mental'].includes(p.resistance))
      msg(errors, path, 'paramètres de sort incompatibles');
    if (effect.authorization?.validator !== 'eligibility + resolveSpellCast')
      msg(errors, `${path}.authorization.validator`, 'validateur Grimoire natif requis');
  } else if (effect.resolver === 'RITUAL' && effect.family === 'ritual.situation') {
    if (!['m01-situation', 'm03-situation'].includes(p.kind) || p.magnitude !== 1 ||
        !intRange(p.durationTicks, 1, 3)) msg(errors, path, 'bornes de rite non respectées');
    if (effect.authorization?.validator !== 'validateRitualDefinition + MJ')
      msg(errors, `${path}.authorization.validator`, 'validateur de rite natif requis');
  } else msg(errors, path, 'famille chiffrée inconnue ou non homologuée');
}

/**
 * Valide le schéma v0.2 avec restrictions du démonstrateur L003.
 * @param {unknown} input Entrée v0.2.
 * @param {{inertNumericMetadata?:boolean}} [options] true : lisible UNIQUEMENT,
 *   jamais autorisé à appliquer ou résoudre (parité des fixtures historiques).
 * @returns {{ok:boolean,errors:string[],entry?:object,executable:false}}
 */
export function validateCatalogEntry(input, options = {}) {
  const errors = [];
  let entry;
  try { entry = clonePrivateJson(input); }
  catch (e) { return {ok: false, errors: [String(e.message)], executable: false}; }
  if (!record(entry)) return {ok: false, errors: ['entry: objet JSON requis'], executable: false};
  if (entry.schema !== CATALOG_SCHEMA) msg(errors, 'schema', 'version de contrat inconnue');
  if (typeof entry.id !== 'string' || !ID_RE.test(entry.id) || entry.id.length > 180)
    msg(errors, 'id', 'ID cap:namespace:slug stable requis');
  if (!isVersion(entry.version)) msg(errors, 'version', 'semver strict requis');
  if (!KINDS.has(entry.entryType)) msg(errors, 'entryType', 'catégorie inconnue');
  if (!STATES.has(entry.definitionState)) msg(errors, 'definitionState', 'statut inconnu');
  if (!nonEmpty(entry.name, 160)) msg(errors, 'name', 'nom requis');
  if (entry.description !== undefined && typeof entry.description !== 'string')
    msg(errors, 'description', 'texte attendu');
  validateProvenance(entry.provenance, errors);
  validateAliases(entry.aliases, errors);
  validateCost(entry.cost, errors);
  validateDuration(entry.duration, errors);
  if (entry.action !== undefined) {
    if (!record(entry.action) || !ACTIONS.has(entry.action.kind) || !IMPLEMENTATIONS.has(entry.action.implementation))
      msg(errors, 'action', 'action ou implémentation inconnue');
  }
  if (entry.conditions !== undefined) {
    if (!Array.isArray(entry.conditions) || entry.conditions.length > 30)
      msg(errors, 'conditions', 'liste invalide');
    else entry.conditions.forEach((v, i) => {
      if (!record(v) || !nonEmpty(v.kind, 100) || !own(v, 'value') ||
          !['native', 'gm', 'campaign', 'narrative'].includes(v.authority))
        msg(errors, `conditions[${i}]`, 'condition invalide');
    });
  }
  if (entry.restrictions !== undefined && (!Array.isArray(entry.restrictions) ||
    entry.restrictions.length > 50 || entry.restrictions.some(v => !nonEmpty(v, 1500))))
    msg(errors, 'restrictions', 'liste de restrictions invalide');
  if (entry.rulesProfileRef !== undefined && (!record(entry.rulesProfileRef) ||
    !nonEmpty(entry.rulesProfileRef.id, 100) ||
    !HEX40_RE.test(entry.rulesProfileRef.sourceCommit ?? '') ||
    (entry.rulesProfileRef.engine !== undefined && !ENGINES.has(entry.rulesProfileRef.engine))))
    msg(errors, 'rulesProfileRef', 'référence règles/commit invalide');
  if (entry.deprecatedBy !== undefined && !ID_RE.test(entry.deprecatedBy))
    msg(errors, 'deprecatedBy', 'ID de remplacement invalide');
  if (entry.definitionState === 'deprecated' && !entry.deprecatedBy)
    msg(errors, 'deprecatedBy', 'requis pour catégorie dépréciée');
  if (entry.documentaryRefs !== undefined && (!Array.isArray(entry.documentaryRefs) ||
      entry.documentaryRefs.length > 50 || entry.documentaryRefs.some(v =>
        !record(v) || !nonEmpty(v.id, 120) || !nonEmpty(v.relation, 120) ||
        (v.access !== undefined && !['unknown', 'private', 'public'].includes(v.access)))))
    msg(errors, 'documentaryRefs', 'références invalides');
  if (entry.extensions !== undefined && !record(entry.extensions))
    msg(errors, 'extensions', 'objet JSON requis');
  const effects = entry.effects ?? [];
  if (!Array.isArray(effects) || effects.length > 20) msg(errors, 'effects', 'liste limitée à 20');
  else effects.forEach((effect, i) => {
    const path = `effects[${i}]`;
    if (!record(effect)) { msg(errors, path, 'objet requis'); return; }
    if (effect.mode === 'descriptive') {
      if (!nonEmpty(effect.text, 3000)) msg(errors, `${path}.text`, 'texte descriptif requis');
    } else if (effect.mode === 'numeric') {
      if (options.inertNumericMetadata !== true) msg(errors, path, 'donnée chiffrée non créable dans ce prototype');
      validateNumeric(effect, entry, errors, path);
    } else msg(errors, `${path}.mode`, 'mode inconnu');
  });
  // Ne permet jamais d'insérer une approbation/appliquer une transaction via JSON.
  forbidEscalation(entry, errors);
  return errors.length ? {ok: false, errors, executable: false} :
    {ok: true, errors: [], entry, executable: false};
}

/** ID provisoire déterministe. Garder l'ID émis après renommage ; collisions contrôlées au registre. */
export function draftCatalogId(entryType, name, namespace = 'local') {
  const domain = String(namespace).toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{0,50}$/.test(domain)) throw new TypeError('namespace invalide');
  const slug = String(name).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
  if (!slug) throw new TypeError('Nom impropre à un ID provisoire');
  return `cap:${domain}:${entryType}-${slug}`;
}

/**
 * Factory pure : seule la narration est autorisée et rendue visible à l'UI MJ.
 * Un champ numérique, une instruction d'exécution ou approved:true fait ÉCHOUER
 * la création, même si l'API appelante tente d'injecter des propriétés cachées.
 * @returns {ReturnType<typeof validateCatalogEntry>}
 */
export function createDescriptiveEntry(input) {
  try { input = clonePrivateJson(input); }
  catch (e) { return {ok: false, errors: [String(e.message)], executable: false}; }
  if (!record(input)) return {ok: false, errors: ['input: objet requis'], executable: false};
  if (!SUPPORTED_DESCRIPTIVE_TYPES.includes(input.entryType))
    return {ok: false, errors: ['entryType: seules les définitions descriptives sont créables'], executable: false};
  if (input.effects !== undefined && (!Array.isArray(input.effects) ||
      input.effects.some(e => !record(e) || e.mode !== 'descriptive')))
    return {ok: false, errors: ['effects: seuls les effets descriptifs sont créables'], executable: false};
  if (input.action !== undefined && (input.action?.kind !== 'describe' || input.action?.implementation !== 'manual'))
    return {ok: false, errors: ['action: aucune activation depuis la factory descriptive'], executable: false};
  for (const key of ['approved', 'approvedByGM', 'authorized', 'autoApply', 'applied', 'commit']) {
    if (own(input, key)) return {ok: false, errors: [`${key}: propriété interdite`], executable: false};
  }
  let id;
  try { id = input.id ?? draftCatalogId(input.entryType, input.name, input.namespace ?? 'local'); }
  catch (e) { return {ok: false, errors: [String(e.message)], executable: false}; }
  const entry = {
    schema: CATALOG_SCHEMA,
    id, version: input.version ?? '0.1.0', entryType: input.entryType,
    definitionState: 'experimental', name: input.name, description: input.description ?? '',
    provenance: input.provenance,
    conditions: input.conditions ?? [],
    action: {kind: 'describe', implementation: 'manual'},
    cost: input.cost ?? {mode: 'not-applicable'}, duration: input.duration ?? {mode: 'unknown'},
    effects: input.effects ?? [{mode: 'descriptive', text: input.effectText ?? input.description}],
    restrictions: input.restrictions ?? [], aliases: input.aliases ?? [],
  };
  return validateCatalogEntry(entry);
}
function createTyped(input, entryType) {
  try {
    const clean = clonePrivateJson(input);
    if (!record(clean)) return {ok: false, errors: ['input: objet requis'], executable: false};
    return createDescriptiveEntry({...clean, entryType});
  } catch (e) { return {ok: false, errors: [String(e.message)], executable: false}; }
}
export function createDescriptiveCapability(input) {
  const kind = input && typeof input === 'object' ? Object.getOwnPropertyDescriptor(input, 'entryType')?.value : null;
  return createTyped(input, kind ?? 'technique');
}
export function createDescriptiveSpell(input) { return createTyped(input, 'spell'); }
export function createDescriptiveItem(input) { return createTyped(input, 'item-effect'); }

/**
 * Une référence native n'est ni une capacité acquise ni une autorisation.
 * Séparation explicite ID INDEX / ID source / version source / SHA moteur.
 */
export function createNativeReference(entry) {
  const result = validateCatalogEntry(entry, {inertNumericMetadata: true});
  if (!result.ok) return {ok: false, errors: result.errors};
  const p = result.entry.provenance;
  if (p.originKind !== 'native' || !HEX40_RE.test(p.sourceCommit ?? ''))
    return {ok: false, errors: ['provenance: référence native épinglée requise']};
  return {ok: true, reference: {
    kind: 'native-reference-only', catalogId: result.entry.id,
    catalogVersion: result.entry.version, sourceSchema: p.sourceSchema,
    sourceId: p.sourceId, sourceVersion: p.sourceVersion ?? null,
    sourceCommit: p.sourceCommit, executable: false,
  }};
}

/**
 * Snapshot STRICTEMENT PRIVÉ, jamais à poster vers fenêtre joueur.
 * La source originale (versions, statut et extensions inconnues) est préservée
 * SANS passer par normalizeSpell (qui réécrit version/status pour certaines entrées).
 */
export function createPrivateSnapshot(entry, nativeOriginal) {
  const r = validateCatalogEntry(entry);
  if (!r.ok) return {ok: false, errors: r.errors};
  try {
    const raw = clonePrivateJson(nativeOriginal);
    const version = record(raw) && own(raw, 'version') ? clonePrivateJson(raw.version) : null;
    const status = record(raw) && own(raw, 'status') ? clonePrivateJson(raw.status) : null;
    return {ok: true, snapshot: {
      schema: CATALOG_PRIVATE_SNAPSHOT, visibility: 'mj-private',
      catalogEntry: r.entry, originalNativeSource: raw,
      originalVersion: version, originalStatus: status,
      savedFrom: {catalogId: r.entry.id, catalogVersion: r.entry.version},
      executable: false,
    }};
  } catch (e) { return {ok: false, errors: [String(e.message)]}; }
}

/** Aperçu de l'atelier MJ ; PAS un DTO joueur. Aucune extension/source brute. */
export function previewCatalogEntry(entry) {
  const result = validateCatalogEntry(entry, {inertNumericMetadata: true});
  if (!result.ok) return {ok: false, errors: result.errors, status: CATALOG_UNAVAILABLE};
  const x = result.entry;
  const textEffects = (x.effects ?? []).filter(e => e.mode === 'descriptive').map(e => e.text);
  const hasNumeric = (x.effects ?? []).some(e => e.mode === 'numeric');
  return {ok: true, preview: {
    id: x.id, version: x.version, entryType: x.entryType, name: x.name,
    description: x.description ?? '', effects: textEffects,
    restrictions: x.restrictions ?? [],
    status: hasNumeric ? CATALOG_UNAVAILABLE : 'Descriptif — aucune application automatique',
    executable: false,
  }};
}

/** Collisions des IDs et aliases dans leur scope ; versions différentes d'un ID possibles. */
export function validateCatalogRegistry(entries) {
  const errors = [];
  if (!Array.isArray(entries) || entries.length > 500) return {ok: false, errors: ['registry: liste <= 500 requise']};
  const ids = new Map();
  const aliases = new Map();
  entries.forEach((entry, i) => {
    const r = validateCatalogEntry(entry, {inertNumericMetadata: true});
    if (!r.ok) { msg(errors, `registry[${i}]`, r.errors.join('; ')); return; }
    const e = r.entry;
    const prior = ids.get(e.id);
    if (!prior) ids.set(e.id, {kind: e.entryType, versions: new Set([e.version])});
    else {
      if (prior.kind !== e.entryType) msg(errors, `registry[${i}]`, 'catégorie changée pour ID stable');
      if (prior.versions.has(e.version)) msg(errors, `registry[${i}]`, 'ID + version dupliqués');
      prior.versions.add(e.version);
    }
    (e.aliases ?? []).forEach(alias => {
      const key = JSON.stringify([alias.scope, alias.sourceSchema, alias.sourceId]);
      const priorId = aliases.get(key);
      if (priorId && priorId !== e.id) msg(errors, `registry[${i}]`, 'alias attribué à deux IDs');
      aliases.set(key, e.id);
    });
  });
  return {ok: errors.length === 0, errors};
}