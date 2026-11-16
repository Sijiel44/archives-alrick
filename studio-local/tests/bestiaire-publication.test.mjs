import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import YAML from 'yaml';
import bestiaire from '../catalogue-bestiaire.json' with { type: 'json' };
import pnj from '../catalogue-pnj.json' with { type: 'json' };
import { buildLibraryIndex, creatureReference, inLibraryShelf, libraryReference } from '../bibliotheque.mjs';
import { readStudioAsset, studioAssets } from '../serve.mjs';

const root = new URL('../../', import.meta.url);
const docs = [...Array.from({ length: 32 }, (_, index) => `ESP-ER-${String(index + 1).padStart(3, '0')}`),
  'INDC-ER-001', 'INDC-ER-002', 'INDC-ER-003'];

test('Bestiaire publié : trente-cinq créations, dont trente-deux espèces, et trois dragons PNJ sans collision', async () => {
  assert.equal(bestiaire.schema, 'entre-rives.studio.bestiary-references.v1');
  assert.equal(bestiaire.entries.length, 35);
  assert.equal(new Set(bestiaire.entries.map(entry => entry.id)).size, 35);
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
    assert.equal(meta.code, entry.id);
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
  assert.equal(bestiaire.entries.filter(entry => entry.id.startsWith('ESP-ER-')).length, 32);
  for (const id of docs.filter(id => /^ESP-ER-0(1[3-9]|2[0-2])$/.test(id))) {
    const text = await readFile(new URL(libraryReference(id).path, root), 'utf8');
    assert.match(text, /Quêtes possibles/);
    assert.match(text, /Provenance et limites/);
  }
  assert.match((await readFile(new URL('content/creatures/ESP-ER-021-fee-aulnes.md', root), 'utf8')), /consentement|consentir/);
  for (const id of docs.filter(id => /^ESP-ER-0(2[3-9]|3[0-2])$/.test(id))) {
    const entry = libraryReference(id);
    const text = await readFile(new URL(entry.path, root), 'utf8');
    assert.match(text, /Trois quêtes possibles/);
    assert.match(text, /Profil et provenance/);
    const meta = YAML.parse(/^---\n([\s\S]*?)\n---/.exec(text)[1]);
    assert.equal(meta.illustration, entry.art.src.replace(/^\.\/media\//, '/studio/media/'));
  }
  assert.ok(pnj.entries.length >= 105, 'Le catalogue PNJ doit conserver les 102 références documentées et les trois dragons');
  const dragons = pnj.entries.filter(entry => /^DRG-0[123]$/.test(entry.id));
  assert.equal(dragons.length, 3);
  const previousVersions = ['f614d23e2e203996cba32e1c8acf91dc7df8f180',
    '0d9962ccad89060542a869fa1aace8f729df4bf3', 'eada3d6f1a78af6e72cc9a1ed567f6c217e784cf'];
  for (const dragon of dragons) {
    const entry = libraryReference(dragon.id);
    assert.equal(entry?.kind, 'npc', 'un dragon nommé n’est pas une espèce du bestiaire');
    assert.equal(entry?.shelf, 'pnj');
    assert.equal(inLibraryShelf(entry, 'pnj'), true);
    assert.equal(inLibraryShelf(entry, 'bestiaire'), false);
    assert.equal(entry?.version, dragon.version, 'révision draconique conservée');
    assert.equal(creatureReference({ id: dragon.id, version: dragon.version })?.id, dragon.id, 'copie historique toujours résolue');
    const source = await readFile(new URL(dragon.path, root), 'utf8');
    const frontmatter = /^---\n([\s\S]*?)\n---/.exec(source);
    assert.equal(YAML.parse(frontmatter[1]).categorie, 'personnage');
    assert.equal(execFileSync('git', ['hash-object', dragon.path], { cwd: root, encoding: 'utf8' }).trim(), dragon.version);
    const previous = previousVersions[dragons.indexOf(dragon)];
    assert.equal(creatureReference({ id: dragon.id, version: previous })?.version, previous, 'ancienne version de campagne conservée');
  }
  assert.equal(libraryReference('gardien-des-salines')?.version, 1, 'ancienne identité rompue');
  assert.equal(libraryReference('renarde-de-brume')?.version, 1, 'ancienne identité rompue');
  assert.equal(libraryReference('heron-des-lanternes')?.version, 1, 'ancienne identité rompue');
  assert.equal(libraryReference('P09'), undefined, 'P09 n’est pas une référence documentaire du lot');
});

