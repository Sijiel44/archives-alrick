import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { LIBRARY_ILLUSTRATIONS, LIBRARY_SHELVES, buildLibraryIndex, libraryReference } from '../bibliotheque.mjs';
import { startStudioServer, studioAssets } from '../serve.mjs';
import catalogue from '../catalogue-organisations.json' with { type: 'json' };

const root = fileURLToPath(new URL('../../', import.meta.url));
const sourceFile = path => fileURLToPath(new URL(`../../${path}`, import.meta.url));
const hash = path => execFileSync('git', ['hash-object', path], { cwd: root, encoding: 'utf8' }).trim();

test('Sept organisations du canon : codes, provenances, images originales et références publiques', () => {
  assert.equal(catalogue.schema, 'entre-rives/organisations-publiques/1');
  assert.equal(catalogue.visibility, 'public');
  assert.equal(catalogue.rulesStatus, 'descriptive_only');
  assert.equal(catalogue.entries.length, 7);
  assert.ok(LIBRARY_SHELVES.factions);
  const ids = new Set();
  const sources = new Set();
  const entries = buildLibraryIndex([]);
  for (const organisation of catalogue.entries) {
    assert.match(organisation.id, /^ORG-DECH-0[1-7]$/);
    assert.equal(ids.has(organisation.id), false);
    ids.add(organisation.id);
    assert.equal(sources.has(organisation.path), false);
    sources.add(organisation.path);
    const page = readFileSync(sourceFile(organisation.path), 'utf8');
    assert.match(page, new RegExp(`^code: "${organisation.id}"$`, 'm'));
    assert.match(page, /^publish: true$/m);
    assert.match(page, /^canon_statut: "lore_valide"$/m);
    assert.match(page, /^visibilite: "publique"$/m);
    assert.equal(hash(organisation.path), organisation.version, `${organisation.id}: version source périmée`);
    assert.ok(organisation.relations.every(id => id !== organisation.id));
    const image = readFileSync(sourceFile(`quartz/static/images/organisations/${organisation.image}`), 'utf8');
    assert.match(image, /^<svg[^>]*role="img"/);
    assert.doesNotMatch(image, /<script|<foreignObject|\bon\w+\s*=|\bhref=/i);
    assert.doesNotMatch(image.replace('http://www.w3.org/2000/svg', ''), /https?:\/\//i,
      'SVG original ne doit pas charger d’image externe');
    const entry = libraryReference(organisation.id);
    assert.equal(entry?.kind, 'faction');
    assert.equal(entry?.shelf, 'factions');
    assert.equal(entry?.status, 'lore');
    assert.equal(entry?.version, organisation.version);
    assert.equal(entry?.publicTemplate?.purpose, organisation.purpose);
    assert.ok(entry?.art?.src.endsWith(`/${organisation.image}`));
    assert.ok(LIBRARY_ILLUSTRATIONS.includes(entry));
    assert.equal(libraryReference(organisation.path), entry);
    assert.equal(entries.find(value => value.id === organisation.id)?.version, entry.version);
  }
  for (const org of catalogue.entries) for (const id of org.relations) assert.ok(ids.has(id) || catalogue.entries.some(e => e.id === id));
});

test('Aucun secret, profil 5d6 inventé ni donnée de campagne dans les sept références', () => {
  const json = JSON.stringify(catalogue).toLowerCase();
  for (const forbidden of ['secret mj', 'private', 'hidden', 'campagne_id', 'pvmax', 'degats', 'defense', 'mana', 'lieur_id']) {
    assert.equal(json.includes(forbidden), false, `Champ privé ou mécanique interdit : ${forbidden}`);
  }
  assert.ok(catalogue.entries.every(e => e.id && e.version && e.path && e.image && e.publicTemplate === undefined));
});

test('Serveur local : JSON public, sept emblèmes intègres et pas de chemin arbitraire', async t => {
  const server = await startStudioServer(0);
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const studioPage = await fetch(origin);
  assert.match(studioPage.headers.get('content-security-policy') ?? '', /connect-src[^;]+\/catalogue-organisations\.json/);
  const playerPage = await fetch(`${origin}/joueur`);
  assert.match(playerPage.headers.get('content-security-policy') ?? '', /connect-src 'none'/);
  const json = await fetch(`${origin}/catalogue-organisations.json`);
  assert.equal(json.status, 200);
  assert.deepEqual((await json.json()).entries.map(({ id }) => id), catalogue.entries.map(({ id }) => id));
  for (const entry of catalogue.entries) {
    const target = `/images/organisations/${entry.image}`;
    assert.ok(studioAssets.has(target));
    const response = await fetch(`${origin}${target}`);
    assert.equal(response.status, 200, target);
    assert.match(response.headers.get('content-type') ?? '', /image\/svg\+xml/);
    assert.match(await response.text(), /^<svg/);
  }
  assert.equal((await fetch(`${origin}/images/organisations/secret-mj.svg`)).status, 404);
});
