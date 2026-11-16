import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';
import { seedQuestCampaign, createClue } from './quetes-fixture.mjs';

test('Le MJ prépare plusieurs chemins, consigne et rétablit une décision puis restaure le suivi', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('quete-parcours'); await seedQuestCampaign(page, f.url);
  const card = await createClue(page);
  assert.equal(await card.getByRole('button', { name: 'Le quai', exact: true }).count(), 1);
  assert.equal(await card.getByRole('button', { name: 'Le moulin', exact: true }).count(), 1);
  for (const [state, note] of [['revealed', 'Découvert au moulin'], ['planned', 'Retour décidé par la table']]) {
    await card.getByRole('button', { name: /Consigner une décision pour/ }).click();
    await page.locator('#quest-decision-state').selectOption(state); await page.locator('#quest-decision-note').fill(note);
    await page.locator('#quest-decision-form button[type=submit]').click(); await page.locator('#quest-decision-dialog').waitFor({ state: 'hidden' });
  }
  assert.equal(context.pages().length, 1);
  await card.locator('summary').click(); assert.match(await card.locator('ol').innerText(), /Découvert au moulin/);
  await page.getByRole('button', { name: 'Nouvel objectif', exact: true }).click(); await page.locator('#quest-step-title').fill('Retrouver la cargaison');
  await page.locator('#quest-step-parent').selectOption('creation-quete'); await page.locator('#quest-edit-form button[type=submit]').click(); await page.locator('#quest-edit-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-backups').click(); const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const buffer = await readFile(await download.path()); assert.equal(JSON.parse(buffer).version, 21);
  const { page: restored } = await f.open('quete-restauree'); await restored.goto(f.url); await restored.locator('#save-status').getByText('Stockage local prêt').waitFor();
  await restored.locator('#nav-backups').click(); await restored.locator('#backup-file').setInputFiles({ name: 'quete.json', mimeType: 'application/json', buffer });
  await restored.locator('#backup-summary').getByText(/2 indice\(s\) ou objectif\(s\) suivi/).waitFor();
  await restored.locator('#restore-backup:not(:disabled)').click(); await restored.locator('#nav-quests').click();
  assert.equal(await restored.locator('.quest-card').count(), 2); assert.match(await restored.locator('.quest-card').first().innerText(), /2 décision/);
});

test('Fiches reliées, raccourcis Markdown, Fresque et refus de modification périmée', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('quete-liens'); await seedQuestCampaign(page, f.url); const card = await createClue(page);
  await card.locator('h3 button').click(); await page.locator('#resource-dialog').waitFor();
  const shortcut = await page.locator('#resource-shortcut').inputValue(); assert.match(shortcut, /^\[\[quest-step-/);
  await page.locator('#resource-creation-notes summary').click();
  await page.locator('#resource-creation-notes-text').getByRole('link', { name: 'Interroger la batelière', exact: true }).click();
  await page.locator('#resource-title').getByText('La batelière', { exact: true }).waitFor();
  await page.locator('#resource-usages-list').getByRole('button', { name: /Une corde bleue/ }).click();
  await page.locator('#resource-title').getByText('CANARI_TITRE · Une corde bleue', { exact: true }).waitFor();
  await page.locator('#resource-usages-list').getByRole('button', { name: /Le moulin/ }).click();
  await page.locator('#nav-prepare[aria-current="page"]').waitFor();
  await page.getByRole('button', { name: 'Suivi de Le moulin', exact: true }).click(); assert.equal(await page.locator('#quests-scene').inputValue(), 'scene-moulin');
  await page.getByRole('button', { name: /Modifier le suivi CANARI_TITRE/ }).click(); await page.locator('#quest-step-title').fill('Saisie à conserver');
  await page.evaluate(async () => { const { openStudioStore } = await import('./store.mjs'); const s = await openStudioStore(); try { const c = (await s.list())[0]; await s.execute({ id: c.id, expectedRevision: c.revision, operationId: crypto.randomUUID(), type: 'save-scene', data: { ...c.scenes[0], title: 'Quai renommé' } }); } finally { s.close(); } });
  await page.locator('#quest-edit-form button[type=submit]').click(); await page.locator('#quest-edit-form .form-error').waitFor();
  assert.equal(await page.locator('#quest-step-title').inputValue(), 'Saisie à conserver');
  await page.getByRole('dialog').getByRole('button', { name: 'Fermer', exact: true }).click(); await page.reload();
  await page.getByRole('button', { name: 'Ouvrir Les lanternes disparues', exact: true }).click(); await page.locator('#nav-quests').click();
  assert.match(await page.locator('.quest-card').innerText(), /Quai renommé/); assert.doesNotMatch(await page.locator('.quest-card').innerText(), /Saisie à conserver/);
});

test('La projection ne reçoit que le texte choisi, sans titre, notes, liens ni décisions privées', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page, context } = await f.open('quete-partage'); await seedQuestCampaign(page, f.url); const card = await createClue(page);
  await card.getByRole('button', { name: 'Préparer pour les joueurs', exact: true }).click();
  assert.equal(await page.locator('#open-player-window').isDisabled(), true);
  await page.locator('#scene-share-fields').getByRole('checkbox', { name: 'Texte destiné aux joueurs', exact: true }).check();
  const [popup] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  const receiver = popup, frame = receiver.locator('#player-sheet iframe'); await frame.waitFor();
  const html = await frame.getAttribute('srcdoc'); assert.match(html, /Une corde bleue est prise/); assert.doesNotMatch(html, /CANARI|creation-temoin|lanternes|Découvert/);
  assert.equal(await receiver.locator('body').evaluate(() => self.origin), 'null');
  await page.locator('#stop-player-window').click();
  await card.getByRole('button', { name: 'Préparer pour les joueurs', exact: true }).click();
  await page.locator('#scene-share-fields').getByRole('checkbox', { name: 'Texte destiné aux joueurs', exact: true }).check();
  await page.evaluate(async () => {
    const { openStudioStore } = await import('./store.mjs'); const s = await openStudioStore();
    try { const c = (await s.list())[0]; await s.execute({ id: c.id, expectedRevision: c.revision, operationId: crypto.randomUUID(), type: 'save-scene', data: { ...c.scenes[0], title: 'Autre révision' } }); }
    finally { s.close(); }
  });
  await page.locator('#show-player-here').click();
  await page.locator('#player-share-message').getByText(/La campagne a changé/).waitFor();
  assert.equal(await page.locator('#projection-dialog').isVisible(), false);
});

test('Les filtres et formulaires restent utilisables au clavier et de 320 à 1440 pixels', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('quete-mobile'); await seedQuestCampaign(page, f.url); await createClue(page);
  await page.locator('#quests-search').fill('introuvable'); assert.match(await page.locator('#quests-board').innerText(), /Aucun résultat/); await page.locator('#quests-search').fill('');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (process.env.STUDIO_SCREENSHOT_DIR && [390, 1440].includes(width)) { await mkdir(process.env.STUDIO_SCREENSHOT_DIR, { recursive: true }); await page.screenshot({ path: join(process.env.STUDIO_SCREENSHOT_DIR, `quetes-${width}.png`), fullPage: true }); }
    await page.getByRole('button', { name: 'Nouvel objectif', exact: true }).focus(); await page.keyboard.press('Enter'); await page.locator('#quest-edit-dialog').waitFor();
    assert.equal(await page.evaluate(() => document.querySelector('#quest-edit-dialog').scrollWidth <= innerWidth), true);
    await page.keyboard.press('Escape'); await page.locator('#quest-edit-dialog').waitFor({ state: 'hidden' });
  }
});
