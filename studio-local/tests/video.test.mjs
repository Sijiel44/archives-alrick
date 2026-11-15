import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';
import { videoResponse } from './video-fixture.mjs';

async function routeVideos(context, respond) {
  const requests = [];
  await context.route('https://video.test/**', async route => {
    requests.push({ url: route.request().url(), frame: route.request().frame().url() });
    if (respond && await respond(route)) return;
    await route.fulfill(videoResponse(route));
  });
  return requests;
}

async function seed(page, url, withVideo = true) {
  await page.goto(url);
  await page.locator('#save-status').getByText('Stockage local prêt').waitFor();
  await page.evaluate(async withVideo => {
    const store = await (await import('./store.mjs')).openStudioStore();
    let campaign;
    const execute = async (type, data) => campaign = await store.execute({ id: 'table-video', operationId: crypto.randomUUID(),
      expectedRevision: campaign?.revision ?? 0, type, data });
    try {
      await execute('create', { name: 'CANARI_CAMPAGNE_VIDEO', description: 'CANARI_PREPARATION_VIDEO', style: 'campaign', startingLevel: 5 });
      for (const [id, title] of [['scene-aube', 'Aube du gué'], ['scene-tour', 'La tour du guet']]) {
        await execute('save-scene', { id, title, description: 'Une barque rejoint la rive.', privateNotes: 'CANARI_NOTES_VIDEO', participantIds: [] });
      }
      await execute('select-scene', { id: 'scene-aube' });
      if (withVideo) await execute('save-scene-video', { sceneId: 'scene-aube', url: 'https://video.test/aube.webm',
        imageId: 'image-gardien-des-salines', loop: true, dim: 45, credit: 'CANARI_CREDIT_VIDEO' });
    } finally { store.close(); }
  }, withVideo);
  await page.reload();
  await page.getByRole('button', { name: 'Ouvrir CANARI_CAMPAGNE_VIDEO', exact: true }).click();
  await page.locator('#nav-play').click();
}

async function prepareVideo(page, { title = false, text = true } = {}) {
  await page.locator('#quick-present').click();
  if (title) await page.locator('#scene-share-fields').getByRole('checkbox', { name: 'Titre de la scène' }).check();
  if (text) await page.locator('#scene-share-fields').getByRole('checkbox', { name: 'Texte de la scène' }).check();
  await page.locator('#player-share-video-use').check();
  await page.locator('#player-share-video-preview').click();
  await page.locator('#open-player-window:not(:disabled)').waitFor();
}

async function firstStaticWindow(page, context) {
  await page.locator('#quick-present').click();
  await page.locator('#scene-share-fields').getByRole('checkbox', { name: 'Texte de la scène' }).check();
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  await player.frameLocator('#player-sheet iframe:not([hidden])').getByText('Une barque rejoint la rive.', { exact: true }).waitFor();
  return player;
}

async function nativePlaying(video) {
  await video.evaluate(async element => {
    if (!element.paused && element.currentTime > 0) return;
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { cleanup(); reject(new Error(`Vidéo non jouée : ${JSON.stringify({ paused: element.paused, time: element.currentTime,
        readyState: element.readyState, source: element.currentSrc, error: element.error?.message })}`)); }, 8000);
      const tick = () => { if (!element.paused && element.currentTime > 0) { cleanup(); resolve(); } };
      const cleanup = () => { clearTimeout(timeout); element.removeEventListener('timeupdate', tick); };
      element.addEventListener('timeupdate', tick); tick();
    });
  });
}

