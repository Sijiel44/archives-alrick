import sounds from './catalogue-sons.json' with { type: 'json' };
import videos from './catalogue-videos.json' with { type: 'json' };

export const MEDIA_CATEGORIES = Object.freeze({ eau: 'Eau et rivières', foret: 'Forêts', meteo: 'Météo et vent',
  feu: 'Feu et lumière', paysage: 'Paysages', astral: 'Ciel et astral', lieux: 'Lieux et vie quotidienne',
  faune: 'Faune', gestes: 'Gestes et objets' });
export const MEDIA_LICENSES = Object.freeze({ 'CC0-1.0': 'CC0 1.0', 'Public-Domain': 'Domaine public' });

const https = value => {
  if (typeof value !== 'string' || value.length > 2048 || !value.startsWith('https://') || /[\s\u0000-\u001f\u007f\\]/u.test(value)) return false;
  try { const url = new URL(value); return Boolean(url.hostname) && !url.username && !url.password; } catch { return false; }
};
const text = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
export function validateMediaCatalogues(catalogues) {
  const ids = new Set(), urls = new Set(), sources = new Set();
  for (const [kind, catalogue] of Object.entries(catalogues)) {
    if (!['audio', 'video'].includes(kind) || catalogue.version !== 1 || !/^\d{4}-\d{2}-\d{2}$/.test(catalogue.checkedAt) ||
        !Array.isArray(catalogue.entries) || catalogue.entries.length < 50 || catalogue.entries.length > 1000) throw new Error('Le catalogue média est incomplet.');
    for (const entry of catalogue.entries) {
      if (!/^[a-z0-9][a-z0-9-]{0,127}$/.test(entry.id) || entry.kind !== kind || !text(entry.name, 160) ||
          !Object.hasOwn(MEDIA_CATEGORIES, entry.category) || !text(entry.description, 1200) || !https(entry.url) ||
          !https(entry.sourceUrl) || !https(entry.licenseUrl) || !Object.hasOwn(MEDIA_LICENSES, entry.license) ||
          !text(entry.author, 2000) || !text(entry.originalTitle, 1000) || !text(entry.licenseNote, 2000) ||
          !(entry.duration === null || typeof entry.duration === 'number' && Number.isFinite(entry.duration) && entry.duration > 0) ||
          ids.has(entry.id) || urls.has(entry.url) || sources.has(entry.sourceUrl)) throw new Error(`Référence média invalide ou doublonnée : ${entry.id}`);
      ids.add(entry.id); urls.add(entry.url); sources.add(entry.sourceUrl);
    }
  }
  return true;
}
validateMediaCatalogues({ audio: sounds, video: videos });
export const MEDIA_ENTRIES = Object.freeze([...sounds.entries, ...videos.entries].map(entry => Object.freeze({ ...entry })));
export const MEDIA_CHECKED_AT = [sounds.checkedAt, videos.checkedAt].sort()[0];

export function mediaCredit(entry) {
  const identity = `${MEDIA_LICENSES[entry.license]} · Catalogue CER médias v1 · ${entry.id}`;
  const source = `${identity}\n${entry.sourceUrl}`;
  return source.length < 550 ? `${source}\n${entry.author.slice(0, 599 - source.length)}` : `${identity}\n${entry.author.slice(0, 599 - identity.length)}`;
}

export function filterMedia(entries, { kind = 'all', category = '', query = '' } = {}) {
  const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr');
  const words = normalize(query).trim().split(/\s+/u).filter(Boolean);
  return entries.filter(entry => (kind === 'all' || entry.kind === kind) && (!category || entry.category === category) &&
    words.every(word => normalize(`${entry.name} ${entry.description} ${MEDIA_CATEGORIES[entry.category]} ${entry.author}`).includes(word)));
}
