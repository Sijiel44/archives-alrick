import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

const historyKey = 'entre-rives:suivi-sauvegardes:v1';
const campaignName = 'Les copies du gué';

async function ready(page, url) {
  await page.goto(url);
  await page.locator('#save-status').filter({ hasText: 'Stockage local prêt' }).waitFor();
}

async function createCampaign(page, url) {
  await ready(page, url);
  await page.locator('#campaign-name').fill(campaignName);
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
}

async function copyState(page, state) {
  await page.locator(`#backup-copy-state[data-state="${state}"]`).waitFor({ state: 'attached' });
}

async function download(page, button = '#export-backup') {
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator(button).click()]);
  assert.equal(await file.failure(), null);
  const buffer = await readFile(await file.path());
  return { buffer, archive: JSON.parse(buffer.toString()) };
}

async function reread(page, buffer) {
  await page.locator('#backup-file').setInputFiles({ name: 'copie-fictive.json', mimeType: 'application/json', buffer });
}

async function savedPayload(page, id) {
  return page.evaluate(async campaignId => {
    const store = await (await import('/store.mjs')).openStudioStore();
    try { return JSON.parse(await store.exportBackup(campaignId)).payload; }
    finally { store.close(); }
  }, id);
}

async function receipts(page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)), historyKey);
}

async function addCharacter(page, name) {
  await page.locator('#nav-prepare').click();
  await page.locator('#add-character').click();
  await page.locator('#character-name').fill(name);
  await page.getByRole('button', { name: 'Enregistrer le PJ', exact: true }).click();
  await page.locator('#character-list').getByText(name, { exact: true }).waitFor();
}

async function reloadCampaign(page) {
  await page.reload();
  await page.locator('#save-status').filter({ hasText: 'Stockage local prêt' }).waitFor();
  await page.getByRole('button', { name: `Ouvrir ${campaignName}`, exact: true }).click();
  await page.locator('#nav-backups').click();
}

test('Une copie n’est courante qu’après relecture, et vieillit après une commande', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('copies');
  await createCampaign(page, f.url);
  await page.locator('#nav-backups').click();
  await copyState(page, 'none');
  const { buffer, archive } = await download(page);
  const id = archive.payload.campaign.id;
  const revision = archive.payload.campaign.revision;
  await copyState(page, 'unverified');
  assert.match(await page.locator('#backup-copy-state').textContent(), /lancé.*Relisez/s);
  assert.match(await page.locator('#backup-last-download').textContent(), new RegExp(`révision ${revision}`));
  assert.match(await page.locator('#backup-last-verified').textContent(), /Aucune trace/);
  const downloaded = (await receipts(page)).entries[id];
  assert.deepEqual(Object.keys(downloaded), ['download']);
  assert.equal(downloaded.download.revision, revision);
  assert.equal(downloaded.download.sha256, archive.sha256);
  assert.ok(Math.abs(Date.now() - Date.parse(downloaded.download.at)) < 30000);
  assert.deepEqual(await savedPayload(page, id), archive.payload, 'Télécharger ne modifie ni révision ni journal');

  await reloadCampaign(page);
  await copyState(page, 'unverified');
  await reread(page, buffer);
  await page.locator('#backup-file-check-status').filter({ hasText: 'Fichier relu et empreinte vérifiée' }).waitFor();
  await copyState(page, 'current');
  assert.equal(await page.locator('#restore-backup').isDisabled(), true, 'La relecture ne permet pas d’écraser la campagne existante');
  assert.equal((await receipts(page)).entries[id].verified.sha256, archive.sha256);
  assert.deepEqual(await savedPayload(page, id), archive.payload, 'Relire ne modifie pas les données de jeu');
  await reloadCampaign(page);
  await copyState(page, 'current');

  await addCharacter(page, 'La batelière');
  await page.locator('#nav-backups').click();
  await copyState(page, 'outdated');
  await reread(page, buffer);
  await page.locator('#backup-preview').waitFor();
  await copyState(page, 'outdated');
  const next = await savedPayload(page, id);
  assert.ok(next.campaign.revision > revision);
  assert.equal((await receipts(page)).entries[id].verified.revision, revision, 'Une ancienne copie valide reste une ancienne révision');
  await page.locator('#nav-archive').click();
  await page.locator('#archive-copy-reminder').waitFor();
  assert.match(await page.locator('#archive-copy-message').textContent(), /révision|copie/i);
});

