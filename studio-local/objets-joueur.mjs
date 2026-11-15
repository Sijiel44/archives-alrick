import catalogue from './catalogue-archives.json' with { type: 'json' };

export const ITEM_SOURCE_KEY = 'entreRivesObjectSourceV1';
export const OBJECT_CATEGORIES = { armure: 'Armures', bijou: 'Bijoux', autre: 'Autres objets' };
export const OBJECT_STATUSES = { played: 'Fait joué dans la source', lore: 'Lore validé', reference: 'Référence', proposal: 'Proposition de jeu', test: 'Prototype' };
const hash = value => typeof value === 'string' && /^[a-f0-9]{40}$/u.test(value);
export const objectSearchText = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr');
export const PLAYER_OBJECTS = catalogue.entries.filter(entry => entry.kind === 'object' && entry.shelf === 'objets' &&
  Object.hasOwn(OBJECT_STATUSES, entry.status) && /^content\/objets\/[A-Za-z0-9_-]+\.md$/u.test(entry.path) && hash(entry.version)).map(entry => ({
    ...entry, category: entry.tags.split(' ').includes('armure') ? 'armure' : entry.tags.split(' ').includes('bijou') ? 'bijou' : 'autre',
    href: `https://github.com/Sijiel44/archives-alrick/blob/${catalogue.revision}/${entry.path}`,
  })).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
const byId = new Map(PLAYER_OBJECTS.map(entry => [entry.id, entry]));
export const playerObject = id => byId.get(id);

export function objectSource(entry, previous) {
  const current = byId.get(entry?.id);
  if (!current || current.version !== entry.version) throw new Error('Cette référence n’est pas disponible dans le catalogue courant.');
  return { ...previous, version: 1, id: current.id, name: current.name, sourceVersion: current.version, revision: catalogue.revision };
}
export function objectReference(source) {
  if (source === undefined) return { state: 'none', label: 'Objet libre · aucune référence liée.' };
  if (!source || typeof source !== 'object' || Array.isArray(source) || source.version !== 1 ||
      typeof source.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/u.test(source.id) ||
      typeof source.name !== 'string' || !source.name.trim() || source.name.length > 200 || !hash(source.sourceVersion) || !hash(source.revision)) {
    return { state: 'unsupported', label: 'Référence de format inconnu · conservée dans la sauvegarde personnelle.' };
  }
  const entry = byId.get(source.id);
  const state = !entry ? 'missing' : entry.version !== source.sourceVersion ? 'changed' : 'current';
  return { state, entry, label: `${source.name} · ${source.id} · version ${source.sourceVersion.slice(0, 8)}`,
    // Le fichier ne fournit jamais un chemin ou une URL à suivre : le chemin vient du catalogue public.
    href: entry ? `https://github.com/Sijiel44/archives-alrick/blob/${source.revision}/${entry.path}` : undefined };
}
export function itemWithSource(item, source) {
  const next = { ...item };
  if (source === undefined) delete next[ITEM_SOURCE_KEY];
  else next[ITEM_SOURCE_KEY] = structuredClone(source);
  return next;
}
