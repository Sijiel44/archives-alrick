import { ADVENTURE_SCENE_LIMIT, CREATION_STATES, CREATION_TYPES } from './creations.mjs';

const DATABASE = 'entre-rives.studio-local.v1';
const FORMAT = 'chroniques-entre-rives.studio-local';
const DATABASE_VERSION = 1;
const LEGACY_BACKUP_VERSION = 1;
const FRESQUE_BACKUP_VERSION = 2;
const SESSION_BACKUP_VERSION = 3;
const MARKER_BACKUP_VERSION = 4;
const LIBRARY_BACKUP_VERSION = 5;
const PLAY_BACKUP_VERSION = 6;
const BESTIARY_BACKUP_VERSION = 7;
const OPPOSITION_BACKUP_VERSION = 8;
const PJ_BACKUP_VERSION = 9;
const CREATION_BACKUP_VERSION = 10;
const ADVENTURE_BACKUP_VERSION = 11;
const AMBIANCE_BACKUP_VERSION = 12;
const LANE_BACKUP_VERSION = 13;
const INTERLUDE_BACKUP_VERSION = 14;
const LINKED_IMAGE_BACKUP_VERSION = 15;
const ADVENTURE_PACKAGE_BACKUP_VERSION = 16;
const ADVENTURE_PACKAGE_FORMAT = 'chroniques-entre-rives.aventure';
export const MAX_ADVENTURE_PACKAGE_BYTES = 512 * 1024;
export const ADVENTURE_SOURCE_KEY = 'entreRivesAdventurePackageV16';
export const LINKED_IMAGES_KEY = 'entreRivesLinkedImagesV15';
export const IMAGE_ORIGINS = Object.freeze({
  project: 'Créée par le projet', generated: 'Générée pour le projet', licensed: 'Licence ou autorisation indiquée', unknown: 'Droits à vérifier',
});
export const INTERLUDES_KEY = 'entreRivesInterludesV14';
export const INTERLUDE_KINDS = Object.freeze({ rest: 'Repos', travel: 'Voyage', training: 'Entraînement', research: 'Recherche', other: 'Autre activité' });
export const FRESQUE_LANES_KEY = 'entreRivesFresqueLanesV13';
export const FRESQUE_LANE_KEY = 'entreRivesFresqueLaneV13';
export const FRESQUE_LANE_LIMIT = 30;
export const FRESQUE_LINKS_KEY = 'entreRivesFresqueLinksV2';
export const SESSION_ARCHIVES_KEY = 'entreRivesSessionArchivesV3';
export const FRESQUE_MARKERS_KEY = 'entreRivesFresqueMarkersV4';
export const FRESQUE_REFERENCE_KEY = 'entreRivesFresqueReferenceV5';
export const PLAY_ACTIONS_KEY = 'entreRivesPlayActionsV6';
export const BESTIARY_PROFILE_KEY = 'entreRivesBestiaryProfileV7';
export const PJ_SOURCE_KEY = 'entreRivesPJSourceV9';
export const CREATIONS_KEY = 'entreRivesCreationsV10';
export const ADVENTURE_SCENE_KEY = 'entreRivesAdventureSceneV11';
export const SCENE_AMBIANCES_KEY = 'entreRivesSceneAmbiancesV12';
export const SCENE_AMBIANCE_LIMIT = 12;
export const BESTIARY_SCHEMA = 'alrick.bestiary.v1';
export const LIBRARY_SOURCE_SCHEMAS = Object.freeze({
  archives: 'cer.quartz.document',
  campaign: 'cer.studio.fresque-marker',
});
export const MARKER_KINDS = Object.freeze({ lead: 'Indice', place: 'Lieu', consequence: 'Conséquence possible' });
export const PLAY_STATS = Object.freeze({ physique: 'Physique', agilite: 'Agilité', esprit: 'Esprit', presence: 'Présence' });
export const OPPOSITION_MODES = Object.freeze({ melee: 'Mêlée', tir: 'Tir', magie: 'Magie', mental: 'Influence mentale' });
const MAX_BACKUP_BYTES = 4 * 1024 * 1024;
const MAX_ITEMS = 5000;
const encoder = new TextEncoder();
const digestPattern = /^[a-f0-9]{64}$/;

export class StudioError extends Error {
  constructor(code, message, options) {
    super(message, options);
    this.name = 'StudioError';
    this.code = code;
  }
}

function fail(code, message) {
  throw new StudioError(code, message);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value));
}

function exactKeys(value, keys) {
  return isRecord(value) && Object.keys(value).length === keys.length &&
    keys.every(key => Object.hasOwn(value, key));
}

export function checkJSON(value, depth = 0) {
  if (depth > 24) fail('invalid-data', 'Les données sont trop imbriquées.');
  if (value === null || ['string', 'boolean'].includes(typeof value) || Number.isFinite(value)) return;
  if (Array.isArray(value) && value.length <= MAX_ITEMS) {
    for (const item of value) checkJSON(item, depth + 1);
    return;
  }
  if (!isRecord(value)) fail('invalid-data', 'Les données doivent être au format JSON.');
  const entries = Object.entries(Object.getOwnPropertyDescriptors(value));
  if (entries.length > MAX_ITEMS) fail('limit', 'Les données sont trop volumineuses.');
  for (const [key, descriptor] of entries) {
    if (['__proto__', 'constructor', 'prototype'].includes(key) || !Object.hasOwn(descriptor, 'value')) {
      fail('invalid-data', 'Les données contiennent une propriété non prise en charge.');
    }
    checkJSON(descriptor.value, depth + 1);
  }
}

function isId(value) {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(value);
}

function isLevel(value) {
  return Number.isInteger(value) && value >= 1 && value <= 25;
}

function isTitle(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 160;
}

function isText(value) {
  return typeof value === 'string' && value.length <= 16000;
}

function validCampaignInfo(value) {
  return isTitle(value.name) && isText(value.description) && isLevel(value.startingLevel) &&
    ['one-shot', 'campaign'].includes(value.style);
}

function validCharacter(value) {
  return isRecord(value) && isId(value.id) && isTitle(value.name) && isLevel(value.level) && isText(value.notes);
}

function validCreatureInfo(value) {
  return isRecord(value) && isId(value.id) && isTitle(value.name) && isText(value.description);
}

function validSource(value) {
  return isRecord(value) && isId(value.id) &&
    (isTitle(value.version) || (Number.isSafeInteger(value.version) && value.version > 0));
}

const bestiaryArchetypes = ['faune', 'predateur', 'gardien', 'mystique', 'colosse'];
const defenses = ['physique', 'magie', 'mental'];
const integerBetween = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;

export function validPJSource(source) {
  if (!isRecord(source) || source.ruleset !== 'm02' || source.kind !== 'pj' ||
      !isId(source.id) || !isTitle(source.name) || !isLevel(source.level) ||
      !integerBetween(source.pvMax, 1, 999) || !integerBetween(source.pv, 0, source.pvMax) ||
      !integerBetween(source.manaMax, 0, 999) || !integerBetween(source.mana, 0, source.manaMax) ||
      !integerBetween(source.xp, 0, 999999)) return false;
  const { stats, masteries, development } = source;
  if (!isRecord(stats) || !Object.keys(PLAY_STATS).every(stat => integerBetween(stats[stat], 1, Number.MAX_SAFE_INTEGER)) ||
      !isRecord(masteries) || !Object.values(masteries).every(rank => integerBetween(rank, 0, Number.MAX_SAFE_INTEGER)) ||
      !isRecord(development) || !isRecord(development.startingStats) || !Array.isArray(development.abilities)) return false;
  return Object.keys(PLAY_STATS).every(stat => integerBetween(development.startingStats[stat], 1, 5)) &&
    development.abilities.every(ability => isRecord(ability) &&
      ['id', 'name', 'domain', 'provenance'].every(key => typeof ability[key] === 'string') &&
      typeof ability.kind === 'string' && ['slot', 'defined'].includes(ability.status) && typeof ability.approvedByGM === 'boolean' &&
      ['effect', 'description', 'limitations', 'masteryDomain'].every(key => ability[key] === undefined || typeof ability[key] === 'string') &&
      (ability.status !== 'defined' || typeof ability.description === 'string') &&
      (ability.masteryRequired === undefined || integerBetween(ability.masteryRequired, 0, Number.MAX_SAFE_INTEGER)) &&
      integerBetween(ability.rank, 1, Number.MAX_SAFE_INTEGER) && isLevel(ability.levelRequired)) &&
    [['resistanceBonus', 8], ['protection', 60], ['equipmentGrades', 5]].every(([key, max]) =>
      isRecord(source[key]) && defenses.every(kind => integerBetween(source[key][kind], 0, max)));
}

export function combatProfile(actor) {
  return actor?.[PJ_SOURCE_KEY] ?? actor?.[BESTIARY_PROFILE_KEY]?.card;
}

function initialHitPoints(actor) {
  return actor[PJ_SOURCE_KEY]?.pv ?? actor[BESTIARY_PROFILE_KEY]?.card.pvMax;
}

