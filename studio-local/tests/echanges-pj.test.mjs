import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

const file = text => ({ name: 'echange-fictif.json', mimeType: 'application/json', buffer: Buffer.from(typeof text === 'string' ? text : JSON.stringify(text)) });
async function download(page, selector) {
  const [result] = await Promise.all([page.waitForEvent('download'), page.locator(selector).click()]);
  return JSON.parse(await readFile(await result.path(), 'utf8'));
}
async function seedPlayer(page, url) {
  await page.goto(url + 'espace-joueur.html');
  await page.locator('#player-save-status').getByText('Stockage joueur prêt').waitFor();
  const backup = await page.evaluate(async () => {
    const { buildFreePJ, createFreePJ } = await import('./pj-m02.mjs');
    const { playerBackup } = await import('./espace-joueur-store.mjs');
    const base = { physique: 3, agilite: 3, esprit: 3, presence: 3 };
    const { source } = createFreePJ(buildFreePJ({ level: 5, startingStats: base, stats: base, masteries: {} }),
      { id: 'pj-echange-fictif', name: 'Aveline', profession: 'Batelière', backstory: 'CANARI_HISTOIRE', connections: '', goal: '' });
    source.extensionFuture = 'CANARI_EXTENSION';
    source.inventory = [{ id: 'lanterne', name: 'Lanterne', category: 'outil', quantity: 1, extensionFuture: 'CANARI_OBJET' }, { opaque: 'CANARI_OPAQUE' }];
    return playerBackup({ sheet: source, notes: 'CANARI_JOUEUR', rolls: [{ id: 'jet-prive', createdAt: new Date().toISOString(), kind: 'free', label: 'CANARI_JET', summary: 'Jet libre', dice: [1, 2, 3, 4, 5] }] });
  });
  await page.locator('#player-import').click();
  await page.locator('#player-file').setInputFiles(file(backup));
  await page.locator('#confirm-player-import').click();
  await page.getByRole('heading', { name: 'Aveline', exact: true }).waitFor();
}
async function playerPacket(page) {
  await page.getByRole('tab', { name: 'Sauvegarde', exact: true }).click();
  return download(page, '#player-send');
}
async function gmImport(page, packet) {
  await page.locator('#import-pj').click();
  await page.locator('#pj-import-file').setInputFiles(file(packet));
  await page.locator('#pj-compare-preview .notice').waitFor();
  assert.equal(await page.locator('#pj-import-submit').isDisabled(), true);
  await page.locator('#pj-exchange-accept').check();
  await page.locator('#pj-import-submit').click();
  await page.locator('#pj-import-dialog').waitFor({ state: 'hidden' });
}

