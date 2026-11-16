import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';
import { waveResponse } from './audio-fixture.mjs';

async function mediaRoutes(page) {
  const requests = [];
  await page.route('https://audio.test/**', async route => {
    requests.push(new URL(route.request().url()).pathname);
    if (route.request().url().includes('indisponible')) return route.fulfill({ status: 404, body: 'Piste fictive indisponible' });
    return route.fulfill(waveResponse(route));
  });
  return requests;
}

async function seed(page, url, { loop = false } = {}) {
  await page.goto(url);
  await page.locator('#save-status').getByText('Stockage local prêt').waitFor();
  await page.evaluate(async ({ loop }) => {
    const store = await (await import('/store.mjs')).openStudioStore();
    let revision = 0;
    const execute = async (type, data) => {
      const result = await store.execute({ id: 'table-sonore', type, data,
        expectedRevision: revision, operationId: `regie-${revision}` });
      revision = result.revision;
    };
    try {
      await execute('create', { name: 'Table sonore fictive', description: '', style: 'campaign', startingLevel: 1 });
      for (const [id, title] of [['scene-rive', 'La rive'], ['scene-tour', 'La tour']]) {
        await execute('save-scene', { id, title, description: 'Un paysage offert aux joueurs.',
          privateNotes: 'CANARI_NOTES_MJ', participantIds: [] });
      }
      for (const [id, name, file] of [['piste-rive', 'CANARI_Rive privée', 'rive.wav'],
        ['piste-tour', 'CANARI_Tour privée', 'tour.wav'], ['piste-absente', 'Piste indisponible', 'indisponible.wav']]) {
        await execute('save-audio-track', { id, name, url: `https://audio.test/${file}`, credit: 'CANARI_CREDIT_MJ' });
      }
      await execute('save-audio-playlist', { id: 'playlist-veille', name: 'CANARI_Veille privée',
        trackIds: ['piste-rive', 'piste-tour'], loop });
      await execute('save-audio-playlist', { id: 'playlist-erreur', name: 'Source à vérifier',
        trackIds: ['piste-absente', 'piste-tour'], loop: false });
      await execute('set-scene-playlist', { sceneId: 'scene-tour', playlistId: 'playlist-veille' });
    } finally { store.close(); }
  }, { loop });
  await page.reload();
  await page.getByRole('button', { name: 'Ouvrir Table sonore fictive', exact: true }).click();
  await page.locator('#nav-play').click();
  await page.locator('#quick-audio').click();
}

async function load(page, name = 'CANARI_Veille privée') {
  if (await page.locator('#audio-element').evaluate(audio => audio.hasAttribute('src'))) {
    page.once('dialog', dialog => dialog.accept());
  }
  await page.getByRole('button', { name: `Charger la playlist ${name}`, exact: true }).click();
}

async function playing(page, file) {
  try {
    await page.waitForFunction(file => {
      const audio = document.getElementById('audio-element');
      return !audio.paused && audio.currentTime > 0 && audio.currentSrc.endsWith(file);
    }, file);
  } catch (error) {
    const state = await page.locator('#audio-element').evaluate(audio => ({ source: audio.currentSrc,
      time: audio.currentTime, duration: audio.duration, paused: audio.paused, ended: audio.ended,
      error: audio.error?.message, state: document.getElementById('audio-status').textContent,
      seeking: audio.seeking, seekable: Array.from({ length: audio.seekable.length }, (_, i) => [audio.seekable.start(i), audio.seekable.end(i)]) }));
    throw new Error(`Lecture attendue de ${file} : ${JSON.stringify(state)}`, { cause: error });
  }
}

