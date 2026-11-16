import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

test('Les liens de services se préparent, se sauvegardent et se restaurent sans contact tiers avant choix', { timeout: 50000 }, async t => {
 const f = await browserFixture(t), { page, context } = await f.open('services-campagne');
 const requests = [];
 await context.route('https://www.youtube-nocookie.com/**', async route => { requests.push(route.request()); await route.fulfill({ contentType: 'text/html', body: '<button>Lecteur de recette</button>' }); });
 await page.goto(f.url); await page.locator('#save-status').getByText('Stockage local prêt').waitFor();
 await page.locator('#campaign-name').fill('CANARI_CAMPAGNE_SERVICE'); await page.locator('#create-campaign-submit').click();
 await page.locator('#nav-play').click();
 const sources = [ ['Vidéo choisie', 'https://youtu.be/M7lc1UVf-VE?si=private-tracking'], ['Playlist choisie', 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=private-tracking'], ['Morceau Suno', 'https://suno.com/song/12345678-1234-1234-1234-123456789abc'] ];
 for (const [name, url] of sources) {
  await page.getByRole('button', { name: 'Ajouter un lien YouTube, Spotify ou Suno', exact: true }).click();
  await page.locator('#audio-track-name').fill(name); await page.locator('#audio-track-url').fill(url);
  await page.locator('#audio-track-form button[type=submit]').click(); await page.locator('#audio-track-dialog').waitFor({ state: 'hidden' });
 }
 assert.equal(requests.length, 0);
 await page.locator('#audio-library-tools summary').click();
 await page.getByRole('button', { name: 'Ouvrir le média Vidéo choisie', exact: true }).click();
 assert.equal(requests.length, 0);
 await page.locator('#service-media-load').click(); await page.locator('#service-media-player iframe').waitFor();
 await page.waitForFunction(() => document.querySelector('#service-media-player iframe')?.contentWindow !== null);
 assert.match(await page.locator('#service-media-player iframe').getAttribute('src'), /^https:\/\/www\.youtube-nocookie\.com\/embed\/M7lc1UVf-VE/);
 assert.doesNotMatch(await page.locator('#service-media-player iframe').getAttribute('src'), /CANARI|private-tracking/);
 await page.locator('#service-media-close').click();
 await page.locator('#service-media-player iframe').waitFor({ state: 'detached' });
 await page.getByRole('button', { name: 'Ouvrir le média Playlist choisie', exact: true }).click();
 assert.equal(await page.locator('#service-media-load').isVisible(), false);
 assert.match(await page.locator('#service-media-external').getAttribute('href'), /^https:\/\/open.spotify.com\/playlist\//);
 await page.locator('#service-media-close').click();
 await page.locator('#nav-backups').click();
 const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
 const buffer = await readFile(await download.path()), archive = JSON.parse(buffer);
 assert.equal(archive.payload.campaign.entreRivesMediaV18.tracks.length, 3);
 assert.doesNotMatch(buffer.toString(), /private-tracking/);
 const { page: restored } = await f.open('services-restauration');
 await restored.goto(f.url); await restored.locator('#save-status').getByText('Stockage local prêt').waitFor();
 await restored.locator('#nav-backups').click();
 await restored.locator('#backup-file').setInputFiles({ name: 'services.json', mimeType: 'application/json', buffer });
 await restored.locator('#restore-backup:not(:disabled)').click();
 await restored.locator('#nav-play').click(); await restored.locator('#audio-library-tools summary').click();
 await restored.getByRole('button', { name: 'Ouvrir le média Morceau Suno', exact: true }).click();
 assert.match(await restored.locator('#service-media-external').getAttribute('href'), /^https:\/\/suno.com\/song\//);
});
