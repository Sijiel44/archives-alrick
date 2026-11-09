import assert from 'node:assert/strict';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

const name = 'Mira <svg onload=alert(1)>';
const stats = { physique: 3, agilite: 4, esprit: 3, presence: 3 };
const defenses = { physique: 0, magie: 0, mental: 0 };
const sheet = {
  id: 'CANARI_ID_SOURCE', name, kind: 'pj', ruleset: 'm02', level: 5,
  profession: 'Cartographe', stats, masteries: { navigation: 2 },
  pv: 29, pvMax: 36, mana: 4, manaMax: 6, xp: 400,
  resistanceBonus: defenses, protection: defenses, equipmentGrades: defenses,
  development: { startingStats: { ...stats, agilite: 3 }, abilities: [] },
  lifeSummary: 'CANARI_RECIT', gmNotes: 'CANARI_NOTES',
  inventory: [{ name: 'Boussole', quantity: 2, description: 'CANARI_INVENTAIRE', url: 'https://example.invalid/mj' }],
};

async function preparePreview(page, url) {
  await page.goto(url);
  await page.locator('#campaign-name').fill('Campagne canari du MJ');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  await page.locator('#import-pj').click();
  await page.locator('#pj-import-file').setInputFiles({ name: 'profil-joueur-fictif.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ schema: 'alrick.sheets.v3', sheets: [sheet] })) });
  await page.locator('#pj-import-submit').click();
  await page.locator('#pj-import-dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: `Ouvrir le profil 5d6 de ${name}` }).click();
  await page.getByRole('button', { name: 'Préparer la fiche joueur', exact: true }).click();
  await page.locator('#player-share-title').waitFor();
}

async function waitForWithdrawal(player) {
  await Promise.race([
    player.waitForEvent('close'),
    player.locator('#player-sheet').getByText('La fiche a été retirée par le MJ.', { exact: true }).waitFor(),
  ]);
  if (!player.isClosed()) assert.equal(await player.locator('#player-sheet iframe').count(), 0);
}

test('Fiche joueur indépendante, aperçu fidèle et révocation dans un second onglet', { timeout: 55000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open('fiche-joueur', { viewport: { width: 1440, height: 1000 } });
  await preparePreview(page, fixture.url);
  const fields = page.locator('#player-share-fields');
  assert.equal(await fields.locator('input:checked').count(), 0);
  assert.equal(await page.locator('#open-player-window').isDisabled(), true);
  await fields.getByRole('checkbox', { name: 'Nom', exact: true }).check();
  await fields.getByRole('checkbox', { name: 'Niveau et métier' }).check();
  await fields.getByRole('checkbox', { name: 'Points de vie' }).check();
  await fields.getByRole('checkbox', { name: /Inventaire/ }).check();
  await fields.getByRole('checkbox', { name: 'Nom', exact: true }).uncheck();
  const frame = page.locator('#player-share-preview iframe');
  assert.doesNotMatch(await frame.getAttribute('srcdoc'), /Mira|CANARI/);
  await fields.getByRole('checkbox', { name: 'Nom', exact: true }).check();
  const preview = await frame.getAttribute('srcdoc');
  assert.match(preview, /Mira &lt;svg onload=alert\(1\)&gt;/);
  assert.doesNotMatch(preview, /CANARI|example\.invalid|Campagne canari|Maîtrises|Expérience|>Mana</);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.locator('#player-share-dialog').evaluate(el => el.scrollWidth <= el.clientWidth));
  }
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  const shown = player.locator('#player-sheet iframe');
  await shown.waitFor();
  assert.equal(await shown.getAttribute('srcdoc'), preview);
  assert.equal(await shown.getAttribute('sandbox'), '');
  const display = player.frameLocator('#player-sheet iframe');
  await display.getByRole('heading', { name, exact: true }).waitFor();
  await display.getByText('29 / 36', { exact: true }).waitFor();
  await display.getByText('Boussole', { exact: true }).waitFor();
  assert.equal(await display.locator('svg').count(), 0);
  assert.deepEqual(await player.evaluate(() => {
    function errorOf(read) { try { read(); return null; } catch (error) { return error.name; } }
    return { origin: self.origin, opener: window.opener === null,
      local: errorOf(() => localStorage.length), indexedDB: errorOf(() => indexedDB.open('test-confinement')) };
  }), { origin: 'null', opener: true, local: 'SecurityError', indexedDB: 'SecurityError' });
  await page.locator('#stop-player-window').waitFor();
  await Promise.all([waitForWithdrawal(player), page.locator('#stop-player-window').click()]);
  await page.locator('#stop-player-window').waitFor({ state: 'hidden' });

  await page.getByRole('button', { name: `Ouvrir le profil 5d6 de ${name}` }).click();
  await page.getByRole('button', { name: 'Préparer la fiche joueur', exact: true }).click();
  assert.equal(await fields.locator('input:checked').count(), 0);
  await fields.getByRole('checkbox', { name: 'Caractéristiques' }).check();
  const [secondDisplay] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  await secondDisplay.locator('#player-sheet iframe').waitFor();
  const tab = await context.newPage();
  await tab.goto(fixture.url);
  await tab.getByRole('button', { name: 'Ouvrir Campagne canari du MJ', exact: true }).click();
  await tab.locator('#add-character').click();
  await tab.locator('#character-name').fill('PJ de l’autre onglet');
  await Promise.all([waitForWithdrawal(secondDisplay), tab.locator('#character-form button[type=submit]').click()]);
  await page.locator('#stop-player-window').waitFor({ state: 'hidden' });
});

test('Fenêtre bloquée, affichage sur place et refus d’un aperçu périmé', { timeout: 42000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('fiche-joueur-local', { viewport: { width: 390, height: 844 } });
  await preparePreview(page, fixture.url);
  await page.evaluate(() => { window.open = () => null; });
  const fields = page.locator('#player-share-fields');
  await fields.getByRole('checkbox', { name: 'Mana', exact: true }).check();
  await page.locator('#open-player-window').click();
  await page.locator('#player-share-message').getByText(/bloquée par le navigateur/).waitFor();
  await page.locator('#show-player-here').click();
  await page.locator('#projection-dialog').waitFor();
  const src = await page.locator('#projection iframe').getAttribute('srcdoc');
  assert.match(src, />Mana<.*4 \/ 6/s);
  assert.doesNotMatch(src, /Mira|CANARI|Points de vie/);
  await page.locator('#stop-projection').click();
  assert.equal(await page.locator('#projection iframe').count(), 0);

  await page.getByRole('button', { name: `Ouvrir le profil 5d6 de ${name}` }).click();
  await page.getByRole('button', { name: 'Préparer la fiche joueur', exact: true }).click();
  await fields.getByRole('checkbox', { name: 'Nom', exact: true }).check();
  await page.evaluate(async () => {
    const { openStudioStore } = await import('/store.mjs');
    const db = await openStudioStore();
    try {
      const [campaign] = await db.list();
      await db.execute({ id: campaign.id, expectedRevision: campaign.revision, operationId: 'recette-fiche-perimee',
        type: 'save-character', data: { id: 'autre-pj', name: 'Nouveau PJ', level: 5, notes: '' } });
    } finally { db.close(); }
  });
  await page.locator('#show-player-here').click();
  await page.locator('#player-share-message').getByText(/La campagne a changé/).waitFor();
  assert.equal(await page.locator('#projection iframe').count(), 0);
});