function validBestiaryCard(card) {
  if (!isRecord(card) || card.schema !== BESTIARY_SCHEMA || card.ruleset !== 'm03' || !isId(card.id) ||
      !isTitle(card.name) || !isText(card.description) || !isText(card.notes) || !isText(card.origin) ||
      !isText(card.profession) || !isLevel(card.level) ||
      !['creature', 'pnj'].includes(card.kind) || !['offensif', 'defensif', 'soutien'].includes(card.role) ||
      !bestiaryArchetypes.includes(card.archetype) || !['brouillon', 'jeu_valide', 'documentaire_approuve'].includes(card.status)) return false;
  if (!isRecord(card.stats) || !Object.keys(PLAY_STATS).every(stat => integerBetween(card.stats[stat], 1, 9999)) ||
      !isRecord(card.masteries) || !Object.values(card.masteries).every(rank => integerBetween(rank, 0, 9999))) return false;
  if (!integerBetween(card.pvMax, 1, 999999) || !integerBetween(card.manaMax, 0, 999999) ||
      !integerBetween(card.baseDamage, 1, 12) || !integerBetween(card.penetration, 0, 8)) return false;
  return [['resistanceBonus', 8], ['protection', 60], ['equipmentGrades', 5]].every(([key, max]) =>
    isRecord(card[key]) && defenses.every(kind => integerBetween(card[key][kind], 0, max))) &&
    Array.isArray(card.abilities) && card.abilities.length <= 25 && card.abilities.every(ability =>
      isRecord(ability) && isText(ability.name) && isText(ability.description) && isText(ability.limitations) &&
      typeof ability.approvedByGM === 'boolean');
}

export function validBestiaryProfile(profile) {
  if (!isRecord(profile) || !validBestiaryCard(profile.card)) return false;
  if (profile.origin === 'created') return profile.original === null;
  return profile.origin === 'imported' && isRecord(profile.original) && profile.original.schema === BESTIARY_SCHEMA &&
    profile.original.ruleset === 'm03' && profile.original.id === profile.card.id;
}

function validBestiarySource(source, profile) {
  return isRecord(source) && validBestiaryProfile(profile) && source.id === profile.card.id && source.version === BESTIARY_SCHEMA;
}

function validScene(value) {
  return isRecord(value) && isId(value.id) && isTitle(value.title) && isText(value.description) &&
    isText(value.privateNotes) && Array.isArray(value.participantIds) && value.participantIds.every(isId);
}

const ambianceFields = ['id', 'name', 'title', 'description', 'imageId'];

function validSceneAmbiance(value) {
  return isId(value.id) && isTitle(value.name) && (value.title === '' || isTitle(value.title)) &&
    isText(value.description) && (value.imageId === null || isId(value.imageId)) &&
    Boolean(value.title || value.description.trim() || value.imageId);
}

function validateSceneAmbiances(ambiances) {
  if (!Array.isArray(ambiances) || ambiances.length > SCENE_AMBIANCE_LIMIT ||
      !ambiances.every(item => exactKeys(item, ambianceFields) && validSceneAmbiance(item)) ||
      new Set(ambiances.map(item => item.id)).size !== ambiances.length) {
    fail('invalid-data', 'Le carnet d’ambiances de cette scène est invalide ou plein.');
  }
}

function validSceneLink(value) {
  return isRecord(value) && isId(value.id) && isId(value.fromId) && isId(value.toId) &&
    typeof value.label === 'string' && value.label.length <= 160;
}

function validAdventureReferences(ids) {
  return Array.isArray(ids) && ids.length <= 12 && ids.every(isId) && new Set(ids).size === ids.length;
}

const adventureSceneFields = ['id', 'title', 'description', 'privateNotes', 'referenceIds'];

function validAdventureScenes(scenes) {
  return Array.isArray(scenes) && scenes.length > 0 && scenes.length <= ADVENTURE_SCENE_LIMIT &&
    scenes.every(scene => exactKeys(scene, adventureSceneFields) && isId(scene.id) && isId(`suite-${scene.id}`) &&
      isTitle(scene.title) && isText(scene.description) && isText(scene.privateNotes) && validAdventureReferences(scene.referenceIds));
}

function validAdventurePlan(value) {
  return isId(value.adventureId) && typeof value.chain === 'boolean' && validAdventureScenes(value.scenes);
}

function validFresqueMarker(value) {
  return isRecord(value) && isId(value.id) && typeof value.kind === 'string' && Object.hasOwn(MARKER_KINDS, value.kind) &&
    isTitle(value.title) && isText(value.description) && (value.sceneId === null || isId(value.sceneId));
}

const creationFields = ['id', 'kind', 'name', 'description', 'notes', 'state', 'details', 'parentId', 'links'];
const linkedImageFields = ['id', 'name', 'url', 'alt', 'origin', 'credit', 'targetId'];

export function validImageUrl(value) {
  if (typeof value !== 'string' || value.length > 2048 || !/^https:\/\/[^/]/i.test(value) || /[\s\\\p{Cc}]/u.test(value)) return false;
  const url = URL.parse(value);
  return url?.protocol === 'https:' && !url.username && !url.password;
}

function validLinkedImage(value) {
  return isId(value.id) && value.id.startsWith('image-link-') && isTitle(value.name) && validImageUrl(value.url) &&
    typeof value.alt === 'string' && value.alt.length <= 300 && typeof value.origin === 'string' &&
    Object.hasOwn(IMAGE_ORIGINS, value.origin) && typeof value.credit === 'string' && value.credit.length <= 600 &&
    (value.targetId === null || isId(value.targetId));
}

function validCreation(value) {
  if (!isRecord(value) || !isId(value.id) || !/^creation-[a-z0-9-]+$/.test(value.id) || !isTitle(value.name) ||
      !isText(value.description) || !isText(value.notes) || typeof value.kind !== 'string' ||
      !Object.hasOwn(CREATION_TYPES, value.kind) || typeof value.state !== 'string' || !Object.hasOwn(CREATION_STATES, value.state) ||
      !(value.parentId === null || (value.kind === 'place' && isId(value.parentId))) ||
      !Array.isArray(value.links) || value.links.length > 12 || !value.links.every(isId) ||
      new Set(value.links).size !== value.links.length) return false;
  const { fields } = CREATION_TYPES[value.kind];
  return exactKeys(value.details, fields.map(field => field.key)) && fields.every(({ key, choices }) =>
    choices ? choices.includes(value.details[key]) || (value.kind !== 'place' && value.details[key] === '')
      : isText(value.details[key]));
}

function validateCreations(entries, reserved) {
  if (!Array.isArray(entries) || !entries.every(validCreation)) fail('invalid-data', 'Une création ne correspond pas à son modèle.');
  const index = new Map(entries.map(entry => [entry.id, entry]));
  if (index.size !== entries.length || entries.some(entry => reserved.has(entry.id))) {
    fail('conflict', 'Un identifiant de création est déjà utilisé.');
  }
  const checked = new Set();
  const adventureSources = new Set();
  for (const entry of entries) {
    if (Object.hasOwn(entry, ADVENTURE_SOURCE_KEY)) {
      const source = entry[ADVENTURE_SOURCE_KEY];
      if (entry.kind !== 'adventure' || !validAdventureSource(source) || adventureSources.has(source.id)) {
        fail('invalid-data', 'La provenance d’une aventure importée est invalide ou dupliquée.');
      }
      adventureSources.add(source.id);
    }
    if (entry.links.some(id => id === entry.id || (id.startsWith('creation-') && !index.has(id)))) {
      fail('foreign-key', 'Les liens privés doivent viser une autre création de la campagne.');
    }
    const path = new Set();
    let place = entry;
    while (place.parentId && !checked.has(place.id)) {
      if (path.has(place.id)) fail('invalid-data', 'Un lieu ne peut pas se retrouver dans sa propre hiérarchie.');
      path.add(place.id);
      place = index.get(place.parentId);
      if (place?.kind !== 'place') fail('foreign-key', 'Le lieu parent doit appartenir à cette campagne.');
    }
    for (const id of path) checked.add(id);
  }
  return index;
}

function validAdventureSource(source) {
  return exactKeys(source, ['id', 'version', 'reference']) && typeof source.id === 'string' && /^[a-z0-9][a-z0-9-]{0,47}$/.test(source.id) &&
    Number.isSafeInteger(source.version) && source.version >= 1 && isTitle(source.reference);
}

