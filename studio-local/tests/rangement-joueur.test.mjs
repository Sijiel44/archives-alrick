import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

async function seed(page, url, many = 0) {
  await page.goto(url + 'espace-joueur.html');
  await page.locator('#player-save-status').getByText('Stockage joueur prêt', { exact: true }).waitFor();
  const image = (await readFile(new URL('../media/heron-des-lanternes.webp', import.meta.url))).toString('base64');
  await page.evaluate(async ({ many, image }) => {
    const { openPlayerStore } = await import('./espace-joueur-store.mjs');
    const { createFreePJ, buildFreePJ } = await import('./pj-m02.mjs');
    const { EXCHANGE_KEY, makeExchange, readExchange, receivedSheet } = await import('./echanges-pj.mjs');
    const { readPortrait } = await import('./portraits.mjs');
    const bytes = Uint8Array.from(atob(image), char => char.charCodeAt(0));
    const portrait = await readPortrait(new File([bytes], 'portrait.webp', { type: 'image/webp' }));
    const store = await openPlayerStore();
    const base = { physique: 3, agilite: 3, esprit: 3, presence: 3 };
    const rows = [
      ['c-archived', 'pj-ceres', 'Cérès <img src=x onerror=alert(1)>', 'Éclaireuse', 5],
      ['b-current', 'pj-basile', 'Basile des Rives', 'Érudit', 10],
      ['a-old', 'pj-aveline', 'Aveline ancienne', 'Batelière', 5],
      ['a-current', 'pj-aveline', 'Aveline d’Écume', 'Batelière', 5],
      ...Array.from({ length: many }, (_, i) => ['voyageur-' + i, 'pj-voyageur-' + i, 'Voyageur ' + String(i + 1).padStart(2, '0'), 'Explorateur', 1]),
    ];
    for (const [id, sourceId, name, profession, level] of rows) {
      const { source } = createFreePJ(buildFreePJ({ level, startingStats: base, stats: base, masteries: level > 1 ? { magie: 2 } : {} }),
        { id: sourceId, name, profession, backstory: 'CANARI_HISTOIRE', connections: '', goal: '' });
      if (id === 'a-old') source.pv = 7;
      source.extensionFuture = { valeur: 'CANARI_EXTENSION' };
      source.inventory = [{ name: 'Lanterne', quantity: 2, category: 'outil', description: 'Objet fictif', extensionFuture: 'OBJET_INTACT' }];
      if (level > 1) source.portrait = portrait;
      if (sourceId === 'pj-aveline') {
        const exchange = await readExchange(JSON.stringify(await makeExchange(source, 'joueur')));
        source[EXCHANGE_KEY] = receivedSheet(exchange)[EXCHANGE_KEY];
      }
      await store.save({ id, sheet: source, notes: 'CANARI_NOTES_' + id,
        grimoire: [{ id: 'demo-lueur-guide', name: 'Lueur de veille', version: 'ancienne-source', notes: 'CANARI_GRIMOIRE', session: true }],
        rolls: [{ id: 'jet-' + id, kind: 'free', createdAt: '2026-11-01T12:00:00.000Z', label: 'Jet fictif', summary: 'CANARI_JET', dice: [1, 2, 3, 4, 5] }],
        filing: { archivedAt: id === 'c-archived' ? '2026-11-01T12:00:00.000Z' : null, extensionFuture: 'CANARI_RANGEMENT_PRIVE' } });
    }
    localStorage.setItem('entre-rives:pj-ouvert', 'a-current');
  }, { many, image });
  await page.goto(url + 'espace-joueur.html');
  await page.getByRole('heading', { name: 'Aveline d’Écume', exact: true }).waitFor();
}
async function records(page) {
  return page.evaluate(async () => (await (await import('./espace-joueur-store.mjs')).openPlayerStore()).list());
}
const row = (page, id) => page.locator(`#player-directory-list > li[data-record-id="${id}"]`);
async function directory(page) {
  await page.locator('#player-directory-open').click();
  await page.locator('#player-directory-dialog').waitFor();
  await page.locator('#player-directory-refresh:not(:disabled)').waitFor();
}
async function select(page, id) {
  await row(page, id).getByRole('button', { name: /Ouvrir la fiche/ }).click();
  await page.locator('#player-directory-dialog').waitFor({ state: 'hidden' });
}
async function backup(page, id = 'player-backup') {
  await page.getByRole('tab', { name: 'Sauvegarde', exact: true }).click();
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator('#' + id).click()]);
  return JSON.parse(await readFile(await file.path(), 'utf8'));
}
const input = value => ({ name: 'fiche-fictive.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });

test('Le répertoire retrouve les copies et les portraits sans modifier les fiches', { timeout: 40000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('rangement-recherche', { reducedMotion: 'reduce' });
  await seed(page, f.url);
  const before = await records(page);
  await directory(page);
  assert.equal(await page.locator('#player-directory-list > li[data-record-id]').count(), 3);
  await page.locator('#player-directory-query').fill('aveline bateliere');
  assert.equal(await page.locator('#player-directory-list > li[data-record-id]').count(), 2);
  assert.equal(await page.locator('#player-directory-list').getByText(/Version d’échange/).count(), 2);
  assert.equal(await row(page, 'a-current').locator('img').getAttribute('referrerpolicy'), 'no-referrer');
  assert.equal(await row(page, 'a-current').locator('img').evaluate(async img => { await img.decode(); return img.naturalWidth <= 320; }), true);
  await page.locator('#player-directory-query').fill('CANARI');
  assert.equal(await page.locator('#player-directory-list button').count(), 0);
  await page.locator('#player-directory-query').fill('');
  await page.locator('#player-directory-copies').check();
  assert.equal(await page.locator('#player-directory-list > li[data-record-id]').count(), 2);
  await row(page, 'a-current').getByRole('button', { name: 'Voir les copies' }).click();
  await page.locator('#player-directory-group').getByText(/Copies de Aveline/).waitFor();
  assert.equal(await page.locator('#player-directory-state').inputValue(), 'all');
  await select(page, 'a-old');
  await page.getByRole('heading', { name: 'Aveline ancienne', exact: true }).waitFor();
  await page.waitForFunction(() => document.activeElement === document.getElementById('player-name'));
  assert.deepEqual(await records(page), before);
});

test('Archiver puis remettre en activité conserve le profil, les notes, le grimoire et les jets', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('rangement-archive');
  await seed(page, f.url);
  const before = (await records(page)).find(record => record.id === 'a-old');
  await directory(page); await select(page, 'a-old');
  await page.getByText('Ajuster mes PV et mon mana', { exact: true }).click();
  await page.locator('#player-pv').fill('3');
  await page.locator('#player-filing-toggle').click();
  await page.locator('#player-filing-state').getByText(/Archive personnelle/).waitFor();
  const archived = (await records(page)).find(record => record.id === 'a-old');
  for (const field of ['id', 'sheet', 'notes', 'rolls', 'grimoire']) assert.deepEqual(archived[field], before[field]);
  assert.equal(archived.filing.extensionFuture, before.filing.extensionFuture);
  assert.match(archived.filing.archivedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(await page.locator('#player-pv').isDisabled(), true);
  assert.equal(await page.locator('#player-pv').inputValue(), String(before.sheet.pv));
  assert.equal(await page.locator('#player-free-roll').isDisabled(), true);
  assert.equal(await page.locator('#personal-notes').evaluate(el => el.readOnly), true);
  await page.getByRole('tab', { name: 'Inventaire', exact: true }).click();
  await page.getByRole('button', { name: 'Modifier Lanterne', exact: true }).click();
  assert.equal(await page.locator('#player-remove-item').isDisabled(), true);
  assert.equal(await page.locator('#edit-item-name').isDisabled(), true);
  await page.locator('#player-item-dialog [data-close]').click();
  await page.getByRole('tab', { name: 'Grimoire', exact: true }).click();
  await page.getByRole('button', { name: 'Consulter le sort Lueur de veille', exact: true }).click();
  assert.equal(await page.locator('#grimoire-save').isDisabled(), true);
  assert.equal(await page.locator('#grimoire-remove').isDisabled(), true);
  await page.locator('#grimoire-dialog [data-close]').click();
  await page.reload();
  await page.locator('#player-save-status').getByText('Stockage joueur prêt', { exact: true }).waitFor();
  assert.notEqual(await page.locator('#player-name').textContent(), before.sheet.name);
  await directory(page);
  assert.equal(await row(page, 'a-old').count(), 0);
  await page.locator('#player-directory-state').selectOption('archived');
  assert.equal(await page.locator('#player-directory-list > li[data-record-id]').count(), 2);
  assert.equal(await row(page, 'c-archived').locator('h3 img').count(), 0);
  await select(page, 'a-old');
  await page.locator('#player-filing-toggle').click();
  await page.locator('#player-filing-state').getByText('Fiche en activité', { exact: true }).waitFor();
  const restored = (await records(page)).find(record => record.id === 'a-old');
  assert.equal(restored.filing.archivedAt, null);
  for (const field of ['id', 'sheet', 'notes', 'rolls', 'grimoire']) assert.deepEqual(restored[field], before[field]);
  assert.equal(await page.locator('#player-free-roll').isEnabled(), true);
  assert.equal(await page.locator('#personal-notes').evaluate(el => el.readOnly), false);
});

test('La sauvegarde v4 restaure une archive et les échanges excluent son rangement privé', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('rangement-sauvegarde');
  await seed(page, f.url);
  await page.locator('#player-filing-toggle').click();
  await page.locator('#player-filing-state').getByText(/Archive personnelle/).waitFor();
  const archive = await backup(page);
  assert.equal(archive.version, 4);
  assert.ok(archive.payload.filing.archivedAt);
  let publicExchange;
  for (const id of ['player-send', 'player-exchange']) {
    const exported = await backup(page, id);
    if (id === 'player-send') publicExchange = exported;
    assert.doesNotMatch(JSON.stringify(exported), /archivedAt|CANARI_RANGEMENT_PRIVE|CANARI_NOTES|CANARI_GRIMOIRE/);
  }
  const { page: target } = await f.open('rangement-restaure');
  await target.goto(f.url + 'espace-joueur.html');
  await target.locator('#player-import').click();
  await target.locator('#player-file').setInputFiles(input(archive));
  await target.locator('#player-import-preview').getByText(/fiches archivées restent en consultation/).waitFor();
  await target.locator('#confirm-player-import').click();
  await target.getByRole('heading', { name: archive.payload.sheet.name, exact: true }).waitFor();
  assert.deepEqual((await backup(target)).payload, archive.payload);
  await target.locator('#player-import').click();
  await target.locator('#player-file').setInputFiles(input(publicExchange));
  await target.locator('#player-compare-preview .notice').waitFor();
  assert.equal(await target.locator('#player-compare-choice option').count(), 1);
  await target.locator('#player-exchange-accept').check();
  await target.locator('#confirm-player-import').click();
  await target.locator('#player-filing-state').getByText('Fiche en activité', { exact: true }).waitFor();
  const copies = await records(target);
  assert.equal(copies.length, 2);
  assert.equal(copies.filter(record => record.filing.archivedAt).length, 1);
  assert.deepEqual(copies.find(record => !record.filing.archivedAt).grimoire, []);
  const results = await target.evaluate(async archive => {
    const { readPlayerFile } = await import('./espace-joueur-store.mjs');
    const { sha256 } = await import('./store.mjs');
    const legacy = [];
    for (const version of [1, 2, 3]) {
      const payload = { sheet: archive.payload.sheet, notes: archive.payload.notes,
        ...(version >= 2 ? { rolls: archive.payload.rolls } : {}), ...(version >= 3 ? { grimoire: archive.payload.grimoire } : {}) };
      legacy.push((await readPlayerFile(JSON.stringify({ ...archive, version, payload, checksum: await sha256(JSON.stringify(payload)) }))).records[0].filing);
    }
    const rejected = [];
    for (const kind of ['future', 'altered', 'invalid', 'downgrade']) {
      const bad = structuredClone(archive);
      if (kind === 'future') bad.version = 5;
      if (kind === 'altered') bad.payload.filing.archivedAt = null;
      if (kind === 'invalid') { bad.payload.filing.archivedAt = 'date impossible'; bad.checksum = await sha256(JSON.stringify(bad.payload)); }
      if (kind === 'downgrade') bad.version = 3;
      try { await readPlayerFile(JSON.stringify(bad)); rejected.push(false); } catch { rejected.push(true); }
    }
    return { legacy, rejected };
  }, archive);
  assert.deepEqual(results, { legacy: Array.from({ length: 3 }, () => ({ archivedAt: null })), rejected: Array(4).fill(true) });
});

test('Les révisions et les transactions protègent une archive contre les écritures périmées', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page, context } = await f.open('rangement-concurrence');
  await seed(page, f.url);
  const second = await context.newPage();
  await second.goto(f.url + 'espace-joueur.html');
  await second.getByRole('heading', { name: 'Aveline d’Écume', exact: true }).waitFor();
  const before = (await records(page)).find(record => record.id === 'a-current');
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put; let once = true;
    IDBObjectStore.prototype.put = function (...args) {
      const result = put.apply(this, args);
      if (once && this.name === 'personnages') { once = false; this.transaction.abort(); }
      return result;
    };
  });
  await page.locator('#player-filing-toggle').click();
  await page.locator('#player-filing-message').getByText(/interrompu|aborted/i).waitFor();
  assert.deepEqual((await records(page)).find(record => record.id === before.id), before);
  await page.locator('#player-filing-toggle').click();
  await page.locator('#player-filing-state').getByText(/Archive personnelle/).waitFor();
  await second.getByRole('tab', { name: 'Notes', exact: true }).click();
  await second.locator('#personal-notes').fill('BROUILLON_CONCURRENT');
  await second.locator('#player-notes-form button').click();
  await second.locator('#player-error').getByText(/autre onglet/).waitFor();
  assert.equal(await second.locator('#personal-notes').inputValue(), 'BROUILLON_CONCURRENT');
  const protectedState = await page.evaluate(async before => {
    const store = await (await import('./espace-joueur-store.mjs')).openPlayerStore();
    const current = (await store.list()).find(record => record.id === before.id);
    const rejected = [];
    try { await store.setArchived({ id: before.id, revision: before.revision, archived: false }); rejected.push(false); } catch { rejected.push(true); }
    try { await store.save({ ...current, filing: { archivedAt: null }, notes: 'ECRASEMENT' }); rejected.push(false); } catch { rejected.push(true); }
    return { rejected, saved: (await store.list()).find(record => record.id === before.id) };
  }, before);
  assert.deepEqual(protectedState.rejected, [true, true]);
  assert.equal(protectedState.saved.notes, before.notes);
  assert.deepEqual(protectedState.saved.sheet, before.sheet);
  assert.ok(protectedState.saved.filing.archivedAt);
});

