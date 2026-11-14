import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

async function servePages(t) {
  const root = new URL('../../public/', import.meta.url);
  const prefix = '/archives-alrick/';
  const types = { html: 'text/html', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript',
    json: 'application/json', webp: 'image/webp', svg: 'image/svg+xml' };
  const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url, 'http://127.0.0.1');
    if (!pathname.startsWith(prefix)) return response.writeHead(404).end();
    const path = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    const type = types[path.split('.').at(-1)];
    try {
      const bytes = await readFile(new URL('./' + path.slice(prefix.length), root));
      response.writeHead(200, { 'Content-Type': `${type || 'application/octet-stream'}` }).end(bytes);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}${prefix}`;
}

test('GitHub Pages relie les Archives et le Studio et isole le récepteur joueur', {
  skip: !process.env.PUBLIC_BASE && process.env.STUDIO_PAGES_TEST !== '1', timeout: 45000,
}, async t => {
  const base = process.env.PUBLIC_BASE ? `${process.env.PUBLIC_BASE.replace(/\/$/, '')}/` : await servePages(t);
  const fixture = await browserFixture(t);
  const { context, page } = await fixture.open('pages-chroniques', { viewport: { width: 390, height: 844 } });
  const response = await page.goto(base);
  assert.equal(response.status(), 200);
  await page.getByRole('heading', { name: 'Les Chroniques d’Entre-Rives', exact: true }).waitFor();
  assert.equal(await page.locator('.cover-image').evaluate(img => img.complete && img.naturalWidth > 0), true);
  const archive = page.getByRole('link', { name: 'Les Archives d’Alrick', exact: true });
  const archiveResponse = await page.request.get(new URL(await archive.getAttribute('href'), base).href);
  assert.equal(archiveResponse.status(), 200);
  assert.match(await archiveResponse.text(), /alrick-home-title/);
  const privateResponse = await page.request.get(new URL('private/aventures/le-pain-des-fideles.cer-aventure.json', base).href);
  assert.equal(privateResponse.status(), 404);

  await page.getByRole('link', { name: /Créer une campagne/ }).click();
  await page.locator('#save-status').filter({ hasText: 'Stockage local prêt' }).waitFor();
  assert.equal(new URL(page.url()).pathname, new URL('./studio/', base).pathname);
  await page.locator('#campaign-name').fill('Campagne fictive Pages');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#free-pj:not(:disabled)').waitFor();
  await page.locator('#import-pj:not(:disabled)').waitFor();
  await page.locator('#add-scene').click();
  await page.locator('#scene-title').fill('Le gué fictif');
  await page.locator('#scene-description').fill('Une barque attend les voyageurs.');
  await page.locator('#scene-private-notes').fill('NOTE_MJ_PAGES');
  await page.locator('#scene-form button[type=submit]').click();
  await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-play').click();
  assert.equal(await page.locator('#open-play-action').isEnabled(), true);
  await page.locator('#quick-present').click();
  await page.locator('#scene-share-fields').getByRole('checkbox', { name: 'Texte de la scène' }).check();
  const [popup] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  const receiver = popup.frameLocator('iframe[title="Présentation joueur"]');
  const frame = receiver.locator('#player-sheet iframe');
  await frame.waitFor();
  const shown = await frame.getAttribute('srcdoc');
  assert.match(shown, /Une barque attend les voyageurs/);
  assert.doesNotMatch(shown, /NOTE_MJ_PAGES|Le gué fictif|Campagne fictive Pages/);
  assert.equal(await receiver.locator('body').evaluate(() => self.origin), 'null');
  assert.equal(await receiver.locator('body').evaluate(() => {
    try { indexedDB.open('test-isolation-pages'); return 'accessible'; } catch (error) { return error.name; }
  }), 'SecurityError');
  assert.equal(await popup.evaluate(() => window.opener === null), true);
  await page.locator('#stop-player-window').click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

  await page.goto(base);
  await page.getByRole('link', { name: 'Espace joueur' }).click();
  await page.locator('#player-save-status').getByText('Stockage joueur prêt').waitFor();
  assert.equal(new URL(page.url()).pathname, new URL('./studio/espace-joueur.html', base).pathname);
  const resources = page.getByRole('link', { name: 'Univers et ressources' });
  assert.equal((await page.request.get(new URL(await resources.getAttribute('href'), page.url()).href)).status(), 200);
  await page.getByRole('button', { name: 'Créer mon personnage' }).press('Enter');
  await page.getByRole('dialog', { name: 'Créer mon personnage' }).waitFor();
  await page.locator('#new-player-mode').selectOption('free');
  await page.locator('#new-player-name').fill('PJ fictif Pages');
  await page.locator('#creation-portrait-file').setInputFiles({ name: 'portrait-fictif.webp', mimeType: 'image/webp',
    buffer: await readFile(new URL('../media/heron-des-lanternes.webp', import.meta.url)) });
  await page.locator('#creation-portrait').getByText(/Portrait prêt/).waitFor();
  await page.locator('#creation-draft-save').click();
  await page.locator('#creation-draft-status').getByText('Brouillon enregistré dans ce navigateur.', { exact: true }).waitFor();
  const [draftFile] = await Promise.all([page.waitForEvent('download'), page.locator('#creation-draft-export').click()]);
  const draftText = await readFile(await draftFile.path(), 'utf8');
  const draftBackup = JSON.parse(draftText);
  assert.equal(draftBackup.format, 'chroniques-entre-rives.brouillon-pj');
  assert.equal(draftBackup.payload.fields['new-player-name'], 'PJ fictif Pages');
  assert.doesNotMatch(draftText, /NOTE_MJ_PAGES|Campagne fictive Pages/);
  await page.locator('#player-create-dialog [data-close]').click();
  await page.locator('#player-create-dialog').waitFor({ state: 'hidden' });
  await page.reload();
  await page.locator('#creation-draft-resume').click();
  await page.locator('#player-create-dialog').waitFor();
  assert.equal(await page.locator('#new-player-name').inputValue(), 'PJ fictif Pages');
  assert.equal(await page.locator('#confirm-player-create').isDisabled(), true);
  await page.getByRole('button', { name: 'Vérifier la fiche' }).click();
  await page.locator('#confirm-player-create').click();
  await page.getByRole('heading', { name: 'PJ fictif Pages', exact: true }).waitFor();
  assert.equal(await page.locator('#player-portrait').evaluate(async img => { await img.decode(); return img.naturalWidth <= 320; }), true);
  await page.getByRole('tab', { name: 'Grimoire', exact: true }).click();
  await page.getByRole('button', { name: 'Consulter le sort Lueur de veille', exact: true }).click();
  await page.locator('#grimoire-session').check();
  await page.locator('#grimoire-notes').fill('CANARI_GRIMOIRE_PAGES');
  await page.locator('#grimoire-save').click();
  await page.locator('#grimoire-dialog').waitFor({ state: 'hidden' });
  await page.getByRole('link', { name: /Préparer une action/ }).click();
  await page.getByRole('tabpanel', { name: 'Dés', exact: true }).waitFor();
  await page.locator('#player-free-roll').click();
  await page.locator('#player-keep-roll').click();
  await page.locator('#player-roll-count').getByText('1 / 50', { exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Sauvegarde', exact: true }).click();
  const [backupFile] = await Promise.all([page.waitForEvent('download'), page.locator('#player-backup').click()]);
  const backupText = await readFile(await backupFile.path(), 'utf8');
  const playerBackup = JSON.parse(backupText);
  assert.equal(playerBackup.version, 3);
  assert.equal(playerBackup.payload.grimoire[0].id, 'demo-lueur-guide');
  assert.equal(playerBackup.payload.grimoire[0].session, true);
  assert.equal(playerBackup.payload.rolls.length, 1);
  assert.doesNotMatch(backupText, /NOTE_MJ_PAGES|Campagne fictive Pages/);
  const [exchangeFile] = await Promise.all([page.waitForEvent('download'), page.locator('#player-send').click()]);
  const exchange = JSON.parse(await readFile(await exchangeFile.path(), 'utf8'));
  assert.equal(exchange.format, 'chroniques-entre-rives.echange-pj');
  assert.equal(exchange.payload.sheet.name, 'PJ fictif Pages');
  assert.doesNotMatch(JSON.stringify(exchange), /NOTE_MJ_PAGES|Campagne fictive Pages|CANARI_GRIMOIRE_PAGES/);
  await page.goto(new URL('./studio/', base).href);
  await page.getByRole('button', { name: 'Ouvrir Campagne fictive Pages', exact: true }).click();
  await page.locator('#import-pj').click();
  const input = value => ({ name: 'echange-pages.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });
  await page.locator('#pj-import-file').setInputFiles(input(exchange));
  await page.locator('#pj-compare-preview .notice').waitFor();
  await page.locator('#pj-exchange-accept').check();
  await page.locator('#pj-import-submit').click();
  await page.locator('#pj-import-dialog').waitFor({ state: 'hidden' });
  const updated = await page.evaluate(async sheet => {
    const { makeExchange } = await import('./echanges-pj.mjs');
    return makeExchange({ ...sheet, name: 'PJ actualisé Pages' }, 'joueur');
  }, exchange.payload.sheet);
  await page.locator('#import-pj').click();
  await page.locator('#pj-import-file').setInputFiles(input(updated));
  await page.locator('#pj-compare-preview .notice').waitFor();
  await page.locator('#pj-exchange-mode').selectOption('update');
  await page.locator('#pj-import-submit').getByText('Actualiser le PJ existant', { exact: true }).waitFor();
  await page.locator('#pj-exchange-accept').check();
  await page.locator('#pj-import-submit').click();
  await page.locator('#pj-import-dialog').waitFor({ state: 'hidden' });
  assert.equal(await page.locator('#character-list > li').count(), 1);
  await page.getByRole('button', { name: 'Historique des versions de PJ actualisé Pages', exact: true }).click();
  await page.locator('#pj-versions-choice').selectOption({ index: 1 });
  await page.locator('#pj-versions-preview').getByText('PJ fictif Pages', { exact: true }).waitFor();
  await page.locator('#pj-versions-dialog .cancel-edit').click();
  await page.locator('#nav-backups').click();
  const [campaignDownload] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  assert.equal(JSON.parse(await readFile(await campaignDownload.path(), 'utf8')).version, 17);
  await page.locator('#nav-play').click();
  await page.locator('#open-session-roster').click();
  await page.locator('#roster-count').getByText('1 fiche · 1 affichée', { exact: true }).waitFor();
  await page.locator('#roster-search').fill('actualise pages');
  await page.locator('#roster-search').press('Enter');
  await page.locator('#resource-title').getByText('PJ actualisé Pages', { exact: true }).waitFor();
  assert.equal(await page.locator('#session-roster').isVisible(), false);
  assert.equal(await page.locator('#resource-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
  await page.locator('#roster-return').click();
  await page.waitForFunction(() => document.activeElement === document.getElementById('current-scene-title'));
  await page.locator('#current-scene-title').getByText('Le gué fictif', { exact: true }).waitFor();
  assert.equal(await page.locator('#participant-list > li').count(), 0);
  await page.goto(base);
  await page.locator('#joueurs-personnage').getByRole('link', { name: /Donnez-lui une raison de partir/ }).click();
  await page.getByRole('dialog', { name: 'Créer mon personnage' }).waitFor();
  assert.equal(new URL(page.url()).pathname, new URL('./studio/espace-joueur.html', base).pathname);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
});