test('L’échange joueur / MJ compare les versions et conserve les copies, les notes et les scènes', { timeout: 65000 }, async t => {
  const fixture = await browserFixture(t);
  const { page: player } = await fixture.open('echange-joueur', { reducedMotion: 'reduce' });
  const { page: gm } = await fixture.open('echange-mj');
  await seedPlayer(player, fixture.url);
  const sent = await playerPacket(player);
  assert.equal(sent.format, 'chroniques-entre-rives.echange-pj');
  assert.doesNotMatch(JSON.stringify(sent), /CANARI_/);
  await gm.goto(fixture.url);
  await gm.locator('#campaign-name').fill('CANARI_CAMPAGNE');
  await gm.locator('#create-campaign-submit').click();
  await gmImport(gm, sent);
  await gm.getByRole('button', { name: 'Modifier Aveline', exact: true }).click();
  await gm.locator('#character-name').fill('Aveline des Rives');
  await gm.locator('#character-notes').fill('CANARI_MJ');
  await gm.getByRole('button', { name: 'Enregistrer le PJ', exact: true }).click();
  await gm.locator('#character-dialog').waitFor({ state: 'hidden' });
  await gm.locator('#add-scene').click();
  await gm.locator('#scene-title').fill('CANARI_SCENE');
  await gm.locator('#scene-private-notes').fill('CANARI_SECRET');
  await gm.locator('#scene-participants input').first().check();
  await gm.locator('#scene-form button[type=submit]').click();
  await gm.locator('#scene-dialog').waitFor({ state: 'hidden' });
  await gm.getByRole('button', { name: 'Modifier Aveline des Rives', exact: true }).click();
  await gm.locator('#character-export-player').click();
  await gm.locator('#pj-export-status').getByText(/Copie prête/).waitFor();
  assert.doesNotMatch(await gm.locator('#pj-export-preview').textContent(), /CANARI_/);
  const returned = await download(gm, '#pj-export-download');
  assert.equal(returned.payload.base, sent.payload.revision);
  assert.doesNotMatch(JSON.stringify(returned), /CANARI_/);
  await gm.locator('#pj-export-close').click();
  await gm.locator('#character-dialog .cancel-edit').click();

  await player.getByRole('tab', { name: 'Fiche', exact: true }).click();
  await player.getByText('Ajuster mes PV et mon mana', { exact: true }).click();
  await player.locator('#player-pv').fill('20');
  await player.getByRole('button', { name: 'Enregistrer mes ressources' }).click();
  await player.locator('#player-resources').getByText(/PV 20 \/ 36/).waitFor();
  await player.locator('#player-import').click();
  await player.locator('#player-file').setInputFiles(file(returned));
  await player.locator('#player-compare-preview').getByText(/Versions divergentes/).waitFor();
  await player.locator('#player-compare-preview').getByText('20 / 36', { exact: true }).waitFor();
  for (const width of [1440, 768, 390, 320]) {
    await player.setViewportSize({ width, height: 900 });
    assert.equal(await player.locator('#player-import-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true, `comparaison ${width}px`);
  }
  assert.equal(await player.locator('#confirm-player-import').isDisabled(), true);
  await player.locator('#player-exchange-accept').check();
  await player.locator('#confirm-player-import').press('Enter');
  await player.getByRole('heading', { name: 'Aveline des Rives', exact: true }).waitFor();
  assert.equal(await player.locator('#player-selection option').count(), 2);
  await player.locator('#player-resources').getByText(/PV 36 \/ 36/).waitFor();
  const next = await playerPacket(player);
  assert.equal(next.payload.base, returned.payload.revision);
  await player.getByRole('tab', { name: 'Inventaire', exact: true }).click();
  await player.locator('#item-name').fill('Corde');
  await player.getByRole('button', { name: 'Ajouter l’objet', exact: true }).click();
  await player.getByText('Corde × 1', { exact: true }).waitFor();
  const second = await playerPacket(player);
  await gm.locator('#import-pj').click();
  await gm.locator('#pj-import-file').setInputFiles(file(second));
  await gm.locator('#pj-compare-preview').getByText('La fiche reçue part de cette version locale.', { exact: true }).waitFor();
  await gm.locator('#pj-exchange-accept').check();
  await gm.locator('#pj-import-submit').click();
  await gm.locator('#pj-import-dialog').waitFor({ state: 'hidden' });
  await gm.locator('#nav-backups').click();
  const gmBackup = await download(gm, '#export-backup');
  const campaign = gmBackup.payload.campaign;
  assert.equal(campaign.characters.length, 2);
  assert.equal(campaign.characters[0].notes, 'CANARI_MJ');
  assert.equal(campaign.scenes[0].participantIds[0], campaign.characters[0].id);
  const privateBackup = await download(player, '#player-backup');
  assert.equal(privateBackup.payload.notes, 'CANARI_JOUEUR');
  assert.equal(privateBackup.payload.rolls[0].label, 'CANARI_JET');
  assert.equal(privateBackup.payload.sheet.extensionFuture, 'CANARI_EXTENSION');
  assert.equal(privateBackup.payload.sheet.inventory.find(item => item.id === 'lanterne').extensionFuture, 'CANARI_OBJET');
  assert.equal(privateBackup.payload.sheet.inventory.find(item => item.opaque).opaque, 'CANARI_OPAQUE');
  const { page: restored } = await fixture.open('echange-restaure');
  await restored.goto(fixture.url + 'espace-joueur.html');
  await restored.locator('#player-import').click();
  await restored.locator('#player-file').setInputFiles(file(privateBackup));
  await restored.locator('#confirm-player-import').click();
  await restored.getByRole('heading', { name: 'Aveline des Rives', exact: true }).waitFor();
  assert.equal((await playerPacket(restored)).payload.base, returned.payload.revision);
  const { page: restoredGM } = await fixture.open('echange-mj-restaure');
  await restoredGM.goto(fixture.url);
  await restoredGM.locator('#save-status').getByText('Stockage local prêt', { exact: true }).waitFor();
  await restoredGM.locator('#nav-backups').click();
  await restoredGM.locator('#backup-file').setInputFiles(file(gmBackup));
  await restoredGM.locator('#backup-summary').getByText(/2 fiche\(s\) PJ M02/).waitFor();
  await restoredGM.locator('#restore-backup').click();
  await restoredGM.locator('#prepare-title').waitFor();
  assert.equal(await restoredGM.getByRole('button', { name: 'Modifier Aveline des Rives', exact: true }).count(), 2);
});

test('Le MJ refuse un export périmé et un import dont la campagne a changé', { timeout: 40000 }, async t => {
  const fixture = await browserFixture(t);
  const { page: player } = await fixture.open('echange-source');
  const { page: gm } = await fixture.open('echange-perime');
  await seedPlayer(player, fixture.url);
  const packet = await playerPacket(player);
  await gm.goto(fixture.url);
  await gm.locator('#campaign-name').fill('Table de recette');
  await gm.locator('#create-campaign-submit').click();
  await gmImport(gm, packet);
  await gm.getByRole('button', { name: 'Modifier Aveline', exact: true }).click();
  await gm.locator('#character-export-player').click();
  await gm.locator('#pj-export-status').getByText(/Copie prête/).waitFor();
  const update = () => gm.evaluate(async () => {
    const { openStudioStore } = await import('./store.mjs');
    const store = await openStudioStore();
    try {
      const [campaign] = await store.list(), [character] = campaign.characters;
      await store.execute({ id: campaign.id, operationId: crypto.randomUUID(), expectedRevision: campaign.revision,
        type: 'save-character', data: { id: character.id, name: character.name, level: character.level, notes: 'CANARI_RECENT' } });
    } finally { store.close(); }
  });
  await update();
  let downloads = 0;
  gm.on('download', () => downloads++);
  await gm.locator('#pj-export-download').click();
  await gm.locator('#pj-export-status').getByText(/La campagne a changé/).waitFor();
  assert.equal(downloads, 0);
  await gm.reload();
  await gm.getByRole('button', { name: 'Ouvrir Table de recette', exact: true }).click();
  const changed = await player.evaluate(async () => {
    const { openPlayerStore } = await import('./espace-joueur-store.mjs');
    const { makeExchange } = await import('./echanges-pj.mjs');
    const [record] = await (await openPlayerStore()).list();
    return makeExchange({ ...record.sheet, name: 'Aveline version reçue' }, 'joueur');
  });
  await gm.locator('#import-pj').click();
  await gm.locator('#pj-import-file').setInputFiles(file(changed));
  await gm.locator('#pj-compare-preview').getByText(/Versions divergentes/).waitFor();
  await gm.locator('#pj-exchange-accept').check();
  await update();
  await gm.locator('#pj-import-submit').click();
  await gm.locator('#pj-import-form .form-error').getByText(/La campagne a changé/).waitFor();
  assert.equal(await gm.locator('#character-list').getByText('Aveline', { exact: true }).count(), 1);
  assert.equal(await gm.locator('#pj-exchange-accept').isChecked(), true);
});

test('Une comparaison périmée ou une écriture interrompue ne crée aucune copie partielle', { timeout: 45000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open('echange-conflit');
  await seedPlayer(page, fixture.url);
  const packet = await page.evaluate(async () => {
    const { openPlayerStore } = await import('./espace-joueur-store.mjs');
    const { makeExchange, EXCHANGE_KEY } = await import('./echanges-pj.mjs');
    const [record] = await (await openPlayerStore()).list();
    const sent = await makeExchange(record.sheet, 'joueur');
    return makeExchange({ ...record.sheet, pv: 17, [EXCHANGE_KEY]: { version: 1, revision: sent.payload.revision } }, 'mj');
  });
  await page.locator('#player-import').click();
  await page.locator('#player-file').setInputFiles(file(packet));
  await page.locator('#player-compare-preview').getByText(/part de cette version/).waitFor();
  const second = await context.newPage();
  await second.goto(fixture.url + 'espace-joueur.html#player-notes');
  await second.locator('#personal-notes').fill('CANARI_NOTES_RECENTES');
  await second.getByRole('button', { name: 'Enregistrer mes notes' }).click();
  await second.locator('#player-save-status').getByText('Sauvegarde locale confirmée').waitFor();
  await page.locator('#player-exchange-accept').check();
  await page.locator('#confirm-player-import').click();
  await page.locator('#player-import-preview').getByText(/fiche comparée a changé/).waitFor();
  assert.equal(await page.locator('#player-selection option').count(), 1);
  await page.locator('#player-import-dialog [data-close]').click();
  await page.reload();
  await page.locator('#player-import').click();
  await page.locator('#player-file').setInputFiles(file(packet));
  await page.locator('#player-compare-preview').getByText(/part de cette version/).waitFor();
  await page.locator('#player-exchange-accept').check();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function () { IDBObjectStore.prototype.put = original; this.transaction.abort(); };
  });
  await page.locator('#confirm-player-import').click();
  await page.locator('#player-import-preview').getByText(/Enregistrement interrompu/).waitFor();
  assert.equal(await page.locator('#player-selection option').count(), 1);
  await page.locator('#confirm-player-import').click();
  await page.locator('#player-import-dialog').waitFor({ state: 'hidden' });
  assert.equal(await page.locator('#player-selection option').count(), 2);
  assert.equal(await page.locator('#personal-notes').inputValue(), 'CANARI_NOTES_RECENTES');
  await page.locator('#player-resources').getByText(/PV 17 \/ 36/).waitFor();
});