test('Les longues listes, le clavier et le choix de fiche restent utilisables sur mobile', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('rangement-mobile', { reducedMotion: 'reduce' });
  await seed(page, f.url, 45);
  await directory(page);
  assert.equal(await page.locator('#player-directory-list > li[data-record-id]').count(), 20);
  await page.locator('#player-directory-more').click();
  assert.equal(await page.locator('#player-directory-list > li[data-record-id]').count(), 40);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.locator('#player-directory-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
    assert.equal(await page.locator('#player-directory-close').evaluate(el => el.getBoundingClientRect().height >= 44), true);
  }
  await page.locator('#player-directory-query').fill('basile erudit');
  await page.locator('#player-directory-query').press('Enter');
  await page.locator('#player-directory-dialog').waitFor({ state: 'hidden' });
  await page.getByRole('heading', { name: 'Basile des Rives', exact: true }).waitFor();
  await page.reload();
  await page.getByRole('heading', { name: 'Basile des Rives', exact: true }).waitFor();
  await directory(page);
  await page.locator('#player-directory-refresh').click();
  await page.locator('#player-directory-refresh:not(:disabled)').waitFor();
  await page.keyboard.press('Escape');
  await page.locator('#player-directory-dialog').waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.activeElement === document.getElementById('player-directory-open'));
});

