import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

async function download(page, id) {
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator(`#${id}`).click()]);
  return readFile(await file.path());
}

test('Le joueur crée et restaure son personnage indépendamment de la campagne MJ', { timeout: 45000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('espace-joueur', { viewport: { width: 390, height: 844 } });
  await page.goto(fixture.url + 'accueil#joueurs-personnage');
  await page.locator('#joueurs-personnage').getByRole('link', { name: /Donnez-lui une raison de partir/ }).click();
  await page.getByRole('dialog', { name: 'Créer mon personnage' }).waitFor();
  await page.locator('#new-player-name').fill('Nérée');
  await page.locator('#creation-portrait-file').setInputFiles({ name: 'portrait-fictif.webp', mimeType: 'image/webp',
    buffer: await readFile(new URL('../media/heron-des-lanternes.webp', import.meta.url)) });
  await page.locator('#creation-portrait').getByText(/Portrait prêt/).waitFor();
  await page.getByText('Histoire et liens · facultatif', { exact: true }).click();
  await page.locator('#new-player-backstory').fill('CANARI_HISTOIRE_JOUEUR');
  await page.locator('#new-player-mentor').fill('Mentor de recette');
  await page.locator('#new-player-training').fill('Entraînement descriptif de navigation.');
  for (const select of await page.locator('#origin-fields select').all()) await select.selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Vérifier la fiche' }).click();
  await page.locator('#confirm-player-create').click();
  await page.getByRole('heading', { name: 'Nérée' }).waitFor();
  assert.equal(await page.locator('#player-portrait').evaluate(async image => { await image.decode(); return image.naturalWidth <= 320; }), true);
  await page.locator('#player-resources').getByText(/Niveau 5/).waitFor();
  await page.getByText('Ajuster mes PV et mon mana', { exact: true }).click();
  await page.locator('#player-pv').fill('1');
  await page.getByRole('button', { name: 'Enregistrer mes ressources' }).press('Enter');
  await page.locator('#player-resources').getByText(/PV 1 \/ /).waitFor();
  await page.locator('#player-free-roll').click();
  await page.locator('#player-roll-result').getByText(/^Jet libre/).waitFor();
  await page.getByRole('button', { name: 'Lancer une action 5d6' }).click();
  await page.locator('#player-roll-result').getByText(/seuil 15/).waitFor();
  await page.locator('#item-name').fill('Corde');
  await page.getByRole('button', { name: 'Ajouter l’objet' }).click();
  await page.locator('#player-items').getByText('Corde × 1').waitFor();
  await page.locator('#personal-notes').fill('CANARI_PRIVE_JOUEUR');
  await page.getByRole('button', { name: 'Enregistrer mes notes' }).click();
  await page.locator('#player-save-status').getByText('Sauvegarde locale confirmée').waitFor();
  const backup = await download(page, 'player-backup');
  const exchange = await download(page, 'player-exchange');
  assert.match(backup.toString(), /CANARI_PRIVE_JOUEUR/);
  assert.match(backup.toString(), /CANARI_HISTOIRE_JOUEUR/);
  assert.equal(JSON.parse(backup).payload.sheet.mentor, 'Mentor de recette');
  assert.equal(JSON.parse(backup).payload.sheet.training, 'Entraînement descriptif de navigation.');
  assert.doesNotMatch(exchange.toString(), /CANARI_PRIVE_JOUEUR|CANARI_HISTOIRE_JOUEUR/);
  assert.equal(JSON.parse(exchange).schema, 'alrick.sheets.v3');
  const portrait = JSON.parse(backup).payload.sheet.portrait;
  assert.match(portrait, /^data:image\/jpeg;base64,/);
  assert.equal(JSON.parse(exchange).sheets[0].portrait, portrait);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

  const { page: restored } = await fixture.open('espace-restaure');
  await restored.goto(fixture.url + 'espace-joueur.html');
  await restored.locator('#player-import').click();
  const file = { name: 'personnage.json', mimeType: 'application/json' };
  const future = { ...JSON.parse(backup), version: 2 };
  await restored.locator('#player-file').setInputFiles({ ...file, buffer: Buffer.from(JSON.stringify(future)) });
  await restored.locator('#player-import-preview').getByText(/version de sauvegarde joueur est inconnue/).waitFor();
  assert.equal(await restored.locator('#confirm-player-import').isDisabled(), true);
  const altered = JSON.parse(backup);
  altered.payload.notes = 'Fichier modifié';
  await restored.locator('#player-file').setInputFiles({ ...file, buffer: Buffer.from(JSON.stringify(altered)) });
  await restored.locator('#player-import-preview').getByText(/altérée/).waitFor();
  await restored.locator('#player-file').setInputFiles({ ...file, buffer: backup });
  await restored.locator('#confirm-player-import').click();
  await restored.getByRole('heading', { name: 'Nérée' }).waitFor();
  assert.equal(await restored.locator('#player-portrait').getAttribute('src'), portrait);
  await restored.getByText('Histoire et liens', { exact: true }).click();
  await restored.getByText('Mentor de recette', { exact: true }).waitFor();
  assert.equal(await restored.locator('#personal-notes').inputValue(), 'CANARI_PRIVE_JOUEUR');
  await restored.locator('#player-items').getByText('Corde × 1').waitFor();
  await restored.locator('#player-resources').getByText(/PV 1 \/ /).waitFor();

  await restored.goto(fixture.url);
  await restored.locator('#campaign-name').fill('Table fictive');
  await restored.locator('#create-campaign-submit').click();
  await restored.locator('#import-pj').click();
  await restored.locator('#pj-import-file').setInputFiles({ ...file, buffer: exchange });
  await restored.locator('#pj-import-submit').click();
  await restored.locator('#character-list').getByText('Nérée').waitFor();
  await restored.locator('#add-scene').click();
  await restored.locator('#scene-title').fill('Scène fictive');
  await restored.locator('#scene-private-notes').fill('CANARI_MJ_JOUEUR');
  await restored.locator('#scene-form button[type=submit]').click();
  await restored.locator('#scene-dialog').waitFor({ state: 'hidden' });
  await restored.goto(fixture.url + 'espace-joueur.html');
  await restored.getByRole('heading', { name: 'Nérée' }).waitFor();
  assert.doesNotMatch((await download(restored, 'player-backup')).toString(), /CANARI_MJ_JOUEUR|Scène fictive|Table fictive/);
});

