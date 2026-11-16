import assert from 'node:assert/strict';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

test('Studio : sept institutions civiles canoniques, emblèmes et copie modifiable sans secret MJ', { timeout: 65000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('organisations-archives', { viewport: { width: 1280, height: 850 } });
  const scriptErrors = [];
  page.on('pageerror', error => scriptErrors.push(`JS: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') scriptErrors.push(`console: ${message.text()}`); });
  await page.goto(fixture.url);
  try {
    await page.locator('#save-status').getByText('Stockage local prêt').waitFor({ timeout: 5000 });
  } catch {
    throw new Error(`Échec d'initialisation Studio : ${(await page.locator('#save-status').textContent())?.trim()} ; ${scriptErrors.join(' | ').slice(0, 2000)}`);
  }
  await page.locator('#nav-library').click();
  await page.locator('#library-shelves a[href="#rayon/factions"]').click();
  await page.locator('#catalogue-origin').selectOption('archives');
  // The factions shelf also contains the Déchéance NPC portraits. Restrict this
  // historical regression test to organisations rather than the whole shelf.
  await page.locator('#catalogue-group').selectOption('Institutions et contre-pouvoirs');
  await page.locator('#catalogue-count').getByText('7 fiches', { exact: true }).waitFor();
  const cards = page.locator('#catalogue-list article');
  assert.equal(await cards.count(), 7);
  assert.equal(await cards.locator('img').count(), 7);
  assert.equal(await cards.locator('img').first().evaluate(img => img.decode().then(() => img.naturalWidth > 0)), true);

  await cards.getByRole('button', { name: 'Voir la fiche de Maisons du Seuil Ouvert' }).click();
  const dialog = page.locator('#resource-dialog');
  assert.equal(await dialog.getByText('Lore validé', { exact: true }).count(), 1);
  assert.match(await dialog.locator('#resource-source-link').getAttribute('href'), /\/blob\/main\/content\/groupes\/ORG-DECH-01\.md$/);
  assert.equal(await dialog.getByRole('button', { name: 'Créer une faction de campagne' }).isDisabled(), true);
  await page.keyboard.press('Escape');

  await page.locator('#nav-home').click();
  await page.locator('#campaign-name').fill('Campagne fictive — organisations');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#view-prepare').waitFor({ state: 'visible' });
  await page.locator('#nav-library').click();
  await page.locator('#library-shelves a[href="#rayon/factions"]').click();
  await cards.getByRole('button', { name: 'Voir la fiche de Maisons du Seuil Ouvert' }).click();
  await dialog.getByRole('button', { name: 'Créer une faction de campagne' }).click();
  await page.locator('#creation-dialog').waitFor();
  assert.equal(await page.locator('#creation-kind').inputValue(), 'faction');
  assert.equal(await page.locator('#creation-name').inputValue(), 'Maisons du Seuil Ouvert');
  assert.match(await page.locator('#creation-detail-purpose').inputValue(), /Secours et accueil/);
  assert.match(await page.locator('#creation-detail-members').inputValue(), /Soignants/);
  const secret = 'CANARI_CONFIDENTIEL_ORG';
  await page.locator('#creation-form [name="notes"]').fill(secret);
  await page.locator('#creation-form button[type="submit"]').click();
  await page.locator('#creation-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-library').click();
  await page.locator('#library-shelves a[href="#rayon/campagne"]').click();
  await page.locator('#catalogue-list').getByRole('button', { name: /Voir la fiche de Maisons du Seuil Ouvert/ }).click();
  assert.match(await dialog.locator('#resource-creation-notes-text').textContent(), /CANARI_CONFIDENTIEL_ORG/);
  await page.locator('#resource-actions').getByRole('button', { name: 'Modifier la création' }).waitFor();
  assert.doesNotMatch(await page.locator('#projection').innerHTML(), /CANARI_CONFIDENTIEL_ORG/);
});
