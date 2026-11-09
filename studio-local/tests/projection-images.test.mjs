import assert from 'node:assert/strict';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

async function decodedImage(frame) {
  const image = frame.locator('img');
  await image.waitFor();
  return image.evaluate(async el => {
    await el.decode();
    return { width: el.naturalWidth, height: el.naturalHeight, alt: el.alt, png: el.src.startsWith('data:image/png;base64,') };
  });
}

test('Une carte du catalogue peut être projetée seule depuis la bibliothèque', { timeout: 40000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open('projection-carte');
  await page.goto(fixture.url);
  await page.locator('#save-status').getByText('Stockage local prêt').waitFor();
  await page.locator('#nav-library').click();
  await page.locator('#catalogue-search').fill('Schéma des grands ensembles');
  await page.getByRole('button', { name: 'Voir la fiche de Schéma des grands ensembles' }).click();
  await page.getByRole('button', { name: 'Préparer la projection de l’image' }).click();
  const preview = page.locator('#player-share-preview iframe');
  const image = await decodedImage(page.frameLocator('#player-share-preview iframe'));
  assert.ok(image.png && image.width > 0 && image.height > 0 && image.width <= 2048 && image.height <= 2048);
  assert.match(image.alt, /Schéma documentaire/);
  assert.equal(await page.locator('#scene-share-fields').isVisible(), false);
  assert.equal(await page.locator('#player-share-fields').isVisible(), false);
  const srcdoc = await preview.getAttribute('srcdoc');
  assert.doesNotMatch(srcdoc, /\/media\/atlas\/|<svg\b|<h1>/);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.locator('#player-share-dialog').evaluate(el => el.scrollWidth <= el.clientWidth));
  }
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  const display = player.locator('#player-sheet iframe');
  await display.waitFor();
  assert.equal(await display.getAttribute('title'), 'Image de jeu');
  assert.ok(await display.getAttribute('srcdoc') === srcdoc, 'L’image présentée est exactement celle de l’aperçu.');
  const frame = player.frameLocator('#player-sheet iframe');
  assert.deepEqual(await decodedImage(frame), image);
  assert.equal(await frame.locator('img').evaluate(el =>
    performance.getEntriesByType('resource').some(entry => /^https?:/.test(entry.name))), false);
  assert.equal(await player.evaluate(() => self.origin), 'null');
  const stop = page.getByRole('button', { name: 'Retirer l’image de la fenêtre joueur' });
  await Promise.all([Promise.race([player.waitForEvent('close'), display.waitFor({ state: 'detached' })]), stop.click()]);
  await stop.waitFor({ state: 'hidden' });
});

test('Une scène propose ses portraits liés, ignore un ancien chargement et permet le repli', { timeout: 45000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open('projection-portrait', { viewport: { width: 390, height: 844 } });
  await page.goto(fixture.url);
  await page.locator('#campaign-name').fill('CANARI_CAMPAGNE');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  await page.locator('#add-scene').click();
  await page.locator('#scene-title').fill('Le gué');
  await page.locator('#scene-description').fill('CANARI_DESCRIPTION Le fleuve attend.');
  await page.locator('#scene-private-notes').fill('CANARI_NOTES [[gardien-des-salines]]');
  await page.locator('#scene-form button[type=submit]').click();
  await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-play').click();
  await page.locator('#quick-present').click();
  const select = page.getByLabel('Carte ou portrait à montrer');
  const portrait = 'image-gardien-des-salines';
  assert.equal(await select.inputValue(), '');
  assert.equal(await select.locator('optgroup[label="Fiches de cette scène"]').locator('option').getAttribute('value'), portrait);
  await page.locator('#scene-share-fields').getByRole('checkbox', { name: 'Titre de la scène' }).check();
  const mapPath = '**/media/atlas/schema-ensembles.svg';
  const mapRequested = Promise.withResolvers();
  const releaseMap = Promise.withResolvers();
  await page.route(mapPath, async route => {
    mapRequested.resolve();
    await releaseMap.promise;
    await route.abort();
  });
  await select.selectOption('carte-ensembles');
  await mapRequested.promise;
  assert.equal(await page.locator('#open-player-window').isDisabled(), true);
  await select.selectOption(portrait);
  const image = await decodedImage(page.frameLocator('#player-share-preview iframe'));
  assert.match(image.alt, /silhouette masquée/);
  const [failure] = await Promise.all([
    page.waitForEvent('requestfailed', { predicate: request => request.url().endsWith('/media/atlas/schema-ensembles.svg') }),
    Promise.resolve().then(() => releaseMap.resolve()),
  ]);
  assert.ok(failure);
  const preview = await page.locator('#player-share-preview iframe').getAttribute('srcdoc');
  assert.match(preview, /<h1>Le gué<\/h1>/);
  assert.doesNotMatch(preview, /CANARI|\/media\/|schema-ensembles/);

  await select.selectOption('carte-ensembles');
  await page.locator('#player-share-message').getByText(/Impossible de préparer cette image/).waitFor();
  assert.equal(await page.locator('#open-player-window').isDisabled(), true);
  await select.selectOption(portrait);
  await decodedImage(page.frameLocator('#player-share-preview iframe'));
  await page.locator('#show-player-here').click();
  assert.ok(await page.locator('#projection iframe').getAttribute('srcdoc') === preview);
  await page.locator('#stop-projection').click();
  assert.equal(await page.locator('#projection iframe').count(), 0);

  await page.locator('#quick-present').click();
  await select.selectOption(portrait);
  await decodedImage(page.frameLocator('#player-share-preview iframe'));
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  assert.deepEqual(await decodedImage(player.frameLocator('#player-sheet iframe')), image);
  await Promise.all([
    Promise.race([player.waitForEvent('close'), player.locator('#player-sheet iframe').waitFor({ state: 'detached' })]),
    page.locator('#edit-current-scene').click(),
  ]);
  await page.locator('#stop-player-window').waitFor({ state: 'hidden' });
});
