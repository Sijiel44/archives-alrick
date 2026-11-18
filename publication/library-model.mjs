export const categories = [
  ['univers', 'Univers', 'Fondements, puissances et histoire du monde'],
  ['atlas', 'Atlas et lieux', 'Régions, villes, routes et lieux à explorer'],
  ['cultures', 'Peuples et cultures', 'Usages, croyances et vie quotidienne'],
  ['personnages', 'Personnages', 'Rencontres, alliés et rivaux'],
  ['bestiaire', 'Bestiaire', 'Créatures, habitats et indices'],
  ['factions', 'Groupes et factions', 'Institutions, compagnies et alliances'],
  ['magie', 'Magie et sorts', 'Traditions, grimoire et références de sorts'],
  ['capacites', 'Capacités et actions', 'Gestes de jeu et possibilités des personnages'],
  ['objets', 'Objets', 'Équipement et objets de vos aventures'],
  ['aventures', 'Quêtes et aventures', 'Situations, objectifs et pistes à jouer'],
  ['regles', 'Jouer et règles', 'Guides, protocole et système 5d6'],
  ['imagerie', 'Images et ambiances', 'Illustrations pour préparer vos scènes'],
];
export const normalize = value => String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr');
export function categoryFor(entry, kind) {
  if (kind === 'game') return ({pnj:'personnages',antagonistes:'personnages',actions:'capacites',sorts:'magie',capacites:'capacites',protocole:'regles'})[entry.category] ?? (categories.some(([id])=>id===entry.category) ? entry.category : 'univers');
  if (/^(ATL-|REG-|GEO-)/.test(entry.id)) return 'atlas';
  if (/^(PEU-|CULT-)/.test(entry.id)) return 'cultures';
  return ({characters:'personnages',antagonists:'personnages',groups:'factions',creatures:'bestiaire',guides:'regles',magic:'magie'})[entry.type] ?? 'univers';
}
export function mergeLibrary(reading, game) {
  const entries = new Map();
  for (const [kind, source] of [['reading',reading],['game',game]]) for (const item of source) {
    // A public game adaptation may coexist with a hidden historical dossier.
    if (item.hidden || item.publish === false || item.spoilers === true || item.unlisted === true) continue;
    const variant = {kind, title:item.title ?? item.name, description:item.description ?? '', status:item.status ?? 'État documentaire à consulter', href:item.href};
    const existing = entries.get(item.id);
    if (existing) { existing.variants.push(variant); continue; }
    entries.set(item.id, {id:item.id, title:variant.title, description:variant.description, category:categoryFor(item,kind), image:item.image, imageAlt:item.imageAlt ?? '', variants:[variant]});
  }
  return [...entries.values()].sort((a,b)=>a.title.localeCompare(b.title,'fr'));
}
export function searchLibrary(entries, {q='', category='', usage=''}={}) {
  const words=normalize(q).trim().split(/\s+/).filter(Boolean);
  const exact=entries.find(e=>normalize(e.id)===normalize(q).trim());
  return entries.filter(e=>(!exact || e.id===exact.id) && (!category || e.category===category) && (!usage || e.variants.some(v=>v.kind===usage)) && words.every(w=>normalize(`${e.id} ${e.title} ${e.description} ${e.variants.map(v=>`${v.title} ${v.description}`).join(' ')}`).includes(w)));
}
