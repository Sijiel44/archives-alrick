import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

async function start(page, url) {
  await page.goto(url + 'espace-joueur.html');
  await page.locator('#player-save-status').getByText('Stockage joueur prêt', { exact: true }).waitFor();
}
async function seed(page, url, many = 0) {
  await start(page, url);
  const image = (await readFile(new URL('../media/heron-des-lanternes.webp', import.meta.url))).toString('base64');
  await page.evaluate(async ({ image, many }) => {
    const { openPlayerStore } = await import('./espace-joueur-store.mjs');
    const { createFreePJ, buildFreePJ } = await import('./pj-m02.mjs');
    const { readPortrait } = await import('./portraits.mjs');
    const portrait = await readPortrait(new File([Uint8Array.from(atob(image), c => c.charCodeAt(0))], 'fictif.webp', { type: 'image/webp' }));
    const store = await openPlayerStore();
    const stats = { physique: 3, agilite: 3, esprit: 3, presence: 3 };
    const { source } = createFreePJ(buildFreePJ({ level: 5, startingStats: stats, stats, masteries: { magie: 2 } }),
      { id: 'pj-aveline', name: 'Aveline d’Écume', profession: 'Batelière', backstory: 'CANARI_HISTOIRE', connections: '', goal: '' });
    source.portrait = portrait;
    source.inventory = [{ name: 'Lanterne', quantity: 2, extensionFuture: 'OBJET_INTACT' }];
    source.extensionFuture = { a: 1, b: { c: 'INCONNU_CONSERVE' } };
    for (const [id, sheet, archivedAt] of [
      ['a-current', source, null],
      ['a-archive', { ...source, name: 'Aveline aux Salines', pv: 7 }, '2026-11-01T12:00:00.000Z'],
      ['b-current', { ...source, id: 'pj-basile', name: 'Basile <img src=x onerror=alert(1)>', profession: 'Érudit' }, null],
      ...Array.from({ length: many }, (_, i) => ['extra-' + i, { ...source, id: 'pj-extra-' + i, name: 'Voyageur ' + i }, null]),
    ]) {
      await store.save({ id, sheet, notes: 'CANARI_NOTES_' + id,
        rolls: [{ id: 'jet-' + id, kind: 'free', createdAt: '2026-11-01T12:00:00.000Z', label: 'Jet fictif', summary: 'CANARI_JET', dice: [1, 2, 3, 4, 5] }],
        grimoire: [{ id: 'demo-lueur-guide', name: 'Lueur de veille', version: 'ancienne-source', notes: 'CANARI_GRIMOIRE', session: true }],
        filing: { archivedAt, extensionFuture: 'RANGEMENT_INTACT' } });
    }
    await store.saveDraft({ id: 'brouillon-fictif', fields: { 'new-player-mode': 'free', 'new-player-name': 'CANARI_BROUILLON' }, customMasteries: [], portrait: '', expanded: [] });
    localStorage.setItem('entre-rives:pj-ouvert', 'a-current');
  }, { image, many });
  await start(page, url);
}
async function state(page) {
  return page.evaluate(async () => { const store = await (await import('./espace-joueur-store.mjs')).openPlayerStore(); return { records: await store.list(), draft: await store.readDraft() }; });
}
async function makeNotebook(page) {
  return page.evaluate(async () => (await import('./carnet-joueur.mjs')).playerNotebook(await (await (await import('./espace-joueur-store.mjs')).openPlayerStore()).list()));
}
const payload = ({ sheet, notes, rolls, grimoire, filing }) => ({ sheet, notes, rolls, grimoire, filing });
const input = value => ({ name: 'carnet-fictif.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });
async function openExport(page) {
  await page.locator('#player-notebook-export').click();
  await page.locator('#notebook-refresh:not(:disabled)').waitFor();
}
async function openImport(page, file) {
  await page.locator('#player-notebook-import').click();
  await page.locator('#notebook-file').setInputFiles(input(file));
  await page.locator('#notebook-preview').waitFor();
  await page.locator('#notebook-refresh:not(:disabled)').waitFor();
}
async function download(page) {
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator('#notebook-confirm').click()]);
  await page.locator('#notebook-message').getByText(/Fichier proposé/).waitFor();
  return JSON.parse(await readFile(await file.path(), 'utf8'));
}

