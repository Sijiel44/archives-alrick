import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { INTERLUDES_KEY } from '../store.mjs';
import { browserFixture } from './browser.mjs';

const original = await readFile(new URL('./fixtures/campagne-pilote-v1.json', import.meta.url));
const [active, other] = JSON.parse(original).payload.campaign.scenes;
const preparation = 'NOTE PRIVÉE · Le relais est surveillé.';
const result = 'RÉSULTAT PRIVÉ · Le groupe a rejoint le relais par le chemin des berges.';
const chronicle = 'Le groupe a repris la route.';

async function selectBackup(page, buffer) {
  await page.locator('#nav-backups').click();
  await page.locator('#backup-file').setInputFiles({ name: 'campagne.json', mimeType: 'application/json', buffer });
}

async function download(page, selector) {
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator(selector).click()]);
  return readFile(await file.path());
}

async function submit(page, dialog) {
  const form = page.locator(dialog);
  await form.locator('button[type=submit]').click();
  await form.waitFor({ state: 'hidden' });
}

test('Les interludes sont préparés, consignés en privé et restaurés avec la campagne', { timeout: 65000 }, async t => {
  const browser = await browserFixture(t);
  const { page } = await browser.open('interludes-mj', { viewport: { width: 390, height: 844 } });
  await page.goto(browser.url);
  await page.locator('#save-status').getByText('Stockage local prêt').waitFor();
  assert.equal(await page.locator('#nav-interludes').isDisabled(), true);
  await selectBackup(page, original);
  await page.locator('#restore-backup').click();
  await page.getByRole('button', { name: 'Préparer les interludes' }).click();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'interludes-title');

  const add = page.locator('#add-interlude');
  await add.click();
  await page.getByLabel('Titre de l’interlude').fill('Passage au relais');
  await page.getByLabel('Type d’activité').selectOption({ label: 'Voyage' });
  await page.getByLabel('Quand se déroule l’interlude ?').selectOption(other.id);
  await page.getByLabel('Notes de préparation').fill(preparation);
  await submit(page, '#interlude-dialog');
  const planned = page.locator('#interludes-planned');
  await planned.getByText(`Voyage · Après la scène « ${other.title} »`).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

  await add.click();
  assert.equal(await page.locator('#interlude-scene').inputValue(), '');
  await page.locator('#interlude-title').fill('Veille au camp');
  await submit(page, '#interlude-dialog');
  await planned.getByRole('button', { name: 'Modifier Veille au camp' }).click();
  await page.getByLabel('Type d’activité').selectOption({ label: 'Repos' });
  await submit(page, '#interlude-dialog');
  await planned.getByText('Repos · Entre deux séances').waitFor();

  await page.locator('#nav-play').click();
  await page.getByRole('button', { name: 'Activités entre les scènes' }).click();
  await planned.getByRole('button', { name: 'Consigner Passage au relais' }).click();
  const saveResult = page.getByRole('button', { name: 'Enregistrer dans le journal' });
  await saveResult.click();
  assert.equal(await page.locator('#interlude-result').evaluate(field => field.validity.valueMissing), true);
  await page.getByLabel('Date de jeu').fill('2026-11-06');
  await page.getByLabel('Résultat et conséquences').fill('Le groupe a rejoint le relais.');
  await submit(page, '#interlude-result-dialog');
  assert.equal(await planned.getByText('Passage au relais').count(), 0);
  await page.locator('#open-interlude-journal').click();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'interlude-journal-title');
  const journal = page.locator('#interlude-journal');
  await journal.getByText('Le groupe a rejoint le relais.', { exact: true }).waitFor();
  await journal.getByRole('button', { name: 'Corriger le résultat de Passage au relais' }).click();
  await page.getByLabel('Résultat et conséquences').fill(result);
  await submit(page, '#interlude-result-dialog');
  await journal.getByText(result, { exact: true }).waitFor();
  await journal.getByText('Notes de préparation', { exact: true }).click();
  await journal.getByText(preparation, { exact: true }).waitFor();

  await page.locator('#add-session').click();
  await page.locator('#session-title').fill('La route des berges');
  await page.locator('#session-chronicle').fill(chronicle);
  await submit(page, '#archive-dialog');
  await page.locator('#approve-chronicle').click();
  assert.equal((await download(page, '#download-chronicle')).toString(), chronicle);

  await page.locator('#nav-backups').click();
  const backup = await download(page, '#export-backup');
  const archive = JSON.parse(backup);
  assert.equal(archive.version, 14);
  assert.equal(archive.payload.campaign.activeSceneId, active.id);
  const [recorded, pending] = archive.payload.campaign[INTERLUDES_KEY];
  assert.equal(recorded.afterSceneId, other.id);
  assert.equal(recorded.preparation, preparation);
  assert.deepEqual(recorded.result, { date: '2026-11-06', notes: result });
  assert.equal(pending.result, null);

  const { page: restored } = await browser.open('interludes-restaures', { viewport: { width: 1280, height: 900 } });
  await restored.goto(browser.url);
  await restored.locator('#save-status').getByText('Stockage local prêt').waitFor();
  await selectBackup(restored, Buffer.from(JSON.stringify({ ...archive, version: 13 })));
  await restored.getByRole('alert').getByText(/version incompatible/).waitFor();
  await selectBackup(restored, backup);
  await restored.locator('#backup-summary').getByText(/2 interlude/).waitFor();
  await restored.locator('#restore-backup').click();
  await restored.locator('#nav-interludes').click();
  await restored.locator('#interludes-planned').getByText('Veille au camp').waitFor();
  restored.once('dialog', dialog => dialog.accept());
  await restored.getByRole('button', { name: 'Supprimer Veille au camp' }).click();
  await restored.locator('#interludes-empty').waitFor();
  await restored.locator('#open-interlude-journal').click();
  await restored.locator('#interlude-journal').getByText(result, { exact: true }).waitFor();
  assert.equal(await restored.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
});
