import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';
import { waveResponse } from './audio-fixture.mjs';
import { videoResponse } from './video-fixture.mjs';
import { MEDIA_ENTRIES } from '../medias-catalogue.mjs';

async function seed(page, url) {
  await page.goto(url); await page.locator('#save-status').getByText('Stockage local prêt').waitFor();
  await page.locator('#campaign-name').fill('Table fictive des ambiances'); await page.locator('#create-campaign-submit').click();
  await page.locator('#add-scene').click(); await page.locator('#scene-title').fill('Le gué paisible');
  await page.locator('#scene-private-notes').fill('CANARI_REGIE_PRIVEE');
  await page.locator('#scene-form button[type=submit]').click(); await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-play').click();
}
async function routes(context) {
  const requests = [];
  await context.route('https://upload.wikimedia.org/**', async route => {
    requests.push(route.request().url());
    const entry = MEDIA_ENTRIES.find(entry => entry.url === route.request().url());
    assert.ok(entry, 'Le lecteur demande uniquement une source sélectionnée.');
    await route.fulfill(entry.kind === 'audio' ? waveResponse(route) : videoResponse(route));
  });
  return requests;
}
async function campaign(page) {
  return page.evaluate(async () => { const store = await (await import('./store.mjs')).openStudioStore(); try { return (await store.list())[0]; } finally { store.close(); } });
}
async function selectEntry(page, entry) {
  await page.locator('#media-search').fill(entry.name);
  await page.getByRole('button', { name: `${entry.kind === 'audio' ? 'Préparer la piste' : 'Préparer ce fond'} ${entry.name}`, exact: true }).click();
}

test('Le catalogue se consulte et filtre sans charger les médias, avec sources, clavier et téléphone', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('media-navigation', { viewport: { width: 1440, height: 950 } });
  const requested = await routes(context);
  await page.goto(f.url); await page.locator('#nav-library').click(); await page.locator('#library-media').press('Enter');
  await page.locator('#media-catalogue-summary').getByText(/\d+ sons et \d+ vidéos/).waitFor();
  assert.equal(await page.locator('#media-results > li').count(), 12);
  assert.equal(await page.locator('#media-results button[aria-label^="Préparer"]:enabled').count(), 0);
  await page.locator('#media-kind').selectOption('video'); await page.locator('#media-category').selectOption('eau');
  assert.equal(await page.locator('#media-results > li').count(), Math.min(12, MEDIA_ENTRIES.filter(e => e.kind === 'video' && e.category === 'eau').length));
  const first = page.locator('#media-results > li').first(); await first.locator('summary').click();
  assert.match(await first.getByRole('link', { name: 'Fiche source', exact: true }).getAttribute('href'), /oldid=/);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.locator('#media-catalogue-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
    if (process.env.STUDIO_SCREENSHOT_DIR && [1440, 390].includes(width)) await page.screenshot({ path: join(process.env.STUDIO_SCREENSHOT_DIR, `catalogue-medias-${width}.png`) });
  }
  assert.deepEqual(requested, []);
  await page.locator('#media-catalogue-dialog').press('Escape');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'library-media');
});

test('Choisir un son prépare une copie relue ; écoute et enregistrement restent des actions distinctes', { timeout: 50000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('media-son'); const requested = await routes(context);
  await seed(page, f.url); const before = await campaign(page), entry = MEDIA_ENTRIES.find(e => e.kind === 'audio');
  await page.locator('#audio-library-tools summary').click(); await page.locator('#audio-catalogue-open').click();
  await page.locator('#media-search').fill(entry.name);
  await page.getByRole('button', { name: `Écouter ${entry.name}`, exact: true }).click();
  await page.waitForFunction(() => { const audio = document.querySelector('#media-preview-player audio'); return audio && !audio.paused && audio.currentTime > 0; });
  assert.ok(requested.length > 0); assert.deepEqual(await campaign(page), before);
  await selectEntry(page, entry); await page.locator('#audio-track-dialog').waitFor();
  assert.equal(await page.locator('#media-preview-player audio').count(), 0);
  assert.equal(await page.locator('#audio-track-url').inputValue(), entry.url);
  assert.match(await page.locator('#audio-track-credit').inputValue(), new RegExp(entry.id));
  assert.deepEqual(await campaign(page), before);
  await page.locator('#audio-track-form button[type=submit]').click(); await page.locator('#audio-track-dialog').waitFor({ state: 'hidden' });
  const after = await campaign(page); assert.equal(after.entreRivesMediaV18.tracks.length, 1);
  assert.equal(after.entreRivesMediaV18.tracks[0].url, entry.url);
  assert.deepEqual(after.scenes, before.scenes);
});

test('Choisir une vidéo ne remplace ni ne diffuse avant validation du formulaire de scène', { timeout: 50000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('media-video'); const requested = await routes(context);
  await seed(page, f.url); const before = await campaign(page), entry = MEDIA_ENTRIES.find(e => e.kind === 'video');
  await page.locator('#video-catalogue-open').click(); await page.locator('#media-search').fill(entry.name);
  await page.getByRole('button', { name: `Voir l’extrait ${entry.name}`, exact: true }).click();
  await page.waitForFunction(() => { const video = document.querySelector('#media-preview-player video'); return video && !video.paused && video.currentTime > 0; });
  assert.equal(await page.locator('#media-preview-player video').evaluate(v => v.muted && v.volume === 0), true);
  await selectEntry(page, entry); await page.locator('#scene-video-dialog').waitFor();
  assert.deepEqual(await campaign(page), before);
  await page.locator('#scene-video-image').selectOption('image-gardien-des-salines');
  await page.locator('#scene-video-form button[type=submit]').click(); await page.locator('#scene-video-dialog').waitFor({ state: 'hidden' });
  const after = await campaign(page); assert.equal(after.entreRivesVideoV19[0].url, entry.url);
  assert.ok(after.entreRivesVideoV19[0].credit.includes(entry.id));
  const count = requested.length;
  await page.locator('#scene-video-prepare').click();
  assert.equal(requested.length, count, 'La préparation de projection attend encore Préparer la vidéo.');
  await page.locator('#cancel-player-share').click();
});

test('Fermer ou interrompre un aperçu libère sa source et une erreur ne change pas la campagne', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('media-interruption');
  const requested = Promise.withResolvers(), release = Promise.withResolvers();
  await context.route('https://upload.wikimedia.org/**', async route => { requested.resolve(); await release.promise; try { await route.fulfill({ status: 404, body: 'Indisponible' }); } catch {} });
  await seed(page, f.url); const before = await campaign(page), entry = MEDIA_ENTRIES.find(e => e.kind === 'audio');
  await page.locator('#audio-library-tools summary').click(); await page.locator('#audio-catalogue-open').click();
  await page.locator('#media-search').fill(entry.name); await page.getByRole('button', { name: `Écouter ${entry.name}`, exact: true }).click();
  await requested.promise;
  const element = await page.locator('#media-preview-player audio').elementHandle();
  await page.locator('#media-catalogue-close').click(); release.resolve();
  await page.waitForFunction(media => media.paused && !media.getAttribute('src'), element);
  assert.equal(await element.evaluate(media => media.paused && !media.getAttribute('src')), true);
  assert.deepEqual(await campaign(page), before);
  await page.locator('#audio-catalogue-open').click();
  await page.locator('#media-search').fill(entry.name);
  await page.getByRole('button', { name: `Écouter ${entry.name}`, exact: true }).click();
  await page.locator('#media-preview-status').getByText(/indisponible|interrompue/).waitFor();
  assert.deepEqual(await campaign(page), before);
});
