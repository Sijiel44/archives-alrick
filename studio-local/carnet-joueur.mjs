import { checkJSON, sha256 } from './store.mjs';
import { checkPlayerPayload, playerPayload, PLAYER_NOTEBOOK_LIMIT, MAX_PLAYER_NOTEBOOK_BYTES } from './espace-joueur-store.mjs';

export const PLAYER_NOTEBOOK_FORMAT = 'chroniques-entre-rives.carnet-joueur';
const bytes = value => new TextEncoder().encode(typeof value === 'string' ? value : JSON.stringify(value)).length;
const keys = (value, expected) => value && !Array.isArray(value) && Object.keys(value).sort().join(',') === expected;
const ordered = value => Array.isArray(value) ? value.map(ordered) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])])) : value;
export const playerFingerprint = record => sha256(JSON.stringify(ordered(playerPayload(record))));

function checkEntries(entries) {
  if (!Array.isArray(entries) || !entries.length || entries.length > PLAYER_NOTEBOOK_LIMIT ||
      new Set(entries.map(entry => entry?.sourceId)).size !== entries.length) throw new Error('Le carnet doit contenir de 1 à 100 copies avec des identifiants distincts.');
  for (const entry of entries) {
    if (!keys(entry, 'payload,savedAt,sourceId') || typeof entry.sourceId !== 'string' || !entry.sourceId || entry.sourceId.length > 256 ||
        /[\u0000-\u001f]/u.test(entry.sourceId) || !Number.isSafeInteger(entry.savedAt) || entry.savedAt < 0 || !Number.isFinite(new Date(entry.savedAt).getTime())) {
      throw new Error('Une entrée du carnet est incomplète ou invalide.');
    }
    checkPlayerPayload(entry.payload);
  }
  return entries;
}

export async function playerNotebook(records) {
  const entries = records.map(record => ({ sourceId: record.id, savedAt: record.updatedAt, payload: playerPayload(record) }));
  checkJSON(entries);
  checkEntries(entries);
  const payload = { entries };
  const archive = { format: PLAYER_NOTEBOOK_FORMAT, version: 1, created: new Date().toISOString(), checksum: await sha256(JSON.stringify(payload)), payload };
  checkJSON(archive);
  if (bytes(archive) > MAX_PLAYER_NOTEBOOK_BYTES) throw new Error('Le carnet dépasse 20 Mio. Sélectionne moins de fiches et conserve plusieurs fichiers.');
  return archive;
}

export async function readPlayerNotebook(text) {
  if (bytes(text) > MAX_PLAYER_NOTEBOOK_BYTES) throw new Error('Le carnet dépasse 20 Mio.');
  const archive = JSON.parse(text);
  checkJSON(archive);
  if (!keys(archive, 'checksum,created,format,payload,version') || archive.format !== PLAYER_NOTEBOOK_FORMAT || archive.version !== 1) throw new Error('Ce fichier n’est pas un carnet joueur v1. Pour une fiche seule, utilise « Importer une fiche ».');
  if (typeof archive.created !== 'string' || !Number.isFinite(Date.parse(archive.created)) || new Date(archive.created).toISOString() !== archive.created ||
      !keys(archive.payload, 'entries') || archive.checksum !== await sha256(JSON.stringify(archive.payload))) throw new Error('Le carnet est incomplet ou altéré. Aucune fiche n’a été importée.');
  checkEntries(archive.payload.entries);
  return archive;
}

export async function comparePlayerNotebook(archive, records) {
  const entries = checkEntries(archive.payload.entries);
  const identities = new Set(entries.map(entry => entry.payload.sheet.id));
  const local = await Promise.all(records.filter(record => identities.has(record.sheet.id)).map(async record => ({ record, fingerprint: await playerFingerprint(record) })));
  const seen = new Set();
  const rows = [];
  for (const entry of entries) {
    const fingerprint = await playerFingerprint(entry.payload);
    const related = local.filter(item => item.record.sheet.id === entry.payload.sheet.id);
    const identical = related.filter(item => item.fingerprint === fingerprint).length;
    const repeated = seen.has(fingerprint);
    rows.push({ ...entry, identical, related: related.length, repeated, selected: !identical && !repeated });
    seen.add(fingerprint);
  }
  return rows;
}
