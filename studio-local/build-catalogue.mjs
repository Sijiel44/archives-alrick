import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import YAML from 'yaml';

const revision = '88f774f3d0d6d520d8d11443b72202b9caf4f94b';
const root = fileURLToPath(new URL('../', import.meta.url));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
const blobs = new Map(git('ls-tree', '-rz', revision).split('\0').filter(Boolean).map(line => {
  const [record, path] = line.split('\t');
  return [path, record.split(' ')[2]];
}));
const entries = [];
const bodies = new Map();
const statuses = { lore_valide: 'lore', faits_joues: 'played', proposition_non_jouee: 'proposal' };
const cities = {
  'GEO-007': 'skalor', 'GEO-008': 'torngard', 'GEO-009': 'forgeciel', 'GEO-010': 'nacrecombe',
  'GEO-011': 'aldhammar', 'GEO-012': 'keldrun', 'GEO-013': 'dornael',
};

function source(path) {
  const version = blobs.get(path);
  assert.match(version ?? '', /^[a-f0-9]{40}$/, `Source absente à la révision épinglée : ${path}`);
  return { version, text: git('cat-file', 'blob', version) };
}

function markdown(path, shelf, kind, group, options = {}) {
  const { version, text } = source(path);
  const front = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  const meta = front ? YAML.parse(front[1]) : {};
  if (!options.technical) {
    const publicDocument = meta.publish === true && !meta.spoilers && !meta.unlisted &&
      (!meta.visibilite || meta.visibilite === 'publique');
    assert(publicDocument && (meta.portee === 'univers_partage' || options.publicExample), `Source hors périmètre : ${path}`);
  }
  const id = options.id ?? meta.code ?? basename(path, '.md');
  const description = options.description ?? meta.description;
  const name = options.name ?? meta.title;
  assert(typeof name === 'string' && typeof description === 'string', `Identité incomplète : ${path}`);
  const entry = { id, version, name, description, shelf, kind, group,
    status: options.status ?? statuses[meta.canon_statut] ?? 'reference', path, tags: (meta.tags ?? []).join(' '),
    links: options.links ?? [] };
  const body = front ? text.slice(front[0].length) : text;
  if (options.creature) {
    entry.details = ['Milieux possibles', 'Indices avant la rencontre', 'Lors d\'un affrontement', 'Contournement et points faibles possibles']
      .map(label => {
        const start = body.indexOf(`**${label} :** `);
        assert(start >= 0, `Section ${label} absente : ${path}`);
        const text = body.slice(start + label.length + 7).split(/\r?\n| \*\*[^*\r\n]+ :\*\*/)[0].replaceAll('**', '').trim();
        return [label, text];
      });
  }
  if (options.protocol) entry.protocol = true;
  entries.push(entry);
  if (!options.technical) bodies.set(id, body);
  return entry;
}

const regions = ['GEO-001', 'GEO-002', 'GEO-021', 'GEO-025', 'GEO-027', 'GEO-028'];
for (const [id, group] of [...regions.map(id => [id, 'Régions et royaumes']), ...Object.keys(cities).map(id => [id, 'Villes']),
  ['GEO-CB2-ENTRE-RIVES', 'Sites et environs']]) {
  const entry = markdown(`content/lieux/${id}.md`, 'atlas', 'place', group, {
    links: cities[id] ? ['GEO-001', `plan-${cities[id]}`, `${cities[id]}-carnet-de-terrain`] : [],
  });
  entry.name = entry.name.split(' — ')[0];
  assert.equal(entry.status, 'lore');
}
for (const path of [...blobs.keys()].filter(path => /^content\/lieux\/village-[a-z-]+\.md$/.test(path))) {
  const entry = markdown(path, 'atlas', 'place', 'Villages');
  entry.name = entry.name.split(' — ')[0];
  assert.equal(entry.status, 'proposal');
}
for (const city of Object.values(cities)) {
  markdown(`content/lieux/${city}-carnet-de-terrain.md`, 'atlas', 'guide', 'Quartiers et carnets', { links: [`plan-${city}`] });
}
for (const slug of ['sept-grandes-cites-illustrees', 'atlas-circulations-echanges', 'atlas-schema-regional', 'villages-sept-cites-portail']) {
  markdown(`content/lieux/${slug}.md`, 'atlas', 'guide', 'Cartes et itinéraires');
}

