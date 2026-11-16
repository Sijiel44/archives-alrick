import assert from 'node:assert/strict';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

test('Studio : portraits de Déchéance et copie PNJ sans notes projetées', { timeout: 65000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('personnages-dechus', { viewport: { width: 1280, height: 850 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto(fixture.url);
  try {
    await page.locator('#save-status').getByText('Stockage local prêt').waitFor({ timeout: 5000 });
  } catch {
    throw new Error(`Studio non démarré : ${(await page.locator('#save-status').textContent())?.trim()} ; ${errors.join(' | ')}`);
  }
  await page.locator('#nav-library').click();
  await page.locator('#library-shelves a[href="#rayon/factions"]').click();
  await page.locator('#catalogue-origin').selectOption('archives');
  await page.locator('#catalogue-count').getByText(/^26 fiches(?: · page \d+ sur \d+)?$/).waitFor();
  const cards = page.locator('#catalogue-list article');
  assert.equal(await cards.count() > 6, true);
  const button = page.getByRole('button', { name: 'Voir la fiche de James Veyrel' });
  await button.click();
  const dialog = page.locator('#resource-dialog');
  assert.match(await dialog.locator('#resource-source-link').getAttribute('href'), /\/blob\/main\/content\/personnages\/PER-DECH-04\.md$/);
  assert.equal(await dialog.getByRole('button', { name: 'Créer un PNJ de campagne' }).isDisabled(), true);
  await page.keyboard.press('Escape');
  await page.locator('#catalogue-next').click();
  await page.getByRole('button', { name: 'Voir la fiche de Kareth la Cloche de Verre' }).click();
  assert.match(await dialog.locator('#resource-source-link').getAttribute('href'), /\/blob\/main\/content\/personnages\/PER-DECH-15\.md$/);
  await page.keyboard.press('Escape');
  await page.locator('#nav-home').click();
  await page.locator('#campaign-name').fill('Campagne témoin — Déchéance');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#nav-library').click();
  await page.locator('#library-shelves a[href="#rayon/factions"]').click();
  await button.click();
  await dialog.getByRole('button', { name: 'Créer un PNJ de campagne' }).click();
  assert.equal(await page.locator('#creation-kind').inputValue(), 'npc');
  assert.equal(await page.locator('#creation-name').inputValue(), 'James Veyrel');
  assert.match(await page.locator('#creation-detail-role').inputValue(), /Greffier/);
  await page.locator('#creation-form [name="notes"]').fill('CANARI_NOTE_MJ_PERSONNAGE');
  await page.locator('#creation-form button[type="submit"]').click();
  await page.locator('#creation-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-library').click();
  await page.locator('#library-shelves a[href="#rayon/campagne"]').click();
  await page.locator('#catalogue-list').getByRole('button', { name: 'Voir la fiche de James Veyrel' }).click();
  assert.match(await dialog.locator('#resource-creation-notes-text').textContent(), /CANARI_NOTE_MJ_PERSONNAGE/);
  assert.doesNotMatch(await page.locator('#projection').innerHTML(), /CANARI_NOTE_MJ_PERSONNAGE/);
});