test('La migration v4 garde les personnages et le brouillon puis archive sans modifier leur contenu', { timeout: 40000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('rangement-source-migration');
  await seed(page, f.url);
  await page.locator('#player-create').click();
  await page.locator('#new-player-name').fill('Brouillon à conserver');
  await page.locator('#creation-draft-save').click();
  await page.locator('#creation-draft-status').getByText('Brouillon enregistré dans ce navigateur.', { exact: true }).waitFor();
  const legacyData = await page.evaluate(async () => {
    const store = await (await import('./espace-joueur-store.mjs')).openPlayerStore();
    const record = (await store.list()).find(record => record.id === 'a-current'); delete record.filing;
    return { record, draft: await store.readDraft() };
  });
  const { page: legacy, context } = await f.open('rangement-base-v4');
  await legacy.goto(f.url);
  await legacy.evaluate(async data => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('entre-rives.espace-joueur.v1', 4);
      request.onupgradeneeded = () => { for (const name of ['personnages', 'brouillons']) request.result.createObjectStore(name, { keyPath: 'id' }); };
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    db.onversionchange = () => { window.oldFilingConnectionClosed = true; db.close(); };
    await new Promise((resolve, reject) => {
      const tx = db.transaction(['personnages', 'brouillons'], 'readwrite');
      tx.objectStore('personnages').put(data.record); tx.objectStore('brouillons').put(data.draft);
      tx.oncomplete = resolve; tx.onabort = () => reject(tx.error);
    });
    window.oldFilingConnection = db;
  }, legacyData);
  const updated = await context.newPage();
  await updated.goto(f.url + 'espace-joueur.html');
  await updated.getByRole('heading', { name: 'Aveline d’Écume', exact: true }).waitFor();
  assert.equal(await legacy.evaluate(() => window.oldFilingConnectionClosed), true);
  assert.deepEqual(await records(updated), [{ ...legacyData.record, filing: { archivedAt: null } }]);
  await updated.locator('#creation-draft-name').getByText('Brouillon à conserver', { exact: true }).waitFor();
  await updated.locator('#player-filing-toggle').click();
  await updated.locator('#player-filing-state').getByText(/Archive personnelle/).waitFor();
  const after = (await records(updated))[0];
  for (const field of ['sheet', 'notes', 'rolls', 'grimoire']) assert.deepEqual(after[field], legacyData.record[field]);
  assert.deepEqual(await updated.evaluate(async () => (await (await import('./espace-joueur-store.mjs')).openPlayerStore()).readDraft()), legacyData.draft);
});