function validateAdventurePackage(bundle) {
  if (bundle?.format !== ADVENTURE_PACKAGE_FORMAT) fail('invalid-adventure', 'Choisissez un fichier d’aventure du Studio.');
  if (bundle.version !== 1) fail('adventure-version', 'Cette version de fichier d’aventure n’est pas prise en charge.');
  if (!exactKeys(bundle, ['format', 'version', 'source', 'adventureId', 'creations', 'scenes', 'links']) ||
      !validAdventureSource(bundle.source) || !isId(bundle.adventureId) || !validAdventureScenes(bundle.scenes) ||
      !Array.isArray(bundle.creations) || bundle.creations.length > 13 || !Array.isArray(bundle.links) || bundle.links.length > 36) {
    fail('invalid-adventure', 'Le fichier d’aventure contient des champs incomplets ou inconnus.');
  }
  const prefix = bundle.source.id;
  const sceneIds = new Set(bundle.scenes.map(scene => scene.id));
  if (sceneIds.size !== bundle.scenes.length || bundle.scenes.some(scene => !scene.id.startsWith(`scene-${prefix}-`)) ||
      !bundle.creations.every(entry => exactKeys(entry, creationFields) && validCreation(entry) && entry.id.startsWith(`creation-${prefix}-`)) ||
      !bundle.links.every(link => exactKeys(link, ['id', 'fromId', 'toId', 'label']) && validSceneLink(link) && link.id.startsWith(`branche-${prefix}-`))) {
    fail('invalid-adventure', 'Les fiches, scènes ou embranchements de l’aventure sont invalides.');
  }
  const entries = validateCreations(bundle.creations, sceneIds);
  const adventure = entries.get(bundle.adventureId);
  if (adventure?.kind !== 'adventure' || bundle.creations.some(entry => entry.id !== adventure.id &&
      (entry.kind === 'adventure' || !adventure.links.includes(entry.id)))) {
    fail('invalid-adventure', 'Le fichier doit contenir une aventure principale reliée à ses fiches.');
  }
  if (bundle.creations.some(entry => entry.links.some(id => !entries.has(id))) ||
      bundle.scenes.some(scene => scene.referenceIds.some(id => !adventure.links.includes(id)))) {
    fail('foreign-key', 'Une fiche liée manque dans le fichier d’aventure.');
  }
  validateSceneLinks(bundle.links, sceneIds, new Set());
  return true;
}

export function readAdventurePackage(text) {
  if (typeof text !== 'string' || text.length > MAX_ADVENTURE_PACKAGE_BYTES || encoder.encode(text).length > MAX_ADVENTURE_PACKAGE_BYTES) {
    fail('limit', 'Choisissez un fichier d’aventure de 512 Kio ou moins.');
  }
  let bundle;
  try { bundle = JSON.parse(text); }
  catch { fail('invalid-adventure', 'Le fichier d’aventure ne contient pas de JSON valide.'); }
  checkJSON(bundle);
  validateAdventurePackage(bundle);
  return bundle;
}

export function importedAdventure(campaign, sourceId) {
  return campaign[CREATIONS_KEY]?.find(entry => entry[ADVENTURE_SOURCE_KEY]?.id === sourceId);
}

function validLibraryProvenance(value) {
  if (!isRecord(value) || !isId(value.sourceId)) return false;
  if (value.sourceSchema === LIBRARY_SOURCE_SCHEMAS.archives) {
    return typeof value.sourceVersion === 'string' && /^[a-f0-9]{40}$/.test(value.sourceVersion) &&
      !Object.hasOwn(value, 'sourceCampaignId');
  }
  return value.sourceSchema === LIBRARY_SOURCE_SCHEMAS.campaign && isId(value.sourceCampaignId) &&
    Number.isSafeInteger(value.sourceVersion) && value.sourceVersion > 0;
}

function validLibraryMarkerCopy(value) {
  if (!validFresqueMarker(value) || !validLibraryProvenance(value.provenance)) return false;
  const fields = ['sourceSchema', 'sourceId', 'sourceVersion'];
  if (value.provenance.sourceSchema === LIBRARY_SOURCE_SCHEMAS.archives) {
    return value.kind === 'place' && exactKeys(value.provenance, fields);
  }
  return exactKeys(value.provenance, [...fields, 'sourceCampaignId']);
}

function validSessionDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '0001-01-01') return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validSession(value) {
  return isRecord(value) && isId(value.id) && isTitle(value.title) && validSessionDate(value.date) &&
    (value.resumeSceneId === null || isId(value.resumeSceneId)) &&
    Array.isArray(value.confirmedSceneIds) && value.confirmedSceneIds.every(isId) &&
    isText(value.privateSummary) && isText(value.nextSession) && isText(value.chronicle);
}

const interludeFields = ['id', 'title', 'kind', 'afterSceneId', 'preparation'];

function validInterlude(value) {
  return isId(value.id) && isTitle(value.title) && typeof value.kind === 'string' && Object.hasOwn(INTERLUDE_KINDS, value.kind) &&
    (value.afterSceneId === null || isId(value.afterSceneId)) && isText(value.preparation);
}

function validInterludeResult(value) {
  return validSessionDate(value.date) && isText(value.notes) && Boolean(value.notes.trim());
}

const rollFields = ['ruleset', 'source', 'stat', 'rawStat', 'masteryRank', 'situation', 'threshold', 'dice'];
const oppositionRollFields = [...rollFields, 'targetId', 'impactMode', 'level', 'baseDamage', 'penetration'];
const playActionFields = ['id', 'sceneId', 'actor', 'intent', 'stakes', 'consequence', 'recordedAt', 'mode', 'roll'];

function validPlayRoll(value) {
  return isRecord(value) && ['studio', 'table'].includes(value.source) &&
    typeof value.stat === 'string' && Object.hasOwn(PLAY_STATS, value.stat) && Number.isSafeInteger(value.rawStat) && value.rawStat >= 1 &&
    Number.isSafeInteger(value.masteryRank) && value.masteryRank >= 0 &&
    Number.isSafeInteger(value.threshold) && value.threshold >= 0 &&
    Number.isInteger(value.situation) && value.situation >= -2 && value.situation <= 2 &&
    Array.isArray(value.dice) && value.dice.length === 5 &&
    Array.from(value.dice).every(face => Number.isInteger(face) && face >= 1 && face <= 6);
}

function validOppositionRoll(roll) {
  return validPlayRoll(roll) && roll.ruleset === 'm03' && isId(roll.targetId) &&
    typeof roll.impactMode === 'string' && Object.hasOwn(OPPOSITION_MODES, roll.impactMode) &&
    isLevel(roll.level) && integerBetween(roll.threshold, 15, 30) &&
    integerBetween(roll.baseDamage, 1, 12) && integerBetween(roll.penetration, 0, 8);
}

function validActionFields(value) {
  if (!isRecord(value) || !isId(value.id) || !isId(value.sceneId) || !isText(value.actor) || !isTitle(value.intent) ||
      !isText(value.stakes) || !value.stakes.trim() || !isText(value.consequence) || !value.consequence.trim() ||
      typeof value.recordedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.recordedAt)) return false;
  const timestamp = new Date(value.recordedAt);
  return Number.isFinite(timestamp.getTime()) && timestamp.toISOString() === value.recordedAt;
}

function validPlayAction(value) {
  if (!validActionFields(value)) return false;
  if (value.mode === 'check') return validPlayRoll(value.roll) && value.roll.ruleset === 'm01';
  if (value.mode === 'opposition') {
    const { combat } = value;
    return validOppositionRoll(value.roll) && isRecord(combat) && isTitle(combat.targetName) &&
      integerBetween(combat.damage, 0, 999999) && integerBetween(combat.hpBefore, 0, 999999) &&
      integerBetween(combat.hpAfter, 0, combat.hpBefore);
  }
  return ['certain', 'blocked'].includes(value.mode) && value.roll === null;
}

export function currentHitPoints(campaign, creature) {
  const last = campaign[PLAY_ACTIONS_KEY]?.findLast(action => action.mode === 'opposition' && action.roll.targetId === creature.id);
  return last?.combat.hpAfter ?? initialHitPoints(creature);
}

export const hitPointsAfterDamage = (current, damage) => Math.max(0, current - damage);

