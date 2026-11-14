import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

async function start(page, url) {
  await page.goto(url + 'espace-joueur.html');
  await page.locator('#player-save-status').getByText('Stockage joueur prêt', { exact: true }).waitFor();
}
async function openFree(page, name = 'Mira du brouillon') {
  await page.locator('#player-create').click();
  await page.locator('#new-player-mode').selectOption('free');
  await page.locator('#new-player-name').fill(name);
  await page.locator('#new-player-level').fill('5');
}
async function readState(page) {
  return page.evaluate(async () => {
    const { openPlayerStore } = await import('./espace-joueur-store.mjs');
    const store = await openPlayerStore();
    return { draft: await store.readDraft(), characters: await store.list() };
  });
}
async function checkpoint(page) {
  await page.locator('#creation-draft-save').click();
  await page.locator('#creation-draft-status').getByText('Brouillon enregistré dans ce navigateur.', { exact: true }).waitFor();
}
async function downloadDraft(page) {
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator('#creation-draft-export').click()]);
  return JSON.parse(await readFile(await file.path(), 'utf8'));
}
const fileInput = value => ({ name: 'creation-fictive.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });

test('Le brouillon reprend les champs incomplets, le portrait et les domaines avant toute création M02', { timeout: 50000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('brouillon-reprise', { reducedMotion: 'reduce' });
  await start(page, f.url);
  await openFree(page);
  await page.locator('#final-physique').fill('8');
  await page.locator('#final-esprit').fill('');
  await page.getByText('Choisir les maîtrises', { exact: true }).click();
  await page.locator('#mastery-magie').fill('2');
  await page.locator('#custom-mastery-name').fill('Magie des brumes');
  await page.locator('#add-custom-mastery').click();
  await page.locator('#custom-masteries input').fill('2');
  await page.locator('#creation-portrait-file').setInputFiles({ name: 'portrait-fictif.webp', mimeType: 'image/webp',
    buffer: await readFile(new URL('../media/heron-des-lanternes.webp', import.meta.url)) });
  await page.locator('#creation-portrait').getByText(/Portrait prêt/).waitFor();
  await page.getByText('Histoire et liens · facultatif', { exact: true }).click();
  await page.locator('#new-player-backstory').fill('CANARI_HISTOIRE_BROUILLON');
  await checkpoint(page);
  const before = await readState(page);
  assert.equal(before.characters.length, 0);
  assert.equal(before.draft.snapshot.fields['final-esprit'], '');
  assert.match(before.draft.snapshot.portrait, /^data:image\/jpeg;base64,/);
  await page.locator('#player-create-dialog [data-close]').click();
  await page.locator('#player-create-dialog').waitFor({ state: 'hidden' });
  await page.reload();
  await page.locator('#creation-draft-name').getByText('Mira du brouillon', { exact: true }).waitFor();
  await page.locator('#creation-draft-resume').press('Enter');
  await page.locator('#player-create-dialog').waitFor();
  assert.equal(await page.locator('#new-player-mode').inputValue(), 'free');
  assert.equal(await page.locator('#final-physique').inputValue(), '8');
  assert.equal(await page.locator('#final-esprit').inputValue(), '');
  assert.equal(await page.locator('#custom-masteries input').inputValue(), '2');
  assert.equal(await page.locator('#new-player-backstory').inputValue(), 'CANARI_HISTOIRE_BROUILLON');
  assert.equal(await page.locator('#creation-portrait [data-portrait-preview]').getAttribute('src'), before.draft.snapshot.portrait);
  assert.equal(await page.locator('#confirm-player-create').isDisabled(), true);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.locator('#player-create-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
    assert.equal(await page.locator('#creation-draft-export').evaluate(el => el.getBoundingClientRect().height >= 44), true);
  }
  await page.locator('#final-esprit').fill('3');
  await page.getByRole('button', { name: 'Vérifier la fiche', exact: true }).click();
  await page.locator('#confirm-player-create:not(:disabled)').waitFor();
  await page.locator('#confirm-player-create').click();
  await page.getByRole('heading', { name: 'Mira du brouillon', exact: true }).waitFor();
  const after = await readState(page);
  assert.equal(after.characters.length, 1);
  assert.equal(after.characters[0].id, before.draft.snapshot.id);
  assert.equal(after.characters[0].sheet.id, before.draft.snapshot.id);
  assert.equal(after.characters[0].sheet.stats.physique, 8);
  assert.equal(after.characters[0].sheet.masteries['Magie des brumes'], 2);
  assert.equal(after.draft.snapshot, null);
  assert.equal(await page.locator('#creation-draft-card').isVisible(), false);
});

test('La création et le retrait du brouillon sont atomiques après une interruption', { timeout: 40000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('brouillon-transaction');
  await start(page, f.url);
  await openFree(page, 'Création interrompue');
  await checkpoint(page);
  await page.getByRole('button', { name: 'Vérifier la fiche', exact: true }).click();
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    let once = true;
    IDBObjectStore.prototype.put = function (...args) {
      const result = put.apply(this, args);
      if (once && this.name === 'personnages') { once = false; this.transaction.abort(); }
      return result;
    };
  });
  await page.locator('#confirm-player-create').click();
  await page.locator('#player-create-result').getByText(/interrompu|aborted/i).waitFor();
  const interrupted = await readState(page);
  assert.equal(interrupted.characters.length, 0);
  assert.equal(interrupted.draft.snapshot.fields['new-player-name'], 'Création interrompue');
  assert.equal(await page.locator('#new-player-name').inputValue(), 'Création interrompue');
  await page.locator('#confirm-player-create').click();
  await page.getByRole('heading', { name: 'Création interrompue', exact: true }).waitFor();
  const after = await readState(page);
  assert.equal(after.characters.length, 1);
  assert.equal(after.draft.snapshot, null);
  assert.equal(after.characters[0].sheet.pv, 36);
});

