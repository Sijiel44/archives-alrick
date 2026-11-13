import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

async function fixtureFile(page, rollCount = 0) {
  return page.evaluate(async count => {
    const { buildFreePJ, createFreePJ } = await import('./pj-m02.mjs');
    const { sha256 } = await import('./store.mjs');
    const { playerBackup } = await import('./espace-joueur-store.mjs');
    const base = { physique: 3, agilite: 3, esprit: 3, presence: 3 };
    const { source } = createFreePJ(buildFreePJ({ level: 5, startingStats: base, stats: base, masteries: { magie: 2 } }),
      { id: 'pj-table-04', name: 'Aveline de recette', profession: 'Batelière', backstory: 'CANARI_HISTOIRE', connections: '', goal: '' });
    source.inventory = [
      { name: 'Lanterne', quantity: 2, category: 'outil', description: 'Une lumière pour la traversée.', extensionFuture: { preuve: 'CANARI_OBJET' } },
      { name: 'Amulette', quantity: 1, category: 'bijou', description: 'Un souvenir.', equipped: true },
      { futureItem: { valeur: 'DONNEE_INCONNUE' } },
      { name: 'Objet de format futur', category: { toString: 'valeur opaque' }, quantity: { valeur: 3 } },
    ];
    source.extensionFuture = { valeur: 'CANARI_EXTENSION' };
    source.development.abilities = [{
      id: 'veille', name: 'Veille des rives', domain: 'Navigation', kind: 'aptitude', status: 'defined',
      rank: 1, levelRequired: 3, provenance: 'Source fictive de recette', approvedByGM: false,
      description: 'Repérer les courants.', effect: 'Effet descriptif à arbitrer.', limitations: 'En présence d’un cours d’eau.',
    }];
    if (count) {
      const rolls = Array.from({ length: count }, (_, index) => ({ id: 'ancien-' + index, kind: 'free',
        createdAt: new Date(Date.UTC(2026, 10, 1, 0, count - index)).toISOString(), label: 'Jet ancien ' + index,
        summary: 'Jet libre de recette', dice: [1, 2, 3, 4, 5] }));
      return JSON.stringify(await playerBackup({ sheet: source, notes: 'CANARI_NOTES', rolls }));
    }
    const payload = { sheet: source, notes: 'CANARI_NOTES' };
    return JSON.stringify({ format: 'chroniques-entre-rives.joueur', version: 1,
      payload, checksum: await sha256(JSON.stringify(payload)) });
  }, rollCount);
}

async function importFile(page, text) {
  await page.locator('#player-import').click();
  await page.locator('#player-file').setInputFiles({ name: 'fiche-fictive.json', mimeType: 'application/json', buffer: Buffer.from(text) });
  await page.locator('#confirm-player-import').click();
  await page.getByRole('heading', { name: 'Aveline de recette', exact: true }).waitFor();
}

async function download(page, button) {
  await page.getByRole('tab', { name: 'Sauvegarde', exact: true }).click();
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator('#' + button).click()]);
  return JSON.parse(await readFile(await file.path(), 'utf8'));
}