test('Les échanges refusent les versions futures, les champs privés et les empreintes incohérentes', { timeout: 35000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('echange-contrat');
  await seedPlayer(page, fixture.url);
  const packet = await playerPacket(page);
  const results = await page.evaluate(async original => {
    const { readExchange, compareExchange, makeExchange, receivedSheet, EXCHANGE_KEY } = await import('./echanges-pj.mjs');
    const { sha256 } = await import('./store.mjs');
    const order = value => Array.isArray(value) ? value.map(order) : value && typeof value === 'object'
      ? Object.fromEntries(Object.keys(value).sort().map(key => [key, order(value[key])])) : value;
    const hash = value => sha256(JSON.stringify(order(value)));
    const refused = async value => { try { await readExchange(JSON.stringify(value)); return false; } catch { return true; } };
    const future = { ...original, version: 99 };
    const corrupted = structuredClone(original); corrupted.payload.sheet.pv = 1;
    const privateField = structuredClone(original); privateField.payload.sheet.secretMJ = 'CANARI_SECRET';
    privateField.payload.revision = await hash(privateField.payload.sheet); privateField.checksum = await hash(privateField.payload);
    const extra = { ...original, secretMJ: 'CANARI_SECRET' };
    const reordered = structuredClone(original); reordered.payload.sheet.stats = Object.fromEntries(Object.entries(reordered.payload.sheet.stats).reverse());
    const read = await readExchange(JSON.stringify(reordered));
    const identical = await compareExchange(read.sheet, read);
    let unknownTracking = false;
    try { await makeExchange({ ...read.sheet, [EXCHANGE_KEY]: { version: 99 } }, 'joueur'); } catch { unknownTracking = true; }
    const local = structuredClone(read.sheet);
    local.inventory[0].description = 'Ancienne description retirée par le fichier reçu';
    local.inventory[0].privateExtension = 'À conserver';
    const adopted = receivedSheet(read, local);
    return { refused: await Promise.all([future, corrupted, privateField, extra].map(refused)), identical: identical.identical, unknownTracking,
      removedDescription: adopted.inventory[0].description === undefined, privateExtension: adopted.inventory[0].privateExtension };
  }, packet);
  assert.deepEqual(results, { refused: [true, true, true, true], identical: true, unknownTracking: true, removedDescription: true, privateExtension: 'À conserver' });
  await page.locator('#player-import').click();
  await page.locator('#player-file').setInputFiles(file({ ...packet, version: 99 }));
  await page.locator('#player-import-preview').getByText(/version de fichier d’échange est inconnue/).waitFor();
  assert.equal(await page.locator('#confirm-player-import').isDisabled(), true);
});
