import assert from 'node:assert/strict';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';
import { wave } from './audio-fixture.mjs';

async function setup(t) {
  const f = await browserFixture(t), browser = await f.open('services');
  await browser.page.goto(f.url);
  await browser.page.locator('#save-status').getByText('Stockage local prêt').waitFor();
  await browser.page.evaluate(async () => {
    document.getElementById('service-media-dialog')?.remove();
    window.serviceStarts = 0;
    window.serviceTest = (await import('./service-media-ui.mjs')).createServiceMediaUI({ host: document.body, onStart: () => ++window.serviceStarts });
  });
  return { ...f, ...browser };
}

test('YouTube attend son activation, transmet seulement l’origine et libère l’iframe à la fermeture', { timeout: 45000 }, async t => {
  const { page, context, url } = await setup(t), calls = [];
  await context.route('https://www.youtube-nocookie.com/**', async route => {
    calls.push(route.request());
    await route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Lecteur fictif</title><p>Lecteur sans service distant.</p>' });
  });
  await page.evaluate(() => serviceTest.open({ name: 'Le village', url: 'https://youtu.be/M7lc1UVf-VE?si=CANARI', credit: 'Source déclarée' }));
  assert.equal(await page.locator('#service-media-player iframe').count(), 0); assert.equal(calls.length, 0);
  await page.locator('#service-media-load').click(); await page.frameLocator('#service-media-frame').getByText('Lecteur sans service distant.').waitFor();
  assert.equal(calls.length, 1); assert.equal(calls[0].headers().referer, new URL(url).origin + '/');
  assert.doesNotMatch(calls[0].url(), /CANARI|autoplay=1/);
  assert.equal(await page.evaluate(() => serviceStarts), 1);
  assert.equal(await page.locator('#service-media-frame').getAttribute('referrerpolicy'), 'strict-origin-when-cross-origin');
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.locator('#service-media-dialog').evaluate(d => d.scrollWidth <= d.clientWidth), true);
    assert.ok((await page.locator('#service-media-frame').boundingBox()).height >= 200);
  }
  await page.locator('#service-media-stop').click(); assert.equal(await page.locator('#service-media-frame').count(), 0);
  await page.locator('#service-media-load').click(); await page.locator('#service-media-dialog').press('Escape');
  await page.locator('#service-media-frame').waitFor({ state: 'detached' });
  assert.equal(await page.locator('#service-media-dialog').evaluate(d => d.open), false);
});

test('Spotify et Suno restent des accès externes sans lecteur, réseau ni contenu sauvegardé', { timeout: 30000 }, async t => {
  const { page, context } = await setup(t), calls = [];
  await context.route(/https:\/\/(?:open\.spotify\.com|suno\.com)\//, async route => { calls.push(route.request().url()); await route.abort(); });
  for (const url of ['https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6?si=CANARI', 'https://suno.com/song/fe3a82f0-325b-4601-9923-e8b75f55d7ab']) {
    await page.evaluate(url => serviceTest.open({ url, name: 'Pause' }), url);
    assert.equal(await page.locator('#service-media-load').isVisible(), false);
    assert.equal(await page.locator('#service-media-frame').count(), 0);
    assert.equal(await page.locator('#service-media-external').getAttribute('rel'), 'noopener noreferrer');
    assert.doesNotMatch(await page.locator('#service-media-external').getAttribute('href'), /CANARI/);
    await page.locator('#service-media-close').click();
  }
  assert.deepEqual(calls, []); assert.equal(await page.evaluate(() => serviceStarts), 0);
});

test('Un fichier local est lu volontairement puis son URL temporaire est révoquée, sans persistance', { timeout: 45000 }, async t => {
  const { page } = await setup(t);
  await page.evaluate(() => {
    window.revokedAudioURLs = [];
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = value => { revokedAudioURLs.push(value); revoke(value); };
    serviceTest.openLocal();
  });
  await page.locator('#service-media-file').setInputFiles({ name: 'pause.wav', mimeType: 'audio/wav', buffer: wave(2) });
  await page.locator('#service-media-status').getByText(/prêt sur cet appareil/).waitFor();
  const audio = page.locator('#service-media-player audio');
  assert.equal(await audio.evaluate(a => a.paused), true); assert.equal(await page.evaluate(() => serviceStarts), 0);
  const source = await audio.getAttribute('src'); assert.match(source, /^blob:/);
  await audio.evaluate(a => a.play()); await page.waitForFunction(() => document.querySelector('#service-media-player audio').currentTime > 0);
  assert.equal(await page.evaluate(() => serviceStarts), 1);
  const handle = await audio.elementHandle();
  await page.locator('#service-media-close').click();
  assert.equal(await handle.evaluate(a => a.paused && !a.getAttribute('src')), true);
  assert.ok((await page.evaluate(() => revokedAudioURLs)).includes(source));
  await page.evaluate(() => serviceTest.openLocal());
  await page.locator('#service-media-file').setInputFiles({ name: 'mensonge.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('<script>alert(1)</script>') });
  await page.locator('#service-media-status').getByText(/ne correspond pas/).waitFor();
  assert.equal(await page.locator('#service-media-player audio').count(), 0);
  assert.equal(await page.evaluate(async () => { const store = await (await import('./store.mjs')).openStudioStore(); try { return (await store.list()).length; } finally { store.close(); } }), 0);
});