const sceneFields = ['id', 'title', 'description', 'privateNotes', 'participantIds'];
const markerFields = ['id', 'kind', 'title', 'description', 'sceneId'];
const operations = {
  'import-adventure': { fields: ['bundle'], valid: value => validateAdventurePackage(value.bundle), backupVersion: ADVENTURE_PACKAGE_BACKUP_VERSION },
  'plan-adventure': { fields: ['adventureId', 'chain', 'scenes'], valid: validAdventurePlan, backupVersion: ADVENTURE_BACKUP_VERSION },
  'save-creation': { fields: creationFields, valid: validCreation, backupVersion: CREATION_BACKUP_VERSION },
  'save-linked-image': { fields: linkedImageFields, valid: validLinkedImage, backupVersion: LINKED_IMAGE_BACKUP_VERSION },
  'remove-linked-image': { fields: ['id'], valid: value => isId(value.id), backupVersion: LINKED_IMAGE_BACKUP_VERSION },
  create: { fields: ['name', 'description', 'style', 'startingLevel'], valid: validCampaignInfo },
  'save-character': { fields: ['id', 'name', 'level', 'notes'], valid: validCharacter },
  'attach-pj-source': {
    fields: ['id', 'attach', 'source'],
    valid: value => isId(value.id) && typeof value.attach === 'boolean' && validPJSource(value.source),
    backupVersion: PJ_BACKUP_VERSION,
  },
  'copy-creature': {
    fields: ['id', 'name', 'description', 'source'],
    valid: value => validCreatureInfo(value) && exactKeys(value.source, ['id', 'version']) && validSource(value.source),
  },
  'save-bestiary-profile': {
    fields: ['id', 'name', 'description', 'source', 'profile'],
    valid: value => validCreatureInfo(value) && exactKeys(value.source, ['id', 'version']) &&
      exactKeys(value.profile, ['origin', 'card', 'original']) && validBestiarySource(value.source, value.profile),
    backupVersion: BESTIARY_BACKUP_VERSION,
  },
  'save-creature': { fields: ['id', 'name', 'description'], valid: validCreatureInfo },
  'save-scene': { fields: sceneFields, valid: validScene },
  'save-interlude': { fields: interludeFields, valid: validInterlude, backupVersion: INTERLUDE_BACKUP_VERSION },
  'remove-interlude': { fields: ['id'], valid: value => isId(value.id), backupVersion: INTERLUDE_BACKUP_VERSION },
  'record-interlude': {
    fields: ['id', 'date', 'notes'],
    valid: value => isId(value.id) && validInterludeResult(value),
    backupVersion: INTERLUDE_BACKUP_VERSION,
  },
  'save-fresque-lane': {
    fields: ['id', 'name'],
    valid: value => isId(value.id) && isTitle(value.name) && value.name.length <= 80,
    backupVersion: LANE_BACKUP_VERSION,
  },
  'remove-fresque-lane': {
    fields: ['id'], valid: value => isId(value.id), backupVersion: LANE_BACKUP_VERSION,
  },
  'set-scene-lane': {
    fields: ['sceneId', 'laneId'],
    valid: value => isId(value.sceneId) && (value.laneId === null || isId(value.laneId)),
    backupVersion: LANE_BACKUP_VERSION,
  },
  'save-scene-ambiance': {
    fields: ['sceneId', ...ambianceFields],
    valid: value => isId(value.sceneId) && validSceneAmbiance(value),
    backupVersion: AMBIANCE_BACKUP_VERSION,
  },
  'remove-scene-ambiance': {
    fields: ['sceneId', 'id'],
    valid: value => isId(value.sceneId) && isId(value.id),
    backupVersion: AMBIANCE_BACKUP_VERSION,
  },
  'select-scene': { fields: ['id'], valid: value => isId(value.id) },
  'improvise-scene': {
    fields: [...sceneFields, 'activate'],
    valid: value => validScene(value) && typeof value.activate === 'boolean',
    backupVersion: FRESQUE_BACKUP_VERSION,
  },
  'move-scene': {
    fields: ['id', 'direction'],
    valid: value => isId(value.id) && ['left', 'right'].includes(value.direction),
    backupVersion: FRESQUE_BACKUP_VERSION,
  },
  'add-scene-link': {
    fields: ['id', 'fromId', 'toId', 'label'],
    valid: validSceneLink,
    backupVersion: FRESQUE_BACKUP_VERSION,
  },
  'remove-scene-link': {
    fields: ['id'],
    valid: value => isId(value.id),
    backupVersion: FRESQUE_BACKUP_VERSION,
  },
  'save-session': {
    fields: ['id', 'title', 'date', 'resumeSceneId', 'confirmedSceneIds', 'privateSummary', 'nextSession', 'chronicle'],
    valid: validSession,
    backupVersion: SESSION_BACKUP_VERSION,
  },
  'set-chronicle-approval': {
    fields: ['id', 'approved'],
    valid: value => isId(value.id) && typeof value.approved === 'boolean',
    backupVersion: SESSION_BACKUP_VERSION,
  },
  'save-fresque-marker': {
    fields: markerFields,
    valid: validFresqueMarker,
    backupVersion: MARKER_BACKUP_VERSION,
  },
  'remove-fresque-marker': {
    fields: ['id'],
    valid: value => isId(value.id),
    backupVersion: MARKER_BACKUP_VERSION,
  },
  'copy-library-marker': {
    fields: [...markerFields, 'provenance'],
    valid: validLibraryMarkerCopy,
    backupVersion: LIBRARY_BACKUP_VERSION,
  },
  'record-play-action': {
    fields: playActionFields,
    valid: value => value.mode !== 'opposition' && validPlayAction(value) && (value.roll === null || exactKeys(value.roll, rollFields)),
    backupVersion: PLAY_BACKUP_VERSION,
  },
  'record-opposition': {
    fields: [...playActionFields, 'applyDamage'],
    valid: value => value.mode === 'opposition' && validActionFields(value) && exactKeys(value.roll, oppositionRollFields) &&
      validOppositionRoll(value.roll) && typeof value.applyDamage === 'boolean',
    backupVersion: OPPOSITION_BACKUP_VERSION,
  },
};

function validateCommand(command) {
  checkJSON(command);
  if (!exactKeys(command, ['id', 'operationId', 'expectedRevision', 'type', 'data'])) {
    fail('invalid-command', 'Cette opération est incomplète.');
  }
  const { id, operationId, expectedRevision, type, data } = command;
  if (!isId(id) || !isId(operationId) || typeof type !== 'string' || !Object.hasOwn(operations, type) ||
      !Number.isSafeInteger(expectedRevision) || (type === 'create' ? expectedRevision !== 0 : expectedRevision < 1) ||
      !exactKeys(data, operations[type].fields) || !operations[type].valid(data)) {
    fail('invalid-command', 'Vérifiez les champs de cette opération.');
  }
}

function validateCampaign(campaign) {
  if (!isRecord(campaign) || !isId(campaign.id) || !Number.isSafeInteger(campaign.revision) || campaign.revision < 1 ||
      !validCampaignInfo(campaign) || !Array.isArray(campaign.characters) || !campaign.characters.every(validCharacter) ||
      !Array.isArray(campaign.creatures) || !campaign.creatures.every(creature => validCreatureInfo(creature) && validSource(creature.source)) ||
      !Array.isArray(campaign.scenes) || !campaign.scenes.every(validScene)) {
    fail('invalid-data', 'La campagne ne correspond pas au format du Studio.');
  }
  const participantIds = new Set();
  const sceneIds = new Set();
  const lanes = Object.hasOwn(campaign, FRESQUE_LANES_KEY) ? campaign[FRESQUE_LANES_KEY] : [];
  if (!Array.isArray(lanes) || lanes.length > FRESQUE_LANE_LIMIT || !lanes.every(lane =>
    exactKeys(lane, ['id', 'name']) && operations['save-fresque-lane'].valid(lane))) {
    fail('invalid-data', 'Les couloirs de la Fresque sont invalides ou trop nombreux.');
  }
  const laneIds = new Set(lanes.map(lane => lane.id));
  if (laneIds.size !== lanes.length) fail('invalid-data', 'Deux couloirs ont le même identifiant.');
  for (const item of [...campaign.characters, ...campaign.creatures]) {
    if (participantIds.has(item.id)) fail('foreign-key', 'Deux participants ont le même identifiant.');
    participantIds.add(item.id);
  }
  for (const character of campaign.characters) {
    if (Object.hasOwn(character, BESTIARY_PROFILE_KEY) || (Object.hasOwn(character, PJ_SOURCE_KEY) &&
        (!validPJSource(character[PJ_SOURCE_KEY]) || character.level !== character[PJ_SOURCE_KEY].level))) {
      fail('invalid-data', 'Une fiche PJ M02 est incohérente.');
    }
  }
  for (const creature of campaign.creatures) {
    if (Object.hasOwn(creature, PJ_SOURCE_KEY) ||
        (Object.hasOwn(creature, BESTIARY_PROFILE_KEY) && !validBestiarySource(creature.source, creature[BESTIARY_PROFILE_KEY]))) {
      fail('invalid-data', 'Un profil de Bestiaire ne correspond pas à sa référence M03.');
    }
  }
  for (const scene of campaign.scenes) {
    if (sceneIds.has(scene.id) || participantIds.has(scene.id)) {
      fail('foreign-key', 'Deux fiches de la campagne ont le même identifiant.');
    }
    sceneIds.add(scene.id);
    if (new Set(scene.participantIds).size !== scene.participantIds.length ||
        scene.participantIds.some(id => !participantIds.has(id))) {
      fail('foreign-key', 'Les participants doivent appartenir à la campagne et être uniques dans la scène.');
    }
    if (Object.hasOwn(scene, SCENE_AMBIANCES_KEY)) validateSceneAmbiances(scene[SCENE_AMBIANCES_KEY]);
    if (Object.hasOwn(scene, FRESQUE_LANE_KEY) && !laneIds.has(scene[FRESQUE_LANE_KEY])) {
      fail('foreign-key', 'Un couloir de scène doit appartenir à la campagne.');
    }
  }
  if (sceneIds.size === 0 ? campaign.activeSceneId !== null : !sceneIds.has(campaign.activeSceneId)) {
    fail('foreign-key', 'La scène active doit appartenir à la campagne.');
  }
  if (Object.hasOwn(campaign, FRESQUE_LINKS_KEY)) {
    validateSceneLinks(campaign[FRESQUE_LINKS_KEY], sceneIds, participantIds);
  }
  if (Object.hasOwn(campaign, SESSION_ARCHIVES_KEY)) {
    validateSessions(campaign[SESSION_ARCHIVES_KEY], sceneIds);
  }
  if (Object.hasOwn(campaign, INTERLUDES_KEY)) validateInterludes(campaign[INTERLUDES_KEY], sceneIds);
  if (Object.hasOwn(campaign, FRESQUE_MARKERS_KEY)) {
    validateFresqueMarkers(campaign[FRESQUE_MARKERS_KEY], sceneIds);
  }
  if (Object.hasOwn(campaign, PLAY_ACTIONS_KEY)) validatePlayActions(campaign, sceneIds);
  let creations;
  if (Object.hasOwn(campaign, CREATIONS_KEY)) {
    creations = validateCreations(campaign[CREATIONS_KEY], new Set([...participantIds, ...sceneIds,
      ...(campaign[FRESQUE_MARKERS_KEY] ?? []).map(marker => marker.id)]));
  }
  if (Object.hasOwn(campaign, LINKED_IMAGES_KEY)) {
    validateLinkedImages(campaign[LINKED_IMAGES_KEY], new Set([...participantIds, ...(creations?.keys() ?? [])]),
      new Set([...sceneIds, ...(campaign[FRESQUE_MARKERS_KEY] ?? []).map(marker => marker.id)]));
  }
  for (const scene of campaign.scenes) {
    if (!Object.hasOwn(scene, ADVENTURE_SCENE_KEY)) continue;
    const source = scene[ADVENTURE_SCENE_KEY];
    if (!exactKeys(source, ['adventureId', 'referenceIds']) || !isId(source.adventureId) ||
        creations?.get(source.adventureId)?.kind !== 'adventure' || !validAdventureReferences(source.referenceIds) ||
        source.referenceIds.some(id => id === source.adventureId || (id.startsWith('creation-') && !creations.has(id)))) {
      fail('foreign-key', 'L’aventure et les fiches privées de la scène doivent appartenir à la campagne.');
    }
  }
}