test('Le carnet exporte les fiches cochées et leurs archives sans modifier le stockage ni le brouillon', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('carnet-export');
  await seed(page, f.url);
  const before = await state(page);
  await openExport(page);
  assert.match(await page.locator('#notebook-privacy').textContent(), /Fichier personnel/);
  assert.equal(await page.locator('#notebook-list input:checked').count(), 3);
  assert.equal(await page.locator('#notebook-list h3 img').count(), 0);
  assert.equal(await page.locator('#notebook-list img').first().getAttribute('referrerpolicy'), 'no-referrer');
  const file = await download(page);
  assert.equal(file.format, 'chroniques-entre-rives.carnet-joueur'); assert.equal(file.version, 1);
  assert.equal(file.payload.entries.length, 3);
  for (const entry of file.payload.entries) assert.deepEqual(entry.payload, payload(before.records.find(record => record.id === entry.sourceId)));
  assert.doesNotMatch(JSON.stringify(file), /CANARI_BROUILLON|brouillon-fictif/);
  await page.locator('#notebook-clear').click();
  assert.equal(await page.locator('#notebook-confirm').isDisabled(), true);
  await page.locator('#notebook-query').fill('aveline bateliere');
  await page.locator('#notebook-state').selectOption('archived');
  await page.locator('#notebook-select-results').click();
  const subset = await download(page);
  assert.deepEqual(subset.payload.entries.map(entry => entry.sourceId), ['a-archive']);
  assert.ok(subset.payload.entries[0].payload.filing.archivedAt);
  assert.deepEqual(await state(page), before);
});

test('La restauration annonce les doublons et ajoute ensemble les copies choisies avec leurs données privées', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('carnet-restaure');
  await seed(page, f.url);
  const before = await state(page), file = await makeNotebook(page);
  file.payload.entries.find(entry => entry.sourceId === 'b-current').payload.sheet.name = 'Basile revenu';
  file.checksum = await page.evaluate(async value => (await import('./store.mjs')).sha256(JSON.stringify(value)), file.payload);
  await openImport(page, file);
  assert.equal(await page.locator('#notebook-list input:checked').count(), 1);
  await page.locator('#notebook-list').getByText(/Contenu identique à/).first().waitFor();
  const archiveRow = page.locator('#notebook-list > li').filter({ has: page.getByRole('heading', { name: 'Aveline aux Salines', exact: true }) });
  await archiveRow.getByRole('checkbox').check();
  assert.match(await page.locator('#notebook-confirm').textContent(), /2 copies/);
  await page.locator('#notebook-confirm').click();
  await page.locator('#notebook-dialog').waitFor({ state: 'hidden' });
  const after = await state(page);
  assert.equal(after.records.length, 5); assert.deepEqual(after.draft, before.draft);
  for (const record of before.records) assert.deepEqual(after.records.find(item => item.id === record.id), record);
  for (const record of after.records.filter(item => !before.records.some(old => old.id === item.id))) {
    assert.equal(record.revision, 1);
    assert.deepEqual(payload(record), file.payload.entries.find(entry => entry.payload.sheet.name === record.sheet.name).payload);
  }
  await page.locator('#player-directory-open').click(); await page.locator('#player-directory-refresh:not(:disabled)').waitFor();
  await page.locator('#player-directory-state').selectOption('archived');
  assert.equal(await page.locator('#player-directory-list > li[data-record-id]').count(), 2);
});

test('Une interruption de lot annule toutes les copies et un nouvel aperçu permet un réessai complet', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('carnet-atomique');
  await seed(page, f.url);
  const file = await makeNotebook(page), { page: target } = await f.open('carnet-vierge');
  await start(target, f.url); await openImport(target, file);
  const before = await state(target);
  await target.evaluate(() => {
    const original = IDBObjectStore.prototype.add; let writes = 0;
    IDBObjectStore.prototype.add = function (...args) { const result = original.apply(this, args); if (this.name === 'personnages' && ++writes === 2) { this.transaction.abort(); IDBObjectStore.prototype.add = original; } return result; };
  });
  await target.locator('#notebook-confirm').click();
  await target.locator('#notebook-message').getByText(/Actualise l’aperçu/).waitFor();
  assert.deepEqual(await state(target), before);
  assert.equal(await target.locator('#notebook-confirm').isDisabled(), true);
  await target.locator('#notebook-refresh').click(); await target.locator('#notebook-confirm:not(:disabled)').waitFor();
  await target.locator('#notebook-confirm').click(); await target.locator('#notebook-dialog').waitFor({ state: 'hidden' });
  assert.equal((await state(target)).records.length, 3);
});

test('Le carnet refuse un aperçu périmé après un changement dans un autre onglet', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { context, page } = await f.open('carnet-concurrence');
  await seed(page, f.url); const file = await makeNotebook(page);
  await openImport(page, file); await page.locator('#notebook-select-results').click();
  const other = await context.newPage(); await start(other, f.url);
  await other.evaluate(async () => { const store = await (await import('./espace-joueur-store.mjs')).openPlayerStore(); const record = (await store.list()).find(record => record.id === 'a-current'); await store.save({ ...record, notes: 'AUTRE_ONGLET_CONSERVE' }); });
  const before = await state(page);
  await page.locator('#notebook-confirm').click();
  await page.locator('#notebook-message').getByText(/a changé dans un autre onglet/).waitFor();
  assert.deepEqual(await state(page), before);
  await page.locator('#notebook-refresh').click(); await page.locator('#notebook-refresh:not(:disabled)').waitFor();
  assert.equal(await page.locator('#notebook-list input:checked').count(), 1);
  await page.locator('#notebook-confirm').click(); await page.locator('#notebook-dialog').waitFor({ state: 'hidden' });
  assert.equal((await state(page)).records.length, 4);
});

