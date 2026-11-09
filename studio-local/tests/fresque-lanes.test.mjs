import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { FRESQUE_LANE_KEY, FRESQUE_LANES_KEY } from '../store.mjs';
import { browserFixture } from './browser.mjs';

test('Les couloirs filtrent la Fresque et se restaurent avec les liens entre scènes', { timeout: 65000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('couloirs', { viewport: { width: 390, height: 844 } });
  await page.goto(fixture.url);
  await page.locator('#campaign-name').fill('Les chemins du gué');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  for (const title of ['Le gué', 'La tour', 'La halte']) {
    await page.locator('#add-scene').click();
    await page.locator('#scene-title').fill(title);
    await page.locator('#scene-form button[type=submit]').click();
    await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  }
  const tools = page.locator('#fresque-lane-tools');
  await tools.locator('summary').click();
  for (const name of ['Traversée', 'Enquête']) {
    await tools.getByRole('button', { name: 'Créer un couloir' }).click();
    await page.getByLabel('Nom du couloir').fill(name);
    await page.getByRole('button', { name: 'Enregistrer le couloir' }).click();
    await page.locator('#fresque-lane-dialog').waitFor({ state: 'hidden' });
  }
  const cards = page.locator('#scene-list > li');
  const crossing = cards.filter({ has: page.getByRole('heading', { name: 'Le gué', exact: true }) });
  const lane = title => page.getByRole('combobox', { name: 'Couloir de ' + title, exact: true });
  await lane('Le gué').selectOption({ label: 'Traversée' });
  await page.waitForFunction(() => document.querySelector('[aria-label="Couloir de Le gué"]').selectedOptions[0].text === 'Traversée');
  await lane('La tour').selectOption({ label: 'Enquête' });
  await page.waitForFunction(() => document.querySelector('[aria-label="Couloir de La tour"]').selectedOptions[0].text === 'Enquête');

  await page.locator('#scene-link-tools summary').click();
  await page.locator('#scene-link-from').selectOption({ label: 'Le gué' });
  await page.locator('#scene-link-to').selectOption({ label: 'La tour' });
  await page.locator('#scene-link-label').fill('Si la cloche sonne');
  await page.locator('#add-scene-link').click();
  await crossing.getByText('Si la cloche sonne', { exact: true }).waitFor();
  const filter = page.getByLabel('Filtrer par couloir');
  await filter.selectOption({ label: 'Enquête' });
  assert.equal(await cards.filter({ visible: true }).count(), 1);
  await page.locator('#fresque-lane-status').getByText(/Scène courante hors du filtre/).waitFor();
  await page.locator('#fresque-minimap summary').click();
  await page.locator('#fresque-map-branches').getByText('Enquête · Si la cloche sonne').waitFor();
  await page.getByRole('button', { name: 'Rejoindre la carte' }).click();
  assert.equal(await filter.inputValue(), '');
  assert.equal(await crossing.evaluate(el => el === document.activeElement), true);
  assert.equal(await crossing.getAttribute('aria-current'), 'true');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

  await tools.getByRole('button', { name: 'Renommer le couloir Enquête' }).click();
  await page.getByLabel('Nom du couloir').fill('La cloche');
  await page.getByRole('button', { name: 'Enregistrer le couloir' }).click();
  await page.locator('#fresque-lane-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-backups').click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const buffer = await readFile(await download.path());
  const { version, payload: { campaign } } = JSON.parse(buffer);
  assert.equal(version, 13);
  assert.deepEqual(campaign[FRESQUE_LANES_KEY].map(lane => lane.name), ['Traversée', 'La cloche']);
  assert.equal(campaign.scenes[1][FRESQUE_LANE_KEY], campaign[FRESQUE_LANES_KEY][1].id);
  assert.deepEqual(campaign.scenes.map(scene => scene.title), ['Le gué', 'La tour', 'La halte']);

  const { page: restored } = await fixture.open('couloirs-restaures');
  await restored.goto(fixture.url);
  await restored.locator('#save-status').getByText('Stockage local prêt').waitFor();
  await restored.locator('#nav-backups').click();
  await restored.locator('#backup-file').setInputFiles({ name: 'couloirs-v13.json', mimeType: 'application/json', buffer });
  await restored.locator('#restore-backup').click();
  await restored.locator('#prepare-title').waitFor();
  const restoredFilter = restored.getByLabel('Filtrer par couloir');
  await restoredFilter.selectOption({ label: 'La cloche' });
  await restored.locator('#scene-list').getByRole('heading', { name: 'La tour', exact: true }).waitFor();
  await restored.locator('#fresque-lane-tools summary').click();
  restored.once('dialog', dialog => dialog.accept());
  await restored.getByRole('button', { name: 'Supprimer le couloir La cloche' }).click();
  await restored.getByRole('button', { name: 'Supprimer le couloir La cloche' }).waitFor({ state: 'detached' });
  assert.equal(await restoredFilter.inputValue(), '');
  assert.equal(await restored.getByRole('combobox', { name: 'Couloir de La tour' }).inputValue(), '');
  await restored.locator('#scene-list').getByText('Si la cloche sonne', { exact: true }).waitFor();
});