function validateLinkedImages(images, targets, reserved) {
  if (!Array.isArray(images)) fail('invalid-data', 'Les images liées sont illisibles.');
  const ids = new Set();
  const illustrated = new Set();
  for (const image of images) {
    if (!exactKeys(image, linkedImageFields) || !validLinkedImage(image)) fail('invalid-data', 'Un lien d’image est invalide.');
    if (ids.has(image.id) || targets.has(image.id) || reserved.has(image.id)) fail('conflict', 'Cet identifiant d’image est déjà utilisé.');
    ids.add(image.id);
    if (image.targetId === null) continue;
    if (!targets.has(image.targetId)) fail('foreign-key', 'La fiche illustrée doit appartenir à la campagne.');
    if (illustrated.has(image.targetId)) fail('conflict', 'Cette fiche possède déjà une image liée.');
    illustrated.add(image.targetId);
  }
}

function validatePlayActions(campaign, sceneIds) {
  const actions = campaign[PLAY_ACTIONS_KEY];
  if (!Array.isArray(actions)) fail('invalid-data', 'Le journal de jeu est illisible.');
  const ids = new Set();
  const hitPoints = new Map([...campaign.characters, ...campaign.creatures].map(actor => [actor.id, initialHitPoints(actor)]));
  for (const action of actions) {
    if (!validPlayAction(action)) fail('invalid-data', 'Une action ne correspond pas au format du journal de jeu.');
    if (!sceneIds.has(action.sceneId)) fail('foreign-key', 'La scène de cette action doit appartenir à la campagne.');
    if (ids.has(action.id)) fail('conflict', 'Deux actions du journal ont le même identifiant.');
    ids.add(action.id);
    if (action.mode !== 'opposition') continue;
    const { targetId } = action.roll;
    const hp = hitPoints.get(targetId);
    if (hp === undefined) fail('foreign-key', 'La cible doit avoir un profil 5d6 dans cette campagne.');
    const { hpBefore, hpAfter, damage } = action.combat;
    if (hpBefore !== hp || (hpAfter !== hp && hpAfter !== hitPointsAfterDamage(hp, damage))) {
      fail('invalid-data', 'La suite des PV dans le journal des oppositions est incohérente.');
    }
    hitPoints.set(targetId, hpAfter);
  }
}

function validateFresqueMarkers(markers, sceneIds) {
  if (!Array.isArray(markers)) fail('invalid-data', 'Les repères de la Fresque sont illisibles.');
  const ids = new Set();
  for (const marker of markers) {
    if (!validFresqueMarker(marker)) fail('invalid-data', 'Un repère ne correspond pas au format de la Fresque.');
    if (Object.hasOwn(marker, FRESQUE_REFERENCE_KEY) && !validLibraryProvenance(marker[FRESQUE_REFERENCE_KEY])) {
      fail('invalid-data', 'La provenance d’un repère ne correspond pas au format de la bibliothèque.');
    }
    if (ids.has(marker.id)) fail('conflict', 'Deux repères de la Fresque ont le même identifiant.');
    ids.add(marker.id);
    if (marker.sceneId !== null && !sceneIds.has(marker.sceneId)) {
      fail('foreign-key', 'La scène du repère doit appartenir à la campagne.');
    }
  }
}

function validateInterludes(interludes, sceneIds) {
  if (!Array.isArray(interludes)) fail('invalid-data', 'Les interludes de campagne sont illisibles.');
  const ids = new Set();
  for (const interlude of interludes) {
    if (!exactKeys(interlude, [...interludeFields, 'result']) || !validInterlude(interlude) ||
        (interlude.result !== null && (!exactKeys(interlude.result, ['date', 'notes']) || !validInterludeResult(interlude.result)))) {
      fail('invalid-data', 'Un interlude ne correspond pas au format du Studio.');
    }
    if (ids.has(interlude.id)) fail('conflict', 'Deux interludes ont le même identifiant.');
    if (interlude.afterSceneId !== null && !sceneIds.has(interlude.afterSceneId)) {
      fail('foreign-key', 'La scène de cet interlude doit appartenir à la campagne.');
    }
    ids.add(interlude.id);
  }
}

function validateSessions(sessions, sceneIds) {
  if (!Array.isArray(sessions)) fail('invalid-data', 'Les archives de séance sont illisibles.');
  const ids = new Set();
  for (const session of sessions) {
    if (!validSession(session) || typeof session.chronicleApproved !== 'boolean' ||
        (session.chronicleApproved && !session.chronicle.trim())) {
      fail('invalid-data', 'Une archive de séance ne correspond pas au format du Studio.');
    }
    if (ids.has(session.id)) fail('conflict', 'Deux archives de séance ont le même identifiant.');
    ids.add(session.id);
    if ((session.resumeSceneId !== null && !sceneIds.has(session.resumeSceneId)) ||
        new Set(session.confirmedSceneIds).size !== session.confirmedSceneIds.length ||
        session.confirmedSceneIds.some(id => !sceneIds.has(id))) {
      fail('foreign-key', 'Les scènes de l’archive doivent appartenir à la campagne et être uniques.');
    }
  }
}

function validateSceneLinks(links, sceneIds, participantIds) {
  if (!Array.isArray(links) || !links.every(validSceneLink)) {
    fail('invalid-data', 'Les liens de la Fresque ne correspondent pas au format du Studio.');
  }
  const linkIds = new Set();
  const connections = new Set();
  for (const { id, fromId, toId, label } of links) {
    if (fromId === toId || !sceneIds.has(fromId) || !sceneIds.has(toId)) {
      fail('foreign-key', 'Un lien doit relier deux scènes différentes de la même campagne.');
    }
    if (linkIds.has(id) || sceneIds.has(id) || participantIds.has(id)) {
      fail('conflict', 'Cet identifiant de lien est déjà utilisé dans la campagne.');
    }
    const connection = JSON.stringify([fromId, toId, label]);
    if (connections.has(connection)) fail('conflict', 'Ce lien existe déjà entre ces scènes.');
    linkIds.add(id);
    connections.add(connection);
  }
}

function validatePayload(payload) {
  checkJSON(payload);
  if (!exactKeys(payload, ['campaign', 'journal']) || !Array.isArray(payload.journal)) {
    fail('invalid-backup', 'La sauvegarde contient une structure inconnue.');
  }
  const { campaign, journal } = payload;
  validateCampaign(campaign);
  if (journal.length !== campaign.revision) fail('invalid-journal', 'Le journal et la campagne ont des révisions différentes.');
  const operationIds = new Set();
  for (const [index, event] of journal.entries()) {
    if (!exactKeys(event, ['operationId', 'revision', 'type', 'signature']) ||
        !isId(event.operationId) || operationIds.has(event.operationId) || event.revision !== index + 1 ||
        typeof event.type !== 'string' || !Object.hasOwn(operations, event.type) ||
        (event.type === 'create') !== (index === 0) ||
        typeof event.signature !== 'string' || !digestPattern.test(event.signature)) {
      fail('invalid-journal', 'Le journal de cette campagne est incohérent.');
    }
    operationIds.add(event.operationId);
  }
  const oppositions = campaign[PLAY_ACTIONS_KEY]?.filter(action => action.mode === 'opposition').length ?? 0;
  if (journal.filter(event => event.type === 'record-opposition').length !== oppositions) {
    fail('invalid-journal', 'Les oppositions et leurs opérations de sauvegarde ne correspondent pas.');
  }
  const adventures = new Set(campaign.scenes.map(scene => scene[ADVENTURE_SCENE_KEY]?.adventureId).filter(Boolean));
  const imported = (campaign[CREATIONS_KEY] ?? []).filter(entry => Object.hasOwn(entry, ADVENTURE_SOURCE_KEY));
  const imports = journal.filter(event => event.type === 'import-adventure').length;
  if (journal.filter(event => event.type === 'plan-adventure').length + imports !== adventures.size ||
      imports !== imported.length || imported.some(entry => !adventures.has(entry.id))) {
    fail('invalid-journal', 'Les aventures préparées et leurs opérations de sauvegarde ne correspondent pas.');
  }
}