const creatures = ['cerf-des-brumes-froides', 'chasses-faim', 'garde-cendre', 'harpiste-creuse', 'lamproie-de-nacre', 'mache-rune', 'ver-des-frontieres'];
for (const slug of creatures) {
  const entry = markdown(`content/creatures/bestiaire-${slug}.md`, 'bestiaire', 'creature', 'Créatures de rencontre', { creature: true });
  entry.name = entry.name.replace(/^Bestiaire de jeu — /, '');
  entry.description = entry.details[0][1];
}
for (const path of ['creatures/dragons-et-souverainetes', 'creatures/bestiaire-villages-sept-cites', 'jouer/bestiaire-evolutif-25', 'jouer/atelier-bestiary-5d6']) {
  markdown(`content/${path}.md`, 'bestiaire', 'guide', 'Guides et profils');
}

for (const id of ['OBJ-CB31-ARMURE-PERE-ORIN', 'OBJ-CB38-BIJOU-COMMUNICATION', 'OBJ-CB38-LYRE-TAIRIN']) {
  markdown(`content/objets/${id}.md`, 'objets', 'object', 'Objets documentés', { publicExample: true });
}
markdown('modeles/objet.md', 'objets', 'guide', 'Création', { technical: true, id: 'modele-objet',
  name: 'Modèle de fiche d’objet', description: 'Trame pour décrire la fonction, l’origine, le propriétaire et les limites d’un objet de jeu.' });

const grimoirePath = 'quartz/components/scripts/atelier5d6-grimoire.ts';
const grimoire = source(grimoirePath);
const module = ts.createSourceFile(grimoirePath, grimoire.text, ts.ScriptTarget.Latest, true);
const spells = module.statements.filter(ts.isVariableStatement).flatMap(statement => [...statement.declarationList.declarations])
  .find(declaration => declaration.name.getText(module) === 'DEMO_SPELLS')?.initializer;
assert(spells && ts.isArrayLiteralExpression(spells), 'Catalogue de démonstration du Grimoire introuvable');
for (const spell of spells.elements) {
  assert(ts.isObjectLiteralExpression(spell), 'Définition de sort inattendue');
  const fields = new Map(spell.properties.filter(ts.isPropertyAssignment).map(prop => [prop.name.getText(module), prop.initializer]));
  const literal = name => {
    const field = fields.get(name);
    assert(field && (ts.isStringLiteral(field) || ts.isNumericLiteral(field)), `Champ de sort inattendu : ${name}`);
    return field.text;
  };
  assert.equal(literal('status'), 'demo');
  entries.push({ id: literal('id'), version: grimoire.version, name: literal('name'), description: literal('description'),
    shelf: 'sorts', kind: 'spell', group: 'Sorts de démonstration', status: 'test', path: grimoirePath,
    tags: `${literal('category')} ${literal('domain')} cercle ${literal('circle')}`, links: ['grimoire-5d6'],
    details: [['Cercle indiqué', literal('circle')], ['Coût de base en mana', literal('manaCost')], ['Limites de l’essai', literal('limits')]] });
}
markdown('content/magie/index.md', 'sorts', 'guide', 'Codex et pratiques', { id: 'codex-arts-magiques', links: ['magie-pour-jouer'] });
markdown('docs/GRIMOIRE_5D6_V1.md', 'sorts', 'guide', 'Codex et pratiques', { technical: true, id: 'grimoire-5d6', status: 'test',
  name: 'Grimoire 5d6', description: 'Apprentissage, Cercles, préparation, mana et limites du catalogue de démonstration.', links: ['codex-arts-magiques', 'demo-lueur-guide'] });
markdown('docs/rapports-missions/MAG_003_B_RITES_COOPERATION.md', 'sorts', 'ritual', 'Rituels et cérémonies', { technical: true,
  id: 'rites-cooperation', status: 'test', name: 'Rites et coopération',
  description: 'Dossier des rites personnels et des cérémonies collectives. Accès, rôle des participants et validation des ressources.', links: ['grimoire-5d6'] });

for (const slug of ['systeme-5d6-base12', 'playtest-5d6-probabilites', 'protocole-failles-guildes', 'decheance-systeme']) {
  markdown(`content/jouer/${slug}.md`, 'actions', 'action', 'Résolution et protocoles', { protocol: slug === 'playtest-5d6-probabilites' });
}
for (const slug of ['parcours-de-vie-affinites', 'progression-voies-incidents']) {
  markdown(`content/jouer/${slug}.md`, 'actions', 'ability', 'Capacités et progression');
}
markdown('docs/rapports-missions/M02_ATELIER_CAPACITES_5D6.md', 'actions', 'ability', 'Capacités et progression', { technical: true,
  id: 'capacites-m02', status: 'test', name: 'Aptitudes, techniques et signatures',
  description: 'Contrat des capacités 5d6, rangs, prérequis, limites et approbation MJ.', links: ['SYS-ORIG-05', 'systeme-5d6-base12'] });
