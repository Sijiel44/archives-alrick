import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

async function seed(page, url, grimoire = []) {
  await page.goto(url);
  await page.evaluate(async grimoire => {
    const { createFreePJ, buildFreePJ } = await import('./pj-m02.mjs');
    const { openPlayerStore } = await import('./espace-joueur-store.mjs');
    const store = await openPlayerStore();
    const stats = { physique: 3, agilite: 3, esprit: 3, presence: 3 };
    for (const [id, name] of [['joueur-b', 'Basile de recette'], ['joueur-a', 'Aveline de recette']]) {
      const { source } = createFreePJ(buildFreePJ({ level: 5, startingStats: stats, stats, masteries: { magie: 2 } }),
        { id: 'source-' + id, name, profession: 'Érudite', backstory: '', connections: '', goal: '' });
      source.extensionFuture = { preuve: 'EXTENSION_FUTURE_PJ' };
      source.grimoire = { schema: 'alrick.grimoire.v1', known: [], extensionFuture: { preuve: 'GRIMOIRE_HISTORIQUE' } };
      await store.save({ id, sheet: source, notes: 'CANARI_NOTES_PERSONNELLES', grimoire: id === 'joueur-a' ? grimoire : [] });
    }
    const { openStudioStore } = await import('./store.mjs');
    const gm = await openStudioStore();
    try { await gm.execute({ id: 'campagne-privee', expectedRevision: 0, operationId: 'creation-fictive', type: 'create',
      data: { name: 'CANARI_CAMPAGNE_MJ', description: 'CANARI_SECRET_MJ', style: 'campaign', startingLevel: 1 } }); }
    finally { gm.close(); }
  }, grimoire);
  await page.goto(url + 'espace-joueur.html#player-grimoire');
  await page.getByRole('heading', { name: 'Aveline de recette', exact: true }).waitFor();
}

const packet = value => ({ name: 'personnage-fictif.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });
async function stored(page, id = 'joueur-a') {
  return page.evaluate(async id => {
    const { openPlayerStore } = await import('./espace-joueur-store.mjs');
    return (await (await openPlayerStore()).list()).find(record => record.id === id);
  }, id);
}
async function download(page, id = 'player-backup') {
  await page.getByRole('tab', { name: 'Sauvegarde', exact: true }).click();
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator('#' + id).click()]);
  return JSON.parse(await readFile(await file.path(), 'utf8'));
}
async function consult(page, name = 'Lueur de veille') {
  await page.getByRole('button', { name: `Consulter le sort ${name}`, exact: true }).press('Enter');
  await page.locator('#grimoire-detail-title').getByText(name, { exact: true }).waitFor();
}