test('Les contenus identiques sont reconnus malgré l’ordre des clés et les copies répétées restent un choix explicite', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('carnet-doublons');
  await seed(page, f.url); const file = await makeNotebook(page);
  const reordered = await page.evaluate(async archive => {
    const reverse = value => Array.isArray(value) ? value.map(reverse) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).reverse().map(([key, item]) => [key, reverse(item)])) : value;
    const next = reverse(archive); next.checksum = await (await import('./store.mjs')).sha256(JSON.stringify(next.payload)); return next;
  }, file);
  await openImport(page, reordered);
  assert.equal(await page.locator('#notebook-list input:checked').count(), 0);
  assert.equal(await page.locator('#notebook-confirm').isDisabled(), true);
  await page.locator('#notebook-close').click();
  const repeated = structuredClone(file); repeated.payload.entries.push({ ...structuredClone(repeated.payload.entries[0]), sourceId: 'autre-copie-identique' });
  repeated.checksum = await page.evaluate(async value => (await import('./store.mjs')).sha256(JSON.stringify(value)), repeated.payload);
  const { page: target } = await f.open('carnet-doublons-vierge'); await start(target, f.url); await openImport(target, repeated);
  assert.equal(await target.locator('#notebook-list input:checked').count(), 3);
  await target.locator('#notebook-list').getByText('Contenu identique à une autre entrée de ce fichier.', { exact: true }).waitFor();
  await target.locator('#notebook-confirm').click(); await target.locator('#notebook-dialog').waitFor({ state: 'hidden' });
  await openImport(target, repeated);
  assert.equal(await target.locator('#notebook-list input:checked').count(), 0);
});

test('Un carnet altéré, futur ou trop volumineux et une fiche invalide sont refusés avant toute écriture', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('carnet-invalides');
  await seed(page, f.url); const file = await makeNotebook(page), before = await state(page);
  const results = await page.evaluate(async original => {
    const { readPlayerNotebook, playerNotebook } = await import('./carnet-joueur.mjs');
    const { sha256 } = await import('./store.mjs');
    const { openPlayerStore } = await import('./espace-joueur-store.mjs');
    const attempts = [];
    for (const change of [value => value.version = 2, value => value.payload.entries[0].payload.notes = 'altérée',
      value => value.payload.entries[0].payload.sheet.stats.physique = -2, value => value.payload.entries[0].payload.filing.archivedAt = 'hier',
      value => value.payload.entries.push(structuredClone(value.payload.entries[0])), value => value.payload.unknown = true]) {
      const value = structuredClone(original); change(value);
      if (value.payload.entries[0].payload.notes !== 'altérée') value.checksum = await sha256(JSON.stringify(value.payload));
      try { await readPlayerNotebook(JSON.stringify(value)); attempts.push(false); } catch { attempts.push(true); }
    }
    try { await readPlayerNotebook(' '.repeat(20 * 1024 * 1024 + 1)); attempts.push(false); } catch { attempts.push(true); }
    const store = await openPlayerStore(), records = await store.list();
    try { await playerNotebook(Array.from({ length: 101 }, (_, index) => ({ ...records[0], id: 'copie-' + index }))); attempts.push(false); } catch { attempts.push(true); }
    const invalid = structuredClone(original.payload.entries[0].payload); invalid.notes = 'x'.repeat(8001);
    try { await store.importNotebook({ entries: [original.payload.entries[1].payload, invalid], expected: records.map(({ id, revision }) => ({ id, revision })) }); attempts.push(false); } catch { attempts.push(true); }
    try { await (await import('./espace-joueur-store.mjs')).readPlayerFile(JSON.stringify(original)); attempts.push(false); } catch (error) { attempts.push(error.message.includes('Restaurer un carnet')); }
    const deep = structuredClone(records[0]); let nested = 'extension';
    for (let i = 0; i < 20; i++) nested = { enfant: nested };
    deep.sheet.extensionFuture = nested;
    let exported;
    try { exported = await playerNotebook([deep]); } catch { /* Un export refusé ne doit jamais produire un fichier illisible. */ }
    try { if (exported) await readPlayerNotebook(JSON.stringify(exported)); attempts.push(true); } catch { attempts.push(false); }
    return attempts;
  }, file);
  assert.deepEqual(results, Array(11).fill(true));
  await page.locator('#player-notebook-import').click();
  await page.locator('#notebook-file').setInputFiles(input({ ...file, version: 99 }));
  await page.locator('#notebook-message').getByText(/n’est pas un carnet joueur v1/).waitFor();
  assert.equal(await page.locator('#notebook-confirm').isDisabled(), true);
  assert.deepEqual(await state(page), before);
});