test('Le fond vidéo se prépare au clavier, voyage en v19 et ne charge rien avant son aperçu', { timeout: 55000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('video-configuration', { viewport: { width: 1440, height: 950 } });
  const requests = await routeVideos(context);
  await seed(page, f.url, false);
  await page.locator('#scene-video-edit').press('Enter');
  await page.locator('#scene-video-url').fill('https://video.test/aube.webm');
  await page.locator('#scene-video-image').selectOption('image-gardien-des-salines');
  await page.locator('#scene-video-loop').check();
  await page.locator('#scene-video-credit').fill('CANARI_CREDIT_CONFIG_VIDEO');
  await page.locator('#scene-video-dim').press('Home');
  await page.locator('#scene-video-dim').press('ArrowRight');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.locator('#scene-video-dialog').evaluate(element => element.scrollWidth <= element.clientWidth), true);
  }
  await page.locator('#scene-video-form button[type=submit]').click();
  await page.locator('#scene-video-dialog').waitFor({ state: 'hidden' });
  assert.deepEqual(requests, []);
  await page.locator('#quick-present').click();
  await page.locator('#player-share-video-use').check();
  assert.deepEqual(requests, [], 'Le choix du fond attend la préparation explicite avant tout chargement.');
  assert.equal(await page.locator('#open-player-window').isDisabled(), true);
  await page.locator('#player-share-video-preview').click();
  await page.locator('#open-player-window:not(:disabled)').waitFor();
  await nativePlaying(page.locator('#player-share-preview .video-background'));
  const preview = await page.locator('#player-share-preview iframe').getAttribute('srcdoc');
  assert.doesNotMatch(preview, /CANARI|https:\/\/video\.test|entreRivesVideo|<script/);
  assert.equal(await page.locator('#player-share-preview iframe').getAttribute('sandbox'), '');
  assert.equal(await page.locator('#show-player-here').isDisabled(), true);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.locator('#player-share-dialog').evaluate(element => element.scrollWidth <= element.clientWidth), true);
    const controls = await page.locator('#player-share-form > .actions').boundingBox();
    assert.ok(controls && controls.y >= 0 && controls.y + controls.height <= 900, `Commandes d’aperçu accessibles à ${width}px`);
    if (process.env.STUDIO_SCREENSHOT_DIR && [1440, 390].includes(width)) await page.screenshot({
      path: join(process.env.STUDIO_SCREENSHOT_DIR, `video-apercu-${width}.png`), fullPage: false,
    });
  }
  await page.locator('#cancel-player-share').focus();
  await page.locator('#cancel-player-share').press('Shift+Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'open-player-window');
  await page.locator('#open-player-window').press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'cancel-player-share');
  await page.locator('#cancel-player-share').click();
  assert.equal(await page.locator('#player-share-preview video').count(), 0);
  await page.locator('#nav-backups').click();
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const archive = JSON.parse(await readFile(await file.path(), 'utf8'));
  assert.equal(archive.version, 19);
  assert.equal(archive.payload.campaign.entreRivesVideoV19[0].url, 'https://video.test/aube.webm');
  assert.doesNotMatch(JSON.stringify(archive), /data:video|blob:/);
});