test('Deux onglets gardent les choix divergents et un ancien brouillon ne revient pas après son retrait', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page, context } = await f.open('brouillon-concurrence');
  await start(page, f.url);
  await openFree(page, 'Version initiale');
  await checkpoint(page);
  const old = (await readState(page)).draft;
  const second = await context.newPage();
  await start(second, f.url);
  await second.locator('#creation-draft-resume').click();
  await second.locator('#player-create-dialog').waitFor();
  await page.locator('#new-player-name').fill('Version conservée');
  await checkpoint(page);
  await second.locator('#new-player-name').fill('Brouillon divergent');
  await second.locator('#creation-draft-status').getByText(/autre onglet/).waitFor();
  const backup = await downloadDraft(second);
  assert.equal(backup.payload.fields['new-player-name'], 'Brouillon divergent');
  assert.equal((await readState(page)).draft.snapshot.fields['new-player-name'], 'Version conservée');
  second.once('dialog', prompt => prompt.accept());
  await second.locator('#creation-draft-reload').click();
  await second.waitForFunction(() => document.getElementById('new-player-name').value === 'Version conservée');
  second.once('dialog', prompt => prompt.accept());
  await second.locator('#creation-draft-new').click();
  await second.locator('#creation-draft-status').getByText(/Nouveau brouillon/).waitFor();
  const stale = await page.evaluate(async old => {
    const { openPlayerStore } = await import('./espace-joueur-store.mjs');
    try { await (await openPlayerStore()).saveDraft(old.snapshot, old.revision); return false; } catch { return true; }
  }, old);
  assert.equal(stale, true);
  assert.equal((await readState(page)).draft.snapshot, null);
  assert.equal((await readState(page)).characters.length, 0);
});

