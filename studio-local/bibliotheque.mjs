import { BESTIARY_PROFILE_KEY, CREATIONS_KEY, FRESQUE_MARKERS_KEY, FRESQUE_REFERENCE_KEY, IMAGE_ORIGINS, LIBRARY_SOURCE_SCHEMAS,
  LINKED_IMAGES_KEY, MARKER_KINDS, PJ_SOURCE_KEY } from './store.mjs';
import { CREATION_STATES, CREATION_TYPES } from './creations.mjs';
import catalogue from './catalogue-archives.json' with { type: 'json' };

export const LIBRARY_CATEGORIES = Object.freeze({
  ...MARKER_KINDS, creature: 'Créature', character: 'Personnage joueur', object: 'Objet', spell: 'Sort', ritual: 'Rituel',
  ability: 'Capacité', action: 'Action et règles', adventure: 'Aventure ou quête', guide: 'Guide', image: 'Image', lore: 'Lore',
  npc: 'PNJ', encounter: 'Rencontre', quest: 'Quête', mission: 'Mission', faction: 'Faction',
});
export const LIBRARY_SOURCES = Object.freeze({
  archives: 'Archives d’Alrick',
  demo: 'Démonstration',
  personal: 'Créations du MJ',
  variant: 'Variantes de campagne',
});
export const LIBRARY_STATUSES = Object.freeze({
  lore: 'Lore validé', played: 'Fait joué', proposal: 'Proposition de jeu', test: 'Prototype', reference: 'Référence',
  demo: 'Démonstration', local: 'Fiche du MJ', variant: 'Variante privée',
  ...CREATION_STATES,
});
export const LIBRARY_SHELVES = Object.freeze({
  atlas: { name: 'Atlas', detail: 'Régions, cités, villages et plans', icon: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15m6-12v15' },
  bestiaire: { name: 'Bestiaire', detail: 'Créatures, rencontres et profils 5d6', icon: 'M8 16c0-3 2-5 4-5s4 2 4 5c0 2-1 3-4 2s-4 0-4-2z M5 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm7-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm7 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  objets: { name: 'Objets et équipements', detail: 'Armes, outils, œuvres et artefacts', icon: 'M4 8h16v12H4z M8 8V5h8v3m-4 5v3m-8-3h16' },
  sorts: { name: 'Sorts et rituels', detail: 'Grimoire, Cercles et magie de table', icon: 'M12 3v18M3 12h18M6 6l12 12M18 6 6 18 M12 8l4 4-4 4-4-4z' },
  actions: { name: 'Capacités et actions', detail: 'Protocoles, techniques et progression', icon: 'M13 2 4 14h7l-1 8 10-12h-7z' },
  aventures: { name: 'Aventures et quêtes', detail: 'Scénarios, missions et contrats', icon: 'M7 3h11v14H8a2 2 0 0 1 0-4h10M5 15V5l2-2m0 14v4h13v-4 M10 7h5m-5 3h5' },
  imagerie: { name: 'Imagerie', detail: 'Plans, portraits et illustrations', icon: 'M3 5h18v14H3z M4 16l5-5 4 4 3-3 4 4 M16 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
  campagne: { name: 'Fiches de campagne', detail: 'PJ, repères et variantes de ce profil', icon: 'M6 3h13v14H6z M3 7v14h12 M9 7h7m-7 4h7' },
});

export const DEMO_CREATURES = [
  { id: 'gardien-des-salines', version: 1, name: 'Gardien des Salines', symbol: '◇',
    art: { src: './media/gardien-des-salines.webp', alt: 'Une silhouette masquée de bois flotté, couverte de sel, tient un bâton dans un gué brumeux.' },
    description: 'Une silhouette de sel et de bois flotté. Elle se poste devant les gués à la tombée du jour et attend qu’on lui raconte une traversée.' },
  { id: 'renarde-de-brume', version: 1, name: 'Renarde de brume', symbol: '☾',
    art: { src: './media/renarde-de-brume.webp', alt: 'Une renarde rousse et grise se tient dans l’eau au crépuscule, le bout de la queue lumineux.' },
    description: 'Ses pas ne troublent jamais l’eau. Les veilleurs suivent sa lueur lorsqu’ils cherchent un chemin entre deux rives.' },
  { id: 'heron-des-lanternes', version: 1, name: 'Héron des lanternes', symbol: '✧',
    art: { src: './media/heron-des-lanternes.webp', alt: 'Un héron bleu ardoise perché sur un pieu tient une brindille aux deux bourgeons lumineux.' },
    description: 'Un oiseau du crépuscule qui transporte des brindilles incandescentes vers les refuges abandonnés.' },
];

const demoBestiary = DEMO_CREATURES.map(creature => ({ ...creature, kind: 'creature', origin: 'demo', status: 'demo',
  shelf: 'bestiaire', group: 'Bestiaire illustré', links: [`image-${creature.id}`] }));
const lamproieArt = Object.freeze({ src: './media/lamproie-de-nacre.webp',
  alt: 'Dans un lac souterrain, la lamproie sombre présente une collerette nacrée et des nageoires translucides.' });
const studioGallery = [
  { id: 'image-entre-rives', name: 'Les rives au crépuscule', version: 1,
    description: 'Paysage illustré de l’accueil de découverte.', symbol: '◇', links: ['GEO-CB2-ENTRE-RIVES'],
    art: { src: './media/entre-rives-accueil.webp', alt: 'Un passage entre deux rives dans la brume du soir.' } },
  ...DEMO_CREATURES.map(creature => ({ id: `image-${creature.id}`, name: `Illustration · ${creature.name}`,
    version: creature.version, description: creature.art.alt, symbol: creature.symbol, art: creature.art, links: [creature.id] })),
  { id: 'image-lamproie-de-nacre', name: 'Illustration · Lamproie de nacre', version: 1,
    description: lamproieArt.alt, symbol: '◇', art: lamproieArt, links: ['bestiaire-lamproie-de-nacre'] },
].map(entry => ({ ...entry, kind: 'image', origin: 'demo', status: 'demo', shelf: 'imagerie', group: 'Illustrations du Studio' }));

const archiveEntries = catalogue.entries.map(entry => ({
  ...entry, origin: 'archives',
  href: `https://github.com/Sijiel44/archives-alrick/blob/${catalogue.revision}/${entry.path}`,
  ...(entry.asset ? { symbol: '◇', art: { src: new URL(`.${entry.asset}`, import.meta.url).pathname, alt: entry.description, map: true } } : {}),
  ...(entry.id === 'bestiaire-lamproie-de-nacre' ? { symbol: '◇', art: lamproieArt,
    links: [...entry.links, 'image-lamproie-de-nacre'] } : {}),
}));

const fixedEntries = [...demoBestiary, ...archiveEntries, ...studioGallery];
export const LIBRARY_ILLUSTRATIONS = [...archiveEntries.filter(entry => entry.art?.map), ...studioGallery];
const illustrationsBySource = new Map(LIBRARY_ILLUSTRATIONS.map(entry => [entry.art.src, entry]));

export function libraryIllustration(entry) {
  return illustrationsBySource.get(entry?.art?.src);
}

const references = new Map(fixedEntries.map(entry => [entry.id.toLowerCase(), entry]));
for (const entry of archiveEntries) {
  if (entry.path.startsWith('content/')) references.set(entry.path.slice(8, -3).toLowerCase(), entry);
}

export function libraryReference(key) {
  if (typeof key !== 'string') return undefined;
  return references.get(key.trim().replace(/^content\//i, '').replace(/\.md$/i, '').toLowerCase());
}

export function creatureReference(source) {
  const entry = libraryReference(source?.id);
  return entry?.kind === 'creature' && entry.version === source?.version ? entry : undefined;
}

export function referenceSegments(text, resolve = libraryReference) {
  const parts = [];
  let offset = 0;
  const pattern = /(?<!!)\[\[([\w./ -]{1,160})(?:\|([^\]\r\n]{1,200}))?\]\]|(?<!!)\[([^\]\r\n]{1,200})\]\((?:\/?#fiche\/)?([a-z\d][\w./-]{0,159})\)/gi;
  for (const match of text.matchAll(pattern)) {
    const entry = resolve(match[1] ?? match[4]);
    if (!entry) continue;
    if (match.index > offset) parts.push({ text: text.slice(offset, match.index) });
    parts.push({ text: (match[2] ?? match[3])?.trim() || entry.name, entry });
    offset = match.index + match[0].length;
  }
  if (offset < text.length) parts.push({ text: text.slice(offset) });
  return parts;
}

export function normalize(text) {
  return text.toLocaleLowerCase('fr').normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export function searchTerms(query) {
  return normalize(query).match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function archiveReference(provenance) {
  if (provenance?.sourceSchema !== LIBRARY_SOURCE_SCHEMAS.archives) return undefined;
  const source = libraryReference(provenance.sourceId);
  return source?.origin === 'archives' && source.kind === 'place' && source.id === provenance.sourceId &&
    source.version === provenance.sourceVersion ? source : undefined;
}

export function markerCopyProvenance(entry) {
  if (entry.origin === 'archives' && entry.kind === 'place') {
    return { sourceSchema: LIBRARY_SOURCE_SCHEMAS.archives, sourceId: entry.id, sourceVersion: entry.version };
  }
  if (!entry.creation && entry.origin === 'personal' && Object.hasOwn(MARKER_KINDS, entry.kind)) {
    return {
      sourceSchema: LIBRARY_SOURCE_SCHEMAS.campaign,
      sourceId: entry.id,
      sourceVersion: entry.campaignRevision,
      sourceCampaignId: entry.campaignId,
    };
  }
  return undefined;
}

export function buildLibraryIndex(campaigns) {
  const entries = [...fixedEntries];
  for (const campaign of campaigns) {
    const start = entries.length;
    const context = { campaignId: campaign.id, campaignName: campaign.name, campaignRevision: campaign.revision };
    const scenes = new Map(campaign.scenes.map(scene => [scene.id, scene.title]));
    const creations = campaign[CREATIONS_KEY] ?? [];
    const children = new Map();
    for (const { id, parentId } of creations) {
      if (!parentId) continue;
      if (!children.has(parentId)) children.set(parentId, []);
      children.get(parentId).push(id);
    }
    for (const creation of creations) {
      const type = CREATION_TYPES[creation.kind];
      entries.push({ ...context, id: creation.id, name: creation.name, description: creation.description,
        kind: creation.kind, origin: 'personal', status: creation.state, shelf: type.shelf,
        group: creation.details.scale ?? type.group, creation: true, record: creation,
        links: [creation.parentId, ...creation.links, ...(children.get(creation.id) ?? [])].filter(Boolean),
        details: type.fields.filter(({ key }) => creation.details[key]).map(({ key, label }) => [label, creation.details[key]]) });
    }
    for (const character of campaign.characters) {
      entries.push({ ...context, id: character.id, name: character.name, level: character.level,
        kind: 'character', origin: 'personal', status: 'local', shelf: 'campagne', group: 'Personnages joueurs',
        tags: character[PJ_SOURCE_KEY] ? 'pj m02 5d6' : '', record: character });
    }
    for (const creature of campaign.creatures) {
      const reference = creatureReference(creature.source);
      const profile = creature[BESTIARY_PROFILE_KEY];
      entries.push({ ...context, id: creature.id, name: creature.name, description: creature.description,
        kind: 'creature', origin: 'variant', status: 'variant', shelf: 'bestiaire', group: profile ? 'Profils 5d6 de campagne' : 'Variantes de campagne',
        record: creature, art: reference?.art, symbol: reference?.symbol,
        tags: profile ? `m03 profil 5d6 niveau ${profile.card.level} ${profile.card.kind} ${profile.card.archetype}` : '' });
    }
    for (const marker of campaign[FRESQUE_MARKERS_KEY] ?? []) {
      const provenance = marker[FRESQUE_REFERENCE_KEY];
      entries.push({ ...context, id: marker.id, name: marker.title, description: marker.description,
        kind: marker.kind, origin: provenance ? 'variant' : 'personal', status: provenance ? 'variant' : 'local',
        shelf: marker.kind === 'place' ? 'atlas' : 'campagne', group: marker.kind === 'place' ? 'Lieux de campagne' : 'Repères',
        record: marker, provenance,
        sceneTitle: scenes.get(marker.sceneId) });
    }
    const targets = new Map(entries.slice(start).map(entry => [entry.id, entry]));
    for (const image of campaign[LINKED_IMAGES_KEY] ?? []) {
      const art = { src: image.url, alt: image.alt || image.name, remote: true };
      const target = targets.get(image.targetId);
      const details = [['Provenance déclarée', IMAGE_ORIGINS[image.origin]]];
      if (image.credit) details.push(['Crédit ou licence', image.credit]);
      if (target) {
        target.art = art;
        target.linkedImage = image;
        target.links = [...(target.links ?? []), image.id];
        details.push(['Fiche illustrée', target.name]);
      }
      entries.push({ ...context, id: image.id, name: image.name, kind: 'image', origin: 'personal', status: 'local',
        shelf: 'imagerie', group: 'Images par lien', record: image, art, details });
    }
  }
  return entries.map(entry => ({
    ...entry,
    searchText: ` ${searchTerms([
      entry.name, entry.description, entry.tags, entry.group, LIBRARY_CATEGORIES[entry.kind], entry.campaignName,
      entry.record ? '' : entry.id, entry.level ? `PJ niveau ${entry.level}` : '', ...(entry.details?.flat() ?? []),
    ].filter(Boolean).join(' ')).join(' ')} `,
  }));
}

export function inLibraryShelf(entry, shelf) {
  if (!shelf || shelf === 'tout') return true;
  if (shelf === 'campagne') return Boolean(entry.record);
  return entry.shelf === shelf || (shelf === 'atlas' && Boolean(entry.asset));
}

export function filterLibrary(entries, terms, { kind = '', origin = '', level = '', status = '', group = '' } = {}) {
  return entries.filter(entry => (!kind || entry.kind === kind) && (!origin || entry.origin === origin) &&
    (!level || entry.level === Number(level)) && (!status || entry.status === status) && (!group || entry.group === group) &&
    terms.every(term => entry.searchText.includes(/^\d+$/.test(term) ? ` ${term} ` : term)));
}