test('La bibliothèque sonore se compose au clavier, se sauvegarde et se restaure sans lecture distante', { timeout: 65000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('audio-bibliotheque', { viewport: { width: 1440, height: 950 } });
  const requests = await mediaRoutes(page);
  await seed(page, f.url);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'audio-title');
  await page.locator('#audio-library-tools summary').click();
  await page.locator('#audio-track-add').press('Enter');
  await page.locator('#audio-track-name').fill('Un air composé pour la table');
  await page.locator('#audio-track-url').fill('https://audio.test/compose.wav');
  await page.locator('#audio-track-credit').fill('Composition fictive du test');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.locator('#audio-track-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true, `Piste à ${width}px`);
  }
  await page.locator('#audio-track-form button[type=submit]').click();
  await page.locator('#audio-track-dialog').waitFor({ state: 'hidden' });
  await page.locator('#audio-playlist-add').click();
  await page.locator('#audio-playlist-name').fill('La ronde des rives');
  await page.locator('#audio-playlist-loop').check();
  for (const label of ['CANARI_Rive privée', 'CANARI_Tour privée', 'Un air composé pour la table']) {
    await page.locator('#audio-playlist-track').selectOption({ label });
    await page.locator('#audio-playlist-track-add').click();
  }
  await page.getByRole('button', { name: 'Monter la piste 3', exact: true }).click();
  await page.getByRole('button', { name: 'Retirer la piste 1', exact: true }).click();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.locator('#audio-playlist-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true, `Playlist à ${width}px`);
  }
  await page.locator('#audio-playlist-form button[type=submit]').click();
  await page.locator('#audio-playlist-dialog').waitFor({ state: 'hidden' });
  await load(page, 'La ronde des rives');
  await page.locator('#audio-now-title').getByText('Un air composé pour la table', { exact: true }).waitFor();
  assert.deepEqual(requests, [], 'Composer et charger la playlist ne contacte aucun hébergeur audio.');
  assert.equal(await page.locator('#audio-loop').isChecked(), true);
  await page.locator('#audio-scene-playlist').selectOption({ label: 'La ronde des rives' });
  await page.locator('#audio-scene-save').click();
  await page.locator('#audio-status').getByText('Suggestion de scène enregistrée. La lecture reste sous votre contrôle.', { exact: true }).waitFor();
  await page.locator('#nav-backups').click();
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const buffer = await readFile(await file.path()), archive = JSON.parse(buffer);
  assert.equal(archive.version, 18);
  const media = archive.payload.campaign.entreRivesMediaV18;
  const list = media.playlists.find(entry => entry.name === 'La ronde des rives');
  assert.deepEqual(list.trackIds.map(id => media.tracks.find(track => track.id === id).name), ['Un air composé pour la table', 'CANARI_Tour privée']);
  assert.equal(list.loop, true);
  assert.doesNotMatch(buffer.toString(), /data:audio|blob:/);

  const { page: restored } = await f.open('audio-restauree', { viewport: { width: 390, height: 844 } });
  const restoredRequests = await mediaRoutes(restored);
  await restored.goto(f.url);
  await restored.locator('#save-status').getByText('Stockage local prêt').waitFor();
  await restored.locator('#nav-backups').click();
  await restored.locator('#backup-file').setInputFiles({ name: 'regie-v18.json', mimeType: 'application/json', buffer });
  try { await restored.locator('#restore-backup:not(:disabled)').waitFor(); }
  catch (error) { throw new Error(`Restauration audio : ${await restored.locator('#view-backups').textContent()}`, { cause: error }); }
  await restored.locator('#restore-backup').click();
  await restored.locator('#nav-play').click();
  await load(restored, 'La ronde des rives');
  assert.deepEqual(restoredRequests, []);
  assert.equal(await restored.locator('#audio-element').evaluate(audio => audio.paused && !audio.getAttribute('src')), true);
  for (const width of [1440, 768, 390, 320]) {
    await restored.setViewportSize({ width, height: 900 });
    assert.equal(await restored.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Régie à ${width}px`);
    if ([1440, 390].includes(width)) await restored.locator('#audio-panel').screenshot({
      path: join(process.env.STUDIO_SCREENSHOT_DIR || f.directory, `regie-audio-${width === 1440 ? 'ordinateur' : 'mobile'}.png`),
    });
  }
});

test('Le lecteur unique joue, met en pause, enchaîne, boucle et arrête réellement les pistes', { timeout: 55000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('audio-lecture');
  const requests = await mediaRoutes(page);
  await seed(page, f.url, { loop: true });
  await load(page);
  assert.deepEqual(requests, []);
  await page.locator('#audio-play').click(); await playing(page, 'rive.wav');
  assert.equal(await page.locator('audio').count(), 1);
  await page.locator('#audio-volume').focus();
  await page.locator('#audio-volume').press('Home');
  assert.equal(await page.locator('#audio-element').evaluate(audio => audio.volume), 0);
  await page.locator('#audio-volume').press('ArrowRight');
  assert.equal(await page.locator('#audio-element').evaluate(audio => audio.volume), 0.01);
  await page.locator('#audio-pause').click();
  assert.equal(await page.locator('#audio-element').evaluate(audio => audio.paused), true);
  await page.locator('#audio-play').click(); await playing(page, 'rive.wav');
  await page.locator('#audio-next').click(); await playing(page, 'tour.wav');
  await page.locator('#audio-previous').click(); await playing(page, 'rive.wav');
  // Déclencher la fin par le moteur média, plutôt que simuler seulement l’événement.
  await page.locator('#audio-element').evaluate(audio => { audio.currentTime = audio.duration - 0.08; });
  await playing(page, 'tour.wav');
  await page.locator('#audio-element').evaluate(audio => { audio.currentTime = audio.duration - 0.08; });
  await playing(page, 'rive.wav');
  await page.locator('#audio-stop').click();
  assert.equal(await page.locator('#audio-element').evaluate(audio => audio.paused && !audio.getAttribute('src')), true);
  assert.equal(await page.locator('#audio-global-stop').isVisible(), false);
});

test('Le refus de lecture et une piste indisponible laissent une reprise explicite sans cascade d’erreurs', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('audio-erreurs');
  const requests = await mediaRoutes(page);
  await seed(page, f.url); await load(page);
  await page.evaluate(() => {
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      HTMLMediaElement.prototype.play = original;
      return Promise.reject(new DOMException('Refus fictif de lecture', 'NotAllowedError'));
    };
  });
  await page.locator('#audio-play').click();
  await page.locator('#audio-status').getByText(/lecture|autorisé|relancer/i).waitFor();
  assert.equal(await page.locator('#audio-play').isEnabled(), true);
  assert.equal(await page.locator('#audio-element').evaluate(audio => audio.paused), true);
  await page.locator('#audio-play').click(); await playing(page, 'rive.wav');
  await load(page, 'Source à vérifier');
  const atLoad = requests.length;
  assert.equal(await page.locator('#audio-element').evaluate(audio => audio.paused), true);
  await page.locator('#audio-play').click();
  await page.locator('#audio-status').getByText(/indisponible|impossible|erreur|illisible/i).waitFor();
  assert.equal(await page.locator('#audio-element').evaluate(audio => audio.paused && !audio.getAttribute('src')), true);
  assert.ok(requests.slice(atLoad).some(path => path.includes('indisponible')));
  assert.equal(requests.slice(atLoad).some(path => path.includes('tour.wav')), false, 'Une erreur ne passe pas automatiquement aux pistes suivantes.');
  await page.locator('#audio-next').click();
  await page.locator('#audio-play').click(); await playing(page, 'tour.wav');
  await page.locator('#audio-global-stop').click();
  assert.equal(await page.locator('#audio-element').evaluate(audio => audio.paused && !audio.getAttribute('src')), true);
});

test('La scène suggère une playlist sans interrompre le son et la projection exclut la régie privée', { timeout: 55000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('audio-scenes');
  await mediaRoutes(page); await seed(page, f.url); await load(page);
  await page.locator('#audio-play').click(); await playing(page, 'rive.wav');
  const before = await page.locator('#audio-element').evaluate(audio => audio.currentTime);
  await page.locator('#jump-scene').selectOption({ label: 'La tour' });
  await page.locator('#audio-scene-load:not(:disabled)').waitFor();
  assert.equal(await page.locator('#audio-element').evaluate(audio => !audio.paused && audio.currentTime >= 0), true);
  await page.locator('#quick-present').click();
  await page.locator('#scene-share-fields').getByRole('checkbox', { name: 'Texte de la scène' }).check();
  const preview = await page.locator('#player-share-preview iframe').getAttribute('srcdoc');
  assert.doesNotMatch(preview, /CANARI|audio\.test|entreRivesMedia|<audio/);
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  const shown = player.locator('#player-sheet iframe');
  await shown.waitFor();
  assert.doesNotMatch(await shown.getAttribute('srcdoc'), /CANARI|audio\.test|entreRivesMedia|<audio/);
  await page.locator('#stop-player-window').click();
  assert.ok(await page.locator('#audio-element').evaluate(audio => audio.currentTime) >= before);
  await page.locator('#nav-home').click();
  await page.locator('#campaign-name').fill('Autre table fictive');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  assert.equal(await page.locator('#audio-element').evaluate(audio => audio.paused && !audio.getAttribute('src')), true);
});

test('Arrêter un chargement interrompt la requête et empêche une reprise tardive', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('audio-interruption');
  const requested = Promise.withResolvers(), release = Promise.withResolvers();
  await page.route('https://audio.test/**', async route => {
    requested.resolve();
    await release.promise;
    try { await route.fulfill(waveResponse(route)); }
    catch { /* La lecture annulée peut déjà avoir fermé cette requête. */ }
  });
  await seed(page, f.url); await load(page);
  await page.locator('#audio-play').click();
  await requested.promise;
  try {
    assert.equal(await page.locator('#audio-stop').isEnabled(), true);
    await page.locator('#audio-stop').click();
    assert.equal(await page.locator('#audio-element').evaluate(audio => audio.paused && !audio.getAttribute('src')), true);
  } finally { release.resolve(); }
  await page.waitForFunction(() => document.getElementById('audio-element').networkState === HTMLMediaElement.NETWORK_EMPTY);
  assert.equal(await page.locator('#audio-play').isEnabled(), true);
  assert.equal(await page.locator('#audio-element').evaluate(audio => audio.paused && !audio.getAttribute('src')), true);
});

test('La suspension et la reprise de page laissent le lecteur arrêté et prêt à une nouvelle commande', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('audio-page-suspendue');
  const requests = await mediaRoutes(page);
  await seed(page, f.url); await load(page);
  await page.locator('#audio-play').click(); await playing(page, 'rive.wav');
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  const countAfterSuspend = requests.length;
  assert.equal(await page.locator('#audio-element').evaluate(audio => audio.paused && !audio.getAttribute('src')), true);
  assert.equal(await page.locator('#audio-play').isEnabled(), true);
  assert.equal(await page.locator('#audio-global-stop').isVisible(), false);
  assert.equal(requests.length, countAfterSuspend);
  await page.locator('#audio-play').click(); await playing(page, 'rive.wav');
  await page.locator('#audio-stop').click();
});