test('Le brouillon voyage par fichier après aperçu sans écraser un personnage ni le brouillon courant', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('brouillon-source');
  await start(page, f.url);
  await openFree(page, 'Voyageuse des brouillons');
  await checkpoint(page);
  const file = await downloadDraft(page);
  assert.equal(file.format, 'chroniques-entre-rives.brouillon-pj');
  file.payload.fields = Object.fromEntries(Object.entries(file.payload.fields).reverse());
  file.checksum = await page.evaluate(async payload => (await import('./store.mjs')).sha256(JSON.stringify(payload)), file.payload);
  const { page: target } = await f.open('brouillon-destination');
  await start(target, f.url);
  await openFree(target, 'Ancien brouillon local');
  await checkpoint(target);
  await target.locator('#player-create-dialog [data-close]').click();
  await target.locator('#creation-draft-import-open').click();
  await target.locator('#creation-draft-file').setInputFiles(fileInput(file));
  await target.locator('#creation-draft-import-preview').getByText(/Voyageuse des brouillons/).waitFor();
  assert.equal(await target.locator('#creation-draft-import-confirm').isDisabled(), true);
  assert.equal((await readState(target)).draft.snapshot.fields['new-player-name'], 'Ancien brouillon local');
  for (const variant of ['future', 'altered', 'foreign']) {
    const bad = structuredClone(file);
    if (variant === 'future') bad.version = 2;
    if (variant === 'altered') bad.payload.fields['new-player-name'] = 'Modification';
    if (variant === 'foreign') bad.format = 'chroniques-entre-rives.joueur';
    await target.locator('#creation-draft-file').setInputFiles(fileInput(bad));
    await target.locator('#creation-draft-import-preview').getByText(/inconnue|altéré|Choisis un fichier de brouillon/).waitFor();
    assert.equal(await target.locator('#creation-draft-import-confirm').isDisabled(), true);
    assert.equal((await readState(target)).draft.snapshot.fields['new-player-name'], 'Ancien brouillon local');
  }
  const unsupported = structuredClone(file);
  unsupported.payload.fields['player-pv'] = '999';
  unsupported.checksum = await target.evaluate(async payload => (await import('./store.mjs')).sha256(JSON.stringify(payload)), unsupported.payload);
  await target.locator('#creation-draft-file').setInputFiles(fileInput(unsupported));
  await target.locator('#creation-draft-import-preview').getByText(/champs ou choix/).waitFor();
  assert.equal(await target.locator('#creation-draft-import-confirm').isDisabled(), true);
  await target.locator('#creation-draft-file').setInputFiles(fileInput(file));
  await target.locator('#creation-draft-import-preview').getByText(/Voyageuse des brouillons/).waitFor();
  await target.locator('#creation-draft-replace').check();
  await target.locator('#creation-draft-import-confirm').click();
  await target.locator('#player-create-dialog').waitFor();
  assert.equal(await target.locator('#new-player-name').inputValue(), 'Voyageuse des brouillons');
  assert.equal((await readState(target)).characters.length, 0);
  assert.notEqual((await readState(target)).draft.snapshot.id, file.payload.id);
  await target.getByRole('button', { name: 'Vérifier la fiche', exact: true }).click();
  await target.locator('#confirm-player-create').click();
  await target.getByRole('heading', { name: 'Voyageuse des brouillons', exact: true }).waitFor();
  assert.equal((await readState(target)).characters.length, 1);
});

test('Le parcours guidé conserve les choix et demande une nouvelle vérification après reprise', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('brouillon-guide');
  await start(page, f.url);
  await page.locator('#player-create').click();
  const name = 'Lio <img src=x onerror=alert(1)>';
  await page.locator('#new-player-name').fill(name);
  for (const select of await page.locator('#origin-fields select').all()) await select.selectOption({ index: 1 });
  await checkpoint(page);
  const before = (await readState(page)).draft.snapshot;
  await page.keyboard.press('Escape');
  await page.locator('#player-create-dialog').waitFor({ state: 'hidden' });
  await page.reload();
  assert.equal(await page.locator('#creation-draft-name img').count(), 0);
  await page.locator('#creation-draft-resume').click();
  await page.locator('#player-create-dialog').waitFor();
  assert.equal(await page.locator('#confirm-player-create').isDisabled(), true);
  assert.deepEqual((await readState(page)).draft.snapshot, before);
  await page.getByRole('button', { name: 'Vérifier la fiche', exact: true }).click();
  await page.locator('#confirm-player-create').click();
  await page.getByRole('heading', { name, exact: true }).waitFor();
  assert.equal(await page.locator('#player-name img').count(), 0);
  assert.equal((await readState(page)).characters[0].sheet.level, 5);
});