test('Les panneaux et l’inventaire préservent les anciens objets et refusent une modification périmée', { timeout: 55000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open('table-04-inventaire', { reducedMotion: 'reduce' });
  await page.goto(fixture.url + 'espace-joueur.html#player-inventory');
  await importFile(page, await fixtureFile(page));
  await page.getByRole('tabpanel', { name: 'Inventaire', exact: true }).waitFor();
  await page.locator('#player-item-search').fill('lanterne');
  await page.getByText('Lanterne × 2', { exact: true }).waitFor();
  await page.locator('#player-item-search').fill('');
  await page.locator('#player-item-filter').selectOption('equipped');
  assert.equal(await page.getByText('Lanterne × 2', { exact: true }).count(), 0);
  await page.getByText('Amulette × 1', { exact: true }).waitFor();
  await page.locator('#player-item-filter').selectOption('all');
  await page.getByRole('button', { name: 'Modifier Lanterne', exact: true }).click();
  const dialog = page.locator('#player-item-dialog');
  await page.locator('#edit-item-quantity').fill('5');
  await page.locator('#edit-item-equipped').check();
  await dialog.getByRole('button', { name: 'Enregistrer l’objet' }).click();
  await dialog.waitFor({ state: 'hidden' });
  await page.getByText('Lanterne × 5', { exact: true }).waitFor();
  assert.equal(await page.locator('#player-inventory-title').evaluate(el => el === document.activeElement), true);

  const second = await context.newPage();
  await second.goto(fixture.url + 'espace-joueur.html#player-inventory');
  await second.getByRole('button', { name: 'Modifier Lanterne', exact: true }).click();
  await second.locator('#edit-item-quantity').fill('9');
  await page.getByRole('tab', { name: 'Notes', exact: true }).click();
  await page.locator('#personal-notes').fill('CANARI_NOTES version confirmée');
  await page.getByRole('button', { name: 'Enregistrer mes notes' }).click();
  await page.locator('#player-save-status').getByText('Sauvegarde locale confirmée').waitFor();
  await second.getByRole('button', { name: 'Enregistrer l’objet' }).click();
  await second.locator('#player-item-dialog [data-save-message]').getByText(/autre onglet/).waitFor();
  assert.equal(await second.locator('#edit-item-quantity').inputValue(), '9');
  await second.locator('#player-item-dialog').getByRole('button', { name: 'Fermer', exact: true }).click();

  const backup = await download(page, 'player-backup');
  assert.equal(backup.version, 2);
  assert.equal(backup.payload.sheet.inventory[0].quantity, 5);
  assert.equal(backup.payload.sheet.inventory[0].equipped, true);
  assert.equal(backup.payload.sheet.inventory[0].extensionFuture.preuve, 'CANARI_OBJET');
  assert.equal(backup.payload.sheet.inventory[2].futureItem.valeur, 'DONNEE_INCONNUE');
  assert.equal(backup.payload.sheet.extensionFuture.valeur, 'CANARI_EXTENSION');
  const exchange = await download(page, 'player-exchange');
  assert.equal(exchange.sheets[0].inventory[0].equipped, true);
  assert.doesNotMatch(JSON.stringify(exchange), /CANARI_NOTES|CANARI_OBJET|CANARI_EXTENSION|CANARI_HISTOIRE|DONNEE_INCONNUE/);

  await page.getByRole('tab', { name: 'Inventaire', exact: true }).click();
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'inventaire ' + width);
    assert.equal(await page.locator('.sheet-nav').evaluate(nav => [...nav.querySelectorAll('[role="tab"]')].every(tab => {
      const box = tab.getBoundingClientRect();
      return box.left >= 0 && box.right <= innerWidth && box.height >= 44;
    })), true, 'onglets accessibles ' + width);
  }
  await page.getByRole('button', { name: 'Modifier Lanterne', exact: true }).click();
  page.once('dialog', prompt => prompt.dismiss());
  await page.locator('#player-remove-item').click();
  assert.equal(await dialog.isVisible(), true);
  page.once('dialog', prompt => prompt.accept());
  await page.locator('#player-remove-item').click();
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await page.getByText('Lanterne × 5', { exact: true }).count(), 0);

  await page.getByRole('tab', { name: 'Fiche', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('tab', { name: 'Dés', exact: true }).getAttribute('aria-selected'), 'true');
  await page.keyboard.press('End');
  await page.getByRole('tabpanel', { name: 'Sauvegarde', exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Capacités', exact: true }).click();
  await page.locator('#player-ability-search').fill('courants');
  await page.getByText('Veille des rives · Navigation', { exact: true }).click();
  await page.getByText('Source fictive de recette', { exact: true }).waitFor();
});

test('Les jets consignés survivent à une interruption, au rechargement et à la restauration privée', { timeout: 45000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('table-04-jets');
  await page.goto(fixture.url + 'espace-joueur.html');
  await importFile(page, await fixtureFile(page));
  await page.getByText('Ajuster mes PV et mon mana', { exact: true }).click();
  await page.locator('#player-pv').fill('20');
  await page.getByRole('tab', { name: 'Dés', exact: true }).click();
  await page.locator('#roll-mastery').selectOption('magie');
  await page.locator('#roll-intent').fill('CANARI_JET_PRIVE');
  await page.getByRole('button', { name: 'Lancer une action 5d6', exact: true }).click();
  await page.locator('#player-keep-roll').click();
  await page.locator('#player-roll-count').getByText('1 / 50', { exact: true }).waitFor();
  assert.equal(await page.locator('#roll-mastery').inputValue(), 'magie');
  assert.equal(await page.locator('#player-pv').inputValue(), '20');
  await page.locator('#player-resources').getByText(/PV 36 \/ 36/).waitFor();
  assert.equal(await page.locator('#player-keep-roll').isDisabled(), true);
  await page.locator('#player-free-roll').click();
  const result = await page.locator('#player-roll-result').textContent();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      IDBObjectStore.prototype.put = original;
      this.transaction.abort();
    };
  });
  await page.locator('#player-keep-roll').click();
  await page.getByRole('alert').getByText(/Enregistrement interrompu/).waitFor();
  assert.equal(await page.locator('#player-roll-count').textContent(), '1 / 50');
  assert.equal(await page.locator('#player-roll-result').textContent(), result);
  await page.locator('#player-keep-roll').click();
  await page.locator('#player-roll-count').getByText('2 / 50', { exact: true }).waitFor();
  await page.reload();
  await page.locator('#player-roll-count').getByText('2 / 50', { exact: true }).waitFor();
  assert.equal(await page.locator('#player-rolls').evaluate(panel => {
    const top = panel.getBoundingClientRect().top;
    return top >= 0 && top < innerHeight && document.activeElement === panel;
  }), true);
  const backup = await download(page, 'player-backup');
  assert.equal(backup.payload.rolls.length, 2);
  const exchange = await download(page, 'player-exchange');
  assert.doesNotMatch(JSON.stringify(exchange), /CANARI_JET_PRIVE|CANARI_NOTES/);

  const { page: restored } = await fixture.open('table-04-restaure');
  await restored.goto(fixture.url + 'espace-joueur.html#player-rolls');
  await importFile(restored, JSON.stringify(backup));
  await restored.locator('#player-roll-count').getByText('2 / 50', { exact: true }).waitFor();
  await restored.locator('#player-roll-history').getByText('CANARI_JET_PRIVE', { exact: true }).waitFor();
  assert.equal(await restored.locator('#personal-notes').inputValue(), 'CANARI_NOTES');
});

