import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { selection } from './selection.mjs';
import { buildStudioCatalogue, publicNpcEntries } from './build-studio-catalogue.mjs';

test('Le rayon PNJ affiche les sources publiques et conserve les trois dragons', async () => {
  const actual = await buildStudioCatalogue();
  const committed = JSON.parse(await readFile(new URL('../../studio-local/catalogue-pnj.json', import.meta.url)));
  assert.deepEqual(committed, actual, 'Relancer node experiments/pnj-v01/build-studio-catalogue.mjs');
  assert.equal(actual.entries.length, 16);
  assert.deepEqual(actual.entries.slice(0, 3).map(record => record.id), ['DRG-01', 'DRG-02', 'DRG-03']);
  assert.equal(new Set(actual.entries.map(record => record.id)).size, actual.entries.length);
});

test('Seules les sources publiées, listées et sans révélations entrent dans le Studio', async () => {
  const entries = await publicNpcEntries();
  assert.equal(entries.length, 13);
  for (const entry of entries) {
    const markdown = await readFile(new URL(`../../${entry.path}`, import.meta.url), 'utf8');
    const metadata = markdown.split(/^---\s*$/m)[1];
    assert.match(metadata, /^publish:\s*true$/m, entry.id);
    assert.doesNotMatch(metadata, /^unlisted:\s*true$/m, entry.id);
    assert.doesNotMatch(metadata, /^spoilers:\s*true$/m, entry.id);
    assert.equal(entry.kind, 'npc');
    assert.equal(entry.shelf, 'pnj');
    assert.equal(entry.status, 'reference');
    assert.ok(entry.details.every(pair => pair.length === 2));
  }
  assert.equal(selection.slice(0, 90).length, 90);
  assert.equal(entries.filter(entry => entry.art).length, 3);
  for (const entry of entries.filter(entry => entry.art)) {
    const image = new URL(entry.art.src);
    assert.equal(image.protocol, 'https:');
    assert.equal(image.host, 'sijiel44.github.io');
    assert.match(image.pathname, /^\/archives-alrick\/images\/personnages\/[a-z0-9-]+\.webp$/);
    assert.match(entry.art.alt, /non canonique/);
  }
  assert.ok(!entries.some(entry => /REV-0[1-8]\.md$/.test(entry.path)), 'La compagnie masquée ne doit pas être divulguée par le catalogue public.');
});
