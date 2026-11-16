import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import YAML from 'yaml';
import bestiaire from '../catalogue-bestiaire.json' with { type: 'json' };
import { buildLibraryIndex, creatureReference, libraryReference } from '../bibliotheque.mjs';
import { readStudioAsset, studioAssets } from '../serve.mjs';

const root = new URL('../../', import.meta.url);
const docs = ['ESP-ER-001', 'ESP-ER-002', 'ESP-ER-003', 'ESP-ER-004', 'ESP-ER-005', 'ESP-ER-006',
  'INDC-ER-001', 'INDC-ER-002', 'INDC-ER-003'];

test('Bestiaire publié : douze sources dont neuf créations sans collision, versions exactes et aucun secret MJ', async () => {
  assert.equal(bestiaire.schema, 'entre-rives.studio.bestiary-references.v1');
  assert.equal(bestiaire.entries.length, 12);
  assert.equal(new Set(bestiaire.entries.map(entry => entry.id)).size, 12);
  const library = buildLibraryIndex([]);
  assert.equal(library.length, new Set(library.map(entry => entry.id)).size, 'IDs du catalogue global sans collision');
  for (const entry of bestiaire.entries) {
    assert.equal(entry.kind, 'creature');
    assert.equal(entry.status, 'lore');
    assert.equal(entry.shelf, 'bestiaire');
    assert.match(entry.version, /^[a-f0-9]{40}$/);
    assert.equal(libraryReference(entry.id)?.version, entry.version);
    assert.equal(creatureReference({ id: entry.id, version: entry.version })?.id, entry.id);
    assert.equal(creatureReference({ id: entry.id, version: 'unknown' }), undefined);
    const path = new URL(entry.path, root);
    const text = await readFile(path, 'utf8');
    const frontmatter = /^---\n([\s\S]*?)\n---/.exec(text);
    assert.ok(frontmatter, 'frontmatter absent : ' + entry.id);
    const meta = YAML.parse(frontmatter[1]);
    assert.equal(meta.publish, true);
    assert.equal(meta.canon_statut, 'lore_valide');
    assert.equal(meta.spoilers === true, false);
    assert.equal(meta.unlisted === true, false);
    const gitSha = execFileSync('git', ['hash-object', entry.path], { cwd: root, encoding: 'utf8' }).trim();
    assert.equal(entry.version, gitSha, 'version documentaire différente de son blob : ' + entry.id);
    assert.doesNotMatch(JSON.stringify(entry), /privateNotes|secretMJ|scenePrivee|pvMax|baseDamage|penetration/);
    if (entry.art) {
      assert.match(entry.art.alt, /\S/);
      const asset = studioAssets.get(new URL(entry.art.src, 'http://local/studio/').pathname.replace('/studio/', '/'));
      assert.ok(asset, 'image non servie : ' + entry.art.src);
      assert.ok((await readStudioAsset(asset)).length > 10_000);
    }
  }
  for (const id of docs) assert.ok(libraryReference(id));
  assert.equal(libraryReference('gardien-des-salines')?.version, 1, 'ancienne identité rompue');
  assert.equal(libraryReference('renarde-de-brume')?.version, 1, 'ancienne identité rompue');
  assert.equal(libraryReference('heron-des-lanternes')?.version, 1, 'ancienne identité rompue');
  assert.equal(libraryReference('P09'), undefined, 'P09 n’est pas une référence documentaire du lot');
});