for (const slug of ['aventure-pilote-les-registres-du-col', 'la-veille-des-sept-cites', 'les-registres-des-sept-cites',
  'quetes-sept-cites', 'quetes-villages-sept-cites', 'contrats-guilde-sept-cites-villages']) {
  markdown(`content/jouer/${slug}.md`, 'aventures', 'adventure', slug.startsWith('quetes') || slug.startsWith('contrats') ? 'Quêtes et contrats' : 'Aventures');
}

for (const [path, id, name, group, links] of [
  ['monde/index', 'cosmologie', 'Cosmologie et Couronnes', 'Les fondations', ['MON-PASS-01', 'MON-FAI-02', 'MON-005']],
  ['monde/passages-entre-couronnes', 'MON-PASS-01', 'Passages entre Couronnes', 'Les fondations', ['MON-FAI-02']],
  ['monde/failles-et-ruptures', 'MON-FAI-02', 'Failles et ruptures', 'Les fondations', ['protocole-failles-guildes', 'MON-PASS-01']],
  ['monde/dix-huit-grandes-puissances', 'MON-005', 'Les Dix-Huit Grandes Puissances', 'Les fondations', ['MON-COUR-01']],
  ['monde/courants-et-antagonismes', 'MON-COUR-01', 'Les sept courants divins', 'Les fondations', ['MON-005']],
  ['cultures/index', 'peuples-cultures', 'Peuples et cultures', 'La vie quotidienne', ['GEO-021', 'institutions']],
  ['institutions/index', 'institutions', 'Institutions et services', 'La vie quotidienne', ['protocole-failles-guildes']],
  ['univers/magie-pour-jouer', 'magie-pour-jouer', 'Comprendre la magie', 'La vie quotidienne', ['codex-arts-magiques', 'grimoire-5d6']],
]) markdown(`content/${path}.md`, 'univers', 'lore', group, { id, name, links });

function map(path, id, name, description, links) {
  const { version, text } = source(path);
  assert(text.startsWith('<svg') && !/<(?:script|foreignObject)\b|\son\w+\s*=|\bhref\s*=/i.test(text), `SVG hors périmètre : ${path}`);
  assert([...text.matchAll(/url\(([^)]+)\)/g)].every(([, target]) => /^#[\w-]+$/.test(target)), `Ressource externe dans ${path}`);
  entries.push({ id, version, name, description, shelf: 'imagerie', kind: 'image', group: 'Plans et cartes',
    status: 'proposal', path, asset: `/media/atlas/${basename(path)}`, links });
}
map('quartz/static/images/atlas/schema-ensembles.svg', 'carte-ensembles', 'Schéma des grands ensembles',
  'Schéma documentaire sans échelle. Il présente les ensembles régionaux et les Sept Cités sans fixer leurs positions exactes.',
  ['atlas-schema-regional', 'GEO-001', 'GEO-021']);
for (const [id, city] of Object.entries(cities)) {
  const name = entries.find(entry => entry.id === id).name;
  map(`quartz/static/images/atlas/plans/${city}-quartiers-schematiques.svg`, `plan-${city}`, `Plan de quartiers · ${name}`,
    `Schéma relationnel des quartiers proposés de ${name}. Les positions, trajets et distances restent symboliques.`,
    [id, `${city}-carnet-de-terrain`]);
}

const lookup = new Map();
for (const entry of entries) {
  assert(!lookup.has(entry.id.toLowerCase()), `Identifiant en double : ${entry.id}`);
  lookup.set(entry.id.toLowerCase(), entry.id);
  if (entry.path.startsWith('content/')) lookup.set(entry.path.slice(8, -3).toLowerCase(), entry.id);
}
for (const entry of entries) {
  for (const target of entry.links) assert(lookup.has(target.toLowerCase()), `Lien configuré introuvable : ${target}`);
  const extracted = [...(bodies.get(entry.id) ?? '').matchAll(/(?<!!)\[\[([^\]|#\r\n]+)(?:[^\]\r\n]*)\]\]/g)]
    .map(([, key]) => lookup.get(key.trim().toLowerCase()));
  entry.links = [...new Set([...entry.links, ...extracted].filter(id => id && id !== entry.id))].slice(0, 9);
}

const file = new URL('./catalogue-archives.json', import.meta.url);
const json = `${JSON.stringify({ revision, entries }, null, 2)}\n`;
if (process.argv.includes('--check')) assert.equal(readFileSync(file, 'utf8').replace(/\r\n/g, '\n'), json, 'Régénérez le catalogue des Archives');
else writeFileSync(file, json);
console.log(`${entries.length} références sourcées à ${revision.slice(0, 8)}.`);