test('La projection vidéo reste muette et isolée avec pause, reprise et retrait réel du média', { timeout: 55000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('video-projection', { viewport: { width: 1440, height: 950 } });
  await routeVideos(context); await seed(page, f.url); await prepareVideo(page);
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  const video = player.locator('#player-sheet .video-background');
  await nativePlaying(video);
  assert.deepEqual(await video.evaluate(element => ({ muted: element.muted, defaultMuted: element.defaultMuted, volume: element.volume,
    loop: element.loop, inline: element.playsInline })), { muted: true, defaultMuted: true, volume: 0, loop: true, inline: true });
  assert.equal(await player.locator('.video-dimmer').evaluate(element => Number(getComputedStyle(element).opacity)), 0.45);
  await video.evaluate(element => new Promise((resolve, reject) => {
    let previous = element.currentTime;
    const timeout = setTimeout(() => { cleanup(); reject(new Error('La vidéo native n’a pas bouclé.')); }, 6000);
    const sample = () => {
      const wrapped = element.currentTime < previous;
      previous = element.currentTime;
      if (wrapped) { cleanup(); resolve(); }
    };
    const cleanup = () => { clearTimeout(timeout); element.removeEventListener('timeupdate', sample); };
    element.addEventListener('timeupdate', sample);
  }));
  const frame = player.locator('#player-sheet iframe');
  assert.equal(await frame.getAttribute('sandbox'), '');
  assert.doesNotMatch(await frame.getAttribute('srcdoc'), /CANARI|credit|scene-aube|table-video|entreRivesVideo|video\.test/);
  assert.doesNotMatch(await player.locator('body').textContent(), /CANARI|scene-aube|table-video/);
  assert.deepEqual(await player.evaluate(() => {
    const denied = read => { try { read(); return false; } catch (error) { return error.name; } };
    return { origin: self.origin, opener: window.opener === null, local: denied(() => localStorage.length), idb: denied(() => indexedDB.open('test-video')) };
  }), { origin: 'null', opener: true, local: 'SecurityError', idb: 'SecurityError' });
  await player.getByRole('button', { name: 'Pause du mouvement', exact: true }).click();
  assert.equal(await video.evaluate(element => element.paused), true);
  await player.getByRole('button', { name: 'Reprendre le mouvement', exact: true }).click();
  await nativePlaying(video);
  await video.evaluate(element => element.pause());
  await player.getByRole('button', { name: 'Reprendre le mouvement', exact: true }).waitFor();
  assert.equal(await video.evaluate(element => element.paused), true);
  await player.getByRole('button', { name: 'Reprendre le mouvement', exact: true }).click();
  await nativePlaying(video);
  await player.getByRole('button', { name: 'Retirer le fond', exact: true }).click();
  assert.equal(await video.evaluate(element => element.paused && !element.getAttribute('src')), true);
  assert.equal(await player.locator('.video-poster').evaluate(image => image.complete && image.naturalWidth > 0), true);
  const closed = player.waitForEvent('close');
  await page.locator('#stop-player-window').click(); await closed;
});

test('Le mouvement réduit ne contacte aucun hébergeur vidéo avant une activation volontaire', { timeout: 50000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('video-mouvement-reduit', { reducedMotion: 'reduce' });
  const requests = await routeVideos(context);
  await seed(page, f.url); await prepareVideo(page);
  assert.deepEqual(requests, []);
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  await player.locator('.video-poster').waitFor();
  const video = player.locator('.video-background');
  assert.equal(await video.evaluate(element => element.paused && !element.getAttribute('src')), true);
  assert.deepEqual(requests, []);
  await player.getByRole('button', { name: 'Activer le mouvement', exact: true }).click();
  await nativePlaying(video);
  assert.ok(requests.length > 0);
  await player.emulateMedia({ reducedMotion: 'no-preference' });
  await player.emulateMedia({ reducedMotion: 'reduce' });
  await player.waitForFunction(() => { const video = document.querySelector('.video-background'); return video.paused && !video.getAttribute('src'); });
  await player.getByRole('button', { name: 'Activer le mouvement', exact: true }).waitFor();
  const count = requests.length;
  await player.emulateMedia({ reducedMotion: 'no-preference' });
  assert.equal(requests.length, count, 'Quitter le mouvement réduit ne relance pas la vidéo automatiquement.');
});