test('Les fichiers altérés, futurs ou divergents à révision égale ne valident pas la copie courante', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('fichiers-refuses');
  await createCampaign(page, f.url);
  await page.locator('#nav-backups').click();
  const { buffer, archive } = await download(page);
  await copyState(page, 'unverified');
  const divergent = structuredClone(archive);
  divergent.payload.campaign.name = 'Autre histoire à révision égale';
  divergent.sha256 = await page.evaluate(async payload => (await import('/store.mjs')).sha256(JSON.stringify(payload)), divergent.payload);
  await reread(page, Buffer.from(JSON.stringify(divergent)));
  await page.locator('#backup-file-check-status').filter({ hasText: 'son contenu diffère' }).waitFor();
  await copyState(page, 'unverified');
  assert.equal((await receipts(page)).entries[archive.payload.campaign.id].verified, undefined);
  assert.equal(await page.locator('#restore-backup').isDisabled(), true);

  const altered = structuredClone(archive);
  altered.payload.campaign.name = 'Contenu modifié sans recalcul';
  await reread(page, Buffer.from(JSON.stringify(altered)));
  await page.locator('#app-error').waitFor();
  assert.equal(await page.locator('#backup-preview').isHidden(), true);
  assert.equal(await page.locator('#restore-backup').isDisabled(), true);
  await copyState(page, 'unverified');
  const future = { ...archive, version: 999 };
  await reread(page, Buffer.from(JSON.stringify(future)));
  await page.locator('#app-error').waitFor();
  assert.equal(await page.locator('#backup-preview').isHidden(), true);
  assert.equal((await receipts(page)).entries[archive.payload.campaign.id].verified, undefined);
  assert.deepEqual(await savedPayload(page, archive.payload.campaign.id), archive.payload);

  await reread(page, buffer);
  await copyState(page, 'current');
  assert.equal(await page.locator('#app-error').isHidden(), true);
});

test('Une modification dans un autre onglet suspend l’affirmation de copie courante', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page, context } = await f.open('onglets');
  await createCampaign(page, f.url);
  await page.locator('#nav-backups').click();
  const first = await download(page);
  await reread(page, first.buffer);
  await copyState(page, 'current');
  const other = await context.newPage();
  await ready(other, f.url);
  await other.getByRole('button', { name: `Ouvrir ${campaignName}`, exact: true }).click();
  await addCharacter(other, 'Le second navigateur');
  await copyState(page, 'outdated');
  assert.match(await page.locator('#backup-copy-state').textContent(), /autre onglet/);
  const current = await download(page);
  assert.ok(current.archive.payload.campaign.revision > first.archive.payload.campaign.revision);
  await reread(page, current.buffer);
  await page.locator('#backup-file-check-status').filter({ hasText: 'Fichier relu et empreinte vérifiée' }).waitFor();
  await copyState(page, 'outdated');
  await reloadCampaign(page);
  await copyState(page, 'current');
  assert.match(await page.locator('#backup-last-verified').textContent(), new RegExp(`révision ${current.archive.payload.campaign.revision}`));
});

test('Quota, lecture refusée et historique corrompu n’empêchent pas le téléchargement réel', { timeout: 60000 }, async t => {
  const f = await browserFixture(t);
  for (const failure of ['quota', 'blocked', 'corrupt']) {
    const { page, context } = await f.open(`stockage-${failure}`);
    await context.addInitScript(({ key, failure }) => {
      const originalGet = Storage.prototype.getItem;
      const originalSet = Storage.prototype.setItem;
      if (failure === 'corrupt') originalSet.call(localStorage, key, '{historique cassé');
      Storage.prototype.getItem = function (name) {
        if (failure === 'blocked' && name === key) throw new DOMException('Lecture refusée', 'SecurityError');
        return originalGet.call(this, name);
      };
      Storage.prototype.setItem = function (name, value) {
        if (failure === 'quota' && name === key) throw new DOMException('Quota atteint', 'QuotaExceededError');
        return originalSet.call(this, name, value);
      };
    }, { key: historyKey, failure });
    await createCampaign(page, f.url);
    await page.locator('#nav-backups').click();
    const { buffer, archive } = await download(page);
    assert.equal(archive.format, 'chroniques-entre-rives.studio-local');
    await page.locator('#save-status').filter({ hasText: 'le suivi local n’a pas été actualisé' }).waitFor();
    await copyState(page, failure === 'quota' ? 'none' : 'unavailable');
    await reread(page, buffer);
    await page.locator('#backup-file-check-status').filter({ hasText: 'Fichier valide. Le suivi local conserve' }).waitFor();
    assert.notEqual(await page.locator('#backup-copy-state').getAttribute('data-state'), 'current');
    assert.match(await page.locator('#backup-last-verified').textContent(), /Aucune trace/);
    assert.deepEqual(await savedPayload(page, archive.payload.campaign.id), archive.payload);
    await context.close();
  }
});