function backupVersionFor({ campaign, journal }) {
  let version = LEGACY_BACKUP_VERSION;
  if (Object.hasOwn(campaign, FRESQUE_LINKS_KEY)) version = FRESQUE_BACKUP_VERSION;
  if (Object.hasOwn(campaign, SESSION_ARCHIVES_KEY)) version = SESSION_BACKUP_VERSION;
  if (Object.hasOwn(campaign, FRESQUE_MARKERS_KEY)) version = MARKER_BACKUP_VERSION;
  if (campaign[FRESQUE_MARKERS_KEY]?.some(marker => Object.hasOwn(marker, FRESQUE_REFERENCE_KEY))) version = LIBRARY_BACKUP_VERSION;
  if (Object.hasOwn(campaign, PLAY_ACTIONS_KEY)) version = PLAY_BACKUP_VERSION;
  if (campaign.creatures.some(creature => Object.hasOwn(creature, BESTIARY_PROFILE_KEY))) version = BESTIARY_BACKUP_VERSION;
  if (campaign.characters.some(character => Object.hasOwn(character, PJ_SOURCE_KEY))) version = PJ_BACKUP_VERSION;
  if (Object.hasOwn(campaign, CREATIONS_KEY)) version = CREATION_BACKUP_VERSION;
  if (campaign.scenes.some(scene => Object.hasOwn(scene, ADVENTURE_SCENE_KEY))) version = ADVENTURE_BACKUP_VERSION;
  if (campaign.scenes.some(scene => Object.hasOwn(scene, SCENE_AMBIANCES_KEY))) version = AMBIANCE_BACKUP_VERSION;
  if (Object.hasOwn(campaign, FRESQUE_LANES_KEY)) version = LANE_BACKUP_VERSION;
  if (Object.hasOwn(campaign, INTERLUDES_KEY)) version = INTERLUDE_BACKUP_VERSION;
  if (Object.hasOwn(campaign, LINKED_IMAGES_KEY)) version = LINKED_IMAGE_BACKUP_VERSION;
  if (campaign[CREATIONS_KEY]?.some(entry => Object.hasOwn(entry, ADVENTURE_SOURCE_KEY))) version = ADVENTURE_PACKAGE_BACKUP_VERSION;
  return journal.reduce((minimum, event) => Math.max(minimum, operations[event.type].backupVersion ?? LEGACY_BACKUP_VERSION), version);
}

function payloadText(payload) {
  const text = JSON.stringify(payload);
  if (encoder.encode(text).length > MAX_BACKUP_BYTES - 512) {
    fail('limit', 'La campagne dépasse la taille prise en charge par cette version du Studio.');
  }
  return text;
}

function upsert(items, data) {
  const existing = items.find(item => item.id === data.id);
  if (existing) Object.assign(existing, data);
  else items.push(data);
}

function moveScene(scenes, { id, direction }) {
  const index = scenes.findIndex(scene => scene.id === id);
  if (index === -1) fail('foreign-key', 'Cette scène ne fait pas partie de la campagne.');
  const destination = index + (direction === 'left' ? -1 : 1);
  if (destination < 0 || destination >= scenes.length) {
    fail('invalid-command', 'La scène est déjà au bord de la Fresque dans cette direction.');
  }
  [scenes[index], scenes[destination]] = [scenes[destination], scenes[index]];
}

function recordOpposition(campaign, data, resolveOpposition) {
  const { applyDamage, ...action } = data;
  const target = [...campaign.characters, ...campaign.creatures].find(actor => actor.id === action.roll.targetId);
  const scene = campaign.scenes.find(scene => scene.id === action.sceneId);
  const card = combatProfile(target);
  if (!card || !scene.participantIds.includes(target.id)) {
    fail('foreign-key', 'La cible doit avoir un profil 5d6 et participer à la scène courante.');
  }
  const hpBefore = currentHitPoints(campaign, target);
  const { damage } = resolveOpposition(action.roll, card);
  if (applyDamage && (!damage || !hpBefore)) fail('invalid-command', 'Il n’y a aucun dégât à appliquer à cette cible.');
  const hpAfter = applyDamage ? hitPointsAfterDamage(hpBefore, damage) : hpBefore;
  return { ...action, combat: { targetName: target.name, damage, hpBefore, hpAfter } };
}

function planAdventure(campaign, { adventureId, chain, scenes }) {
  const adventure = campaign[CREATIONS_KEY]?.find(entry => entry.id === adventureId && entry.kind === 'adventure');
  if (!adventure) fail('foreign-key', 'Choisissez une aventure de cette campagne.');
  if (campaign.scenes.some(scene => scene[ADVENTURE_SCENE_KEY]?.adventureId === adventureId)) {
    fail('already-planned', 'Cette aventure figure déjà dans la Fresque.');
  }
  for (const { referenceIds, ...scene } of scenes) {
    if (referenceIds.some(id => !adventure.links.includes(id))) {
      fail('foreign-key', 'Les fiches choisies doivent être reliées à l’aventure.');
    }
    campaign.scenes.push({ ...scene, participantIds: [], [ADVENTURE_SCENE_KEY]: { adventureId, referenceIds } });
  }
  if (chain && scenes.length > 1) {
    const links = campaign[FRESQUE_LINKS_KEY] ??= [];
    for (const [index, { id }] of scenes.slice(1).entries()) {
      links.push({ id: `suite-${id}`, fromId: scenes[index].id, toId: id, label: 'Suite de l’aventure' });
    }
  }
  campaign.activeSceneId ??= scenes[0].id;
}

function importAdventure(campaign, { source, adventureId, creations, scenes, links }) {
  if (importedAdventure(campaign, source.id)) fail('conflict', 'Cette aventure est déjà importée dans cette campagne.');
  const entries = campaign[CREATIONS_KEY] ??= [];
  entries.push(...creations.map(entry => entry.id === adventureId ? { ...entry, [ADVENTURE_SOURCE_KEY]: source } : entry));
  planAdventure(campaign, { adventureId, chain: false, scenes });
  if (links.length) (campaign[FRESQUE_LINKS_KEY] ??= []).push(...links);
}