test('Les coûts de création sont visibles et les portraits par lien restent modifiables', { timeout: 45000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('joueur-budget', { reducedMotion: 'reduce' });
  const image = await readFile(new URL('../media/heron-des-lanternes.webp', import.meta.url));
  await page.route('https://portraits.example/portrait.webp', route => route.fulfill({ contentType: 'image/webp', body: image }));
  await page.goto(fixture.url + 'espace-joueur.html?creer=1');
  await page.getByRole('dialog', { name: 'Créer mon personnage' }).waitFor();
  await page.locator('#new-player-mode').selectOption('free');
  await page.locator('#new-player-name').fill('Astrée');
  await page.locator('#new-player-level').fill('5');
  await page.locator('#creation-spent-count').getByText('0 / 24', { exact: true }).waitFor();
  await page.locator('#final-physique').fill('8');
  await page.locator('#creation-remaining-count').getByText('19', { exact: true }).waitFor();
  await page.getByText('Choisir les maîtrises', { exact: true }).click();
  await page.locator('#mastery-magie').fill('2');
  await page.locator('#custom-mastery-name').fill('Magie du feu');
  await page.locator('#add-custom-mastery').click();
  await page.locator('#custom-masteries input').fill('2');
  await page.locator('#creation-spent-count').getByText('9 / 24', { exact: true }).waitFor();
  await page.locator('#creation-remaining-count').getByText('15', { exact: true }).waitFor();
  await page.locator('#new-player-level').fill('1');
  await page.locator('#creation-budget-issues').getByText(/Dépassement du budget/).waitFor();
  await page.getByRole('button', { name: 'Vérifier la fiche' }).click();
  assert.equal(await page.locator('#confirm-player-create').isDisabled(), true);
  await page.locator('#new-player-level').fill('5');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.locator('#player-create-dialog').evaluate(dialog => dialog.scrollWidth <= dialog.clientWidth), true, `création ${width}px`);
  }
  await page.getByRole('button', { name: 'Vérifier la fiche' }).click();
  await page.locator('#confirm-player-create').click();
  await page.getByRole('heading', { name: 'Astrée', exact: true }).waitFor();
  await page.locator('#player-mastery-line').getByText(/Magie du feu 2/).waitFor();
  await page.locator('#player-free-roll').click();
  assert.equal(await page.locator('#player-dice .die').count(), 5);
  assert.equal(await page.locator('#player-dice .die').first().evaluate(die => getComputedStyle(die).animationName), 'none');

  await page.locator('#player-edit-portrait').click();
  const dialog = page.locator('#player-portrait-dialog');
  await page.locator('#sheet-portrait-file').setInputFiles({ name: 'refuse.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await dialog.getByText(/JPG, PNG ou WebP de 3 Mio maximum/).waitFor();
  await page.locator('#sheet-portrait-url').fill('http://portraits.example/portrait.webp');
  await dialog.getByRole('button', { name: 'Utiliser le lien' }).click();
  await dialog.getByText(/Saisis un lien HTTPS direct/).waitFor();
  await page.locator('#sheet-portrait-url').fill('https://portraits.example/portrait.webp');
  await dialog.getByRole('button', { name: 'Utiliser le lien' }).click();
  await dialog.locator('[data-portrait-preview]').evaluate(image => image.decode());
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      if (this.name === 'personnages') {
        IDBObjectStore.prototype.put = original;
        this.transaction.abort();
        return;
      }
      return original.apply(this, args);
    };
  });
  await dialog.getByRole('button', { name: 'Enregistrer le portrait' }).click();
  await dialog.locator('[data-save-message]').getByText(/Enregistrement interrompu/).waitFor();
  assert.equal(await dialog.isVisible(), true);
  await dialog.getByRole('button', { name: 'Enregistrer le portrait' }).click();
  await dialog.waitFor({ state: 'hidden' });
  await page.locator('#player-portrait').waitFor();
  await page.locator('#player-portrait').evaluate(image => image.decode());
  const exchange = JSON.parse(await download(page, 'player-exchange'));
  assert.equal(exchange.sheets[0].portrait, 'https://portraits.example/portrait.webp');
  assert.equal(exchange.sheets[0].masteries['Magie du feu'], 2);
  await page.locator('#player-edit-portrait').click();
  await dialog.getByRole('button', { name: 'Retirer le portrait' }).click();
  await dialog.getByRole('button', { name: 'Enregistrer le portrait' }).click();
  await dialog.waitFor({ state: 'hidden' });
  await page.locator('#player-portrait-placeholder').waitFor();
  assert.equal(await page.locator('#player-portrait').isHidden(), true);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
});

