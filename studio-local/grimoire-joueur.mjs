import catalogue from './catalogue-archives.json' with { type: 'json' };
import { AFFINITY_DOMAINS } from './moteur/atelier5d6-origins.js';

export const PLAYER_GRIMOIRE_LIMIT = 80;
const domains = new Map(AFFINITY_DOMAINS);
const categories = { utilitaire: 'Utilitaire', protection: 'Protection', soin: 'Soin', perception: 'Perception',
  artisanat: 'Artisanat', attaque: 'Attaque', deplacement: 'Déplacement' };
const sourceLink = entry => `https://github.com/Sijiel44/archives-alrick/blob/${catalogue.revision}/${entry.path}`;

// Seuls les essais publics déjà sélectionnés du moteur sont proposés aux joueurs.
// Une future création privée de campagne ne devient pas un sort public par son type.
export const PLAYER_SPELLS = catalogue.entries.filter(entry => entry.kind === 'spell' && entry.status === 'test' &&
  entry.path === 'quartz/components/scripts/atelier5d6-grimoire.ts').map(entry => {
  const [category, domain] = entry.tags.split(' ');
  return { ...entry, domain, domainName: domains.get(domain) ?? 'Domaine non précisé',
    categoryName: categories[category] ?? category, href: sourceLink(entry) };
});
export const PLAYER_MAGIC_REFERENCES = catalogue.entries.filter(entry =>
  ['codex-arts-magiques', 'grimoire-5d6', 'rites-cooperation'].includes(entry.id)).map(entry => ({ ...entry, href: sourceLink(entry) }));
export const PLAYER_MAGIC_DOMAINS = [...new Map(PLAYER_SPELLS.map(entry => [entry.domain, entry.domainName]))]
  .sort((a, b) => a[1].localeCompare(b[1], 'fr'));
const byId = new Map(PLAYER_SPELLS.map(entry => [entry.id, entry]));
export const playerSpell = id => byId.get(id);
export const grimoireSearchText = value => String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr');

export function checkPlayerGrimoire(entries) {
  if (!Array.isArray(entries) || entries.length > PLAYER_GRIMOIRE_LIMIT ||
      new Set(entries.map(entry => entry?.id)).size !== entries.length || entries.some(entry =>
        !entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.id !== 'string' ||
        !/^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(entry.id) || typeof entry.name !== 'string' ||
        !entry.name.trim() || entry.name.length > 120 || typeof entry.version !== 'string' ||
        !entry.version || entry.version.length > 128 || typeof entry.notes !== 'string' || entry.notes.length > 4000 ||
        typeof entry.session !== 'boolean')) {
    throw new Error('Le grimoire personnel est incomplet, contient des doublons ou dépasse 80 références.');
  }
  return entries;
}

export function grimoireRows(bookmarks) {
  const saved = new Map(bookmarks.map(entry => [entry.id, entry]));
  return [...PLAYER_SPELLS.map(entry => ({ ...entry, bookmark: saved.get(entry.id) })),
    ...bookmarks.filter(entry => !byId.has(entry.id)).map(bookmark => ({ id: bookmark.id, name: bookmark.name,
      description: 'Cette référence est absente du catalogue courant. Tes notes et ton choix de séance sont conservés.', bookmark }))];
}
