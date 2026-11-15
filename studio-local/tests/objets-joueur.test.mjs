import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

const KEY = 'entreRivesObjectSourceV1';
const ARMURE = 'OBJ-CB31-ARMURE-PERE-ORIN';
const LYRE = 'OBJ-CB38-LYRE-TAIRIN';
async function start(page, url) {
  await page.goto(url + 'espace-joueur.html#player-inventory');
  await page.locator('#player-save-status').getByText('Stockage joueur prêt', { exact: true }).waitFor();
}
async function seed(page, url) {
  await start(page, url);
  await page.evaluate(async () => {
    const { openPlayerStore } = await import('./espace-joueur-store.mjs');
    const { createFreePJ, buildFreePJ } = await import('./pj-m02.mjs');
    const { ITEM_SOURCE_KEY: key, playerObject, objectSource } = await import('./objets-joueur.mjs');
    const stats = { physique: 3, agilite: 3, esprit: 3, presence: 3 };
    const { source } = createFreePJ(buildFreePJ({ level: 5, startingStats: stats, stats, masteries: { magie: 2 } }),
      { id: 'pj-aveline', name: 'Aveline du catalogue', profession: 'Batelière', backstory: 'CANARI_HISTOIRE', connections: '', goal: '' });
    const old = { ...objectSource(playerObject('OBJ-CB31-ARMURE-PERE-ORIN')), sourceVersion: 'f'.repeat(40), secretFuture: 'CANARI_SOURCE_PRIVEE' };
    source.inventory = [
      { id: 'lampe', name: 'Lanterne libre', quantity: 2, category: 'outil', description: 'Une lampe personnelle.', value: 'À estimer', extensionFuture: { valeur: 'CANARI_OBJET' } },
      { id: 'armure', name: 'Mon armure de table', quantity: 1, category: 'armure', description: 'Mes ajustements.', equipped: true, [key]: old },
      { id: 'absent', name: 'Objet de référence absente', quantity: 1, [key]: { ...old, id: 'OBJ-ABSENT', name: '<img src=x onerror=alert(1)>', url: 'javascript:alert(1)', path: 'content/mj/secret.md' } },
      { id: 'futur', name: 'Objet de référence future', quantity: 1, [key]: { version: 2, contenu: ['DONNEE_FUTURE'], href: 'javascript:alert(1)' } },
      { id: 'stable', name: 'Objet au contenu stable', quantity: 1, [key]: { ...objectSource(playerObject('OBJ-CB38-LYRE-TAIRIN')), revision: '4eb42a319fe11b2256520deddd6b69bb6e1948dd' } },
      { id: 'champs-futurs', name: 'Objet aux champs futurs', category: { future: 'outil' }, quantity: { future: 3 }, description: { future: 'Description conservée' }, equipped: { future: true } },
      { opaque: 'ENTREE_OPAQUE_CONSERVEE' },
    ];
    source.extensionFuture = 'CANARI_PJ';
    await (await openPlayerStore()).save({ id: 'personnage-local', sheet: source, notes: 'CANARI_NOTES',
      grimoire: [{ id: 'demo-lueur-guide', name: 'Lueur', version: 'ancienne-source', notes: 'CANARI_GRIMOIRE', session: true }] });
  });
  await page.reload();
  await page.locator('#player-save-status').getByText('Stockage joueur prêt', { exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Aveline du catalogue', exact: true }).waitFor();
}
async function record(page) { return page.evaluate(async () => (await (await (await import('./espace-joueur-store.mjs')).openPlayerStore()).list())[0]); }
async function openCatalogue(page) { await page.locator('#player-item-catalogue-open').click(); await page.locator('#object-catalogue-dialog').waitFor(); }
async function choose(page, query) {
  await page.locator('#object-catalogue-query').fill(query);
  await page.locator('#object-catalogue-query').press('Enter');
  await page.locator('#object-catalogue-detail').waitFor();
}
async function use(page) { await page.locator('#object-catalogue-use').click(); await page.locator('#object-catalogue-dialog').waitFor({ state: 'hidden' }); }
async function edit(page, name) { await page.getByRole('button', { name: 'Modifier ' + name, exact: true }).click(); }
async function saveItem(page) {
  await page.locator('#player-item-dialog').getByRole('button', { name: 'Enregistrer l’objet', exact: true }).click();
  await page.locator('#player-item-dialog').waitFor({ state: 'hidden' });
}
async function download(page, id) {
  await page.getByRole('tab', { name: 'Sauvegarde', exact: true }).click();
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator('#' + id).click()]);
  return JSON.parse(await readFile(await file.path(), 'utf8'));
}
const input = value => ({ name: 'fiche-fictive.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });

test('Le catalogue cherche les objets publics, ouvre leur source épinglée et copie un raccourci Markdown sans écrire', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('objets-consultation');
  await seed(page, f.url); const before = await record(page);
  await openCatalogue(page);
  assert.equal(await page.locator('#object-catalogue-list > li').count(), 3);
  await page.locator('#object-catalogue-category').selectOption('bijou');
  assert.equal(await page.locator('#object-catalogue-list > li').count(), 1);
  await page.locator('#object-catalogue-category').selectOption('');
  await choose(page, 'lyre tairin');
  assert.match(await page.locator('#object-catalogue-source').getAttribute('href'), /github\.com\/Sijiel44\/archives-alrick\/blob\/[a-f0-9]{40}\/content\/objets\/OBJ-CB38-LYRE-TAIRIN\.md$/);
  assert.match(await page.locator('#object-catalogue-status').textContent(), /Fait joué dans la source/);
  await page.locator('#object-catalogue-detail summary').click();
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.markdownCopied = value; } } }));
  await page.locator('#object-catalogue-copy').click();
  assert.match(await page.evaluate(() => window.markdownCopied), /^\[\[OBJ-CB38-LYRE-TAIRIN\|Lyre/);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Refus de recette'); } } }));
  await page.locator('#object-catalogue-copy').click();
  assert.equal(await page.locator('#object-catalogue-shortcut').evaluate(el => el.selectionEnd - el.selectionStart === el.value.length), true);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement === document.getElementById('player-item-catalogue-open'));
  assert.deepEqual(await record(page), before);
});