test('La limite du journal est explicite et une sauvegarde à dés invalides est refusée', { timeout: 45000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('table-04-limites');
  await page.goto(fixture.url + 'espace-joueur.html#player-rolls');
  const file = await fixtureFile(page, 50);
  await importFile(page, file);
  await page.locator('#player-roll-count').getByText('50 / 50', { exact: true }).waitFor();
  await page.locator('#player-free-roll').click();
  await page.locator('#player-keep-roll').click();
  await page.getByRole('button', { name: 'Jet consigné', exact: true }).waitFor();
  const backup = await download(page, 'player-backup');
  assert.equal(backup.payload.rolls.length, 50);
  assert.equal(backup.payload.rolls[0].label, 'Jet libre 5d6');
  assert.equal(backup.payload.rolls.some(roll => roll.id === 'ancien-49'), false);
  const rejected = await page.evaluate(async archive => {
    const { readPlayerFile } = await import('./espace-joueur-store.mjs');
    const { sha256 } = await import('./store.mjs');
    archive.payload.rolls[0].dice[0] = 7;
    archive.checksum = await sha256(JSON.stringify(archive.payload));
    try { await readPlayerFile(JSON.stringify(archive)); return false; } catch { return true; }
  }, backup);
  assert.equal(rejected, true);
});

test('La mise à jour du stockage reprend les personnages locaux et ferme une ancienne connexion', { timeout: 45000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open('table-04-migration');
  await page.goto(fixture.url);
  const archive = JSON.parse(await fixtureFile(page));
  await page.evaluate(async payload => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('entre-rives.espace-joueur.v1', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('personnages', { keyPath: 'id' });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    db.onversionchange = () => { window.legacyPlayerClosed = true; db.close(); };
    await new Promise((resolve, reject) => {
      const tx = db.transaction('personnages', 'readwrite');
      tx.objectStore('personnages').put({ id: 'ancien-personnage-local', revision: 7, updatedAt: Date.now(), ...payload });
      tx.oncomplete = resolve;
      tx.onabort = () => reject(tx.error);
    });
    window.legacyPlayerConnection = db;
  }, archive.payload);
  const updated = await context.newPage();
  await updated.goto(fixture.url + 'espace-joueur.html#player-rolls');
  await updated.getByRole('heading', { name: 'Aveline de recette', exact: true }).waitFor();
  await updated.locator('#player-roll-count').getByText('0 / 50', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.legacyPlayerClosed), true);
  const backup = await download(updated, 'player-backup');
  assert.equal(backup.version, 2);
  assert.equal(backup.payload.notes, 'CANARI_NOTES');
  assert.equal(backup.payload.sheet.extensionFuture.valeur, 'CANARI_EXTENSION');
  assert.deepEqual(backup.payload.rolls, []);
});
