import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { ADVENTURE_SCENE_KEY, ADVENTURE_SOURCE_KEY, CREATIONS_KEY, FRESQUE_LINKS_KEY, readAdventurePackage } from '../store.mjs';
import { browserFixture } from './browser.mjs';

const adventureId = 'creation-guet-test-aventure';
const npcId = 'creation-guet-test-passeur';
const openingId = 'scene-guet-test-guet';
const exitId = 'scene-guet-test-berge';
const canary = 'CANARI_MJ_PAQUET';
const sceneText = 'Une barque attend sous les lanternes.';
const bundle = {
  format: 'chroniques-entre-rives.aventure', version: 1,
  source: { id: 'guet-test', version: 2, reference: 'Exemple fictif de recette' }, adventureId,
  creations: [
    { id: adventureId, kind: 'adventure', name: 'Le guet fictif', description: 'À qui appartient la barque ?', notes: canary,
      state: 'ready', parentId: null, links: [npcId],
      details: { hook: 'Trouver la barque', audience: 'Débutants', scenes: 'Le guet\nLa berge', outcomes: 'Choisir qui traverse.' } },
    { id: npcId, kind: 'npc', name: 'Le passeur du test', description: '', notes: `${canary} · Témoignage`,
      state: 'ready', parentId: null, links: [], details: { role: 'Passeur', motivation: '', relations: '' } },
  ],
  scenes: [
    { id: openingId, title: 'Le guet', description: sceneText, privateNotes: `${canary} · Une barque de secours`, referenceIds: [npcId] },
    { id: exitId, title: 'La berge', description: '', privateNotes: '', referenceIds: [] },
  ],
  links: [{ id: 'branche-guet-test-passage', fromId: openingId, toId: exitId, label: 'Si les PJ passent' }],
};