test('Une écriture de brouillon interrompue se réessaie et les anciennes fiches restent intactes', { timeout: 40000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('brouillon-interruption');
  await start(page, f.url);
  await page.locator('#player-create').click();
  await page.locator('#player-create-dialog [data-close]').click();
  await page.locator('#player-create-dialog').waitFor({ state: 'hidden' });
  assert.equal((await readState(page)).draft, undefined);
  await page.locator('#player-create').click();
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    let once = true;
    IDBObjectStore.prototype.put = function (...args) {
      const result = put.apply(this, args);
      if (once && this.name === 'brouillons') { once = false; this.transaction.abort(); }
      return result;
    };
  });
  await page.locator('#new-player-name').fill('Choix à conserver');
  await page.locator('#creation-draft-status').getByText(/interrompu|aborted/i).waitFor();
  assert.equal(await page.locator('#new-player-name').inputValue(), 'Choix à conserver');
  assert.equal((await readState(page)).draft, undefined);
  await checkpoint(page);
  assert.equal((await readState(page)).draft.snapshot.fields['new-player-name'], 'Choix à conserver');
  const backup = await downloadDraft(page);
  const validation = await page.evaluate(async backup => {
    const { readCreationDraftFile, creationDraftBackup } = await import('./brouillons-pj.mjs');
    const { readPlayerFile } = await import('./espace-joueur-store.mjs');
    const bad = structuredClone(backup.payload);
    bad.customMasteries = Array.from({ length: 13 }, (_, i) => ({ name: 'Domaine ' + i, rank: '0' }));
    const rejected = [];
    try { await creationDraftBackup(bad); rejected.push(false); } catch { rejected.push(true); }
    try { await readCreationDraftFile(' '.repeat(512 * 1024 + 1)); rejected.push(false); } catch { rejected.push(true); }
    try { await readPlayerFile(JSON.stringify(backup)); rejected.push(false); } catch { rejected.push(true); }
    return rejected;
  }, backup);
  assert.deepEqual(validation, [true, true, true]);
});

test('La base joueur v3 conserve ses fiches et son grimoire pendant la migration des brouillons', { timeout: 40000 }, async t => {
  const f = await browserFixture(t);
  const { page, context } = await f.open('brouillon-migration');
  await page.goto(f.url);
  const original = await page.evaluate(async () => {
    const { buildFreePJ, createFreePJ } = await import('./pj-m02.mjs');
    const stats = { physique: 3, agilite: 3, esprit: 3, presence: 3 };
    const { source } = createFreePJ(buildFreePJ({ level: 5, startingStats: stats, stats, masteries: {} }),
      { id: 'source-migration', name: 'PJ avant les brouillons', profession: '', backstory: '', connections: '', goal: '' });
    source.extensionFuture = { preuve: 'SOURCE_A_CONSERVER' };
    const record = { id: 'fiche-ancienne', revision: 7, updatedAt: Date.now(), sheet: source, notes: 'NOTES_A_CONSERVER', rolls: [],
      grimoire: [{ id: 'reference-ancienne', name: 'Ancien repère', version: 'ancienne-version', notes: 'GRIMOIRE_A_CONSERVER', session: true }] };
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('entre-rives.espace-joueur.v1', 3);
      request.onupgradeneeded = () => request.result.createObjectStore('personnages', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.onversionchange = () => { window.oldDraftConnectionClosed = true; db.close(); };
    await new Promise((resolve, reject) => {
      const tx = db.transaction('personnages', 'readwrite');
      tx.objectStore('personnages').put(record);
      tx.oncomplete = resolve;
      tx.onabort = () => reject(tx.error);
    });
    window.legacyDraftConnection = db;
    return record;
  });
  const updated = await context.newPage();
  await start(updated, f.url);
  await updated.getByRole('heading', { name: 'PJ avant les brouillons', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.oldDraftConnectionClosed), true);
  assert.deepEqual(await readState(updated), { draft: undefined, characters: [original] });
  await updated.getByRole('tab', { name: 'Grimoire', exact: true }).click();
  await updated.getByRole('button', { name: 'Consulter le sort Ancien repère', exact: true }).waitFor();
  await openFree(updated, 'Nouveau brouillon indépendant');
  await checkpoint(updated);
  assert.deepEqual((await readState(updated)).characters, [original]);
});
