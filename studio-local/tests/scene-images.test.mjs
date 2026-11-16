import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';
import { SCENE_IMAGES_KEY, validSceneImage, validateSceneImages } from '../scene-images.mjs';
const imageUrl = 'https://images.test/village.webp';
const bytes = await readFile(new URL('../media/gardien-des-salines.webp', import.meta.url));
async function seed(page, url) {
  await page.goto(url); await page.locator('#save-status').getByText('Stockage local prêt').waitFor();
  await page.locator('#campaign-name').fill('Table des images'); await page.locator('#create-campaign-submit').click();
  await page.locator('#add-scene').click(); await page.locator('#scene-title').fill('Le village');
  await page.locator('#scene-description').fill('Une place près du puits.'); await page.locator('#scene-private-notes').fill('SECRET_IMAGE_MJ');
  await page.locator('#scene-form button[type=submit]').click(); await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
}
const value = (sceneId = 'scene') => ({ sceneId, url: imageUrl, alt: 'La place du village', credit: 'CREDIT_PRIVE_IMAGE', mode: 'contain' });
test('Les images de scène valident lien, mode et référence de scène', () => {
  assert.ok(validSceneImage(value()));
  for (const patch of [{ url: 'javascript:alert(1)' }, { url: 'https://a:b@images.test/x' }, { alt: '' }, { mode: 'script' }, { extra: true }]) assert.equal(validSceneImage({ ...value(), ...patch }), false);
  assert.throws(() => validateSceneImages([value('absent')], new Set(['scene'])));
  assert.throws(() => validateSceneImages([value(), value()], new Set(['scene'])));
});
test('La scène se prépare par lien et cadrage sans diffusion puis se projette sans URL ni crédit privés', { timeout: 50000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('scene-images', { viewport: { width: 390, height: 844 } });
  const requests = [];
  await context.route(imageUrl, route => { requests.push(route.request()); return route.fulfill({ contentType: 'image/webp', headers: { 'Access-Control-Allow-Origin': '*' }, body: bytes }); });
  await seed(page, f.url);
  await page.getByRole('button', { name: 'Illustrer Le village', exact: true }).click();
  await page.locator('#scene-image-url').fill(imageUrl); await page.locator('#scene-image-alt').fill(value().alt);
  await page.locator('#scene-image-credit').fill(value().credit); await page.locator('#scene-image-mode').selectOption('cover');
  assert.equal(requests.length, 0);
  await page.locator('#scene-image-preview-button').click(); await page.locator('#scene-image-preview').waitFor();
  assert.equal(await page.locator('#scene-image-preview').evaluate(img => img.naturalWidth > 0 && getComputedStyle(img).objectFit === 'cover'), true);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 950 }); assert.equal(await page.locator('#scene-image-dialog').evaluate(d => d.scrollWidth <= d.clientWidth), true);
    if (process.env.STUDIO_SCREENSHOT_DIR && [1440, 390].includes(width)) { await mkdir(process.env.STUDIO_SCREENSHOT_DIR, { recursive: true }); await page.screenshot({ path: `${process.env.STUDIO_SCREENSHOT_DIR}/scene-image-${width}.png` }); }
  }
  await page.locator('#scene-image-form button[type=submit]').click(); await page.locator('#scene-image-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-play').click(); await page.locator('#scene-image-present').click();
  await page.locator('#open-player-window:not(:disabled)').waitFor();
  const [popup] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  const frame = popup.locator('#player-sheet iframe'); await frame.waitFor();
  const html = await frame.getAttribute('srcdoc');
  assert.match(html, /data:image\/png;base64/); assert.match(html, /class="cover"/);
  assert.doesNotMatch(html, /SECRET_IMAGE_MJ|CREDIT_PRIVE_IMAGE|images.test|Le village/);
  assert.equal(await popup.evaluate(() => self.origin), 'null');
  assert.ok(requests.every(r => !r.headers().referer));
  await page.locator('#stop-player-window').click();
});
test('La sauvegarde v20 restaure les images et refuse un format rétrogradé ou une écriture périmée', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('scene-image-data'); await seed(page, f.url);
  const result = await page.evaluate(async ({ key, input }) => {
    const { openStudioStore } = await import('./store.mjs'); const store = await openStudioStore();
    const destination = await openStudioStore({ name: 'scene-restored-' + crypto.randomUUID() });
    try {
      const [before] = await store.list(); const command = { id: before.id, expectedRevision: before.revision, operationId: crypto.randomUUID(), type: 'save-scene-image', data: { ...input, sceneId: before.scenes[0].id } };
      const saved = await store.execute(command); const json = await store.exportBackup(before.id); const archive = JSON.parse(json);
      const restored = await destination.restoreBackup(await destination.previewBackup(json));
      let old, stale;
      try { await destination.previewBackup(JSON.stringify({ ...archive, version: 19 })); } catch (error) { old = error.code; }
      try { await store.execute({ ...command, operationId: crypto.randomUUID(), data: { ...command.data, mode: 'map' } }); } catch (error) { stale = error.code; }
      const removed = await store.execute({ id: saved.id, expectedRevision: saved.revision, operationId: crypto.randomUUID(), type: 'remove-scene-image', data: { sceneId: before.scenes[0].id } });
      return { version: archive.version, images: restored[key], old, stale, sameScenes: JSON.stringify(before.scenes) === JSON.stringify(restored.scenes), removed: removed[key] };
    } finally { store.close(); destination.close(); }
  }, { key: SCENE_IMAGES_KEY, input: value() });
  assert.equal(result.version, 20); assert.equal(result.images[0].url, imageUrl); assert.equal(result.old, 'backup-version'); assert.equal(result.stale, 'conflict'); assert.equal(result.sameScenes, true); assert.deepEqual(result.removed, []);
});
test('Un hébergeur sans CORS garde l’aperçu privé mais bloque la projection, avec solution explicite', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('scene-image-cors');
  await context.route(imageUrl, route => route.fulfill({ contentType: 'image/webp', headers: { 'Access-Control-Allow-Origin': 'https://another-origin.test' }, body: bytes }));
  await seed(page, f.url); await page.getByRole('button', { name: 'Illustrer Le village', exact: true }).click();
  await page.locator('#scene-image-url').fill(imageUrl); await page.locator('#scene-image-alt').fill(value().alt);
  await page.locator('#scene-image-preview-button').click(); await page.locator('#scene-image-preview').waitFor();
  await page.locator('#scene-image-form button[type=submit]').click(); await page.locator('#scene-image-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-play').click(); await page.locator('#scene-image-present').click();
  await page.getByText(/La projection demande un hébergeur/).waitFor();
  assert.equal(await page.locator('#open-player-window').isDisabled(), true);
  await page.locator('#player-share-image').selectOption('image-gardien-des-salines');
  await page.locator('#open-player-window:not(:disabled)').waitFor();
});
