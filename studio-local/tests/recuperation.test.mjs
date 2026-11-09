import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

const campaignName = 'Campagne saine fictive';
const unreadableRows = [
  { id: 'ancienne-source', schema: 'autre-application', payload: { note: 'CANARI_MJ_HORS_FORMAT' } },
  { id: 'campagne-future', payload: { campaign: { id: 'campagne-future', name: 'CANARI_MJ_FUTUR' }, journal: [] } },
];

test('Un profil partiellement illisible permet de reprendre et sauvegarder une campagne saine', { timeout: 45000 }, async t => {
  const browser = await browserFixture(t);
  const { page, context } = await browser.open('recuperation', { viewport: { width: 390, height: 844 } });
  await page.goto(browser.url);
  await page.locator('#save-status').filter({ hasText: 'Stockage local prêt' }).waitFor();
  const notice = page.locator('#campaign-recovery');
  assert.equal(await notice.isHidden(), true);

  await page.evaluate(async rows => {
    const open = indexedDB.open('entre-rives.studio-local.v1', 1);
    const db = await new Promise((resolve, reject) => {
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
    try {
      await new Promise((resolve, reject) => {
        const transaction = db.transaction('campaigns', 'readwrite');
        transaction.oncomplete = resolve;
        transaction.onabort = () => reject(transaction.error);
        for (const row of rows) transaction.objectStore('campaigns').add(row);
      });
    } finally { db.close(); }
    history.replaceState(null, '', '#reprendre');
  }, unreadableRows);

  await page.reload();
  await page.waitForFunction(() => document.activeElement.id === 'campaign-recovery');
  await page.locator('#campaigns-empty').getByText('Aucune campagne lisible dans ce profil.').waitFor();
  await page.locator('#campaign-name').fill(campaignName);
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();

  await page.evaluate(id => {
    localStorage.setItem('entre-rives:derniere-campagne', id);
    history.replaceState(null, '', '#reprendre');
  }, unreadableRows[1].id);
  await page.reload();
  await page.locator('#prepare-title').waitFor();
  await notice.getByText('2 enregistrements de campagne sont illisibles.').waitFor();
  assert.equal(await page.locator('#app-error').isHidden(), true);
  assert.doesNotMatch(await page.locator('body').textContent(), /CANARI_MJ|campagne-future|ancienne-source/);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

  const other = await context.newPage();
  await other.goto(browser.url);
  await other.getByRole('button', { name: `Ouvrir ${campaignName}` }).click();
  await page.locator('#add-character').click();
  await page.locator('#character-name').fill('Brouillon du premier onglet');
  await other.locator('#add-character').click();
  await other.locator('#character-name').fill('La batelière');
  await other.getByRole('button', { name: 'Enregistrer le PJ' }).click();
  await other.locator('#character-list').getByText('La batelière', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Enregistrer le PJ' }).click();
  const conflict = page.locator('#character-dialog .reload-draft');
  await conflict.waitFor();
  assert.equal(await page.locator('#character-name').inputValue(), 'Brouillon du premier onglet');
  await conflict.click();
  await page.locator('#character-list').getByText('La batelière', { exact: true }).waitFor();
  await notice.waitFor();

  await page.locator('#nav-backups').click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const buffer = await readFile(await download.path());
  assert.doesNotMatch(buffer.toString(), /CANARI_MJ|campagne-future|ancienne-source/);

  const data = await page.evaluate(async ids => {
    const { openStudioStore } = await import('/store.mjs');
    const store = await openStudioStore();
    try {
      const strict = await store.list().then(() => 'accepted', error => error.code);
      const inventory = await store.listRecoverable();
      const request = indexedDB.open('entre-rives.studio-local.v1', 1);
      const db = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        const table = db.transaction('campaigns', 'readonly').objectStore('campaigns');
        const rows = await Promise.all(ids.map(id => new Promise((resolve, reject) => {
          const read = table.get(id);
          read.onsuccess = () => resolve(read.result);
          read.onerror = () => reject(read.error);
        })));
        return { strict, rows, unreadableCount: inventory.unreadableCount, names: inventory.campaigns.map(campaign => campaign.name) };
      } finally { db.close(); }
    } finally { store.close(); }
  }, unreadableRows.map(row => row.id));
  assert.deepEqual(data, { strict: 'foreign-key', rows: unreadableRows, unreadableCount: 2, names: [campaignName] });

  const { page: restored } = await browser.open('restauration');
  await restored.goto(browser.url);
  await restored.locator('#save-status').filter({ hasText: 'Stockage local prêt' }).waitFor();
  await restored.locator('#nav-backups').click();
  await restored.locator('#backup-file').setInputFiles({ name: 'campagne-saine.json', mimeType: 'application/json', buffer });
  await restored.locator('#restore-backup').click();
  await restored.locator('#character-list').getByText('La batelière', { exact: true }).waitFor();
  assert.equal(await restored.locator('#campaign-recovery').isHidden(), true);
});
