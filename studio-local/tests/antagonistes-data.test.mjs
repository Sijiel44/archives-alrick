import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { LIBRARY_ILLUSTRATIONS, buildLibraryIndex, libraryReference } from '../bibliotheque.mjs';
import { startStudioServer, studioAssets } from '../serve.mjs';
import catalogue from '../catalogue-antagonistes.json' with { type: 'json' };

const root = fileURLToPath(new URL('../../', import.meta.url));
const sourceFile = path => fileURLToPath(new URL(`../../${path}`, import.meta.url));
const hash = path => execFileSync('git', ['hash-object', path], { cwd: root, encoding: 'utf8' }).trim();

test('Vingt antagonistes du canon : niveaux narratifs, stades, Chutes et sources', () => {
  assert.equal(catalogue.schema, 'entre-rives/antagonistes-publics/1');
  assert.equal(catalogue.visibility, 'public');
  assert.equal(catalogue.rulesStatus, 'narrative_levels_only');
  assert.equal(catalogue.entries.length, 20);
  assert.deepEqual(catalogue.entries.map(entry => entry.levelIntent), [2, 3, 5, 7, 8, 10, 12, 15, 17, 20, 4, 6, 9, 11, 14, 18, 2, 8, 13, 19]);
  const entries = buildLibraryIndex([]);
  const ids = new Set();
  for (const character of catalogue.entries) {
    assert.match(character.id, /^PER-DECH-(?:0[1-9]|1[0-9]|20)$/);
    assert.equal(ids.has(character.id), false);
    ids.add(character.id);
    assert.ok(['Tentation', 'Fêlure', 'Rupture', 'Déchéance', 'Abîme'].includes(character.corruptionStage));
    const page = readFileSync(sourceFile(character.path), 'utf8');
    assert.match(page, new RegExp(`^code: "${character.id}"$`, 'm'));
    assert.match(page, /^publish: true$/m);
    assert.match(page, /^canon_statut: "lore_valide"$/m);
    assert.match(page, new RegExp(String.raw`\*\*Niveau de référence : ${character.levelIntent}\b`));
    assert.equal(hash(character.path), character.version, `${character.id} : source changée sans version`);
    if (['Rupture', 'Déchéance', 'Abîme'].includes(character.corruptionStage)) {
      assert.match(page, /Chute liée|Chutes liées|branches distinctes/, `${character.id} : seuil de Déchéance sans branche décrite`);
    }
    const image = readFileSync(sourceFile(`quartz/static/images/personnages-dechus/${character.image}`), 'utf8');
    assert.match(image, /^<svg[^>]*role="img"/);
    assert.doesNotMatch(image, /<script|<foreignObject|\bon\w+\s*=|\bhref=/i);
    const reference = libraryReference(character.id);
    assert.equal(reference?.kind, 'npc');
    assert.equal(reference?.shelf, 'factions');
    assert.equal(reference?.status, 'lore');
    assert.equal(reference?.version, character.version);
    assert.equal(reference?.level, undefined, 'Un niveau indicatif ne doit pas devenir un profil de combat');
    assert.equal(reference?.publicTemplate?.role, character.role);
    assert.equal(libraryReference(character.path), reference);
    assert.ok(LIBRARY_ILLUSTRATIONS.includes(reference));
    assert.ok(entries.some(entry => entry.id === character.id));
  }
  for (const entry of catalogue.entries) for (const related of [...entry.relations, ...entry.factions]) {
    assert.ok(ids.has(related) || /^ORG-DECH-0[1-6]$/.test(related));
  }
});

test('Les profils publics ne transportent ni chiffres de combat ni secrets de campagne', () => {
  const data = JSON.stringify(catalogue).toLowerCase();
  for (const forbidden of ['secret mj', 'hidden', 'campaign_id', 'campagne_id', 'pvmax', 'defense', 'degats', 'mana', 'lieur_id']) {
    assert.equal(data.includes(forbidden), false, `Champ confidentiel ou mécanique interdit : ${forbidden}`);
  }
  assert.ok(catalogue.entries.every(entry => entry.levelIntent >= 2 && entry.levelIntent <= 20 && entry.artAlt));
});

test('Studio : JSON, portraits SVG et CSP limités au rayon MJ', async t => {
  const server = await startStudioServer(0);
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const studio = await fetch(origin);
  assert.match(studio.headers.get('content-security-policy') ?? '', /connect-src[^;]+\/catalogue-antagonistes\.json/);
  const player = await fetch(`${origin}/joueur`);
  assert.match(player.headers.get('content-security-policy') ?? '', /connect-src 'none'/);
  const response = await fetch(`${origin}/catalogue-antagonistes.json`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).entries.length, 20);
  for (const entry of catalogue.entries) {
    const target = `/images/personnages-dechus/${entry.image}`;
    assert.ok(studioAssets.has(target));
    const illustration = await fetch(`${origin}${target}`);
    assert.equal(illustration.status, 200);
    assert.match(illustration.headers.get('content-type') ?? '', /image\/svg\+xml/);
  }
  assert.equal((await fetch(`${origin}/images/personnages-dechus/dossier-secret.svg`)).status, 404);
});