function applyCommand(previous, { id, type, data }, resolveOpposition) {
  if (type === 'create') {
    return { id, revision: 1, ...data, characters: [], creatures: [], scenes: [], activeSceneId: null };
  }

  const campaign = structuredClone(previous);
  switch (type) {
    case 'import-adventure':
      importAdventure(campaign, data.bundle);
      break;
    case 'plan-adventure':
      planAdventure(campaign, data);
      break;
    case 'save-creation': {
      const entries = campaign[CREATIONS_KEY] ??= [];
      const existing = entries.find(entry => entry.id === data.id);
      if (existing && existing.kind !== data.kind) fail('invalid-command', 'Le type d’une création enregistrée est fixe.');
      upsert(entries, data);
      break;
    }
    case 'save-linked-image':
      upsert(campaign[LINKED_IMAGES_KEY] ??= [], data);
      break;
    case 'remove-linked-image': {
      const images = campaign[LINKED_IMAGES_KEY];
      const index = images?.findIndex(image => image.id === data.id) ?? -1;
      if (index === -1) fail('foreign-key', 'Cette image ne fait pas partie de la campagne.');
      images.splice(index, 1);
      if (!images.length) delete campaign[LINKED_IMAGES_KEY];
      break;
    }
    case 'save-character': {
      const source = campaign.characters.find(character => character.id === data.id)?.[PJ_SOURCE_KEY];
      if (source && source.level !== data.level) fail('invalid-command', 'Le niveau vient de la fiche M02 importée.');
      upsert(campaign.characters, data);
      break;
    }
    case 'attach-pj-source': {
      const character = campaign.characters.find(character => character.id === data.id);
      if (data.attach ? !character || Object.hasOwn(character, PJ_SOURCE_KEY) : character) {
        fail('conflict', 'Choisissez un nouveau PJ ou un PJ narratif sans fiche M02.');
      }
      upsert(campaign.characters, {
        id: data.id, name: character?.name ?? data.source.name.trim(), notes: character?.notes ?? '',
        level: data.source.level, [PJ_SOURCE_KEY]: data.source,
      });
      break;
    }
    case 'copy-creature':
    case 'save-bestiary-profile': {
      if (campaign.creatures.some(creature => creature.id === data.id)) {
        fail('conflict', 'Une créature porte déjà cet identifiant dans la campagne.');
      }
      if (type === 'save-bestiary-profile') {
        const { profile, ...creature } = data;
        campaign.creatures.push({ ...creature, [BESTIARY_PROFILE_KEY]: profile });
      } else campaign.creatures.push(data);
      break;
    }
    case 'save-creature': {
      const creature = campaign.creatures.find(item => item.id === data.id);
      if (!creature) fail('foreign-key', 'Cette créature ne fait pas partie de la campagne.');
      Object.assign(creature, data);
      break;
    }
    case 'save-scene':
      upsert(campaign.scenes, data);
      if (campaign.activeSceneId === null) campaign.activeSceneId = data.id;
      break;
    case 'save-interlude': {
      const interludes = campaign[INTERLUDES_KEY] ??= [];
      if (interludes.some(entry => entry.id === data.id && entry.result)) {
        fail('conflict', 'La préparation d’un interlude consigné est conservée dans le journal.');
      }
      upsert(interludes, { ...data, result: null });
      break;
    }
    case 'remove-interlude': {
      const interludes = campaign[INTERLUDES_KEY];
      const index = interludes?.findIndex(entry => entry.id === data.id && entry.result === null) ?? -1;
      if (index === -1) fail('foreign-key', 'Cet interlude à jouer est introuvable.');
      interludes.splice(index, 1);
      if (!interludes.length) delete campaign[INTERLUDES_KEY];
      break;
    }
    case 'record-interlude': {
      const interlude = campaign[INTERLUDES_KEY]?.find(entry => entry.id === data.id);
      if (!interlude) fail('foreign-key', 'Cet interlude ne fait pas partie de la campagne.');
      interlude.result = { date: data.date, notes: data.notes };
      break;
    }
    case 'save-fresque-lane':
      upsert(campaign[FRESQUE_LANES_KEY] ??= [], data);
      break;
    case 'remove-fresque-lane': {
      const lanes = campaign[FRESQUE_LANES_KEY];
      const index = lanes?.findIndex(lane => lane.id === data.id) ?? -1;
      if (index === -1) fail('foreign-key', 'Ce couloir ne fait pas partie de la campagne.');
      lanes.splice(index, 1);
      if (!lanes.length) delete campaign[FRESQUE_LANES_KEY];
      for (const scene of campaign.scenes) {
        if (scene[FRESQUE_LANE_KEY] === data.id) delete scene[FRESQUE_LANE_KEY];
      }
      break;
    }
    case 'set-scene-lane': {
      const scene = campaign.scenes.find(item => item.id === data.sceneId);
      if (!scene) fail('foreign-key', 'Cette scène ne fait pas partie de la campagne.');
      if (data.laneId === null) delete scene[FRESQUE_LANE_KEY];
      else scene[FRESQUE_LANE_KEY] = data.laneId;
      break;
    }
    case 'save-scene-ambiance':
    case 'remove-scene-ambiance': {
      const { sceneId, ...ambiance } = data;
      const scene = campaign.scenes.find(item => item.id === sceneId);
      if (!scene) fail('foreign-key', 'Cette scène ne fait pas partie de la campagne.');
      if (type === 'save-scene-ambiance') {
        upsert(scene[SCENE_AMBIANCES_KEY] ??= [], ambiance);
      } else {
        const entries = scene[SCENE_AMBIANCES_KEY];
        const index = entries?.findIndex(item => item.id === ambiance.id) ?? -1;
        if (index === -1) fail('foreign-key', 'Cette ambiance ne fait pas partie de la scène.');
        entries.splice(index, 1);
        if (!entries.length) delete scene[SCENE_AMBIANCES_KEY];
      }
      break;
    }
    case 'select-scene':
      campaign.activeSceneId = data.id;
      break;
    case 'improvise-scene': {
      const { activate, ...scene } = data;
      if (campaign.scenes.some(item => item.id === scene.id)) {
        fail('conflict', 'Une scène porte déjà cet identifiant dans la campagne.');
      }
      campaign.scenes.push(scene);
      if (activate || campaign.activeSceneId === null) campaign.activeSceneId = scene.id;
      break;
    }
    case 'move-scene':
      moveScene(campaign.scenes, data);
      break;
    case 'add-scene-link':
      (campaign[FRESQUE_LINKS_KEY] ??= []).push(data);
      break;
    case 'remove-scene-link': {
      const links = campaign[FRESQUE_LINKS_KEY];
      const index = links?.findIndex(link => link.id === data.id) ?? -1;
      if (index === -1) fail('foreign-key', 'Ce lien ne fait pas partie de la campagne.');
      links.splice(index, 1);
      break;
    }
    case 'save-session': {
      const sessions = campaign[SESSION_ARCHIVES_KEY] ??= [];
      const previousSession = sessions.find(session => session.id === data.id);
      const chronicleApproved = previousSession?.chronicleApproved === true && previousSession.chronicle === data.chronicle;
      upsert(sessions, { ...data, chronicleApproved });
      break;
    }
    case 'set-chronicle-approval': {
      const session = campaign[SESSION_ARCHIVES_KEY]?.find(entry => entry.id === data.id);
      if (!session) fail('foreign-key', 'Cette archive de séance ne fait pas partie de la campagne.');
      if (data.approved && !session.chronicle.trim()) {
        fail('invalid-command', 'Ajoutez un texte avant d’approuver la chronique.');
      }
      session.chronicleApproved = data.approved;
      break;
    }
    case 'save-fresque-marker':
      upsert(campaign[FRESQUE_MARKERS_KEY] ??= [], data);
      break;
    case 'copy-library-marker': {
      const { provenance, ...marker } = data;
      const markers = campaign[FRESQUE_MARKERS_KEY] ??= [];
      if (markers.some(entry => entry.id === marker.id)) {
        fail('conflict', 'Cet identifiant de repère existe déjà dans la campagne.');
      }
      markers.push({ ...marker, [FRESQUE_REFERENCE_KEY]: provenance });
      break;
    }
    case 'remove-fresque-marker': {
      const markers = campaign[FRESQUE_MARKERS_KEY];
      const index = markers?.findIndex(marker => marker.id === data.id) ?? -1;
      if (index === -1) fail('foreign-key', 'Ce repère ne fait pas partie de la campagne.');
      markers.splice(index, 1);
      break;
    }
    case 'record-play-action':
    case 'record-opposition': {
      if (data.sceneId !== campaign.activeSceneId) fail('foreign-key', 'Consignez cette action dans la scène courante.');
      const actions = campaign[PLAY_ACTIONS_KEY] ??= [];
      if (actions.some(action => action.id === data.id)) fail('conflict', 'Cette action figure déjà dans le journal.');
      actions.push(type === 'record-opposition' ? recordOpposition(campaign, data, resolveOpposition) : data);
      break;
    }
  }
  campaign.revision += 1;
  return campaign;
}

async function sha256(text) {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(text));
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

function orderedJSON(value) {
  if (Array.isArray(value)) return value.map(orderedJSON);
  if (isRecord(value)) return Object.fromEntries(Object.keys(value).sort().map(key => [key, orderedJSON(value[key])]));
  return value;
}

function commandSignature({ id, type, data, expectedRevision }) {
  const { fields } = operations[type];
  const values = fields.map(key => {
    if (['copy-creature', 'save-bestiary-profile'].includes(type) && key === 'source') return [data.source.id, data.source.version];
    if (type === 'save-bestiary-profile' && key === 'profile') return orderedJSON(data.profile);
    if (type === 'attach-pj-source' && key === 'source') return orderedJSON(data.source);
    if (type === 'save-creation' && key === 'details') return orderedJSON(data.details);
    if (type === 'plan-adventure' && key === 'scenes') return orderedJSON(data.scenes);
    if (type === 'import-adventure') return orderedJSON(data.bundle);
    if (type === 'copy-library-marker' && key === 'provenance') {
      const { sourceSchema, sourceId, sourceVersion, sourceCampaignId } = data.provenance;
      return [sourceSchema, sourceId, sourceVersion, sourceCampaignId];
    }
    if (type === 'record-play-action' && key === 'roll' && data.roll) return rollFields.map(field => data.roll[field]);
    if (type === 'record-opposition' && key === 'roll') return oppositionRollFields.map(field => data.roll[field]);
    return data[key];
  });
  return sha256(JSON.stringify([id, expectedRevision, type, values]));
}

async function loadOppositionRules() {
  try { return await import('./opposition.mjs'); }
  catch { fail('rules-unavailable', 'Le moteur M03 est nécessaire pour vérifier cette opposition.'); }
}

async function checkPJBuilds(sources) {
  if (!sources.length) return;
  const { evaluatePJ } = await import('./pj-m02.mjs');
  if (sources.some(source => !evaluatePJ(source).valid)) {
    fail('invalid-data', 'Le budget ou les capacités d’une fiche PJ doivent être vérifiés dans l’Atelier M02.');
  }
}

function storageError(error) {
  if (error instanceof StudioError) return error;
  if (error?.name === 'QuotaExceededError') {
    return new StudioError('quota', 'Le navigateur n’a plus assez d’espace pour sauvegarder.', { cause: error });
  }
  if (error?.name === 'VersionError') {
    return new StudioError('storage-version', 'Ce profil contient une version plus récente du Studio.', { cause: error });
  }
  return new StudioError('storage', 'Le navigateur n’a pas confirmé l’accès au stockage du Studio.', { cause: error });
}