test('La création libre suit M02 aux niveaux repères et signale un conflit entre onglets', { timeout: 45000 }, async t => {
  const fixture = await browserFixture(t);
  const { context, page } = await fixture.open('espace-libre');
  await page.goto(fixture.url + 'espace-joueur.html');
  for (const level of [1, 5, 10, 15, 20, 25]) {
    await page.locator('#player-create').click();
    await page.locator('#new-player-mode').selectOption('free');
    await page.locator('#new-player-name').fill(`Libre ${level}`);
    await page.locator('#new-player-level').fill(String(level));
    await page.getByRole('button', { name: 'Vérifier la fiche' }).press('Enter');
    await page.locator('#player-create-result').getByText(/Fiche M02 vérifiée/).waitFor();
    await page.locator('#confirm-player-create').press('Enter');
    await page.locator('#player-resources').getByText(new RegExp(`Niveau ${level} ·`)).waitFor();
  }

  const second = await context.newPage();
  await second.goto(page.url());
  await second.getByRole('heading', { name: 'Libre 25' }).waitFor();
  await page.locator('#personal-notes').fill('Note confirmée');
  await page.getByRole('button', { name: 'Enregistrer mes notes' }).click();
  await page.locator('#player-save-status').getByText('Sauvegarde locale confirmée').waitFor();
  await second.locator('#personal-notes').fill('Note divergente');
  await second.getByRole('button', { name: 'Enregistrer mes notes' }).click();
  await second.getByRole('alert').getByText(/autre onglet/).waitFor();
  assert.equal(await second.locator('#personal-notes').inputValue(), 'Note divergente');
  const recovery = JSON.parse(await download(second, 'player-backup'));
  assert.equal(recovery.payload.notes, 'Note divergente');
  await page.reload();
  await page.getByRole('heading', { name: 'Libre 25' }).waitFor();
  assert.equal(await page.locator('#personal-notes').inputValue(), 'Note confirmée');
});

