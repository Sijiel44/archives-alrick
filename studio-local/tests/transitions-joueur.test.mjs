import assert from 'node:assert/strict';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

async function prepareAmbiances(page, url) {
  await page.goto(url);
  await page.locator('#campaign-name').fill('Les Veilles du Gué');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  await page.locator('#add-scene').click();
  await page.locator('#scene-title').fill('Le gué');
  await page.locator('#scene-form button[type=submit]').click();
  await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-play').click();
  for (const [name, title, image] of [
    ['Départ privé', 'Les lanternes brillent', ''],
    ['Arrivée privée', 'Le passeur apparaît', 'image-gardien-des-salines'],
  ]) {
    await page.locator('#play-ambiances').getByRole('button', { name: 'Ajouter une ambiance' }).click();
    await page.locator('#ambiance-name').fill(name);
    await page.locator('#ambiance-title').fill(title);
    await page.locator('#ambiance-image').selectOption(image);
    await page.locator('#ambiance-form button[type=submit]').click();
    await page.locator('#ambiance-dialog').waitFor({ state: 'hidden' });
  }
}

function openAmbiance(page, name) {
  return page.getByRole('button', { name: 'Préparer l’ambiance ' + name, exact: true }).click();
}

function shownFrame(player) {
  return player.frameLocator('#player-sheet iframe:not([hidden])');
}

async function firstWindow(page, context) {
  await openAmbiance(page, 'Départ privé');
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  await shownFrame(player).getByRole('heading', { name: 'Les lanternes brillent' }).waitFor();
  return player;
}

test('Préparer, annuler et remplacer une ambiance dans la même fenêtre', { timeout: 55000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open('transition-joueur', { viewport: { width: 1440, height: 950 } });
  await prepareAmbiances(page, fixture.url);
  const player = await firstWindow(page, context);
  const originalUrl = player.url();
  const previous = shownFrame(player).getByRole('heading', { name: 'Les lanternes brillent' });
  let popupCount = 0;
  context.on('page', () => { popupCount += 1; });
  const requested = Promise.withResolvers();
  const release = Promise.withResolvers();
  await page.route('**/media/gardien-des-salines.webp', async route => {
    requested.resolve();
    await release.promise;
    await route.continue();
  });
  const modal = page.locator('#player-share-dialog');
  const confirm = modal.getByRole('button', { name: 'Remplacer dans la fenêtre joueur' });
  await openAmbiance(page, 'Arrivée privée');
  await requested.promise;
  try {
    await modal.getByText('Préparation de l’image…').waitFor();
    assert.equal(await confirm.isDisabled(), true);
    await previous.waitFor();
  } finally {
    release.resolve();
  }
  await page.frameLocator('#player-share-preview iframe').locator('img').evaluate(image => image.decode());
  await modal.getByRole('button', { name: 'Annuler' }).click();
  await previous.waitFor();

  await openAmbiance(page, 'Arrivée privée');
  await page.frameLocator('#player-share-preview iframe').locator('img').evaluate(image => image.decode());
  const preview = await page.locator('#player-share-preview iframe').getAttribute('srcdoc');
  assert.doesNotMatch(preview, /Arrivée privée|Départ privé|Les lanternes brillent/);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await modal.evaluate(el => el.scrollWidth <= el.clientWidth));
  }
  // Retenir le signal de chargement pour observer les deux documents avant la bascule.
  await player.evaluate(() => {
    const hold = event => {
      const frame = event.target;
      if (!frame.matches?.('#player-sheet iframe[hidden]')) return;
      event.stopImmediatePropagation();
      window.releaseStagedFrame = () => {
        document.removeEventListener('load', hold, true);
        frame.dispatchEvent(new Event('load'));
      };
    };
    document.addEventListener('load', hold, true);
  });
  await confirm.click();
  await player.waitForFunction(() => typeof window.releaseStagedFrame === 'function');
  await previous.waitFor();
  assert.equal(await player.locator('#player-sheet iframe:visible').count(), 1);
  await player.evaluate(() => window.releaseStagedFrame());
  const next = shownFrame(player);
  await next.getByRole('heading', { name: 'Le passeur apparaît' }).waitFor();
  await next.locator('img').evaluate(image => image.decode());
  assert.ok(await player.locator('#player-sheet iframe:visible').getAttribute('srcdoc') === preview);
  assert.equal(player.url(), originalUrl);
  assert.equal(popupCount, 0);
  assert.equal(await player.evaluate(() => window.opener === null), true);

  await openAmbiance(page, 'Départ privé');
  const closed = player.waitForEvent('close');
  await modal.getByRole('button', { name: 'Retirer la projection en cours' }).click();
  await closed;
  await modal.getByRole('button', { name: 'Ouvrir une fenêtre joueur' }).waitFor();
  await page.frameLocator('#player-share-preview iframe').getByRole('heading', { name: 'Les lanternes brillent' }).waitFor();
});

test('Fermer la fenêtre pendant l’aperçu et refuser un remplacement périmé', { timeout: 50000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open('transition-fermeture', { viewport: { width: 390, height: 844 } });
  await prepareAmbiances(page, fixture.url);
  const player = await firstWindow(page, context);
  await openAmbiance(page, 'Arrivée privée');
  const modal = page.locator('#player-share-dialog');
  await player.close();
  await modal.getByRole('button', { name: 'Ouvrir une fenêtre joueur' }).waitFor();
  assert.equal(await modal.getByRole('button', { name: 'Retirer la projection en cours' }).isVisible(), false);
  await page.frameLocator('#player-share-preview iframe').locator('img').evaluate(image => image.decode());
  const [replacement] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  await shownFrame(replacement).getByRole('heading', { name: 'Le passeur apparaît' }).waitFor();
  await openAmbiance(page, 'Départ privé');
  await page.evaluate(async () => {
    const { openStudioStore } = await import('/store.mjs');
    const store = await openStudioStore();
    try {
      const [campaign] = await store.list();
      await store.execute({ id: campaign.id, expectedRevision: campaign.revision, operationId: 'test-transition-perimee',
        type: 'save-character', data: { id: 'pj-fictif', name: 'Un voyageur', level: 1, notes: '' } });
    } finally { store.close(); }
  });
  const closed = replacement.waitForEvent('close');
  await modal.getByRole('button', { name: 'Remplacer dans la fenêtre joueur' }).click();
  await closed;
  await modal.getByRole('alert').getByText(/La campagne a changé/).waitFor();
  assert.equal(context.pages().length, 1);
});