test('Le grimoire classe les références communes sans accorder un sort ni dépenser de mana', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('grimoire-catalogue', { reducedMotion: 'reduce' });
  await seed(page, f.url);
  const before = await stored(page);
  assert.equal(await page.locator('#grimoire-list > li').count(), 6);
  await page.locator('#grimoire-search').fill('etincelle controlee');
  assert.equal(await page.locator('#grimoire-list > li').count(), 1);
  await consult(page, 'Étincelle contrôlée');
  await page.locator('#grimoire-detail-status').getByText(/Démonstration non canonique/).waitFor();
  await page.locator('#grimoire-dialog [data-close]').click();
  assert.deepEqual(await stored(page), before, 'la consultation est sans écriture');
  await page.locator('#grimoire-search').fill('');
  await page.locator('#grimoire-domain').selectOption('lumiere');
  await page.locator('#grimoire-circle').selectOption('8');
  await page.locator('#grimoire-list').getByText(/Aucun sort/).waitFor();
  await page.locator('#grimoire-circle').selectOption('1');
  await consult(page);
  await page.locator('#grimoire-detail-fields').getByText('2', { exact: true }).waitFor();
  await page.locator('#grimoire-detail-fields').getByText(/Ne révèle pas un secret/).waitFor();
  assert.match(await page.locator('#grimoire-detail-source').getAttribute('href'), /\/blob\/88f774f3d0d6d520d8d11443b72202b9caf4f94b\/quartz\/components\/scripts\/atelier5d6-grimoire.ts$/);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.locator('#grimoire-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
    assert.equal(await page.locator('#grimoire-save').evaluate(el => el.getBoundingClientRect().height >= 44), true);
  }
  await page.locator('#grimoire-session').check();
  await page.locator('#grimoire-notes').fill('CANARI_GRIMOIRE · Une lumière pour mon équipage.');
  await page.locator('#grimoire-save').click();
  await page.locator('#grimoire-dialog').waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.activeElement === document.getElementById('player-grimoire-title'));
  const after = await stored(page);
  assert.deepEqual(after.sheet, before.sheet);
  assert.equal(after.grimoire[0].id, 'demo-lueur-guide');
  assert.equal(after.grimoire[0].session, true);
  await page.locator('#grimoire-scope').selectOption('session');
  assert.equal(await page.locator('#grimoire-list button').count(), 1);
  const backup = await download(page);
  assert.equal(backup.version, 4);
  assert.deepEqual(backup.payload.grimoire, after.grimoire);
  assert.doesNotMatch(JSON.stringify(backup), /CANARI_CAMPAGNE_MJ|CANARI_SECRET_MJ/);
  await page.reload();
  await page.getByRole('tab', { name: 'Grimoire', exact: true }).click();
  await page.locator('#grimoire-scope').selectOption('saved');
  await page.locator('#player-selection').selectOption('joueur-b');
  await page.locator('#grimoire-scope').selectOption('saved');
  assert.equal(await page.locator('#grimoire-list button').count(), 0);
  await page.locator('#player-selection').selectOption('joueur-a');
  await page.locator('#grimoire-scope').selectOption('saved');
  await consult(page);
  page.once('dialog', prompt => prompt.dismiss());
  await page.locator('#grimoire-remove').click();
  assert.equal(await page.locator('#grimoire-notes').inputValue(), after.grimoire[0].notes);
  page.once('dialog', prompt => prompt.accept());
  await page.locator('#grimoire-remove').click();
  await page.locator('#grimoire-dialog').waitFor({ state: 'hidden' });
  assert.deepEqual((await stored(page)).grimoire, []);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await page.locator('.sheet-nav').evaluate(el => [...el.querySelectorAll('[role=tab]')].every(tab => {
      const b = tab.getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth && b.height >= 44;
    })), true);
  }
});

test('Les références anciennes ou absentes gardent leurs notes et se restaurent dans un profil vierge', { timeout: 40000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('grimoire-versions');
  const missingName = 'Page <img src=x onerror=alert(1)>';
  const bookmarks = [{ id: 'demo-lueur-guide', name: 'Ancienne lueur', version: 'ancien-catalogue', notes: 'NOTE_ANCIENNE', session: true, extensionFuture: { preuve: 17 } },
    { id: 'reference-absente', name: missingName, version: 'future-reference', notes: 'CANARI_ORPHELIN', session: false, extensionFuture: { preuve: 23 } }];
  await seed(page, f.url, bookmarks);
  await consult(page);
  await page.locator('#grimoire-detail-version').getByText(/référence a changé/).waitFor();
  await page.locator('#grimoire-notes').fill('NOTE_REVISEE');
  await page.locator('#grimoire-save').click();
  await page.locator('#grimoire-dialog').waitFor({ state: 'hidden' });
  assert.equal((await stored(page)).grimoire.find(entry => entry.id === 'demo-lueur-guide').version, 'ancien-catalogue');
  await consult(page);
  await page.locator('#grimoire-adopt-version').check();
  await page.locator('#grimoire-save').click();
  await page.locator('#grimoire-dialog').waitFor({ state: 'hidden' });
  const adopted = (await stored(page)).grimoire.find(entry => entry.id === 'demo-lueur-guide');
  assert.match(adopted.version, /^[0-9a-f]{40}$/);
  assert.deepEqual(adopted.extensionFuture, { preuve: 17 });
  await consult(page, missingName);
  assert.equal(await page.locator('#grimoire-dialog img').count(), 0);
  assert.equal(await page.locator('#grimoire-detail-source').isVisible(), false);
  assert.equal(await page.locator('#grimoire-notes').inputValue(), 'CANARI_ORPHELIN');
  await page.locator('#grimoire-dialog [data-close]').click();
  const backup = await download(page);
  const { page: restored } = await f.open('grimoire-restaure');
  await restored.goto(f.url + 'espace-joueur.html#player-grimoire');
  await restored.locator('#player-import').click();
  await restored.locator('#player-file').setInputFiles(packet(backup));
  await restored.locator('#confirm-player-import').click();
  await restored.getByRole('heading', { name: 'Aveline de recette', exact: true }).waitFor();
  const again = await download(restored);
  assert.deepEqual(again.payload, backup.payload);
  const legacy = await restored.evaluate(async archive => {
    const { readPlayerFile } = await import('./espace-joueur-store.mjs');
    const { sha256 } = await import('./store.mjs');
    const results = [];
    for (const version of [1, 2]) {
      const payload = { sheet: archive.payload.sheet, notes: archive.payload.notes, ...(version === 2 ? { rolls: archive.payload.rolls } : {}) };
      const result = await readPlayerFile(JSON.stringify({ ...archive, version, payload, checksum: await sha256(JSON.stringify(payload)) }));
      results.push(result.records[0].grimoire);
    }
    return results;
  }, backup);
  assert.deepEqual(legacy, [[], []]);
});

