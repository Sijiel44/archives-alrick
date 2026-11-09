import assert from 'node:assert/strict';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

const title = 'TITRE_CANARI Le pont';
const description = 'Une lueur monte du fleuve.\n<img src=x onerror=alert(1)>';
const notes = 'NOTE_CANARI Un passage sous la berge';

async function prepareScenes(page, url) {
  await page.goto(url);
  await page.locator('#campaign-name').fill('CAMPAGNE_CANARI Les Veilles');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  const form = page.locator('#scene-form');
  for (const sceneTitle of [title, 'Le chemin de rive']) {
    await page.locator('#add-scene').click();
    await page.locator('#scene-title').fill(sceneTitle);
    if (sceneTitle === title) {
      await page.locator('#scene-description').fill(description);
      await page.locator('#scene-private-notes').fill(notes);
    }
    await form.locator('button[type=submit]').click();
    await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  }
  await page.locator('#nav-play').click();
}

async function openProjection(page, context) {
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  await player.locator('#player-sheet iframe').waitFor();
  return player;
}

async function withdrawn(player, action) {
  await Promise.all([Promise.race([
    player.waitForEvent('close'),
    player.getByText('La présentation a été retirée par le MJ.', { exact: true }).waitFor(),
  ]), action()]);
  if (!player.isClosed()) assert.equal(await player.locator('#player-sheet iframe').count(), 0);
}

test('Scène projetée dans la fenêtre isolée, sélection exacte et retrait', { timeout: 60000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open('projection-scene', { viewport: { width: 1440, height: 950 } });
  await prepareScenes(page, fixture.url);
  await page.locator('#quick-present').click();
  const modal = page.locator('#player-share-dialog');
  await modal.getByRole('heading', { name: 'Préparer la projection de scène' }).waitFor();
  const fields = page.locator('#scene-share-fields');
  assert.equal(await fields.locator('input:checked').count(), 0);
  assert.equal(await page.locator('#open-player-window').isDisabled(), true);
  assert.equal(await page.locator('#player-share-fields').isVisible(), false);
  await fields.getByRole('checkbox', { name: 'Texte de la scène' }).check();
  const preview = await page.locator('#player-share-preview iframe').getAttribute('srcdoc');
  assert.match(preview, /Une lueur monte du fleuve/);
  assert.match(preview, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(preview, /TITRE_CANARI|NOTE_CANARI|CAMPAGNE_CANARI/);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await modal.evaluate(el => el.scrollWidth <= el.clientWidth), 'aperçu à ' + width + 'px');
  }
  const player = await openProjection(page, context);
  const frame = player.locator('#player-sheet iframe');
  assert.equal(await frame.getAttribute('srcdoc'), preview);
  assert.equal(await frame.getAttribute('sandbox'), '');
  assert.equal(await frame.getAttribute('title'), 'Scène de jeu');
  const display = player.frameLocator('#player-sheet iframe');
  await display.getByText(/Une lueur monte du fleuve/).waitFor();
  assert.equal(await display.locator('img').count(), 0);
  assert.deepEqual(await player.evaluate(() => {
    function errorOf(read) { try { read(); return null; } catch (error) { return error.name; } }
    return { origin: self.origin, opener: window.opener === null,
      local: errorOf(() => localStorage.length), indexedDB: errorOf(() => indexedDB.open('test-confinement')) };
  }), { origin: 'null', opener: true, local: 'SecurityError', indexedDB: 'SecurityError' });
  const stop = page.getByRole('button', { name: 'Retirer la scène de la fenêtre joueur' });
  await withdrawn(player, () => stop.click());
  await stop.waitFor({ state: 'hidden' });

  await page.locator('#prepare-scene-share').click();
  assert.equal(await fields.locator('input:checked').count(), 0);
  await fields.getByRole('checkbox', { name: 'Titre de la scène' }).check();
  const second = await openProjection(page, context);
  const titleOnly = await second.locator('#player-sheet iframe').getAttribute('srcdoc');
  assert.match(titleOnly, /TITRE_CANARI/);
  assert.doesNotMatch(titleOnly, /Une lueur|NOTE_CANARI/);
  await withdrawn(second, () => page.locator('#jump-scene').selectOption({ label: 'Le chemin de rive' }));
  await page.locator('#current-scene-title').getByText('Le chemin de rive', { exact: true }).waitFor();

  await page.locator('#quick-present').click();
  await fields.getByRole('checkbox', { name: 'Titre de la scène' }).check();
  const third = await openProjection(page, context);
  const tab = await context.newPage();
  await tab.goto(fixture.url);
  await tab.getByRole('button', { name: 'Ouvrir CAMPAGNE_CANARI Les Veilles', exact: true }).click();
  await tab.locator('#add-character').click();
  await tab.locator('#character-name').fill('PJ fictif');
  await withdrawn(third, () => tab.locator('#character-form button[type=submit]').click());
  await stop.waitFor({ state: 'hidden' });
});

test('La scène garde un affichage sur place et refuse un aperçu périmé', { timeout: 40000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('projection-secours', { viewport: { width: 390, height: 844 } });
  await prepareScenes(page, fixture.url);
  await page.evaluate(() => { window.open = () => null; });
  await page.locator('#quick-present').click();
  await page.locator('#scene-share-fields').getByRole('checkbox', { name: 'Texte de la scène' }).check();
  const preview = await page.locator('#player-share-preview iframe').getAttribute('srcdoc');
  await page.locator('#open-player-window').click();
  await page.locator('#player-share-message').getByText(/bloquée par le navigateur/).waitFor();
  await page.locator('#show-player-here').click();
  await page.locator('#projection-dialog').waitFor();
  assert.equal(await page.locator('#projection iframe').getAttribute('srcdoc'), preview);
  await page.locator('#stop-projection').click();
  assert.equal(await page.locator('#projection iframe').count(), 0);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'quick-present');

  await page.locator('#quick-present').click();
  await page.locator('#scene-share-fields').getByRole('checkbox', { name: 'Titre de la scène' }).check();
  await page.evaluate(async () => {
    const { openStudioStore } = await import('/store.mjs');
    const db = await openStudioStore();
    try {
      const [campaign] = await db.list();
      await db.execute({ id: campaign.id, expectedRevision: campaign.revision, operationId: 'test-scene-perimee',
        type: 'select-scene', data: { id: campaign.scenes[1].id } });
    } finally { db.close(); }
  });
  await page.locator('#show-player-here').click();
  await page.locator('#player-share-message').getByText(/La campagne a changé/).waitFor();
  assert.equal(await page.locator('#projection iframe').count(), 0);
});