test('Préparer une adaptation reste un brouillon de formulaire jusqu’à l’ajout explicite et conserve les règles du PJ', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('objets-adaptation');
  await seed(page, f.url); const before = await record(page);
  await page.locator('#item-name').fill('Mon idée en cours');
  await openCatalogue(page); await choose(page, 'lyre');
  page.once('dialog', dialog => dialog.dismiss()); await page.locator('#object-catalogue-use').click();
  assert.equal(await page.locator('#item-name').inputValue(), 'Mon idée en cours');
  assert.equal(await page.locator('#object-catalogue-dialog').isVisible(), true);
  page.once('dialog', dialog => dialog.accept()); await use(page);
  assert.match(await page.locator('#item-name').inputValue(), /^Adaptation · /);
  await page.waitForFunction(() => document.activeElement === document.getElementById('item-name'));
  assert.deepEqual(await record(page), before);
  await page.locator('#item-name').fill('Ma lyre de voyage'); await page.locator('#item-count').fill('3');
  await page.locator('#item-equipped').check(); await page.locator('#player-item-form button[type=submit]').click();
  await page.getByText('Ma lyre de voyage × 3', { exact: true }).waitFor();
  const after = await record(page), item = after.sheet.inventory[0];
  assert.equal(item[KEY].id, LYRE); assert.equal(item[KEY].version, 1); assert.equal(item.equipped, true);
  assert.deepEqual(after.sheet.inventory.slice(1), before.sheet.inventory);
  for (const key of Object.keys(before.sheet).filter(key => key !== 'inventory')) assert.deepEqual(after.sheet[key], before.sheet[key]);
  assert.equal(after.notes, before.notes); assert.deepEqual(after.grimoire, before.grimoire);
  assert.equal(await page.locator('#item-source-panel').isVisible(), false);
});

test('Relier, actualiser et détacher une référence conserve les champs et extensions de l’objet', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('objets-references');
  await seed(page, f.url); const before = await record(page);
  await edit(page, 'Lanterne libre'); await page.locator('#edit-item-quantity').fill('4');
  await page.locator('#edit-item-source-change').click(); await choose(page, 'bijoux'); await use(page);
  assert.equal(await page.locator('#edit-item-quantity').inputValue(), '4');
  assert.equal(await page.locator('#edit-item-name').inputValue(), 'Lanterne libre');
  assert.deepEqual(await record(page), before);
  await saveItem(page);
  const linked = (await record(page)).sheet.inventory[0]; assert.equal(linked.quantity, 4); assert.deepEqual(linked.extensionFuture, before.sheet.inventory[0].extensionFuture);
  assert.equal(linked[KEY].id, 'OBJ-CB38-BIJOU-COMMUNICATION');
  const { [KEY]: linkedSource, ...linkedFields } = linked;
  assert.deepEqual(linkedFields, { ...before.sheet.inventory[0], quantity: 4 });
  await edit(page, 'Mon armure de table');
  await page.locator('#edit-item-source-state').getByText(/Le catalogue a changé/).waitFor();
  await page.locator('#edit-item-source-update').click(); await saveItem(page);
  const updated = (await record(page)).sheet.inventory.find(item => item.id === 'armure');
  assert.equal(updated[KEY].id, ARMURE);
  assert.equal(updated[KEY].secretFuture, 'CANARI_SOURCE_PRIVEE'); assert.notEqual(updated[KEY].sourceVersion, 'f'.repeat(40));
  const { [KEY]: ignored, ...fields } = updated;
  const { [KEY]: old, ...original } = before.sheet.inventory[1]; assert.deepEqual(fields, original);
  await edit(page, 'Mon armure de table');
  page.once('dialog', dialog => dialog.accept()); await page.locator('#edit-item-source-clear').click();
  assert.ok((await record(page)).sheet.inventory.find(item => item.id === 'armure')[KEY]);
  await saveItem(page);
  assert.deepEqual((await record(page)).sheet.inventory.find(item => item.id === 'armure'), fields);
});