test('Une interruption ou une révision périmée conserve le grimoire enregistré et le brouillon', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page, context } = await f.open('grimoire-concurrence');
  await seed(page, f.url);
  await consult(page);
  await page.locator('#grimoire-notes').fill('BROUILLON_A_CONSERVER');
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    let interrupt = true;
    IDBObjectStore.prototype.put = function (...args) {
      const result = put.apply(this, args);
      if (interrupt && this.name === 'personnages') { interrupt = false; this.transaction.abort(); }
      return result;
    };
  });
  await page.locator('#grimoire-save').click();
  await page.locator('#grimoire-form [data-save-message]').getByText(/interrompu|aborted/i).waitFor();
  assert.equal(await page.locator('#grimoire-notes').inputValue(), 'BROUILLON_A_CONSERVER');
  assert.deepEqual((await stored(page)).grimoire, []);
  await page.locator('#grimoire-save').click();
  await page.locator('#grimoire-dialog').waitFor({ state: 'hidden' });
  const second = await context.newPage();
  await second.goto(f.url + 'espace-joueur.html#player-grimoire');
  await second.getByRole('heading', { name: 'Aveline de recette', exact: true }).waitFor();
  await consult(second);
  await consult(page);
  await page.locator('#grimoire-notes').fill('PREMIERE_REVISION_VALIDEE');
  await page.locator('#grimoire-save').click();
  await page.locator('#grimoire-dialog').waitFor({ state: 'hidden' });
  await second.locator('#grimoire-notes').fill('SECOND_BROUILLON_PRIVE');
  await second.locator('#grimoire-save').click();
  await second.locator('#grimoire-form [data-save-message]').getByText(/autre onglet/).waitFor();
  assert.equal(await second.locator('#grimoire-notes').inputValue(), 'SECOND_BROUILLON_PRIVE');
  assert.equal((await stored(page)).grimoire[0].notes, 'PREMIERE_REVISION_VALIDEE');
});