test('Un remplacement annulé ou une vidéo indisponible conserve la présentation précédente', { timeout: 65000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('video-remplacement');
  let pending, failReceiver = false;
  await routeVideos(context, async route => {
    if (!route.request().frame().url().includes('/joueur')) return false;
    if (pending) {
      const held = pending; held.requested.resolve(); await held.release.promise;
      try { await route.fulfill(videoResponse(route)); } catch { /* La requête retirée peut déjà être annulée. */ }
      return true;
    }
    if (failReceiver) { await route.fulfill({ status: 404, body: 'Clip fictif absent' }); return true; }
    return false;
  });
  await seed(page, f.url);
  const player = await firstStaticWindow(page, context);
  const previous = () => player.frameLocator('#player-sheet iframe:not([hidden])').getByText('Une barque rejoint la rive.', { exact: true });
  await prepareVideo(page, { title: true, text: false });
  pending = { requested: Promise.withResolvers(), release: Promise.withResolvers() };
  await page.locator('#open-player-window').click(); await pending.requested.promise;
  await previous().waitFor();
  await page.locator('#cancel-player-share').click();
  pending.release.resolve(); pending = undefined;
  await previous().waitFor();
  assert.equal(await player.locator('#player-sheet > .video-scene:not([hidden])').count(), 0);
  await prepareVideo(page, { title: true, text: false });
  failReceiver = true;
  await page.locator('#open-player-window').click();
  await page.locator('#player-share-message').getByText(/vidéo|charger|chargement|impossible|échec/i).waitFor();
  await previous().waitFor();
  assert.equal(await player.locator('#player-sheet > .video-scene:not([hidden])').count(), 0);
  await page.locator('#cancel-player-share').click();
  failReceiver = false;
  await prepareVideo(page, { title: true, text: false });
  await page.locator('#open-player-window').click();
  await nativePlaying(player.locator('#player-sheet .video-background'));
  await player.frameLocator('#player-sheet iframe').getByRole('heading', { name: 'Aube du gué', exact: true }).waitFor();
});

test('Le refus de lecture garde l’image de remplacement et permet une reprise explicite', { timeout: 55000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('video-autoplay-refuse');
  await context.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (this instanceof HTMLVideoElement && !window.videoPlayRefused) {
        window.videoPlayRefused = true;
        return Promise.reject(new DOMException('Refus fictif de lecture', 'NotAllowedError'));
      }
      return original.call(this);
    };
  });
  await routeVideos(context); await seed(page, f.url); await prepareVideo(page);
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  await player.getByRole('button', { name: 'Activer le mouvement', exact: true }).waitFor();
  const video = player.locator('.video-background');
  assert.equal(await video.evaluate(element => element.paused), true);
  assert.equal(await player.locator('.video-poster').isVisible(), true);
  await player.getByRole('button', { name: 'Activer le mouvement', exact: true }).click();
  await nativePlaying(video);
});

test('Un aperçu périmé ne diffuse pas de source vidéo dans une nouvelle fenêtre', { timeout: 50000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('video-apercu-perime');
  const requests = await routeVideos(context); await seed(page, f.url); await prepareVideo(page);
  await page.evaluate(async () => {
    const store = await (await import('./store.mjs')).openStudioStore();
    try {
      const campaign = await store.get('table-video');
      await store.execute({ id: campaign.id, operationId: crypto.randomUUID(), expectedRevision: campaign.revision, type: 'save-character',
        data: { id: 'nouveau-pj', name: 'Un voyageur', level: 1, notes: '' } });
    } finally { store.close(); }
  });
  await page.locator('#open-player-window').click();
  await page.locator('#player-share-message').getByText(/La campagne a changé/).waitFor();
  assert.equal(requests.some(request => request.frame.includes('/joueur')), false);
  assert.equal(context.pages().length, 1);
});

test('Une promesse de lecture initiale bloquée expire sans changer la présentation ni reprendre tardivement', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('video-play-initial-bloque');
  await context.addInitScript(() => {
    if (location.pathname.includes('/joueur')) return;
    const nativeTimer = window.setTimeout;
    window.setTimeout = (callback, delay, ...args) => nativeTimer(callback, delay === 12000 ? 1000 : delay, ...args);
    const nativePlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (!(this instanceof HTMLVideoElement)) return nativePlay.call(this);
      window.pendingVideo = this;
      return new Promise(resolve => { window.finishPendingVideo = resolve; });
    };
  });
  await routeVideos(context); await seed(page, f.url);
  const player = await firstStaticWindow(page, context);
  await page.locator('#quick-present').click();
  await page.locator('#player-share-video-use').check();
  await page.locator('#player-share-video-preview').click();
  await page.waitForFunction(() => typeof window.finishPendingVideo === 'function');
  await page.locator('#player-share-video-status').getByText(/n’a pas pu être préparée/).waitFor();
  assert.equal(await page.locator('#open-player-window').isDisabled(), true);
  assert.equal(await page.evaluate(() => window.pendingVideo.paused && !window.pendingVideo.getAttribute('src')), true);
  await page.evaluate(async () => { window.finishPendingVideo(); await Promise.resolve(); });
  assert.equal(await page.locator('#player-share-preview .video-scene').getAttribute('data-video-state'), 'poster');
  assert.equal(await page.evaluate(() => window.pendingVideo.paused && !window.pendingVideo.getAttribute('src')), true);
  await player.frameLocator('#player-sheet iframe:not([hidden])').getByText('Une barque rejoint la rive.', { exact: true }).waitFor();
});