test('Les références absentes ou futures restent conservées et une archive peut consulter sans modifier', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('objets-archives');
  await seed(page, f.url); const before = await record(page);
  await edit(page, 'Objet au contenu stable');
  assert.equal(await page.locator('#edit-item-source-update').isVisible(), false);
  assert.match(await page.locator('#edit-item-source-link').getAttribute('href'), /\/4eb42a3/);
  await page.locator('#player-item-dialog [data-close]').click();
  await edit(page, 'Objet de référence absente');
  await page.locator('#edit-item-source-state').getByText(/Absente du catalogue/).waitFor();
  assert.equal(await page.locator('#edit-item-source-info img').count(), 0);
  assert.equal(await page.locator('#edit-item-source-link').getAttribute('href'), null);
  await page.locator('#player-item-dialog [data-close]').click();
  await edit(page, 'Objet de référence future');
  assert.equal(await page.locator('#edit-item-source-change').isDisabled(), true);
  assert.equal(await page.locator('#edit-item-source-clear').isDisabled(), true);
  await page.locator('#edit-item-quantity').fill('2'); await saveItem(page);
  assert.deepEqual((await record(page)).sheet.inventory.find(item => item.id === 'futur')[KEY], before.sheet.inventory[3][KEY]);
  await edit(page, 'Objet aux champs futurs');
  await page.locator('#edit-item-source-change').click(); await choose(page, 'lyre'); await use(page); await saveItem(page);
  const { [KEY]: futureSource, ...futureFields } = (await record(page)).sheet.inventory.find(item => item.id === 'champs-futurs');
  assert.equal(futureSource.id, LYRE);
  assert.deepEqual(futureFields, before.sheet.inventory.find(item => item.id === 'champs-futurs'));
  await page.locator('#player-filing-toggle').click(); await page.locator('#player-filing-state').getByText(/Archive personnelle/).waitFor();
  await openCatalogue(page); await choose(page, 'armure');
  assert.equal(await page.locator('#object-catalogue-use').isVisible(), false);
  await page.locator('#object-catalogue-close').click();
  await edit(page, 'Mon armure de table');
  assert.equal(await page.locator('#edit-item-source-update').isDisabled(), true);
  assert.equal(await page.locator('#edit-item-source-clear').isDisabled(), true);
  assert.equal(await page.locator('a[href^="javascript:"]').count(), 0);
});

test('Les sauvegardes gardent la provenance privée tandis que les échanges la sélectionnent hors du profil partagé', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('objets-sauvegardes');
  await seed(page, f.url); const before = await record(page);
  const backup = await download(page, 'player-backup'); assert.equal(backup.version, 4);
  assert.deepEqual(backup.payload.sheet.inventory, before.sheet.inventory);
  for (const id of ['player-exchange', 'player-send']) {
    const file = await download(page, id); assert.doesNotMatch(JSON.stringify(file), /entreRivesObjectSourceV1|CANARI_SOURCE_PRIVEE|CANARI_NOTES|CANARI_GRIMOIRE/);
  }
  const privateRoundTrip = await page.evaluate(async source => {
    const { makeExchange, readExchange, receivedSheet } = await import('./echanges-pj.mjs');
    const exchange = await readExchange(JSON.stringify(await makeExchange(source, 'mj'))); return receivedSheet(exchange, source).inventory;
  }, before.sheet);
  assert.deepEqual(privateRoundTrip[1][KEY], before.sheet.inventory[1][KEY]);
  const { page: restored } = await f.open('objets-restaures'); await start(restored, f.url);
  await restored.locator('#player-import').click(); await restored.locator('#player-file').setInputFiles(input(backup));
  await restored.locator('#confirm-player-import').click(); await restored.locator('#player-import-dialog').waitFor({ state: 'hidden' });
  assert.deepEqual((await record(restored)).sheet.inventory, before.sheet.inventory);
  const notebook = await page.evaluate(async () => (await import('./carnet-joueur.mjs')).playerNotebook(await (await (await import('./espace-joueur-store.mjs')).openPlayerStore()).list()));
  const { page: collection } = await f.open('objets-carnet'); await start(collection, f.url);
  await collection.locator('#player-notebook-import').click(); await collection.locator('#notebook-file').setInputFiles(input(notebook));
  await collection.locator('#notebook-confirm:not(:disabled)').waitFor(); await collection.locator('#notebook-confirm').click(); await collection.locator('#notebook-dialog').waitFor({ state: 'hidden' });
  assert.deepEqual((await record(collection)).sheet.inventory, before.sheet.inventory);
});