test('Le stockage contrôle les limites du grimoire et reprend la base joueur précédente', { timeout: 40000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('grimoire-validation');
  await seed(page, f.url);
  const result = await page.evaluate(async () => {
    const { openPlayerStore, playerBackup, readPlayerFile } = await import('./espace-joueur-store.mjs');
    const { sha256 } = await import('./store.mjs');
    const store = await openPlayerStore();
    const record = (await store.list()).find(row => row.id === 'joueur-a');
    const entry = { id: 'inconnue', name: 'Référence de recette', version: 'source-fictive', notes: '', session: false, extensionFuture: { valeur: 'conservee' } };
    const bad = [[entry, entry], Array.from({ length: 81 }, (_, i) => ({ ...entry, id: 'reference-' + i })), [{ ...entry, notes: 'n'.repeat(4001) }], [{ ...entry, session: 'oui' }]];
    const rejected = [];
    for (const grimoire of bad) {
      try { await store.save({ ...record, grimoire }); rejected.push(false); } catch { rejected.push(true); }
    }
    const backup = await playerBackup({ ...record, grimoire: [entry] });
    for (const kind of ['future', 'downgrade', 'altered', 'invalid']) {
      const b = structuredClone(backup);
      if (kind === 'future') b.version = 5;
      if (kind === 'downgrade') b.version = 2;
      if (kind === 'altered') b.payload.grimoire[0].notes = 'CHANGEMENT';
      if (kind === 'invalid') { b.payload.grimoire[0].session = null; b.checksum = await sha256(JSON.stringify(b.payload)); }
      try { await readPlayerFile(JSON.stringify(b)); rejected.push(false); } catch { rejected.push(true); }
    }
    return { rejected, saved: (await store.list()).find(row => row.id === record.id).grimoire };
  });
  assert.deepEqual(result, { rejected: Array(8).fill(true), saved: [] });
  await page.evaluate(async () => {
    const { openPlayerStore } = await import('./espace-joueur-store.mjs');
    const store = await openPlayerStore();
    const record = (await store.list()).find(row => row.id === 'joueur-a');
    await store.save({ ...record, grimoire: Array.from({ length: 80 }, (_, i) => ({ id: 'archive-' + i,
      name: 'Archive ' + String(i).padStart(2, '0'), version: 'ancienne-reference', notes: '', session: false })) });
  });
  await page.reload();
  await page.locator('#grimoire-search').fill('Lueur');
  await consult(page);
  assert.equal(await page.locator('#grimoire-save').isDisabled(), true);
  await page.locator('#grimoire-form [data-save-message]').getByText(/déjà 80/).waitFor();
  await page.locator('#grimoire-dialog [data-close]').click();
  await page.locator('#grimoire-search').fill('');
  await page.locator('#grimoire-scope').selectOption('saved');
  assert.equal(await page.locator('#grimoire-list button').count(), 12);
  await page.locator('#grimoire-more').click();
  assert.equal(await page.locator('#grimoire-list button').count(), 24);
  await consult(page, 'Archive 00');
  assert.equal(await page.locator('#grimoire-save').isEnabled(), true);
  await page.locator('#grimoire-notes').fill('NOTE_A_LA_LIMITE');
  await page.locator('#grimoire-save').click();
  await page.locator('#grimoire-dialog').waitFor({ state: 'hidden' });
  assert.equal((await stored(page)).grimoire.length, 80);
  const { page: legacy, context } = await f.open('grimoire-base-v2');
  await legacy.goto(f.url);
  const record = await stored(page);
  await legacy.evaluate(async record => {
    delete record.grimoire;
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('entre-rives.espace-joueur.v1', 2);
      request.onupgradeneeded = () => request.result.createObjectStore('personnages', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.onversionchange = () => { window.oldGrimoireConnectionClosed = true; db.close(); };
    await new Promise((resolve, reject) => {
      const tx = db.transaction('personnages', 'readwrite');
      tx.objectStore('personnages').put(record);
      tx.oncomplete = resolve;
      tx.onabort = () => reject(tx.error);
    });
    window.oldGrimoireDB = db;
  }, record);
  const updated = await context.newPage();
  await updated.goto(f.url + 'espace-joueur.html#player-grimoire');
  await updated.getByRole('heading', { name: 'Aveline de recette', exact: true }).waitFor();
  assert.equal(await legacy.evaluate(() => window.oldGrimoireConnectionClosed), true);
  const migrated = await download(updated);
  assert.deepEqual(migrated.payload.sheet, record.sheet);
  assert.deepEqual(migrated.payload.grimoire, []);
});

test('Les échanges gardent le grimoire privé et le reportent sur la version personnelle adoptée', { timeout: 40000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('grimoire-echange');
  const bookmark = { id: 'demo-lueur-guide', name: 'Lueur de veille', version: 'ancien-catalogue', notes: 'CANARI_GRIMOIRE_PRIVE', session: true };
  await seed(page, f.url, [bookmark]);
  for (const button of ['player-send', 'player-exchange']) {
    const exchange = await download(page, button);
    assert.doesNotMatch(JSON.stringify(exchange), /CANARI_GRIMOIRE_PRIVE|CANARI_NOTES_PERSONNELLES|CANARI_SECRET_MJ|"grimoire"/);
  }
  const received = await page.evaluate(async () => {
    const { makeExchange } = await import('./echanges-pj.mjs');
    const { openPlayerStore } = await import('./espace-joueur-store.mjs');
    const record = (await (await openPlayerStore()).list()).find(row => row.id === 'joueur-a');
    return makeExchange({ ...record.sheet, name: 'Aveline après la séance', pv: 7 }, 'mj');
  });
  await page.locator('#player-import').click();
  await page.locator('#player-file').setInputFiles(packet(received));
  await page.locator('#player-compare-preview .notice').waitFor();
  await page.locator('#player-exchange-accept').check();
  await page.locator('#confirm-player-import').click();
  await page.getByRole('heading', { name: 'Aveline après la séance', exact: true }).waitFor();
  const backup = await download(page);
  assert.deepEqual(backup.payload.grimoire, [bookmark]);
  assert.equal(backup.payload.sheet.pv, 7);
  assert.deepEqual((await stored(page)).grimoire, [bookmark]);
});
