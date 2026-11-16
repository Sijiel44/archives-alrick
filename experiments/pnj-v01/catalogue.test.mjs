import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { selection } from './selection.mjs';
import { buildStudioCatalogue, publicNpcEntries } from './build-studio-catalogue.mjs';

test('Le rayon PNJ réunit les 102 fiches publiques et conserve les trois dragons', async () => {
  const actual = await buildStudioCatalogue();
  const committed = JSON.parse(await readFile(new URL('../../studio-local/catalogue-pnj.json', import.meta.url)));
  assert.deepEqual(committed, actual, 'Relancer node experiments/pnj-v01/build-studio-catalogue.mjs');
  assert.equal(actual.entries.length, selection.length + 3);
  assert.deepEqual(actual.entries.slice(0, 3).map(record => record.id), ['DRG-01', 'DRG-02', 'DRG-03']);
  assert.equal(new Set(actual.entries.map(record => record.id)).size, actual.entries.length);
});

test('Chaque personnage source est publié, unique et associé à un avertissement si nécessaire', async () => {
  const entries = await publicNpcEntries();
  assert.equal(entries.length, selection.length);
  for (const entry of entries) {
    const markdown = await readFile(new URL(`../../${entry.path}`, import.meta.url), 'utf8');
    const metadata = markdown.split(/^---\s*$/m)[1];
    assert.match(metadata, /^publish:\s*true$/m, entry.id);
    if (/^spoilers:\s*true$/m.test(metadata)) {
      assert.match(metadata, /^unlisted:\s*true$/m, entry.id);
      assert.match(entry.description, /Révélations/);
      assert.ok(entry.details.some(([label]) => label === 'Révélations'));
    }
    assert.equal(entry.kind, 'npc');
    assert.equal(entry.shelf, 'pnj');
    assert.equal(entry.status, 'reference');
    assert.ok(entry.details.every(pair => pair.length === 2));
  }
  assert.ok(selection.length >= 102);
  assert.ok(entries.filter(entry => entry.art).length >= 21);
  for (const entry of entries.filter(entry => entry.art)) {
    const image = new URL(entry.art.src);
    assert.equal(image.protocol, 'https:');
    assert.ok(['sijiel44.github.io', 'upload.wikimedia.org', 'thumb.wikimedia.org'].includes(image.host));
    if (image.host === 'sijiel44.github.io') {
      assert.match(image.pathname, /^\/archives-alrick\/images\/personnages\/[a-z0-9-]+\.webp$/);
      assert.match(entry.art.alt, /non canonique/);
    } else assert.match(entry.art.alt, /Inspiration visuelle externe/);
  }
  assert.equal(entries.filter(entry => /REV-0[1-8]\.md$/.test(entry.path)).length, 8);
});