function openDatabase(name) {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB || !globalThis.crypto?.subtle) {
      reject(new StudioError('storage', 'Ouvrez le Studio sur localhost dans un navigateur compatible avec IndexedDB.'));
      return;
    }
    const request = indexedDB.open(name, DATABASE_VERSION);
    let blocked = false;
    request.onupgradeneeded = () => request.result.createObjectStore('campaigns', { keyPath: 'id' });
    request.onblocked = () => {
      blocked = true;
      reject(new StudioError('storage', 'Un autre onglet bloque l’ouverture du stockage. Fermez-le puis réessayez.'));
    };
    request.onerror = () => reject(storageError(request.error));
    request.onsuccess = () => {
      if (blocked) request.result.close();
      else resolve(request.result);
    };
  });
}

export async function openStudioStore({ name = DATABASE, injectFailure } = {}) {
  const db = await openDatabase(name);
  const approvedPreviews = new WeakMap();
  let closed = false;
  const close = () => {
    closed = true;
    db.close();
  };
  db.onversionchange = close;
  db.onclose = () => { closed = true; };

  function transact(mode, work) {
    return new Promise((resolve, reject) => {
      if (closed) {
        reject(new StudioError('storage', 'Le stockage du Studio est fermé. Rechargez la page.'));
        return;
      }
      let transaction;
      let result;
      let error;
      try {
        transaction = db.transaction('campaigns', mode, { durability: 'strict' });
        const store = transaction.objectStore('campaigns');
        transaction.oncomplete = () => resolve(result);
        transaction.onabort = () => reject(error ?? storageError(transaction.error));
        const setResult = value => { result = value; };
        const read = (request, callback) => {
          request.onsuccess = () => {
            try { callback(request.result); }
            catch (problem) {
              error = problem;
              transaction.abort();
            }
          };
        };
        work(store, read, setResult);
      } catch (problem) {
        error = storageError(problem);
        if (transaction) transaction.abort();
        else reject(error);
      }
    });
  }

  function readPayload(row, id) {
    if (row === undefined) return null;
    if (!exactKeys(row, ['id', 'payload']) || row.id !== id || row.payload?.campaign?.id !== id) {
      fail('foreign-key', 'Une donnée étrangère occupe cet emplacement. Elle a été conservée.');
    }
    validatePayload(row.payload);
    return row.payload;
  }

  function snapshot(id) {
    if (!isId(id)) fail('foreign-key', 'Identifiant de campagne invalide.');
    return transact('readonly', (store, read, result) => {
      read(store.get(id), row => result(readPayload(row, id)));
    });
  }

  function readCampaignInventory(allowUnreadable) {
    return transact('readonly', (store, read, result) => {
      read(store.getAll(), rows => {
        const campaigns = [];
        let unreadableCount = 0;
        for (const row of rows) {
          try {
            campaigns.push(readPayload(row, row?.id).campaign);
          } catch (error) {
            if (!allowUnreadable || !(error instanceof StudioError)) throw error;
            unreadableCount++;
          }
        }
        campaigns.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        result({ campaigns, unreadableCount });
      });
    });
  }

  async function list() {
    return (await readCampaignInventory(false)).campaigns;
  }

  function listRecoverable() {
    return readCampaignInventory(true);
  }

  async function get(id) {
    return (await snapshot(id))?.campaign ?? null;
  }

  async function execute(command) {
    validateCommand(command);
    const input = structuredClone(command);
    const { id, operationId, expectedRevision, type } = input;
    const rules = type === 'record-opposition' ? await loadOppositionRules() : undefined;
    if (type === 'attach-pj-source') await checkPJBuilds([input.data.source]);
    const signature = await commandSignature(input);
    let wrote = false;
    const campaign = await transact('readwrite', (store, read, result) => {
      read(store.get(id), row => {
        const previous = readPayload(row, id);
        const duplicate = previous?.journal.find(event => event.operationId === operationId);
        if (duplicate) {
          if (duplicate.signature !== signature) fail('conflict', 'Cet identifiant a déjà servi pour une autre opération.');
          result(previous.campaign);
          return;
        }
        if ((previous?.campaign.revision ?? 0) !== expectedRevision) {
          fail('conflict', 'La campagne a changé. Rechargez sa version enregistrée avant de réessayer.');
        }
        const next = applyCommand(previous?.campaign, input, rules?.resolveOpposition);
        const journal = [...(previous?.journal ?? []), { operationId, revision: next.revision, type, signature }];
        const payload = { campaign: next, journal };
        validatePayload(payload);
        payloadText(payload);
        store.put({ id, payload });
        injectFailure?.('before-commit', structuredClone(input));
        wrote = true;
        read(store.get(id), saved => result(readPayload(saved, id).campaign));
      });
    });
    if (wrote) injectFailure?.('after-commit', structuredClone(input));
    return campaign;
  }

  async function exportBackup(id) {
    const payload = await snapshot(id);
    if (!payload) fail('foreign-key', 'Cette campagne est introuvable.');
    const sha = await sha256(payloadText(payload));
    return JSON.stringify({ format: FORMAT, version: backupVersionFor(payload), sha256: sha, payload });
  }

  async function previewBackup(text) {
    if (typeof text !== 'string' || text.length > MAX_BACKUP_BYTES || encoder.encode(text).length > MAX_BACKUP_BYTES) {
      fail('invalid-backup', 'Cette sauvegarde dépasse la taille prise en charge.');
    }
    let archive;
    try { archive = JSON.parse(text); }
    catch { fail('invalid-backup', 'Ce fichier ne contient pas un document JSON valide.'); }
    if (archive?.format !== FORMAT) fail('invalid-backup', 'Ce fichier n’est pas une sauvegarde privée du Studio.');
    if (!Number.isInteger(archive.version) || archive.version < LEGACY_BACKUP_VERSION || archive.version > ADVENTURE_PACKAGE_BACKUP_VERSION) {
      fail('backup-version', 'La version de cette sauvegarde n’est pas prise en charge.');
    }
    if (!exactKeys(archive, ['format', 'version', 'sha256', 'payload']) ||
        typeof archive.sha256 !== 'string' || !digestPattern.test(archive.sha256)) {
      fail('invalid-backup', 'L’enveloppe de cette sauvegarde contient des champs inconnus ou incomplets.');
    }
    validatePayload(archive.payload);
    if (archive.version < backupVersionFor(archive.payload)) {
      fail('backup-version', 'Cette sauvegarde déclare une version incompatible avec ses données.');
    }
    if (await sha256(payloadText(archive.payload)) !== archive.sha256) {
      fail('invalid-backup', 'La sauvegarde a été modifiée ou endommagée.');
    }
    const campaign = archive.payload.campaign;
    const playerSheets = campaign.characters.flatMap(character => character[PJ_SOURCE_KEY] ? [character[PJ_SOURCE_KEY]] : []);
    await checkPJBuilds(playerSheets);
    const oppositions = campaign[PLAY_ACTIONS_KEY]?.filter(action => action.mode === 'opposition') ?? [];
    if (oppositions.length) {
      const { resolveOpposition } = await loadOppositionRules();
      const profiles = new Map([...campaign.characters, ...campaign.creatures].map(actor => [actor.id, combatProfile(actor)]));
      if (oppositions.some(action => resolveOpposition(action.roll, profiles.get(action.roll.targetId)).damage !== action.combat.damage)) {
        fail('invalid-data', 'Un impact enregistré ne correspond pas au moteur M03.');
      }
    }
    const conflict = await transact('readonly', (store, read, result) => {
      read(store.count(campaign.id), count => result(count > 0));
    });
    const preview = Object.freeze({
      id: campaign.id,
      name: campaign.name,
      revision: campaign.revision,
      characters: campaign.characters.length,
      playerSheets: playerSheets.length,
      creations: campaign[CREATIONS_KEY]?.length ?? 0,
      images: campaign[LINKED_IMAGES_KEY]?.length ?? 0,
      creatures: campaign.creatures.length,
      scenes: campaign.scenes.length,
      ambiances: campaign.scenes.reduce((count, scene) => count + (scene[SCENE_AMBIANCES_KEY]?.length ?? 0), 0),
      sessions: campaign[SESSION_ARCHIVES_KEY]?.length ?? 0,
      interludes: campaign[INTERLUDES_KEY]?.length ?? 0,
      markers: campaign[FRESQUE_MARKERS_KEY]?.length ?? 0,
      actions: campaign[PLAY_ACTIONS_KEY]?.length ?? 0,
      oppositions: oppositions.length,
      profiles: campaign.creatures.filter(creature => Object.hasOwn(creature, BESTIARY_PROFILE_KEY)).length,
      conflict,
    });
    approvedPreviews.set(preview, archive.payload);
    return preview;
  }

  async function restoreBackup(preview) {
    const payload = approvedPreviews.get(preview);
    if (!payload) fail('invalid-preview', 'Vérifiez à nouveau le fichier avant de le restaurer.');
    const id = payload.campaign.id;
    const restored = await transact('readwrite', (store, read, result) => {
      read(store.count(id), count => {
        if (count) fail('conflict', 'Cette campagne existe déjà dans le profil. Sa version enregistrée a été conservée.');
        store.add({ id, payload });
        read(store.get(id), saved => result(readPayload(saved, id).campaign));
      });
    });
    approvedPreviews.delete(preview);
    return restored;
  }

  return Object.freeze({ list, listRecoverable, get, execute, exportBackup, previewBackup, restoreBackup, close });
}
