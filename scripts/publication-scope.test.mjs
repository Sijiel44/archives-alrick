import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { contentDocuments, isCampaignDocument, isPublicUniverse } from './publication-scope.mjs';

test('Les destinations distinguent campagne, univers, brouillon et secret', () => {
  const legacy = new Set(['personnages/ANCIEN.md']);
  const doc = (portee, extras = {}, filename = 'personnages/NOUVEAU.md') => ({ path: filename, fm: { publish: true, portee, ...extras } });
  assert(isCampaignDocument(doc('jdr_alrick'), legacy));
  assert(!isCampaignDocument(doc('univers_partage'), legacy));
  assert(!isCampaignDocument(doc(undefined), legacy));
  assert(isCampaignDocument(doc(undefined, {}, 'personnages/ANCIEN.md'), legacy));
  assert(!isCampaignDocument(doc('jdr_alrick', { publish: false }), legacy));
  assert(isPublicUniverse(doc('univers_partage')));
  for (const flag of [{ spoilers: true }, { unlisted: true }, { publish: false }, { visibilite: 'privee' }]) assert(!isPublicUniverse(doc('univers_partage', flag)));
  assert(!isPublicUniverse(doc('jdr_alrick')));
});
test('Les sources historiques et le dernier point de reprise sont préservés', async () => {
  const documents = await contentDocuments();
  const legacy = new Set(JSON.parse(await readFile('config/campaign-legacy.json', 'utf8')));
  assert.equal(legacy.size, JSON.parse(await readFile('config/campaign-legacy.json', 'utf8')).length);
  const selected = documents.filter(doc => isCampaignDocument(doc, legacy));
  assert(selected.some(doc => doc.path === 'jdr-alrick/cb44-bilan-et-reprise.md'));
  assert(selected.some(doc => doc.fm.code === 'PER-CB2-ORIN'));
  assert(selected.every(doc => doc.fm.portee !== 'univers_partage'));
  assert(!selected.some(doc => /^(ESP-ER-|PER-DECH-)/.test(doc.fm.code ?? '')));
});
