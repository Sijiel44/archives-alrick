export const BACKUP_HISTORY_KEY = 'entre-rives:suivi-sauvegardes:v1';
const MAX_CAMPAIGNS = 100;
const FORMAT = 'chroniques-entre-rives.studio-local';
const record = value => value !== null && typeof value === 'object' &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value));
const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(value);
const revision = value => Number.isSafeInteger(value) && value >= 1;
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const instant = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const receipt = value => record(value) && Object.keys(value).length === 3 &&
  ['revision', 'sha256', 'at'].every(key => Object.hasOwn(value, key)) &&
  revision(value.revision) && hash(value.sha256) && instant(value.at);
const entry = value => record(value) && Object.keys(value).length >= 1 && Object.keys(value).length <= 2 &&
  Object.keys(value).every(key => ['download', 'verified'].includes(key) && receipt(value[key]));
function validEntries(entries) {
  return record(entries) && Object.keys(entries).length <= MAX_CAMPAIGNS &&
    Object.entries(entries).every(([key, value]) => id(key) && entry(value));
}
function targetStorage(storage) {
  const target = storage === undefined ? globalThis.localStorage : storage;
  if (!target || typeof target.getItem !== 'function' || typeof target.setItem !== 'function') throw new Error('Suivi indisponible.');
  return target;
}

export function readBackupHistory(storage) {
  try {
    const raw = targetStorage(storage).getItem(BACKUP_HISTORY_KEY);
    if (raw === null) return { available: true, entries: {} };
    // Une valeur trop grande ou corrompue reste intacte pour ne pas annoncer une écriture réussie.
    if (typeof raw !== 'string' || raw.length > 100000) throw new Error('Historique invalide.');
    const parsed = JSON.parse(raw);
    if (!record(parsed) || Object.keys(parsed).length !== 2 || parsed.version !== 1 || !validEntries(parsed.entries)) {
      throw new Error('Historique invalide.');
    }
    return { available: true, entries: parsed.entries };
  } catch { return { available: false, entries: {} }; }
}

// L’appelant valide un fichier relu avec le Store avant de transmettre kind='verified'.
// Le reçu ne contient que des métadonnées et ne remplace pas cette validation.
// À id/révision égaux, il compare aussi le SHA à l’export de la campagne présente.
// Les appels UI concurrents entre onglets se coordonnent par Web Locks si disponible.
export function recordBackupReceipt(archive, kind, atISO, storage) {
  try {
    if (!['download', 'verified'].includes(kind) || !instant(atISO) || !record(archive) || archive.format !== FORMAT ||
        !revision(archive.version) || !hash(archive.sha256) || !record(archive.payload?.campaign) ||
        !id(archive.payload.campaign.id) || !revision(archive.payload.campaign.revision)) return false;
    const target = targetStorage(storage), history = readBackupHistory(target);
    if (!history.available) return false;
    const campaign = archive.payload.campaign, entries = Object.assign(Object.create(null), history.entries);
    const previous = Object.hasOwn(entries, campaign.id) ? entries[campaign.id] : undefined;
    if (!previous && Object.keys(entries).length >= MAX_CAMPAIGNS) return false;
    const next = { revision: campaign.revision, sha256: archive.sha256, at: atISO };
    const existing = previous?.[kind];
    if (existing && (existing.revision > next.revision ||
        (existing.revision === next.revision && existing.at >= next.at))) return false;
    entries[campaign.id] = { ...previous, [kind]: next };
    const encoded = JSON.stringify({ version: 1, entries });
    target.setItem(BACKUP_HISTORY_KEY, encoded);
    // Certaines implémentations de stockage peuvent refuser silencieusement une écriture.
    return target.getItem(BACKUP_HISTORY_KEY) === encoded;
  } catch { return false; }
}

export function backupCopyStatus(campaign, history) {
  const base = { download: undefined, verified: undefined };
  if (!history?.available || !validEntries(history.entries)) {
    return { ...base, state: 'unavailable', message: 'Le suivi des copies est indisponible dans ce navigateur. Le téléchargement reste possible.' };
  }
  if (!campaign || !id(campaign.id) || !revision(campaign.revision)) {
    return { ...base, state: 'none', message: 'Ouvrez une campagne pour suivre ses copies externes.' };
  }
  const saved = Object.hasOwn(history.entries, campaign.id) ? history.entries[campaign.id] : undefined;
  const download = saved?.download && { ...saved.download }, verified = saved?.verified && { ...saved.verified };
  if (!saved) return { ...base, state: 'none', message: 'Aucune copie externe n’est suivie pour cette campagne dans ce navigateur.' };
  const newestRevision = Math.max(download?.revision ?? 0, verified?.revision ?? 0);
  if (newestRevision > campaign.revision) {
    return { download, verified, state: 'outdated', message: `Le suivi mentionne la révision ${newestRevision}, plus récente que la révision ${campaign.revision} affichée. Rechargez la campagne pour comparer.` };
  }
  if (verified?.revision === campaign.revision) {
    return { download, verified, state: 'current', message: `Un fichier a été relu et vérifié pour la révision ${campaign.revision}.` };
  }
  if (download && download.revision >= campaign.revision) {
    return { download, verified, state: 'unverified', message: `Le téléchargement de la révision ${download.revision} a été lancé. Relisez le fichier pour vérifier cette copie externe.` };
  }
  return { download, verified, state: 'outdated', message: `La campagne est à la révision ${campaign.revision}. Renouvelez puis vérifiez sa copie externe.` };
}