test('Le diagnostic téléchargé masque les identifiants et les notes, sans réparer le stockage', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('diagnostic');
  await createCampaign(page, f.url);
  const rows = [
    { id: 'CANARI_IDENTIFIANT_BRUT', schema: 'autre-format', payload: { note: 'CANARI_SECRET_MJ', url: 'https://secret.invalid/canari' } },
    { id: 'CANARI_FUTUR', payload: { campaign: { id: 'CANARI_FUTUR', name: 'CANARI_NOM_PRIVE' }, journal: [] } },
  ];
  await page.evaluate(async rows => {
    const request = indexedDB.open('entre-rives.studio-local.v1', 1);
    const db = await new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction('campaigns', 'readwrite');
        tx.oncomplete = resolve; tx.onabort = () => reject(tx.error);
        for (const row of rows) tx.objectStore('campaigns').add(row);
      });
    } finally { db.close(); }
  }, rows);
  const rawRows = () => page.evaluate(async () => {
    const request = indexedDB.open('entre-rives.studio-local.v1', 1);
    const db = await new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    try {
      const request = db.transaction('campaigns', 'readonly').objectStore('campaigns').getAll();
      return await new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    } finally { db.close(); }
  });
  const before = await rawRows();
  await page.locator('#nav-backups').click();
  const { archive, buffer } = await download(page, '#download-diagnostic');
  assert.equal(archive.format, 'chroniques-entre-rives.diagnostic-stockage');
  assert.equal(archive.version, 1);
  assert.equal(archive.checked, 3);
  assert.equal(archive.readable, 1);
  assert.equal(archive.unreadable, 2);
  assert.equal(archive.entries.length, 2);
  assert.doesNotMatch(buffer.toString(), /CANARI_|secret\.invalid|Les copies du gué/);
  for (const entry of archive.entries) {
    assert.deepEqual(Object.keys(entry).sort(), ['reason', 'record']);
    assert.match(entry.record, /^sha256:[a-f0-9]{64}$/);
  }
  const second = await download(page, '#download-diagnostic');
  assert.deepEqual(second.archive.entries, archive.entries, 'Le repère anonyme permet de retrouver le même rejet');
  assert.deepEqual(await rawRows(), before, 'Aucune donnée saine ou illisible n’est changée par le diagnostic');
  assert.match(await page.locator('#save-status').textContent(), /1 campagne\(s\) lisible\(s\), 2 entrée\(s\)/);

  const copy = await download(page);
  await copyState(page, 'unverified');
  await page.evaluate(async id => {
    const request = indexedDB.open('entre-rives.studio-local.v1', 1);
    const db = await new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction('campaigns', 'readwrite');
        tx.oncomplete = resolve; tx.onabort = () => reject(tx.error);
        tx.objectStore('campaigns').put({ id, schema: 'invalide', payload: { note: 'CANARI_COMPARAISON' } });
      });
    } finally { db.close(); }
  }, copy.archive.payload.campaign.id);
  await reread(page, copy.buffer);
  await page.locator('#backup-file-check-status').filter({ hasText: 'La campagne déjà présente est illisible' }).waitFor();
  assert.equal((await receipts(page)).entries[copy.archive.payload.campaign.id].verified, undefined);
  await copyState(page, 'unverified');
  assert.equal(await page.locator('#restore-backup').isDisabled(), true);
});

test('Les sauvegardes restent utilisables au clavier et entre 320 et 1440 pixels', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('clavier-mobile', { viewport: { width: 320, height: 800 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await ready(page, f.url);
  await page.locator('#nav-backups').focus();
  await page.keyboard.press('Enter');
  await copyState(page, 'none');
  assert.equal(await page.locator('#export-backup').isDisabled(), true);
  assert.equal(await page.locator('#download-diagnostic').isEnabled(), true);
  await page.locator('#nav-home').click();
  await page.locator('#campaign-name').fill(campaignName);
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  await page.locator('#nav-backups').focus();
  await page.keyboard.press('Enter');
  await page.locator('#export-backup').focus();
  const [file] = await Promise.all([page.waitForEvent('download'), page.keyboard.press('Enter')]);
  const buffer = await readFile(await file.path());
  await copyState(page, 'unverified');
  let reachedInput = false;
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press('Tab');
    if (await page.locator('#backup-file').evaluate(input => input === document.activeElement)) { reachedInput = true; break; }
  }
  assert.equal(reachedInput, true, 'Le sélecteur de fichier est atteignable au clavier');
  const screenshots = process.env.STUDIO_SCREENSHOT_DIR || join(tmpdir(), 'entre-rives-fiabilite-captures');
  await mkdir(screenshots, { recursive: true });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('#backup-copy-state').scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Pas de débordement horizontal à ${width}px`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: join(screenshots, `fiabilite-${width}.png`), fullPage: true });
  }
  await reread(page, buffer);
  await copyState(page, 'current');
  assert.deepEqual(errors, []);
  t.diagnostic(`Captures navigateur : ${screenshots}`);
});