function file(value) {
  return { name: 'aventure-test.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) };
}

test('Le paquet refuse une version inconnue, une dépendance absente et des champs non pris en charge', () => {
  assert.deepEqual(readAdventurePackage(JSON.stringify(bundle)), bundle);
  assert.throws(() => readAdventurePackage(JSON.stringify({ ...bundle, version: 9 })), { code: 'adventure-version' });
  assert.throws(() => readAdventurePackage(JSON.stringify({ ...bundle, scripts: ['example'] })), { code: 'invalid-adventure' });
  const missing = structuredClone(bundle);
  missing.scenes[0].referenceIds.push('creation-guet-test-introuvable');
  assert.throws(() => readAdventurePackage(JSON.stringify(missing)), { code: 'foreign-key' });
  const badBranch = structuredClone(bundle);
  badBranch.links[0].toId = 'scene-guet-test-introuvable';
  assert.throws(() => readAdventurePackage(JSON.stringify(badBranch)), { code: 'foreign-key' });
});

test('Une collision laisse la campagne intacte et le même import peut être rejoué', { timeout: 30000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('adventure-atomic');
  await page.goto(fixture.url);
  const outcome = await page.evaluate(async ({ bundle, openingId }) => {
    const { openStudioStore, CREATIONS_KEY } = await import('/store.mjs');
    const store = await openStudioStore({ name: 'adventure-atomic-test' });
    const run = (id, expectedRevision, type, operationId, data) => store.execute({ id, expectedRevision, type, operationId, data });
    const start = { name: 'Une campagne fictive', description: '', style: 'campaign', startingLevel: 1 };
    try {
      await run('collision', 0, 'create', 'create-collision', start);
      await run('collision', 1, 'save-scene', 'save-collision', {
        id: openingId, title: 'Scène déjà existante', description: '', privateNotes: '', participantIds: [],
      });
      const collision = await run('collision', 2, 'import-adventure', 'import-collision', { bundle })
        .then(() => 'accepted', error => error.code);
      const untouched = await store.get('collision');
      await run('other', 0, 'create', 'create-other', start);
      await run('other', 1, 'import-adventure', 'import-other', { bundle });
      const replay = await run('other', 1, 'import-adventure', 'import-other', { bundle });
      return { collision, originalRevision: untouched.revision, titles: untouched.scenes.map(scene => scene.title),
        hasCreations: Object.hasOwn(untouched, CREATIONS_KEY), replayRevision: replay.revision, resume: replay.activeSceneId };
    } finally { store.close(); }
  }, { bundle, openingId });
  assert.deepEqual(outcome, { collision: 'foreign-key', originalRevision: 2, titles: ['Scène déjà existante'],
    hasCreations: false, replayRevision: 2, resume: openingId });
});

test('Un scénario local est prévisualisé, joué et restauré sans diffuser ses notes MJ', { timeout: 55000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open('aventure-import', { viewport: { width: 390, height: 844 } });
  await page.goto(fixture.url);
  await page.locator('#campaign-name').fill('Campagne du guet');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#add-scene').click();
  await page.locator('#scene-title').fill('Point de reprise existant');
  await page.locator('#scene-form button[type=submit]').click();
  await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  await page.locator('#fresque-adventures').click();
  await page.locator('#library-import-adventure').click();
  const input = page.locator('#adventure-import-file');
  const submit = page.locator('#adventure-import-submit');
  await input.setInputFiles(file({ ...bundle, version: 9 }));
  const dialog = page.locator('#adventure-import-dialog');
  await dialog.getByRole('alert').getByText(/version de fichier d’aventure/).waitFor();
  assert.equal(await submit.isDisabled(), true);
  await input.setInputFiles(file(bundle));
  await dialog.getByText('À qui appartient la barque ?', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'adventure-import-name');
  await dialog.locator('summary').click();
  await dialog.getByText(/Notes MJ · CANARI_MJ_PAQUET/).waitFor();
  assert.ok(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth));
  assert.equal(await page.locator('#scene-list .scene-card').count(), 1);
  await submit.click();
  await dialog.waitFor({ state: 'hidden' });
  const cards = page.locator('#scene-list .scene-card');
  assert.deepEqual(await cards.locator('h3').allTextContents(), ['Point de reprise existant', 'Le guet', 'La berge']);
  assert.equal(await cards.first().getAttribute('aria-current'), 'true');
  assert.equal(await cards.nth(1).evaluate(element => element === document.activeElement), true);
  await cards.nth(1).getByText('Si les PJ passent', { exact: true }).waitFor();

  await page.locator('#import-adventure').click();
  await input.setInputFiles(file({ ...bundle, source: { ...bundle.source, version: 3 } }));
  await dialog.getByText('Cette aventure est déjà importée dans cette campagne.').waitFor();
  assert.equal(await submit.isDisabled(), true);
  page.once('dialog', event => event.accept());
  await dialog.getByRole('button', { name: 'Annuler', exact: true }).click();
  await cards.nth(1).getByRole('button', { name: 'Jouer Le guet', exact: true }).click();
  await page.locator('#play-adventure').getByRole('link', { name: 'Le passeur du test' }).click();
  await page.locator('#resource-creation-notes summary').click();
  await page.locator('#resource-creation-notes').getByText(`${canary} · Témoignage`, { exact: true }).waitFor();
  await page.keyboard.press('Escape');
  await page.locator('#quick-present').click();
  await page.locator('#scene-share-fields').getByRole('checkbox', { name: 'Texte de la scène' }).check();
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  const projection = player.locator('#player-sheet iframe');
  await projection.waitFor();
  const projected = await projection.getAttribute('srcdoc');
  assert.ok(projected.includes(sceneText));
  assert.doesNotMatch(projected, /CANARI_MJ_PAQUET|Le passeur du test|Si les PJ passent|Le guet fictif/);
  await page.locator('#stop-player-window').click();

  await page.locator('#nav-archive').click();
  await page.locator('#add-session').click();
  await page.locator('#session-title').fill('La traversée du guet');
  await page.locator('#session-scene-options').getByRole('checkbox', { name: 'Le guet', exact: true }).check();
  await page.locator('#archive-form button[type=submit]').click();
  await page.locator('#archive-dialog').waitFor({ state: 'hidden' });
  await page.locator('#archive-confirmed').getByText('Le guet', { exact: true }).waitFor();
  await page.locator('#nav-backups').click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const buffer = await readFile(await download.path());
  const archive = JSON.parse(buffer);
  assert.equal(archive.version, 16);
  const { campaign, journal } = archive.payload;
  assert.equal(journal.filter(event => event.type === 'import-adventure').length, 1);
  assert.deepEqual(campaign[CREATIONS_KEY].find(entry => entry.id === adventureId)[ADVENTURE_SOURCE_KEY], bundle.source);
  assert.deepEqual(campaign[FRESQUE_LINKS_KEY], bundle.links);
  assert.deepEqual(campaign.scenes[1][ADVENTURE_SCENE_KEY].referenceIds, [npcId]);

  const { page: restored } = await fixture.open('aventure-restauree');
  await restored.goto(fixture.url);
  await restored.locator('#save-status').filter({ hasText: 'Stockage local prêt' }).waitFor();
  await restored.locator('#nav-backups').click();
  await restored.locator('#backup-file').setInputFiles(file({ ...archive, version: 15 }));
  await restored.getByRole('alert').getByText(/version incompatible/).waitFor();
  await restored.locator('#backup-file').setInputFiles({ ...file(archive), buffer });
  await restored.locator('#restore-backup').click();
  await restored.locator('#nav-play').click();
  await restored.locator('#play-adventure').getByRole('link', { name: 'Le guet fictif' }).click();
  await restored.locator('#resource-provenance').getByText(/Exemple fictif de recette · version 2/).waitFor();
});