test('Les extensions personnelles restent dans la sauvegarde et un enregistrement interrompu conserve la fiche', { timeout: 45000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('espace-integrite');
  await page.goto(fixture.url + 'espace-joueur.html');
  const result = await page.evaluate(async () => {
    const { buildFreePJ, createFreePJ } = await import('./pj-m02.mjs');
    const { openPlayerStore, playerBackup, playerExchange, readPlayerFile } = await import('./espace-joueur-store.mjs');
    const { source } = createFreePJ(buildFreePJ({
      level: 10, startingStats: { physique: 3, agilite: 3, esprit: 3, presence: 3 },
      stats: { physique: 3, agilite: 3, esprit: 3, presence: 3 }, masteries: {},
    }), { id: 'pj-fictif', name: 'PJ de recette', profession: '', backstory: '', connections: '', goal: '' });
    source.extensionFuture = { valeur: 'EXTENSION_PERSONNELLE' };
    source.development.abilities.push({
      id: 'aptitude-fictive', name: 'Aptitude de recette', description: 'Une description fictive.', domain: 'Survie',
      kind: 'aptitude', levelRequired: 3, effect: 'Effet descriptif à arbitrer.', limitations: 'Recette uniquement.',
      provenance: 'Recette fictive', approvedByGM: false, status: 'defined', rank: 1,
      extensionFuture: { valeur: 'EXTENSION_CAPACITE' },
    });
    source.inventory = [{ name: 'Objet de recette', quantity: 1, extensionFuture: 'EXTENSION_OBJET' }];
    const store = await openPlayerStore();
    const first = await store.save({ sheet: source, notes: 'Note de recette' });
    const backup = await playerBackup(first);
    const restored = await readPlayerFile(JSON.stringify(backup));
    const exchange = playerExchange(source);
    const accepted = await readPlayerFile(JSON.stringify(exchange));
    const original = IDBObjectStore.prototype.put;
    let rejected = false;
    try {
      IDBObjectStore.prototype.put = function (...args) {
        if (this.name === 'personnages') {
          this.transaction.abort();
          return;
        }
        return original.apply(this, args);
      };
      try { await store.save({ ...first, notes: 'Note interrompue' }); }
      catch { rejected = true; }
    } finally { IDBObjectStore.prototype.put = original; }
    return { rejected, durable: await store.list(), restored, backup: JSON.stringify(backup),
      exchange: JSON.stringify(exchange), accepted: accepted.records.length };
  });
  assert.equal(result.rejected, true);
  assert.equal(result.durable[0].revision, 1);
  assert.equal(result.durable[0].notes, 'Note de recette');
  assert.equal(result.restored.records[0].sheet.extensionFuture.valeur, 'EXTENSION_PERSONNELLE');
  assert.doesNotMatch(result.exchange, /EXTENSION_PERSONNELLE|EXTENSION_CAPACITE|EXTENSION_OBJET|Note de recette/);
  assert.equal(result.accepted, 1);
  await page.locator('#player-import').click();
  await page.locator('#player-file').setInputFiles({ name: 'fiche-fictive.json', mimeType: 'application/json', buffer: Buffer.from(result.backup) });
  await page.locator('#confirm-player-import').click();
  await page.getByText('Aptitude de recette · Survie', { exact: true }).click();
  await page.getByText('Effet descriptif à arbitrer.', { exact: true }).waitFor();
});