test('Les notes non enregistrées restent visibles et le carnet distingue export enregistré et abandon confirmé', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('carnet-notes');
  await seed(page, f.url); const before = await state(page);
  await page.getByRole('tab', { name: 'Notes', exact: true }).click();
  await page.locator('#personal-notes').fill('BROUILLON_NOTES_NON_ENREGISTRE');
  await openExport(page); const file = await download(page);
  assert.doesNotMatch(JSON.stringify(file), /BROUILLON_NOTES_NON_ENREGISTRE/);
  await page.locator('#notebook-close').click();
  assert.equal(await page.locator('#personal-notes').inputValue(), 'BROUILLON_NOTES_NON_ENREGISTRE');
  await openImport(page, file); await page.locator('#notebook-select-results').click();
  page.once('dialog', dialog => dialog.dismiss());
  await page.locator('#notebook-confirm').click();
  assert.equal(await page.locator('#notebook-dialog').isVisible(), true);
  assert.deepEqual(await state(page), before);
  assert.equal(await page.locator('#personal-notes').inputValue(), 'BROUILLON_NOTES_NON_ENREGISTRE');
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#notebook-confirm').click(); await page.locator('#notebook-dialog').waitFor({ state: 'hidden' });
  assert.equal((await state(page)).records.length, 6);
});

test('Les listes longues gardent leurs sélections hors écran, le clavier et le rendu mobile', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('carnet-mobile', { reducedMotion: 'reduce' });
  await seed(page, f.url, 100); await openExport(page);
  assert.equal(await page.locator('#notebook-list > li[data-entry]').count(), 20);
  await page.locator('#notebook-more').click();
  assert.equal(await page.locator('#notebook-list > li[data-entry]').count(), 40);
  assert.match(await page.locator('#notebook-confirm').textContent(), /103 fiches/);
  assert.equal(await page.locator('#notebook-confirm').isDisabled(), true);
  assert.match(await page.locator('#notebook-count').textContent(), /au plus 100 fiches/);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.locator('#notebook-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
    assert.equal(await page.locator('#notebook-close').evaluate(el => el.getBoundingClientRect().height >= 44), true);
    assert.equal(await page.locator('#notebook-confirm').evaluate(el => el.getBoundingClientRect().height >= 44), true);
  }
  await page.locator('#notebook-query').fill('aveline');
  assert.match(await page.locator('#notebook-confirm').textContent(), /103 fiches/);
  await page.locator('#notebook-clear').click();
  await page.locator('#notebook-list input').first().focus(); await page.keyboard.press('Space');
  assert.match(await page.locator('#notebook-confirm').textContent(), /1 fiche/);
  await page.keyboard.press('Escape'); await page.locator('#notebook-dialog').waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.activeElement === document.getElementById('player-notebook-export'));
});

test('Changer de fichier ou fermer un aperçu ignore les lectures précédentes encore en attente', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('carnet-lecture');
  await seed(page, f.url); const file = await makeNotebook(page), before = await state(page);
  await page.evaluate(() => {
    const original = File.prototype.text;
    File.prototype.text = async function () { if (this.name === 'retard.json') await new Promise(resolve => { window.releaseNotebook = resolve; }); return original.call(this); };
  });
  await page.locator('#player-notebook-import').click();
  await page.locator('#notebook-file').setInputFiles({ ...input({ ...file, version: 99 }), name: 'retard.json' });
  await page.waitForFunction(() => typeof window.releaseNotebook === 'function');
  await page.locator('#notebook-file').setInputFiles(input(file));
  await page.locator('#notebook-preview').waitFor(); await page.locator('#notebook-refresh:not(:disabled)').waitFor();
  await page.evaluate(() => window.releaseNotebook());
  await page.locator('#notebook-list').getByText(/Contenu identique à/).first().waitFor();
  assert.equal(await page.locator('#notebook-list > li[data-entry]').count(), 3);
  assert.doesNotMatch(await page.locator('#notebook-message').textContent(), /n’est pas un carnet/);
  await page.locator('#notebook-file').setInputFiles({ ...input(file), name: 'retard.json' });
  await page.locator('#notebook-close').click();
  await openExport(page);
  await page.evaluate(() => window.releaseNotebook());
  await page.getByRole('heading', { name: 'Emporter mes personnages', exact: true }).waitFor();
  assert.equal(await page.locator('#notebook-list input:checked').count(), 3);
  assert.deepEqual(await state(page), before);
});