test('Une écriture interrompue garde la référence et les champs à confirmer pour un réessai', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('objets-interruption');
  await seed(page, f.url); const before = await record(page);
  await edit(page, 'Lanterne libre'); await page.locator('#edit-item-source-change').click(); await choose(page, 'lyre'); await use(page);
  await page.locator('#edit-item-quantity').fill('6');
  await page.evaluate(() => { const original = IDBObjectStore.prototype.put; IDBObjectStore.prototype.put = function (...args) { const result = original.apply(this, args); if (this.name === 'personnages') { this.transaction.abort(); IDBObjectStore.prototype.put = original; } return result; }; });
  await page.locator('#player-item-dialog button[type=submit]').click();
  await page.locator('#player-item-dialog [data-save-message]').getByText(/interrompu/).waitFor();
  assert.deepEqual(await record(page), before); assert.equal(await page.locator('#edit-item-quantity').inputValue(), '6');
  assert.match(await page.locator('#edit-item-source-info').textContent(), /LYRE-TAIRIN/);
  await saveItem(page); assert.equal((await record(page)).sheet.inventory[0][KEY].id, LYRE);
});

test('Un autre onglet qui modifie ou archive la fiche bloque un rattachement périmé', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('objets-concurrence');
  await seed(page, f.url); await edit(page, 'Lanterne libre');
  await page.locator('#edit-item-source-change').click(); await choose(page, 'lyre'); await use(page);
  const other = await context.newPage(); await start(other, f.url);
  await other.locator('#player-filing-toggle').click(); await other.locator('#player-filing-state').getByText(/Archive personnelle/).waitFor();
  const before = await record(other);
  await page.locator('#player-item-dialog button[type=submit]').click();
  await page.locator('#player-item-dialog [data-save-message]').getByText(/autre onglet|archivée/).waitFor();
  assert.deepEqual(await record(page), before); assert.equal(await page.locator('#player-item-dialog').isVisible(), true);
  assert.match(await page.locator('#edit-item-source-info').textContent(), /LYRE-TAIRIN/);
});

test('Les fiches reliées, le clavier et les commandes gardent un rendu lisible aux petites largeurs', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('objets-mobile', { reducedMotion: 'reduce' });
  await seed(page, f.url); await openCatalogue(page); await choose(page, 'armure');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.locator('#object-catalogue-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
    for (const id of ['object-catalogue-close', 'object-catalogue-use']) assert.equal(await page.locator('#' + id).evaluate(el => el.getBoundingClientRect().height >= 44), true);
    await page.locator('#object-catalogue-detail-title').focus(); await page.keyboard.press('Tab');
    assert.equal(await page.locator('#object-catalogue-source').evaluate(el => {
      const box = el.getBoundingClientRect(), dialog = el.closest('dialog');
      return document.activeElement === el && box.bottom <= dialog.querySelector('footer').getBoundingClientRect().top + 1 && box.top >= dialog.querySelector('header').getBoundingClientRect().bottom - 1;
    }), true, 'Source accessible au clavier sans être masquée à ' + width);
  }
  await use(page); await page.locator('#player-item-form button[type=submit]').click();
  await page.locator('#player-save-status').getByText('Sauvegarde locale confirmée', { exact: true }).waitFor();
  const item = (await record(page)).sheet.inventory[0];
  assert.equal(await page.getByRole('button', { name: 'Consulter la référence de ' + item.name, exact: true }).evaluate(el => el.getBoundingClientRect().height >= 44), true);
  await page.getByRole('button', { name: 'Consulter la référence de ' + item.name, exact: true }).click();
  await page.locator('#object-catalogue-detail-title').getByText(/Armure de Harald/).waitFor();
  await page.keyboard.press('Escape'); await page.locator('#object-catalogue-dialog').waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.activeElement?.classList.contains('item-reference-link'));
  await edit(page, item.name);
  assert.equal(await page.locator('#player-item-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
});