test('Une activation bloquée après le repli expire et conserve la source libérée après résolution tardive', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('video-activation-bloquee', { reducedMotion: 'reduce' });
  await routeVideos(context); await seed(page, f.url); await prepareVideo(page);
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  await player.getByRole('button', { name: 'Activer le mouvement', exact: true }).waitFor();
  await player.evaluate(() => {
    const nativeTimer = window.setTimeout;
    window.setTimeout = (callback, delay, ...args) => nativeTimer(callback, delay === 12000 ? 1000 : delay, ...args);
    HTMLMediaElement.prototype.play = function () {
      window.pendingVideo = this;
      return new Promise(resolve => { window.finishPendingVideo = resolve; });
    };
  });
  await player.getByRole('button', { name: 'Activer le mouvement', exact: true }).click();
  await player.waitForFunction(() => typeof window.finishPendingVideo === 'function');
  await player.locator('.video-status').getByText(/Vidéo indisponible/).waitFor();
  const video = player.locator('.video-background');
  assert.equal(await video.evaluate(element => element.paused && !element.getAttribute('src')), true);
  assert.equal(await player.locator('.video-poster').isVisible(), true);
  await player.evaluate(async () => { window.finishPendingVideo(); await Promise.resolve(); });
  assert.equal(await video.evaluate(element => element.paused && !element.getAttribute('src')), true);
  assert.equal(await player.locator('.video-scene').getAttribute('data-video-state'), 'poster');
  await player.frameLocator('#player-sheet iframe').getByText('Une barque rejoint la rive.', { exact: true }).waitFor();
  await player.getByRole('button', { name: 'Activer le mouvement', exact: true }).waitFor();
});

test('Une révision changée pendant le chargement interdit la bascule tardive et retire la fenêtre', { timeout: 55000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('video-revision-tardive');
  const requested = Promise.withResolvers(), release = Promise.withResolvers();
  await routeVideos(context, async route => {
    if (!route.request().frame().url().includes('/joueur')) return false;
    requested.resolve(); await release.promise;
    try { await route.fulfill(videoResponse(route)); } catch { /* Le retrait peut avoir annulé le média. */ }
    return true;
  });
  await seed(page, f.url);
  const player = await firstStaticWindow(page, context);
  await prepareVideo(page, { title: true, text: false });
  await page.locator('#open-player-window').click(); await requested.promise;
  await player.frameLocator('#player-sheet iframe:not([hidden])').getByText('Une barque rejoint la rive.', { exact: true }).waitFor();
  await page.evaluate(async () => {
    const store = await (await import('./store.mjs')).openStudioStore();
    try {
      const campaign = await store.get('table-video');
      await store.execute({ id: campaign.id, operationId: crypto.randomUUID(), expectedRevision: campaign.revision, type: 'save-character',
        data: { id: 'pj-tardif', name: 'Voyageur tardif', level: 1, notes: '' } });
    } finally { store.close(); }
  });
  const closed = player.waitForEvent('close'); release.resolve();
  await closed;
  await page.locator('#player-share-message').getByText(/La campagne a changé pendant la préparation/).waitFor();
  assert.equal(context.pages().length, 1);
});
