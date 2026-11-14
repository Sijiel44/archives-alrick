import { checkJSON, sha256 } from './store.mjs';
import { validPortrait } from './portraits.mjs';

export const DRAFT_ID = 'creation-pj';
export const DRAFT_MAX_BYTES = 512 * 1024;
const FORMAT = 'chroniques-entre-rives.brouillon-pj';
const sameKeys = (object, keys) => object && typeof object === 'object' && !Array.isArray(object) &&
  Object.keys(object).sort().join(',') === keys.split(',').sort().join(',');
const isId = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(value);

export function checkCreationDraft(snapshot) {
  checkJSON(snapshot);
  if (!sameKeys(snapshot, 'id,fields,customMasteries,portrait,expanded') || !isId(snapshot.id) ||
      !snapshot.fields || typeof snapshot.fields !== 'object' || Array.isArray(snapshot.fields) ||
      Object.keys(snapshot.fields).length > 96 || Object.entries(snapshot.fields).some(([key, value]) =>
        !/^[A-Za-z0-9_-]{1,80}$/.test(key) || typeof value !== 'string' || value.length > 4000) ||
      !['guided', 'free'].includes(snapshot.fields['new-player-mode']) || !validPortrait(snapshot.portrait) ||
      !Array.isArray(snapshot.customMasteries) || snapshot.customMasteries.length > 12 ||
      snapshot.customMasteries.some(entry => !sameKeys(entry, 'name,rank') || typeof entry.name !== 'string' ||
        !entry.name.trim() || entry.name.length > 60 || typeof entry.rank !== 'string' || entry.rank.length > 40) ||
      !Array.isArray(snapshot.expanded) || snapshot.expanded.length > 12 ||
      snapshot.expanded.some(index => !Number.isInteger(index) || index < 0 || index > 11) ||
      new Set(snapshot.expanded).size !== snapshot.expanded.length ||
      new TextEncoder().encode(JSON.stringify(snapshot)).length > DRAFT_MAX_BYTES - 512) {
    throw new Error('Ce brouillon est incomplet, invalide ou trop volumineux. Les données enregistrées sont conservées.');
  }
  return snapshot;
}

export function checkDraftRecord(record) {
  if (!record) return record;
  if (record.id !== DRAFT_ID || record.version !== 1 || !Number.isSafeInteger(record.revision) || record.revision < 1 ||
      !Number.isFinite(record.updatedAt)) throw new Error('Ce brouillon enregistré utilise un format inconnu. Il reste conservé dans ce navigateur.');
  if (record.snapshot !== null) checkCreationDraft(record.snapshot);
  return record;
}

export async function creationDraftBackup(snapshot) {
  checkCreationDraft(snapshot);
  return { format: FORMAT, version: 1, created: new Date().toISOString(),
    payload: snapshot, checksum: await sha256(JSON.stringify(snapshot)) };
}

export async function readCreationDraftFile(text) {
  if (new TextEncoder().encode(text).length > DRAFT_MAX_BYTES) throw new Error('Le brouillon dépasse 512 Kio.');
  const file = JSON.parse(text);
  checkJSON(file);
  if (file?.format !== FORMAT) throw new Error('Choisis un fichier de brouillon PJ. Les fiches terminées s’importent avec « Importer une fiche ».');
  if (file.version !== 1) throw new Error('Cette version de brouillon est inconnue. Le brouillon courant est conservé.');
  if (!sameKeys(file, 'format,version,created,payload,checksum') || typeof file.created !== 'string' ||
      !Number.isFinite(Date.parse(file.created)) || file.checksum !== await sha256(JSON.stringify(file.payload))) {
    throw new Error('Le fichier de brouillon est incomplet ou altéré.');
  }
  checkCreationDraft(file.payload);
  return file;
}
