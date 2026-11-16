import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import sounds from '../catalogue-sons.json' with { type: 'json' };
import videos from '../catalogue-videos.json' with { type: 'json' };
import { MEDIA_ENTRIES, MEDIA_CATEGORIES, filterMedia, mediaCredit, validateMediaCatalogues } from '../medias-catalogue.mjs';

test('Le fonds commun conserve au moins cinquante sources distinctes par type avec leurs preuves de licence', () => {
  assert.equal(validateMediaCatalogues({ audio: sounds, video: videos }), true);
  assert.equal(MEDIA_ENTRIES.length, sounds.entries.length + videos.entries.length);
  for (const kind of ['audio', 'video']) {
    const entries = MEDIA_ENTRIES.filter(entry => entry.kind === kind);
    const ledger = readFileSync(new URL(kind === 'audio' ? '../MEDIAS-SONS-SOURCES.md' : '../MEDIAS-VIDEOS-SOURCES.md', import.meta.url), 'utf8');
    assert.ok(entries.length >= 50);
    assert.ok(new Set(entries.map(entry => entry.category)).size >= 6);
    for (const entry of entries) {
      assert.match(entry.url, /^https:\/\/upload\.wikimedia\.org\//);
      assert.match(entry.sourceUrl, /^https:\/\/commons\.wikimedia\.org\//);
      assert.match(entry.sourceUrl, /(?:oldid=\d+|\/wiki\/File:)/);
      assert.ok(ledger.includes(entry.id), `La preuve documentaire conserve ${entry.id}.`);
      assert.ok(['CC0-1.0', 'Public-Domain'].includes(entry.license));
      assert.doesNotMatch(entry.author, /<[^>]+>/);
      assert.ok(entry.licenseNote.trim());
      const credit = mediaCredit(entry);
      assert.ok(credit.length <= 600);
      assert.ok(credit.includes(entry.id));
      assert.ok(credit.includes(entry.license === 'CC0-1.0' ? 'CC0' : 'Domaine public'));
    }
  }
});

test('La recherche respecte le type et la catégorie ; une licence incompatible ou un doublon empêche le catalogue', () => {
  for (const kind of ['audio', 'video']) for (const category of Object.keys(MEDIA_CATEGORIES)) {
    const actual = filterMedia(MEDIA_ENTRIES, { kind, category });
    assert.deepEqual(actual, MEDIA_ENTRIES.filter(entry => entry.kind === kind && entry.category === category));
  }
  const match = MEDIA_ENTRIES.find(entry => /[éèêàùô]/.test(entry.name));
  assert.ok(match);
  const query = match.name.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
  assert.ok(filterMedia(MEDIA_ENTRIES, { query }).includes(match));
  for (const patch of [{ license: 'CC-BY-NC' }, { url: 'javascript:alert(1)' }, { licenseNote: '' }, { author: '' }]) {
    const changed = structuredClone(sounds); Object.assign(changed.entries[0], patch);
    assert.throws(() => validateMediaCatalogues({ audio: changed, video: videos }));
  }
  const duplicate = structuredClone(sounds); duplicate.entries[1].sourceUrl = duplicate.entries[0].sourceUrl;
  assert.throws(() => validateMediaCatalogues({ audio: duplicate, video: videos }));
});
